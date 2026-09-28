import { useState } from 'react';

export default function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('admin@analytics.com');
  const [password, setPassword] = useState('••••••••');
  const [name, setName] = useState('Sudesh S');
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin({
      name: isRegister ? name : 'Sudesh S',
      email: email || 'admin@analytics.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    });
  };

  const handleDemoLogin = () => {
    onLogin({
      name: 'Sudesh S',
      email: 'sudesh@analytics.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    });
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Brand Header */}
        <div className="login-brand">
          <div className="icon-rail-logo" style={{ marginBottom: 0 }}>N</div>
          <div>
            <div className="brand-title">Analitycs</div>
            <div className="brand-sub">Business Intelligence Platform</div>
          </div>
        </div>

        <div className="login-title">
          {isRegister ? 'Create your account' : 'Welcome back'}
        </div>
        <div className="login-subtitle">
          {isRegister
            ? 'Enter your details to register for full dashboard access'
            : 'Enter your credentials to access your analytics workspace'}
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {isRegister && (
            <div className="login-field">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Sudesh S"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="login-field">
            <label>Email Address</label>
            <input
              type="email"
              placeholder="admin@analytics.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="login-field">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="login-options">
            <label className="remember-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember me</span>
            </label>
            {!isRegister && (
              <a href="#forgot" className="forgot-link" onClick={(e) => e.preventDefault()}>
                Forgot password?
              </a>
            )}
          </div>

          <button type="submit" className="login-btn">
            {isRegister ? 'Create Account' : 'Sign In to Dashboard'}
          </button>
        </form>

        <div className="login-divider">
          <span>OR</span>
        </div>

        <button type="button" className="demo-btn" onClick={handleDemoLogin}>
          ⚡ 1-Click Demo Login
        </button>

        <div className="login-footer-toggle">
          {isRegister ? (
            <span>
              Already have an account?{' '}
              <button type="button" onClick={() => setIsRegister(false)}>
                Sign In
              </button>
            </span>
          ) : (
            <span>
              Don't have an account?{' '}
              <button type="button" onClick={() => setIsRegister(true)}>
                Register Now
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
