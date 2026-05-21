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
    // ── Mock kullanıcı (backend hazır olana kadar) ──────────
    if (email === 'test@test.com' && password === '123456') {
      const mockUser  = { _id: 'mock-001', name: 'Test Kullanıcı', email };
      const mockToken = 'mock-token-dev';
      localStorage.setItem('youra_token', mockToken);
      localStorage.setItem('youra_user', JSON.stringify(mockUser));
      setUser(mockUser);
      return { user: mockUser, token: mockToken };
    }
    // ── Gerçek API ──────────────────────────────────────────
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
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (updates) => {
    // ── Mock Profil Güncelleme (Backend hazır olana kadar) ──
    setUser(prev => {
      const updatedUser = { ...prev, ...updates };
      localStorage.setItem('youra_user', JSON.stringify(updatedUser));
      return updatedUser;
    });
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
