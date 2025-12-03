export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  type: 'multiple-choice' | 'fill-in-blank';
  image?: string;
}

export interface ExamType {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

export interface ExamSet {
  id: string;
  title: string;
  examTypeId: string;
  isLocked: boolean;
  isPremium: boolean;
  questionCount: number;
  timeLimit?: number; // minutes, for real exam only
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface ExamSession {
  id: string;
  examSetId: string;
  examMode: 'practice' | 'real';
  questions: Question[];
  userAnswers: (number | null)[];
  startTime: Date;
  endTime?: Date;
  timeLimit?: number; // minutes
  isCompleted: boolean;
}

export interface ExamResult {
  sessionId: string;
  examSetId: string;
  examMode: 'practice' | 'real';
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  score: number;
  percentage: number;
  timeSpent: number; // seconds
  timeLimit?: number; // seconds
  completedAt: Date;
}
export interface CreateExamData {
  title: string;               // BẮT BUỘC
  description?: string;
  examType: 'topik1' | 'topik2' | 'esp';
  category: 'official' | 'practice';
  listening: number;
  reading: number;
  writing: number;
  duration: number;
  isPremium: boolean;
}
