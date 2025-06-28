import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '@/services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'citizen' | 'admin' | 'official';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('nyaychain_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await authService.login(email, password);
      if (response.status === 'success') {
        setUser(response.data.user);
        setLoading(false);
        return true;
      } else {
        console.error('Login failed:', response.message);
        setLoading(false);
        return false;
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setLoading(false);
      // Show more specific error message if available
      throw new Error(error.message || 'Login failed');
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await authService.register(name, email, password);
      if (response.status === 'success') {
        setUser(response.data.user);
        setLoading(false);
        return true;
      } else {
        console.error('Registration failed:', response.message);
        setLoading(false);
        return false;
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      setLoading(false);
      // Show more specific error message if available
      throw new Error(error.message || 'Registration failed');
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
