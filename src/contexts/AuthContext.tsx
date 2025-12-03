// contexts/AuthContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/authService';
import API_BASE_URL  from '../api/api';

export interface User {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
  avatar?: string;
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

// contexts/AuthContext.tsx - Sửa refreshUser
const refreshUser = async () => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      console.log('❌ No token found for refresh');
      return;
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

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    isLoading,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};