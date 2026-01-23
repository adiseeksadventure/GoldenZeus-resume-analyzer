import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, CheckCircle, X, Loader2, ArrowRight } from 'lucide-react';
import { API_ENDPOINTS, getAuthHeaders } from './config';
import './ResumeUpload.css';

function ResumeUpload() {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, parsing, matching, success, error
  const [resumeId, setResumeId] = useState(null);
  const [parsedData, setParsedData] = useState(null);
  const [jdText, setJdText] = useState('');
  const [matchResult, setMatchResult] = useState(null);
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file) => {
    if (file.type === "application/pdf") {
      setFile(file);
      setUploadStatus('idle');
      setError('');
    } else {
      setError("Please upload a PDF file.");
    }
  };

  const onButtonClick = () => {
    inputRef.current.click();
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setUploadStatus('uploading');
    setError('');

    try {
      // Step 1: Upload resume
      const formData = new FormData();
      formData.append('resume', file);

      const uploadResponse = await fetch(API_ENDPOINTS.resume.upload, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData,
      });

      const uploadData = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(uploadData.message || 'Upload failed');
      }

      const newResumeId = uploadData.resumeId;
      setResumeId(newResumeId);

      // Step 2: Parse resume
      setUploadStatus('parsing');

      const parseResponse = await fetch(API_ENDPOINTS.resume.parse(newResumeId), {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
      });

      const parseData = await parseResponse.json();

      if (!parseResponse.ok) {
        throw new Error(parseData.message || 'Parsing failed');
      }

      setParsedData(parseData.data);
      setUploadStatus('success');

    } catch (err) {
      console.error('Upload/Parse error:', err);
      setError(err.message || 'An error occurred');
      setUploadStatus('error');
    }
  };

  const handleMatch = async () => {
    if (!jdText.trim() || !resumeId) {
      setError('Please enter a job description');
      return;
    }

    setUploadStatus('matching');
    setError('');

    try {
      const matchResponse = await fetch(API_ENDPOINTS.resume.match(resumeId), {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jdText }),
      });

      const matchData = await matchResponse.json();

      if (!matchResponse.ok) {
        throw new Error(matchData.message || 'Matching failed');
      }

      // Build a single analysisResult object for the scorecard (no hardcoded values)
      // Uses backend-provided scores only; no UI-only mock values.
      // ✅ USE BACKEND ANALYSIS AS-IS
      const analysisResult = matchData.analysisResult;
      setMatchResult(matchData);



      // Navigate to Results page with match data
      navigate('/results', {
        state: {
          analysisResult,
          matchResult: matchData,
          parsedData,
          jdTitle: matchData.parsedJD?.title || 'Job Position'
        }
      });

    } catch (err) {
      console.error('Match error:', err);
      setError(err.message || 'An error occurred during matching');
      setUploadStatus('success'); // Go back to success state
    }
  };

  const removeFile = () => {
    setFile(null);
    setUploadStatus('idle');
    setResumeId(null);
    setParsedData(null);
    setMatchResult(null);
    setError('');
    setJdText('');
  };

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="upload-container">
      <div className="upload-card">
        <div className="upload-header">
          <div className="icon-wrapper">
            <FileText size={32} />
          </div>
          <h1>Upload Your Resume</h1>
          <p>We'll analyze your skills and match you with the best jobs.</p>
          <button 
            onClick={logout}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              padding: '8px 16px',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '6px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Logout
          </button>
        </div>

        <div 
          className={`drop-zone ${dragActive ? 'drag-active' : ''} ${file ? 'has-file' : ''}`}
          onDragEnter={handleDrag} 
          onDragLeave={handleDrag} 
          onDragOver={handleDrag} 
          onDrop={handleDrop}
        >
          {!file ? (
            <div className="drop-content">
              <div className="upload-icon-circle">
                <Upload size={28} strokeWidth={1.5} />
              </div>
              <h3>Click or Drag & Drop to Upload</h3>
              <p>PDF formats only (Max 5MB)</p>
              <button className="select-file-btn" onClick={onButtonClick}>
                Browse Files
              </button>
            </div>
          ) : (
            <div className="file-preview">
              <div className="file-info">
                <FileText className="file-icon" size={24} />
                <div className="file-details">
                  <span className="file-name">{file.name}</span>
                  <span className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              </div>
              {uploadStatus !== 'uploading' && uploadStatus !== 'parsing' && (
                <button className="remove-btn" onClick={removeFile}>
                  <X size={20} />
                </button>
              )}
            </div>
          )}
          
          <input 
            ref={inputRef}
            type="file" 
            className="file-input" 
            accept=".pdf"
            onChange={handleChange} 
          />
        </div>

        {error && (
          <div style={{
            padding: '12px',
            marginTop: '16px',
            backgroundColor: '#fee',
            color: '#c00',
            borderRadius: '8px',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        {uploadStatus === 'uploading' && (
          <div className="upload-progress">
            <Loader2 className="animate-spin" size={24} />
            <span>Uploading your resume...</span>
          </div>
        )}

        {uploadStatus === 'parsing' && (
          <div className="upload-progress">
            <Loader2 className="animate-spin" size={24} />
            <span>Analyzing your resume with AI...</span>
          </div>
        )}

        {uploadStatus === 'matching' && (
          <div className="upload-progress">
            <Loader2 className="animate-spin" size={24} />
            <span>Matching with job description...</span>
          </div>
        )}

        {uploadStatus === 'success' && parsedData && (
          <div className="upload-success">
            <CheckCircle className="success-icon" size={32} />
            <div>
              <h3>Resume Parsed Successfully!</h3>
              <p>Found {parsedData.skills?.length || 0} skills, {parsedData.experience?.length || 0} experiences</p>
            </div>
          </div>
        )}

        {(uploadStatus === 'success') && parsedData && (
          <div style={{ marginTop: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              color: '#e0e0e0',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              Enter Job Description to Match:
            </label>
            <textarea
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder="Paste job description here..."
              style={{
                width: '100%',
                minHeight: '120px',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.05)',
                color: '#fff',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>
        )}

        {matchResult && (
          <div style={{
            marginTop: '24px',
            padding: '20px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <h3 style={{ 
              fontSize: '18px', 
              marginBottom: '16px',
              color: '#fff'
            }}>
              Match Results
            </h3>
            <div style={{ 
              fontSize: '48px', 
              fontWeight: 'bold',
              color: matchResult.score >= 70 ? '#4ade80' : matchResult.score >= 50 ? '#fbbf24' : '#f87171',
              marginBottom: '20px'
            }}>
              {matchResult.score}%
            </div>
            <div style={{ fontSize: '14px', color: '#a0a0a0' }}>
              <div style={{ marginBottom: '12px' }}>
                <strong>Required Skills:</strong> {matchResult.breakdown.required.score}%
                <div style={{ fontSize: '12px', marginTop: '4px' }}>
                  Matched: {matchResult.breakdown.required.matched.join(', ') || 'None'}
                </div>
                {matchResult.breakdown.required.missing.length > 0 && (
                  <div style={{ fontSize: '12px', marginTop: '4px', color: '#f87171' }}>
                    Missing: {matchResult.breakdown.required.missing.join(', ')}
                  </div>
                )}
              </div>
              <div style={{ marginBottom: '12px' }}>
                <strong>Preferred Skills:</strong> {matchResult.breakdown.preferred.score}%
              </div>
              <div style={{ marginBottom: '12px' }}>
                <strong>Project Relevance:</strong> {matchResult.breakdown.projectSemantic.score}%
              </div>
              {matchResult.breakdown.experiencePenalty > 0 && (
                <div style={{ color: '#fbbf24' }}>
                  <strong>Experience Penalty:</strong> -{matchResult.breakdown.experiencePenalty}%
                </div>
              )}
            </div>
          </div>
        )}

        <div className="actions">
          {!parsedData && (
            <button 
              className={`primary-btn ${!file || uploadStatus === 'uploading' || uploadStatus === 'parsing' ? 'disabled' : ''}`}
              onClick={handleUpload}
              disabled={!file || uploadStatus === 'uploading' || uploadStatus === 'parsing'}
            >
              {uploadStatus === 'uploading' ? 'Uploading...' : uploadStatus === 'parsing' ? 'Parsing...' : 'Analyze Resume'}
              {uploadStatus !== 'uploading' && uploadStatus !== 'parsing' && <ArrowRight size={18} />}
            </button>
          )}
          
          {parsedData && (
            <button 
              className={`primary-btn ${!jdText.trim() || uploadStatus === 'matching' ? 'disabled' : ''}`}
              onClick={handleMatch}
              disabled={!jdText.trim() || uploadStatus === 'matching'}
            >
              {uploadStatus === 'matching' ? 'Matching...' : 'Match with JD'}
              {uploadStatus !== 'matching' && <ArrowRight size={18} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResumeUpload;
