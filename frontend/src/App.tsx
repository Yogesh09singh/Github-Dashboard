import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import './App.css';
import { LoginForm } from './components/LoginForm';
import { SignupForm } from './components/SignupForm';
import { RepositorySearch } from './components/RepositorySearch';
import { AnalysisDashboard } from './components/AnalysisDashboard';
import { AnalysisHistory } from './components/AnalysisHistory';
import { RepositoryComparison } from './components/RepositoryComparison';
import { TrendingDashboard } from './components/TrendingDashboard';
import { LandingPage } from './components/LandingPage';
import { Github, LogOut, Menu, X, TrendingUp, ArrowRightLeft, Home } from 'lucide-react';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
}

function Navigation() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3" style={{ textDecoration: 'none' }}>
            <div className="p-2 bg-slate-900 rounded-lg">
              <Github className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-tight">GitHub Intelligence</h1>
              <p className="text-xs text-slate-500 leading-none">Repository Analyzer</p>
            </div>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {isAuthenticated && (
              <>
                <a href="/" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg flex items-center gap-1.5 transition-colors">
                  <Home className="w-4 h-4" />
                  Home
                </a>
                <a href="/trending" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg flex items-center gap-1.5 transition-colors">
                  <TrendingUp className="w-4 h-4" />
                  Trending
                </a>
                <a href="/compare" className="px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg flex items-center gap-1.5 transition-colors">
                  <ArrowRightLeft className="w-4 h-4" />
                  Compare
                </a>
                <div className="w-px h-6 bg-slate-200 mx-2" />
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">
                    Hello, <span className="font-semibold text-slate-800">{user?.username}</span>!
                  </span>
                  <button
                    onClick={logout}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </>
            )}
            {!isAuthenticated && (
              <div className="flex items-center gap-2">
                <a
                  href="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Sign In
                </a>
                <a
                  href="/signup"
                  className="px-4 py-2 text-sm font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Sign Up
                </a>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            {isOpen ? <X className="w-5 h-5 text-slate-700" /> : <Menu className="w-5 h-5 text-slate-700" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden mt-3 space-y-1 border-t border-slate-200 pt-3">
            {isAuthenticated ? (
              <>
                <a href="/" className="block px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Home</a>
                <a href="/trending" className="block px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Trending</a>
                <a href="/compare" className="block px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Compare</a>
                <button
                  onClick={() => { logout(); setIsOpen(false); }}
                  className="w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <a href="/login" className="block px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Sign In</a>
                <a href="/signup" className="block px-4 py-2 text-sm font-semibold bg-slate-900 text-white rounded-lg text-center">Sign Up</a>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}


function HomePage() {
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <main className="max-w-6xl mx-auto px-6 py-8">
      <RepositorySearch onAnalysis={setAnalysisData} onLoading={setIsLoading} />

      {!analysisData && !isLoading && <AnalysisHistory onSelect={() => {}} />}

      {analysisData && <AnalysisDashboard data={analysisData} />}

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Analyzing repository…</p>
        </div>
      )}
    </main>
  );
}

function App() {
  const { checkAuth, isAuthenticated } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50">
        <Navigation />

        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginForm />} />
          <Route path="/signup" element={<SignupForm />} />

          {/* Home: Landing for guests, Dashboard for authenticated */}
          <Route
            path="/"
            element={isAuthenticated ? <HomePage /> : <LandingPage />}
          />
          <Route
            path="/trending"
            element={
              <ProtectedRoute>
                <main className="max-w-6xl mx-auto px-6 py-8">
                  <TrendingDashboard />
                </main>
              </ProtectedRoute>
            }
          />
          <Route
            path="/compare"
            element={
              <ProtectedRoute>
                <main className="max-w-6xl mx-auto px-6 py-8">
                  <RepositoryComparison />
                </main>
              </ProtectedRoute>
            }
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} />} />
        </Routes>

        {/* Footer */}
        <footer className="bg-slate-900 border-t border-slate-800 mt-12">
          <div className="max-w-7xl mx-auto px-6 py-6 text-center">
            <p className="text-slate-400 text-sm">GitHub Repository Intelligence Dashboard &copy; 2025</p>
            <p className="text-slate-500 text-xs mt-1">Powered by GitHub API &middot; Google Gemini AI &middot; FastAPI &middot; MongoDB</p>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
