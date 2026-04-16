import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Gift } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './AuthPage.css';

export default function AuthPage({ type }) {
  const isLogin = type === 'login';
  const { login, signup, loginAsGuest } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const oauthError = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(name, email, password);
      }
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    setError('');
    try {
      await loginAsGuest();
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Guest login error:', err);
      setError(err.message || 'Guest login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    console.log("Redirecting to Google...");
    window.location.href = `/api/auth/google`;
  };

  return (
    <div className="auth-container animate-fade-in">
      <div className="auth-card card">
        <div className="auth-header">
          <Link to="/" className="logo auth-logo">
            <Gift className="logo-icon" size={32} />
            WishNest
          </Link>
          <h2>{isLogin ? 'Welcome back' : 'Create an account'}</h2>
          <p>{isLogin ? 'Enter your details to access your account.' : 'Join WishNest to start creating and sharing.'}</p>
        </div>

        <div className="auth-social">
          <button
            type="button"
            className="btn btn-secondary social-btn"
            onClick={handleGoogleLogin}
            disabled={false}
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="social-icon" />
            Continue with Google
          </button>
          <button className="btn btn-secondary social-btn" type="button" onClick={handleGuestLogin}>
             Continue as Guest
          </button>
        </div>

        <div className="auth-divider">
          <span>or continue with email</span>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {oauthError === 'google_failed' && (
            <div className="auth-error">
              Google sign-in failed on the server. Check that MongoDB is connected and try again.
            </div>
          )}
          {error && <div className="auth-error">{error}</div>}
          {!isLogin && (
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" className="input-field" placeholder="John Doe" required value={name} onChange={e => setName(e.target.value)} disabled={isLoading} />
            </div>
          )}

          <div className="form-group">
            <label>Email address</label>
            <input type="email" className="input-field" placeholder="john@example.com" required value={email} onChange={e => setEmail(e.target.value)} disabled={isLoading} />
          </div>

          <div className="form-group">
            <div className="flex-between">
              <label>Password</label>
              {isLogin && <a href="#" className="forgot-link">Forgot password?</a>}
            </div>
            <input type="password" className="input-field" placeholder="••••••••" required value={password} onChange={e => setPassword(e.target.value)} disabled={isLoading} />
          </div>

          <button type="submit" className="btn btn-primary auth-submit" disabled={isLoading}>
            {isLoading ? 'Processing...' : (isLogin ? 'Log In' : 'Create Account')}
          </button>
        </form>

        <div className="auth-footer">
          {isLogin ? (
            <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
          ) : (
            <p>Already have an account? <Link to="/login">Log in</Link></p>
          )}
        </div>
      </div>
    </div>
  );
}
