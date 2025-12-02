import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { spacing } from '../../theme/spacing';
import { colors, palette } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { RootStackParamList } from '../../types/navigation';
import lessonApiService from '../../services/lessonApiService';

type StdSkillPracticeNavigationProp = StackNavigationProp<RootStackParamList>;
type StdSkillPracticeRouteProp = RouteProp<RootStackParamList, 'StdSkillPractice'>;

const StdSkillPractice: React.FC = () => {
  const navigation = useNavigation<StdSkillPracticeNavigationProp>();
  const route = useRoute<StdSkillPracticeRouteProp>();
  
  const { skillType, skillTitle, lessonId } = route.params;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [skillData, setSkillData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSkillData();
  }, [lessonId, skillType]);

  const loadSkillData = async () => {
    if (!lessonId) {
      setError('Không tìm thấy bài học');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log('Loading skill data for lesson:', lessonId, 'skill:', skillType);
      const lessonData = await lessonApiService.getLesson(lessonId);
      
      console.log('Lesson data received:', lessonData);
      console.log('Available skills in lesson:', Object.keys(lessonData || {}));
      console.log(`${skillType} data:`, lessonData?.[skillType]);
      
      if (lessonData && lessonData[skillType] && lessonData[skillType].length > 0) {
        setSkillData(lessonData[skillType]);
        console.log(`Loaded ${lessonData[skillType].length} ${skillType} items`);
      } else {
        console.log('No skill data found or empty array, using fallback');
        setSkillData([]);
      }
    } catch (error) {
      console.error('Error loading skill data:', error);
      setError('Không thể tải nội dung bài học');
      setSkillData([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={palette.primary} />
        <Text style={styles.loadingText}>Đang tải nội dung...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadSkillData}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderVocabularyContent = () => {
    if (skillData.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Chưa có từ vựng nào trong bài học này</Text>
        </View>
      );
    }

    const vocab = skillData[currentIndex % skillData.length];
    
    return (
      <View style={styles.contentCard}>
        <View style={styles.vocabularyCard}>
          <Text style={styles.koreanText}>{vocab.koreanWord || vocab.korean}</Text>
          <Text style={styles.pronunciationText}>{vocab.pronunciation || ''}</Text>
          <Text style={styles.vietnameseText}>{vocab.vietnameseMeaning || vocab.vietnamese}</Text>
          {vocab.examples && vocab.examples.length > 0 && (
            <View style={styles.examplesSection}>
              <Text style={styles.examplesTitle}>Ví dụ:</Text>
              {vocab.examples.map((example: string, index: number) => (
                <Text key={index} style={styles.exampleText}>{example}</Text>
              ))}
            </View>
          )}
        </View>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => {
            // TODO: Play pronunciation
            Alert.alert('Phát âm', `Phát âm: ${vocab.pronunciation || 'Chưa có'}`);
          }}
        >
          <Text style={styles.actionButtonText}>🔊 Nghe phát âm</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderGrammarContent = () => {
    if (skillData.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Chưa có ngữ pháp nào trong bài học này</Text>
        </View>
      );
    }

    const grammar = skillData[currentIndex % skillData.length];
    
    return (
      <View style={styles.contentCard}>
        <View style={styles.grammarCard}>
          <Text style={styles.grammarPattern}>{grammar.structure || grammar.pattern}</Text>
          <Text style={styles.grammarMeaning}>{grammar.explanation || grammar.meaning}</Text>
          
          {grammar.exampleSentences && grammar.exampleSentences.length > 0 && (
            <View style={styles.examplesSection}>
              <Text style={styles.examplesTitle}>Ví dụ:</Text>
              {grammar.exampleSentences.map((example: any, index: number) => (
                <View key={index} style={styles.exampleItem}>
                  <Text style={styles.exampleKorean}>{example.korean}</Text>
                  <Text style={styles.exampleVietnamese}>{example.vietnamese}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
        
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>✍️ Làm bài tập</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderQuestionContent = () => {
    // Placeholder for questions - would be loaded from skill data
    const question = {
      question: 'Câu hỏi sẽ được load từ API',
      options: ['Đáp án A', 'Đáp án B', 'Đáp án C', 'Đáp án D'],
      correctAnswer: 0,
      explanation: 'Giải thích sẽ được load từ API'
    };
    
    return (
      <View style={styles.contentCard}>
        <View style={styles.questionCard}>
          <Text style={styles.questionText}>{question.question}</Text>
          
          <View style={styles.optionsContainer}>
            {question.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionButton,
                  selectedAnswer === index && styles.selectedOption,
                  showExplanation && index === question.correctAnswer && styles.correctOption,
                  showExplanation && selectedAnswer === index && index !== question.correctAnswer && styles.wrongOption
                ]}
                onPress={() => setSelectedAnswer(index)}
                disabled={showExplanation}
              >
                <Text style={[
                  styles.optionText,
                  selectedAnswer === index && styles.selectedOptionText,
                  showExplanation && index === question.correctAnswer && styles.correctOptionText
                ]}>
                  {String.fromCharCode(65 + index)}. {option}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {selectedAnswer !== null && !showExplanation && (
            <TouchableOpacity 
              style={styles.submitButton}
              onPress={() => setShowExplanation(true)}
            >
              <Text style={styles.submitButtonText}>Kiểm tra đáp án</Text>
            </TouchableOpacity>
          )}
          
          {showExplanation && question.explanation && (
            <View style={styles.explanationContainer}>
              <Text style={styles.explanationTitle}>Giải thích:</Text>
              <Text style={styles.explanationText}>{question.explanation}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  const renderListeningContent = () => (
    <View style={styles.contentCard}>
      <View style={styles.listeningCard}>
        <Text style={styles.listeningTitle}>Bài nghe 1</Text>
        <View style={styles.audioPlayer}>
          <TouchableOpacity style={styles.playButton}>
            <Text style={styles.playButtonText}>▶️</Text>
          </TouchableOpacity>
          <Text style={styles.audioText}>Nhấn để nghe</Text>
        </View>
        <Text style={styles.listeningInstructions}>
          Nghe và chọn đáp án đúng
        </Text>
      </View>
      {renderQuestionContent()}
    </View>
  );

  const renderSpeakingContent = () => (
    <View style={styles.contentCard}>
      <View style={styles.speakingCard}>
        <Text style={styles.speakingTitle}>Luyện phát âm</Text>
        <View style={styles.recordingSection}>
          <TouchableOpacity style={styles.recordButton}>
            <Text style={styles.recordButtonText}>🎙️</Text>
          </TouchableOpacity>
          <Text style={styles.recordText}>Nhấn để ghi âm</Text>
        </View>
        <Text style={styles.speakingInstructions}>
          Đọc to từ vựng sau: "안녕하세요"
        </Text>
      </View>
    </View>
  );

  const renderReadingContent = () => (
    <View style={styles.contentCard}>
      <View style={styles.readingCard}>
        <Text style={styles.readingTitle}>Bài đọc hiểu</Text>
        <View style={styles.readingPassage}>
          <Text style={styles.passageText}>
            안녕하세요. 제 이름은 김민수입니다. 저는 한국 사람입니다. 
            저는 서울에 살고 있습니다. 저는 학생입니다.
          </Text>
        </View>
        <Text style={styles.readingInstructions}>
          Đọc đoạn văn trên và trả lời câu hỏi
        </Text>
      </View>
      {renderQuestionContent()}
    </View>
  );

  const renderWritingContent = () => (
    <View style={styles.contentCard}>
      <View style={styles.writingCard}>
        <Text style={styles.writingTitle}>Luyện viết</Text>
        <Text style={styles.writingPrompt}>
          Viết một câu giới thiệu bản thân bằng tiếng Hàn
        </Text>
        <View style={styles.writingInput}>
          <Text style={styles.writingPlaceholder}>Nhập câu trả lời của bạn...</Text>
        </View>
        <TouchableOpacity style={styles.submitButton}>
          <Text style={styles.submitButtonText}>Nộp bài</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderContent = () => {
    switch (skillType) {
      case 'vocabulary' as any:
        return renderVocabularyContent();
      case 'grammar' as any:
        return renderGrammarContent();
      case 'listening':
        return renderListeningContent();
      case 'reading':
        return renderReadingContent();
      case 'speaking':
        return renderSpeakingContent();
      case 'writing':
        return renderWritingContent();
      default:
        return renderVocabularyContent();
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{skillTitle}</Text>
        <View style={styles.progressIndicator}>
          <Text style={styles.progressText}>{currentIndex + 1}/{Math.max(skillData.length, 1)}</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderContent()}
        
        {/* Navigation buttons */}
        {skillData.length > 0 && (
          <View style={styles.navigationContainer}>
            <TouchableOpacity 
              style={[styles.navButton, styles.prevButton, currentIndex === 0 && styles.disabledButton]}
              onPress={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0}
            >
              <Text style={[styles.navButtonText, currentIndex === 0 && styles.disabledText]}>← Trước</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.navButton, styles.nextButton, currentIndex >= skillData.length - 1 && styles.disabledButton]}
              onPress={() => setCurrentIndex(Math.min(skillData.length - 1, currentIndex + 1))}
              disabled={currentIndex >= skillData.length - 1}
            >
              <Text style={[styles.navButtonText, styles.nextButtonText, currentIndex >= skillData.length - 1 && styles.disabledText]}>Tiếp →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Bottom spacing */}
        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </View>
  );
};

export default StdSkillPractice;

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
    paddingVertical: spacing.lg,
    paddingTop: spacing.xl,
    backgroundColor: palette.primary,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  backButtonText: {
    fontSize: 20,
    color: palette.white,
    fontWeight: '600'
  },
  headerTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: '700',
    color: palette.white
  },
  progressIndicator: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12
  },
  progressText: {
    fontSize: 12,
    color: palette.white,
    fontWeight: '600'
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: spacing.md
  },
  contentCard: {
    marginTop: spacing.lg,
    marginBottom: spacing.lg
  },

  // Vocabulary
  vocabularyCard: {
    backgroundColor: palette.white,
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: spacing.lg
  },
  koreanText: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.light.text,
    marginBottom: spacing.sm
  },
  pronunciationText: {
    fontSize: 16,
    color: palette.primary,
    marginBottom: spacing.md
  },
  vietnameseText: {
    fontSize: 20,
    color: '#666',
    fontWeight: '600'
  },

  // Grammar
  grammarCard: {
    backgroundColor: palette.white,
    borderRadius: 16,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: spacing.lg
  },
  grammarPattern: {
    fontSize: 24,
    fontWeight: '700',
    color: palette.primary,
    marginBottom: spacing.sm,
    textAlign: 'center'
  },
  grammarMeaning: {
    fontSize: 16,
    color: colors.light.text,
    marginBottom: spacing.sm,
    textAlign: 'center'
  },
  grammarUsage: {
    fontSize: 14,
    color: '#666',
    marginBottom: spacing.lg,
    lineHeight: 20
  },
  examplesSection: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: spacing.md
  },
  examplesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.light.text,
    marginBottom: spacing.sm
  },
  exampleItem: {
    marginBottom: spacing.md
  },
  exampleKorean: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.light.text,
    marginBottom: 2
  },
  exampleVietnamese: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2
  },
  examplePronunciation: {
    fontSize: 12,
    color: palette.primary,
    fontStyle: 'italic'
  },

  // Question
  questionCard: {
    backgroundColor: palette.white,
    borderRadius: 16,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.light.text,
    marginBottom: spacing.lg,
    lineHeight: 24
  },
  optionsContainer: {
    marginBottom: spacing.lg
  },
  optionButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent'
  },
  selectedOption: {
    borderColor: palette.primary,
    backgroundColor: '#E3F2FD'
  },
  correctOption: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E8'
  },
  wrongOption: {
    borderColor: '#F44336',
    backgroundColor: '#FFEBEE'
  },
  optionText: {
    fontSize: 16,
    color: colors.light.text
  },
  selectedOptionText: {
    fontWeight: '600'
  },
  correctOptionText: {
    color: '#4CAF50',
    fontWeight: '600'
  },
  explanationContainer: {
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    padding: spacing.md,
    marginTop: spacing.md
  },
  explanationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: spacing.xs
  },
  explanationText: {
    fontSize: 14,
    color: '#2E7D32',
    lineHeight: 20
  },

  // Listening
  listeningCard: {
    backgroundColor: palette.white,
    borderRadius: 16,
    padding: spacing.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: spacing.lg
  },
  listeningTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.light.text,
    marginBottom: spacing.lg
  },
  audioPlayer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: palette.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md
  },
  playButtonText: {
    fontSize: 24,
    color: palette.white
  },
  audioText: {
    fontSize: 16,
    color: '#666'
  },
  listeningInstructions: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center'
  },

  // Speaking
  speakingCard: {
    backgroundColor: palette.white,
    borderRadius: 16,
    padding: spacing.lg,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4
  },
  speakingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.light.text,
    marginBottom: spacing.lg
  },
  recordingSection: {
    alignItems: 'center',
    marginBottom: spacing.lg
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF5722',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md
  },
  recordButtonText: {
    fontSize: 32
  },
  recordText: {
    fontSize: 16,
    color: '#666'
  },
  speakingInstructions: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center'
  },

  // Reading
  readingCard: {
    backgroundColor: palette.white,
    borderRadius: 16,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: spacing.lg
  },
  readingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.light.text,
    marginBottom: spacing.lg
  },
  readingPassage: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md
  },
  passageText: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.light.text
  },
  readingInstructions: {
    fontSize: 14,
    color: '#666'
  },

  // Writing
  writingCard: {
    backgroundColor: palette.white,
    borderRadius: 16,
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4
  },
  writingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.light.text,
    marginBottom: spacing.lg
  },
  writingPrompt: {
    fontSize: 16,
    color: '#666',
    marginBottom: spacing.lg,
    lineHeight: 20
  },
  writingInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: spacing.md,
    minHeight: 80,
    marginBottom: spacing.lg
  },
  writingPlaceholder: {
    fontSize: 16,
    color: '#999'
  },

  // Action Buttons
  actionButton: {
    backgroundColor: palette.primary,
    borderRadius: 12,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center'
  },
  actionButtonText: {
    fontSize: 16,
    color: palette.white,
    fontWeight: '600'
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: 'center'
  },
  submitButtonText: {
    fontSize: 16,
    color: palette.white,
    fontWeight: '600'
  },

  // Navigation
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg
  },
  navButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center'
  },
  prevButton: {
    backgroundColor: '#E0E0E0',
    marginRight: spacing.sm
  },
  nextButton: {
    backgroundColor: palette.primary,
    marginLeft: spacing.sm
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666'
  },
  nextButtonText: {
    color: palette.white
  },

  // Loading and Error States
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: '#666'
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: spacing.lg
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    marginBottom: spacing.lg
  },
  retryButton: {
    backgroundColor: palette.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8
  },
  retryButtonText: {
    color: palette.white,
    fontWeight: '600'
  },
  emptyContainer: {
    backgroundColor: palette.white,
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: 'center',
    marginTop: spacing.lg
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center'
  },
  exampleText: {
    fontSize: 14,
    color: '#666',
    marginBottom: spacing.xs
  },
  disabledButton: {
    opacity: 0.5
  },
  disabledText: {
    color: '#999'
  }
});