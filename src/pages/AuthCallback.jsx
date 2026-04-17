import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * AuthCallback Page
 * Path: /auth/callback
 * 
 * This component is the landing spot for OAuth redirects from the backend.
 * It extracts the JWT token from the URL, persists it in AuthContext,
 * and then redirects the user to the dashboard.
 */
export default function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithToken } = useAuth();
  const processed = useRef(false);

  useEffect(() => {
    // Avoid double-processing in StrictMode
    if (processed.current) return;
    processed.current = true;

    console.log('[AuthCallback] Page loaded. URL:', window.location.href);

    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (token) {
      console.log('[AuthCallback] Token detected in URL. Initiating login...');
      
      try {
        // Save token to state and localStorage
        loginWithToken(token);
        
        console.log('[AuthCallback] Login successful. Redirecting to dashboard...');
        
        // Final redirection
        navigate('/dashboard', { replace: true });
      } catch (err) {
        console.error('[AuthCallback] Failed to process token:', err.message);
        navigate('/login?error=token_invalid', { replace: true });
      }
    } else {
      console.warn('[AuthCallback] No token found in URL.');
      
      // Fallback: check if we ALREADY have a token in localStorage
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        console.log('[AuthCallback] Found existing token in storage. Redirecting...');
        navigate('/dashboard', { replace: true });
      } else {
        console.error('[AuthCallback] Missing authentication token. Redirecting to login.');
        navigate('/login?error=no_token', { replace: true });
      }
    }
  }, [location.search, loginWithToken, navigate]);

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      gap: '24px',
      background: '#fff'
    }}>
      <div style={{ fontSize: '48px' }} className="animate-pulse">🎁</div>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ marginBottom: '8px' }}>Authenticating...</h2>
        <p style={{ color: '#666' }}>Bringing you to your WishNest dashboard.</p>
      </div>
    </div>
  );
}
