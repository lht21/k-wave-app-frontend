import { useState, useEffect, useCallback } from 'react';
import { newsApiService, NewsArticle, NewsSearchParams } from '../services/newsApiService';

// Mock data as fallback
const mockNewsData: NewsArticle[] = [
  {
    id: '1',
    title: '한국 K-pop 산업, 글로벌 음악 시장에서 지속적인 성장세 보여',
    subtitle: 'BTS와 블랙핑크의 세계적 성공으로 한국 음악 산업의 수출액 크게 증가',
    summary: '한국의 K-pop 산업이 전 세계 음악 시장에서 눈부신 성장을 지속하고 있다.',
    source: 'KBS',
    author: 'KBS 문화부',
    category: 'entertainment',
    difficulty: 'intermediate',
    readingTime: 6,
    imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=400&fit=crop',
    publishedDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    views: 1250,
    likes: 89,
    bookmarks: 45,
    keywords: ['K-pop', 'BTS', '블랙핑크', '한류', '음악'],
    tags: ['entertainment', 'KBS', 'intermediate', 'music']
  },
  {
    id: '2',
    title: '서울시, 지하철 운행 시간 1시간 연장 추진',
    subtitle: '시민 편의성 향상을 위한 심야 대중교통 서비스 확대 계획',
    summary: '서울시가 지하철 운행 시간을 기존보다 1시간 연장하는 방안을 적극 검토하고 있다.',
    source: '연합뉴스',
    author: '연합뉴스 서울시정팀',
    category: 'society',
    difficulty: 'beginner',
    readingTime: 4,
    imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&h=400&fit=crop',
    publishedDate: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    views: 892,
    likes: 67,
    bookmarks: 23,
    keywords: ['지하철', '서울시', '교통', '시민', '편의'],
    tags: ['society', '연합뉴스', 'beginner', 'transportation']
  },
  {
    id: '3',
    title: '한국 반도체 기업들, AI 칩 시장 진출 가속화',
    subtitle: '삼성전자와 SK하이닉스, 차세대 AI 반도체 개발에 대규모 투자',
    summary: '국내 주요 반도체 기업들이 인공지능(AI) 칩 시장 진출에 박차를 가하고 있다.',
    source: '중앙일보',
    author: '중앙일보 경제부',
    category: 'technology',
    difficulty: 'advanced',
    readingTime: 8,
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop',
    publishedDate: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    views: 1456,
    likes: 123,
    bookmarks: 78,
    keywords: ['반도체', 'AI', '삼성전자', 'SK하이닉스', '투자'],
    tags: ['technology', '중앙일보', 'advanced', 'semiconductor']
  },
  {
    id: '4',
    title: '김치의 세계화, 프랑스 미슐랭 레스토랑에서도 인기',
    subtitle: '한국 전통 발효식품 김치가 서구 고급 요리계에서 새로운 트렌드로 부상',
    summary: '한국의 대표적인 전통 발효식품인 김치가 유럽의 고급 레스토랑가에서 새로운 요리 트렌드로 자리 잡고 있다.',
    source: '동아일보',
    author: '동아일보 문화부',
    category: 'food',
    difficulty: 'intermediate',
    readingTime: 7,
    imageUrl: 'https://images.unsplash.com/photo-1553702446-a39d6fbee6b4?w=800&h=400&fit=crop',
    publishedDate: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    views: 734,
    likes: 56,
    bookmarks: 34,
    keywords: ['김치', '미슐랭', '발효', '한식', '세계화'],
    tags: ['food', '동아일보', 'intermediate', 'culture']
  },
  {
    id: '5',
    title: '손흥민, 토트넘에서 200골 달성하며 아시아 선수 최고 기록',
    subtitle: '프리미어리그에서 활약하는 한국 축구의 자랑, 새로운 이정표 세워',
    summary: '토트넘 홋스퍼의 손흥민이 클럽 통산 200호 골을 달성하며 아시아 선수로는 최고 기록을 세웠다.',
    source: 'SBS',
    author: 'SBS 스포츠팀',
    category: 'sports',
    difficulty: 'beginner',
    readingTime: 5,
    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=400&fit=crop',
    publishedDate: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    views: 2145,
    likes: 198,
    bookmarks: 87,
    keywords: ['손흥민', '토트넘', '축구', '프리미어리그', '아시아'],
    tags: ['sports', 'SBS', 'beginner', 'football']
  }
];

interface UseNewsResult {
  news: NewsArticle[];
  loading: boolean;
  error: string | null;
  pagination: {
    current: number;
    total: number;
    limit: number;
    totalItems: number;
  };
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
}

export const useNews = (params: NewsSearchParams = {}) => {
  const [news, setNews] = useState<NewsArticle[]>(mockNewsData); // Start with mock data
  const [loading, setLoading] = useState(false); // Start without loading
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    limit: 20,
    totalItems: mockNewsData.length
  });

  const fetchNews = useCallback(async (newParams: NewsSearchParams = {}, append: boolean = false) => {
    const mergedParams = { ...params, ...newParams };
    
    // Always start with filtered mock data
    let filteredMockData = [...mockNewsData];
    
    // Apply filters to mock data
    if (mergedParams.category && mergedParams.category !== 'all') {
      filteredMockData = filteredMockData.filter(item => item.category === mergedParams.category);
    }
    if (mergedParams.source && mergedParams.source !== 'all') {
      filteredMockData = filteredMockData.filter(item => item.source === mergedParams.source);
    }
    if (mergedParams.search) {
      filteredMockData = filteredMockData.filter(item => 
        item.title.toLowerCase().includes(mergedParams.search!.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(mergedParams.search!.toLowerCase())
      );
    }
    
    // Set mock data immediately
    if (append) {
      setNews(prevNews => [...prevNews, ...filteredMockData]);
    } else {
      setNews(filteredMockData);
    }
    setPagination({
      current: 1,
      total: 1,
      limit: mergedParams.limit || 20,
      totalItems: filteredMockData.length
    });
    
    // Try to fetch from API in background (optional enhancement)
    try {
      setLoading(true);
      setError(null);
      const response = await newsApiService.getAllNews(mergedParams);
      
      if (response.success && response.data.news.length > 0) {
        // If API returns data, replace mock data
        if (append) {
          setNews(prevNews => [...prevNews, ...response.data.news]);
        } else {
          setNews(response.data.news);
        }
        setPagination(response.data.pagination);
      }
    } catch (apiError) {
      console.log('API fetch failed, using mock data:', apiError);
      // Keep using mock data - no error shown to user
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    return fetchNews({ ...params, page: 1 }, false);
  }, [fetchNews]);

  const loadMore = useCallback(() => {
    if (pagination.current < pagination.total) {
      return fetchNews({ ...params, page: pagination.current + 1 }, true);
    }
    return Promise.resolve();
  }, [fetchNews, pagination]);

  useEffect(() => {
    // Initial load with current params
    fetchNews(params);
  }, []); // Only run on mount

  // Refetch when filter parameters change
  useEffect(() => {
    fetchNews(params);
  }, [params.category, params.source, params.search, params.limit]);

  return {
    news,
    loading,
    error,
    pagination,
    refetch,
    loadMore,
    hasMore: pagination.current < pagination.total
  };
};

interface UseNewsDetailResult {
  news: NewsArticle | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useNewsDetail = (id: string) => {
  const [news, setNews] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNewsDetail = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await newsApiService.getNewsById(id);
      
      if (response.success) {
        setNews(response.data);
      } else {
        setError('Failed to fetch news detail');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const refetch = useCallback(() => {
    return fetchNewsDetail();
  }, [fetchNewsDetail]);

  useEffect(() => {
    fetchNewsDetail();
  }, [fetchNewsDetail]);

  return {
    news,
    loading,
    error,
    refetch
  };
};

interface UseNewsSearchResult extends UseNewsResult {
  search: (query: string) => Promise<void>;
  clearSearch: () => void;
  searchQuery: string;
}

export const useNewsSearch = () => {
  const [searchResults, setSearchResults] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    limit: 20,
    totalItems: 0
  });

  const search = useCallback(async (query: string, limit: number = 20) => {
    if (!query.trim()) {
      clearSearch();
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSearchQuery(query);
      
      const response = await newsApiService.searchNews(query, limit);
      
      if (response.success) {
        setSearchResults(response.data.news);
        setPagination({
          current: 1,
          total: Math.ceil(response.data.total / limit),
          limit: limit,
          totalItems: response.data.total
        });
      } else {
        setError('Failed to search news');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setSearchQuery('');
    setError(null);
    setPagination({
      current: 1,
      total: 1,
      limit: 20,
      totalItems: 0
    });
  }, []);

  const loadMore = useCallback(async () => {
    if (!searchQuery || pagination.current >= pagination.total) {
      return Promise.resolve();
    }

    try {
      setLoading(true);
      const response = await newsApiService.searchNews(searchQuery, pagination.limit);
      
      if (response.success) {
        setSearchResults(prev => [...prev, ...response.data.news]);
        setPagination(prev => ({ ...prev, current: prev.current + 1 }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, pagination]);

  const refetch = useCallback(() => {
    if (searchQuery) {
      return search(searchQuery);
    }
    return Promise.resolve();
  }, [search, searchQuery]);

  return {
    news: searchResults,
    loading,
    error,
    pagination,
    search,
    clearSearch,
    searchQuery,
    refetch,
    loadMore,
    hasMore: pagination.current < pagination.total
  };
};

interface UseNewsCategoriesResult {
  categories: { [key: string]: NewsArticle[] };
  loading: boolean;
  error: string | null;
  fetchCategory: (category: string, limit?: number) => Promise<void>;
}

export const useNewsCategories = () => {
  const [categories, setCategories] = useState<{ [key: string]: NewsArticle[] }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategory = useCallback(async (category: string, limit: number = 10) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await newsApiService.getNewsByCategory(category, limit);
      
      if (response.success) {
        setCategories(prev => ({
          ...prev,
          [category]: response.data.news
        }));
      } else {
        setError(`Failed to fetch ${category} news`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    categories,
    loading,
    error,
    fetchCategory
  };
};