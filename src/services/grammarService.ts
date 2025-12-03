import API_BASE_URL from '../api/api';
import { authService } from './authService';

export interface ExampleSentence {
  korean: string;
  vietnamese: string;
}

export interface Grammar {
  _id?: string;
  structure: string;
  meaning: string;
  explanation: string;
  usage: string;
  level: string;
  exampleSentences: ExampleSentence[];
  similarGrammar: string[];
  isActive?: boolean;
  difficulty?: string;
  tags?: string[];
  viewCount?: number;
}

export interface GrammarResponse {
  grammar: Grammar[];
  totalPages: number;
  currentPage: number;
  total: number;
}

class GrammarService {
  private async fetchWithAuth<T>(url: string, options: RequestInit = {}): Promise<T> {
    const token = await authService.getToken();
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    };

    console.log('🌐 Grammar Service - Making request to:', url);

    const response = await fetch(url, { ...options, headers });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }
    
    return response.json();
  }

  // GET: Lấy tất cả ngữ pháp
  async getGrammar(params?: {
    level?: string;
    difficulty?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<GrammarResponse> {
    const queryParams = new URLSearchParams();
    if (params?.level) queryParams.append('level', params.level);
    if (params?.difficulty) queryParams.append('difficulty', params.difficulty);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page?.toString() || '1');
    if (params?.limit) queryParams.append('limit', params.limit?.toString() || '20');
    
    const url = `${API_BASE_URL}/grammar${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.fetchWithAuth<GrammarResponse>(url);
  }

  // GET: Lấy ngữ pháp theo level
  async getGrammarByLevel(level: string, params?: {
    page?: number;
    limit?: number;
    difficulty?: string;
    search?: string;
  }): Promise<GrammarResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit?.toString() || '50');
    if (params?.difficulty) queryParams.append('difficulty', params.difficulty);
    if (params?.search) queryParams.append('search', params.search);
    
    const url = `${API_BASE_URL}/grammar/levels/${level}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.fetchWithAuth<GrammarResponse>(url);
  }

  // GET: Lấy ngữ pháp theo ID
  async getGrammarById(id: string): Promise<Grammar> {
    return this.fetchWithAuth<Grammar>(`${API_BASE_URL}/grammar/${id}`);
  }

  // POST: Tạo ngữ pháp mới
  async createGrammar(grammarData: Omit<Grammar, '_id' | 'isActive' | 'viewCount'>): Promise<Grammar> {
    return this.fetchWithAuth<Grammar>(`${API_BASE_URL}/grammar`, {
      method: 'POST',
      body: JSON.stringify(grammarData),
    });
  }

  // PUT: Cập nhật ngữ pháp
  async updateGrammar(id: string, grammarData: Partial<Grammar>): Promise<Grammar> {
    return this.fetchWithAuth<Grammar>(`${API_BASE_URL}/grammar/${id}`, {
      method: 'PUT',
      body: JSON.stringify(grammarData),
    });
  }

  // DELETE: Xóa ngữ pháp (soft delete)
  async deleteGrammar(id: string): Promise<{ message: string }> {
    return this.fetchWithAuth<{ message: string }>(`${API_BASE_URL}/grammar/${id}`, {
      method: 'DELETE',
    });
  }

  // GET: Lấy thống kê
  async getGrammarStats(): Promise<any> {
    return this.fetchWithAuth(`${API_BASE_URL}/grammar/stats`);
  }

  // GET: Lấy tags
  async getTags(): Promise<string[]> {
    return this.fetchWithAuth<string[]>(`${API_BASE_URL}/grammar/tags`);
  }

  // POST: Tạo nhiều ngữ pháp cùng lúc
  async bulkCreateGrammar(grammarList: Omit<Grammar, '_id' | 'isActive' | 'viewCount'>[]): Promise<any> {
    return this.fetchWithAuth(`${API_BASE_URL}/grammar/bulk-create`, {
      method: 'POST',
      body: JSON.stringify({ grammarList }),
    });
  }

  async getGrammarByLesson(lessonId: string, params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<GrammarResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit?.toString() || '50');
    if (params?.search) queryParams.append('search', params.search || '');
    
    const url = `${API_BASE_URL}/grammar/lesson/${lessonId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.fetchWithAuth<GrammarResponse>(url);
  }

  // ✅ THÊM: Tạo grammar cho lesson (GIỐNG VOCABULARY)
  async createGrammarForLesson(
    lessonId: string, 
    grammarData: Omit<Grammar, '_id' | 'lesson' | 'level'>
  ): Promise<Grammar> {
    return this.fetchWithAuth<Grammar>(`${API_BASE_URL}/grammar/lesson/${lessonId}`, {
      method: 'POST',
      body: JSON.stringify(grammarData),
    });
  }
}


export const grammarService = new GrammarService();