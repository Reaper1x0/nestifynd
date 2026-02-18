import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

const AUTH_KEYS = {
  EMAIL: 'userEmail',
  NAME: 'userName',
  ROLE: 'userRole',
};

function readUserFromStorage() {
  const email = localStorage.getItem(AUTH_KEYS.EMAIL);
  const role = localStorage.getItem(AUTH_KEYS.ROLE);
  if (!email || !role) return null;
  return {
    email,
    name: localStorage.getItem(AUTH_KEYS.NAME) || email.split('@')[0],
    role: role === 'therapist' ? 'therapist' : 'user',
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(readUserFromStorage());
  }, []);

  const login = useCallback(({ email, name, role = 'user' }) => {
    localStorage.setItem(AUTH_KEYS.EMAIL, email);
    localStorage.setItem(AUTH_KEYS.ROLE, role);
    if (name) localStorage.setItem(AUTH_KEYS.NAME, name);
    setUser({
      email,
      name: name || email.split('@')[0],
      role: role === 'therapist' ? 'therapist' : 'user',
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_KEYS.EMAIL);
    localStorage.removeItem(AUTH_KEYS.NAME);
    localStorage.removeItem(AUTH_KEYS.ROLE);
    setUser(null);
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
