import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import IntegrityError
from dotenv import load_dotenv
from app.main import District, User, Base, Report

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("Error: DATABASE_URL not found in .env!")
    exit(1)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

# Data parsed from your PDF
grouped_data = {
    "State Office Bearers": [
        ("Sita Ghatal", "9607777816", "activist"),
        ("Dattatreya Kolekar", "9860666039", "activist"),
        ("Laxman Savar", "9049630955", "activist"),
        ("Balaram Bhoir", "9922274225", "activist"),
        ("Vijay Jadhav", "9356491090", "admin"),
        ("Sunil Jadhav", "9607777816_2", "activist")  # Adjusted slightly to avoid crash, as phone 9607777816 was duplicated above
    ],
    "Palghar District": [
        ("Suresh Rengad", "9923189398", "activist"),
        ("Ramchandra Roj", "9158487999", "activist"),
        ("Vasant Pawar", "7875453188", "activist"),
        ("Laxman Padwale", "9834709581", "activist"),
        ("Ankush Wad", "8554075008", "activist"),
        ("Ganesh Umbarsada", "9158764488", "activist"),
        ("Kailas Tumbda", "9834980962", "activist"),
        ("Rekha Parhad", "9359973121", "activist"),
        ("Damyanti Nimbare", "8390791914", "activist"),
        ("Naresh Vartha", "9673860008", "activist"),
        ("Shankar Varkhande", "8698718565", "activist"),
        ("Pramila Pawar", "8007659305", "activist"),
        ("Manoj Kavli", "7499546767", "activist"),
        ("Pintu Niskate", "9545386077", "activist"),
        ("Renuka Pagi", "8010637243", "activist"),
        ("Ajit Gaikwad", "9158061814", "activist"),
        ("Santosh Dhinda", "9923349209", "activist"),
        ("Govind Gavit", "8390836906", "activist"),
        ("Ramdas Dangte", "8007748185", "activist"),
        ("Kamalakar Bhore", "9699082774", "activist"),
        ("Rupali Chibde", "7666482398", "activist"),
        ("Bharat Jadhav", "9860660328", "activist"),
        ("Suraj Dalvi", "8446309937", "activist"),
        ("Devendra Wagh", "9226246891", "activist"),
        ("Nilesh Wagh", "8390174442", "activist"),
        ("Prakash Vange", "8329840718", "activist"),
        ("Nitin Patil", "9923264232", "activist"),
        ("Subhash Aalwe", "7083847345", "activist"),
        ("Usha Kanera", "9823887426", "activist"),
        ("Laxmi Wagh", "8983863332", "activist"),
        ("Jayanti Pared", "9225363240", "activist"),
        ("Manisha Kadangla", "9637176651", "activist"),
        ("Mangesh Kale", "9096388130", "activist"),
        ("Prakash Pingale", "9970199742", "activist"),
        ("Gita Lohar", "8080345258", "activist"),
        ("Magan Kom", "8261923138", "activist"),
        ("Vidya Girane", "7666098356", "activist"),
        ("Avinash Kini", "9970863057", "activist"),
        ("Asha Tumbda", "9764875485", "activist"),
        ("Sonu Mukne", "7888155623", "activist"),
        ("Nirmala Chaudhary", "9158253616", "activist"),
        ("Harichandra Umbarkar", "9673179981", "activist"),
        ("Mukund Karmoda", "7218835531", "activist"),
        ("Jitu Patil", "9273367426", "activist"),
        ("Balu Jhirwa", "9209972058", "activist"),
        ("Wasim Patel", "9967462513", "activist"),
        ("Manisha Poudkar", "9967462513_2", "activist"), # Modified due to exact duplicate with Wasim
        ("Nagesh Dumada", "9220470980", "activist"),
        ("Nandini Panera", "9082404083", "activist")
    ],
    "Thane District": [
        ("Ashok Sapte", "9822296034", "activist"),
        ("Sagar Desak", "9730424923", "activist"),
        ("Rajendra Mhaskar", "9545328428", "activist"),
        ("Mukesh Bhangre", "7798440739", "activist"),
        ("Ishwar Bansode", "9689563675", "activist"),
        ("Jayendra Gavit", "8237120980", "activist"),
        ("Laxman Chaudhary", "9021245382", "activist"),
        ("Balu Waghe", "7039795234", "activist"),
        ("Santosh Gavit", "8779056123", "activist"),
        ("Rajesh Channe", "9004813492", "activist"),
        ("Dashrath Bhalke", "7066703250", "activist"),
        ("Jaya Pardhi", "8149381467", "activist"),
         ("Vishwanath Pasari", "7030595002", "activist"),
        ("Jayesh Patil", "9175700333", "activist"),
        ("Jayvant Bhavar", "9850500821", "activist"),
        ("Maruti Bhangre", "8208383518", "activist"),
        ("Chandrakant Rayat", "9604336510", "activist"),
        ("Rohini Pawar", "9322604723", "activist"),
        ("Swati Shinde", "9503762659", "activist"),
        ("Pradip Chaudhary", "9673670138", "activist"),
        ("Tanaji Lahange", "9075095318", "activist"),
        ("Gurunath Jadhav", "7219142329", "activist"),
        ("Yogesh Katela", "7498378893", "activist"),
        ("Kavita Kadam", "7350812203", "activist"),
        ("Vaibhav Hindola", "7030194063", "activist"),
        ("Dilip Shid", "7820991862", "activist"),
        ("Chintaman Jadhav", "9307392823", "activist"),
        ("Shevanti Waghe", "9209916224", "activist"),
        ("Maruti Waghe", "8552084167", "activist"),
        ("Gotiram Waghe", "7057011657", "activist"),
        ("Suvarna Kot", "9321846121", "activist"),
        ("Sitabai Mukne", "9136439924", "activist"),
        ("Anita Vayde", "9619537956", "activist"),
        ("Atmaram Waghe", "9221521488", "activist"),
        ("Nanda Waghe", "7304316504", "activist"),
        ("Vaishali Tople", "9693421098", "activist"),
        ("Asha Khatole", "7219443575", "activist"),
        ("Sunita Farle", "7710923799", "activist"),
        ("Kalyani Katkari", "9136244394", "activist"),
        ("Malu Humne", "8956020834", "activist"),
        ("Prakash Khodka", "7066006692", "activist"),
        ("Darshana Adgile", "8830824144", "activist"),
        ("Pappu Wagh", "9922579160", "activist"),
        ("Rupesh Adhire", "9271826369", "activist"),
        ("Kailas Mukne", "8355935513", "activist")
    ],
  
    "Invite / Committee Members": [
        ("Vivek Bhau Pandit", "8237047003", "admin"),
        ("Suhas Mukne", "7507516600", "admin")
       
    ]
}

def seed_database():
    db = SessionLocal()
    print("Removing previous entries...")
    db.query(Report).delete()
    db.query(User).delete()
    db.query(District).delete()
    db.commit()
    print("Cleaned database!")
    
    total_users_added = 0
    total_districts_added = 0
    
    for district_name, members in grouped_data.items():
        # Check if district exists or create it
        district = db.query(District).filter(District.name == district_name).first()
        if not district:
            district = District(name=district_name)
            db.add(district)
            db.commit()
            db.refresh(district)
            total_districts_added += 1
            
        print(f"Adding users for {district_name}...")
        for member in members:
            name, phone, role = member
            
            # Check if phone number already exists
            existing_user = db.query(User).filter(User.phone == phone).first()
            if not existing_user:
                new_user = User(
                    name=name,
                    phone=phone,
                    password="123456",  # Default password for everyone
                    role=role,
                    district_id=district.id
                )
                db.add(new_user)
                try:
                    db.commit()
                    total_users_added += 1
                except IntegrityError:
                    db.rollback()
                    print(f"Skipped duplicate phone: {phone} for {name}")
            else:
                if existing_user.district_id != district.id:
                    existing_user.district_id = district.id
                    db.commit()
                    print(f"Updated district for {name}.")
                else:
                    print(f"User with phone {phone} already correct, skipping.")
                
    db.close()
    print(f"\n✅ Finished! Added {total_districts_added} new districts and {total_users_added} new individuals.")

if __name__ == "__main__":
    seed_database()
