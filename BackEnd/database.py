from motor.motor_asyncio import AsyncIOMotorClient
from config import MONGODB_URI, MONGODB_ATLAS_URI, MONGO_DB_NAME

mongo_client: AsyncIOMotorClient | None = None
database = None


async def connect_to_mongo():
    """Initialise a MongoDB connection and cache the database handle."""
    global mongo_client, database

    if database is not None:
        return database

    uri = MONGODB_URI or MONGODB_ATLAS_URI
    if not uri:
        raise RuntimeError("MongoDB connection string is not configured.")

    mongo_client = AsyncIOMotorClient(uri)
    database = mongo_client[MONGO_DB_NAME]
    return database


def get_database():
    """Return the cached database handle. connect_to_mongo must run first."""
    if database is None:
        raise RuntimeError("MongoDB connection has not been initialised yet.")
    return database


async def close_mongo_connection():
    """Close the MongoDB client when shutting down the application."""
    global mongo_client, database

    if mongo_client is not None:
        mongo_client.close()

    mongo_client = None
    database = None
