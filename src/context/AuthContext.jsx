import { createContext, useContext, useState, useCallback } from 'react';
import { users } from '../data/mockData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('nexoramind_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = useCallback((email, password) => {
    const found = users.find(u => u.email === email && u.password === password);
    if (!found) throw new Error('Invalid email or password');
    const { password: _, ...safeUser } = found;
    setUser(safeUser);
    localStorage.setItem('nexoramind_user', JSON.stringify(safeUser));
    return safeUser;
  }, []);

  const register = useCallback((username, name, email, password) => {
    if (users.find(u => u.email === email)) throw new Error('Email already registered');
    if (users.find(u => u.username === username)) throw new Error('Username already taken');
    const newUser = {
      id: 'u' + Date.now(),
      username,
      name,
      email,
      role: 'STUDENT',
      createdAt: new Date().toISOString(),
    };
    users.push({ ...newUser, password });
    setUser(newUser);
    localStorage.setItem('nexoramind_user', JSON.stringify(newUser));
    return newUser;
  }, []);

  const loginWithGoogle = useCallback(() => {
    const googleUser = {
      id: 'u' + Date.now(),
      username: 'google_user',
      name: 'Google User',
      email: 'user@gmail.com',
      role: 'STUDENT',
      provider: 'google',
      createdAt: new Date().toISOString(),
    };
    setUser(googleUser);
    localStorage.setItem('nexoramind_user', JSON.stringify(googleUser));
    return googleUser;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('nexoramind_user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
