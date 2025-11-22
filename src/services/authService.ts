// services/authService.ts
import API_BASE_URL, { getAuthHeaders } from '../api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_URL = API_BASE_URL + "/auth";

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

// THÊM INTERFACE USER
interface User {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
}

interface AuthResponse {
  token: string;
  user?: User;
  msg?: string;
}

export const authService = {
  // Đăng ký
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    try {
      const response = await fetch(`${AUTH_URL}/register`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(credentials)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.msg || 'Đăng ký thất bại');
      }

      return result;
    } catch (error) {
      throw error;
    }
  },

  // Đăng nhập
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await fetch(`${AUTH_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.msg || 'Đăng nhập thất bại');
      }

      const { token, user } = result;

      if (token && user) {
        console.log('🔑 Login response user data:', user);
        
        await AsyncStorage.setItem('authToken', token);
        await AsyncStorage.setItem('userData', JSON.stringify(user));
        return { token, user };
      } else {
        console.log('Không tìm thấy token hoặc user data', result);
        throw new Error('Thiếu thông tin người dùng trong phản hồi đăng nhập.');
      }
    } catch (error) {
      throw error;
    }
  },

  // Đăng xuất
  logout: async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData'); 
    } catch (error) {
      console.error('Error during logout:', error);
    }
  },

  // Kiểm tra đã đăng nhập chưa
  isAuthenticated: async (): Promise<boolean> => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      return !!token;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  },

  // Quên mật khẩu
  forgotPassword: async (email: string): Promise<any> => {
    try {
      const response = await fetch(`${AUTH_URL}/forgot-password`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ email })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.msg || 'Gửi yêu cầu thất bại');
      }

      return result;
    } catch (error) {
      throw error;
    }
  },

  // Reset mật khẩu
  resetPassword: async (resetData: { otp: string; newPassword: string }): Promise<any> => {
    try {
      const response = await fetch(`${AUTH_URL}/reset-password`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(resetData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.msg || 'Đặt lại mật khẩu thất bại');
      }

      return result;
    } catch (error) {
      throw error;
    }
  },

  // Gửi lại OTP
  resendOtp: async (email: string): Promise<any> => {
    try {
      const response = await fetch(`${AUTH_URL}/resend-password-otp`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ email })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.msg || 'Gửi lại mã thất bại');
      }

      return result;
    } catch (error) {
      throw error;
    }
  }
};