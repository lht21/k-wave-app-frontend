// News Scraper Service for Korean News Sources (FALLBACK ONLY)
// This service is now deprecated in favor of backend API
// Backend now handles real scraping from Korean news sources
import { NewsArticle } from './newsApiService';

export interface NewsSource {
  id: string;
  name: string;
  baseUrl: string;
  icon: string;
  scrapeMethod: 'api' | 'rss' | 'web';
}

export const koreanNewsSources: NewsSource[] = [
  {
    id: 'SBS',
    name: 'SBS',
    baseUrl: 'https://news.sbs.co.kr',
    icon: '📺',
    scrapeMethod: 'rss'
  },
  {
    id: '연합뉴스',
    name: '연합뉴스',
    baseUrl: 'https://www.yna.co.kr',
    icon: '🗞️',
    scrapeMethod: 'rss'
  },
  {
    id: 'KBS',
    name: 'KBS',
    baseUrl: 'https://news.kbs.co.kr',
    icon: '📺',
    scrapeMethod: 'rss'
  },
  {
    id: '중앙일보',
    name: '중앙일보',
    baseUrl: 'https://www.donga.com',
    icon: '📰',
    scrapeMethod: 'rss'
  }
];

class NewsScraperService {
  // Mock data generator for each source
  private generateMockNewsForSource(sourceId: string, count: number = 10): NewsArticle[] {
    const sourceInfo = koreanNewsSources.find(s => s.id === sourceId);
    if (!sourceInfo) return [];

    const mockTitles = {
      'SBS': [
        'SBS 8뉴스: 한국 경제 성장률 전망 상향 조정',
        'SBS 특집: K-pop 아이돌의 글로벌 영향력 분석',
        'SBS 리포트: 서울 지하철 노선 확장 계획 발표',
        'SBS 날씨정보: 이번 주 전국 기온 변화 예상',
        'SBS 스포츠뉴스: 한국 축구대표팀 최신 소식',
        'SBS 문화: 한복 디자인 혁신으로 젊은층 관심 집중',
        'SBS 사회: 디지털 교육 플랫폼 확산 현황'
      ],
      '연합뉴스': [
        '연합뉴스 속보: 한미 정상회담 주요 성과 분석',
        '연합뉴스: 국정감사 주요 이슈 및 쟁점 정리',
        '연합뉴스 경제: 반도체 산업 글로벌 동향 분석',
        '연합뉴스: 코스피 지수 상승세 지속, 투자 전망',
        '연합뉴스 사회: 전국 대학 입시 동향 및 변화',
        '연합뉴스: CBDC 도입 연구개발 현황',
        '연합뉴스 국제: 한국 외교정책 새로운 방향'
      ],
      'KBS': [
        'KBS 뉴스9: 정부 정책 변화 및 향후 계획',
        'KBS 문화뉴스: 한국 전통문화 보존 노력과 성과',
        'KBS 교육뉴스: 디지털 교육 혁신 방안 발표',
        'KBS 건강뉴스: 겨울철 건강 관리 전문가 조언',
        'KBS 과학뉴스: 누리호 성공과 우주 기술 발전',
        'KBS 스포츠: 손흥민 토트넘 200골 달성 소식',
        'KBS 연예: K-pop 산업 글로벌 성장세 지속'
      ],
      '중앙일보': [
        '중앙일보 사설: 한국 사회 변화 방향성과 과제',
        '중앙일보 경제: 글로벌 경제 위기 대응 전략',
        '중앙일보 문화: 한국 영화 해외 진출 성과',
        '중앙일보 정치: 국회 주요 법안 처리 현황',
        '중앙일보 사회: 인구 변화와 사회 정책 대응',
        '중앙일보 IT: AI 반도체 시장 진출 가속화',
        '중앙일보 과학: 우주항공 기술 발전과 전망'
      ]
    };

    const categories = ['politics', 'economy', 'society', 'culture', 'sports', 'entertainment', 'technology'];
    const difficulties: Array<'beginner' | 'intermediate' | 'advanced'> = ['beginner', 'intermediate', 'advanced'];
    
    const titles = mockTitles[sourceId as keyof typeof mockTitles] || mockTitles['연합뉴스'];

    return Array.from({ length: count }, (_, index) => {
      const titleIndex = index % titles.length;
      const category = categories[Math.floor(Math.random() * categories.length)];
      const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
      
      return {
        id: `${sourceId.toLowerCase()}-${Date.now()}-${index}`,
        title: titles[titleIndex],
        subtitle: `${sourceInfo.name}에서 제공하는 최신 뉴스입니다. 다양한 관점에서 분석한 내용을 확인해보세요.`,
        summary: `${sourceInfo.name}의 주요 뉴스 내용을 요약해서 전달합니다.`,
        content: `${titles[titleIndex]}에 대한 상세 내용입니다. ${sourceInfo.name}에서 심층 취재한 결과를 바탕으로 작성되었습니다. 이번 이슈는 한국 사회에 중요한 영향을 미칠 것으로 예상됩니다.`,
        source: sourceInfo.name,
        author: `${sourceInfo.name} 기자`,
        category: category,
        difficulty: difficulty,
        readingTime: Math.floor(Math.random() * 10) + 3,
        imageUrl: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 100000000)}?w=800&h=400&fit=crop`,
        keywords: ['한국', '뉴스', sourceInfo.name],
        tags: [category, sourceInfo.name, difficulty],
        publishedDate: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        views: Math.floor(Math.random() * 5000) + 100,
        likes: Math.floor(Math.random() * 200) + 10,
        bookmarks: Math.floor(Math.random() * 100) + 5
      };
    });
  }

  // Get news from specific source
  async getNewsFromSource(sourceId: string, limit: number = 20): Promise<NewsArticle[]> {
    try {
      // In a real implementation, this would scrape from the actual website
      // For now, we'll return mock data
      console.log(`Fetching news from ${sourceId}`);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return this.generateMockNewsForSource(sourceId, limit);
    } catch (error) {
      console.error(`Error fetching news from ${sourceId}:`, error);
      return this.generateMockNewsForSource(sourceId, limit);
    }
  }

  // Get aggregated news from all sources
  async getAggregatedNews(limit: number = 20): Promise<NewsArticle[]> {
    try {
      const allNews: NewsArticle[] = [];
      
      // Get news from each source
      for (const source of koreanNewsSources) {
        const sourceNews = await this.getNewsFromSource(source.id, Math.ceil(limit / koreanNewsSources.length));
        allNews.push(...sourceNews);
      }
      
      // Sort by published date (newest first) and limit results
      return allNews
        .sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime())
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting aggregated news:', error);
      return [];
    }
  }

  // Get news by category from all sources
  async getNewsByCategory(category: string, limit: number = 20): Promise<NewsArticle[]> {
    try {
      const allNews = await this.getAggregatedNews(limit * 2); // Get more to filter by category
      
      return allNews
        .filter(news => news.category === category)
        .slice(0, limit);
    } catch (error) {
      console.error(`Error getting news by category ${category}:`, error);
      return [];
    }
  }

  // Search news across all sources
  async searchNews(query: string, limit: number = 20): Promise<NewsArticle[]> {
    try {
      const allNews = await this.getAggregatedNews(limit * 2);
      
      const searchLower = query.toLowerCase();
      return allNews
        .filter(news => 
          news.title.toLowerCase().includes(searchLower) ||
          news.subtitle.toLowerCase().includes(searchLower) ||
          news.keywords.some(keyword => keyword.toLowerCase().includes(searchLower))
        )
        .slice(0, limit);
    } catch (error) {
      console.error(`Error searching news with query ${query}:`, error);
      return [];
    }
  }
}

export const newsScraperService = new NewsScraperService();

// Helper functions for web scraping (future implementation)
export const webScrapingHelpers = {
  // Extract title from HTML
  extractTitle: (html: string, selector: string): string => {
    // This would use a proper HTML parser in real implementation
    return '';
  },

  // Extract content from HTML
  extractContent: (html: string, selector: string): string => {
    // This would use a proper HTML parser in real implementation
    return '';
  },

  // Extract image URL from HTML
  extractImageUrl: (html: string, selector: string): string => {
    // This would use a proper HTML parser in real implementation
    return '';
  },

  // Clean and format text
  cleanText: (text: string): string => {
    return text.trim().replace(/\s+/g, ' ');
  }
};

export default newsScraperService;