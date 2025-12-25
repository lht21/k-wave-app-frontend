// src/services/lessonService.ts
import API_BASE_URL from '../api/api';
import { authService } from './authService';
import { Vocabulary } from './vocabularyService'; 
import { Listening } from './listeningService';
import { Grammar } from './grammarService'; 

export interface Lesson {
  _id?: string;
  code: string;
  title: string;
  level: string;
  description: string;
  order: number;
  estimatedDuration: number;
  isPremium: boolean;
  viewCount?: number;
  completionCount?: number;
  author?: {
    _id: string;
    name: string;
    email: string;
  };
  vocabulary?: Vocabulary[];
  grammar?: Grammar[];
  listening?: Listening[];
}

export interface LessonsResponse {
  lessons: Lesson[];
  totalPages: number;
  currentPage: number;
  total: number;
}

// Định nghĩa các interface cho response
export interface DeleteResponse {
  message: string;
  deletedLesson?: any;
}

export interface DeleteMultipleResponse {
  message: string;
  deletedCount: number;
}

class LessonService {
  private async fetchWithAuth<T>(url: string, options: RequestInit = {}): Promise<T> {
    try {
      const token = await authService.getToken();
      
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      };

      console.log('🌐 Making request to:', url);
      console.log('🌐 Method:', options.method || 'GET');

      const response = await fetch(url, { ...options, headers });
      
      const responseText = await response.text();
      console.log('🌐 Response status:', response.status);
      console.log('🌐 Response:', responseText.substring(0, 200));

      if (!response.ok) {
        let errorMessage = 'Request failed';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // Nếu không parse được JSON, dùng text
          errorMessage = responseText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // Parse JSON response
      return JSON.parse(responseText) as T;
    } catch (error) {
      console.error('Request error:', error);
      throw error;
    }
  }

  // GET: Lấy tất cả bài học
  async getLessons(params?: {
    level?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<LessonsResponse> {
    const queryParams = new URLSearchParams();
    if (params?.level) queryParams.append('level', params.level);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page?.toString() || '1');
    if (params?.limit) queryParams.append('limit', params.limit?.toString() || '10');
    
    const url = `${API_BASE_URL}/lessons${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.fetchWithAuth<LessonsResponse>(url);
  }
// GET: Lấy bài học của user hiện tại
async getMyLessons(params?: {
  level?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{
  lessons: Lesson[];
  total: number;
  currentPage: number;
  totalPages: number;
}> {
  const queryParams = new URLSearchParams();

  if (params?.level) queryParams.append('level', params.level);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
const url = `${API_BASE_URL}/lessons/my${
    queryParams.toString() ? `?${queryParams.toString()}` : ''
  }`;

  return this.fetchWithAuth(url);
}
  // GET: Lấy tất cả bài học dành cho học sinh
  async getLessonsForStudent(params?: {
    level?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<LessonsResponse> {
    const queryParams = new URLSearchParams();
    if (params?.level) queryParams.append('level', params.level);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page?.toString() || '1');
    if (params?.limit) queryParams.append('limit', params.limit?.toString() || '10');

    const url = `${API_BASE_URL}/lessons/mode/student${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.fetchWithAuth<LessonsResponse>(url);
  }

  // GET: Lấy bài học theo ID
  async getLessonById(id: string): Promise<Lesson> {
    return this.fetchWithAuth<Lesson>(`${API_BASE_URL}/lessons/${id}`);
  }

  // POST: Tạo bài học mới
  async createLesson(lessonData: Omit<Lesson, '_id' | 'author' | 'viewCount' | 'completionCount'>): Promise<Lesson> {
    return this.fetchWithAuth<Lesson>(`${API_BASE_URL}/lessons`, {
      method: 'POST',
      body: JSON.stringify(lessonData),
    });
  }

  // PUT: Cập nhật bài học
  async updateLesson(id: string, lessonData: Partial<Lesson>): Promise<Lesson> {
    return this.fetchWithAuth<Lesson>(`${API_BASE_URL}/lessons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(lessonData),
    });
  }

  // DELETE: Xóa bài học (hard delete)
  async deleteLesson(id: string): Promise<DeleteResponse> {
    return this.fetchWithAuth<DeleteResponse>(`${API_BASE_URL}/lessons/${id}`, {
      method: 'DELETE',
    });
  }

  // POST: Xóa nhiều bài học
  async deleteMultipleLessons(ids: string[]): Promise<DeleteMultipleResponse> {
    return this.fetchWithAuth<DeleteMultipleResponse>(`${API_BASE_URL}/lessons/delete-multiple`, {
      method: 'POST',
      body: JSON.stringify({ ids }),
    });
  }
}

export const lessonService = new LessonService();