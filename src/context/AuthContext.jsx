import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/auth.api';
import { cookieHelper } from '../utils/cookie';
import ForcedPasswordChangeModal from '../components/common/ForcedPasswordChangeModal';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Read cached session synchronously from cookie for 0ms instant hydration (only role/flags, no PII)
  const cachedSession = typeof window !== 'undefined' ? cookieHelper.get('asher_session') : null;
  const hasToken = typeof window !== 'undefined' && Boolean(cookieHelper.get('asher_logged_in'));

  const [user, setUser] = useState(() => (cachedSession?.role ? { role: cachedSession.role, mustChangePassword: Boolean(cachedSession.mustChangePassword) } : null));
  const [profile, setProfile] = useState(null);
  // If guest (no cookie), loading is immediately false (0ms!).
  // If cached session exists, loading is immediately false (instant render!).
  // Only show loading spinner if user claims to have token but we don't have cached data yet.
  const [loading, setLoading] = useState(() => Boolean(hasToken && !cachedSession));

  const fetchCurrentUser = useCallback(async (isSilent = false) => {
    const isLoggedInCookie = typeof window !== 'undefined' ? cookieHelper.get('asher_logged_in') : null;

    // Fast exit for guests: don't make blocking network calls
    if (!isLoggedInCookie) {
      setUser(null);
      setProfile(null);
      setLoading(false);
      cookieHelper.remove('asher_session');
      cookieHelper.remove('asher_logged_in');
      try { localStorage.removeItem('asher_token'); } catch {}
      return;
    }

    if (!isSilent && !cachedSession) {
      setLoading(true);
    }

    try {
      const res = await authApi.getMe();
      if (res.data?.success) {
        const freshUser = res.data.data.user;
        const freshProfile = res.data.data.profile;
        setUser(freshUser);
        setProfile(freshProfile);
        // Save minimal non-sensitive session data (7 days) for instant subsequent loads
        cookieHelper.set('asher_session', { role: freshUser.role, mustChangePassword: Boolean(freshUser.mustChangePassword) }, 7);
        cookieHelper.set('asher_logged_in', '1', 7);
      } else {
        setUser(null);
        setProfile(null);
        cookieHelper.remove('asher_session');
        cookieHelper.remove('asher_logged_in');
        try { localStorage.removeItem('token'); } catch {}
      }
    } catch (err) {
      // If server explicitly rejects (401/403), invalidate cached session
      if (err.response?.status === 401 || err.response?.status === 403) {
        try { localStorage.removeItem('asher_token'); } catch {}
        cookieHelper.remove('asher_session');
        cookieHelper.remove('asher_logged_in');
        setUser(null);
        setProfile(null);
      }
    } finally {
      setLoading(false);
    }
  }, [cachedSession]);

  useEffect(() => {
    // Run validation in background (Stale-While-Revalidate if cached, normal if uncached)
    const isSilent = Boolean(cachedSession);
    fetchCurrentUser(isSilent);
  }, [fetchCurrentUser]);

  const login = async (credential, password) => {
    const res = await authApi.login(credential, password);
    if (res.data?.success) {
      const loggedUser = res.data.data.user;
      const loggedProfile = res.data.data.profile;
      const token = res.data.data.token;
      // Persist JWT in localStorage for Authorization header injection (bypasses cross-site cookie blocking)
      try { if (token) localStorage.setItem('asher_token', token); } catch {}
      setUser(loggedUser);
      setProfile(loggedProfile);
      // Persist minimal role/flags in cookie for instant load on refresh
      cookieHelper.set('asher_session', { role: loggedUser.role, mustChangePassword: Boolean(loggedUser.mustChangePassword) }, 7);
      cookieHelper.set('asher_logged_in', '1', 7);
      return res.data.data;
    }
    throw new Error(res.data?.message || 'Login failed');
  };

  const registerCandidate = async (formData) => {
    const res = await authApi.registerCandidate(formData);
    if (res.data?.success) {
      const newUser = res.data.data.user;
      const newProfile = res.data.data.candidate;
      const token = res.data.data.token;
      try { if (token) localStorage.setItem('asher_token', token); } catch {}
      setUser(newUser);
      setProfile(newProfile);
      cookieHelper.set('asher_session', { role: newUser.role, mustChangePassword: Boolean(newUser.mustChangePassword) }, 7);
      cookieHelper.set('asher_logged_in', '1', 7);
      return res.data.data;
    }
    throw new Error(res.data?.message || 'Registration failed');
  };

  const registerCompany = async (formData) => {
    const res = await authApi.registerCompany(formData);
    if (res.data?.success) {
      const newUser = res.data.data.user;
      const newProfile = res.data.data.company;
      const token = res.data.data.token;
      try { if (token) localStorage.setItem('asher_token', token); } catch {}
      setUser(newUser);
      setProfile(newProfile);
      cookieHelper.set('asher_session', { role: newUser.role, mustChangePassword: Boolean(newUser.mustChangePassword) }, 7);
      cookieHelper.set('asher_logged_in', '1', 7);
      return res.data.data;
    }
    throw new Error(res.data?.message || 'Registration failed');
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      console.warn('Logout error:', e);
    } finally {
      try { localStorage.removeItem('asher_token'); } catch {}
      cookieHelper.remove('asher_session');
      cookieHelper.remove('asher_logged_in');
      setUser(null);
      setProfile(null);
    }
  };

  const refreshProfile = async () => {
    return fetchCurrentUser();
  };

  const value = {
    user,
    profile,
    loading,
    role: user?.role || null,
    isAuthenticated: !!user,
    login,
    registerCandidate,
    registerCompany,
    logout,
    refreshProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {user?.mustChangePassword && <ForcedPasswordChangeModal />}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
