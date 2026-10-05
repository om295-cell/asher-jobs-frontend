import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/auth.api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    try {
      setLoading(true);
      const res = await authApi.getMe();
      if (res.data?.success) {
        setUser(res.data.data.user);
        setProfile(res.data.data.profile);
      } else {
        setUser(null);
        setProfile(null);
      }
    } catch (err) {
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const login = async (credential, password) => {
    const res = await authApi.login(credential, password);
    if (res.data?.success) {
      setUser(res.data.data.user);
      setProfile(res.data.data.profile);
      return res.data.data;
    }
    throw new Error(res.data?.message || 'Login failed');
  };

  const registerCandidate = async (formData) => {
    const res = await authApi.registerCandidate(formData);
    if (res.data?.success) {
      setUser(res.data.data.user);
      setProfile(res.data.data.candidate);
      return res.data.data;
    }
    throw new Error(res.data?.message || 'Registration failed');
  };

  const registerCompany = async (formData) => {
    const res = await authApi.registerCompany(formData);
    if (res.data?.success) {
      setUser(res.data.data.user);
      setProfile(res.data.data.company);
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
