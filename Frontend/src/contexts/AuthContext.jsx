import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

const AUTH_KEYS = {
  TOKEN: 'nestifynd_token',
  EMAIL: 'userEmail',
  NAME: 'userName',
  ROLE: 'userRole',
  ID: 'userId',
};

function readUserFromStorage() {
  const token = localStorage.getItem(AUTH_KEYS.TOKEN);
  const email = localStorage.getItem(AUTH_KEYS.EMAIL);
  const role = localStorage.getItem(AUTH_KEYS.ROLE);
  if (!token || !email || !role) return null;
  
  // Preserve the actual role (user, therapist, caregiver, admin)
  const validRoles = ['user', 'therapist', 'caregiver', 'admin'];
  const normalizedRole = validRoles.includes(role) ? role : 'user';
  
  return {
    id: localStorage.getItem(AUTH_KEYS.ID),
    email,
    name: localStorage.getItem(AUTH_KEYS.NAME) || email.split('@')[0],
    role: normalizedRole,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(readUserFromStorage());
  }, []);

  const login = useCallback(({ user: apiUser, token }) => {
    const roleName = apiUser.role?.name || apiUser.role || 'user';
    
    // Preserve the actual role (user, therapist, caregiver, admin)
    const validRoles = ['user', 'therapist', 'caregiver', 'admin'];
    const normalizedRole = validRoles.includes(roleName) ? roleName : 'user';
    
    localStorage.setItem(AUTH_KEYS.TOKEN, token);
    localStorage.setItem(AUTH_KEYS.EMAIL, apiUser.email);
    localStorage.setItem(AUTH_KEYS.NAME, apiUser.name || apiUser.email?.split('@')[0] || '');
    localStorage.setItem(AUTH_KEYS.ROLE, normalizedRole);
    localStorage.setItem(AUTH_KEYS.ID, apiUser._id || apiUser.id || '');
    setUser({
      id: apiUser._id || apiUser.id,
      email: apiUser.email,
      name: apiUser.name || apiUser.email?.split('@')[0],
      role: normalizedRole,
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_KEYS.TOKEN);
    localStorage.removeItem(AUTH_KEYS.EMAIL);
    localStorage.removeItem(AUTH_KEYS.NAME);
    localStorage.removeItem(AUTH_KEYS.ROLE);
    localStorage.removeItem(AUTH_KEYS.ID);
    setUser(null);
  }, []);

  const updateUser = useCallback((updates) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      if (updates.name) localStorage.setItem(AUTH_KEYS.NAME, updates.name);
      if (updates.email) localStorage.setItem(AUTH_KEYS.EMAIL, updates.email);
      return updated;
    });
  }, []);

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
