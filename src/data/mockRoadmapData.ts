import { LessonNode, Skill, LessonContent, Vocabulary, Grammar, Question } from '../types/lesson';

export const mockRoadmapLevels: LessonNode[] = [
  // Level 1 - Beginner
  {
    id: '1',
    title: 'Sơ cấp 1',
    level: 1,
    isCompleted: false,
    isLocked: false,
    isCurrent: true,
    icon: '🏫',
    color: '#4CAF50',
    description: 'Bảng chữ cái',
    type: 'lesson'
  },
  {
    id: '2',
    title: 'Sơ cấp 2',
    level: 2,
    isCompleted: false,
    isLocked: false,
    isCurrent: false,
    icon: '🏫',
    color: '#4CAF50',
    description: 'Ngữ pháp',
    type: 'lesson'
  },
  {
    id: '3',
    title: 'Trung cấp 1',
    level: 3,
    isCompleted: false,
    isLocked: true,
    isCurrent: false,
    icon: '📚',
    color: '#FF9800',
    description: 'Luyện Đọc',
    type: 'lesson'
  },
  {
    id: '4',
    title: 'Trung cấp 2',
    level: 4,
    isCompleted: false,
    isLocked: true,
    isCurrent: false,
    icon: '📚',
    color: '#FF9800',
    description: 'Luyện Nói',
    type: 'lesson'
  },
  {
    id: '5',
    title: 'Cao cấp 1',
    level: 5,
    isCompleted: false,
    isLocked: true,
    isCurrent: false,
    icon: '🏛️',
    color: '#9C27B0',
    description: 'Sinh hoạt hàng ngày',
    type: 'lesson'
  },
  {
    id: '6',
    title: 'Cao cấp 2',
    level: 6,
    isCompleted: false,
    isLocked: true,
    isCurrent: false,
    icon: '🏛️',
    color: '#9C27B0',
    description: 'Ngày và thứ',
    type: 'lesson'
  },
  // Culture and daily activities
  {
    id: 'culture-1',
    title: 'Văn hóa',
    level: 0,
    isCompleted: false,
    isLocked: false,
    isCurrent: false,
    icon: '🏯',
    color: '#FFD700',
    description: 'Văn hóa trong ngày',
    type: 'culture'
  }
];

export const mockSkills: Skill[] = [
  {
    id: 'vocabulary',
    name: 'Từ vựng',
    icon: '📝',
    color: '#4CAF50',
    progress: 75,
    isUnlocked: true
  },
  {
    id: 'grammar',
    name: 'Ngữ pháp', 
    icon: '📖',
    color: '#2196F3',
    progress: 60,
    isUnlocked: true
  },
  {
    id: 'listening',
    name: 'Luyện Nghe',
    icon: '🎧',
    color: '#FF9800',
    progress: 40,
    isUnlocked: true
  },
  {
    id: 'speaking',
    name: 'Luyện Nói',
    icon: '🗣️',
    color: '#E91E63',
    progress: 30,
    isUnlocked: false
  },
  {
    id: 'reading',
    name: 'Luyện Đọc',
    icon: '📚',
    color: '#9C27B0',
    progress: 20,
    isUnlocked: false
  },
  {
    id: 'writing',
    name: 'Luyện Viết',
    icon: '✍️',
    color: '#795548',
    progress: 10,
    isUnlocked: false
  }
];

export const mockVocabularies: Vocabulary[] = [
  {
    id: '1',
    korean: '안녕하세요',
    vietnamese: 'Xin chào',
    pronunciation: 'annyeong-haseyo'
  },
  {
    id: '2', 
    korean: '감사합니다',
    vietnamese: 'Cảm ơn',
    pronunciation: 'gamsa-hamnida'
  },
  {
    id: '3',
    korean: '죄송합니다',
    vietnamese: 'Xin lỗi',
    pronunciation: 'joeseong-hamnida'
  }
];

export const mockGrammars: Grammar[] = [
  {
    id: '1',
    pattern: '-입니다/-습니다',
    meaning: 'Dạng tôn trọng của động từ "là"',
    usage: 'Sử dụng khi muốn nói một cách trang trọng và lịch sự',
    examples: [
      {
        korean: '저는 학생입니다',
        vietnamese: 'Tôi là học sinh',
        pronunciation: 'jeoneun haksaeng-imnida'
      }
    ]
  }
];

export const mockQuestions: Question[] = [
  {
    id: '1',
    question: '"안녕하세요" có nghĩa là gì?',
    options: ['Tạm biệt', 'Xin chào', 'Cảm ơn', 'Xin lỗi'],
    correctAnswer: 1,
    explanation: '"안녕하세요" là cách chào hỏi lịch sự trong tiếng Hàn',
    type: 'multiple-choice'
  }
];

export const mockLessonContent: LessonContent[] = [
  {
    id: 'lesson-1-vocab',
    lessonId: '692ead3558ea326e3da336f9',
    skillType: 'vocabulary',
    title: 'Từ vựng cơ bản',
    items: [
      {
        id: '1',
        type: 'vocabulary',
        content: mockVocabularies[0]
      }
    ]
  },
  {
    id: 'lesson-1-grammar',
    lessonId: '692ead3558ea326e3da336fa', 
    skillType: 'grammar',
    title: 'Ngữ pháp cơ bản',
    items: [
      {
        id: '1',
        type: 'grammar',
        content: mockGrammars[0]
      }
    ]
  }
];