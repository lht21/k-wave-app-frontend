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
const API_TIMEOUT = 3000; // Reduced to 3 seconds for faster fallback

interface LessonsParams {
    level?: string;
    page?: number;
    limit?: number;
    isPremium?: boolean;
}

class LessonApiService {
    private static readonly FALLBACK_URLS = [
        'http://localhost:5000/api',
        'http://192.168.1.14:5000/api'
        // Removed 'http://10.0.2.2:5000/api' - causing hang on web
    ];

    // Fallback lesson data when API is not available
    private static getFallbackLessons() {
        return [
            {
                _id: '692ead3558ea326e3da336f9',
                title: 'Bảng chữ cái',
                description: 'Học bảng chữ cái tiếng Hàn - Hangul cơ bản',
                level: 'beginner',
                isPremium: false,
                content: {
                    vocabulary: [
                        { korean: 'ㄱ', vietnamese: 'Consonant G/K', pronunciation: 'giyeok' },
                        { korean: 'ㄴ', vietnamese: 'Consonant N', pronunciation: 'nieun' },
                        { korean: 'ㄷ', vietnamese: 'Consonant D/T', pronunciation: 'digeut' },
                        { korean: 'ㄹ', vietnamese: 'Consonant R/L', pronunciation: 'rieul' },
                        { korean: 'ㅁ', vietnamese: 'Consonant M', pronunciation: 'mieum' }
                    ],
                    grammar: [
                        {
                            pattern: 'Consonants (자음)',
                            meaning: 'Các phụ âm trong tiếng Hàn',
                            example: 'ㄱ, ㄴ, ㄷ, ㄹ, ㅁ',
                            usage: 'Kết hợp với nguyên âm để tạo thành âm tiết'
                        }
                    ],
                    exercises: [
                        {
                            question: 'Phụ âm nào phát âm như "G" hoặc "K"?',
                            options: ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ'],
                            correct: 0,
                            explanation: 'ㄱ (giyeok) phát âm như "G" khi ở đầu từ và "K" khi ở cuối'
                        }
                    ]
                },
                duration: 30,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                _id: '692ead3558ea326e3da336f8',
                title: 'Nguyên âm cơ bản',
                description: 'Học các nguyên âm đơn giản trong tiếng Hàn',
                level: 'beginner',
                isPremium: false,
                content: {
                    vocabulary: [
                        { korean: 'ㅏ', vietnamese: 'Vowel A', pronunciation: 'a' },
                        { korean: 'ㅑ', vietnamese: 'Vowel YA', pronunciation: 'ya' },
                        { korean: 'ㅓ', vietnamese: 'Vowel EO', pronunciation: 'eo' },
                        { korean: 'ㅕ', vietnamese: 'Vowel YEO', pronunciation: 'yeo' },
                        { korean: 'ㅗ', vietnamese: 'Vowel O', pronunciation: 'o' }
                    ],
                    grammar: [
                        {
                            pattern: 'Vowels (모음)',
                            meaning: 'Các nguyên âm trong tiếng Hàn',
                            example: 'ㅏ, ㅑ, ㅓ, ㅕ, ㅗ',
                            usage: 'Kết hợp với phụ âm để tạo thành âm tiết hoàn chỉnh'
                        }
                    ],
                    exercises: [
                        {
                            question: 'Nguyên âm nào phát âm như "A"?',
                            options: ['ㅏ', 'ㅑ', 'ㅓ', 'ㅕ'],
                            correct: 0,
                            explanation: 'ㅏ phát âm như "A" trong tiếng Việt'
                        }
                    ]
                },
                duration: 25,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ];
    }

    // Helper method to create fetch with timeout and retry
    private static async fetchWithTimeout(endpoint: string, options: RequestInit = {}) {
        let lastError: Error | null = null;
        
        // Try BASE_URL first
        const urlsToTry = [BASE_URL, ...this.FALLBACK_URLS.filter(url => url !== BASE_URL)];
        
        for (const baseUrl of urlsToTry) {
            try {
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
        
        // Return null to let calling methods handle fallback
        console.log('⚠️ All API endpoints failed, returning null for fallback handling');
        return null;
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
            
            // Check if response is null (all endpoints failed)
            if (!response) {
                throw new Error('All API endpoints failed');
            }
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                return data.data;
            }
            throw new Error(data.message || 'Lỗi khi lấy danh sách bài học');
        } catch (error) {
            console.warn('🔄 API failed, using fallback lessons data:', error);
            
            // Return filtered fallback data based on params
            let lessons = this.getFallbackLessons();
            
            if (params.level) {
                lessons = lessons.filter(l => l.level === params.level);
            }
            
            if (params.isPremium !== undefined) {
                lessons = lessons.filter(l => l.isPremium === params.isPremium);
            }
            
            console.log('✅ Using fallback lessons:', lessons.length, 'lessons found');
            return lessons;
        }
    }

    // Lấy chi tiết lesson
    static async getLesson(id: string) {
        try {
            console.log('Fetching lesson with valid ID:', id);
            
            const response = await this.fetchWithTimeout(`/lessons/${id}`);
            
            // Check if response is null (all endpoints failed)
            if (!response) {
                throw new Error('All API endpoints failed');
            }
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                return data.data;
            }
            throw new Error(data.message || 'Lỗi khi lấy chi tiết bài học');
        } catch (error) {
            console.warn('🔄 API failed, using fallback lesson data:', error);
            
            // Return fallback data
            const fallbackLessons = this.getFallbackLessons();
            const lesson = fallbackLessons.find(l => l._id === id);
            
            if (lesson) {
                console.log('✅ Found fallback lesson:', lesson.title);
                return lesson;
            }
            
            // If specific lesson not found, return first lesson as default
            console.log('⚠️ Using default fallback lesson:', fallbackLessons[0].title);
            return fallbackLessons[0];
        }
    }

    // Lấy lessons theo level
    static async getLessonsByLevel(level: string) {
        try {
            console.log('Fetching lessons by level from:', `${BASE_URL}/lessons/level/${encodeURIComponent(level)}`);
            
            const response = await this.fetchWithTimeout(`/lessons?level=${encodeURIComponent(level)}`);
            
            // Check if response is null (all endpoints failed)
            if (!response) {
                throw new Error('All API endpoints failed');
            }
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                return data.data;
            }
            throw new Error(data.message || 'Lỗi khi lấy bài học theo cấp độ');
        } catch (error) {
            console.warn('API failed, using fallback lessons by level:', error);
            
            // Return filtered fallback data
            const lessons = this.getFallbackLessons().filter(l => l.level === level);
            console.log('✅ Using fallback lessons for level:', level, lessons.length, 'lessons');
            return lessons;
        }
    }

    // Cập nhật tiến độ lesson
    static async updateLessonProgress(lessonId: string, progress: number) {
        try {
            const response = await this.fetchWithTimeout(`/lessons/${lessonId}/progress`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ progress }),
            });
            
            // Check if response is null (all endpoints failed)
            if (!response) {
                throw new Error('All API endpoints failed');
            }
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                return data.data;
            }
            throw new Error(data.message || 'Lỗi khi cập nhật tiến độ');
        } catch (error) {
            console.warn('API failed, saving progress locally:', error);
            
            // Save progress to local storage when API is not available
            try {
                const AsyncStorage = require('@react-native-async-storage/async-storage').default;
                const key = `lesson_progress_${lessonId}`;
                const progressData = {
                    lessonId,
                    progress,
                    updatedAt: new Date().toISOString()
                };
                await AsyncStorage.setItem(key, JSON.stringify(progressData));
                console.log('✅ Progress saved locally for lesson:', lessonId);
                return progressData;
            } catch (localError) {
                console.error('Failed to save progress locally:', localError);
                throw new Error('Không thể lưu tiến độ học tập');
            }
        }
    }

    // Lấy tiến độ lesson từ local storage
    static async getLessonProgress(lessonId: string) {
        try {
            const response = await this.fetchWithTimeout(`/lessons/${lessonId}/progress`);
            
            // Check if response is null (all endpoints failed)
            if (!response) {
                throw new Error('All API endpoints failed');
            }
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                return data.data;
            }
            throw new Error(data.message || 'Lỗi khi lấy tiến độ');
        } catch (error) {
            console.warn('API failed, checking local progress:', error);
            
            // Check local storage for progress
            try {
                const AsyncStorage = require('@react-native-async-storage/async-storage').default;
                const key = `lesson_progress_${lessonId}`;
                const localData = await AsyncStorage.getItem(key);
                
                if (localData) {
                    const progressData = JSON.parse(localData);
                    console.log('✅ Found local progress for lesson:', lessonId);
                    return progressData;
                }
                
                // Return default progress if no data found
                return {
                    lessonId,
                    progress: 0,
                    updatedAt: new Date().toISOString()
                };
            } catch (localError) {
                console.error('Failed to get local progress:', localError);
                return { lessonId, progress: 0, updatedAt: new Date().toISOString() };
            }
        }
    }
}

export default LessonApiService;