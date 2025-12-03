import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  ScrollView,
  SafeAreaView,
  Modal
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { spacing } from '../../theme/spacing';
import { colors, palette } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { RootStackParamList } from '../../types/navigation';
import { mockExamSets, mockQuestions } from '../../data/mockExamData';
import { Question, ExamSession, ExamResult } from '../../types/exam';
import { formatTime } from '../../utils/examUtils';
import QuestionGridModal from '../../components/QuestionGridModal';
// Note: Removed WordPopup and ClickableText - no vocabulary popup needed in exams

type StdExamTakingNavigationProp = StackNavigationProp<RootStackParamList>;
type StdExamTakingRouteProp = RouteProp<RootStackParamList, 'StdExamTaking'>;

const StdExamTaking: React.FC = () => {
  const navigation = useNavigation<StdExamTakingNavigationProp>();
  const route = useRoute<StdExamTakingRouteProp>();
  
  const { examId, examType, examTitle } = route.params;
  
  // Find exam set and questions
  const examSet = mockExamSets.find(set => set.id === examId);
  const questions = mockQuestions[examId] || [];
  
  // State management
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [timeLeft, setTimeLeft] = useState(examType === 'real' ? (examSet?.timeLimit || 60) * 60 : 0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showQuestionGrid, setShowQuestionGrid] = useState(false);
  
  // Note: Removed word popup functionality - not needed in exams
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTime = useRef(Date.now());

  // Timer effect
  useEffect(() => {
    if (examType === 'real' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [examType, timeLeft]);

  // Auto submit when time runs out
  const handleAutoSubmit = () => {
    Alert.alert(
      'Hết thời gian!',
      'Bài thi của bạn sẽ được nộp tự động.',
      [{ text: 'OK', onPress: () => submitExam(true) }]
    );
  };

  // Handle answer selection
  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  };

  // Navigate to specific question
  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  // Calculate results
  const calculateResults = (): ExamResult => {
    let correctCount = 0;
    const incorrectCount = questions.length - Object.keys(selectedAnswers).length;

    questions.forEach((question, index) => {
      const selectedAnswer = selectedAnswers[index];
      if (selectedAnswer === question.correctAnswer) {
        correctCount++;
      }
    });

    const percentage = Math.round((correctCount / questions.length) * 100);
    const score = Math.round((correctCount / questions.length) * 180); // TOPIK scoring
    const timeSpent = Math.floor((Date.now() - startTime.current) / 1000);

    return {
      sessionId: `session_${Date.now()}`,
      examSetId: examId,
      examMode: examType,
      totalQuestions: questions.length,
      correctAnswers: correctCount,
      incorrectAnswers: questions.length - correctCount,
      score,
      percentage,
      timeSpent,
      timeLimit: examType === 'real' ? (examSet?.timeLimit || 60) * 60 : undefined,
      completedAt: new Date()
    };
  };

  // Submit exam
  const submitExam = (isAutoSubmit = false) => {
    setIsSubmitting(true);
    
    // Calculate results
    const result = calculateResults();
    
    // Save to storage or send to server here
    console.log('Exam Result:', result);
    
    // Navigate to result screen (implement later)
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSubmitModal(false);
      
      Alert.alert(
        'Hoàn thành bài thi!',
        `Điểm của bạn: ${result.score}/100\nĐúng ${result.correctAnswers}/${result.totalQuestions} câu`,
        [
          { text: 'Xem chi tiết', onPress: () => navigation.goBack() },
          { text: 'Về trang chủ', onPress: () => navigation.navigate('Main' as any) }
        ]
      );
    }, 1500);
  };

  // Handle submit button press
  const handleSubmitPress = () => {
    const answeredCount = Object.keys(selectedAnswers).length;
    const unansweredCount = questions.length - answeredCount;
    
    if (unansweredCount > 0) {
      Alert.alert(
        'Còn câu hỏi chưa trả lời',
        `Bạn còn ${unansweredCount} câu chưa trả lời. Bạn có chắc chắn muốn nộp bài?`,
        [
          { text: 'Tiếp tục làm', style: 'cancel' },
          { text: 'Nộp bài', style: 'destructive', onPress: () => setShowSubmitModal(true) }
        ]
      );
    } else {
      setShowSubmitModal(true);
    }
  };

  // Handle back button press
  const handleBackPress = () => {
    Alert.alert(
      'Thoát bài thi?',
      'Nếu bạn thoát, bài thi sẽ không được lưu. Bạn có chắc chắn?',
      [
        { text: 'Tiếp tục làm', style: 'cancel' },
        { text: 'Thoát', style: 'destructive', onPress: () => navigation.goBack() }
      ]
    );
  };

  if (!examSet || questions.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Không tìm thấy đề thi!</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={handleBackPress}>
          <Text style={styles.headerButtonText}>←</Text>
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.examTitle} numberOfLines={1}>{examTitle}</Text>
          <Text style={styles.questionCounter}>
            {currentQuestionIndex + 1}/{questions.length}
          </Text>
        </View>

        {examType === 'real' && (
          <View style={styles.timerContainer}>
            <Text style={[styles.timerText, timeLeft < 300 && styles.timerWarning]}>
              ⏰ {formatTime(timeLeft)}
            </Text>
          </View>
        )}
        
        {examType === 'practice' && (
          <View style={styles.modeContainer}>
            <Text style={styles.modeText}>🎯 THI THử</Text>
          </View>
        )}
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBar, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>{Math.round(progress)}%</Text>
      </View>

      {/* Question Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.questionContainer}>
          <Text style={styles.questionNumber}>Câu {currentQuestionIndex + 1}</Text>
          <Text style={styles.questionText}>
            {currentQuestion.question}
          </Text>
          
          {/* Answer Options */}
          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option, index) => {
              const optionKey = String.fromCharCode(65 + index); // A, B, C, D
              const isSelected = selectedAnswers[currentQuestionIndex] === index;
              
              return (
                <TouchableOpacity
                  key={optionKey}
                  style={[styles.optionButton, isSelected && styles.selectedOption]}
                  onPress={() => handleAnswerSelect(currentQuestionIndex, index)}
                >
                  <View style={[styles.optionIndicator, isSelected && styles.selectedIndicator]}>
                    <Text style={[styles.optionLetter, isSelected && styles.selectedLetter]}>
                      {optionKey}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>
                      {option}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
          
          {/* Show explanation in practice mode if answered */}
          {examType === 'practice' && selectedAnswers[currentQuestionIndex] && currentQuestion.explanation && (
            <View style={styles.explanationContainer}>
              <Text style={styles.explanationTitle}>💡 Giải thích:</Text>
              <Text style={styles.explanationText}>{currentQuestion.explanation}</Text>
              <Text style={styles.correctAnswerText}>
                Đáp án đúng: {String.fromCharCode(65 + currentQuestion.correctAnswer)}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[styles.navButton, currentQuestionIndex === 0 && styles.disabledButton]}
          onPress={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
          disabled={currentQuestionIndex === 0}
        >
          <Text style={[styles.navButtonText, currentQuestionIndex === 0 && styles.disabledText]}>
            ← Trước
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.questionGridButton} onPress={() => setShowQuestionGrid(true)}>
          <Text style={styles.questionGridText}>🔢 Tổng quan</Text>
        </TouchableOpacity>

        {currentQuestionIndex === questions.length - 1 ? (
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmitPress}>
            <Text style={styles.submitButtonText}>Nộp bài</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
          >
            <Text style={styles.navButtonText}>Sau →</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Submit Confirmation Modal */}
      <Modal
        visible={showSubmitModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSubmitModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Xác nhận nộp bài</Text>
            <Text style={styles.modalText}>
              Bạn đã hoàn thành {Object.keys(selectedAnswers).length}/{questions.length} câu hỏi.
            </Text>
            <Text style={styles.modalText}>
              Bạn có chắc chắn muốn nộp bài thi không?
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowSubmitModal(false)}
              >
                <Text style={styles.modalCancelText}>Hủy</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.modalSubmitButton}
                onPress={() => submitExam()}
                disabled={isSubmitting}
              >
                <Text style={styles.modalSubmitText}>
                  {isSubmitting ? 'Đang nộp...' : 'Nộp bài'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Word Popup removed - not needed in exams */}

      {/* Question Grid Modal */}
      <QuestionGridModal
        visible={showQuestionGrid}
        onClose={() => setShowQuestionGrid(false)}
        totalQuestions={questions.length}
        currentQuestionIndex={currentQuestionIndex}
        selectedAnswers={selectedAnswers}
        onQuestionSelect={goToQuestion}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA'
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: palette.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    elevation: 2
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151'
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: spacing.md
  },
  examTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.light.text,
    textAlign: 'center'
  },
  questionCounter: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2
  },
  timerContainer: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8
  },
  timerText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#D97706'
  },
  timerWarning: {
    color: '#DC2626'
  },
  modeContainer: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8
  },
  modeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB'
  },

  // Progress
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: palette.white
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginRight: spacing.sm
  },
  progressBar: {
    height: 8,
    backgroundColor: palette.primary,
    borderRadius: 4
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    minWidth: 35
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: spacing.md
  },
  questionContainer: {
    backgroundColor: palette.white,
    borderRadius: 16,
    padding: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.lg
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.primary,
    marginBottom: spacing.sm
  },
  questionText: {
    fontSize: 18,
    lineHeight: 26,
    color: colors.light.text,
    marginBottom: spacing.lg
  },

  // Options
  optionsContainer: {
    gap: spacing.md
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: palette.white
  },
  selectedOption: {
    borderColor: palette.primary,
    backgroundColor: '#F0F9FF'
  },
  optionIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md
  },
  selectedIndicator: {
    backgroundColor: palette.primary
  },
  optionLetter: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151'
  },
  selectedLetter: {
    color: palette.white
  },
  optionText: {
    fontSize: 16,
    color: colors.light.text,
    flex: 1,
    lineHeight: 22
  },
  selectedOptionText: {
    color: palette.primary,
    fontWeight: '600'
  },

  // Explanation (practice mode)
  explanationContainer: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0'
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#15803D',
    marginBottom: spacing.sm
  },
  explanationText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#166534',
    marginBottom: spacing.sm
  },
  correctAnswerText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#15803D'
  },

  // Navigation
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: palette.white,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: spacing.sm
  },
  navButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center'
  },
  disabledButton: {
    backgroundColor: '#F9FAFB'
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151'
  },
  disabledText: {
    color: '#9CA3AF'
  },
  questionGridButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    alignItems: 'center'
  },
  questionGridText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D97706'
  },
  submitButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 12,
    backgroundColor: palette.primary,
    alignItems: 'center'
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.white
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg
  },
  modalContainer: {
    backgroundColor: palette.white,
    borderRadius: 16,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.light.text,
    textAlign: 'center',
    marginBottom: spacing.md
  },
  modalText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.sm
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center'
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151'
  },
  modalSubmitButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 12,
    backgroundColor: palette.primary,
    alignItems: 'center'
  },
  modalSubmitText: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.white
  },

  // Error
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg
  },
  errorText: {
    fontSize: 18,
    color: colors.light.text,
    textAlign: 'center',
    marginBottom: spacing.lg
  },
  backButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: palette.primary,
    borderRadius: 12
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.white
  }
});

export default StdExamTaking;