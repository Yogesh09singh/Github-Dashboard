import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { Github, GitBranch, Users, Code2, Star, AlertCircle, Brain } from 'lucide-react';
import { PDFExportButton } from './PDFExportButton';

interface AnalysisDashboardProps {
  data: any;
}

const CHART_COLORS = ['#0f172a', '#16a34a', '#f59e0b', '#0369a1', '#dc2626', '#7c3aed', '#0891b2'];

/* ── Inline Markdown Parser ── */
function renderInlineMarkdown(text: string): React.ReactNode {
  // Split on bold (**...**) and inline code (`...`)
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);

  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return (
        <strong key={i} className="font-semibold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <code key={i} className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-800 font-mono text-xs mx-0.5">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

/* ── Full Markdown Block Renderer ── */
function FormattedMarkdown({ content }: { content: string }) {
  if (!content) return null;

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBlockBuffer: string[] = [];

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Code block toggle
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <div
            key={`code-block-${index}`}
            className="my-3 bg-slate-900 text-slate-100 rounded-xl p-4 font-mono text-xs overflow-x-auto border border-slate-800 shadow-inner"
          >
            <pre className="whitespace-pre">
              <code>{codeBlockBuffer.join('\n')}</code>
            </pre>
          </div>
        );
        codeBlockBuffer = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeBlockBuffer.push(line);
      return;
    }

    if (!trimmed) {
      elements.push(<div key={`space-${index}`} className="h-1.5" />);
      return;
    }

    // Headings
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h3 key={`h3-${index}`} className="text-base font-bold text-slate-900 mt-4 mb-2 border-b border-slate-100 pb-1.5">
          {renderInlineMarkdown(trimmed.replace(/^###\s+/, ''))}
        </h3>
      );
      return;
    }

    if (trimmed.startsWith('#### ')) {
      elements.push(
        <h4 key={`h4-${index}`} className="text-sm font-semibold text-slate-800 mt-3 mb-1.5 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          {renderInlineMarkdown(trimmed.replace(/^####\s+/, ''))}
        </h4>
      );
      return;
    }

    // Numbered list items: 1. Item
    if (/^\d+\.\s+/.test(trimmed)) {
      const match = trimmed.match(/^(\d+)\.\s+(.*)/);
      if (match) {
        elements.push(
          <div key={`num-${index}`} className="flex items-start gap-2.5 my-2 text-sm text-slate-700">
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold flex-shrink-0 mt-0.5">
              {match[1]}
            </span>
            <div className="flex-1 leading-relaxed">
              {renderInlineMarkdown(match[2])}
            </div>
          </div>
        );
        return;
      }
    }

    // Bullet points: - or *
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      elements.push(
        <div key={`bullet-${index}`} className="flex items-start gap-2 my-1.5 text-sm text-slate-700 pl-2">
          <span className="text-slate-400 font-bold mt-0.5">•</span>
          <div className="flex-1 leading-relaxed">
            {renderInlineMarkdown(trimmed.replace(/^[-*]\s+/, ''))}
          </div>
        </div>
      );
      return;
    }

    // Regular paragraph
    elements.push(
      <p key={`p-${index}`} className="text-sm text-slate-700 leading-relaxed my-1.5">
        {renderInlineMarkdown(trimmed)}
      </p>
    );
  });

  // If code block remains unclosed
  if (inCodeBlock && codeBlockBuffer.length > 0) {
    elements.push(
      <div
        key="code-block-end"
        className="my-3 bg-slate-900 text-slate-100 rounded-xl p-4 font-mono text-xs overflow-x-auto border border-slate-800 shadow-inner"
      >
        <pre className="whitespace-pre">
          <code>{codeBlockBuffer.join('\n')}</code>
        </pre>
      </div>
    );
  }

  return <div className="space-y-1">{elements}</div>;
}

function StatBox({
  icon,
  label,
  value,
  iconBg,
  iconColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-8 h-8 ${iconBg} rounded-lg flex items-center justify-center`}>
          <span className={iconColor}>{icon}</span>
        </div>
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-2xl font-bold text-slate-900">{value ?? '—'}</p>
    </div>
  );
}

export function AnalysisDashboard({ data }: AnalysisDashboardProps) {
  if (!data) return null;

  const repo         = data.repository    || {};
  const commits      = data.commits       || {};
  const contributors = data.contributors  || {};
  const languages    = data.languages     || {};
  const aiInsights   = data.ai_insights   || {};

  const languageData = Object.entries(languages).map(([name, bytes]: any) => ({
    name,
    value: bytes,
  }));

  const topContributorsData = (contributors.topContributors || []).map((c: any) => ({
    name: c.login,
    contributions: c.contributions,
  }));

  return (
    <div className="space-y-6">
      {/* ── Repository Overview ── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
              <Github className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{repo.owner}/{repo.name}</h2>
              <a
                href={repo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-slate-500 hover:text-slate-900 hover:underline"
              >
                {repo.url}
              </a>
              {repo.description && (
                <p className="text-slate-600 text-sm mt-1">{repo.description}</p>
              )}
            </div>
          </div>
          <PDFExportButton owner={repo.owner} repo={repo.name} />
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatBox
            icon={<Star className="w-4 h-4" />}
            label="Stars"
            value={repo.stars?.toLocaleString()}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
          />
          <StatBox
            icon={<GitBranch className="w-4 h-4" />}
            label="Forks"
            value={repo.forks?.toLocaleString()}
            iconBg="bg-green-50"
            iconColor="text-green-700"
          />
          <StatBox
            icon={<AlertCircle className="w-4 h-4" />}
            label="Open Issues"
            value={repo.openIssues?.toLocaleString()}
            iconBg="bg-red-50"
            iconColor="text-red-600"
          />
          <StatBox
            icon={<Users className="w-4 h-4" />}
            label="Contributors"
            value={contributors.total?.toLocaleString()}
            iconBg="bg-slate-100"
            iconColor="text-slate-700"
          />
        </div>

        {/* Topics */}
        {repo.topics && repo.topics.length > 0 && (
          <div className="mt-5 pt-5 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Topics</p>
            <div className="flex flex-wrap gap-1.5">
              {repo.topics.map((topic: string) => (
                <span
                  key={topic}
                  className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-xs font-medium rounded-full border border-slate-200"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Contributors */}
        {topContributorsData.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4">Top Contributors</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topContributorsData} margin={{ bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  angle={-40}
                  textAnchor="end"
                  height={70}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                />
                <Bar dataKey="contributions" fill="#0f172a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Language Distribution */}
        {languageData.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4">Language Distribution</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={languageData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  dataKey="value"
                >
                  {languageData.map((_entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => `${(value / 1024).toFixed(0)} KB`}
                  contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* ── Commit Activity ── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
        <h3 className="text-base font-bold text-slate-900 mb-4">Commit Activity</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Total Commits</p>
            <p className="text-3xl font-bold text-slate-900">{commits.total?.toLocaleString()}</p>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Recent Commits</p>
            {commits.recent?.length > 0 ? (
              <ul className="space-y-1.5">
                {commits.recent.slice(0, 3).map((c: any, i: number) => (
                  <li key={i} className="text-sm text-slate-700 truncate">
                    <span className="text-slate-400 mr-1.5">›</span>
                    {c.commit.message.split('\n')[0]}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500">No recent commits</p>
            )}
          </div>
        </div>
      </div>

      {/* ── AI Insights ── */}
      <div className="space-y-4">
        {aiInsights.summary && (
          <div className="bg-white border border-green-200 rounded-2xl shadow-sm p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <div className="w-7 h-7 bg-green-50 border border-green-200 rounded-lg flex items-center justify-center">
                <Brain className="w-4 h-4 text-green-700" />
              </div>
              AI-Generated Summary
            </h3>
            <FormattedMarkdown content={aiInsights.summary} />
          </div>
        )}

        {aiInsights.onboarding_guide && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <div className="w-7 h-7 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center">
                <Code2 className="w-4 h-4 text-slate-700" />
              </div>
              Onboarding Guide
            </h3>
            <FormattedMarkdown content={aiInsights.onboarding_guide} />
          </div>
        )}
      </div>
    </div>
  );
}
