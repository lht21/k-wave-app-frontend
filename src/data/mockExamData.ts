import { ExamType, ExamSet, Question } from '../types/exam';

export const mockExamTypes: ExamType[] = [
  {
    id: 'topik1',
    title: 'TOPIK I',
    description: 'Test of Proficiency in Korean - Level I',
    icon: '📚',
    color: '#4CAF50'
  },
  {
    id: 'topik2',
    title: 'TOPIK II', 
    description: 'Test of Proficiency in Korean - Level II',
    icon: '📖',
    color: '#2196F3'
  },
  {
    id: 'esp',
    title: 'ESP',
    description: 'Employment Support Program',
    icon: '💼',
    color: '#FF9800'
  }
];

export const mockExamSets: ExamSet[] = [
  // TOPIK I Practice Sets
  {
    id: 'topik1-set1',
    title: 'Đề thi 1',
    examTypeId: 'topik1',
    isLocked: false,
    isPremium: false,
    questionCount: 20,
    timeLimit: 60, // 60 minutes for real exam
    difficulty: 'easy'
  },
  {
    id: 'topik1-set2',
    title: 'Đề thi 2',
    examTypeId: 'topik1',
    isLocked: false,
    isPremium: false,
    questionCount: 20,
    timeLimit: 60,
    difficulty: 'easy'
  },
  {
    id: 'topik1-set3',
    title: 'Đề thi 3',
    examTypeId: 'topik1',
    isLocked: false,
    isPremium: true,
    questionCount: 20,
    timeLimit: 60,
    difficulty: 'medium'
  },
  // TOPIK II Practice Sets
  {
    id: 'topik2-set1',
    title: 'Đề thi 1',
    examTypeId: 'topik2',
    isLocked: false,
    isPremium: false,
    questionCount: 30,
    timeLimit: 90,
    difficulty: 'medium'
  },
  {
    id: 'topik2-set2',
    title: 'Đề thi 2',
    examTypeId: 'topik2',
    isLocked: true,
    isPremium: true,
    questionCount: 30,
    timeLimit: 90,
    difficulty: 'hard'
  }
];

export const mockQuestions: Record<string, Question[]> = {
  'topik1-set1': [
    {
      id: 'q1',
      question: '"안녕하세요"의 의미는 무엇입니까?',
      options: ['안녕히 가세요', '반갑습니다', '안녕히 계세요', '처음 뵙겠습니다'],
      correctAnswer: 1,
      explanation: '"안녕하세요"는 만날 때 사용하는 인사말로 "반갑습니다"와 비슷한 의미입니다.',
      type: 'multiple-choice'
    },
    {
      id: 'q2',
      question: '다음 중 올바른 문장은 무엇입니까?',
      options: [
        '저는 학생이에요',
        '저는 학생입니다', 
        '저는 학생해요',
        '저는 학생가요'
      ],
      correctAnswer: 1,
      explanation: '"저는 학생입니다"가 정확한 문법입니다. "-입니다"는 명사 뒤에 붙는 존댓말 어미입니다.',
      type: 'multiple-choice'
    },
    {
      id: 'q3',
      question: '"감사합니다"는 언제 사용합니까?',
      options: [
        '처음 만날 때',
        '고마울 때',
        '헤어질 때',
        '사과할 때'
      ],
      correctAnswer: 1,
      explanation: '"감사합니다"는 고마운 마음을 표현할 때 사용하는 표현입니다.',
      type: 'multiple-choice'
    },
    {
      id: 'q4',
      question: '다음 중 가족 호칭이 아닌 것은?',
      options: [
        '어머니',
        '아버지',
        '선생님',
        '형'
      ],
      correctAnswer: 2,
      explanation: '"선생님"은 가족 호칭이 아니라 직업이나 역할을 나타내는 호칭입니다.',
      type: 'multiple-choice'
    },
    {
      id: 'q5',
      question: '학생이 선생님에게 "안녕하세요"라고 인사했습니다.',
      options: [
        '학생이 예의 바르다',
        '학생이 무례하다', 
        '학생이 슬프다',
        '학생이 화났다'
      ],
      correctAnswer: 0,
      explanation: '학생이 선생님에게 정중하게 인사하는 것은 예의 바른 행동입니다.',
      type: 'multiple-choice'
    },
    {
      id: 'q6', 
      question: '나라 프랑스에서 미식을 공부하고 있습니다.',
      options: [
        '언어를 배우고 있다',
        '요리를 배우고 있다',
        '역사를 배우고 있다', 
        '음악을 배우고 있다'
      ],
      correctAnswer: 1,
      explanation: '미식은 맛있는 음식, 요리를 뜻합니다.',
      type: 'multiple-choice'
    }
  ],
  'topik1-set2': [
    {
      id: 'q1',
      question: '"오늘"은 무슨 뜻입니까?',
      options: ['어제', '내일', '지금 이 날', '지난주'],
      correctAnswer: 2,
      explanation: '"오늘"은 현재 진행되고 있는 이 날을 의미합니다.',
      type: 'multiple-choice'
    },
    {
      id: 'q2',
      question: '숫자 "다섯"을 한글로 쓰면?',
      options: ['4', '5', '6', '7'],
      correctAnswer: 1,
      explanation: '"다섯"은 숫자 5를 의미합니다.',
      type: 'multiple-choice'
    },
    {
      id: 'q3',
      question: '"먹다"의 존댓말은?',
      options: ['드시다', '가시다', '오시다', '하시다'],
      correctAnswer: 0,
      explanation: '"먹다"의 존댓말은 "드시다" 또는 "잡수시다"입니다.',
      type: 'multiple-choice'
    }
  ]
};

// Timer formatting helper
export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Calculate exam result
export const calculateExamResult = (
  questions: Question[],
  userAnswers: (number | null)[],
  timeSpent: number,
  timeLimit?: number
) => {
  const totalQuestions = questions.length;
  let correctAnswers = 0;
  
  questions.forEach((question, index) => {
    if (userAnswers[index] === question.correctAnswer) {
      correctAnswers++;
    }
  });
  
  const incorrectAnswers = totalQuestions - correctAnswers;
  const percentage = Math.round((correctAnswers / totalQuestions) * 100);
  const score = Math.round((correctAnswers / totalQuestions) * 180); // TOPIK scoring
  
  return {
    totalQuestions,
    correctAnswers,
    incorrectAnswers,
    score,
    percentage,
    timeSpent,
    timeLimit
  };
};