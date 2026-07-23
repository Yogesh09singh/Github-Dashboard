"""FastAPI application main entry point."""
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import StreamingResponse
from contextlib import asynccontextmanager
from app.database import mongodb_manager
from app.config import get_settings
from app.github_service import github_service
from app.gemini_service import gemini_service
from app.models import RepositoryRequest, AnalysisResponse
from app.user_models import UserCreate, UserLogin, Token, UserResponse, RepositoryComparison
from app.auth import create_access_token, verify_password, get_password_hash, decode_token
from app.pdf_service import pdf_export_service
from app.trending_service import trending_service
from datetime import datetime
import logging
from io import BytesIO

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifespan."""
    # Startup
    logger.info("Starting application...")
    await mongodb_manager.connect_db()
    yield
    # Shutdown
    logger.info("Shutting down application...")
    await mongodb_manager.close_db()


# Create FastAPI app
app = FastAPI(
    title="GitHub Repository Intelligence Dashboard API",
    description="Analyze GitHub repositories with AI-powered insights",
    version="2.0.0",
    lifespan=lifespan,
)

# CORS middleware configuration
settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()


# Dependency for getting current user
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current authenticated user."""
    token = credentials.credentials
    user = decode_token(token)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )
    return user


@app.get("/", tags=["Health"])
async def root():
    """Root endpoint - health check."""
    return {
        "status": "ok",
        "message": "GitHub Repository Intelligence Dashboard API v2.0",
        "version": "2.0.0",
    }


# ============ AUTHENTICATION ENDPOINTS ============

@app.post("/api/auth/signup", tags=["Authentication"], response_model=Token)
async def signup(user_data: UserCreate):
    """Register a new user."""
    try:
        users_collection = mongodb_manager.get_collection("users")
        
        # Check if user already exists
        existing_user = await users_collection.find_one({"username": user_data.username})
        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="Username already registered",
            )
        
        existing_email = await users_collection.find_one({"email": user_data.email})
        if existing_email:
            raise HTTPException(
                status_code=400,
                detail="Email already registered",
            )
        
        # Create new user
        hashed_password = get_password_hash(user_data.password)
        new_user = {
            "username": user_data.username,
            "email": user_data.email,
            "hashed_password": hashed_password,
            "created_at": datetime.utcnow(),
        }
        
        result = await users_collection.insert_one(new_user)
        
        # Create access token
        access_token = create_access_token({"sub": user_data.username})
        
        return Token(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse(
                id=str(result.inserted_id),
                email=user_data.email,
                username=user_data.username,
                created_at=new_user["created_at"],
            ),
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Signup failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Signup failed: {str(e)}",
        )


@app.post("/api/auth/login", tags=["Authentication"], response_model=Token)
async def login(login_data: UserLogin):
    """Login user and return JWT token."""
    try:
        users_collection = mongodb_manager.get_collection("users")
        
        # Find user
        user = await users_collection.find_one({"username": login_data.username})
        if not user or not verify_password(login_data.password, user.get("hashed_password")):
            raise HTTPException(
                status_code=401,
                detail="Invalid username or password",
            )
        
        # Create access token
        access_token = create_access_token({"sub": login_data.username})
        
        return Token(
            access_token=access_token,
            token_type="bearer",
            user=UserResponse(
                id=str(user.get("_id")),
                email=user.get("email"),
                username=user.get("username"),
                created_at=user.get("created_at"),
            ),
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Login failed: {str(e)}",
        )


@app.get("/api/auth/me", tags=["Authentication"], response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    """Get current user information."""
    try:
        users_collection = mongodb_manager.get_collection("users")
        user = await users_collection.find_one({"username": current_user["username"]})
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return UserResponse(
            id=str(user.get("_id")),
            email=user.get("email"),
            username=user.get("username"),
            created_at=user.get("created_at"),
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to fetch user: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch user")


# ============ ANALYSIS ENDPOINTS ============

@app.post("/api/analyze", tags=["Analysis"], response_model=AnalysisResponse)
async def analyze_repository(request: RepositoryRequest):
    """
    Analyze a GitHub repository and generate insights.
    """
    try:
        # Fetch repository data
        repo_data = await github_service.get_repository(request.owner, request.repo)
        
        # Fetch commits
        commits = await github_service.get_commits(request.owner, request.repo)
        
        # Fetch contributors
        contributors = await github_service.get_contributors(request.owner, request.repo)
        
        # Fetch languages
        languages = await github_service.get_languages(request.owner, request.repo)
        
        # Fetch releases
        releases = await github_service.get_releases(request.owner, request.repo)
        
        # Generate AI summary if requested
        summary = None
        if request.generate_summary:
            try:
                summary = await gemini_service.generate_project_summary(repo_data)
            except Exception as e:
                logger.error(f"Failed to generate summary: {e}")
                summary = f"**{repo_data.get('name')}** is a project written primarily in **{repo_data.get('language') or 'Various'}**.\n\n{repo_data.get('description') or 'No description provided.'}"

        # Generate onboarding guide if requested
        guide = None
        if request.generate_guide:
            try:
                guide = await gemini_service.generate_onboarding_guide(repo_data)
            except Exception as e:
                logger.error(f"Failed to generate guide: {e}")
                guide = f"### Getting Started with {repo_data.get('name')}\n\n#### 1. Clone the Repository\n```bash\ngit clone https://github.com/{request.owner}/{request.repo}.git\ncd {request.repo}\n```\n\n#### 2. Environment Setup\nEnsure you have the latest **{repo_data.get('language') or 'development'}** tools installed.\n\n#### 3. Contribution Workflow\nFork the repository, create a branch, and open a Pull Request."
        
        # Prepare analysis data
        analysis_data = {
            "repository": {
                "name": repo_data.get("name"),
                "owner": request.owner,
                "url": repo_data.get("html_url"),
                "description": repo_data.get("description"),
                "stars": repo_data.get("stargazers_count", 0),
                "forks": repo_data.get("forks_count", 0),
                "openIssues": repo_data.get("open_issues_count", 0),
                "language": repo_data.get("language"),
                "topics": repo_data.get("topics", []),
                "createdAt": repo_data.get("created_at"),
                "updatedAt": repo_data.get("updated_at"),
            },
            "commits": {
                "total": len(commits),
                "recent": commits[:10] if commits else [],
            },
            "contributors": {
                "total": len(contributors),
                "topContributors": contributors[:10] if contributors else [],
            },
            "languages": languages,
            "releases": {
                "total": len(releases),
                "latest": releases[0] if releases else None,
            },
            "ai_insights": {
                "summary": summary,
                "onboarding_guide": guide,
            },
            "analyzed_at": datetime.utcnow().isoformat(),
        }
        
        # Store analysis in MongoDB
        collection = mongodb_manager.get_collection("analyses")
        analysis_data["_id"] = f"{request.owner}/{request.repo}"
        await collection.update_one(
            {"_id": analysis_data["_id"]},
            {"$set": analysis_data},
            upsert=True,
        )
        
        return AnalysisResponse(
            status="success",
            data=analysis_data,
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Analysis failed: {e}")
        raise HTTPException(
            status_code=400,
            detail=f"Failed to analyze repository: {str(e)}",
        )


@app.get("/api/history", tags=["History"])
async def get_analysis_history(
    limit: int = 10,
    skip: int = 0,
    current_user: dict = Depends(get_current_user),
):
    """Get analysis history for authenticated user."""
    try:
        collection = mongodb_manager.get_collection("analyses")
        analyses = await collection.find().skip(skip).limit(limit).to_list(length=limit)
        return {
            "status": "success",
            "count": len(analyses),
            "data": analyses,
        }
    except Exception as e:
        logger.error(f"Failed to fetch history: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch history: {str(e)}",
        )


@app.get("/api/analysis/{owner}/{repo}", tags=["Analysis"])
async def get_analysis(owner: str, repo: str):
    """Get a specific analysis from MongoDB."""
    try:
        collection = mongodb_manager.get_collection("analyses")
        analysis = await collection.find_one({"_id": f"{owner}/{repo}"})
        
        if not analysis:
            raise HTTPException(
                status_code=404,
                detail="Analysis not found",
            )
        
        return {
            "status": "success",
            "data": analysis,
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to fetch analysis: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch analysis: {str(e)}",
        )


# ============ COMPARISON ENDPOINTS ============

@app.post("/api/compare", tags=["Comparison"])
async def compare_repositories(request: RepositoryComparison):
    """
    Compare two repositories side-by-side.
    """
    try:
        # Fetch both repositories
        repo1 = await github_service.get_repository(request.owner1, request.repo1)
        repo2 = await github_service.get_repository(request.owner2, request.repo2)
        
        # Fetch data for comparison
        commits1 = await github_service.get_commits(request.owner1, request.repo1)
        commits2 = await github_service.get_commits(request.owner2, request.repo2)
        
        contributors1 = await github_service.get_contributors(request.owner1, request.repo1)
        contributors2 = await github_service.get_contributors(request.owner2, request.repo2)
        
        languages1 = await github_service.get_languages(request.owner1, request.repo1)
        languages2 = await github_service.get_languages(request.owner2, request.repo2)
        
        comparison_data = {
            "repository1": {
                "name": f"{request.owner1}/{request.repo1}",
                "stars": repo1.get("stargazers_count", 0),
                "forks": repo1.get("forks_count", 0),
                "commits": len(commits1),
                "contributors": len(contributors1),
                "language": repo1.get("language"),
                "languages_count": len(languages1),
                "issues": repo1.get("open_issues_count", 0),
                "description": repo1.get("description"),
            },
            "repository2": {
                "name": f"{request.owner2}/{request.repo2}",
                "stars": repo2.get("stargazers_count", 0),
                "forks": repo2.get("forks_count", 0),
                "commits": len(commits2),
                "contributors": len(contributors2),
                "language": repo2.get("language"),
                "languages_count": len(languages2),
                "issues": repo2.get("open_issues_count", 0),
                "description": repo2.get("description"),
            },
            "comparison_at": datetime.utcnow().isoformat(),
        }
        
        return {
            "status": "success",
            "data": comparison_data,
        }
    except Exception as e:
        logger.error(f"Comparison failed: {e}")
        raise HTTPException(
            status_code=400,
            detail=f"Failed to compare repositories: {str(e)}",
        )


# ============ PDF EXPORT ENDPOINTS ============

@app.get("/api/export/pdf/{owner}/{repo}", tags=["Export"])
async def export_analysis_pdf(owner: str, repo: str):
    """Export analysis as PDF."""
    try:
        collection = mongodb_manager.get_collection("analyses")
        analysis = await collection.find_one({"_id": f"{owner}/{repo}"})
        
        if not analysis:
            raise HTTPException(
                status_code=404,
                detail="Analysis not found",
            )
        
        # Generate PDF
        pdf_bytes = pdf_export_service.generate_analysis_pdf(analysis, f"{owner}/{repo}")
        
        return StreamingResponse(
            BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=analysis_{owner}_{repo}.pdf"
            },
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"PDF export failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to export PDF: {str(e)}",
        )


# ============ TRENDING ENDPOINTS ============

@app.get("/api/trending", tags=["Trending"])
async def get_trending_repositories(language: str = "", since: str = "weekly"):
    """Get trending repositories."""
    try:
        if language:
            trending_repos = await trending_service.get_trending_by_language(language)
        else:
            trending_repos = await trending_service.get_all_trending()
        
        return {
            "status": "success",
            "count": len(trending_repos),
            "data": trending_repos,
        }
    except Exception as e:
        logger.error(f"Failed to fetch trending: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch trending repositories: {str(e)}",
        )


@app.get("/api/trending/{language}", tags=["Trending"])
async def get_trending_by_language(language: str):
    """Get trending repositories for a specific language."""
    try:
        trending_repos = await trending_service.get_trending_by_language(language)
        return {
            "status": "success",
            "count": len(trending_repos),
            "data": trending_repos,
        }
    except Exception as e:
        logger.error(f"Failed to fetch trending: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch trending repositories: {str(e)}",
        )


@app.get("/api/health", tags=["Health"])
async def health_check():
    """Detailed health check including database connection."""
    return {
        "status": "healthy",
        "database": "connected" if mongodb_manager.db is not None else "disconnected",
        "timestamp": datetime.utcnow().isoformat(),
    }


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=settings.backend_port,
    )
