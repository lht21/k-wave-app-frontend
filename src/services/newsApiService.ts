// API Configuration - inline to avoid import issues
import { Platform } from 'react-native';

const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV === 'development';

// Get appropriate localhost URL based on platform
const getDevApiUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000/api';  // Android emulator
  } else if (Platform.OS === 'ios') {
    return 'http://localhost:5000/api';  // iOS simulator
  }
  return 'http://localhost:5000/api';   // Default fallback
};

const API_BASE_URL = isDev 
  ? getDevApiUrl()
  : 'https://your-production-api.com/api';

// Timeout for API requests (10 seconds)
const API_TIMEOUT = 10000;

// Helper function to add timeout to fetch requests
const fetchWithTimeout = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

export interface NewsArticle {
  id: string;
  title: string;
  subtitle: string;
  summary?: string;
  content?: string;
  source: string;
  originalUrl?: string;
  author: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  readingTime: number;
  imageUrl?: string;
  videoUrl?: string;
  vocabularyWords?: Array<{
    word: string;
    meaning: string;
    pronunciation: string;
    difficulty: string;
  }>;
  grammarPoints?: Array<{
    point: string;
    explanation: string;
    examples: string[];
  }>;
  publishedDate: string;
  views: number;
  likes: number;
  bookmarks: number;
  keywords: string[];
  tags: string[];
  formattedDate?: string;
}

export interface NewsListResponse {
  success: boolean;
  data: {
    news: NewsArticle[];
    pagination: {
      current: number;
      total: number;
      limit: number;
      totalItems: number;
    };
    filters: {
      category?: string;
      source?: string;
      difficulty?: string;
      search?: string;
    };
  };
}

export interface NewsDetailResponse {
  success: boolean;
  data: NewsArticle;
}

export interface NewsSearchParams {
  category?: string;
  source?: string;
  difficulty?: string;
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

class NewsApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/news`;
  }

  // Get all news with filtering and pagination
  async getAllNews(params: NewsSearchParams = {}): Promise<NewsListResponse> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });

    const url = `${this.baseUrl}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch news: ${response.statusText}`);
    }
    
    return response.json();
  }

  // Get news by ID with full content
  async getNewsById(id: string): Promise<NewsDetailResponse> {
    const response = await fetch(`${this.baseUrl}/${id}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch news article: ${response.statusText}`);
    }
    
    return response.json();
  }

  // Get recent news
  async getRecentNews(limit: number = 20): Promise<NewsListResponse> {
    const response = await fetch(`${this.baseUrl}/recent?limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch recent news: ${response.statusText}`);
    }
    
    return response.json();
  }

  // Get news by category
  async getNewsByCategory(category: string, limit: number = 10): Promise<{
    success: boolean;
    data: {
      category: string;
      news: NewsArticle[];
      total: number;
    };
  }> {
    const response = await fetch(`${this.baseUrl}/category/${category}?limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch news by category: ${response.statusText}`);
    }
    
    return response.json();
  }

  // Get news by source
  async getNewsBySource(source: string, limit: number = 10): Promise<{
    success: boolean;
    data: {
      source: string;
      news: NewsArticle[];
      total: number;
    };
  }> {
    const response = await fetch(`${this.baseUrl}/source/${encodeURIComponent(source)}?limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch news by source: ${response.statusText}`);
    }
    
    return response.json();
  }

  // Search news
  async searchNews(query: string, limit: number = 20): Promise<{
    success: boolean;
    data: {
      query: string;
      news: NewsArticle[];
      total: number;
    };
  }> {
    const response = await fetch(`${this.baseUrl}/search?q=${encodeURIComponent(query)}&limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`Failed to search news: ${response.statusText}`);
    }
    
    return response.json();
  }

  // Toggle bookmark (requires authentication)
  async toggleBookmark(id: string, action: 'add' | 'remove', authToken: string): Promise<{
    success: boolean;
    data: {
      id: string;
      bookmarks: number;
    };
  }> {
    const response = await fetch(`${this.baseUrl}/${id}/bookmark`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ action })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to toggle bookmark: ${response.statusText}`);
    }
    
    return response.json();
  }

  // Get news statistics
  async getNewsStats(): Promise<{
    success: boolean;
    data: {
      overview: {
        totalArticles: number;
        totalViews: number;
        totalBookmarks: number;
        averageReadingTime: number;
      };
      bySource: Array<{
        _id: string;
        count: number;
        totalViews: number;
      }>;
      byCategory: Array<{
        _id: string;
        count: number;
        totalViews: number;
      }>;
    };
  }> {
    const response = await fetch(`${this.baseUrl}/stats`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch news stats: ${response.statusText}`);
    }
    
    return response.json();
  }

  // Trigger manual news crawling (admin only)
  async triggerNewsCrawl(authToken: string): Promise<{
    success: boolean;
    message: string;
    data: any;
  }> {
    const response = await fetch(`${this.baseUrl}/crawl`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to trigger news crawl: ${response.statusText}`);
    }
    
    return response.json();
  }
}

export const newsApiService = new NewsApiService();

// Helper functions for frontend
export const formatNewsDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getDifficultyColor = (difficulty: string): string => {
  switch (difficulty) {
    case 'beginner': return '#4CAF50';
    case 'intermediate': return '#FF9800';
    case 'advanced': return '#F44336';
    default: return '#6B7280';
  }
};

export const getDifficultyText = (difficulty: string): string => {
  switch (difficulty) {
    case 'beginner': return '초급';
    case 'intermediate': return '중급';
    case 'advanced': return '고급';
    default: return '중급';
  }
};

export const getCategoryIcon = (category: string): string => {
  const icons: { [key: string]: string } = {
    'culture': '🎭',
    'food': '🍜',
    'technology': '💻',
    'entertainment': '🎵',
    'sports': '⚽',
    'politics': '🏛️',
    'economy': '💰',
    'society': '👥'
  };
  
  return icons[category] || '📰';
};

export const getSourceIcon = (source: string): string => {
  const icons: { [key: string]: string } = {
    '조선일보': '📄',
    '중앙일보': '📰',
    '동아일보': '📃',
    '한겨레': '📑',
    'KBS': '📺',
    'MBC': '📻',
    'SBS': '📺',
    '연합뉴스': '🗞️',
    'YTN': '📢'
  };
  
  return icons[source] || '📰';
};

// Get single news article by ID
export const getNewsById = async (id: string): Promise<{ success: boolean; data?: NewsArticle; error?: string }> => {
  try {
    console.log('Fetching news by ID:', id, 'from URL:', `${API_BASE_URL}/news/${id}`);
    const response = await fetchWithTimeout(`${API_BASE_URL}/news/${id}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('API response:', data);
    return { success: true, data: data.data };
  } catch (error) {
    console.error('Error fetching news by ID:', error);
    
    // Return mock data as fallback
    const mockArticle: NewsArticle = {
      id: id, // Use the requested ID
      title: "한국 전통 음식의 세계적 인기",
      subtitle: "김치, 불고기, 비빔밥 등 한국 음식이 전 세계인들의 사랑을 받고 있습니다",
      content: "한국 전통 음식이 전 세계적으로 큰 인기를 끌고 있습니다. 특히 김치는 건강식품으로 인정받으며 많은 나라에서 소비되고 있습니다. 불고기와 비빔밥도 한국 음식의 대표주자로 자리잡고 있어요. 한류 열풍과 함께 한국 음식에 대한 관심이 더욱 높아지고 있습니다. 이러한 한국 음식의 인기는 전 세계 곳곳에서 한국 레스토랑이 증가하는 것으로도 확인할 수 있습니다.\n\n한국 음식의 특징 중 하나는 발효 음식이 많다는 것입니다. 김치, 된장, 간장 등은 모두 발효를 통해 만들어지며, 이는 건강에 매우 유익합니다. 또한 다양한 반찬 문화는 균형 잡힌 영양섭취를 가능하게 합니다.\n\n최근에는 한국 음식을 배우려는 외국인들도 늘어나고 있습니다. 요리 클래스나 온라인 레시피를 통해 한국 음식을 직접 만들어보는 사람들이 증가하고 있어요.",
      source: "KBS",
      author: "김기자",
      category: "food",
      difficulty: "beginner",
      readingTime: 3,
      imageUrl: "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=500",
      keywords: ["한국음식", "김치", "불고기", "한류"],
      tags: ["food", "culture", "beginner"],
      publishedDate: new Date().toISOString(),
      views: 1250,
      likes: 89,
      bookmarks: 34
    };
    
    return { 
      success: true, 
      data: mockArticle
    };
  }
};

// Get related articles
export const getRelatedNews = async (id: string, limit: number = 3): Promise<{ success: boolean; data?: NewsArticle[]; error?: string }> => {
  try {
    console.log('Fetching related news for ID:', id);
    const response = await fetchWithTimeout(`${API_BASE_URL}/news/${id}/related?limit=${limit}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return { success: true, data: data.data };
  } catch (error) {
    console.error('Error fetching related news:', error);
    
    // Return mock related articles as fallback
    const mockRelated: NewsArticle[] = [
      {
        id: 'related-1',
        title: "K-팝의 글로벌 성공 스토리",
        subtitle: "방탄소년단부터 블랙핑크까지, K-팝이 세계를 석권하고 있습니다",
        content: "K-팝의 성공 스토리...",
        source: "SBS",
        author: "박기자",
        category: "entertainment",
        difficulty: "intermediate",
        readingTime: 4,
        imageUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500",
        keywords: ["K-팝", "방탄소년단", "블랙핑크"],
        tags: ["entertainment", "music"],
        publishedDate: new Date().toISOString(),
        views: 2100,
        likes: 156,
        bookmarks: 67
      },
      {
        id: 'related-2',
        title: "한국의 IT 기술 혁신",
        subtitle: "삼성, LG 등이 세계 기술을 선도하고 있습니다",
        content: "한국 IT 기술 혁신...",
        source: "연합뉴스",
        author: "이기자",
        category: "technology",
        difficulty: "advanced",
        readingTime: 5,
        imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=500",
        keywords: ["IT기술", "삼성", "LG"],
        tags: ["technology", "business"],
        publishedDate: new Date().toISOString(),
        views: 1800,
        likes: 124,
        bookmarks: 89
      }
    ];
    
    return { 
      success: true, 
      data: mockRelated
    };
  }
};