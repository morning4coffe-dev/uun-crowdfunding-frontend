import React, { createContext, useContext, useState, useEffect } from 'react';
import client from '../api/client';
import { User } from '../types/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (data: { email: string; password: string }) => Promise<void>;
  register: (data: { email: string; password: string; firstName: string; lastName: string }) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  // Dev helper to toggle founder role locally for testing
  toggleFounder?: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const response = await client.get('/users/me');
      const userData = response.data;
      
      // Only set user if we got valid data
      if (userData && userData._id) {
        // Add fullName property if not present
        if (!userData.fullName) {
          userData.fullName = `${userData.firstName} ${userData.lastName}`;
        }
        setUser(userData);
      } else {
        setUser(null);
        document.cookie = 'session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      }
    } catch (error: any) {
      console.log('Auth check failed:', error.response?.status);
      setUser(null);
      // Clear any stale cookies
      document.cookie = 'session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (data: { email: string; password: string }) => {
    const response = await client.post('/auth/login', data);
    const userData = response.data.user;
    // Add fullName property if not present
    if (!userData.fullName) {
      userData.fullName = `${userData.firstName} ${userData.lastName}`;
    }
    setUser(userData);
  };

  const register = async (data: { email: string; password: string; firstName: string; lastName: string }) => {
    const response = await client.post('/auth/register', data);
    const userData = response.data.user;
    // Add fullName property if not present
    if (!userData.fullName) {
      userData.fullName = `${userData.firstName} ${userData.lastName}`;
    }
    setUser(userData);
  };

  const logout = async () => {
    console.log('Logout called, setting user to null');
    // Set user to null first to trigger immediate redirect
    setUser(null);
    
    try {
      await client.post('/auth/logout');
      console.log('Logout API call succeeded');
      // Clear the session cookie
      document.cookie = 'session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    } catch (error) {
      console.error('Logout error:', error);
      // Clear cookie even if API call fails
      document.cookie = 'session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }
  };

  const toggleFounder = () => {
    if (!user) return;
    try {
      const hasFounder = user.roles?.includes('founder');
      const newRoles = hasFounder
        ? user.roles.filter((r) => r !== 'founder')
        : Array.from(new Set([...(user.roles || []), 'founder']));
      setUser({ ...user, roles: newRoles });
      console.log('Debug: toggled founder role. New roles:', newRoles);
    } catch (err) {
      console.error('toggleFounder error', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, checkAuth, toggleFounder }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
