import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

const normalizeUser = (nextUser, authType) => (
  nextUser
    ? {
        ...nextUser,
        isGuest: authType === 'guest' || nextUser.isGuest || nextUser.role === 'guest',
      }
    : nextUser
);

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const clearAuth = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('authType');
  }, []);

  const persistAuth = useCallback((nextToken, nextUser, authType) => {
    const normalizedUser = normalizeUser(nextUser, authType);

    setToken(nextToken);
    setUser(normalizedUser);
    localStorage.setItem('token', nextToken);
    localStorage.setItem('user', JSON.stringify(normalizedUser));

    if (authType) {
      localStorage.setItem('authType', authType);
    } else {
      localStorage.removeItem('authType');
    }
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      // 1. Check URL for token (Google OAuth redirect)
      const params = new URLSearchParams(window.location.search);
      const urlToken = params.get('token');

      if (urlToken) {
        console.log('AuthContext — token detected in URL, persisting...');
        localStorage.setItem('token', urlToken);
        // Clean URL to prevent re-processing
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      const storedAuthType = localStorage.getItem('authType');

      console.log('Token:', storedToken);
      console.log('User:', storedUser ? JSON.parse(storedUser) : null);

      if (!storedToken) {
        clearAuth();
        setLoading(false);
        return;
      }

      if (storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } else {
        setToken(storedToken);
      }

      try {
        const response = await api.get('/auth/profile', {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

        if (!response.data?.user) {
          clearAuth();
        } else {
          persistAuth(
            storedToken,
            response.data.user,
            storedAuthType || (response.data.user.role === 'guest' ? 'guest' : undefined)
          );
        }
      } catch (error) {
        console.error('Fetch profile error:', error);

        if (error?.response?.status === 401) {
          // Explicit rejection from the server — token is invalid/expired.
          clearAuth();
        } else if (storedUser) {
          // Server unreachable but we have a cached user — keep them logged in.
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        } else {
          // No cached user — try to decode the JWT as a last resort.
          // IMPORTANT: check expiry so stale tokens don't create phantom sessions.
          try {
            const payload = JSON.parse(atob(storedToken.split('.')[1]));
            const nowSec = Math.floor(Date.now() / 1000);
            if (payload.exp && payload.exp < nowSec) {
              // Token is expired — clear everything so the user can log in again.
              clearAuth();
            } else {
              const basicUser = {
                id:      payload.id,
                name:    payload.name  || 'User',
                email:   payload.email || '',
                isGuest: false,
              };
              persistAuth(storedToken, basicUser);
            }
          } catch {
            // JWT decode failed — token is malformed, clear everything.
            clearAuth();
          }
        }
      }

      setLoading(false);
    };

    fetchProfile();
  }, [clearAuth, persistAuth]);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      persistAuth(response.data.token, response.data.user);
      return response.data.user;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const signup = async (name, email, password) => {
    try {
      const response = await api.post('/auth/register', { name, email, password });
      persistAuth(response.data.token, response.data.user);
      return response.data.user;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const loginAsGuest = async () => {
    try {
      const response = await api.post('/auth/guest');
      persistAuth(response.data.token, response.data.user, 'guest');
      return response.data.user;
    } catch (error) {
      console.error('Guest login error:', error);
      throw new Error(error.response?.data?.message || 'Guest login failed');
    }
  };

  /**
   * loginWithToken — called by the OAuth callback page (/auth-success).
   * Accepts a real JWT issued by the backend, decodes the payload to
   * extract basic user info, then stores everything in state + localStorage.
   */
  const loginWithToken = (jwtToken) => {
    try {
      // JWT payload is the middle base64 segment
      const payload = JSON.parse(atob(jwtToken.split('.')[1]));
      const oauthUser = {
        id:      payload.id,
        name:    payload.name  || 'User',
        email:   payload.email || '',
        isGuest: false,
      };
      persistAuth(jwtToken, oauthUser);
    } catch (err) {
      console.error('loginWithToken — failed to decode JWT:', err.message);
    }
  };

  const logout = () => {
    clearAuth();
  };

  const updateUser = (nextUser) => {
    const authType = nextUser?.role === 'guest' || nextUser?.isGuest ? 'guest' : undefined;
    const normalizedUser = normalizeUser(nextUser, authType);
    setUser(normalizedUser);
    localStorage.setItem('user', JSON.stringify(normalizedUser));
  };

  const value = {
    user,
    token,
    loading,
    login,
    signup,
    loginAsGuest,
    loginWithToken,
    updateUser,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
