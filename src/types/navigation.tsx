import { NavigatorScreenParams } from '@react-navigation/native';

export type TabParamList = {
  Roadmap: undefined;
  LearnImage: undefined;
  Home: undefined;
  News: undefined;
  Setting: undefined;
};

export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  Main: NavigatorScreenParams<TabParamList>;
  Home: undefined;
  Setting: undefined;
  Profile: undefined;
  
  // Learning screens
  StdRoadmap: undefined;
  StdLesson: { lessonId: string; lessonTitle: string };
  StdSkillPractice: { 
    lessonId: string; 
    skillType: 'vocabulary' | 'grammar' | 'listening' | 'speaking' | 'reading' | 'writing';
    skillTitle: string;
  };
  
  // Exam screens
  StdPracticeExam: undefined;  // Thi thử (practice mode)
  StdRealExam: undefined;      // Thi thật (real mode) 
  StdExamTaking: { examSetId: string; examMode: 'practice' | 'real'; examTitle: string };
  StdExamNew: { examType: string; examId: string; examMode: 'practice' | 'real' };
  StdExamSelector: undefined;
  
  // Auth screens
  TeacherSignUp: undefined;
  ForgotPassword: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}