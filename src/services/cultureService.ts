import API_BASE_URL from '../api/api'; // Đảm bảo cái này trỏ về http://IP_MAY_TINH:5000/api
import { authService } from './authService';

export interface Culture {
  _id?: string;
  title: string;
  subtitle: string;
  category: string;
  image: string; // URL từ server
  icon?: string;
  content: {
    type: 'text' | 'image';
    content?: string; // Cho text
    url?: string;     // Cho image
    caption?: string;
  }[];
  vocabulary: {
    word: string;
    meaning: string;
    pronunciation: string;
  }[];
  isPremium?: boolean;
  views?: number;
  likes?: number;
  author?: any;
}

const getHeaders = async (isMultipart = false) => {
  const token = await authService.getToken();
  const headers: any = {
    'Authorization': `Bearer ${token}`,
  };
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
};

export const cultureService = {
  // Lấy danh sách (kèm draft cho giáo viên)
  getAll: async (category?: string) => {
    let url = `${API_BASE_URL}/cultures?includeDrafts=true`;
    if (category && category !== 'Tất cả') {
      url += `&category=${encodeURIComponent(category)}`;
    }
    const headers = await getHeaders();
    const response = await fetch(url, { headers });
    return response.json();
  },

  // Lấy chi tiết
  getById: async (id: string) => {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE_URL}/cultures/${id}`, { headers });
    return response.json();
  },

  // Tạo mới
  create: async (data: Partial<Culture>) => {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE_URL}/cultures`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Cập nhật
  update: async (id: string, data: Partial<Culture>) => {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE_URL}/cultures/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Xóa
  delete: async (id: string) => {
    const headers = await getHeaders();
    await fetch(`${API_BASE_URL}/cultures/${id}`, {
      method: 'DELETE',
      headers,
    });
  },

  // Toggle Premium
  togglePremium: async (id: string) => {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE_URL}/cultures/${id}/toggle-premium`, {
      method: 'PATCH',
      headers,
    });
    return response.json();
  },

  // Upload Ảnh
  uploadImage: async (uri: string) => {
    const headers = await getHeaders(true); // Multipart header
    const formData = new FormData();

    // Lấy tên file từ uri
    const uriParts = uri.split('.');
    const fileType = uriParts[uriParts.length - 1];
    const fileName = `photo.${fileType}`;

    // Append file vào formData
    formData.append('image', {
      uri,
      name: fileName,
      type: `image/${fileType}`,
    } as any);

    const response = await fetch(`${API_BASE_URL}/cultures/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.msg || 'Upload failed');
    }
    
    // Server trả về { imageUrl: 'http://...' }
    return result.imageUrl; 
  }
};