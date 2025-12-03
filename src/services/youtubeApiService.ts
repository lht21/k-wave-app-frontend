import axios from 'axios';
import API_BASE_URL from '../api/api';

// Use the same API base URL as other services

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: {
    default?: string;
    medium?: string;
    high?: string;
    maxres?: string;
  };
  publishedAt: string;
  channelTitle: string;
  duration: string;
  viewCount: string;
  likeCount: string;
  embedUrl: string;
  watchUrl: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
}

export interface VideoCategory {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  videoCount: number;
  videos: YouTubeVideo[];
}

export interface PaginationInfo {
  currentPage: number;
  totalResults: number;
  nextPageToken?: string;
  hasMore: boolean;
}

export interface VideoResponse {
  success: boolean;
  data: YouTubeVideo[];
  pagination?: PaginationInfo;
  message?: string;
}

class YouTubeApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = `${API_BASE_URL}/youtube`;
  }

  get apiBaseUrl() {
    return this.baseURL;
  }

  /**
   * Get all videos from KBS Drama channel
   */
  async getAllVideos(page = 1, limit = 20, pageToken?: string): Promise<VideoResponse> {
    try {
      const params: any = { page, limit };
      if (pageToken) {
        params.pageToken = pageToken;
      }

      const response = await axios.get(`${this.baseURL}/videos`, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching all videos:', error);
      return this.getFallbackResponse('Failed to fetch videos');
    }
  }

  /**
   * Get latest videos
   */
  async getLatestVideos(limit = 10): Promise<VideoResponse> {
    try {
      const response = await axios.get(`${this.baseURL}/latest`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching latest videos:', error);
      return this.getFallbackResponse('Failed to fetch latest videos');
    }
  }

  /**
   * Get trending/popular videos
   */
  async getTrendingVideos(limit = 10): Promise<VideoResponse> {
    try {
      const response = await axios.get(`${this.baseURL}/trending`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching trending videos:', error);
      return this.getFallbackResponse('Failed to fetch trending videos');
    }
  }

  /**
   * Search videos
   */
  async searchVideos(query: string, limit = 10): Promise<VideoResponse> {
    try {
      const response = await axios.get(`${this.baseURL}/search`, {
        params: { q: query, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching videos:', error);
      return this.getFallbackResponse('Failed to search videos');
    }
  }

  /**
   * Get video categories
   */
  async getCategories(): Promise<{ success: boolean; data: VideoCategory[]; message?: string }> {
    try {
      const response = await axios.get(`${this.baseURL}/categories`);
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return {
        success: false,
        data: this.getFallbackCategories(),
        message: 'Failed to fetch categories, showing fallback data'
      };
    }
  }

  /**
   * Get videos by category
   */
  async getVideosByCategory(categoryId: string, limit = 10): Promise<VideoResponse> {
    try {
      const response = await axios.get(`${this.baseURL}/category/${categoryId}`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching videos by category:', error);
      return this.getFallbackResponse('Failed to fetch videos by category');
    }
  }

  /**
   * Fallback response when API fails
   */
  private getFallbackResponse(message: string): VideoResponse {
    return {
      success: false,
      data: this.getFallbackVideos(),
      message
    };
  }

  /**
   * Fallback videos data
   */
  private getFallbackVideos(): YouTubeVideo[] {
    return [
      {
        id: 'fallback1',
        title: 'KBS 드라마 스페셜 - 최신 에피소드',
        description: 'KBS에서 제작한 최신 드라마 에피소드입니다.',
        thumbnail: {
          medium: 'https://via.placeholder.com/320x180?text=KBS+Drama+1'
        },
        publishedAt: new Date().toISOString(),
        channelTitle: 'KBS Drama',
        duration: '45:30',
        viewCount: '1.2M',
        likeCount: '15K',
        embedUrl: '',
        watchUrl: '',
        level: 'intermediate',
        category: 'drama'
      },
      {
        id: 'fallback2',
        title: '인기 한국 드라마 하이라이트',
        description: '가장 인기있는 한국 드라마의 명장면 모음',
        thumbnail: {
          medium: 'https://via.placeholder.com/320x180?text=KBS+Drama+2'
        },
        publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        channelTitle: 'KBS Drama',
        duration: '32:15',
        viewCount: '890K',
        likeCount: '12K',
        embedUrl: '',
        watchUrl: '',
        level: 'beginner',
        category: 'drama'
      },
      {
        id: 'fallback3',
        title: 'KBS 뉴스 특별 리포트',
        description: 'KBS 뉴스의 특별 리포트 프로그램',
        thumbnail: {
          medium: 'https://via.placeholder.com/320x180?text=KBS+News'
        },
        publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        channelTitle: 'KBS Drama',
        duration: '25:40',
        viewCount: '654K',
        likeCount: '8K',
        embedUrl: '',
        watchUrl: '',
        level: 'advanced',
        category: 'news'
      }
    ];
  }

  /**
   * Fallback categories data
   */
  private getFallbackCategories(): VideoCategory[] {
    return [
      {
        id: 'latest',
        title: 'Video mới nhất',
        description: 'Các video mới nhất từ KBS Drama',
        thumbnail: 'https://via.placeholder.com/320x180?text=Latest+Videos',
        videoCount: 20,
        videos: []
      },
      {
        id: 'drama',
        title: 'Drama',
        description: 'Các chương trình drama hấp dẫn',
        thumbnail: 'https://via.placeholder.com/320x180?text=Drama',
        videoCount: 15,
        videos: []
      },
      {
        id: 'trending',
        title: 'Trending',
        description: 'Video đang hot và được xem nhiều',
        thumbnail: 'https://via.placeholder.com/320x180?text=Trending',
        videoCount: 10,
        videos: []
      }
    ];
  }

  /**
   * Format duration for display
   */
  formatDuration(duration: string): string {
    // Duration is already formatted from backend
    return duration;
  }

  /**
   * Format view count for display
   */
  formatViewCount(viewCount: string): string {
    // View count is already formatted from backend
    return viewCount;
  }

  /**
   * Get video thumbnail URL
   */
  getVideoThumbnail(video: YouTubeVideo, quality: 'default' | 'medium' | 'high' | 'maxres' = 'medium'): string {
    const thumbnail = video.thumbnail[quality] || video.thumbnail.medium || video.thumbnail.default;
    
    // If no thumbnail, try to generate one from video ID
    if (!thumbnail && video.id) {
      // Generate YouTube thumbnail URL from video ID
      const videoId = this.extractVideoId(video.id);
      if (videoId) {
        switch (quality) {
          case 'default':
            return `https://img.youtube.com/vi/${videoId}/default.jpg`;
          case 'medium':
            return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
          case 'high':
            return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
          case 'maxres':
            return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        }
      }
    }
    
    return thumbnail || '';
  }
  
  /**
   * Extract real YouTube video ID from fallback IDs
   */
  private extractVideoId(id: string): string | null {
    // Handle fallback IDs with real demo videos
    const demoVideos: { [key: string]: string } = {
      'kbs-drama-1': 'XyzAbc123',
      'kbs-drama-2': 'DefGhi456', 
      'kbs-drama-3': 'JklMno789',
      'kbs-drama-4': 'PqrStu012',
      'kbs-drama-5': 'VwxYz345',
      'fallback1': 'XyzAbc123',
      'fallback2': 'DefGhi456'
    };
    
    return demoVideos[id] || id;
  }

  /**
   * Test API connection
   */
  async testConnection(): Promise<{ success: boolean; message: string; url: string }> {
    try {
      console.log('🔍 Testing connection to:', this.baseURL);
      const response = await axios.get(`${this.baseURL}/videos?limit=1`, { timeout: 5000 });
      return {
        success: true,
        message: 'API connection successful',
        url: this.baseURL
      };
    } catch (error) {
      console.error('❌ API connection failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        message: `API connection failed: ${errorMessage}`,
        url: this.baseURL
      };
    }
  }

  /**
   * Get level color for UI
   */
  getLevelColor(level: string): string {
    switch (level) {
      case 'beginner':
        return '#4CAF50';
      case 'intermediate':
        return '#FF9800';
      case 'advanced':
        return '#F44336';
      default:
        return '#6B7280';
    }
  }

  /**
   * Get level text in Vietnamese
   */
  getLevelText(level: string): string {
    switch (level) {
      case 'beginner':
        return 'Cơ bản';
      case 'intermediate':
        return 'Trung bình';
      case 'advanced':
        return 'Nâng cao';
      default:
        return 'Trung bình';
    }
  }
}

export default new YouTubeApiService();