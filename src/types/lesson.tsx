export interface User {
  _id: string;
  name: string;
  email: string;
  fullName?: string;
  role?: string;
}

export interface Vocabulary {
  _id: string;
  koreanWord: string;
  vietnameseMeaning: string;
  level: string;
}

export interface Lesson {
  _id: string;
  code: string;
  title: string;
  level: string;
  description?: string;
  thumbnail?: string;
  order: number;
  author: User;
  vocabulary: Vocabulary[];
  grammar: string[];
  listening: string[];
  speaking: string[];
  reading: string[];
  writing: string[];
  isPremium: boolean;
  previewContent?: string;
  estimatedDuration: number;
  viewCount: number;
  completionCount: number;
  averageRating: number;
  isPublished: boolean;
  isActive: boolean;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  approvedBy?: User;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
  
  // Virtual fields
  totalComponents?: number;
  totalEstimatedDuration?: number;
}