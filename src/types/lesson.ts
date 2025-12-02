export interface LessonNode {
  id: string;
  title: string;
  level: number;
  isCompleted: boolean;
  isLocked: boolean;
  isCurrent: boolean;
  icon: string;
  color: string;
  description: string;
  type: 'lesson' | 'vocabulary' | 'grammar' | 'culture' | 'daily';
}

export interface Skill {
  id: string;
  name: string;
  icon: string;
  color: string;
  progress: number; // 0-100
  isUnlocked: boolean;
}

export interface LessonContent {
  id: string;
  lessonId: string;
  skillType: 'vocabulary' | 'grammar' | 'listening' | 'speaking' | 'reading' | 'writing';
  title: string;
  items: ContentItem[];
}

export interface ContentItem {
  id: string;
  type: 'vocabulary' | 'grammar' | 'question' | 'exercise';
  content: any;
}

export interface Vocabulary {
  id: string;
  korean: string;
  vietnamese: string;
  pronunciation: string;
  example?: string;
  image?: string;
}

export interface Grammar {
  id: string;
  pattern: string;
  meaning: string;
  usage: string;
  examples: GrammarExample[];
}

export interface GrammarExample {
  korean: string;
  vietnamese: string;
  pronunciation?: string;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  type: 'multiple-choice' | 'fill-in-blank' | 'matching';
}

export interface Exercise {
  id: string;
  instruction: string;
  type: 'pronunciation' | 'writing' | 'listening' | 'conversation';
  content: any;
}