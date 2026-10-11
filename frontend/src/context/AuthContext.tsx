/**
 * Authentication and RBAC Context for FinMate.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthUser } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string, role?: string) => Promise<void>;
  loginWithGoogle: (payload?: { credential?: string; email?: string; name?: string }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('finmate_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    // Return null so unauthenticated users see the Login page
    return null;
  });

  const [token, setToken] = useState<string | null>(() => localStorage.getItem('finmate_token'));
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // If token exists, verify and sync profile
    if (token) {
      api.getMe()
        .then((userData) => {
          setUser(userData);
          localStorage.setItem('finmate_user', JSON.stringify(userData));
        })
        .catch(() => {
          // If token expired, clear invalid session
          logout();
        });
    }
  }, [token]);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const res = await api.login({ email, password: pass });
      setToken(res.access_token);
      localStorage.setItem('finmate_token', res.access_token);
      const authUser: AuthUser = {
        id: res.user_id,
        name: res.name,
        email: res.email,
        role: res.role as 'USER' | 'ADMIN',
      };
      setUser(authUser);
      localStorage.setItem('finmate_user', JSON.stringify(authUser));
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, pass: string, role?: string) => {
    setIsLoading(true);
    try {
      const res = await api.register({ name, email, password: pass, role });
      setToken(res.access_token);
      localStorage.setItem('finmate_token', res.access_token);
      const authUser: AuthUser = {
        id: res.user_id,
        name: res.name,
        email: res.email,
        role: res.role as 'USER' | 'ADMIN',
      };
      setUser(authUser);
      localStorage.setItem('finmate_user', JSON.stringify(authUser));
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (payload?: { credential?: string; email?: string; name?: string }) => {
    setIsLoading(true);
    try {
      const res = await api.googleLogin(
        payload || {
          email: 'google.user@finmate.local',
          name: 'Google User',
        }
      );
      setToken(res.access_token);
      localStorage.setItem('finmate_token', res.access_token);
      const authUser: AuthUser = {
        id: res.user_id,
        name: res.name,
        email: res.email,
        role: res.role as 'USER' | 'ADMIN',
      };
      setUser(authUser);
      localStorage.setItem('finmate_user', JSON.stringify(authUser));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('finmate_token');
    localStorage.removeItem('finmate_user');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const u = await api.getMe();
      setUser(u);
      localStorage.setItem('finmate_user', JSON.stringify(u));
    } catch {}
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAdmin,
        login,
        register,
        loginWithGoogle,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
