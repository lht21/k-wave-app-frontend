import API_BASE_URL from '../api/api';
import { authService } from './authService';

export interface Speaking {
  _id: string;
  title: string;
  prompt: string;
  description?: string;
  level: string;
  type: string;
  duration?: number;
  tags?: string[];
  hints?: string[];
  sampleAnswer?: string;
  audioUrl?: string;
  author?: {
    _id: string;
    name: string;
    email: string;
  };
  lesson?: {
    _id: string;
    title: string;
    code: string;
    level: string;
  };
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SpeakingSubmission {
  _id: string;
  student: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    level: string;
  };
  speaking: {
    _id: string;
    title: string;
    prompt: string;
    level: string;
    type: string;
  };
  audioUrl: string;
  recordingDuration: number;
  wordCount: number;
  fileSize: number;
  status: 'submitted' | 'evaluated';
  evaluation?: {
    pronunciation: number;
    fluency: number;
    vocabulary: number;
    grammar: number;
    content: number;
    feedback?: string;
    suggestions?: string;
    evaluatedBy: string;
    evaluatedAt: string;
  };
  submittedAt: string;
}

// Thêm vào file speakingService.ts
export interface AudioFile {
  uri: string;
  name: string;
  type: string;
  size?: number; // Thay đổi thành optional
}
export interface SpeakingResponse {
  speakings: Speaking[];
  totalPages: number;
  currentPage: number;
  total: number;
}

export interface SpeakingSubmissionResponse {
  submissions: SpeakingSubmission[];
  totalPages: number;
  currentPage: number;
  total: number;
}

export interface EvaluationData {
  pronunciation: number;
  fluency: number;
  vocabulary: number;
  grammar: number;
  content: number;
  feedback?: string;
  suggestions?: string;
    lessonId?: string; 
}

class SpeakingService {
  private async fetchWithAuth<T>(url: string, options: RequestInit = {}): Promise<T> {
    const token = await authService.getToken();
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }
    
    return response.json();
  }

  // GET: Lấy speaking theo lesson
  async getSpeakingByLesson(lessonId: string): Promise<Speaking[]> {
    const url = `${API_BASE_URL}/speakings/lesson/${lessonId}`;
    
    // Gọi API với cấu trúc response mới { success: boolean, data: Speaking[] }
    const response = await this.fetchWithAuth<{ success: boolean; data: Speaking[] }>(url);
    
    // Trả về mảng data trực tiếp để UI map
    return response.data || [];
  }

  // POST: Tạo speaking cho lesson
  async createSpeakingForLesson(
    lessonId: string, 
    speakingData: Omit<Speaking, '_id' | 'lesson' | 'author' | 'createdAt' | 'updatedAt'>
  ): Promise<Speaking> {
    const url = `${API_BASE_URL}/speakings/lesson/${lessonId}`;
    
    console.log('📝 Creating speaking for lesson:', lessonId, speakingData);
    
    return this.fetchWithAuth<Speaking>(url, {
      method: 'POST',
      body: JSON.stringify(speakingData),
    });
  }

  // GET: Lấy tất cả speaking (có filter)
  async getSpeakings(params?: {
    level?: string;
    type?: string;
    lesson?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<SpeakingResponse> {
    const queryParams = new URLSearchParams();
    if (params?.level) queryParams.append('level', params.level);
    if (params?.type) queryParams.append('type', params.type);
    if (params?.lesson) queryParams.append('lesson', params.lesson);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page?.toString() || '1');
    if (params?.limit) queryParams.append('limit', params.limit?.toString() || '10');
    
    const url = `${API_BASE_URL}/speakings${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.fetchWithAuth<SpeakingResponse>(url);
  }

  // GET: Lấy chi tiết speaking
  async getSpeakingById(id: string): Promise<Speaking> {
    return this.fetchWithAuth<Speaking>(`${API_BASE_URL}/speakings/${id}`);
  }

  // POST: Tạo speaking mới
  async createSpeaking(speakingData: Partial<Speaking>): Promise<Speaking> {
    return this.fetchWithAuth<Speaking>(`${API_BASE_URL}/speakings`, {
      method: 'POST',
      body: JSON.stringify(speakingData),
    });
  }

  // PUT: Cập nhật speaking
  async updateSpeaking(id: string, speakingData: Partial<Speaking>): Promise<Speaking> {
    return this.fetchWithAuth<Speaking>(`${API_BASE_URL}/speakings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(speakingData),
    });
  }

  // DELETE: Xóa speaking
  async deleteSpeaking(id: string): Promise<{ message: string }> {
    return this.fetchWithAuth<{ message: string }>(`${API_BASE_URL}/speakings/${id}`, {
      method: 'DELETE',
    });
  }

  // POST: Upload audio
async uploadAudio(file: AudioFile): Promise<{
  message: string;
  audioUrl: string;
  filename: string;
  size: number;
}> {
  const token = await authService.getToken();
  const formData = new FormData();
  
  // React Native cần đúng format
  formData.append('audio', {
    uri: file.uri,
    type: file.type || 'audio/m4a',
    name: file.name || 'recording.m4a',
  } as any); // Cast to any để tránh lỗi TypeScript

  console.log('📤 Uploading audio file:', {
    uri: file.uri,
    type: file.type,
    name: file.name,
    size: file.size
  });

  const response = await fetch(`${API_BASE_URL}/speakings/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Upload failed:', errorText);
    throw new Error(`Upload failed: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  console.log('✅ Upload successful:', result);
  return result;
}

  // POST: Nộp bài speaking
  async submitSpeaking(
    speakingId: string,
    data: {
      audioUrl: string;
      recordingDuration: number;
      wordCount?: number;
      fileSize?: number;
    }
  ): Promise<SpeakingSubmission> {
    return this.fetchWithAuth<SpeakingSubmission>(`${API_BASE_URL}/speakings/${speakingId}/submit`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // GET: Lấy danh sách bài nộp (cho giáo viên)
  async getSubmissions(params?: {
    status?: string;
    level?: string;
    page?: number;
    limit?: number;
  }): Promise<SpeakingSubmissionResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.append('status', params.status);
      if (params?.level) queryParams.append('level', params.level);
      if (params?.page) queryParams.append('page', params.page?.toString() || '1');
      if (params?.limit) queryParams.append('limit', params.limit?.toString() || '10');
      
      const url = `${API_BASE_URL}/speakings/submissions/all${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      console.log('📋 Fetching speaking submissions');
      return await this.fetchWithAuth<SpeakingSubmissionResponse>(url);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      throw error;
    }
  }

  // PUT: Chấm điểm bài nộp
  async evaluateSubmission(
    submissionId: string,
    evaluationData: EvaluationData
  ): Promise<SpeakingSubmission> {
    return this.fetchWithAuth<SpeakingSubmission>(
      `${API_BASE_URL}/speakings/submissions/${submissionId}/evaluate`,
      {
        method: 'PUT',
        body: JSON.stringify(evaluationData),
      }
    );
  }

  // DELETE: Xóa bài nộp
  async deleteSubmission(submissionId: string): Promise<{ message: string }> {
    return this.fetchWithAuth<{ message: string }>(
      `${API_BASE_URL}/speakings/submissions/${submissionId}`,
      {
        method: 'DELETE',
      }
    );
  }

    async getSubmissionsByLesson(
    lessonId: string,
    params?: {
      status?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<SpeakingSubmissionResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.append('status', params.status);
      if (params?.page) queryParams.append('page', params.page?.toString() || '1');
      if (params?.limit) queryParams.append('limit', params.limit?.toString() || '10');
      
      const url = `${API_BASE_URL}/speakings/submissions/lesson/${lessonId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      console.log('🎧 Fetching speaking submissions for lesson:', lessonId);
      return await this.fetchWithAuth<SpeakingSubmissionResponse>(url);
    } catch (error) {
      console.error('Error fetching submissions by lesson:', error);
      throw error;
    }
  }
}


export const speakingService = new SpeakingService();