import API_BASE_URL from '../api/api';
import { authService } from './authService';

// Types
export type ExamType = 'topik1' | 'topik2' | 'esp';
export type SectionType = 'listening' | 'reading' | 'writing';

export interface QuestionOption {
  _id: string;
  question: string;
  options: string[];
  answer: number;
  explanation?: string;
}

export interface ListeningQuestionData {
    id: number;
    type: 'listening';
    title: string;
    audioUrl?: string;
    transcript?: string;
    translation?: string;
    level: string;
    duration?: number;
    questions?: QuestionOption[];
  }
  
  export interface ReadingQuestionData {
    id: number;
    type: 'reading';
    title: string;
    content?: string;
    translation?: string;
    level: string;
    questions?: QuestionOption[];
  }
  
  export interface WritingQuestionData {
    id: number;
    type: 'writing';
    title: string;
    prompt?: string;
    instruction?: string;
    wordHint?: string[];
    grammarHint?: string[];
    minWords?: number;
    level: string;
    sampleAnswer?: string;
    sampleTranslation?: string;
  }
  
  export type QuestionData = ListeningQuestionData | ReadingQuestionData | WritingQuestionData;

export interface Exam {
  _id: string;
  title: string;
  examType: ExamType;
  listening: number;
  reading: number;
  writing: number;
  duration: number;
  isPremium: boolean;
  author: {
    _id: string;
    name: string;
    email: string;
  };
  questions: {
    listening: ListeningQuestionData[];
    reading: ReadingQuestionData[];
    writing: WritingQuestionData[];
  };
  totalQuestions: number;
  isActive: boolean;
  attemptCount: number;
  averageScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExamData {
  title: string;        // ✔ backend cần
  examType: string;     // ✔ backend cần
  category: string;     // ✔ backend cần
  listening: number;
  reading: number;
  writing: number;
  duration: number;
  isPremium?: boolean;
}

export interface UpdateExamData extends Partial<CreateExamData> {}

export interface AddQuestionData {
  section: SectionType;
  title: string;
  level: string;
  audioUrl?: string;
  transcript?: string;
  translation?: string;
  content?: string;
  prompt?: string;
  instruction?: string;
  wordHint?: string[];
  grammarHint?: string[];
  minWords?: number;
  questions?: QuestionOption[];
  duration?: number;
}

export interface UpdateQuestionData extends Partial<AddQuestionData> {
  id?: number;
}

export interface ExamResponse {
  exams: Exam[];
  totalPages: number;
  currentPage: number;
  total: number;
}

class ExamService {
  private async fetchWithAuth<T>(url: string, options: RequestInit = {}): Promise<T> {
    const token = await authService.getToken();
    
    console.log('🔑 Exam Service - Token:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    };

    console.log('🌐 Exam Service - Request:', url, options.method || 'GET');
    console.log('📋 Exam Service - Headers:', JSON.stringify(headers, null, 2));

    const response = await fetch(url, { ...options, headers });
    
    console.log('📥 Exam Service - Response status:', response.status);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      console.error('❌ Exam Service - Error response:', error);
      
      // Handle token expired - auto logout
      if (response.status === 401) {
        console.warn('🔓 Token expired or invalid - logging out');
        await authService.logout();
        throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      }
      
      throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  }

  // ============ EXAMS ============

  // GET: Lấy danh sách đề thi theo loại
  async getExamsByType(type: ExamType, params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<Exam[]> {
    const queryParams = new URLSearchParams();
    queryParams.append('type', type);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit?.toString() || '20');
    if (params?.search) queryParams.append('search', params.search || '');
    
    const url = `${API_BASE_URL}/exams${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.fetchWithAuth<Exam[]>(url);
  }

  // GET: Lấy chi tiết đề thi
  async getExamById(id: string): Promise<Exam> {
    return this.fetchWithAuth<Exam>(`${API_BASE_URL}/exams/${id}`);
  }

  // POST: Tạo đề thi mới
  async createExam(examData: CreateExamData): Promise<Exam> {
      console.log('📤 [examService] Gửi dữ liệu tạo đề thi:', examData); // THÊM DÒNG NÀY
    // Backend cần: title, examType (không phải name, type)
    return this.fetchWithAuth<Exam>(`${API_BASE_URL}/exams`, {
      method: 'POST',
      body: JSON.stringify(examData),
    });
  }
  // PUT: Cập nhật đề thi
  async updateExam(id: string, examData: UpdateExamData): Promise<Exam> {
    return this.fetchWithAuth<Exam>(`${API_BASE_URL}/exams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(examData),
    });
  }

  // DELETE: Xóa đề thi
  async deleteExam(id: string): Promise<{ msg: string }> {
    return this.fetchWithAuth<{ msg: string }>(`${API_BASE_URL}/exams/${id}`, {
      method: 'DELETE',
    });
  }

  // PATCH: Toggle premium status
  async togglePremium(id: string): Promise<Exam> {
    return this.fetchWithAuth<Exam>(`${API_BASE_URL}/exams/${id}/toggle-premium`, {
      method: 'PATCH',
    });
  }

  // ============ QUESTIONS ============

  // POST: Thêm câu hỏi
  async addQuestion(examId: string, questionData: AddQuestionData): Promise<Exam> {
    return this.fetchWithAuth<Exam>(`${API_BASE_URL}/exams/${examId}/questions`, {
      method: 'POST',
      body: JSON.stringify(questionData),
    });
  }

  // PUT: Cập nhật câu hỏi
  async updateQuestion(
    examId: string,
    questionId: number,
    questionData: UpdateQuestionData
  ): Promise<Exam> {
    return this.fetchWithAuth<Exam>(`${API_BASE_URL}/exams/${examId}/questions/${questionId}`, {
      method: 'PUT',
      body: JSON.stringify(questionData),
    });
  }

  // DELETE: Xóa câu hỏi
  async deleteQuestion(examId: string, questionId: number): Promise<Exam> {
    return this.fetchWithAuth<Exam>(`${API_BASE_URL}/exams/${examId}/questions/${questionId}`, {
      method: 'DELETE',
    });
  }

  // ============ HELPER FUNCTIONS ============

  // Hàm trợ giúp - Tạo đề thi mặc định
  createDefaultExam(type: ExamType, examNumber: number): CreateExamData {
    // Tạo tên hiển thị
    const baseName = `제${examNumber}회 ${
      type === 'esp' ? '한국어 ESP 시험' : '한국어능력시험'
    }`;

    const defaults = {
      'topik1': {
        listening: 30,
        reading: 40,
        writing: 0,
        duration: 100,
      },
      'topik2': {
        listening: 50,
        reading: 50,
        writing: 4,
        duration: 180,
      },
      'esp': {
        listening: 25,
        reading: 25,
        writing: 2,
        duration: 90,
      },
    };

    return {
      title: baseName,          // Dùng 'title' không dùng 'name'
      examType: type,           // Dùng 'examType' không dùng 'type'
      category: "practice",     // Đã đúng
      isPremium: false,
      ...defaults[type],
    };
  }

  // Hàm trợ giúp - Tìm số đề tiếp theo
  findNextExamNumber(exams: Exam[]): number {
    if (exams.length === 0) return 1;

    const existingNumbers = exams
      .map(exam => {
        const match = exam.title.match(/제(\d+)회/);
        return match ? parseInt(match[1]) : 0;
      })
      .filter(num => num > 0);

    if (existingNumbers.length === 0) return 1;
    
    existingNumbers.sort((a, b) => a - b);
    
    // Tìm số còn thiếu
    for (let i = 1; i <= existingNumbers[existingNumbers.length - 1]; i++) {
      if (!existingNumbers.includes(i)) return i;
    }
    
    return existingNumbers[existingNumbers.length - 1] + 1;
  }

  // Hàm trợ giúp - Lấy thống kê
  async getExamStats(): Promise<any> {
    return this.fetchWithAuth(`${API_BASE_URL}/exams/stats`);
  }

  // Hàm trợ giúp - Lấy tất cả đề thi (admin)
  async getAllExams(params?: {
    type?: ExamType;
    page?: number;
    limit?: number;
    search?: string;
    isPremium?: boolean;
  }): Promise<ExamResponse> {
    const queryParams = new URLSearchParams();
    if (params?.type) queryParams.append('type', params.type);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit?.toString() || '20');
    if (params?.search) queryParams.append('search', params.search || '');
    if (params?.isPremium !== undefined) queryParams.append('isPremium', params.isPremium.toString());
    
    const url = `${API_BASE_URL}/exams/all${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.fetchWithAuth<ExamResponse>(url);
  }

  // Hàm trợ giúp - Upload audio file
  async uploadAudio(formData: FormData): Promise<{ url: string }> {
    const token = await authService.getToken();
    
    const response = await fetch(`${API_BASE_URL}/exams/upload/audio`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(error.message || 'Upload failed');
    }

    return response.json();
  }

  // Hàm trợ giúp - Tạo nhiều câu hỏi cùng lúc
  async bulkAddQuestions(
    examId: string,
    section: SectionType,
    questions: AddQuestionData[]
  ): Promise<Exam> {
    return this.fetchWithAuth<Exam>(`${API_BASE_URL}/exams/${examId}/questions/bulk`, {
      method: 'POST',
      body: JSON.stringify({ section, questions }),
    });
  }

  // Hàm trợ giúp - Lấy đề thi theo tác giả
  async getExamsByAuthor(authorId: string, params?: {
    type?: ExamType;
    page?: number;
    limit?: number;
  }): Promise<Exam[]> {
    const queryParams = new URLSearchParams();
    if (params?.type) queryParams.append('type', params.type);
    if (params?.page) queryParams.append('page', params.page?.toString() || '1');
    if (params?.limit) queryParams.append('limit', params.limit?.toString() || '20');
    
    const url = `${API_BASE_URL}/exams/author/${authorId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.fetchWithAuth<Exam[]>(url);
  }

  // ============ SUBMIT EXAM RESULTS ============

  // POST: Submit exam results (for teacher review)
  async submitExamResult(resultData: {
    examId: string;
    answers: { [key: string]: number };
    writingAnswers: { [key: string]: string };
    timeSpent: number;
    isTrialMode?: boolean;
    sectionType?: string;
  }): Promise<{ message: string; resultId?: string }> {
    return this.fetchWithAuth<{ message: string; resultId?: string }>(
      `${API_BASE_URL}/exams/submit`,
      {
        method: 'POST',
        body: JSON.stringify(resultData),
      }
    );
  }
  
}

export const examService = new ExamService();