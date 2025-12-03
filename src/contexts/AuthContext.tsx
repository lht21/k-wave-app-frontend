import * as React from 'react';

// contexts/AuthContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/authService';
import API_BASE_URL  from '../api/api';

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

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  register: (userData: RegisterCredentials) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  isLoading: boolean;
  refreshUser: () => Promise<void>; 
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('authToken');
      if (storedToken) {
        setToken(storedToken);
        // Fetch user profile after setting token
        await getUserProfile();
      // Lấy cả token và userData từ AsyncStorage
      const [token, userData] = await Promise.all([
        AsyncStorage.getItem('userToken'),
        AsyncStorage.getItem('userData')
      ]);
      
      // Chỉ set user nếu có cả token và userData
      if (token && userData) {
        setUser(JSON.parse(userData));
        console.log('✅ User loaded from storage:', JSON.parse(userData).fullName);
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setIsLoading(false);
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

    console.log('🔄 Refreshing user with token:', token.substring(0, 20) + '...');
    
    // Gọi API lấy profile mới nhất
    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('🔄 Refresh response status:', response.status);
    
    if (response.ok) {
      const userData = await response.json();
      console.log('🔄 User data from API:', userData);
      
      // Cập nhật State
      setUser(userData);
      // Cập nhật Storage với đầy đủ thông tin
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      console.log('✅ User refreshed with avatar:', userData.avatar);
    } else {
      const errorText = await response.text();
      console.log('❌ Failed to refresh user:', errorText);
    }
  } catch (error) {
    console.error('Failed to refresh user:', error);
  }
};
// contexts/AuthContext.tsx - Sửa hàm login
const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  try {
    const result = await authService.login(credentials);
    
    if (result.token && result.user) {
      setUser(result.user);
      // QUAN TRỌNG: Lưu cả token và userData
      await Promise.all([
        AsyncStorage.setItem('userToken', result.token),
        AsyncStorage.setItem('userData', JSON.stringify(result.user))
      ]);
      console.log('✅ Login successful, token saved:', result.token.substring(0, 20) + '...');
      console.log('✅ User saved:', result.user);
    }
    return result;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

  const register = async (userData: RegisterCredentials): Promise<AuthResponse> => {
    try {
      const result = await authService.register(userData);
      return result;
    } catch (error) {
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // Xóa token và userData khỏi AsyncStorage
      await Promise.all([
        AsyncStorage.removeItem('userToken'),
        AsyncStorage.removeItem('userData')
      ]);
      setUser(null);
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  };

  const updateUser = (userData: User) => {
    setUser(userData);
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    getUserProfile,
    updateUser,
    loading,
    isAuthenticated: !!token,
    isLoading,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};