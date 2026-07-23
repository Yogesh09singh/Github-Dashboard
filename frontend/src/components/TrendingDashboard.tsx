import { useState, useEffect } from 'react';
import { getTrending } from '../api';
import { TrendingUp, Github, Star, GitFork, Code2, RefreshCw, ExternalLink } from 'lucide-react';

interface TrendingRepo {
  rank: number;
  name: string;
  owner: string;
  url: string;
  stars: number;
  forks: number;
  language: string;
  description: string;
}

const LANG_COLORS: Record<string, string> = {
  TypeScript: 'bg-blue-100 text-blue-800',
  JavaScript: 'bg-yellow-100 text-yellow-800',
  Python:     'bg-green-100 text-green-800',
  Go:         'bg-teal-100 text-teal-800',
  Rust:       'bg-orange-100 text-orange-800',
  Java:       'bg-red-100 text-red-800',
  'C++':      'bg-purple-100 text-purple-800',
  C:          'bg-slate-100 text-slate-700',
};

function langBadge(lang: string) {
  return LANG_COLORS[lang] ?? 'bg-slate-100 text-slate-700';
}

export function TrendingDashboard() {
  const [trendingRepos, setTrendingRepos] = useState<TrendingRepo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTrending();
  }, []);

  const loadTrending = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await getTrending();
      if (response.data.status === 'success') {
        setTrendingRepos(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load trending repositories');
    } finally {
      setIsLoading(false);
    }
  };

  /* Loading skeleton */
  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Trending Repositories</h2>
        </div>
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Trending Repositories</h2>
              <p className="text-sm text-slate-500">Most starred repos on GitHub today</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex text-xs font-medium text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full">
              Updated daily
            </span>
            <button
              onClick={loadTrending}
              className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Repo list */}
        <div className="space-y-3">
          {trendingRepos.map((repo) => (
            <div
              key={`${repo.owner}/${repo.name}`}
              className="flex items-start gap-4 p-4 border border-slate-100 rounded-xl hover:border-slate-200 hover:bg-slate-50 transition-colors group"
            >
              {/* Rank */}
              <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-slate-900 text-white text-sm font-bold rounded-lg">
                {repo.rank}
              </div>

              {/* Main content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <a
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-semibold text-slate-900 hover:text-slate-600 transition-colors text-sm"
                    >
                      <Github className="w-3.5 h-3.5 flex-shrink-0" />
                      {repo.owner}/{repo.name}
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />
                    </a>
                    {repo.description && (
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{repo.description}</p>
                    )}
                  </div>

                  {/* Analyse button */}
                  <a
                    href={`/?owner=${repo.owner}&repo=${repo.name}`}
                    className="flex-shrink-0 px-3 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-700 transition-colors"
                  >
                    Analyse
                  </a>
                </div>

                {/* Meta row */}
                <div className="flex items-center flex-wrap gap-3 mt-2.5">
                  <span className="flex items-center gap-1 text-xs text-slate-600">
                    <Star className="w-3.5 h-3.5 text-amber-500" />
                    {repo.stars.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-600">
                    <GitFork className="w-3.5 h-3.5 text-slate-400" />
                    {repo.forks.toLocaleString()}
                  </span>
                  {repo.language && (
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${langBadge(repo.language)}`}>
                      <Code2 className="w-3 h-3" />
                      {repo.language}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
