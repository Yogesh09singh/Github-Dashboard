import { useState, useEffect } from 'react';
import { History, ExternalLink } from 'lucide-react';
import { getAnalysisHistory } from '../api';

interface HistoryItem {
  _id: string;
  repository: {
    name: string;
    owner: string;
  };
  analyzed_at: string;
}

interface AnalysisHistoryProps {
  onSelect: (owner: string, repo: string) => void;
}

export function AnalysisHistory({ onSelect }: AnalysisHistoryProps) {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await getAnalysisHistory(10);
      if (response.data.data) {
        setHistory(response.data.data);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  if (history.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center">
            <History className="w-4 h-4 text-slate-600" />
          </div>
          <h2 className="text-base font-bold text-slate-900">Recent Analyses</h2>
        </div>
        <button
          onClick={loadHistory}
          className="text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors px-2.5 py-1 hover:bg-slate-100 rounded-lg"
        >
          Refresh
        </button>
      </div>

      {/* List */}
      <div className="space-y-2">
        {history.map((item) => (
          <div
            key={item._id}
            className="flex items-center justify-between p-3.5 border border-slate-100 rounded-xl hover:border-slate-200 hover:bg-slate-50 transition-colors group"
          >
            <button
              onClick={() => {
                const [owner, repo] = item._id.split('/');
                onSelect(owner, repo);
              }}
              className="flex-1 text-left"
            >
              <p className="text-sm font-semibold text-slate-900 group-hover:text-slate-700">
                {item.repository.owner}/{item.repository.name}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Analyzed {new Date(item.analyzed_at).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric',
                })}
              </p>
            </button>
            <ExternalLink className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 transition-colors flex-shrink-0 ml-2" />
          </div>
        ))}
      </div>
    </div>
  );
}
