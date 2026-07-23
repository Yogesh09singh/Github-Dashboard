.github/copilot-instructions.md

# GitHub Repository Intelligence Dashboard - Development Guide

## Project Overview

This is a full-stack application for analyzing GitHub repositories with AI-powered insights. It combines GitHub API, Google Gemini AI, and interactive data visualization.

## Tech Stack

- **Backend**: Python FastAPI with MongoDB
- **Frontend**: React 18 + TypeScript + Recharts
- **AI**: Google Gemini API
- **Containerization**: Docker & Docker Compose

## Key Features

1. **Repository Analysis**: Fetch and analyze GitHub repositories
2. **Data Visualization**: Interactive charts and metrics
3. **AI Insights**: Auto-generated summaries and onboarding guides
4. **Analysis History**: Cache and retrieve past analyses

## Development Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- MongoDB (local or cloud)
- API Keys (GitHub, Gemini)

### Backend Development

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your API keys
python -m uvicorn app.main:app --reload
```

API runs on `http://localhost:8000`
- Swagger UI: `http://localhost:8000/docs`

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`

## Project Structure

### Backend (`/backend`)
- **app/config.py**: Configuration management
- **app/database.py**: MongoDB connection
- **app/github_service.py**: GitHub API client
- **app/gemini_service.py**: Gemini AI integration
- **app/main.py**: FastAPI application

### Frontend (`/frontend`)
- **src/components/**: React components
- **src/api.ts**: Backend API client
- **src/App.tsx**: Main application

## Common Tasks

### Adding New Features

1. **API Endpoint**: Add to `backend/app/main.py`
2. **Backend Logic**: Create service in `backend/app/`
3. **Frontend Component**: Create in `frontend/src/components/`
4. **API Client**: Update `frontend/src/api.ts`

### Database Schema

MongoDB Collections:
- `analyses`: Stores repository analysis results
  - `_id`: "{owner}/{repo}"
  - `repository`: Repo metadata
  - `commits`, `contributors`, `languages`: Analysis data
  - `ai_insights`: AI summaries

## API Documentation

See `backend/app/main.py` for all endpoints:
- `POST /api/analyze`: Analyze repository
- `GET /api/analysis/{owner}/{repo}`: Retrieve analysis
- `GET /api/history`: Get analysis history
- `GET /api/health`: Health check

## Environment Variables

### Backend (.env)
```
GITHUB_TOKEN=<your-token>
GEMINI_API_KEY=<your-key>
MONGODB_URL=mongodb://localhost:27017
BACKEND_PORT=8000
FRONTEND_URL=http://localhost:3000
```

## Testing

### Backend
```bash
cd backend
pytest
```

### Frontend
```bash
cd frontend
npm test
```

## Deployment

### Docker Compose
```bash
docker-compose up
```

### Manual Deploy
See README.md for production setup instructions

## Code Guidelines

- **Python**: Follow PEP 8, type hints for all functions
- **TypeScript**: Use strict mode, explicit types
- **Components**: Keep components small and focused
- **Error Handling**: Provide meaningful error messages

## Troubleshooting

**MongoDB Connection Error**:
- Ensure MongoDB is running
- Check connection string in `.env`

**API Rate Limits**:
- GitHub API has rate limits (60 req/hour unauthenticated)
- Add delays between requests if needed

**Gemini API Errors**:
- Verify API key is valid
- Check quota on Google Cloud

## Performance Tips

- Use `.find().limit()` for large MongoDB queries
- Implement caching for frequently accessed repos
- Lazy load chart components
- Compress API responses

## Future Roadmap

- [ ] User authentication
- [ ] Export analysis as PDF
- [ ] Real-time notifications
- [ ] Advanced trend analysis
- [ ] Mobile app
- [ ] Custom analytics dashboard
