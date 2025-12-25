import API_BASE_URL from '../api/api';
import { authService } from './authService';

export interface PopulatedVocabularyStatus {
  _id: string;
  vocabularyId: {
    _id: string;
    word: string;   // Tiếng Hàn (kr)
    meaning: string; // Tiếng Việt (vi)
    pronunciation?: string;
  }; 
  status: 'unlearned' | 'learning' | 'mastered';
  lastReviewed: string;
}

// 1. Định nghĩa các Interface (Giữ nguyên như cũ)
export interface VocabularyStatus {
  _id?: string;
  vocabularyId: string;
  status: 'unlearned' | 'learning' | 'mastered';
  lastReviewed: string; 
}

export interface LessonProgress {
  _id: string;
  user: string;
  lesson: string; 
  vocabularyStatus: VocabularyStatus[];
  vocabularyProgress: number;
  grammarProgress: number;
  listeningProgress: number;
  speakingProgress: number;
  readingProgress: number;
  writingProgress: number;
  overallProgress: number;
  isCompleted: boolean;
  unlocked: boolean;
  unlockDate?: string;
  lastAccessed: string;
  createdAt: string;
  updatedAt: string;
}

export interface LessonAccessResponse {
  success: boolean;
  message: string;
  data: LessonProgress;
  isFirstAccess: boolean; 
}

export interface UpdateVocabResponse {
  success: boolean;
  message: string;
  data: {
    vocabularyId: string;
    newStatus: string;
    vocabularyProgress: number; 
    overallProgress: number;    
  };
}

export interface LessonProgressDetailResponse {
  success: boolean;
  message?: string;
  data: {
    _id: string;
    user: string;
    lesson: string;
    
    // Quan trọng: Sử dụng PopulatedVocabularyStatus thay vì VocabularyStatus thường
    vocabularyStatus: PopulatedVocabularyStatus[]; 
    
    vocabularyProgress: number;
    grammarProgress: number;
    listeningProgress: number;
    speakingProgress: number;
    readingProgress: number;
    writingProgress: number;
    overallProgress: number;
    
    isCompleted: boolean;
    unlocked: boolean;
    lastAccessed: string;
  };
}

class LessonProgressService {
  // --- HÀM ĐÃ ĐƯỢC SỬA ĐỔI ĐỂ BẮT LỖI HTML ---
  private async fetchWithAuth<T>(url: string, options: RequestInit = {}): Promise<T> {
    try {
      const token = await authService.getToken();
      
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      };

      // console.log('🌐 [Progress] Request:', options.method || 'GET', url); 

      const response = await fetch(url, { ...options, headers });
      const responseText = await response.text();

      // Xử lý khi server báo lỗi (Status không phải 200-299)
      if (!response.ok) {
        let errorMessage = 'Request failed';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // Nếu không parse được JSON lỗi, dùng luôn text trả về (có thể là HTML lỗi)
          errorMessage = responseText.substring(0, 100) || errorMessage; // Cắt ngắn cho đỡ dài
        }
        throw new Error(errorMessage);
      }

      // --- SỬA QUAN TRỌNG TẠI ĐÂY ---
      // Cố gắng parse JSON khi thành công. Nếu server trả HTML 200 OK, đoạn này sẽ catch được.
      try {
        return JSON.parse(responseText) as T;
      } catch (parseError) {
        console.error('❌ LỖI: Server trả về HTML thay vì JSON!');
        console.error('⬇️ Nội dung trả về (kiểm tra xem có phải trang lỗi không):');
        console.log(responseText); // <--- LOG NÀY SẼ GIÚP BẠN BIẾT LỖI GÌ
        throw new Error("Server trả về dữ liệu không đúng định dạng JSON.");
      }

    } catch (error) {
      console.error('Request error:', error);
      throw error;
    }
  }

  async initializeLessonProgress(lessonId: string): Promise<LessonAccessResponse> {
    if (!lessonId) throw new Error("Missing Lesson ID");
    const url = `${API_BASE_URL}/lesson-progress/initialize/${lessonId}`;
    return this.fetchWithAuth<LessonAccessResponse>(url, {
      method: 'POST',
      body: JSON.stringify({}) 
    });
  }

  // --- HÀM NÀY CŨNG ĐƯỢC CẬP NHẬT KIỂM TRA ĐẦU VÀO ---
  async updateVocabularyStatus(
    lessonId: string, 
    vocabularyId: string, 
    status: 'unlearned' | 'learning' | 'mastered'
  ): Promise<UpdateVocabResponse> {
    
    // Kiểm tra an toàn trước khi gọi
    if (!lessonId || typeof lessonId !== 'string') {
      console.warn("⚠️ updateVocabularyStatus: Lesson ID không hợp lệ:", lessonId);
      throw new Error("Invalid Lesson ID");
    }
    if (!vocabularyId) {
       console.warn("⚠️ updateVocabularyStatus: Vocabulary ID bị thiếu");
       throw new Error("Invalid Vocabulary ID");
    }

    const url = `${API_BASE_URL}/lesson-progress/${lessonId}/vocabulary`;
    
    return this.fetchWithAuth<UpdateVocabResponse>(url, {
      method: 'PATCH',
      body: JSON.stringify({ vocabularyId, status })
    });
  }


  async getLessonProgressDetail(lessonId: string): Promise<LessonProgressDetailResponse> {
    const url = `${API_BASE_URL}/lesson-progress/${lessonId}`;
    return this.fetchWithAuth<LessonProgressDetailResponse>(url);
  }
}

export const lessonProgressService = new LessonProgressService();