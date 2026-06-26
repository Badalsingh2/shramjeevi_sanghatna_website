# Shramjeevi Sanghatna Website

This is a working starter website with:
- Login page matching the red/white sample UI
- Worker daily work report submission
- Image upload proof
- CEO/Admin dashboard
- District-wise comparison
- Drill-down worker performance table
- Marathi/English login toggle

## Run Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend runs on: http://localhost:8000

## Run Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: http://localhost:5173

## Demo Login

Admin/CEO:
```text
9999999999
123456
```

Worker:
```text
8329405166
123456
```

## Next recommended additions

- Add worker registration page
- Add district head role
- Export reports to PDF/Excel
- Add date filters
- Add Cloudinary/S3 for production image storage
- Replace demo plain password with hashed password
