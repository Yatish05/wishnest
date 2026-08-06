import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

const safeBase64Decode = (str) => {
  try {
    if (!str) return null;
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    return atob(base64);
  } catch {
    return null;
  }
};

const normalizeUser = (nextUser, authType) => (
  nextUser
    ? {
      id: nextUser.id || (nextUser._id ? String(nextUser._id) : undefined),
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
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [syncKey, setSyncKey] = useState(Date.now());

  const safeSetItem = (key, val) => {
    try { 
      if (val === null || val === undefined) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, val); 
      }
    } catch { 
      // ignore storage errors
    }
  };

  const safeRemoveItem = (key) => {
    try { localStorage.removeItem(key); } catch { /* ignore storage errors */ }
  };

  const safeGetItem = (key) => {
    try { return localStorage.getItem(key); } catch { return null; }
  };

  const clearAuth = useCallback(() => {
    console.log('[AuthContext] Clearing auth state and session caches...');
    setUser(null);
    safeRemoveItem('token');
    safeRemoveItem('user');
    safeRemoveItem('authType');
    safeRemoveItem('wishlists');
    safeRemoveItem('notifications');
    safeRemoveItem('lastSync');
    setSyncKey(Date.now());
  }, []);

  const syncDraftWishlistToServer = async () => {
    try {
      const rawDraft = safeGetItem('draftWishlist');
      if (!rawDraft) return;
      const parsed = JSON.parse(rawDraft);

      // Expire drafts older than 24 hours (86,400,000 ms)
      if (parsed.createdAt && Date.now() - parsed.createdAt > 86400000) {
        console.log('[AuthContext] Guest draft wishlist expired (>24h), removing...');
        safeRemoveItem('draftWishlist');
        return;
      }

      if (parsed && Array.isArray(parsed.items) && parsed.items.length > 0) {
        console.log('[AuthContext] Migrating guest draft wishlist to authenticated account...');
        await api.post('/wishlists', {
          name: `${parsed.occasion || 'AI Curated'} Wishlist`,
          occasion: parsed.occasion || 'Other',
          visibility: 'public',
          isPublic: true,
          items: parsed.items.map((i) => ({
            name: i.name,
            notes: i.reason || i.notes || '',
            link: i.link || '',
            img: i.img || ''
          }))
        });
        safeRemoveItem('draftWishlist');
        console.log('[AuthContext] Guest draft wishlist successfully migrated!');
      }
    } catch (err) {
      console.error('[AuthContext] Failed to migrate guest draft wishlist:', err.message);
    }
  };

  const persistAuth = useCallback((nextUser, token, authType) => {
    console.log('[AuthContext] Persisting auth for:', nextUser?.email || 'unknown');
    const normalizedUser = normalizeUser(nextUser, authType);

    safeRemoveItem('wishlists');
    safeRemoveItem('notifications');
    safeRemoveItem('lastSync');

    safeSetItem('user', JSON.stringify(normalizedUser));
    if (token) {
      safeSetItem('token', token);
    }

    if (authType) {
      safeSetItem('authType', authType);
    } else {
      safeRemoveItem('authType');
    }

    setUser(normalizedUser);
    setSyncKey(Date.now());
  }, []);

  useEffect(() => {
    let isSubscribed = true;

    const fetchProfile = async () => {
      if (window.location.pathname === '/auth/callback') {
        console.log('[AuthContext] Skipping initial sync on callback route.');
        setLoading(false);
        return;
      }

      const storedUser = safeGetItem('user');
      const storedAuthType = safeGetItem('authType');

      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          if (isSubscribed) {
            setUser((prev) => prev || parsed);
          }
        } catch {
          // ignore parsing error
        }
      }

      try {
        setIsSyncing(true);
        const response = await api.get('/auth/profile');

        if (isSubscribed) {
          if (response.data?.user) {
            persistAuth(
              response.data.user,
              safeGetItem('token'),
              storedAuthType || (response.data.user.role === 'guest' ? 'guest' : undefined)
            );
          } else if (storedAuthType !== 'guest') {
            clearAuth();
          }
        }
      } catch (error) {
        console.error('[AuthContext] Profile sync status:', error.message);
        if (isSubscribed && storedAuthType !== 'guest') {
          clearAuth();
        }
      } finally {
        if (isSubscribed) {
          setIsSyncing(false);
          setLoading(false);
        }
      }
    };

    fetchProfile();
    return () => { isSubscribed = false; };
  }, [clearAuth, persistAuth]);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      persistAuth(response.data.user, response.data.token);
      await syncDraftWishlistToServer();
      return response.data.user;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const signup = async (name, email, password) => {
    try {
      const response = await api.post('/auth/register', { name, email, password });
      persistAuth(response.data.user, response.data.token);
      await syncDraftWishlistToServer();
      return response.data.user;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  const loginAsGuest = () => {
    const guestUser = {
      id: 'guest',
      name: 'Guest Visitor',
      email: '',
      isGuest: true,
      role: 'guest',
    };
    safeRemoveItem('draftWishlist');
    persistAuth(guestUser, null, 'guest');
    return guestUser;
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
      safeRemoveItem('wishlists');
      persistAuth(oauthUser, jwtToken);
      syncDraftWishlistToServer();
    } catch {
      // Fallback
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore network errors on logout
    } finally {
      clearAuth();
      safeRemoveItem('draftWishlist');
    }
  };

  const updateUser = (nextUser) => {
    const authType = nextUser?.role === 'guest' || nextUser?.isGuest ? 'guest' : undefined;
    const normalizedUser = normalizeUser(nextUser, authType);
    setUser(normalizedUser);
    safeSetItem('user', JSON.stringify(normalizedUser));
  };

  const value = {
    user,
    loading,
    isSyncing,
    isTransitioning,
    syncKey,
    login,
    signup,
    loginAsGuest,
    loginWithToken,
    updateUser,
    logout,
    setIsTransitioning
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
