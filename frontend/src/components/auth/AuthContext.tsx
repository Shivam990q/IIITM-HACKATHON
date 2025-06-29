import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '@/services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'citizen' | 'admin' | 'official';
  phone?: string;
  address?: string;
  bio?: string;
  profileImage?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role?: 'citizen' | 'admin') => Promise<boolean>;
  register: (name: string, email: string, password: string, role?: 'citizen' | 'admin') => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  updateUser: (userData: Partial<User>) => void;
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

  const login = async (email: string, password: string, role: 'citizen' | 'admin' = 'citizen'): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await authService.login(email, password, role);
      if (response.status === 'success') {
        const userData = response.data.user;
        setUser(userData);
        // Store user data and token in localStorage
        localStorage.setItem('nyaychain_user', JSON.stringify(userData));
        localStorage.setItem('nyaychain_token', response.token);
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

  const register = async (name: string, email: string, password: string, role: 'citizen' | 'admin' = 'citizen'): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await authService.register(name, email, password, role);
      if (response.status === 'success') {
        const userData = response.data.user;
        setUser(userData);
        // Store user data and token in localStorage
        localStorage.setItem('nyaychain_user', JSON.stringify(userData));
        localStorage.setItem('nyaychain_token', response.token);
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
    // Clear user data and token from localStorage
    localStorage.removeItem('nyaychain_user');
    localStorage.removeItem('nyaychain_token');
  };

  const updateUser = (userData: Partial<User>) => {
    const updatedUser = { ...user, ...userData } as User;
    setUser(updatedUser);
    localStorage.setItem('nyaychain_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
