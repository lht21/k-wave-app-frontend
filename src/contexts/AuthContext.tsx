import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/authService';

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (userData: RegisterCredentials) => Promise<AuthResponse>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  username: string;
  fullName: string;
  email: string;
  password: string;
  role?: string;
}
interface AuthResponse {
  token?: string;
  user?: User;
  message?: string;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('authToken');
      if (storedToken) {
        setToken(storedToken);
        // Có thể fetch user profile ở đây nếu cần
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      const result = await authService.login(credentials);
      if (result.token) {
        await AsyncStorage.setItem('authToken', result.token);
        setToken(result.token);
        // Set user data if available in response
        if (result.user) {
          setUser(result.user);
        }
      }
      return result;
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: RegisterCredentials) => {
    try {
      const result = await authService.register(userData);
      return result;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};