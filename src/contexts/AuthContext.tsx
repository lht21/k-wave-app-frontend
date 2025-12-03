import * as React from 'react';
import { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/authService';

export interface User {
  _id: string;
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  avatar?: string;
  level?: string;
  topikAchievement?: string | null;
  subscription?: {
    type: string;
    isActive: boolean;
    autoRenew: boolean;
  };
  limits?: {
    dailyLessons: number;
    monthlyExams: number;
    canAccessPremiumContent: boolean;
    canDownloadMaterials: boolean;
  };
  progress?: {
    completedLessons: string[];
    completedExams: string[];
    streakDays: number;
    totalStudyTime: number;
  };
  savedFlashcardSets?: string[];
  usageStats?: {
    lessonsToday: number;
    examsThisMonth: number;
  };
  isEmailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (userData: RegisterCredentials) => Promise<AuthResponse>;
  logout: () => void;
  getUserProfile: () => Promise<void>;
  updateUser: (userData: User) => void;
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
        // Fetch user profile after setting token
        await getUserProfile();
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserProfile = async () => {
    try {
      const currentToken = token || await AsyncStorage.getItem('authToken');
      if (!currentToken) {
        console.log('No token available for getUserProfile');
        return;
      }

      console.log('🔄 Attempting to fetch user profile...');
      const result = await authService.getUserProfile(currentToken);
      if (result.user) {
        setUser(result.user);
        console.log('✅ User profile loaded:', result.user.fullName);
      }
    } catch (error) {
      console.error('❌ Error fetching user profile:', error);
      
      // If network error, don't logout immediately - maybe server is down temporarily
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.log('🌐 Network error - keeping user logged in temporarily');
      } else {
        // For other errors (like invalid token), logout
        console.log('🚪 Logging out due to auth error');
        await logout();
      }
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      const result = await authService.login(credentials);
      if (result.token) {
        await AsyncStorage.setItem('authToken', result.token);
        setToken(result.token);
        
        // Set user data if available in response, otherwise fetch profile
        if (result.user) {
          setUser(result.user);
        } else {
          await getUserProfile();
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

  const updateUser = (userData: User) => {
    setUser(userData);
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    getUserProfile,
    updateUser,
    loading,
    isAuthenticated: !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};