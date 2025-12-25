// services/listeningService.ts
import API_BASE_URL from '../api/api';
import { authService } from './authService';

// --- CÁC INTERFACE CƠ BẢN ---
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
  duration: number;
  difficulty: string;
  tags: string[];
  questions: ListeningQuestion[];
  // Các trường thống kê
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

// --- 👇 CÁC INTERFACE MỚI CHO PHẦN NỘP BÀI (TƯƠNG TỰ READING) ---
export interface ListeningResultDetail {
  questionId: string;
  userAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
  explanation?: string;
}

export interface ListeningSubmissionResponse {
  success: boolean;
  message?: string;
  data: {
    score: number;
    correctCount: number;
    totalQuestions: number;
    results: ListeningResultDetail[];
    passed: boolean;
  };
}

class ListeningService {
  private async fetchWithAuth<T>(url: string, options: RequestInit = {}): Promise<T> {
    const token = await authService.getToken();
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    };

    // console.log('🌐 Listening Service - Making request to:', url);

    const response = await fetch(url, { ...options, headers });
    
    if (!response.ok) {
      // Xử lý lỗi an toàn hơn, tránh crash nếu server trả về HTML lỗi
      const responseText = await response.text();
      let errorMessage = 'Request failed';
      try {
          const errorJson = JSON.parse(responseText);
          errorMessage = errorJson.message || errorMessage;
      } catch {
          errorMessage = responseText.substring(0, 100);
      }
      throw new Error(errorMessage);
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
  async getListeningsByLesson(lessonId: string): Promise<Listening[]> {
    const url = `${API_BASE_URL}/listening/lesson/${lessonId}`;
    const response = await this.fetchWithAuth<{ success: boolean; data: Listening[] }>(url);
    return response.data;
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

  // POST: Upload audio (Giữ nguyên logic upload phức tạp của bạn)
  async uploadAudio(formData: FormData): Promise<any> {
    try {
      const token = await authService.getToken();
      const url = `${API_BASE_URL}/listening/upload`;
      
      const headers: HeadersInit = {
        'Authorization': `Bearer ${token}`,
      };
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      const responseText = await response.text();
      
      try {
        const data = JSON.parse(responseText);
        if (!response.ok) {
          throw new Error(data.message || `Upload failed: ${response.status}`);
        }
        return data;
      } catch (parseError) {
        if (responseText.includes('<html')) {
          throw new Error(`Server returned HTML instead of JSON. Status: ${response.status}.`);
        }
        throw new Error(`Server returned invalid response: ${responseText.substring(0, 100)}`);
      }
      
    } catch (error: any) {
      console.error('❌ Upload error:', error);
      if (error.message.includes('Network request failed')) {
        throw new Error(`Không thể kết nối đến server ${API_BASE_URL}.`);
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

  // --- 👇 HÀM ĐÃ SỬA ĐỔI: TƯƠNG TỰ submitReading ---
  /**
   * Nộp bài Listening
   * @param listeningId ID bài nghe
   * @param lessonId ID bài học (để update progress)
   * @param answers Object map { "questionId": selectedIndex }
   */
  async submitListening(
    listeningId: string, 
    lessonId: string, 
    answers: Record<string, number>
  ): Promise<ListeningSubmissionResponse> {
    try {
      // 1. Kiểm tra ID
      if (!listeningId || !lessonId) throw new Error("Missing ID: listeningId or lessonId");

      const token = await authService.getToken();
      
      // 2. Gọi API
      const response = await fetch(`${API_BASE_URL}/listening/${listeningId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ lessonId, answers }),
      });

      const data = await response.json();
      
      // 3. Xử lý lỗi từ server
      if (!response.ok) {
        throw new Error(data.message || 'Submission failed');
      }
      
      return data;
    } catch (error) {
      console.error('Submit listening error:', error);
      throw error;
    }
  }

  // GET: Lấy tiến độ
  async getListeningProgress(listeningId: string): Promise<any> {
    return this.fetchWithAuth(`${API_BASE_URL}/listening/progress/${listeningId}`);
  }
}

export const listeningService = new ListeningService();