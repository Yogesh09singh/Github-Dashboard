"""Trending repositories service."""
import httpx
from typing import List, Dict, Any
from datetime import datetime
from app.config import get_settings


class TrendingService:
    """Service for fetching trending repositories."""

    def __init__(self):
        self.settings = get_settings()
        self.base_url = "https://api.github.com"
        self.headers = {
            "Authorization": f"token {self.settings.github_token}",
            "Accept": "application/vnd.github.v3+json",
        }

    async def get_trending_repositories(
        self, language: str = "", since: str = "daily"
    ) -> List[Dict[str, Any]]:
        """
        Fetch trending repositories from GitHub.
        
        Args:
            language: Programming language filter (e.g., 'python', 'javascript')
            since: Time range - 'daily', 'weekly', 'monthly'
        """
        async with httpx.AsyncClient() as client:
            # GitHub doesn't have official trending API
            # We'll search for recently created high-star repositories
            query = f"stars:>1000 sort:stars-desc"
            
            if language:
                query += f" language:{language}"
            
            time_ranges = {
                "daily": "2024-06-18..2024-06-19",
                "weekly": "2024-06-12..2024-06-19",
                "monthly": "2024-05-19..2024-06-19",
            }
            
            if since in time_ranges:
                query += f" pushed:{time_ranges[since]}"

            response = await client.get(
                f"{self.base_url}/search/repositories",
                headers=self.headers,
                params={
                    "q": query,
                    "sort": "stars",
                    "order": "desc",
                    "per_page": 20,
                },
                timeout=self.settings.request_timeout,
            )
            
            if response.status_code == 200:
                data = response.json()
                return self._format_trending(data.get("items", []))
            
            return []

    def _format_trending(self, repos: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Format repository data for trending display."""
        formatted = []
        for idx, repo in enumerate(repos, 1):
            formatted.append({
                "rank": idx,
                "name": repo.get("name"),
                "owner": repo.get("owner", {}).get("login"),
                "url": repo.get("html_url"),
                "stars": repo.get("stargazers_count", 0),
                "description": repo.get("description"),
                "language": repo.get("language"),
                "forks": repo.get("forks_count", 0),
                "open_issues": repo.get("open_issues_count", 0),
                "trending_since": datetime.now().isoformat(),
            })
        return formatted

    async def get_trending_by_language(self, language: str) -> List[Dict[str, Any]]:
        """Get trending repositories for a specific language."""
        return await self.get_trending_repositories(language=language, since="weekly")

    async def get_all_trending(self) -> List[Dict[str, Any]]:
        """Get trending repositories across all languages."""
        return await self.get_trending_repositories(since="weekly")


# Global instance
trending_service = TrendingService()
