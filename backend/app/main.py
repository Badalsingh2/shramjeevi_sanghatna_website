from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, Date, Text, ForeignKey, Boolean, inspect, text
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from datetime import date
from typing import List, Optional
import os, uuid, json


from dotenv import load_dotenv
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./shramjeevi.db")
connect_args = {"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")

supabase = None
if supabase_url and supabase_key:
    from supabase import create_client
    supabase = create_client(supabase_url, supabase_key)

app = FastAPI(title="Shramjeevi Sanghatna Reporting API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for production/easier dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

def store_upload(upload: UploadFile, filename: str) -> str:
    """
    Upload a file to Supabase Storage and return its public URL.
    Reads entirely into memory — no local disk writes.
    Raises HTTPException(500) if Supabase is not configured or upload fails.
    """
    if not supabase:
        raise HTTPException(
            status_code=500,
            detail="Image storage not configured. Set SUPABASE_URL and SUPABASE_KEY env vars."
        )

    # Read file bytes into memory
    file_bytes = upload.file.read()
    content_type = upload.content_type or "image/jpeg"

    try:
        supabase.storage.from_("reports").upload(
            file=file_bytes,
            path=filename,
            file_options={
                "content-type": content_type,
                "upsert": "true",
            }
        )
    except Exception as exc:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Supabase upload failed: {exc}"
        )

    # Build public URL (supabase-py v2 returns a plain string)
    public_url = supabase.storage.from_("reports").get_public_url(filename)
    if isinstance(public_url, dict):
        public_url = public_url.get("publicUrl") or public_url.get("publicURL") or ""
    public_url = str(public_url).strip()

    # supabase-py sometimes appends a bare "?" — strip it so the URL is clean
    public_url = public_url.rstrip("?").rstrip("&")

    if not public_url or not public_url.startswith("http"):
        raise HTTPException(
            status_code=500,
            detail=f"Could not get public URL for {filename}. Is the 'reports' bucket set to Public in Supabase?"
        )

    print(f"[UPLOAD] OK → {public_url}")
    return public_url



class District(Base):
    __tablename__ = "districts"
    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True)
    name_mr = Column(String, nullable=True)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    name = Column(String)
    name_mr = Column(String, nullable=True)
    phone = Column(String, unique=True)
    password = Column(String)
    role = Column(String)
    district_id = Column(Integer, ForeignKey("districts.id"))
    district = relationship("District")

class Report(Base):
    __tablename__ = "reports"
    id = Column(Integer, primary_key=True)
    worker_id = Column(Integer, ForeignKey("users.id"))
    district_id = Column(Integer, ForeignKey("districts.id"))
    date = Column(Date)
    category = Column(String)
    location = Column(String)
    description = Column(Text)
    people_reached = Column(Integer, default=0)
    image_urls = Column(Text, nullable=True)
    worker = relationship("User")
    district = relationship("District")

class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True)
    admin_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String)
    title_mr = Column(String, nullable=True)
    date = Column(Date)
    location = Column(String)
    location_mr = Column(String, nullable=True)
    description = Column(Text)
    description_mr = Column(Text, nullable=True)
    image_url = Column(Text, nullable=True)
    is_latest = Column(Boolean, default=True)
    is_outdated = Column(Boolean, default=False)
    admin = relationship("User")

Base.metadata.create_all(bind=engine)

def ensure_event_columns():
    inspector = inspect(engine)
    existing = {column["name"] for column in inspector.get_columns("events")}
    true_default = "TRUE" if engine.dialect.name == "postgresql" else "1"
    false_default = "FALSE" if engine.dialect.name == "postgresql" else "0"
    columns = {
        "title_mr": "VARCHAR",
        "location_mr": "VARCHAR",
        "description_mr": "TEXT",
        "is_latest": f"BOOLEAN DEFAULT {true_default}",
        "is_outdated": f"BOOLEAN DEFAULT {false_default}",
    }

    with engine.begin() as conn:
        for column_name, definition in columns.items():
            if column_name not in existing:
                conn.execute(text(f"ALTER TABLE events ADD COLUMN {column_name} {definition}"))

ensure_event_columns()

# ── Supabase startup check ──────────────────────────────────────────────────
if supabase:
    try:
        buckets = supabase.storage.list_buckets()
        bucket_names = [b.name for b in buckets]
        print(f"[STARTUP] Supabase connected. Buckets available: {bucket_names}")
        if "reports" not in bucket_names:
            print("[STARTUP] WARNING: 'reports' bucket NOT FOUND in Supabase Storage!")
        else:
            print("[STARTUP] 'reports' bucket found OK.")
    except Exception as e:
        print(f"[STARTUP] Supabase storage check failed: {e}")
else:
    print("[STARTUP] Supabase NOT configured – images will be stored locally (will break on Render).")


class LoginRequest(BaseModel):
    phone: str
    password: str

class ChangePasswordRequest(BaseModel):
    user_id: int
    old_password: str
    new_password: str

class EventStatusRequest(BaseModel):
    admin_id: int
    is_latest: Optional[bool] = None
    is_outdated: Optional[bool] = None

@app.post("/login")
def login(data: LoginRequest):
    db = SessionLocal()
    user = db.query(User).filter(User.phone == data.phone, User.password == data.password).first()
    if not user:
        db.close()
        raise HTTPException(status_code=401, detail="Invalid credentials")
    result = {
        "id": user.id,
        "name": user.name,
        "name_mr": user.name_mr,
        "phone": user.phone,
        "role": user.role,
        "district_id": user.district_id,
        "district_name": user.district.name if user.district else None,
        "district_name_mr": user.district.name_mr if user.district else None
    }
    db.close()
    return result

@app.post("/change-password")
def change_password(data: ChangePasswordRequest):
    db = SessionLocal()
    user = db.query(User).filter(User.id == data.user_id).first()
    if not user:
        db.close()
        raise HTTPException(status_code=404, detail="User not found")
    if user.password != data.old_password:
        db.close()
        raise HTTPException(status_code=401, detail="Incorrect current password")
    user.password = data.new_password
    db.commit()
    db.close()
    return {"message": "Password changed successfully"}

@app.post("/reports")
def create_report(
    worker_id: int = Form(...),
    date: date = Form(...),
    category: str = Form(...),
    location: str = Form(...),
    description: str = Form(...),
    people_reached: int = Form(0),
    images: List[UploadFile] = File(None)
):
    db = SessionLocal()
    worker = db.query(User).filter(User.id == worker_id, User.role == "activist").first()
    if not worker:
        db.close()
        raise HTTPException(status_code=404, detail="Worker not found")

    image_urls_list = []
    if images and len(images) > 0 and images[0].filename != "":
        for image in images:
            ext = os.path.splitext(image.filename)[1] or ".jpg"
            filename = f"{uuid.uuid4()}{ext}"
            image_urls_list.append(store_upload(image, filename))

    report = Report(
        worker_id=worker.id,
        district_id=worker.district_id,
        date=date,
        category=category,
        location=location,
        description=description,
        people_reached=people_reached,
        image_urls=json.dumps(image_urls_list) if image_urls_list else None
    )
    db.add(report)
    db.commit()
    db.close()
    return {"message": "Report submitted"}

@app.post("/events")
def create_event(
    admin_id: int = Form(...),
    title: str = Form(...),
    title_mr: str = Form(""),
    date: date = Form(...),
    location: str = Form(...),
    location_mr: str = Form(""),
    description: str = Form(...),
    description_mr: str = Form(""),
    is_latest: bool = Form(True),
    is_outdated: bool = Form(False),
    image: UploadFile = File(None)
):
    db = SessionLocal()
    admin = db.query(User).filter(User.id == admin_id, User.role == "admin").first()
    if not admin:
        db.close()
        raise HTTPException(status_code=403, detail="Only admins can add events")

    image_url = None
    if image and image.filename:
        ext = os.path.splitext(image.filename)[1] or ".jpg"
        filename = f"event-{uuid.uuid4()}{ext}"
        image_url = store_upload(image, filename)

    event = Event(
        admin_id=admin.id,
        title=title,
        title_mr=title_mr or None,
        date=date,
        location=location,
        location_mr=location_mr or None,
        description=description,
        description_mr=description_mr or None,
        image_url=image_url,
        is_latest=is_latest,
        is_outdated=is_outdated
    )
    db.add(event)
    db.commit()
    db.close()
    return {"message": "Event added"}

@app.get("/events")
def get_events():
    db = SessionLocal()
    events = (
        db.query(Event)
        .filter(Event.is_latest == True, Event.is_outdated == False)
        .order_by(Event.date.desc(), Event.id.desc())
        .all()
    )
    result = [serialize_event(event) for event in events]
    db.close()
    return result

@app.get("/events/admin")
def get_admin_events():
    db = SessionLocal()
    events = db.query(Event).order_by(Event.date.desc(), Event.id.desc()).all()
    result = [serialize_event(event) for event in events]
    db.close()
    return result

@app.put("/events/{event_id}/image")
def update_event_image(
    event_id: int,
    admin_id: int = Form(...),
    image: UploadFile = File(...)
):
    """Re-upload or replace the image for an existing event (fixes broken local /uploads/ paths)."""
    db = SessionLocal()
    admin = db.query(User).filter(User.id == admin_id, User.role == "admin").first()
    if not admin:
        db.close()
        raise HTTPException(status_code=403, detail="Only admins can update events")

    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        db.close()
        raise HTTPException(status_code=404, detail="Event not found")

    ext = os.path.splitext(image.filename)[1] or ".jpg"
    filename = f"event-{uuid.uuid4()}{ext}"
    image_url = store_upload(image, filename)

    event.image_url = image_url
    db.commit()
    result = serialize_event(event)
    db.close()
    return result

@app.patch("/events/{event_id}")
def update_event_status(event_id: int, data: EventStatusRequest):
    db = SessionLocal()
    admin = db.query(User).filter(User.id == data.admin_id, User.role == "admin").first()
    if not admin:
        db.close()
        raise HTTPException(status_code=403, detail="Only admins can update events")

    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        db.close()
        raise HTTPException(status_code=404, detail="Event not found")

    if data.is_latest is not None:
        event.is_latest = data.is_latest
    if data.is_outdated is not None:
        event.is_outdated = data.is_outdated

    db.commit()
    result = serialize_event(event)
    db.close()
    return result

def serialize_event(event: Event):
    return {
        "id": event.id,
        "title": event.title,
        "title_mr": event.title_mr,
        "date": str(event.date),
        "location": event.location,
        "location_mr": event.location_mr,
        "description": event.description,
        "description_mr": event.description_mr,
        "image_url": event.image_url,
        "is_latest": event.is_latest,
        "is_outdated": event.is_outdated,
        "admin_name": event.admin.name if event.admin else None
    }

def score(reports, people, images):
    raw = min(100, reports * 12 + min(people / 10, 35) + images * 8)
    return round(raw)

@app.get("/districts")
def get_districts():
    db = SessionLocal()
    districts = db.query(District).all()
    res = []
    for d in districts:
        workers = db.query(User).filter(User.district_id == d.id, User.role == "activist").all()
        res.append({
            "id": d.id,
            "name": d.name,
            "name_mr": d.name_mr,
            "workers": [{"id": w.id, "name": w.name, "name_mr": w.name_mr, "phone": w.phone} for w in workers]
        })
    db.close()
    return res

@app.get("/workers/{worker_id}")
def get_worker(worker_id: int):
    db = SessionLocal()
    user = db.query(User).filter(User.id == worker_id).first()
    if not user:
        db.close()
        raise HTTPException(status_code=404, detail="Worker not found")
    
    reports = db.query(Report).filter(Report.worker_id == worker_id).all()
    total_people = sum(r.people_reached or 0 for r in reports)
    
    res = {
        "id": user.id,
        "name": user.name,
        "name_mr": user.name_mr,
        "phone": user.phone,
        "district_name": user.district.name if user.district else None,
        "district_name_mr": user.district.name_mr if user.district else None,
        "total_reports": len(reports),
        "total_people_reached": total_people,
        "reports": [{
            "id": r.id,
            "date": str(r.date),
            "category": r.category,
            "location": r.location,
            "description": r.description,
            "people_reached": r.people_reached,
            "images": json.loads(r.image_urls) if r.image_urls else []
        } for r in reports]
    }
    db.close()
    return res

@app.get("/dashboard")
def dashboard():
    db = SessionLocal()
    districts = db.query(District).all()
    users = db.query(User).all()
    reports = db.query(Report).all()

    district_data = []
    for d in districts:
        activists = [u for u in users if u.role == "activist" and u.district_id == d.id]
        d_reports = [r for r in reports if r.district_id == d.id]
        
        worker_rows = []
        for w in activists:
            w_reports = [r for r in reports if r.worker_id == w.id]
            people = sum(r.people_reached or 0 for r in w_reports)
            images = sum(len(json.loads(r.image_urls)) if r.image_urls else 0 for r in w_reports)
            worker_rows.append({
                "id": w.id,
                "name": w.name,
                "name_mr": w.name_mr,
                "reports": len(w_reports),
                "people_reached": people,
                "images": images,
                "score": score(len(w_reports), people, images)
            })
            
        # Category breakdown for district
        cat_counts = {}
        for r in d_reports:
            cat_counts[r.category] = cat_counts.get(r.category, 0) + 1
        category_data = [{"name": cat, "value": count} for cat, count in cat_counts.items()]
        
        people = sum(r.people_reached or 0 for r in d_reports)
        images = sum(len(json.loads(r.image_urls)) if r.image_urls else 0 for r in d_reports)
        district_data.append({
            "id": d.id,
            "name": d.name,
            "name_mr": d.name_mr,
            "reports": len(d_reports),
            "people_reached": people,
            "images": images,
            "score": score(len(d_reports), people, images),
            "workers": worker_rows,
            "category_data": category_data
        })

    recent = sorted(reports, key=lambda r: r.id, reverse=True)[:20]
    result = {
        "summary": {
            "total_reports": len(reports),
            "total_workers": len([u for u in users if u.role == "activist"]),
            "total_districts": len(districts),
            "people_reached": sum(r.people_reached or 0 for r in reports)
        },
        "districts": district_data,
        "recent_reports": [
            {
                "id": r.id,
                "date": str(r.date),
                "worker_name": r.worker.name,
                "district_name": r.district.name,
                "category": r.category,
                "images": json.loads(r.image_urls) if r.image_urls else []
            } for r in recent
        ]
    }
    db.close()
    return result
