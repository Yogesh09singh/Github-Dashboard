"""Google Gemini AI integration service with robust model fallbacks."""
import asyncio
import logging
import google.generativeai as genai
from typing import Dict, Any
from app.config import get_settings

logger = logging.getLogger(__name__)


def _extract_owner(repo_data: Dict[str, Any]) -> str:
    owner = repo_data.get('owner')
    if isinstance(owner, dict):
        return owner.get('login', 'owner')
    if isinstance(owner, str) and owner.strip():
        return owner.strip()
    return 'owner'


class GeminiService:
    """Service for interacting with Google Gemini API."""

    def __init__(self):
        self.settings = get_settings()
        self.api_key = self.settings.gemini_api_key
        if self.api_key:
            genai.configure(api_key=self.api_key)
        
        # Valid Google Gemini models to try in priority order
        self.candidate_models = [
            "gemini-2.0-flash",
            "gemini-1.5-flash",
            "gemini-1.5-pro",
            "gemini-pro",
        ]

    def _call_gemini(self, prompt: str) -> str:
        """Synchronously try generating content across candidate models."""
        last_error = None
        for model_name in self.candidate_models:
            try:
                model = genai.GenerativeModel(model_name)
                response = model.generate_content(prompt)
                if response and response.text:
                    return response.text.strip()
            except Exception as e:
                logger.warning(f"Gemini model {model_name} failed: {e}")
                last_error = e
        raise last_error or RuntimeError("All Gemini models failed")

    async def generate_project_summary(
        self, repo_data: Dict[str, Any]
    ) -> str:
        """Generate AI summary of repository."""
        name = repo_data.get('name', 'Repository')
        desc = repo_data.get('description') or 'No description provided.'
        lang = repo_data.get('language') or 'Various'
        stars = repo_data.get('stargazers_count', 0)
        forks = repo_data.get('forks_count', 0)
        issues = repo_data.get('open_issues_count', 0)
        topics_list = repo_data.get('topics', [])
        topics = ", ".join(topics_list) if topics_list else 'None'

        prompt = f"""
        Analyze this GitHub repository data and provide a concise 2-3 paragraph summary:
        
        Repository Name: {name}
        Description: {desc}
        Main Language: {lang}
        Stars: {stars}
        Forks: {forks}
        Open Issues: {issues}
        Topics: {topics}
        
        Provide a clear, professional technical summary suitable for software engineers. Focus on what the project does, key technical details, and its community engagement.
        """
        
        try:
            return await asyncio.to_thread(self._call_gemini, prompt)
        except Exception as e:
            logger.error(f"Failed to generate Gemini summary: {e}")
            return (
                f"**{name}** is a software repository primarily built with **{lang}**. "
                f"{desc}\n\n"
                f"The project has accumulated **{stars:,} stars**, **{forks:,} forks**, and **{issues:,} open issues**. "
                f"Core topics and tags: **{topics}**."
            )

    async def generate_onboarding_guide(
        self, repo_data: Dict[str, Any], readme: str = ""
    ) -> str:
        """Generate AI-powered onboarding guide for new contributors."""
        name = repo_data.get('name', 'Repository')
        desc = repo_data.get('description') or 'N/A'
        lang = repo_data.get('language') or 'General'
        owner = _extract_owner(repo_data)

        prompt = f"""
        Create a practical onboarding guide for new contributors to this project:
        
        Repository: {name}
        Owner: {owner}
        Description: {desc}
        Language: {lang}
        
        README Content (if available):
        {readme[:2000] if readme else "No README available"}
        
        Include:
        1. Project Purpose & Core Stack ({lang})
        2. Prerequisites & Setup
        3. Project Structure
        4. Contribution Workflow
        
        Keep it concise, well-structured with clear markdown headings and code blocks.
        """
        
        try:
            return await asyncio.to_thread(self._call_gemini, prompt)
        except Exception as e:
            logger.error(f"Failed to generate Gemini onboarding guide: {e}")
            return (
                f"### Getting Started with {name}\n\n"
                f"#### 1. Clone the Repository\n"
                f"```bash\n"
                f"git clone https://github.com/{owner}/{name}.git\n"
                f"cd {name}\n"
                f"```\n\n"
                f"#### 2. Environment Setup\n"
                f"Ensure you have the latest **{lang}** environment and standard development tools installed.\n\n"
                f"#### 3. Explore Codebase\n"
                f"Review the primary entry points and source files to understand the project architecture.\n\n"
                f"#### 4. Contribution Workflow\n"
                f"- Fork the repository on GitHub.\n"
                f"- Create a feature branch (`git checkout -b feature/my-feature`).\n"
                f"- Commit your changes and push to your fork.\n"
                f"- Open a Pull Request for review."
            )

    async def analyze_code_complexity(
        self, metrics: Dict[str, Any]
    ) -> str:
        """Analyze and provide insights on code metrics."""
        prompt = f"""
        Analyze these code metrics and provide insights:
        
        Metrics: {metrics}
        
        Provide:
        1. Overall code health assessment
        2. Areas of concern
        3. Recommendations for improvement
        
        Be concise but actionable.
        """
        try:
            return await asyncio.to_thread(self._call_gemini, prompt)
        except Exception as e:
            logger.error(f"Failed to analyze complexity: {e}")
            return "Code health analysis unavailable at this time."


# Global instance
gemini_service = GeminiService()
