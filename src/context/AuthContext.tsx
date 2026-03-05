import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { apiFetch } from '@/lib/api';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  color: string;
  createdAt: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<AuthUser>) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initial load: fetch the current user profile using the saved token
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('splitx_token');
      if (token) {
        try {
          const res = await apiFetch<{ success: boolean; user: AuthUser }>('/auth/me');
          if (res.success && res.user) {
            setUser(res.user);
          } else {
            localStorage.removeItem('splitx_token');
          }
        } catch (error) {
          console.error('Failed to restore session:', error);
          localStorage.removeItem('splitx_token');
        }
      }
      setIsLoading(false);
    };
    fetchUser();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const res = await apiFetch<{ success: boolean; token: string; user: AuthUser }>('/auth/login', {
        method: 'POST',
        data: { email, password },
      });
      if (res.success && res.token && res.user) {
        localStorage.setItem('splitx_token', res.token);
        setUser(res.user);
        return { success: true };
      }
      return { success: false, error: 'Login failed' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Login failed' };
    }
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    try {
      const res = await apiFetch<{ success: boolean; token: string; user: AuthUser }>('/auth/signup', {
        method: 'POST',
        data: { name, email, password },
      });
      if (res.success && res.token && res.user) {
        localStorage.setItem('splitx_token', res.token);
        setUser(res.user);
        return { success: true };
      }
      return { success: false, error: 'Signup failed' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Signup failed' };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('splitx_token');
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (updates: Partial<AuthUser>) => {
    try {
      const res = await apiFetch<{ success: boolean; user: AuthUser }>('/auth/profile', {
        method: 'PATCH',
        data: updates
      });
      if (res.success && res.user) {
        setUser(res.user);
        return { success: true };
      }
      return { success: false, error: 'Update failed' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Update failed' };
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
