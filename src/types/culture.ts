export interface CultureCategory {
  id: string;
  title: string;
  icon: string;
  color: string;
  description: string;
  items: CultureItem[];
}

export interface CultureItem {
  id: string;
  categoryId: string;
  title: string;
  subtitle?: string;
  description: string;
  content: string;
  image?: string;
  tags?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

export interface CultureDetail {
  id: string;
  title: string;
  description: string;
  content: CultureSection[];
  relatedItems?: string[];
}

export interface CultureSection {
  type: 'text' | 'image' | 'list' | 'highlight';
  content: string | string[];
  image?: string;
}