
import { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, 
  CheckCircle, 
  AlertCircle, 
  ChevronDown, 
  LogOut,
  Target,
  Zap,
  Layout,
  ArrowRight
} from 'lucide-react';
import './Results.css';

// Analytical Semicircular Score Component - Deterministic Progress Gauge
const ScoreArc = ({ score }) => {
  const radius = 90; // Increased radius for larger arc diameter
  // Fixed semicircle path: starts at left (10, 100), ends at right (190, 100), opens downward (∩)
  const arcPath = "M 10 100 A 90 90 0 0 1 190 100";
  const totalLength = Math.PI * radius; // Circumference of semicircle
  
  // Validate and clamp score to 0-100 range
  const safeScore = Number.isFinite(score) && score >= 0 && score <= 100 
    ? Math.max(0, Math.min(100, score)) 
    : (score === null || score === undefined ? null : 0);
  
  // Calculate dashOffset: totalLength * (1 - score / 100)
  // score = 0 → dashOffset = totalLength (empty arc)
  // score = 50 → dashOffset = totalLength * 0.5 (half-filled)
  // score = 100 → dashOffset = 0 (full arc)
  const progressPercentage = safeScore !== null ? safeScore / 100 : 0;
  const dashOffset = totalLength * (1 - progressPercentage);

  const getArcColor = (s) => {
    // Use white/light colors for arc on gradient background
    if (s >= 70) return '#ffffff';
    if (s >= 50) return '#fbbf24';
    return '#f87171';
  };

  return (
    <div className="arc-container-center">
      <svg className="svg-score-arc" viewBox="0 0 200 100">
        {/* Background arc (full semicircle, always visible) */}
        <path
          className="arc-bg-path"
          d={arcPath}
          fill="none"
        />
        {/* Progress arc (fills based on score using stroke-dashoffset) */}
        <path
          className="arc-fill-path"
          d={arcPath}
          stroke={getArcColor(safeScore ?? 0)}
          strokeDasharray={totalLength}
          strokeDashoffset={dashOffset}
          fill="none"
        />
      </svg>
    </div>
  );
};

function Results() {
  const navigate = useNavigate();
  const location = useLocation();
  const { analysisResult, parsedData, jdTitle } = location.state || {};

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const [expandedSections, setExpandedSections] = useState({
    required: false,
    projects: false,
    roadmap: false
  });

  const hasRequiredInputs = Boolean(parsedData && Object.keys(parsedData).length);
  const hasAnalysisResult = Boolean(analysisResult);


  // Empty state (missing analysis) — do not reuse stale values
  if (!hasRequiredInputs || !hasAnalysisResult) {
    return (
      <div className="results-container">
        <nav className="results-nav">
          <div className="nav-left">
            <button className="back-btn" onClick={() => navigate('/upload')}>
              <ArrowLeft size={16} />
              Back to Upload
            </button>
            <span className="nav-breadcrumb">Evaluation Report / Scorecard</span>
          </div>
          <div className="nav-right" />
        </nav>
        <div className="results-layout">
          <main className="analysis-col">
            <section className="overall-score-section">
              <div className="score-subtitle">No analysis to display</div>
              <p className="score-exp-text">Run a new resume + job description match to generate a scorecard.</p>
            </section>
          </main>
        </div>
      </div>
    );
  }


  // Safe Extraction
  const meta = analysisResult.breakdownMeta || {};
  const required = meta.required || { score: 0, matched: [], missing: [] };
  const projectSemantic = meta.projectSemantic || { score: 0, relevantProjects: [] };

  const breakdown = analysisResult.breakdown || {
    tone: 0,
    content: 0,
    structure: 0,
    skills: 0
  };

  // Scorecard binding (single source of truth)
  const overallScore = analysisResult.overallScore ?? 0;
  const toneScore = breakdown.tone;
  const contentScore = breakdown.content;
  const structureScore = breakdown.structure;
  const skillsScore = breakdown.skills;


  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getQualitativeTag = (score) => {
    if (score >= 70) return <span className="qual-tag t-strong">Strong</span>;
    if (score >= 50) return <span className="qual-tag t-good">Good Start</span>;
    return <span className="qual-tag t-needs">Needs work</span>;
  };



  return (
    <div className="results-container">
      {/* Top Nav */}
      <nav className="results-nav">
        <div className="nav-left">
          <button className="back-btn" onClick={() => navigate('/upload')}>
            <ArrowLeft size={16} />
            Back to Upload
          </button>
          <span className="nav-breadcrumb">
            {jdTitle || 'Evaluation Report'} / Scorecard
          </span>
        </div>
        <div className="nav-right">
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </nav>

      {/* Main Layout - 2 Columns */}
      <div className="results-layout">
        
        {/* Left Column: Resume Preview (Static Context) */}
        <aside className="resume-preview-col">
          <div className="doc-preview-card">
            <div className="doc-inner">
              <div className="doc-section">
                <h1 className="doc-name">{parsedData.name || 'Your Profile'}</h1>
                <p className="doc-contact">{parsedData.email} • {parsedData.phone}</p>
              </div>

              <div className="doc-section">
                <h3 className="doc-section-h">Professional Summary</h3>
                <div className="doc-exp-item">
                  {parsedData.experience?.length > 0 ? (
                    parsedData.experience.map((exp, i) => (
                      <div key={i} style={{ marginBottom: '16px' }}>
                        <p className="doc-role">{exp.role}</p>
                        <p className="doc-comp-dur">{exp.company} • {exp.duration}</p>
                      </div>
                    ))
                  ) : (
                    <p className="doc-no-data">No experience data available.</p>
                  )}
                </div>
              </div>

              <div className="doc-section">
                <h3 className="doc-section-h">Core Competencies</h3>
                <div className="doc-skills-wrap">
                  {parsedData.skills?.map((skill, i) => (
                    <span key={i} className="doc-skill-pill">{skill}</span>
                  ))}
                </div>
              </div>

              {parsedData.projects?.length > 0 && (
                <div className="doc-section">
                  <h3 className="doc-section-h">Project Highlights</h3>
                  {parsedData.projects.slice(0, 3).map((proj, i) => (
                    <div key={i} className="doc-exp-item">
                      <p className="doc-role">{proj.title}</p>
                      <p className="doc-proj-desc">
                        {proj.description?.substring(0, 100)}...
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Right Column: Analysis & Scoring (Core Focus) */}
        <main className="analysis-col">
          
          {/* Section 1: Overall Resume Score */}
          <section className="overall-score-section">
            <ScoreArc score={overallScore} />
            <div className="score-number-container">
              <div className="score-number">{overallScore ?? '--'} / 100</div>
            </div>
            <h2 className="score-subtitle">Your Resume Score</h2>
            <p className="score-exp-text">This score is calculated based on the variables listed below.</p>
          </section>

          {/* Section 2: Category Scores List */}
          <section className="category-list-section">
            <div className="cat-row">
              <div className="cat-name-box">
                <span className="cat-name">Tone & Style</span>
              </div>
              <div className="cat-tag-column">
                {getQualitativeTag(toneScore)}
              </div>
              <div className="cat-score-val">{toneScore} <span>/ 100</span></div>
            </div>
            <div className="cat-row">
              <div className="cat-name-box">
                <span className="cat-name">Content</span>
              </div>
              <div className="cat-tag-column">
                {getQualitativeTag(contentScore)}
              </div>
              <div className="cat-score-val">{contentScore} <span>/ 100</span></div>
            </div>
            <div className="cat-row">
              <div className="cat-name-box">
                <span className="cat-name">Structure</span>
              </div>
              <div className="cat-tag-column">
                {getQualitativeTag(structureScore)}
              </div>
              <div className="cat-score-val">{structureScore} <span>/ 100</span></div>
            </div>
            <div className="cat-row">
              <div className="cat-name-box">
                <span className="cat-name">Skills</span>
              </div>
              <div className="cat-tag-column">
                {getQualitativeTag(skillsScore)}
              </div>
              <div className="cat-score-val">{skillsScore} <span>/ 100</span></div>
            </div>
          </section>

          {/* Section 3: ATS Compatibility Card */}
          <section className="ats-score-card">
            <div className="ats-header">
            <h3 className="ats-title">ATS Compatibility Score – {analysisResult.atsScore} / 100</h3>
            </div>
            <p className="ats-desc">
              How well does your resume pass through Applicant Tracking Systems? 
              Your document was analyzed for structural integrity and keyword alignment.
            </p>
            <div className="ats-checklist">
              <div className="ats-check-item">
                <CheckCircle size={14} className="icon-c-ok" /> Professional Formatting
              </div>
              <div className="ats-check-item">
                <CheckCircle size={14} className="icon-c-ok" /> Keyword Density
              </div>
              <div className="ats-check-item">
                <CheckCircle size={14} className="icon-c-ok" /> Standard AI-Readable Layout
              </div>
              <div className="ats-check-item">
                {required.missing?.length === 0 ? (
                  <><CheckCircle size={14} className="icon-c-ok" /> Critical Skills Found</>
                ) : (
                  <><AlertCircle size={14} className="icon-c-warn" /> {required.missing.length} Skills Missing</>
                )}
              </div>
            </div>
          </section>

          {/* Section 4: Collapsible Analysis Panels */}
          <section className="analysis-panels">
            
            {/* Required Skills Panel */}
            <div className="acc-item">
              <button className="acc-trigger" onClick={() => toggleSection('required')}>
                <div className="acc-title-group">
                  <Target size={18} className="acc-icon-s" />
                  <span>Required Skills Breakdown</span>
                </div>
                <ChevronDown size={18} style={{ transform: expandedSections.required ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
              </button>
              {expandedSections.required && (
                <div className="acc-content">
                  <p className="acc-inner-text">Based on the provided job description, we found the following skills:</p>
                  <div className="acc-skills-box">
                    {required.matched?.map((s, i) => <span key={i} className="acc-skill-p p-match">{s}</span>)}
                    {required.missing?.map((s, i) => <span key={i} className="acc-skill-p p-miss">{s}</span>)}
                  </div>
                </div>
              )}
            </div>

            {/* Project Semantic Insights Panel */}
            <div className="acc-item">
              <button className="acc-trigger" onClick={() => toggleSection('projects')}>
                <div className="acc-title-group">
                  <Zap size={18} className="acc-icon-s" />
                  <span>Project Semantic Insights</span>
                </div>
                <ChevronDown size={18} style={{ transform: expandedSections.projects ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
              </button>
              {expandedSections.projects && (
                <div className="acc-content">
                  <p className="acc-inner-text">
                    Your projects demonstrate a <b>{projectSemantic.score}%</b> semantic alignment with the role's core responsibilities. 
                    {projectSemantic.relevantProjects?.length > 0 && ` We identified ${projectSemantic.relevantProjects.length} projects with high relevance.`}
                  </p>
                </div>
              )}
            </div>

            {/* Improvement Roadmap Panel */}
            <div className="acc-item">
              <button className="acc-trigger" onClick={() => toggleSection('roadmap')}>
                <div className="acc-title-group">
                  <Layout size={18} className="acc-icon-s" />
                  <span>Improvement Roadmap</span>
                </div>
                <ChevronDown size={18} style={{ transform: expandedSections.roadmap ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
              </button>
              {expandedSections.roadmap && (
                <div className="acc-content">
                  <ul className="roadmap-list">
                    {required.missing?.length > 0 && (
                      <li className="roadmap-item">
                        <ArrowRight size={14} style={{ marginTop: '2px' }} />
                        <span>Add <b>{required.missing.slice(0, 3).join(', ')}</b> to your skills section.</span>
                      </li>
                    )}
                    {projectSemantic.score < 70 && (
                      <li className="roadmap-item">
                        <ArrowRight size={14} style={{ marginTop: '2px' }} />
                        <span>Clarify the outcomes of your projects to better match job keywords.</span>
                      </li>
                    )}
                    <li className="roadmap-item">
                      <ArrowRight size={14} style={{ marginTop: '2px' }} />
                      <span>Ensure your experience bullet points start with strong action verbs.</span>
                    </li>
                  </ul>
                </div>
              )}
            </div>

          </section>

        </main>
      </div>
    </div>
  );
}

export default Results;
