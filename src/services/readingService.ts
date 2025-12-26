// src/services/readingService.ts
import API_BASE_URL from '../api/api';
import { authService } from './authService';

// Types chung
export interface Question {
  _id?: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface ReadingExercise {
  _id: string;
  title: string;
  content: string;
  questions: {
    _id: string;
    question: string;
    options: string[]; // Backend lưu mảng string ["A", "B"]
    // answer: number (Ẩn hoặc hiện tùy logic)
  }[];
}

export interface ReadingResultDetail {
    questionId: string;
    userAnswer: number;
    correctAnswer: number;
    isCorrect: boolean;
    explanation: string;
}

export interface ReadingSubmissionResponse {
    success: boolean;
    data: {
        score: number;
        correctCount: number;
        totalQuestions: number;
        results: ReadingResultDetail[];
        passed: boolean;
    };
}



export interface Reading {
  _id?: string;
  title: string;
  content: string;
  translation: string;
  level: string;
  difficulty?: string;
  tags?: string[];
  questions: Question[];
  lesson?: string | {
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
  viewCount?: number;
  attemptCount?: number;
  averageScore?: number;
  isActive?: boolean;
}

export interface ReadingResponse {
  readings: Reading[];
  totalPages: number;
  currentPage: number;
  total: number;
}

class ReadingService {
  private async fetchWithAuth<T>(url: string, options: RequestInit = {}): Promise<T> {
    const token = await authService.getToken();
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    };

    console.log('🌐 Reading Service - Making request to:', url);

    const response = await fetch(url, { ...options, headers });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }
    
    return response.json();
  }

async getReadingsByLesson(lessonId: string): Promise<{ success: boolean; readings: Reading[] }> {
  const url = `${API_BASE_URL}/readings/lesson/${lessonId}`;
  return this.fetchWithAuth<{ success: boolean; readings: Reading[] }>(url);
}
  // POST: Tạo bài đọc cho lesson
  async createReadingForLesson(lessonId: string, readingData: Omit<Reading, '_id' | 'lesson' | 'author'>): Promise<Reading> {
    const url = `${API_BASE_URL}/readings/lesson/${lessonId}`;
    
    console.log('📝 Creating reading for lesson:', lessonId, readingData);
    
    return this.fetchWithAuth<Reading>(url, {
      method: 'POST',
      body: JSON.stringify(readingData),
    });
  }

  // GET: Lấy bài đọc theo ID
  async getReadingById(id: string): Promise<Reading> {
    return this.fetchWithAuth<Reading>(`${API_BASE_URL}/readings/${id}`);
  }

  // PUT: Cập nhật bài đọc
  async updateReading(id: string, readingData: Partial<Reading>): Promise<Reading> {
    return this.fetchWithAuth<Reading>(`${API_BASE_URL}/readings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(readingData),
    });
  }

  // DELETE: Xóa bài đọc
  async deleteReading(id: string): Promise<{ message: string }> {
    return this.fetchWithAuth<{ message: string }>(`${API_BASE_URL}/readings/${id}`, {
      method: 'DELETE',
    });
  }

  // GET: Lấy tất cả bài đọc (filter)
  async getReadings(params?: {
    level?: string;
    difficulty?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<ReadingResponse> {
    const queryParams = new URLSearchParams();
    if (params?.level) queryParams.append('level', params.level);
    if (params?.difficulty) queryParams.append('difficulty', params.difficulty);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page?.toString() || '1');
    if (params?.limit) queryParams.append('limit', params.limit?.toString() || '10');
    
    const url = `${API_BASE_URL}/readings${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.fetchWithAuth<ReadingResponse>(url);
  }

  // POST: Nộp bài làm
  async submitReading(
      readingId: string, 
      lessonId: string, 
      answers: Record<string, number>
  ): Promise<ReadingSubmissionResponse> {
      try {
          if (!readingId || !lessonId) throw new Error("Missing ID");

          const token = await authService.getToken();
          const response = await fetch(`${API_BASE_URL}/readings/${readingId}/submit`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({ lessonId, answers }),
          });

          const data = await response.json();
          if (!response.ok) throw new Error(data.message || 'Submission failed');
          
          return data;
      } catch (error) {
          console.error('Submit reading error:', error);
          throw error;
      }
  }

  // GET: Thống kê
  async getReadingStats() {
    return this.fetchWithAuth(`${API_BASE_URL}/readings/stats`);
  }

  // GET: Tags
  async getTags() {
    return this.fetchWithAuth<string[]>(`${API_BASE_URL}/readings/tags`);
  }

  // POST: Bulk create
  async bulkCreateReadings(lessonId: string, readings: Reading[]) {
    return this.fetchWithAuth(`${API_BASE_URL}/readings/bulk-create`, {
      method: 'POST',
      body: JSON.stringify({ readings, lessonId }),
    });
  }

  // Thêm hàm createReading (không có lesson)
  async createReading(readingData: Omit<Reading, '_id' | 'author'>): Promise<Reading> {
    const url = `${API_BASE_URL}/readings`;
    
    console.log('📝 Creating reading:', readingData);
    
    return this.fetchWithAuth<Reading>(url, {
      method: 'POST',
      body: JSON.stringify(readingData),
    });
  }
}

export const readingService = new ReadingService();