// API service for Lessons
const getApiBaseUrl = () => {
    const envUrl = process.env.EXPO_PUBLIC_API_URL;
    if (envUrl) return envUrl;
    
    // Fallback URLs based on platform
    if (typeof window !== 'undefined') {
        // Web environment
        return 'http://localhost:5000/api';
    } else {
        // Mobile environment - try network IP first
        return 'http://192.168.1.14:5000/api';
    }
};

const BASE_URL = getApiBaseUrl();
const API_TIMEOUT = 20000; // Increase to 20 seconds

interface LessonsParams {
    level?: string;
    page?: number;
    limit?: number;
    isPremium?: boolean;
}

class LessonApiService {
    private static readonly FALLBACK_URLS = [
        'http://localhost:5000/api',
        'http://192.168.1.14:5000/api', 
        'http://10.0.2.2:5000/api'
    ];

    // Helper method to create fetch with timeout and retry
    private static async fetchWithTimeout(endpoint: string, options: RequestInit = {}) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
        
        const fetchOptions = {
            ...options,
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        };

        let lastError: Error | null = null;
        
        // Try BASE_URL first
        const urlsToTry = [BASE_URL, ...this.FALLBACK_URLS.filter(url => url !== BASE_URL)];
        
        for (const baseUrl of urlsToTry) {
            try {
                const fullUrl = `${baseUrl}${endpoint}`;
                console.log(`🔄 Trying API: ${fullUrl}`);
                
                const response = await fetch(fullUrl, fetchOptions);
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                console.log(`✅ API Success: ${fullUrl}`);
                return response;
            } catch (error) {
                console.log(`❌ API Failed: ${baseUrl}${endpoint}`, error);
                lastError = error as Error;
                // Continue to next URL
            }
        }
        
        clearTimeout(timeoutId);
        
        // If all failed, throw a user-friendly error
        if (lastError?.name === 'AbortError') {
            throw new Error('Kết nối mạng quá chậm, vui lòng kiểm tra kết nối');
        }
        throw new Error('Không thể kết nối đến server, vui lòng thử lại sau');
    }

    // Lấy danh sách lessons
    static async getLessons(params: LessonsParams = {}) {
        try {
            const queryParams = new URLSearchParams();
            
            if (params.level) queryParams.append('level', params.level);
            if (params.page) queryParams.append('page', params.page.toString());
            if (params.limit) queryParams.append('limit', params.limit.toString());
            if (params.isPremium !== undefined) queryParams.append('isPremium', params.isPremium.toString());

            console.log('Fetching lessons with params:', params);
            
            const response = await this.fetchWithTimeout(`/lessons?${queryParams}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                return data.data;
            }
            throw new Error(data.message || 'Lỗi khi lấy danh sách bài học');
        } catch (error) {
            console.error('Error fetching lessons:', error);
            if (error instanceof Error && error.name === 'AbortError') {
                throw new Error('Kết nối quá chậm, vui lòng thử lại');
            }
            throw error;
        }
    }

    // Lấy chi tiết lesson
    static async getLesson(id: string) {
        try {
            console.log('Fetching lesson with valid ID:', id);
            
            const response = await this.fetchWithTimeout(`/lessons/${id}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                return data.data;
            }
            throw new Error(data.message || 'Lỗi khi lấy chi tiết bài học');
        } catch (error) {
            console.error('Error fetching lesson:', error);
            if (error instanceof Error && error.name === 'AbortError') {
                throw new Error('Kết nối quá chậm, vui lòng thử lại');
            }
            throw error;
        }
    }

    // Lấy lessons theo level
    static async getLessonsByLevel(level: string) {
        try {
            console.log('Fetching lessons by level from:', `${BASE_URL}/lessons/level/${encodeURIComponent(level)}`);
            
            const response = await this.fetchWithTimeout(`/lessons?level=${encodeURIComponent(level)}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                return data.data;
            }
            throw new Error(data.message || 'Lỗi khi lấy bài học theo cấp độ');
        } catch (error) {
            console.error('Error fetching lessons by level:', error);
            if (error instanceof Error && error.name === 'AbortError') {
                throw new Error('Kết nối quá chậm, vui lòng thử lại');
            }
            throw error;
        }
    }
}

export default LessonApiService;