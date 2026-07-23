"""User models for authentication."""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    """Base user model."""
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)


class UserCreate(UserBase):
    """User creation model."""
    password: str = Field(..., min_length=6)


class UserLogin(BaseModel):
    """User login model."""
    username: str
    password: str


class UserResponse(UserBase):
    """User response model (without password)."""
    id: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class Token(BaseModel):
    """JWT token response."""
    access_token: str
    token_type: str
    user: UserResponse


class RepositoryComparison(BaseModel):
    """Repository comparison request."""
    owner1: str
    repo1: str
    owner2: str
    repo2: str


class TrendingRepository(BaseModel):
    """Trending repository model."""
    rank: int
    name: str
    owner: str
    url: str
    stars: int
    stars_today: int
    description: Optional[str]
    language: Optional[str]
    trending_since: datetime
