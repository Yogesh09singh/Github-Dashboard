"""MongoDB database connection and utilities."""
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ServerSelectionTimeoutError
import logging
from urllib.parse import urlsplit, urlunsplit

from app.config import get_settings


class MongoDBManager:
    """Manage MongoDB connections and operations."""

    def __init__(self):
        self.client = None
        self.db = None

    async def connect_db(self):
        """Create database connection."""
        settings = get_settings()
        # Allow full Atlas URI via MONGODB_URL, or construct one from
        # MONGODB_USER / MONGODB_PASSWORD + base URL if credentials are provided separately.
        uri = settings.mongodb_url
        if settings.mongodb_user and settings.mongodb_password:
            # If the URI doesn't already include credentials, insert them.
            if "@" not in uri.split("//", 1)[-1]:
                prefix, rest = uri.split("//", 1)
                uri = f"{prefix}//{settings.mongodb_user}:{settings.mongodb_password}@{rest}"

        self.client = AsyncIOMotorClient(uri)
        self.db = self.client[settings.database_name]
        # Verify connection; allow graceful failure in dev if DB not reachable.
        try:
            await self.db.command("ping")
            print("✓ Connected to MongoDB")
        except ServerSelectionTimeoutError as exc:
            # Mask credentials when logging URI to avoid leaking secrets
            try:
                parts = urlsplit(uri)
                if parts.username or parts.password:
                    netloc = parts.hostname or ""
                    if parts.port:
                        netloc += f":{parts.port}"
                    masked = urlunsplit((parts.scheme, f"***:***@{netloc}", parts.path, parts.query, parts.fragment))
                else:
                    masked = uri
            except Exception:
                masked = "<invalid-uri>"

            logging.warning("Could not connect to MongoDB at %s: %s", masked, exc)
            # Drop client/db so rest of the app can run in degraded mode.
            try:
                self.client.close()
            except Exception:
                pass
            self.client = None
            self.db = None

    async def close_db(self):
        """Close database connection."""
        if self.client:
            self.client.close()
            print("✓ Disconnected from MongoDB")

    def get_collection(self, collection_name: str):
        """Get a specific collection."""
        if self.db is None:
            raise RuntimeError("Database not initialized")
        return self.db[collection_name]


# Global instance
mongodb_manager = MongoDBManager()
