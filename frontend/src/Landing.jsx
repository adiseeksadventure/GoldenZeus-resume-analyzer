import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  FileText,
  ScanLine,
  ShieldCheck,
  Layers,
  ListChecks,
  Route,
  Upload,
  ClipboardList,
  Gauge,
} from 'lucide-react';
import './Landing.css';

const FEATURES = [
  {
    icon: ScanLine,
    title: 'AI resume parsing',
    body: 'We turn your PDF into structured data, pulling out skills, roles, durations, and project highlights automatically.',
  },
  {
    icon: Layers,
    title: 'Semantic job matching',
    body: 'Matching goes beyond keywords. We compare the meaning of your experience against what the role actually asks for.',
  },
  {
    icon: ShieldCheck,
    title: 'ATS compatibility score',
    body: 'See how well your resume passes through applicant tracking systems before a human ever reads it.',
  },
  {
    icon: Gauge,
    title: 'Category breakdown',
    body: 'Tone and style, content, structure, and skills are each scored on their own, so you know exactly where to focus.',
  },
  {
    icon: ListChecks,
    title: 'Missing skills, surfaced',
    body: 'We highlight the required skills you already have and the ones you still need for the role you want.',
  },
  {
    icon: Route,
    title: 'Improvement roadmap',
    body: 'Every report ends with concrete next steps, ranked so you can fix the highest impact items first.',
  },
];

const STEPS = [
  {
    icon: Upload,
    title: 'Upload your resume',
    body: 'Drop in a PDF. Our parser extracts your skills, experience, and projects in a few seconds.',
  },
  {
    icon: ClipboardList,
    title: 'Paste the job description',
    body: 'Add the role you are targeting. We read its requirements the same way a recruiter would.',
  },
  {
    icon: FileText,
    title: 'Read your scorecard',
    body: 'Get an overall match score, a category breakdown, your ATS rating, and a clear list of what to improve.',
  },
];

const STATS = [
  { value: '4', label: 'Categories scored' },
  { value: '100', label: 'Point match scale' },
  { value: 'ATS', label: 'Compatibility check' },
  { value: 'PDF', label: 'One file to start' },
];

// Static product preview (marketing only — not connected to any data)
function ScorePreview() {
  const arcPath = 'M 42.02 157.98 A 82 82 0 1 1 157.98 157.98';
  const arcLength = (270 / 360) * 2 * Math.PI * 82;
  const demo = 82;
  const offset = arcLength * (1 - demo / 100);

  return (
    <div className="preview-card" aria-hidden="true">
      <div className="preview-head">
        <span className="preview-dot" />
        <span className="preview-label">Sample scorecard</span>
        <span className="preview-tag">Senior Frontend Engineer</span>
      </div>

      <div className="preview-gauge">
        <svg viewBox="0 0 200 200" className="preview-svg">
          <path className="preview-track" d={arcPath} fill="none" />
          <path
            className="preview-fill"
            d={arcPath}
            fill="none"
            strokeDasharray={arcLength}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="preview-gauge-center">
          <span className="preview-num">82</span>
          <span className="preview-denom">out of 100</span>
        </div>
      </div>

      <div className="preview-rows">
        {[
          { name: 'Tone & Style', val: 88, tag: 'Strong', tier: 'strong' },
          { name: 'Content', val: 74, tag: 'Strong', tier: 'strong' },
          { name: 'Structure', val: 91, tag: 'Strong', tier: 'strong' },
          { name: 'Skills', val: 63, tag: 'Good start', tier: 'good' },
        ].map((r) => (
          <div className="preview-row" key={r.name}>
            <span className="preview-row-name">{r.name}</span>
            <span className={`preview-chip chip-${r.tier}`}>{r.tag}</span>
            <span className="preview-row-val">{r.val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing">
      {/* Top navigation */}
      <header className="lp-nav">
        <div className="lp-nav-inner">
          <Link to="/" className="lp-brand">
            <span className="lp-brand-mark">HM</span>
            <span className="lp-brand-name">HireMatch</span>
          </Link>

          <nav className="lp-nav-links">
            <a href="#how">How it works</a>
            <a href="#features">Features</a>
            <a href="#start">Get started</a>
          </nav>

          <div className="lp-nav-cta">
            <Link to="/login" className="lp-btn lp-btn-ghost">Log in</Link>
            <Link to="/register" className="lp-btn lp-btn-solid">
              Get started
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="lp-hero">
        <div className="lp-hero-grid">
          <div className="lp-hero-copy">
            <span className="lp-eyebrow">Resume Intelligence Engine</span>
            <h1 className="lp-title">
              See how your resume <span className="accent">matches</span> the job.
            </h1>
            <p className="lp-lead">
              HireMatch reads your resume, compares it against any job description,
              and returns a precise score along with the exact skills and fixes that
              move you closer to an interview.
            </p>
            <div className="lp-hero-actions">
              <button className="lp-btn lp-btn-solid lp-btn-lg" onClick={() => navigate('/register')}>
                Analyze my resume
                <ArrowRight size={18} />
              </button>
              <button className="lp-btn lp-btn-line lp-btn-lg" onClick={() => navigate('/login')}>
                Log in
              </button>
            </div>
            <p className="lp-hero-note">
              No credit card required. Upload a PDF and get your first scorecard in
              under a minute.
            </p>
          </div>

          <div className="lp-hero-visual">
            <ScorePreview />
            <p className="lp-preview-note">
              Example preview. Your real scorecard is built from the resume you
              upload and the job description you paste.
            </p>
          </div>
        </div>

        {/* Stat band */}
        <div className="lp-stats">
          {STATS.map((s) => (
            <div className="lp-stat" key={s.label}>
              <span className="lp-stat-value">{s.value}</span>
              <span className="lp-stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="lp-section" id="how">
        <div className="lp-section-head">
          <span className="lp-kicker">How it works</span>
          <h2 className="lp-h2">Three steps from upload to insight.</h2>
          <p className="lp-sub">
            The whole flow is built to be fast. You bring the resume and the role,
            and HireMatch handles the analysis.
          </p>
        </div>

        <div className="lp-steps">
          {STEPS.map((step, i) => (
            <div className="lp-step" key={step.title}>
              <div className="lp-step-top">
                <span className="lp-step-num">{String(i + 1).padStart(2, '0')}</span>
                <step.icon size={22} className="lp-step-icon" />
              </div>
              <h3 className="lp-step-title">{step.title}</h3>
              <p className="lp-step-body">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="lp-section" id="features">
        <div className="lp-section-head">
          <span className="lp-kicker">What you get</span>
          <h2 className="lp-h2">Everything you need to read between the lines.</h2>
          <p className="lp-sub">
            Each report is built from several independent signals, so the feedback is
            specific enough to act on rather than vague advice you have heard before.
          </p>
        </div>

        <div className="lp-features">
          {FEATURES.map((f) => (
            <article className="lp-feature" key={f.title}>
              <div className="lp-feature-icon">
                <f.icon size={20} />
              </div>
              <h3 className="lp-feature-title">{f.title}</h3>
              <p className="lp-feature-body">{f.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* CTA band */}
      <section className="lp-cta" id="start">
        <div className="lp-cta-inner">
          <span className="lp-kicker">Ready when you are</span>
          <h2 className="lp-cta-title">
            Stop guessing. Start <span className="accent">matching</span>.
          </h2>
          <p className="lp-cta-sub">
            Upload your resume, paste a job description, and get a full breakdown of
            where you stand and what to fix next.
          </p>
          <button className="lp-btn lp-btn-solid lp-btn-lg" onClick={() => navigate('/register')}>
            Get started for free
            <ArrowUpRight size={18} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="lp-footer">
        <div className="lp-footer-inner">
          <div className="lp-brand">
            <span className="lp-brand-mark">HM</span>
            <span className="lp-brand-name">HireMatch</span>
          </div>
          <nav className="lp-footer-links">
            <a href="#how">How it works</a>
            <a href="#features">Features</a>
            <Link to="/login">Log in</Link>
            <Link to="/register">Get started</Link>
          </nav>
          <p className="lp-footer-copy">© 2026 HireMatch. Built for people who apply on purpose.</p>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
