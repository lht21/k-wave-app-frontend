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