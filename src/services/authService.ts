import { API_BASE_URL } from './config';
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
  token?: string;
  user?: any;
  msg?: string;
}

// ✅ THÊM: Hàm lấy headers với authentication
export const getAuthHeaders = async (): Promise<Record<string, string>> => {
  try {
    const token = await AsyncStorage.getItem('authToken');
    
    if (token) {
      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      };
    }
    
    return {
      'Content-Type': 'application/json',
    };
  } catch (error) {
    console.error('Error getting auth headers:', error);
    return {
      'Content-Type': 'application/json',
    };
  }
};

// ✅ THÊM: Hàm lấy user data từ AsyncStorage
export const getUserData = async (): Promise<User | null> => {
  try {
    const userData = await AsyncStorage.getItem('userData');
    if (userData) {
      return JSON.parse(userData);
    }
    return null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

export const authService = {
  // Đăng ký
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    try {
      console.log('📤 Register request:', {
        url: `${AUTH_URL}/register`,
        credentials: { ...credentials, password: '***' }
      });

      const response = await fetch(`${AUTH_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials)
      });

      console.log('📥 Register response status:', response.status);
      const result = await response.json();
      console.log('📥 Register response data:', result);

      if (!response.ok) {
        throw new Error(result.msg || 'Đăng ký thất bại');
      }

      return result;
    } catch (error) {
      console.error('❌ Register error:', error);
      if (error instanceof TypeError && error.message.includes('Network request failed')) {
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
      }
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
      const headers = await getAuthHeaders();
      const response = await fetch(`${AUTH_URL}/forgot-password`, {
        method: 'POST',
        headers,
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
      const headers = await getAuthHeaders();
      const response = await fetch(`${AUTH_URL}/reset-password`, {
        method: 'PATCH',
        headers,
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
      const headers = await getAuthHeaders();
      const response = await fetch(`${AUTH_URL}/resend-password-otp`, {
        method: 'POST',
        headers,
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
  },

  // Lấy token từ AsyncStorage
  getToken: async (): Promise<string> => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        throw new Error('Vui lòng đăng nhập lại');
      }
      return token;
    } catch (error) {
      console.error('Lỗi khi lấy token:', error);
      throw error;
    }
  },

};