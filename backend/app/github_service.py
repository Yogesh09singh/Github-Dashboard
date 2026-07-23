"""GitHub API integration service."""
import httpx
from datetime import datetime
from typing import Dict, Any, List
from app.config import get_settings


class GitHubService:
    """Service for interacting with GitHub API."""

    def __init__(self):
        self.settings = get_settings()
        self.headers = {
            "Authorization": f"token {self.settings.github_token}",
            "Accept": "application/vnd.github.v3+json",
        }
        self.base_url = self.settings.github_api_url

    async def get_repository(self, owner: str, repo: str) -> Dict[str, Any]:
        """Fetch repository information."""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/repos/{owner}/{repo}",
                headers=self.headers,
                timeout=self.settings.request_timeout,
            )
            response.raise_for_status()
            return response.json()

    async def get_commits(
        self, owner: str, repo: str, per_page: int = 100
    ) -> List[Dict[str, Any]]:
        """Fetch commit history."""
        commits = []
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/repos/{owner}/{repo}/commits",
                headers=self.headers,
                params={"per_page": per_page},
                timeout=self.settings.request_timeout,
            )
            response.raise_for_status()
            commits = response.json()
        return commits

    async def get_contributors(
        self, owner: str, repo: str, per_page: int = 100
    ) -> List[Dict[str, Any]]:
        """Fetch repository contributors."""
        contributors = []
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/repos/{owner}/{repo}/contributors",
                headers=self.headers,
                params={"per_page": per_page},
                timeout=self.settings.request_timeout,
            )
            response.raise_for_status()
            contributors = response.json()
        return contributors

    async def get_languages(self, owner: str, repo: str) -> Dict[str, int]:
        """Fetch repository languages and their byte counts."""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/repos/{owner}/{repo}/languages",
                headers=self.headers,
                timeout=self.settings.request_timeout,
            )
            response.raise_for_status()
            return response.json()

    async def get_dependency_graph(self, owner: str, repo: str) -> Dict[str, Any]:
        """Fetch dependency information from repository."""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/repos/{owner}/{repo}/dependency-graph/snapshots",
                headers=self.headers,
                timeout=self.settings.request_timeout,
            )
            if response.status_code == 200:
                return response.json()
            return {}

    async def get_releases(self, owner: str, repo: str) -> List[Dict[str, Any]]:
        """Fetch repository releases."""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/repos/{owner}/{repo}/releases",
                headers=self.headers,
                timeout=self.settings.request_timeout,
            )
            if response.status_code == 200:
                return response.json()
            return []

    async def get_issues(self, owner: str, repo: str, state: str = "all") -> List[Dict[str, Any]]:
        """Fetch repository issues and pull requests."""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/repos/{owner}/{repo}/issues",
                headers=self.headers,
                params={"state": state, "per_page": 100},
                timeout=self.settings.request_timeout,
            )
            if response.status_code == 200:
                return response.json()
            return []


# Global instance
github_service = GitHubService()
