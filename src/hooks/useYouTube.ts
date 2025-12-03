import { useState, useEffect } from 'react';
import youtubeApiService, { YouTubeVideo, VideoCategory, VideoResponse } from '../services/youtubeApiService';

export const useYouTubeVideos = () => {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(true);

  const fetchVideos = async (page = 1, limit = 20, pageToken?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await youtubeApiService.getAllVideos(page, limit, pageToken);
      
      if (response.success) {
        if (page === 1 || !pageToken) {
          setVideos(response.data);
        } else {
          setVideos(prev => [...prev, ...response.data]);
        }
        
        setNextPageToken(response.pagination?.nextPageToken);
        setHasMore(response.pagination?.hasMore || false);
      } else {
        setError(response.message || 'Failed to fetch videos');
        if (page === 1) {
          setVideos(response.data); // Use fallback data
        }
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error fetching videos:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore && nextPageToken) {
      fetchVideos(1, 20, nextPageToken);
    }
  };

  const refresh = () => {
    setVideos([]);
    setNextPageToken(undefined);
    setHasMore(true);
    fetchVideos(1, 20);
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  return {
    videos,
    loading,
    error,
    hasMore,
    loadMore,
    refresh
  };
};

export const useLatestVideos = (limit = 10) => {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLatestVideos = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Fetching latest videos from:', `${youtubeApiService.apiBaseUrl}/latest`);
      const response = await youtubeApiService.getLatestVideos(limit);
      
      if (response.success) {
        console.log('✅ Latest videos loaded:', response.data.length);
        if (response.data.length === 0) {
          console.warn('⚠️ API returned 0 latest videos, using fallback data');
          setError('Using demo content - no videos available from API');
          setVideos(getFallbackLatestVideos());
        } else {
          setVideos(response.data);
        }
      } else {
        console.warn('⚠️ API failed, using fallback data for latest videos');
        setError('Using demo content - API temporarily unavailable');
        setVideos(getFallbackLatestVideos());
      }
    } catch (err) {
      console.error('❌ Error fetching latest videos:', err);
      console.warn('⚠️ Network error, using fallback data for latest videos');
      setError('Using demo content - API temporarily unavailable');
      setVideos(getFallbackLatestVideos());
    } finally {
      setLoading(false);
    }
  };

  const getFallbackLatestVideos = (): YouTubeVideo[] => [
    {
      id: 'zsVqNTb4YGg',
      title: 'KBS 드라마 스페셜 - 최신 에피소드',
      description: 'KBS에서 제작한 최신 드라마 에피소드입니다.',
      thumbnail: {
        medium: 'https://i.ytimg.com/vi/zsVqNTb4YGg/mqdefault.jpg'
      },
      publishedAt: new Date().toISOString(),
      channelTitle: 'KBS Drama',
      duration: '45:30',
      viewCount: '1.2M',
      likeCount: '15K',
      embedUrl: 'https://www.youtube.com/embed/zsVqNTb4YGg',
      watchUrl: 'https://www.youtube.com/watch?v=zsVqNTb4YGg',
      level: 'intermediate',
      category: 'drama'
    },
    {
      id: 'kbs-latest-2',
      title: '인기 한국 드라마 하이라이트 모음',
      description: '가장 인기있는 한국 드라마의 명장면들을 모았습니다.',
      thumbnail: {
        medium: 'https://i.ytimg.com/vi/C2XEefFaLmg/mqdefault.jpg'
      },
      publishedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      channelTitle: 'KBS Drama',
      duration: '32:15',
      viewCount: '890K',
      likeCount: '12K',
      embedUrl: 'https://www.youtube.com/embed/C2XEefFaLmg',
      watchUrl: 'https://www.youtube.com/watch?v=C2XEefFaLmg',
      level: 'beginner',
      category: 'drama'
    }
  ];

  useEffect(() => {
    fetchLatestVideos();
  }, [limit]);

  return {
    videos,
    loading,
    error,
    refresh: fetchLatestVideos
  };
};

export const useTrendingVideos = (limit = 10) => {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrendingVideos = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Fetching trending videos from:', `${youtubeApiService.apiBaseUrl}/trending`);
      const response = await youtubeApiService.getTrendingVideos(limit);
      
      if (response.success) {
        console.log('✅ Trending videos loaded:', response.data.length);
        if (response.data.length === 0) {
          console.warn('⚠️ API returned 0 trending videos, using fallback data');
          setError('Using demo content - no trending videos available from API');
          setVideos(getFallbackTrendingVideos());
        } else {
          setVideos(response.data);
        }
      } else {
        console.warn('⚠️ API failed, using fallback data for trending videos');
        setError('Using demo content - API temporarily unavailable');
        setVideos(getFallbackTrendingVideos());
      }
    } catch (err) {
      console.error('❌ Error fetching trending videos:', err);
      console.warn('⚠️ Network error, using fallback data for trending videos');
      setError('Using demo content - API temporarily unavailable');
      setVideos(getFallbackTrendingVideos());
    } finally {
      setLoading(false);
    }
  };

  const getFallbackTrendingVideos = (): YouTubeVideo[] => [
    {
      id: 'zsVqNTb4YGg',
      title: '🔥 가장 인기 있는 K-Drama 명장면',
      description: '시청자들이 가장 사랑하는 KBS 드라마 명장면들',
      thumbnail: {
        medium: 'https://i.ytimg.com/vi/zsVqNTb4YGg/mqdefault.jpg'
      },
      publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      channelTitle: 'KBS Drama',
      duration: '28:45',
      viewCount: '2.5M',
      likeCount: '45K',
      embedUrl: 'https://www.youtube.com/embed/zsVqNTb4YGg',
      watchUrl: 'https://www.youtube.com/watch?v=zsVqNTb4YGg',
      level: 'intermediate',
      category: 'drama'
    },
    {
      id: 'kbs-trending-2', 
      title: '💫 KBS 드라마 OST 모음집',
      description: '감동적인 드라마 OST와 함께하는 명장면들',
      thumbnail: {
        medium: 'https://i.ytimg.com/vi/PZW_XHSEG7E/mqdefault.jpg'
      },
      publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      channelTitle: 'KBS Drama',
      duration: '42:20',
      viewCount: '1.8M',
      likeCount: '32K',
      embedUrl: 'https://www.youtube.com/embed/PZW_XHSEG7E',
      watchUrl: 'https://www.youtube.com/watch?v=PZW_XHSEG7E',
      level: 'beginner',
      category: 'music'
    }
  ];

  useEffect(() => {
    fetchTrendingVideos();
  }, [limit]);

  return {
    videos,
    loading,
    error,
    refresh: fetchTrendingVideos
  };
};

export const useVideoCategories = () => {
  const [categories, setCategories] = useState<VideoCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Fetching categories from:', `${youtubeApiService.apiBaseUrl}/categories`);
      const response = await youtubeApiService.getCategories();
      
      if (response.success) {
        console.log('✅ Categories loaded:', response.data.length);
        if (response.data.length === 0) {
          console.warn('⚠️ API returned 0 categories, using fallback data');
          setError('Using demo content - no categories available from API');
          setCategories(getFallbackCategories());
        } else {
          setCategories(response.data);
        }
      } else {
        console.warn('⚠️ API failed, using fallback data for categories');
        setError('Using demo content - API temporarily unavailable');
        setCategories(getFallbackCategories());
      }
    } catch (err) {
      console.error('❌ Error fetching categories:', err);
      console.warn('⚠️ Network error, using fallback data for categories');
      setError('Using demo content - API temporarily unavailable');
      setCategories(getFallbackCategories());
    } finally {
      setLoading(false);
    }
  };

  const getFallbackCategories = (): VideoCategory[] => [
    {
      id: 'drama',
      title: 'KBS 드라마',
      description: 'KBS에서 제작한 인기 드라마들',
      thumbnail: 'https://i.ytimg.com/vi/pKoOlLAnn8w/mqdefault.jpg',
      videoCount: 25,
      videos: [
        {
          id: 'zsVqNTb4YGg',
          title: 'KBS 드라마 하이라이트',
          description: '인기 드라마의 명장면 모음',
          thumbnail: { medium: 'https://i.ytimg.com/vi/zsVqNTb4YGg/mqdefault.jpg' },
          publishedAt: new Date().toISOString(),
          channelTitle: 'KBS Drama',
          duration: '35:20',
          viewCount: '950K',
          likeCount: '18K',
          embedUrl: 'https://www.youtube.com/embed/zsVqNTb4YGg',
          watchUrl: 'https://www.youtube.com/watch?v=zsVqNTb4YGg',
          level: 'intermediate',
          category: 'drama'
        }
      ]
    },
    {
      id: 'variety',
      title: 'KBS 예능',
      description: 'KBS 예능 프로그램 하이라이트',
      thumbnail: 'https://i.ytimg.com/vi/C2XEefFaLmg/mqdefault.jpg',
      videoCount: 18,
      videos: [
        {
          id: 'variety-sample-1',
          title: 'KBS 예능 베스트 모먼트',
          description: '웃음이 끊이지 않는 예능 명장면',
          thumbnail: { medium: 'https://i.ytimg.com/vi/C2XEefFaLmg/mqdefault.jpg' },
          publishedAt: new Date().toISOString(),
          channelTitle: 'KBS Drama',
          duration: '22:15',
          viewCount: '720K',
          likeCount: '14K',
          embedUrl: '',
          watchUrl: '',
          level: 'beginner',
          category: 'entertainment'
        }
      ]
    }
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    refresh: fetchCategories
  };
};

export const useVideosByCategory = (categoryId: string, limit = 10) => {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVideosByCategory = async () => {
    if (!categoryId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await youtubeApiService.getVideosByCategory(categoryId, limit);
      
      if (response.success) {
        setVideos(response.data);
      } else {
        setError(response.message || 'Failed to fetch videos by category');
        setVideos(response.data); // Use fallback data
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error fetching videos by category:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideosByCategory();
  }, [categoryId, limit]);

  return {
    videos,
    loading,
    error,
    refresh: fetchVideosByCategory
  };
};

export const useVideoSearch = () => {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const searchVideos = async (searchQuery: string, limit = 10) => {
    if (!searchQuery.trim()) {
      setVideos([]);
      return;
    }

    setLoading(true);
    setError(null);
    setQuery(searchQuery);
    
    try {
      const response = await youtubeApiService.searchVideos(searchQuery, limit);
      
      if (response.success) {
        setVideos(response.data);
      } else {
        setError(response.message || 'Failed to search videos');
        setVideos(response.data); // Use fallback data
      }
    } catch (err) {
      setError('Network error occurred');
      console.error('Error searching videos:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setVideos([]);
    setQuery('');
    setError(null);
  };

  return {
    videos,
    loading,
    error,
    query,
    searchVideos,
    clearSearch
  };
};