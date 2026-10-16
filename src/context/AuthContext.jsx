import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/auth.api';
import { cookieHelper } from '../utils/cookie';
import ForcedPasswordChangeModal from '../components/common/ForcedPasswordChangeModal';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Read cached session synchronously from cookie for 0ms instant hydration
  const cachedSession = typeof window !== 'undefined' ? cookieHelper.get('asher_session') : null;
  const hasToken = typeof window !== 'undefined' && Boolean(localStorage.getItem('token') || cookieHelper.get('asher_logged_in'));

  const [user, setUser] = useState(() => cachedSession?.user || null);
  const [profile, setProfile] = useState(() => cachedSession?.profile || null);
  // If guest (no token/cookie), loading is immediately false (0ms!).
  // If cached session exists, loading is immediately false (instant render!).
  // Only show loading spinner if user claims to have token but we don't have cached data yet.
  const [loading, setLoading] = useState(() => Boolean(hasToken && !cachedSession));

  const fetchCurrentUser = useCallback(async (isSilent = false) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const isLoggedInCookie = typeof window !== 'undefined' ? cookieHelper.get('asher_logged_in') : null;

    // Fast exit for guests: don't make blocking network calls
    if (!token && !isLoggedInCookie) {
      setUser(null);
      setProfile(null);
      setLoading(false);
      cookieHelper.remove('asher_session');
      cookieHelper.remove('asher_logged_in');
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
        // Save smart cookie (7 days) for instant subsequent loads
        cookieHelper.set('asher_session', { user: freshUser, profile: freshProfile }, 7);
        cookieHelper.set('asher_logged_in', '1', 7);
      } else {
        setUser(null);
        setProfile(null);
        cookieHelper.remove('asher_session');
        cookieHelper.remove('asher_logged_in');
      }
    } catch (err) {
      // If server explicitly rejects (401/403), invalidate cached session
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('token');
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
      const token = res.data.data?.token;
      if (token) {
        localStorage.setItem('token', token);
      }
      const loggedUser = res.data.data.user;
      const loggedProfile = res.data.data.profile;
      setUser(loggedUser);
      setProfile(loggedProfile);
      // Persist in smart cookie for instant load on refresh
      cookieHelper.set('asher_session', { user: loggedUser, profile: loggedProfile }, 7);
      cookieHelper.set('asher_logged_in', '1', 7);
      return res.data.data;
    }
    throw new Error(res.data?.message || 'Login failed');
  };

  const registerCandidate = async (formData) => {
    const res = await authApi.registerCandidate(formData);
    if (res.data?.success) {
      const token = res.data.data?.token;
      if (token) {
        localStorage.setItem('token', token);
      }
      const newUser = res.data.data.user;
      const newProfile = res.data.data.candidate;
      setUser(newUser);
      setProfile(newProfile);
      cookieHelper.set('asher_session', { user: newUser, profile: newProfile }, 7);
      cookieHelper.set('asher_logged_in', '1', 7);
      return res.data.data;
    }
    throw new Error(res.data?.message || 'Registration failed');
  };

  const registerCompany = async (formData) => {
    const res = await authApi.registerCompany(formData);
    if (res.data?.success) {
      const token = res.data.data?.token;
      if (token) {
        localStorage.setItem('token', token);
      }
      const newUser = res.data.data.user;
      const newProfile = res.data.data.company;
      setUser(newUser);
      setProfile(newProfile);
      cookieHelper.set('asher_session', { user: newUser, profile: newProfile }, 7);
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
      localStorage.removeItem('token');
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
