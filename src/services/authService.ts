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

interface AuthResponse {
  token: string;
  user?: any;
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

      const { token } = result;

      if (token) {
        return result;
      } else {
        console.log('Không tìm thấy token', result);
        throw new Error('Không tìm thấy token trong phản hồi đăng nhập.');
      }
    } catch (error) {
      throw error;
    }
  },

  // Đăng xuất
  logout: async () => {
    try {
      await AsyncStorage.removeItem('authToken');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  },

  // Lấy token
  getToken: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem('authToken');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
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