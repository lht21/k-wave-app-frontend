// Navigation types for the app

export type RootStackParamList = {
  // Auth screens
  Login: undefined;
  SignUp: undefined;
  TeacherSignUp: undefined;
  ForgotPassword: undefined;

  // Main tab navigator
  Main: undefined;

  // Learning screens
  StdRoadmap: undefined;
  StdLesson: { 
    lessonId: string;
    lessonTitle: string;
  };
  StdSkillPractice: {
    skillType: 'listening' | 'reading' | 'writing' | 'speaking' | 'vocabulary' | 'grammar';
    skillTitle: string;
    lessonId: string;
  };
  
  // Exam screens
  StdPracticeExam: undefined;
  StdRealExam: undefined;
  StdExamTaking: {
    examId: string;
    examTitle: string;
    examType: 'practice' | 'real';
    timeLimit?: number;
    questions: any[];
  };

  // Culture screens
  StdCulture: undefined;
  StdCultureDetail: {
    itemId: string;
    itemTitle: string;
  };

  // News screens
  NewsDetail: {
    newsId: string;
    title: string;
  };
  
  NewsList: undefined;

  // Video screens
  StdVideoLearning: undefined;
  VideoCategory: {
    categoryId: string;
    categoryTitle: string;
  };
  VideoDetail: {
    videoId: string;
    videoTitle: string;
  };
};

// Tab navigator types
export type MainTabParamList = {
  Roadmap: undefined;
  LearnImage: undefined;
  Home: undefined;
  News: undefined;
  Setting: undefined;
};

// Setting stack types
export type SettingStackParamList = {
  Dashboard: undefined;
  Settings: undefined;
};