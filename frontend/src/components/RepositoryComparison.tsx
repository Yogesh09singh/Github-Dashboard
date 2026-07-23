import { useState } from 'react';
import { compareRepositories } from '../api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts';
import { ArrowRightLeft, Loader, Star, GitFork, GitCommit, Users } from 'lucide-react';

export function RepositoryComparison() {
  const [owner1, setOwner1] = useState('');
  const [repo1,  setRepo1]  = useState('');
  const [owner2, setOwner2] = useState('');
  const [repo2,  setRepo2]  = useState('');
  const [comparisonData, setComparisonData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCompare = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!owner1 || !repo1 || !owner2 || !repo2) {
      setError('Please fill in all four fields before comparing');
      return;
    }

    setIsLoading(true);
    try {
      const response = await compareRepositories({ owner1, repo1, owner2, repo2 });
      if (response.data.status === 'success') {
        setComparisonData(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Comparison failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    'w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-colors';

  const chartData = comparisonData
    ? [
        {
          metric: 'Stars',
          [comparisonData.repository1.name]: comparisonData.repository1.stars,
          [comparisonData.repository2.name]: comparisonData.repository2.stars,
        },
        {
          metric: 'Forks',
          [comparisonData.repository1.name]: comparisonData.repository1.forks,
          [comparisonData.repository2.name]: comparisonData.repository2.forks,
        },
        {
          metric: 'Commits',
          [comparisonData.repository1.name]: comparisonData.repository1.commits,
          [comparisonData.repository2.name]: comparisonData.repository2.commits,
        },
        {
          metric: 'Contributors',
          [comparisonData.repository1.name]: comparisonData.repository1.contributors,
          [comparisonData.repository2.name]: comparisonData.repository2.contributors,
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* ── Form Card ── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
            <ArrowRightLeft className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Compare Repositories</h2>
            <p className="text-sm text-slate-500">Side-by-side metrics for any two repos</p>
          </div>
        </div>

        <form onSubmit={handleCompare} className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Repo 1 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-5 h-5 bg-slate-900 text-white text-xs font-bold rounded-full">1</span>
                <h3 className="text-sm font-semibold text-slate-700">First Repository</h3>
              </div>
              <input
                type="text"
                value={owner1}
                onChange={(e) => setOwner1(e.target.value)}
                placeholder="Owner  (e.g., facebook)"
                className={inputClass}
                disabled={isLoading}
              />
              <input
                type="text"
                value={repo1}
                onChange={(e) => setRepo1(e.target.value)}
                placeholder="Repository  (e.g., react)"
                className={inputClass}
                disabled={isLoading}
              />
            </div>

            {/* Divider (desktop only) */}
            <div className="relative hidden lg:flex items-center justify-center">
              <div className="absolute inset-y-0 left-0 w-px bg-slate-100" />
            </div>

            {/* Repo 2 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-5 h-5 bg-slate-500 text-white text-xs font-bold rounded-full">2</span>
                <h3 className="text-sm font-semibold text-slate-700">Second Repository</h3>
              </div>
              <input
                type="text"
                value={owner2}
                onChange={(e) => setOwner2(e.target.value)}
                placeholder="Owner  (e.g., angular)"
                className={inputClass}
                disabled={isLoading}
              />
              <input
                type="text"
                value={repo2}
                onChange={(e) => setRepo2(e.target.value)}
                placeholder="Repository  (e.g., angular)"
                className={inputClass}
                disabled={isLoading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-slate-900 hover:bg-slate-700 disabled:bg-slate-300 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
          >
            {isLoading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Comparing…
              </>
            ) : (
              <>
                <ArrowRightLeft className="w-4 h-4" />
                Compare Repositories
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* ── Results ── */}
      {comparisonData && (
        <div className="space-y-6">
          {/* Chart */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4">Metrics Comparison</h3>
            <ResponsiveContainer width="100%" height={380}>
              <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="metric" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                />
                <Legend />
                <Bar dataKey={comparisonData.repository1.name} fill="#0f172a" radius={[4, 4, 0, 0]} />
                <Bar dataKey={comparisonData.repository2.name} fill="#16a34a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Detail Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[
              { data: comparisonData.repository1, accent: 'border-slate-900', badge: 'bg-slate-900' },
              { data: comparisonData.repository2, accent: 'border-green-600', badge: 'bg-green-600' },
            ].map(({ data: r, accent, badge }, idx) => (
              <div key={idx} className={`bg-white border-2 ${accent} rounded-2xl p-6`}>
                <div className="flex items-center gap-2 mb-4">
                  <span className={`inline-flex items-center justify-center w-5 h-5 ${badge} text-white text-xs font-bold rounded-full`}>
                    {idx + 1}
                  </span>
                  <h3 className="text-base font-bold text-slate-900">{r.name}</h3>
                </div>
                {r.description && (
                  <p className="text-sm text-slate-500 mb-4">{r.description}</p>
                )}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: <Star className="w-3.5 h-3.5 text-amber-500" />, label: 'Stars', val: r.stars?.toLocaleString() },
                    { icon: <GitFork className="w-3.5 h-3.5 text-slate-500" />, label: 'Forks', val: r.forks?.toLocaleString() },
                    { icon: <GitCommit className="w-3.5 h-3.5 text-slate-500" />, label: 'Commits', val: r.commits?.toLocaleString() },
                    { icon: <Users className="w-3.5 h-3.5 text-slate-500" />, label: 'Contributors', val: r.contributors?.toLocaleString() },
                  ].map(({ icon, label, val }) => (
                    <div key={label} className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        {icon}
                        <span className="text-xs text-slate-500 uppercase tracking-wide font-medium">{label}</span>
                      </div>
                      <p className="text-lg font-bold text-slate-900">{val ?? '—'}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span><strong className="text-slate-700">Language:</strong> {r.language || 'N/A'}</span>
                  <span><strong className="text-slate-700">Total Languages:</strong> {r.languages_count}</span>
                  <span><strong className="text-slate-700">Issues:</strong> {r.issues?.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
