import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Github,
  Zap,
  TrendingUp,
  GitCompare,
  Brain,
  Shield,
  BarChart3,
  Star,
  GitFork,
  Users,
  ArrowRight,
  Code2,
  FileText,
  ChevronDown,
  CheckCircle2,
} from 'lucide-react';

/* ── count-up hook ── */
function useCountUp(target: number, duration = 1600, start = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      setValue(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return value;
}

function StatCard({
  value,
  label,
  suffix = '',
  inView,
}: {
  value: number;
  label: string;
  suffix?: string;
  inView: boolean;
}) {
  const count = useCountUp(value, 1600, inView);
  return (
    <div className="landing-stat-card">
      <span className="landing-stat-number">
        {count.toLocaleString()}
        {suffix}
      </span>
      <span className="landing-stat-label">{label}</span>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  iconClass,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  iconClass: string;
}) {
  return (
    <div className="landing-feature-card">
      <div className={`landing-feature-icon ${iconClass}`}>{icon}</div>
      <h3 className="landing-feature-title">{title}</h3>
      <p className="landing-feature-desc">{description}</p>
    </div>
  );
}

export function LandingPage() {
  const navigate = useNavigate();
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsInView, setStatsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setStatsInView(true);
      },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: <Brain className="w-5 h-5" />,
      title: 'AI-Powered Insights',
      description:
        'Gemini AI generates in-depth project summaries, onboarding guides, and strategic recommendations.',
      iconClass: 'feat-green',
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      title: 'Trending Repositories',
      description:
        'Discover the hottest GitHub repos across languages and time ranges in real-time.',
      iconClass: 'feat-sky',
    },
    {
      icon: <GitCompare className="w-5 h-5" />,
      title: 'Side-by-Side Comparison',
      description:
        'Compare any two repositories across stars, forks, commits, languages, and contributors.',
      iconClass: 'feat-orange',
    },
    {
      icon: <BarChart3 className="w-5 h-5" />,
      title: 'Deep Analytics',
      description:
        'Visualize commit history, contributor activity, language distribution, and release cadence.',
      iconClass: 'feat-teal',
    },
    {
      icon: <FileText className="w-5 h-5" />,
      title: 'PDF Export',
      description:
        'Export any analysis as a polished PDF report to share with your team effortlessly.',
      iconClass: 'feat-red',
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: 'Secure & Private',
      description:
        'JWT authentication keeps your analysis history private and secure at all times.',
      iconClass: 'feat-slate',
    },
  ];

  const steps = [
    {
      num: '01',
      icon: <Code2 className="w-5 h-5" />,
      title: 'Enter a Repository',
      desc: 'Paste any GitHub owner/repo name into the search bar.',
    },
    {
      num: '02',
      icon: <Zap className="w-5 h-5" />,
      title: 'Instant Analysis',
      desc: 'Our engine fetches data and Gemini AI generates insights in seconds.',
    },
    {
      num: '03',
      icon: <CheckCircle2 className="w-5 h-5" />,
      title: 'Explore & Export',
      desc: 'Browse charts, compare repos, and export a polished PDF report.',
    },
  ];

  return (
    <div className="landing-root">
      {/* ══════════════════════ HERO ══════════════════════ */}
      <section className="landing-hero">
        <div className="landing-container">
          {/* Badge */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.75rem' }}>
            <span className="landing-badge">
              <Github style={{ width: 14, height: 14 }} />
              Powered by Google Gemini AI &amp; GitHub API
            </span>
          </div>

          <h1 className="landing-hero-title">
            Analyze Any GitHub Repo
            <br />
            With{' '}
            <span className="landing-accent-text">AI-Powered Intelligence</span>
          </h1>

          <p className="landing-hero-sub">
            Uncover trends, compare projects, and generate professional reports — all
            from a single, beautifully designed dashboard.
          </p>

          {/* CTA buttons — centered */}
          <div className="landing-hero-cta">
            <button
              id="get-started-btn"
              className="landing-btn-primary"
              onClick={() => navigate('/signup')}
            >
              Get Started Free
              <ArrowRight style={{ width: 18, height: 18 }} />
            </button>
            <button
              id="sign-in-btn"
              className="landing-btn-ghost"
              onClick={() => navigate('/login')}
            >
              Sign In
            </button>
          </div>

          {/* Example repo pills */}
          <div className="landing-preview-pills">
            {['torvalds/linux', 'microsoft/vscode', 'facebook/react'].map((r) => (
              <span key={r} className="landing-pill">
                <Github style={{ width: 13, height: 13 }} />
                {r}
              </span>
            ))}
          </div>

          {/* Scroll cue */}
          <a href="#features" className="landing-scroll-cue">
            <ChevronDown style={{ width: 20, height: 20 }} className="animate-bounce" />
          </a>
        </div>
      </section>

      {/* ══════════════════════ STATS ══════════════════════ */}
      <section className="landing-stats-section" ref={statsRef}>
        <div className="landing-container">
          <div className="landing-stats-grid">
            <StatCard value={50000} label="Repos Analyzed" suffix="+" inView={statsInView} />
            <StatCard value={12000} label="Active Users" suffix="+" inView={statsInView} />
            <StatCard value={98} label="Accuracy Score" suffix="%" inView={statsInView} />
            <StatCard value={3} label="Seconds to Insight" suffix="s" inView={statsInView} />
          </div>
        </div>
      </section>

      {/* ══════════════════════ FEATURES ══════════════════════ */}
      <section id="features" className="landing-section">
        <div className="landing-container">
          <div className="landing-section-header">
            <span className="landing-section-tag">Everything You Need</span>
            <h2 className="landing-section-title">Built for Developers &amp; Teams</h2>
            <p className="landing-section-sub">
              From solo hackers to engineering leads, GitHub Intelligence gives you the
              context to make smart decisions — faster.
            </p>
          </div>
          <div className="landing-features-grid">
            {features.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      <hr className="landing-divider" />

      {/* ══════════════════════ HOW IT WORKS ══════════════════════ */}
      <section className="landing-section landing-section-alt">
        <div className="landing-container">
          <div className="landing-section-header">
            <span className="landing-section-tag">Simple Process</span>
            <h2 className="landing-section-title">How It Works</h2>
            <p className="landing-section-sub">
              Three simple steps to go from a repository URL to a full intelligence report.
            </p>
          </div>
          <div className="landing-steps-grid">
            {steps.map((s) => (
              <div key={s.num} className="landing-step">
                <div className="landing-step-num">{s.num}</div>
                <div className="landing-step-icon">{s.icon}</div>
                <h3 className="landing-step-title">{s.title}</h3>
                <p className="landing-step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="landing-divider" />

      {/* ══════════════════════ PREVIEW CARD ══════════════════════ */}
      <section className="landing-section">
        <div className="landing-container">
          <div className="landing-mock-wrapper">
            {/* Left — description */}
            <div>
              <span className="landing-section-tag">Live Preview</span>
              <h2 className="landing-section-title" style={{ textAlign: 'left' }}>
                Rich Analytics,
                <br />
                Beautiful Interface
              </h2>
              <p
                className="landing-section-sub"
                style={{ textAlign: 'left', margin: '0 0 0' }}
              >
                See stars, forks, commit history, top contributors, language breakdowns,
                and AI summaries — all on one screen.
              </p>
              <ul className="landing-mock-list">
                {[
                  { icon: <Star style={{ width: 15, height: 15, color: '#f59e0b' }} />, t: 'Star & Fork counts at a glance' },
                  { icon: <Users style={{ width: 15, height: 15, color: '#0369a1' }} />, t: 'Top contributor leaderboard' },
                  { icon: <GitFork style={{ width: 15, height: 15, color: '#0f766e' }} />, t: 'Release & commit cadence' },
                  { icon: <Brain style={{ width: 15, height: 15, color: '#15803d' }} />, t: 'Gemini AI narrative summary' },
                ].map(({ icon, t }) => (
                  <li key={t} className="landing-mock-list-item">
                    {icon}
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right — mock card */}
            <div className="landing-mock-card">
              {/* Header */}
              <div className="landing-mock-repo-header">
                <div className="landing-mock-repo-icon">
                  <Github style={{ width: 20, height: 20 }} />
                </div>
                <div>
                  <div className="landing-mock-repo-name">microsoft / vscode</div>
                  <div className="landing-mock-repo-desc">
                    The most popular code editor on GitHub
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="landing-mock-stats-row">
                {[
                  {
                    icon: <Star style={{ width: 14, height: 14, color: '#f59e0b' }} />,
                    val: '163k',
                    lbl: 'Stars',
                  },
                  {
                    icon: <GitFork style={{ width: 14, height: 14, color: '#0369a1' }} />,
                    val: '29k',
                    lbl: 'Forks',
                  },
                  {
                    icon: <Users style={{ width: 14, height: 14, color: '#15803d' }} />,
                    val: '1.9k',
                    lbl: 'Contributors',
                  },
                ].map(({ icon, val, lbl }) => (
                  <div key={lbl} className="landing-mock-stat">
                    {icon}
                    <span className="landing-mock-stat-val">{val}</span>
                    <span className="landing-mock-stat-lbl">{lbl}</span>
                  </div>
                ))}
              </div>

              {/* Languages */}
              <div>
                <div className="landing-mock-label">Languages</div>
                <div className="landing-mock-lang-bar">
                  <div
                    style={{ width: '62%', background: '#3b82f6', borderRadius: '4px 0 0 4px' }}
                    title="TypeScript 62%"
                  />
                  <div style={{ width: '18%', background: '#f59e0b' }} title="JavaScript 18%" />
                  <div style={{ width: '12%', background: '#10b981' }} title="CSS 12%" />
                  <div
                    style={{ width: '8%', background: '#94a3b8', borderRadius: '0 4px 4px 0' }}
                    title="Other 8%"
                  />
                </div>
                <div className="landing-mock-lang-labels">
                  {['TypeScript 62%', 'JavaScript 18%', 'CSS 12%', 'Other 8%'].map((l) => (
                    <span key={l} className="landing-mock-lang-label">
                      {l}
                    </span>
                  ))}
                </div>
              </div>

              {/* AI summary */}
              <div className="landing-mock-ai-box">
                <div className="landing-mock-ai-header">
                  <Brain style={{ width: 14, height: 14, color: '#15803d' }} />
                  <span className="landing-mock-ai-label">AI Summary</span>
                </div>
                <p className="landing-mock-ai-text">
                  "VS Code is a highly active, community-driven repository with consistent
                  commit velocity and an exceptional contributor network. The TypeScript-first
                  codebase ensures strong maintainability…"
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════ CTA ══════════════════════ */}
      <section className="landing-cta-section">
        <div className="landing-container">
          <div className="landing-cta-icon">
            <Github style={{ width: 26, height: 26 }} />
          </div>
          <h2 className="landing-cta-title">Ready to Gain GitHub Intelligence?</h2>
          <p className="landing-cta-sub">
            Join thousands of developers who use the dashboard to make faster, smarter
            decisions about the repos that matter.
          </p>
          <div className="landing-hero-cta" style={{ justifyContent: 'center' }}>
            <button
              id="cta-signup-btn"
              className="landing-cta-btn-primary"
              onClick={() => navigate('/signup')}
            >
              Create Free Account
              <ArrowRight style={{ width: 18, height: 18 }} />
            </button>
            <button
              id="cta-login-btn"
              className="landing-cta-btn-ghost"
              onClick={() => navigate('/login')}
            >
              Sign In
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
