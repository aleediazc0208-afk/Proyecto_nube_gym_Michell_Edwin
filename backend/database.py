import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL")
DATABASE_NAME = os.getenv("DATABASE_NAME", "adso_db")

if not MONGODB_URL:
    raise RuntimeError("MONGODB_URL no está definida")

client = AsyncIOMotorClient(MONGODB_URL)
db = client[DATABASE_NAME]
coleccion = db["membresias"]



print("HOST:", (os.getenv("MONGODB_URL") or "NO DEFINIDA").split("@")[-1])
print("BASE DE DATOS:", db.name)
