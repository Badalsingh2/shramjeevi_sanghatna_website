import os
from sqlalchemy import create_engine
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("Error: DATABASE_URL not found in .env!")
    exit(1)

engine = create_engine(DATABASE_URL)

try:
    with engine.begin() as conn:  # .begin() automatically commits at the end
        try:
            conn.execute(text("ALTER TABLE districts ADD COLUMN name_mr VARCHAR;"))
            print("Successfully added name_mr to districts table.")
        except Exception as e:
            print(f"Error adding name_mr to districts (might already exist): {e}")
            
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN name_mr VARCHAR;"))
            print("Successfully added name_mr to users table.")
        except Exception as e:
            print(f"Error adding name_mr to users (might already exist): {e}")

except Exception as e:
    print(f"Database connection error: {e}")
