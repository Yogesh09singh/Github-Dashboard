# GitHub Repository Intelligence Dashboard

> Analyze any GitHub repository with AI-powered insights — trends, comparisons, contributor breakdowns, and professional PDF reports, all in one clean dashboard.

[![FastAPI](https://img.shields.io/badge/FastAPI-0.104.1-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini-AI-4285F4?style=flat-square&logo=google)](https://ai.google.dev/)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Usage Guide](#usage-guide)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## Overview

GitHub Repository Intelligence Dashboard is a full-stack web application that turns raw GitHub data into meaningful, visual intelligence. Enter any public repository, and the app fetches metrics from the GitHub API, runs them through Google Gemini AI to generate narrative summaries and onboarding guides, stores the results in MongoDB, and displays everything in an interactive dashboard.

**Who is it for?**
- Developers evaluating open-source libraries to adopt
- Engineering leads assessing project health
- Contributors looking for an onboarding overview of a new codebase
- Anyone who wants to compare competing projects side-by-side

---

## Features

### 🔐 Authentication
- JWT-based signup and login
- Persistent sessions with access tokens stored in `localStorage`
- Protected routes — analysis history and compare pages require login
- Secure password hashing with bcrypt

### 📊 Repository Analysis & Dynamic Markdown Formatting
- **Stars, Forks, Open Issues, Contributors** — at-a-glance stat boxes with icon badges
- **Language Distribution** — interactive pie chart (Recharts)
- **Top Contributors** — bar chart of commit counts per contributor
- **Commit Activity** — total commits and recent commit messages
- **Repository Topics** — pill badges for GitHub topics
- **Custom Markdown Renderer** — dynamically parses and formats AI summaries and onboarding guides with:
  - Header lines (`###`, `####`)
  - Styled list badges (`1`, `2`, `3`)
  - Formatted inline code (`` `code` ``) and bold emphasis (`**text**`)
  - Dark terminal code blocks (````bash ... ````) with overflow support

### 🤖 Robust AI Engine & Model Fallbacks
- **Google Gemini AI Integration** — automatic model priority fallback across `gemini-2.0-flash`, `gemini-1.5-flash`, `gemini-1.5-pro`, and `gemini-pro`
- **Asynchronous Execution** — non-blocking thread execution for high-throughput responses
- **Structured Metric Fallbacks** — intelligent, metric-driven markdown generation ensuring AI sections always render beautifully even if API rate limits or quota errors occur

### 📈 Trending Repositories
- Live list of the most starred repositories on GitHub today
- Language color badges (TypeScript, Python, Go, Rust, …)
- Star and fork counts inline
- One-click "Analyse" link to jump straight to repository analysis

### 🔄 Side-by-Side Comparison
- Compare any two public repositories
- Grouped bar chart (Stars, Forks, Commits, Contributors)
- Numbered detail cards with stat breakdowns for each repo
- Dual accent palette (`slate-900` vs `green-600`)

### 📄 PDF Export
- Download a full analysis report as a PDF with one click
- Generated server-side with ReportLab
- Filename: `analysis_{owner}_{repo}.pdf`

### 🎨 Design & Layout
- Professional light slate and white theme (`#ffffff` / `#f8fafc`)
- Responsive grid layouts with centered CTA alignments
- Sticky navigation bar with subtle borders

---

## Tech Stack

### Backend

| Layer | Technology | Version |
|---|---|---|
| Framework | FastAPI | 0.104.1 |
| Server | Uvicorn | 0.24.0 |
| Database | MongoDB (Motor async driver) | 3.3.2 |
| Auth | python-jose (JWT) + passlib bcrypt | 3.3.0 / 1.7.4 |
| AI | Google Generative AI (Gemini) | 0.3.0 |
| GitHub | PyGitHub + HTTPX | 2.1.1 / 0.25.2 |
| PDF | ReportLab | 4.0.9 |
| Validation | Pydantic v2 + pydantic-settings | 2.5.0 |

### Frontend

| Layer | Technology | Version |
|---|---|---|
| UI Framework | React | 18.2 |
| Language | TypeScript | 5.2 |
| Build Tool | Vite | 5.0 |
| Styling | Tailwind CSS | 3.3 |
| State | Zustand | 4.4 |
| Routing | React Router v6 | 6.20 |
| Charts | Recharts | 2.10 |
| Icons | Lucide React | 0.292 |
| HTTP | Axios | 1.6 |
| Font | Inter (Google Fonts) | — |

---

## Project Structure

```
github-intelligence-dashboard/
│
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI routes & lifespan
│   │   ├── config.py            # Pydantic settings from .env
│   │   ├── database.py          # MongoDB Motor connection manager
│   │   ├── auth.py              # JWT creation & verification, bcrypt
│   │   ├── models.py            # Request/response Pydantic models
│   │   ├── user_models.py       # User schema (UserCreate, Token, …)
│   │   ├── github_service.py    # GitHub REST API wrapper
│   │   ├── gemini_service.py    # Google Gemini AI service & fallbacks
│   │   ├── pdf_service.py       # ReportLab PDF generation
│   │   ├── trending_service.py  # Trending repo scraper/fetcher
│   │   └── __init__.py
│   ├── tests/
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── .env                     # Secrets (git-ignored)
│   ├── .env.example             # Environment variable template
│   └── .gitignore
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── LandingPage.tsx          # Public home page
│   │   │   ├── LoginForm.tsx            # Sign-in form
│   │   │   ├── SignupForm.tsx           # Registration form
│   │   │   ├── RepositorySearch.tsx     # Search bar + submit
│   │   │   ├── AnalysisDashboard.tsx    # Full analysis view & Markdown renderer
│   │   │   ├── AnalysisHistory.tsx      # Recent analyses list
│   │   │   ├── RepositoryComparison.tsx # Compare two repos
│   │   │   ├── TrendingDashboard.tsx    # Trending repos list
│   │   │   └── PDFExportButton.tsx      # Download PDF button
│   │   ├── store/
│   │   │   └── authStore.ts             # Zustand auth state
│   │   ├── api.ts                       # Axios instance + helpers
│   │   ├── App.tsx                      # Router, navigation, layout
│   │   ├── main.tsx                     # React entry point
│   │   └── index.css                    # Tailwind + landing page CSS
│   ├── index.html                       # SEO meta tags, Google Fonts
│   ├── package.json
│   ├── vite.config.ts                   # Dev proxy → localhost:8000
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── Dockerfile
│
├── docker-compose.yml
├── setup.bat                            # Windows setup script
├── setup.sh                             # Unix setup script
├── README.md
└── .gitignore
```

---

## Prerequisites

| Requirement | Minimum Version |
|---|---|
| Python | 3.11+ |
| Node.js | 18+ |
| npm | 9+ |
| MongoDB | Local 4.4+ **or** MongoDB Atlas |
| GitHub Personal Access Token | — |
| Google Gemini API Key | — |

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Yogesh09singh/GitHub-Repository-Intelligence-Dashboard.git
cd GitHub-Repository-Intelligence-Dashboard
```

### 2. Configure the backend

```bash
cd backend
cp .env.example .env
```

Open `.env` and fill in your credentials.

```bash
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

- API base URL: `http://localhost:8000`
- Interactive docs: `http://localhost:8000/docs`

### 3. Start the frontend

Open a **new terminal**:

```bash
cd frontend
npm install
npm run dev
```

- App URL: `http://localhost:3000`

The Vite dev server proxies all `/api/*` requests to `http://localhost:8000`.

---

## Environment Variables

Copy `backend/.env.example` to `backend/.env` and set the following:

```env
# ── GitHub ──────────────────────────────────────────
GITHUB_TOKEN=ghp_...          # Personal Access Token with repo:read scope
GITHUB_API_URL=https://api.github.com

# ── Google Gemini ────────────────────────────────────
GEMINI_API_KEY=...             # From https://aistudio.google.com/

# ── MongoDB ─────────────────────────────────────────
MONGODB_URL=mongodb+srv://<user>:<password>@cluster.mongodb.net/
DATABASE_NAME=github_dashboard
MONGODB_USER=...
MONGODB_PASSWORD=...

# ── Server ──────────────────────────────────────────
BACKEND_PORT=8000
FRONTEND_URL=http://localhost:3000

# ── Security ────────────────────────────────────────
SECRET_KEY=...                 # Secret key for JWT signing
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

---

## API Reference

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/signup` | ❌ | Register a new user |
| `POST` | `/api/auth/login` | ❌ | Login and receive JWT |
| `GET` | `/api/auth/me` | ✅ Bearer | Get current user info |

### Analysis

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/analyze` | ❌ | Analyze a repository (AI + GitHub data) |
| `GET` | `/api/analysis/{owner}/{repo}` | ❌ | Retrieve stored analysis |
| `GET` | `/api/history` | ✅ Bearer | Get recent analysis history |

### Comparison

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/compare` | ❌ | Compare two repositories side-by-side |

### Trending

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/trending` | ❌ | Get today's trending repositories |
| `GET` | `/api/trending/{language}` | ❌ | Trending repos filtered by language |

### Export

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/export/pdf/{owner}/{repo}` | ❌ | Download analysis as PDF |

### Health

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | DB connectivity & uptime |
| `GET` | `/` | Root health ping |

---

## Usage Guide

### Sign Up
1. Visit `http://localhost:3000` — you'll see the landing page
2. Click **Get Started Free** → `/signup`
3. Enter email, username, and password

### Analyze a Repository
1. On the home dashboard, enter an **owner** (e.g., `microsoft`) and **repo name** (e.g., `vscode`)
2. Click **Analyze Repository** — Gemini AI runs in the background
3. Browse stat boxes, contributor chart, language distribution, and formatted AI summary & onboarding guide
4. Click **Export PDF** to download a full report

### Compare Repositories
1. Navigate to **Compare** in the top nav
2. Enter details for two repositories
3. View the grouped bar chart and detail cards

### Explore Trending
1. Click **Trending** in the top nav
2. Browse ranked repositories with stars, forks, and language badges
3. Click **Analyse** on any row to jump to its analysis

---

## Deployment

### Docker Compose (recommended)

```bash
docker-compose up --build
```

### Manual production build

**Backend:**
```bash
cd backend
pip install -r requirements.txt
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
```

**Frontend:**
```bash
cd frontend
npm run build        # outputs to frontend/dist/
npm run preview      # local preview of production build
```

---

## Troubleshooting

### `ECONNREFUSED` on `/api/...` calls
The Vite proxy is pointed at port `8000`. Make sure the backend is running on port 8000:
```bash
python -m uvicorn app.main:app --reload
```

### GitHub API rate limit (60 req/hr unauthenticated)
Add a valid `GITHUB_TOKEN` in `.env`. Authenticated tokens get 5,000 requests/hr.

### Gemini AI errors
- Confirm your `GEMINI_API_KEY` is active at [aistudio.google.com](https://aistudio.google.com/)
- The backend automatically falls back across `gemini-2.0-flash`, `gemini-1.5-flash`, `gemini-1.5-pro`, and `gemini-pro`, and gracefully generates structured metric summaries if quotas are reached.

---

## License

MIT License — see [LICENSE](LICENSE) for details.
