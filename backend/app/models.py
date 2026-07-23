"""Pydantic models for request/response validation."""
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime


class RepositoryAnalysis(BaseModel):
    """Repository analysis data model."""

    repo_owner: str
    repo_name: str
    repository_url: str
    description: Optional[str] = None
    stars: int = 0
    forks: int = 0
    open_issues: int = 0
    language: Optional[str] = None
    topics: List[str] = []
    commit_count: int = 0
    contributor_count: int = 0
    last_updated: datetime
    summary: Optional[str] = None
    onboarding_guide: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class RepositoryRequest(BaseModel):
    """Request model for repository analysis."""

    owner: str = Field(..., description="Repository owner/organization")
    repo: str = Field(..., description="Repository name")
    generate_summary: bool = True
    generate_guide: bool = True


class AnalysisResponse(BaseModel):
    """Response model for analysis results."""

    status: str
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


class CommitActivity(BaseModel):
    """Commit activity data model."""

    date: str
    count: int
    message: str = ""


class ContributorStats(BaseModel):
    """Contributor statistics model."""

    login: str
    contributions: int
    avatar_url: Optional[str] = None
    profile_url: Optional[str] = None
