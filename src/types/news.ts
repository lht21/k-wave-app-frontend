export interface NewsArticle {
  id: string;
  title: string;
  subtitle?: string;
  content: string;
  author: string;
  publishedDate: string;
  source: string;
  imageUrl: string;
  category: string;
  tags: string[];
  readingTime: number; // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  vocabulary: string[]; // Key Korean words in the article
}

export interface NewsCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}