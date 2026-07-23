#!/bin/bash

# GitHub Repository Intelligence Dashboard Startup Script

echo "🚀 Starting GitHub Repository Intelligence Dashboard..."

# Check if .env file exists
if [ ! -f "backend/.env" ]; then
  echo "⚠️  Warning: backend/.env not found. Creating from example..."
  cp backend/.env.example backend/.env
  echo "⚠️  Please update backend/.env with your API keys:"
  echo "   - GITHUB_TOKEN: GitHub Personal Access Token"
  echo "   - GEMINI_API_KEY: Google Gemini API Key"
fi

echo ""
echo "📦 Installing backend dependencies..."
cd backend
pip install -r requirements.txt
cd ..

echo ""
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "🔄 To run the application:"
echo "   Backend:  cd backend && python -m uvicorn app.main:app --reload"
echo "   Frontend: cd frontend && npm run dev"
echo ""
echo "📝 Make sure MongoDB is running on localhost:27017"
