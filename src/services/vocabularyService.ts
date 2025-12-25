// src/services/vocabularyService.ts
import API_BASE_URL from '../api/api';
import { authService } from './authService';

export interface Vocabulary {
  _id?: string;
  word: string;
  meaning: string;
  pronunciation?: string;
  type: string;
  category?: string;
  examples?: string[];
  level: string;
  status?: 'unlearned' | 'learning' | 'mastered';
  lesson?: {
    _id: string;
    title: string;
    code: string;
    level: string;
  };
  isActive?: boolean;
}

export interface VocabularyResponse {
  vocabulary: Vocabulary[];
  totalPages: number;
  currentPage: number;
  total: number;
}

class VocabularyService {
  
  
  async getVocabForLearning(lessonId: string): Promise<{ success: boolean, data: Vocabulary[] }> {
    const url = `${API_BASE_URL}/vocabulary/lesson/${lessonId}/learn`;
    console.log('📖 Fetching vocabulary for learning (excluding mastered):', lessonId);
    return this.fetchWithAuth<{ success: boolean, data: Vocabulary[] }>(url);
  }

  

  private async fetchWithAuth<T>(url: string, options: RequestInit = {}): Promise<T> {
    const token = await authService.getToken();
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    };

    console.log('🌐 Vocabulary Service - Making request to:', url);

    const response = await fetch(url, { ...options, headers });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }
    
    return response.json();
  }

  // GET: Lấy từ vựng theo lesson
  async getVocabularyByLesson(
    lessonId: string, 
    params?: {
      search?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<VocabularyResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append('search', params.search);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      
      const url = `${API_BASE_URL}/vocabulary/lesson/${lessonId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      console.log('📚 Fetching vocabulary for lesson:', lessonId);
      return await this.fetchWithAuth<VocabularyResponse>(url);
    } catch (error) {
      console.error('Error fetching vocabulary:', error);
      throw error;
    }
  }

  // POST: Tạo từ vựng cho lesson
  async createVocabularyForLesson(lessonId: string, vocabularyData: Omit<Vocabulary, '_id' | 'lesson' | 'level'>): Promise<Vocabulary> {
    const url = `${API_BASE_URL}/vocabulary/lesson/${lessonId}`;
    
    console.log('📝 Creating vocabulary for lesson:', lessonId, vocabularyData);
    
    return this.fetchWithAuth<Vocabulary>(url, {
      method: 'POST',
      body: JSON.stringify(vocabularyData),
    });
  }

  // PUT: Cập nhật từ vựng
  async updateVocabulary(id: string, vocabularyData: Partial<Vocabulary>): Promise<Vocabulary> {
    return this.fetchWithAuth<Vocabulary>(`${API_BASE_URL}/vocabulary/${id}`, {
      method: 'PUT',
      body: JSON.stringify(vocabularyData),
    });
  }

  // DELETE: Xóa từ vựng
  async deleteVocabulary(id: string): Promise<{ message: string }> {
    return this.fetchWithAuth<{ message: string }>(`${API_BASE_URL}/vocabulary/${id}`, {
      method: 'DELETE',
    });
  }

  // GET: Lấy tất cả từ vựng (filter)
  async getVocabulary(params?: {
    level?: string;
    lesson?: string;
    category?: string;
    type?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<VocabularyResponse> {
    const queryParams = new URLSearchParams();
    if (params?.level) queryParams.append('level', params.level);
    if (params?.lesson) queryParams.append('lesson', params.lesson);
    if (params?.category) queryParams.append('category', params.category);
    if (params?.type) queryParams.append('type', params.type);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page?.toString() || '1');
    if (params?.limit) queryParams.append('limit', params.limit?.toString() || '20');
    
    const url = `${API_BASE_URL}/vocabulary${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.fetchWithAuth<VocabularyResponse>(url);
  }
}

export const vocabularyService = new VocabularyService();