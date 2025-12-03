import { API_BASE_URL } from './config';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Dynamic AUTH_URL based on working endpoint
const getAuthURL = async (): Promise<string> => {
  try {
    const workingEndpoint = await getWorkingEndpoint();
    return workingEndpoint + "/auth";
  } catch (error) {
    console.log('Using fallback AUTH_URL');
    return API_BASE_URL + "/auth";
  }
};

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
      console.log('🔐 Attempting login with endpoint:', AUTH_URL);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${AUTH_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const result = await response.json();
      
      console.log('📥 Login response status:', response.status);
      console.log('📥 Login response:', { success: response.ok, hasToken: !!result.token });

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
      console.error('❌ Login error:', error);
      
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra:\n1. Server có đang chạy?\n2. Kết nối mạng\n3. Địa chỉ IP server');
      }
      
      if (error.name === 'AbortError') {
        throw new Error('Kết nối quá chậm. Vui lòng thử lại.');
      }
      
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
  },

  // Lấy thông tin profile user
  getUserProfile: async (token: string): Promise<AuthResponse> => {
    try {
      console.log('🔍 Fetching user profile...');
      console.log('🔗 API URL:', `${API_BASE_URL}/user/profile`);
      console.log('🎫 Token:', token ? 'Present' : 'Missing');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const result = await response.json();
      console.log('📥 Profile response status:', response.status);
      console.log('📥 Profile response:', result);

      if (!response.ok) {
        throw new Error(result.msg || 'Không thể lấy thông tin người dùng');
      }

      return result;
    } catch (error) {
      console.error('❌ getUserProfile error:', error);
      throw error;
    }
  }

};