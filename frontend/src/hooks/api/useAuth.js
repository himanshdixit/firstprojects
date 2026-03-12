'use client';

import { useCallback, useState } from 'react';
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
} from '@/services/auth.service';

export default function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const login = useCallback(async (payload) => {
    setLoading(true);
    setError('');
    try {
      return await loginUser(payload);
    } catch (err) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (payload) => {
    setLoading(true);
    setError('');
    try {
      return await registerUser(payload);
    } catch (err) {
      setError(err.message || 'Register failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const me = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      return await getCurrentUser();
    } catch (err) {
      setError(err.message || 'Failed to fetch current user');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      return await logoutUser();
    } catch (err) {
      setError(err.message || 'Logout failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    login,
    register,
    me,
    logout,
  };
}
