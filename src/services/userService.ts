import API_BASE_URL, { getAuthHeadersWithToken } from '../api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_URL = API_BASE_URL + "/user";

interface UpdateProfileData {
  fullName: string;
  avatar?: string;
}

interface UserResponse {
  success: boolean;
  msg: string;
  user?: any;
  error?: string;
}

export const userService = {
  // Cập nhật profile của user
  updateProfile: async (data: UpdateProfileData): Promise<UserResponse> => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      if (!token) {
        return {
          success: false,
          msg: 'Không tìm thấy token xác thực',
          error: 'No auth token'
        };
      }

      const response = await fetch(`${USER_URL}/profile`, {
        method: 'PATCH',
        headers: getAuthHeadersWithToken(token),
        body: JSON.stringify(data)
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log('✅ Profile updated successfully');
        return result;
      } else {
        console.error('❌ Profile update failed:', result.msg);
        return result;
      }
      
    } catch (error) {
      console.error('❌ Profile update error:', error);
      return {
        success: false,
        msg: 'Lỗi kết nối mạng',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  // Lấy profile của user
  getProfile: async (): Promise<UserResponse> => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      if (!token) {
        return {
          success: false,
          msg: 'Không tìm thấy token xác thực',
          error: 'No auth token'
        };
      }

      const response = await fetch(`${USER_URL}/profile`, {
        method: 'GET',
        headers: getAuthHeadersWithToken(token)
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log('✅ Profile fetched successfully');
        return result;
      } else {
        console.error('❌ Get profile failed:', result.msg);
        return result;
      }
      
    } catch (error) {
      console.error('❌ Get profile error:', error);
      return {
        success: false,
        msg: 'Lỗi kết nối mạng',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
};
// services/userService.ts
import API_BASE_URL from '../api/api';
import { authService } from './authService';

export interface UserProfile {
  _id: string;
  username: string;
  fullName: string;
  email: string;
  role: string;
  level: string;
  avatar: string;
  topikAchievement: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateProfileData {
  fullName?: string;
  level?: string;
  topikAchievement?: number | null;
}

export interface AvatarResponse {
  avatar: string;
  message?: string;
}

export interface UserProfileResponse {
  message?: string;
  user?: UserProfile;
}

class UserService {
  private async fetchWithAuth<T>(url: string, options: RequestInit = {}): Promise<T> {
    try {
      const token = await authService.getToken();
      
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      };

      console.log('🌐 [UserService] Making request to:', url);
      console.log('🌐 [UserService] Method:', options.method || 'GET');

      const response = await fetch(url, { ...options, headers });
      
      const responseText = await response.text();
      console.log('🌐 [UserService] Response status:', response.status);
      console.log('🌐 [UserService] Response:', responseText.substring(0, 200));

      if (!response.ok) {
        let errorMessage = 'Request failed';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorData.msg || errorMessage;
        } catch (e) {
          // Nếu không parse được JSON, dùng text
          errorMessage = responseText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // Parse JSON response
      return JSON.parse(responseText) as T;
    } catch (error) {
      console.error('[UserService] Request error:', error);
      throw error;
    }
  }

  // GET: Lấy thông tin profile
  async getProfile(): Promise<UserProfile> {
    return this.fetchWithAuth<UserProfile>(`${API_BASE_URL}/user/profile`);
  }

  // PATCH: Cập nhật thông tin profile
  async updateUserProfile(userData: UpdateProfileData): Promise<UserProfileResponse> {
    return this.fetchWithAuth<UserProfileResponse>(`${API_BASE_URL}/user/profile`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  }

  // POST: Upload avatar (xử lý FormData)
  async uploadAvatar(imageUri: string): Promise<AvatarResponse> {
    try {
      const token = await authService.getToken();
      
      // Tạo FormData
      const formData = new FormData();
      
      // Lấy đuôi file (jpg, png)
      const uriParts = imageUri.split('.');
      const fileType = uriParts[uriParts.length - 1];
      
      // Tạo file object cho React Native
      const file = {
        uri: imageUri,
        name: `avatar.${fileType}`,
        type: `image/${fileType === 'jpg' ? 'jpeg' : fileType}`,
      } as any;
      
      formData.append('avatar', file);
      
      console.log('📁 [UserService] Uploading avatar...');
      
      const response = await fetch(`${API_BASE_URL}/user/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Note: KHÔNG đặt 'Content-Type' header khi dùng FormData
          // React Native sẽ tự động set đúng boundary
        },
        body: formData,
      });
      
      const responseText = await response.text();
      console.log('🌐 [UserService] Upload response status:', response.status);
      console.log('🌐 [UserService] Upload response:', responseText);
      
      if (!response.ok) {
        let errorMessage = 'Upload failed';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorData.msg || errorMessage;
        } catch (e) {
          errorMessage = responseText || errorMessage;
        }
        throw new Error(errorMessage);
      }
      
      return JSON.parse(responseText) as AvatarResponse;
    } catch (error) {
      console.error('[UserService] Upload error:', error);
      throw error;
    }
  }
}

export const userService = new UserService();
