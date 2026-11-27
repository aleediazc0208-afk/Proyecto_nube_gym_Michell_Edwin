import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()
client = AsyncIOMotorClient(os.getenv("MONGODB_URL"))
db = client[os.getenv("DATABASE_NAME", "adso_db")]
coleccion = db["membresias"]


print("HOST:", (os.getenv("MONGODB_URL") or "NO DEFINIDA").split("@")[-1])
print("BASE DE DATOS:", db.name)