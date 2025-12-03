// services/listeningService.ts
import API_BASE_URL from '../api/api';
import { authService } from './authService';

export interface ListeningQuestion {
  question: string;
  options: string[];
  answer: number;
  explanation?: string;
}

export interface Listening {
  _id?: string;
  title: string;
  audioUrl: string;
  transcript: string;
  translation: string;
  level: string;
  lesson?: {
    _id: string;
    title: string;
    code: string;
    level: string;
  };
  author?: {
    _id: string;
    name: string;
    email: string;
  };
  duration: number;
  difficulty: string;
  tags: string[];
  questions: ListeningQuestion[];
  playCount?: number;
  attemptCount?: number;
  averageScore?: number;
  successRate?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ListeningResponse {
  listenings: Listening[];
  totalPages: number;
  currentPage: number;
  total: number;
}

class ListeningService {
  private async fetchWithAuth<T>(url: string, options: RequestInit = {}): Promise<T> {
    const token = await authService.getToken();
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    };

    console.log('🌐 Listening Service - Making request to:', url);

    const response = await fetch(url, { ...options, headers });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }
    
    return response.json();
  }

  // GET: Lấy tất cả listening
  async getListenings(params?: {
    level?: string;
    difficulty?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<ListeningResponse> {
    const queryParams = new URLSearchParams();
    if (params?.level) queryParams.append('level', params.level);
    if (params?.difficulty) queryParams.append('difficulty', params.difficulty);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page?.toString() || '1');
    if (params?.limit) queryParams.append('limit', params.limit?.toString() || '20');
    
    const url = `${API_BASE_URL}/listening${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.fetchWithAuth<ListeningResponse>(url);
  }

  // GET: Lấy listening theo ID
  async getListeningById(id: string): Promise<Listening> {
    return this.fetchWithAuth<Listening>(`${API_BASE_URL}/listening/${id}`);
  }

  // POST: Tạo listening mới
  async createListening(listeningData: Omit<Listening, '_id' | 'isActive' | 'playCount' | 'attemptCount' | 'averageScore' | 'successRate'>): Promise<Listening> {
    return this.fetchWithAuth<Listening>(`${API_BASE_URL}/listening`, {
      method: 'POST',
      body: JSON.stringify(listeningData),
    });
  }

  // PUT: Cập nhật listening
  async updateListening(id: string, listeningData: Partial<Listening>): Promise<Listening> {
    return this.fetchWithAuth<Listening>(`${API_BASE_URL}/listening/${id}`, {
      method: 'PUT',
      body: JSON.stringify(listeningData),
    });
  }

  // DELETE: Xóa listening
  async deleteListening(id: string): Promise<{ message: string }> {
    return this.fetchWithAuth<{ message: string }>(`${API_BASE_URL}/listening/${id}`, {
      method: 'DELETE',
    });
  }

  // GET: Lấy listening theo lesson
  async getListeningsByLesson(lessonId: string, params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<ListeningResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit?.toString() || '20');
    if (params?.search) queryParams.append('search', params.search || '');
    
    const url = `${API_BASE_URL}/listening/lesson/${lessonId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.fetchWithAuth<ListeningResponse>(url);
  }

  // POST: Tạo listening cho lesson
  async createListeningForLesson(lessonId: string, listeningData: Omit<Listening, '_id' | 'lesson' | 'level'> & { level?: string }): Promise<Listening> {
    return this.fetchWithAuth<Listening>(`${API_BASE_URL}/listening/lesson/${lessonId}`, {
      method: 'POST',
      body: JSON.stringify(listeningData),
    });
  }

  // GET: Lấy thống kê
  async getListeningStats(): Promise<any> {
    return this.fetchWithAuth(`${API_BASE_URL}/listening/stats`);
  }

  // GET: Lấy tags
  async getTags(): Promise<string[]> {
    return this.fetchWithAuth<string[]>(`${API_BASE_URL}/listening/tags`);
  }

  // POST: Upload audio
// services/listeningService.ts - SỬA HÀM uploadAudio
async uploadAudio(formData: FormData): Promise<any> {
  try {
    const token = await authService.getToken();
    const url = `${API_BASE_URL}/listening/upload`;
    
    console.log('🌐 Upload Audio Details:');
    console.log('  URL:', url);
    console.log('  Token exists:', !!token);
    
    // Test server connection first
    console.log('🔍 Testing server...');
    try {
      const testResponse = await fetch(API_BASE_URL.replace('/listening/upload', '/test'));
      const testData = await testResponse.text();
      console.log('✅ Server test:', testResponse.status, testData.substring(0, 50));
    } catch (testError) {
      console.error('❌ Server test failed:', testError);
    }
    
    // Prepare headers
    const headers: HeadersInit = {
      'Authorization': `Bearer ${token}`,
      // DO NOT set Content-Type for FormData - browser will set it with boundary
    };
    
    console.log('📤 Starting upload...');
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    console.log('📡 Upload response status:', response.status);
    console.log('📡 Upload response ok:', response.ok);
    
    // Get response as text first to debug
    const responseText = await response.text();
    console.log('📡 Response text (first 200 chars):', responseText.substring(0, 200));
    
    // Try to parse as JSON
    try {
      const data = JSON.parse(responseText);
      console.log('✅ Parsed response:', data);
      
      if (!response.ok) {
        throw new Error(data.message || `Upload failed: ${response.status}`);
      }
      
      return data;
    } catch (parseError) {
      console.error('❌ Failed to parse JSON:', parseError);
      
      // Check if it's HTML error page
      if (responseText.includes('<html') || responseText.includes('<!DOCTYPE')) {
        throw new Error(`Server returned HTML instead of JSON. Status: ${response.status}. Check if endpoint exists.`);
      }
      
      throw new Error(`Server returned invalid response: ${responseText.substring(0, 100)}`);
    }
    
  } catch (error: any) {
    console.error('❌ Upload catch error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack?.split('\n')[0]
    });
    
    // Re-throw with better error message
    if (error.message.includes('Network request failed')) {
      throw new Error(`Không thể kết nối đến server ${API_BASE_URL}. Kiểm tra:\n1. Server có đang chạy?\n2. Đúng IP?`);
    }
    
    throw error;
  }
}
  // POST: Tạo nhiều listening cùng lúc
  async bulkCreateListenings(listenings: Omit<Listening, '_id' | 'isActive' | 'playCount' | 'attemptCount' | 'averageScore' | 'successRate'>[], lessonId?: string): Promise<any> {
    return this.fetchWithAuth(`${API_BASE_URL}/listening/bulk-create`, {
      method: 'POST',
      body: JSON.stringify({ listenings, lessonId }),
    });
  }

  // POST: Thêm câu hỏi
  async addQuestion(listeningId: string, questionData: ListeningQuestion): Promise<Listening> {
    return this.fetchWithAuth<Listening>(`${API_BASE_URL}/listening/${listeningId}/questions`, {
      method: 'POST',
      body: JSON.stringify(questionData),
    });
  }

  // POST: Nộp bài listening
  async submitListening(listeningId: string, answers: any[]): Promise<any> {
    return this.fetchWithAuth(`${API_BASE_URL}/listening/${listeningId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
  }

  // GET: Lấy tiến độ
  async getListeningProgress(listeningId: string): Promise<any> {
    return this.fetchWithAuth(`${API_BASE_URL}/listening/progress/${listeningId}`);
  }
}

export const listeningService = new ListeningService();