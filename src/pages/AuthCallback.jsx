import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

/**
 * AuthCallback Page
 * Path: /auth/callback
 * 
 * This component is the landing spot for OAuth redirects from the backend.
 * It extracts the JWT token from the URL, persists it in AuthContext,
 * then fetches the authoritative profile from the API and redirects.
 */
export default function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithToken, updateUser, setIsTransitioning } = useAuth();
  const processed = useRef(false);

  useEffect(() => {
    // Avoid double-processing in StrictMode
    if (processed.current) return;
    processed.current = true;

    console.log('[AuthCallback] Page loaded. URL:', window.location.href);

    const doAuth = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');

      if (token) {
        console.log('[AuthCallback] Token detected in URL. Initiating login...');
        try {
          // Block navigation transitions across the app
          setIsTransitioning(true);

          // AGGRESSIVE CLEANUP: Wipe all traces of previous session (Guest or User)
          console.log('[AuthCallback] Wiping previous session before applying new token...');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('authType');
          localStorage.removeItem('wishlists');

          // Save token to state and localStorage (decoded from JWT initially)
          loginWithToken(token);

          // Try to fetch authoritative profile from server (helps session/cookie flows)
          let finalUser = null;
          try {
            const profileRes = await api.get('/auth/profile', {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (profileRes?.data?.user) {
              finalUser = profileRes.data.user;
              // Persist the authoritative server-side user
              updateUser(finalUser);
              console.log('[AuthCallback] Profile fetched and applied from API.');
            }
          } catch (profileErr) {
            console.warn('[AuthCallback] Failed to fetch profile after token login:', profileErr?.message);
          }

          // Also fetch the user's wishlists so dashboard can show them immediately
          try {
            const wlRes = await api.get('/wishlists', {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (wlRes?.data) {
              localStorage.setItem('wishlists', JSON.stringify(wlRes.data));
              console.log('[AuthCallback] Wishlists fetched and pre-loaded into storage.');
            }
          } catch (wlErr) {
            console.warn('[AuthCallback] Failed to fetch wishlists during callback:', wlErr?.message);
          }

          console.log('[AuthCallback] Login flow complete. Navigating to dashboard...');
          
          // Final redirection
          navigate('/dashboard', { replace: true });

          // Keep transitioning=true for a short bit to allow Dashboard to mount and see the updated state
          setTimeout(() => {
            setIsTransitioning(false);
          }, 400);

        } catch (err) {
          console.error('[AuthCallback] Failed to process token:', err.message);
          setIsTransitioning(false);
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
