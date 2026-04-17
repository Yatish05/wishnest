import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

const safeBase64Decode = (str) => {
  try {
    // Add padding if missing
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    return atob(base64);
  } catch (e) {
    console.error('[AuthContext] safeBase64Decode failed', e);
    return null;
  }
};

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
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
      console.error('[AuthContext] Initial parse failed', e);
      return null;
    }
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
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      const storedAuthType = localStorage.getItem('authType');

      console.log('[AuthContext] Syncing auth state. Token exists:', !!storedToken);

      if (!storedToken) {
        console.log('[AuthContext] No token. Clearing state.');
        clearAuth();
        setLoading(false);
        return;
      }

      // Initial local hydration
      if (storedUser && !user) {
        try {
          const parsed = JSON.parse(storedUser);
          console.log('[AuthContext] Hydrating from localStorage:', parsed.name);
          setUser(parsed);
        } catch (e) {
          console.error('[AuthContext] Local storage parse failed', e);
        }
      }

      try {
        console.log('[AuthContext] Fetching latest profile from server...');
        const response = await api.get('/auth/profile', {
          headers: { Authorization: `Bearer ${storedToken}` },
        });

        if (response.data?.user) {
          console.log('[AuthContext] Profile fetch success:', response.data.user.name);
          persistAuth(
            storedToken,
            response.data.user,
            storedAuthType || (response.data.user.role === 'guest' ? 'guest' : undefined)
          );
        } else {
          console.warn('[AuthContext] Profile fetch returned no user.');
          clearAuth();
        }
      } catch (error) {
        console.error('[AuthContext] Profile fetch failed:', error.response?.status || error.message);
        
        if (error?.response?.status === 401) {
          clearAuth();
        } else if (storedToken) {
          // Robust fallback for legacy or malformed tokens when server is unreachable or errored
          try {
            const decoded = safeBase64Decode(storedToken.split('.')[1]);
            if (!decoded) throw new Error('Decode returned null');
            const payload = JSON.parse(decoded);
            console.log('[AuthContext] Falling back to JWT decode for:', payload.name || 'User');
            const basicUser = {
              id: payload.id,
              name: payload.name || 'User',
              email: payload.email || '',
              isGuest: false,
            };
            persistAuth(storedToken, basicUser);
          } catch (jwtErr) {
            console.error('[AuthContext] JWT fallback decode failed:', jwtErr.message);
            clearAuth();
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [clearAuth, persistAuth, token]);

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
   * loginWithToken — called by the OAuth callback page (/auth/callback).
   * Accepts a real JWT issued by the backend, decodes the payload to
   * extract basic user info, then stores everything in state + localStorage.
   */
  const loginWithToken = (jwtToken) => {
    try {
      // JWT payload is the middle base64 segment
      const decoded = safeBase64Decode(jwtToken.split('.')[1]);
      if (!decoded) throw new Error('Decode returned null');
      const payload = JSON.parse(decoded);
      const oauthUser = {
        id: payload.id,
        name: payload.name || 'User',
        email: payload.email || '',
        isGuest: false,
      };
      persistAuth(jwtToken, oauthUser);
    } catch (err) {
      console.error('loginWithToken — failed to decode JWT:', err.message);
      // Fallback: Just trigger a profile fetch by setting the token
      setToken(jwtToken);
      localStorage.setItem('token', jwtToken);
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
      {children}
    </AuthContext.Provider>
  );
}
