import API_BASE_URL from '../api/api';
import { authService } from './authService';

export interface Writing {
  _id: string;
  title: string;
  type: string;
  prompt: string;
  instruction?: string;
  lesson?: {
    _id: string;
    title: string;
    code: string;
    level: string;
  };
  minWords: number;
  maxWords?: number;
  targetWords?: number;
  level: string;
  difficulty: string;
  wordHint: string[];
  grammarHint: string[];
  structureHint?: string; // THÊM DÒNG NÀY
  sampleAnswer?: string;
  sampleTranslation?: string;
  sampleWordCount?: number;
  estimatedTime: number;
  timeLimit?: number;
  attemptCount: number;
  averageScore: number;
  completionRate: number;
  averageWordCount: number;
  isActive: boolean;
  isPublic: boolean;
  author?: {
    _id: string;
    name: string;
    email: string;
  };
  evaluationCriteria?: {
    grammarWeight: number;
    vocabularyWeight: number;
    structureWeight: number;
    contentWeight: number;
    coherenceWeight: number;
  };
  tags: string[];
  createdAt: string;
  updatedAt: string;
}
// Interface cho data gửi lên khi tạo/cập nhật
export interface WritingCreateData {
  title: string;
  prompt: string;
  instruction?: string;
  level: string;
  type: string;
  minWords: number;
  maxWords?: number;
  wordHint?: string[];
  grammarHint?: string[];
  structureHint?: string; // THÊM DÒNG NÀY
  sampleAnswer?: string;
  sampleTranslation?: string;
  estimatedTime?: number;
  difficulty?: string;
  tags?: string[];
}

export interface WritingSubmission {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    level: string;
  };
  writing: {
    _id: string;
    title: string;
    prompt: string;
    level: string;
    type: string;
    minWords: number;
  };
  content: string;
  wordCount: number;
  charCount: number;
  timeSpent: number;
  submittedAt: string;
  isDraft: boolean;
  draftSavedAt?: string;
  status: 'draft' | 'submitted' | 'pending' | 'evaluated' | 'returned' | 'resubmitted';
  evaluation?: {
    score: number;
    grammar: number;
    vocabulary: number;
    structure: number;
    content: number;
    coherence: number;
    feedback: string;
    corrections?: string;
    suggestions?: string;
    strengths?: string[];
    areasForImprovement?: string[];
    commonErrors?: Array<{
      type: string;
      description: string;
      correction: string;
    }>;
    evaluatedBy: string;
    evaluatedAt: string;
  };
  lesson?: {
    _id: string;
    title: string;
    code: string;
  };
}

export interface WritingResponse {
  writings: Writing[];
  totalPages: number;
  currentPage: number;
  total: number;
}

export interface WritingSubmissionResponse {
  submissions: WritingSubmission[];
  totalPages: number;
  currentPage: number;
  total: number;
}

export interface EvaluationData {
  grammar: number;
  vocabulary: number;
  structure: number;
  content: number;
  coherence: number;
  feedback: string;
  corrections?: string;
  suggestions?: string;
}

export interface SubmissionData {
  content: string;
  timeSpent?: number;
  isDraft?: boolean;
  lessonId?: string;
}

class WritingService {
// Sửa hàm fetchWithAuth để log chi tiết hơn
private async fetchWithAuth<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = await authService.getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  console.log('🔗 [fetchWithAuth] URL:', url);
  console.log('🔗 [fetchWithAuth] Method:', options.method || 'GET');
  console.log('🔗 [fetchWithAuth] Headers:', headers);

  const response = await fetch(url, { ...options, headers });
  
  // Log response status và headers
  console.log('🔗 [fetchWithAuth] Response Status:', response.status);
  console.log('🔗 [fetchWithAuth] Response OK:', response.ok);
  
  // Kiểm tra response type
  const contentType = response.headers.get('content-type');
  console.log('🔗 [fetchWithAuth] Content-Type:', contentType);
  
  // Lấy response text để debug
  const responseText = await response.text();
  console.log('🔗 [fetchWithAuth] Response Text (first 500 chars):', responseText.substring(0, 500));
  
  if (!response.ok) {
    // Kiểm tra nếu response là HTML (có <)
    if (responseText.includes('<') && responseText.includes('html')) {
      console.error('❌ Server returned HTML instead of JSON. Might be 404/500 page.');
      
      if (response.status === 404) {
        throw new Error('API endpoint không tồn tại (404)');
      } else if (response.status === 500) {
        throw new Error('Server lỗi (500)');
      } else {
        throw new Error(`Server trả về HTML: ${response.status} ${response.statusText}`);
      }
    }
    
    // Cố gắng parse JSON nếu có
    try {
      const errorJson = JSON.parse(responseText);
      throw new Error(errorJson.message || 'Request failed');
    } catch (jsonError) {
      throw new Error(`Request failed: ${response.status} ${response.statusText}`);
    }
  }
  
  // Parse response
  try {
    if (responseText.trim() === '') {
      return {} as T;
    }
    return JSON.parse(responseText);
  } catch (parseError) {
    console.error('❌ JSON Parse Error:', parseError);
    console.error('❌ Response was:', responseText);
    throw new Error('Không thể parse JSON từ server');
  }
}

// Sửa hàm createWritingForLesson
async createWritingForLesson(
  lessonId: string, 
  writingData: WritingCreateData
): Promise<Writing> {
  try {
    // KIỂM TRA KỸ URL - đảm bảo đúng endpoint
    const url = `${API_BASE_URL}/writings/lesson/${lessonId}`;
    
    console.log('📝 [createWritingForLesson] URL:', url);
    console.log('📝 [createWritingForLesson] Lesson ID:', lessonId);
    console.log('📝 [createWritingForLesson] Writing Data:', writingData);

    // Clean data - đảm bảo không gửi undefined
    const cleanedData: any = {};
    Object.keys(writingData).forEach(key => {
      const value = writingData[key as keyof WritingCreateData];
      // Chỉ gửi các trường có giá trị (không phải undefined, null hoặc empty string)
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          // Chỉ gửi array nếu có phần tử
          if (value.length > 0) {
            cleanedData[key] = value;
          }
        } else {
          cleanedData[key] = value;
        }
      }
    });

    // Thêm các trường mặc định REQUIRED từ model
    const fullData = {
      ...cleanedData,
      // Đảm bảo các trường required có giá trị mặc định
      attemptCount: 0,
      averageScore: 0,
      completionRate: 0,
      averageWordCount: 0,
      isActive: true,
      isPublic: false,
    };
    
    console.log('📝 [createWritingForLesson] Final data to send:', fullData);
    
    const response = await this.fetchWithAuth<Writing>(url, {
      method: 'POST',
      body: JSON.stringify(fullData),
    });
    
    console.log('✅ [createWritingForLesson] Writing created successfully:', response._id);
    return response;
  } catch (error: any) {
    console.error('❌ [createWritingForLesson] Error:', error);
    
    // Cung cấp thông báo lỗi cụ thể
    let errorMessage = 'Không thể tạo bài writing';
    
    if (error.message.includes('API endpoint không tồn tại')) {
      errorMessage = 'API endpoint không tồn tại. Kiểm tra lại đường dẫn.';
    } else if (error.message.includes('Server lỗi')) {
      errorMessage = 'Server đang gặp lỗi. Vui lòng thử lại sau.';
    } else if (error.message.includes('HTML')) {
      errorMessage = 'Server trả về lỗi không mong đợi.';
    } else {
      errorMessage = error.message || 'Lỗi không xác định';
    }
    
    throw new Error(errorMessage);
  }
}

  // GET: Lấy writing theo lesson
  async getWritingsByLesson(lessonId: string): Promise<Writing[]> {
    const url = `${API_BASE_URL}/writings/lesson/${lessonId}`;
    
    // Gọi API và map kiểu dữ liệu trả về { success: boolean, data: Writing[] }
    const response = await this.fetchWithAuth<{ success: boolean; data: Writing[] }>(url);
    
    // Trả về mảng data trực tiếp
    return response.data;
  }

  // GET: Lấy tất cả writings (có filter)
  async getWritings(params?: {
    level?: string;
    type?: string;
    lesson?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<WritingResponse> {
    const queryParams = new URLSearchParams();
    if (params?.level) queryParams.append('level', params.level);
    if (params?.type) queryParams.append('type', params.type);
    if (params?.lesson) queryParams.append('lesson', params.lesson);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page?.toString() || '1');
    if (params?.limit) queryParams.append('limit', params.limit?.toString() || '10');
    
    const url = `${API_BASE_URL}/writings${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.fetchWithAuth<WritingResponse>(url);
  }

  // GET: Lấy chi tiết writing
  async getWritingById(id: string): Promise<Writing> {
    return this.fetchWithAuth<Writing>(`${API_BASE_URL}/writings/${id}`);
  }

  // POST: Tạo writing mới
  async createWriting(writingData: Partial<Writing>): Promise<Writing> {
    return this.fetchWithAuth<Writing>(`${API_BASE_URL}/writings`, {
      method: 'POST',
      body: JSON.stringify(writingData),
    });
  }

  // PUT: Cập nhật writing
  async updateWriting(id: string, writingData: Partial<Writing>): Promise<Writing> {
    return this.fetchWithAuth<Writing>(`${API_BASE_URL}/writings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(writingData),
    });
  }

  // DELETE: Xóa writing
  async deleteWriting(id: string): Promise<{ message: string; deletedWriting: Writing }> {
    return this.fetchWithAuth<{ message: string; deletedWriting: Writing }>(`${API_BASE_URL}/writings/${id}`, {
      method: 'DELETE',
    });
  }

  // POST: Nộp bài writing
  async submitWriting(
    writingId: string,
    data: SubmissionData
  ): Promise<WritingSubmission> {
    return this.fetchWithAuth<WritingSubmission>(`${API_BASE_URL}/writings/${writingId}/submit`, {
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
  }): Promise<WritingSubmissionResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.append('status', params.status);
      if (params?.level) queryParams.append('level', params.level);
      if (params?.page) queryParams.append('page', params.page?.toString() || '1');
      if (params?.limit) queryParams.append('limit', params.limit?.toString() || '10');
      
      const url = `${API_BASE_URL}/writings/submissions/all${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      console.log('📋 Fetching writing submissions');
      return await this.fetchWithAuth<WritingSubmissionResponse>(url);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      throw error;
    }
  }

  // PUT: Chấm điểm bài nộp
  async evaluateSubmission(
    submissionId: string,
    evaluationData: EvaluationData
  ): Promise<WritingSubmission> {
    return this.fetchWithAuth<WritingSubmission>(
      `${API_BASE_URL}/writings/submissions/${submissionId}/evaluate`,
      {
        method: 'PUT',
        body: JSON.stringify(evaluationData),
      }
    );
  }

  // DELETE: Xóa bài nộp
  async deleteSubmission(submissionId: string): Promise<{ message: string; deletedSubmission: WritingSubmission }> {
    return this.fetchWithAuth<{ message: string; deletedSubmission: WritingSubmission }>(
      `${API_BASE_URL}/writings/submissions/${submissionId}`,
      {
        method: 'DELETE',
      }
    );
  }

  // GET: Lấy progress của học viên (nếu có route này)
  async getStudentProgress(studentId: string, writingId: string) {
    try {
      // Giả sử endpoint là /writings/progress/:writingId/student/:studentId
      // Nếu không có thì bỏ qua
      return this.fetchWithAuth<any>(`${API_BASE_URL}/writings/progress/${writingId}/student/${studentId}`);
    } catch (error) {
      console.warn('Progress endpoint not available');
      return null;
    }
  }
}

export const writingService = new WritingService();