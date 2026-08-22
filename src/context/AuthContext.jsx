import { createContext, useContext, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';

const AuthContext = createContext(null);

function storeSession(token, userData) {
  localStorage.setItem('nexoramind_token', token);
  localStorage.setItem('nexoramind_user', JSON.stringify(userData));
}

function clearSession() {
  localStorage.removeItem('nexoramind_token');
  localStorage.removeItem('nexoramind_user');
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('nexoramind_user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email, password) => {
    const res = await api.login(email, password);
    const token = res.token || res.access_token || res.jwt;
    const userData = res.user || res.data || res;

    if (!token) {
      throw new Error('No token received from server');
    }

    storeSession(token, userData);
    setUser(userData);
    toast.success(`Welcome back, ${userData.FullName || userData.full_name || userData.Email || 'User'}!`);
    return userData;
  }, []);

  const register = useCallback(async (email, fullName, password) => {
    const res = await api.register(email, fullName, password);
    const token = res.token || res.access_token || res.jwt;
    const userData = res.user || res.data || res;

    if (token) {
      storeSession(token, userData);
      setUser(userData);
      toast.success('Account created successfully!');
      return userData;
    }

    toast.success('Account created! Please sign in.');
    return res;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    clearSession();
    toast.info('Logged out successfully');
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
