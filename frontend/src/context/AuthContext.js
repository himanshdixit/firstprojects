'use client';

import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  updateCurrentUser,
} from '@/services/auth.service';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCurrentUser();
      setUser(data?.data?.user || null);
    } catch (_error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (payload) => {
    const data = await loginUser(payload);
    setUser(data?.data?.user || null);
    return data;
  }, []);

  const register = useCallback(async (payload) => {
    const data = await registerUser(payload);
    setUser(data?.data?.user || null);
    return data;
  }, []);

  const logout = useCallback(async () => {
    await logoutUser();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (payload) => {
    const data = await updateCurrentUser(payload);
    setUser(data?.data?.user || null);
    return data;
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === 'admin',
      login,
      register,
      logout,
      updateProfile,
      refreshUser,
    }),
    [user, loading, login, register, logout, updateProfile, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
