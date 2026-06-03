import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // Sayfa yenilenince local storage'dan kullanıcıyı yükle
  useEffect(() => {
    const stored = localStorage.getItem('youra_user');
    const token  = localStorage.getItem('youra_token');
    if (stored && token) {
      try { setUser(JSON.parse(stored)); } catch { /* ignore */ }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('youra_token', data.token);
    localStorage.setItem('youra_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    localStorage.setItem('youra_token', data.token);
    localStorage.setItem('youra_user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('youra_token');
    localStorage.removeItem('youra_user');
    sessionStorage.removeItem('youra_chat_history');
    sessionStorage.removeItem('youra_outfit_chat_history');
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (updates) => {
    const { data } = await api.put('/auth/profile', updates);
    setUser(data.user);
    localStorage.setItem('youra_user', JSON.stringify(data.user));
    return data.user;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
