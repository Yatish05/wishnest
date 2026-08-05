import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

/**
 * AuthCallback Page
 * Path: /auth/callback
 * 
 * Landing spot for OAuth redirects from the backend.
 * Checks for cookie-authenticated profile or URL token parameter.
 */
export default function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithToken, updateUser, setIsTransitioning } = useAuth();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    console.log('[AuthCallback] Page loaded. URL:', window.location.href);

    const doAuth = async () => {
      setIsTransitioning(true);

      // 1. Primary check: Try fetching profile authenticated via HttpOnly cookie
      try {
        const profileRes = await api.get('/auth/profile');
        if (profileRes?.data?.user) {
          console.log('[AuthCallback] Session verified via HttpOnly cookie.');
          updateUser(profileRes.data.user);

          const redirectTo = localStorage.getItem('postLoginRedirect');
          if (redirectTo) {
            localStorage.removeItem('postLoginRedirect');
            navigate(redirectTo, { replace: true });
          } else {
            navigate('/dashboard', { replace: true });
          }
          setTimeout(() => setIsTransitioning(false), 200);
          return;
        }
      } catch (cookieErr) {
        console.log('[AuthCallback] Cookie auth check status:', cookieErr?.message);
      }

      // 2. Fallback check: Look for token parameter in URL
      const params = new URLSearchParams(location.search);
      const token = params.get('token');

      if (token) {
        console.log('[AuthCallback] Token detected in URL parameter.');
        try {
          loginWithToken(token);
          try {
            const profileRes = await api.get('/auth/profile');
            if (profileRes?.data?.user) {
              updateUser(profileRes.data.user);
            }
          } catch {
            // ignore profile fetch error if token decode succeeded
          }
          
          const redirectTo = localStorage.getItem('postLoginRedirect');
          if (redirectTo) {
            localStorage.removeItem('postLoginRedirect');
            navigate(redirectTo, { replace: true });
          } else {
            navigate('/dashboard', { replace: true });
          }
          setTimeout(() => setIsTransitioning(false), 200);
          return;
        } catch (tokenErr) {
          console.error('[AuthCallback] Failed token processing:', tokenErr.message);
          setIsTransitioning(false);
          navigate('/login?error=token_invalid', { replace: true });
          return;
        }
      }

      console.error('[AuthCallback] No authenticated cookie or token parameter found.');
      setIsTransitioning(false);
      navigate('/login?error=no_token', { replace: true });
    };

    doAuth();
  }, [location.search, loginWithToken, navigate, updateUser, setIsTransitioning]);

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
