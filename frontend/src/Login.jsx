import { useState } from 'react';   
import { useNavigate, Link } from 'react-router-dom';   
import { API_ENDPOINTS } from './config';   
 
function Login() {   
  const [showPassword, setShowPassword] = useState(false);   
  const [email, setEmail] = useState('');   
  const [password, setPassword] = useState('');   
  const [loading, setLoading] = useState(false);   
  const [error, setError] = useState('');   
  const navigate = useNavigate();   
 
  const handleLogin = async (e) => {   
    e.preventDefault();   
    setLoading(true);   
    setError('');   
 
    try {   
      const response = await fetch(API_ENDPOINTS.auth.login, {   
        method: 'POST',   
        headers: {   
          'Content-Type': 'application/json',   
        },   
        body: JSON.stringify({ email, password }),   
      });   
 
      const data = await response.json();   
 
      if (!response.ok) {   
        throw new Error(data.message || 'Login failed');   
      }   
 
      // Store token   
      localStorage.setItem('token', data.token);   
         
      // Navigate to upload page   
      navigate('/upload');   
    } catch (err) {   
      setError(err.message || 'An error occurred during login');   
    } finally {   
      setLoading(false);   
    }   
  };   
 
  return (   
    <div className="login-container">   

      {/* Two-column layout wrapper */}
      <div className="login-layout">

        {/* LEFT: System Identity */}
        <div className="system-identity">
          <div className="gz-title">GoldenZeus</div>
          <div className="gz-subtitle">AI Resume Intelligence Engine</div>
        </div>

        {/* RIGHT: Login Card */}
        <div className="login-card">   
          <div className="login-header">   
            <h1>Welcome Back</h1>   
            <p>Log in to continue your job journey</p>   
          </div>   
             
          <form className="login-form" onSubmit={handleLogin}>   
            {error && (   
              <div style={{   
                padding: '12px',   
                marginBottom: '16px',   
                backgroundColor: '#fee',   
                color: '#c00',   
                borderRadius: '8px',   
                fontSize: '14px'   
              }}>   
                {error}   
              </div>   
            )}   
               
            <div className="form-group">   
              <label htmlFor="email">Email Address</label>   
              <input    
                type="email"    
                id="email"    
                placeholder="you@example.com"   
                value={email}   
                onChange={(e) => setEmail(e.target.value)}   
                required    
              />   
            </div>   
               
            <div className="form-group">   
              <label htmlFor="password">Password</label>   
              <div className="password-input-wrapper">   
                <input    
                  type={showPassword ? "text" : "password"}    
                  id="password"    
                  placeholder="Enter your password"   
                  value={password}   
                  onChange={(e) => setPassword(e.target.value)}   
                  required    
                />   
                <button    
                  type="button"    
                  className="toggle-password"   
                  onClick={() => setShowPassword(!showPassword)}   
                  aria-label={showPassword ? "Hide password" : "Show password"}   
                >   
                  {showPassword ? (   
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">   
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M1 1l22 22"/>   
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>   
                    </svg>   
                  ) : (   
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">   
                      <path d="M1 12s4-8 11-8 11 8 11 8 11 8-4 8-11 8-11-8-11-8z"/>   
                      <circle cx="12" cy="12" r="3"/>   
                    </svg>   
                  )}   
                </button>   
              </div>   
            </div>   
   
            <button type="submit" className="login-btn" disabled={loading}>   
              {loading ? 'Logging in...' : 'Log In'}   
            </button>   
          </form>   
   
          <div className="login-footer">   
            <p>Don't have an account? <Link to="/register">Sign up</Link></p>   
          </div>   
        </div>   

      </div>
    </div>   
  );   
}   
 
export default Login;

