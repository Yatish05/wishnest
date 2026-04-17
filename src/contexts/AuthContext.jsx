import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

const safeBase64Decode = (str) => {
  try {
    if (!str) return null;
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
      console.error('[AuthContext] Initial user parse failed', e);
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('token');
    } catch (e) {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  // Storage helpers to prevent Safari SecurityErrors
  const safeSetItem = (key, val) => {
    try { 
      if (val === null || val === undefined) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, val); 
      }
    } catch (e) { 
      console.warn('[AuthContext] Storage set blocked', e); 
    }
  };

  const safeRemoveItem = (key) => {
    try { localStorage.removeItem(key); } catch (e) { console.warn('[AuthContext] Storage remove blocked', e); }
  };

  const safeGetItem = (key) => {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  };

  const clearAuth = useCallback(() => {
    setToken(null);
    setUser(null);
    safeRemoveItem('token');
    safeRemoveItem('user');
    safeRemoveItem('authType');
  }, []);

  const persistAuth = useCallback((nextToken, nextUser, authType) => {
    const normalizedUser = normalizeUser(nextUser, authType);

    setToken(nextToken);
    setUser(normalizedUser);
    safeSetItem('token', nextToken);
    safeSetItem('user', JSON.stringify(normalizedUser));

    if (authType) {
      safeSetItem('authType', authType);
    } else {
      safeRemoveItem('authType');
    }
  }, []);

  useEffect(() => {
    let isSubscribed = true;

    const fetchProfile = async () => {
      const storedToken = safeGetItem('token');
      const storedUser = safeGetItem('user');
      const storedAuthType = safeGetItem('authType');

      if (!storedToken) {
        if (isSubscribed) {
          clearAuth();
          setLoading(false);
        }
        return;
      }

      // Initial local hydration
      if (storedUser && !user) {
        try {
          const parsed = JSON.parse(storedUser);
          if (isSubscribed) setUser(parsed);
        } catch (e) {
          console.error('[AuthContext] Local user hydration failed', e);
        }
      }

      try {
        const response = await api.get('/auth/profile', {
          headers: { Authorization: `Bearer ${storedToken}` },
        });

        if (isSubscribed) {
          if (response.data?.user) {
            persistAuth(
              storedToken,
              response.data.user,
              storedAuthType || (response.data.user.role === 'guest' ? 'guest' : undefined)
            );
          } else {
            clearAuth();
          }
        }
      } catch (error) {
        console.error('[AuthContext] Profile sync failed:', error.message);
        
        if (isSubscribed) {
          if (error?.response?.status === 401) {
            clearAuth();
          } else if (storedToken) {
            // Robust fallback for Safari compatibility and legacy tokens
            try {
              const decoded = safeBase64Decode(storedToken.split('.')[1]);
              if (decoded) {
                const payload = JSON.parse(decoded);
                const basicUser = {
                  id: payload.id,
                  name: payload.name || 'User',
                  email: payload.email || '',
                  isGuest: false,
                };
                persistAuth(storedToken, basicUser);
              } else {
                clearAuth();
              }
            } catch (jwtErr) {
              clearAuth();
            }
          }
        }
      } finally {
        if (isSubscribed) setLoading(false);
      }
    };

    fetchProfile();
    return () => { isSubscribed = false; };
  }, [clearAuth, persistAuth, token, user]); // Added user to deps to trigger re-sync if user is null but token exists

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

  const loginWithToken = (jwtToken) => {
    try {
      const decoded = safeBase64Decode(jwtToken.split('.')[1]);
      if (!decoded) throw new Error('JWT Decode failed');
      const payload = JSON.parse(decoded);
      const oauthUser = {
        id: payload.id,
        name: payload.name || 'User',
        email: payload.email || '',
        isGuest: false,
      };
      persistAuth(jwtToken, oauthUser);
    } catch (err) {
      console.error('loginWithToken failed:', err.message);
      setToken(jwtToken);
      safeSetItem('token', jwtToken);
    }
  };

  const logout = () => {
    clearAuth();
  };

  const updateUser = (nextUser) => {
    const authType = nextUser?.role === 'guest' || nextUser?.isGuest ? 'guest' : undefined;
    const normalizedUser = normalizeUser(nextUser, authType);
    setUser(normalizedUser);
    safeSetItem('user', JSON.stringify(normalizedUser));
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
