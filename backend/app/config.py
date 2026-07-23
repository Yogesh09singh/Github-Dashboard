"""Application configuration settings."""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings from environment variables."""

    # GitHub Configuration
    github_token: str
    github_api_url: str = "https://api.github.com"

    # Gemini Configuration
    gemini_api_key: str

    # MongoDB Configuration
    mongodb_url: str = "mongodb://localhost:27017"
    database_name: str = "github_dashboard"
    mongodb_user: str = "admin"
    mongodb_password: str = "password"

    # Server Configuration
    backend_port: int = 8000
    frontend_url: str = "http://localhost:3000"

    # API Configuration
    max_retries: int = 3
    request_timeout: int = 30
    
    # Security Configuration
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Get cached application settings."""
    return Settings()
