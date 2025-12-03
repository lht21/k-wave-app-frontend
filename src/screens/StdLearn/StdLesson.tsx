import * as React from 'react';
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { spacing } from '../../theme/spacing';
import { colors, palette } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { RootStackParamList } from '../../types/navigation';
import LessonApiService from '../../services/lessonApiService';

type StdLessonNavigationProp = StackNavigationProp<RootStackParamList>;
type StdLessonRouteProp = RouteProp<RootStackParamList, 'StdLesson'>;

interface LessonItem {
  _id: string;
  title: string;
  level: string;
  description: string;
  order: number;
  estimatedDuration: number;
  isPremium: boolean;
  viewCount: number;
  completionCount: number;
  author: {
    fullName: string;
  };
}

// Mock skills data based on lesson content
const mockSkillsForLessons = [
  {
    id: 'vocabulary',
    name: 'Từ vựng',
    icon: '📚',
    color: '#3B82F6',
    progress: 75,
    isUnlocked: true
  },
  {
    id: 'grammar',
    name: 'Ngữ pháp',
    icon: '📝',
    color: '#10B981',
    progress: 60,
    isUnlocked: true
  },
  {
    id: 'listening',
    name: 'Nghe',
    icon: '🎧',
    color: '#F59E0B',
    progress: 45,
    isUnlocked: true
  },
  {
    id: 'speaking',
    name: 'Nói',
    icon: '🗣️',
    color: '#EF4444',
    progress: 30,
    isUnlocked: false
  },
  {
    id: 'reading',
    name: 'Đọc',
    icon: '📖',
    color: '#8B5CF6',
    progress: 0,
    isUnlocked: false
  },
  {
    id: 'writing',
    name: 'Viết',
    icon: '✏️',
    color: '#F97316',
    progress: 0,
    isUnlocked: false
  }
];

const { width } = Dimensions.get('window');

const StdLesson: React.FC = () => {
  const navigation = useNavigation<StdLessonNavigationProp>();
  const route = useRoute<StdLessonRouteProp>();
  
  const { lessonId, lessonTitle } = route.params;
  const [lesson, setLesson] = useState<LessonItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [skills] = useState(mockSkillsForLessons);

  // Debug logging
  console.log('StdLesson route params:', { lessonId, lessonTitle });

  useEffect(() => {
    loadLessonData();
  }, [lessonId]);

  const loadLessonData = async () => {
    try {
      setLoading(true);
      
      // Validate lessonId (MongoDB ObjectID should be 24 hex characters)
      if (!lessonId || lessonId.length !== 24 || lessonId === 'undefined' || lessonId === 'null') {
        console.log('Invalid lessonId provided:', lessonId, 'using fallback data');
        setLesson({
          _id: 'fallback',
          title: lessonTitle || 'Bài học mẫu',
          level: 'Sơ cấp 1',
          description: 'Bài học tiếng Hàn cơ bản với các kỹ năng nghe, nói, đọc, viết',
          order: 1,
          estimatedDuration: 45,
          isPremium: false,
          viewCount: 0,
          completionCount: 0,
          author: {
            fullName: 'Giáo viên K-Wave'
          }
        });
        return;
      }

      console.log('Fetching lesson with valid ID:', lessonId);
      const lessonData = await LessonApiService.getLesson(lessonId);
      setLesson(lessonData);
    } catch (error) {
      console.error('Error loading lesson:', error);
      
      // Use fallback data instead of showing error
      console.log('Using fallback data due to error');
      setLesson({
        _id: 'fallback',
        title: lessonTitle || 'Bài học mẫu',
        level: 'Sơ cấp 1', 
        description: 'Bài học tiếng Hàn cơ bản với các kỹ năng nghe, nói, đọc, viết',
        order: 1,
        estimatedDuration: 45,
        isPremium: false,
        viewCount: 0,
        completionCount: 0,
        author: {
          fullName: 'Giáo viên K-Wave'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSkillPress = (skill: any) => {
    if (skill.isUnlocked) {
      navigation.navigate('StdSkillPractice', {
        skillType: skill.id as any,
        skillTitle: skill.name,
        lessonId: lessonId || 'fallback'
      });
    }
  };

  const SkillCard = ({ skill }: { skill: any }) => (
    <TouchableOpacity
      style={[
        styles.skillCard,
        { backgroundColor: skill.isUnlocked ? skill.color : '#E0E0E0' },
        !skill.isUnlocked && styles.lockedSkill
      ]}
      onPress={() => handleSkillPress(skill)}
      disabled={!skill.isUnlocked}
    >
      <View style={styles.skillHeader}>
        <Text style={[styles.skillIcon, { opacity: skill.isUnlocked ? 1 : 0.5 }]}>
          {skill.isUnlocked ? skill.icon : '🔒'}
        </Text>
        {skill.progress > 0 && (
          <View style={styles.progressBadge}>
            <Text style={styles.progressText}>{skill.progress}%</Text>
          </View>
        )}
      </View>
      
      <Text style={[
        styles.skillTitle, 
        { color: skill.isUnlocked ? palette.white : '#999' }
      ]}>
        {skill.name}
      </Text>
      
      {skill.isUnlocked && (
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBG}>
            <View 
              style={[
                styles.progressBarFill,
                { width: `${skill.progress}%` }
              ]} 
            />
          </View>
        </View>
      )}
      
      {!skill.isUnlocked && (
        <Text style={styles.lockedText}>Hoàn thành bài trước</Text>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Đang tải...</Text>
          <View style={styles.infoButton} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={palette.primary} />
          <Text style={styles.loadingText}>Đang tải bài học...</Text>
        </View>
      </View>
    );
  }

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
        <Text style={styles.headerTitle}>{lesson?.title || lessonTitle}</Text>
        <TouchableOpacity style={styles.infoButton}>
          <Text style={styles.infoButtonText}>ℹ️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Lesson Info */}
        {lesson && (
          <View style={styles.lessonInfo}>
            <Text style={styles.lessonLevel}>{lesson.level}</Text>
            <Text style={styles.lessonDescription}>{lesson.description}</Text>
            <View style={styles.lessonStats}>
              <View style={styles.statItem}>
                <Text style={styles.statIcon}>⏱️</Text>
                <Text style={styles.statText}>{lesson.estimatedDuration} phút</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statIcon}>👥</Text>
                <Text style={styles.statText}>{lesson.viewCount} lượt xem</Text>
              </View>
              {lesson.isPremium && (
                <View style={styles.premiumBadge}>
                  <Text style={styles.premiumText}>Premium</Text>
                </View>
              )}
            </View>
          </View>
        )}
        {/* Skills Section */}
        <View style={styles.skillsSection}>
          <Text style={styles.sectionTitle}>Kỹ năng học tập</Text>
          <Text style={styles.sectionSubtitle}>
            Chọn kỹ năng bạn muốn luyện tập
          </Text>
          
          <View style={styles.skillsGrid}>
            {skills.map((skill) => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </View>
        </View>

        {/* Progress Summary */}
        <View style={styles.progressSummary}>
          <Text style={styles.summaryTitle}>Tiến độ học tập</Text>
          <View style={styles.summaryStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>Kỹ năng mở khóa</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>55%</Text>
              <Text style={styles.statLabel}>Hoàn thành trung bình</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>24h</Text>
              <Text style={styles.statLabel}>Thời gian học</Text>
            </View>
          </View>
        </View>

        {/* Achievement Section */}
        <View style={styles.achievementSection}>
          <Text style={styles.sectionTitle}>Thành tích</Text>
          <View style={styles.achievementList}>
            <View style={styles.achievementItem}>
              <Text style={styles.achievementIcon}>🏆</Text>
              <View style={styles.achievementContent}>
                <Text style={styles.achievementTitle}>Bậc thầy từ vựng</Text>
                <Text style={styles.achievementDesc}>Hoàn thành 50 từ vựng</Text>
              </View>
            </View>
            <View style={styles.achievementItem}>
              <Text style={styles.achievementIcon}>⭐</Text>
              <View style={styles.achievementContent}>
                <Text style={styles.achievementTitle}>Học giỏi ngữ pháp</Text>
                <Text style={styles.achievementDesc}>Đạt 90% bài tập ngữ pháp</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </View>
  );
};

export default StdLesson;

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
  infoButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  infoButtonText: {
    fontSize: 16,
    color: palette.white
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: spacing.md
  },

  // Skills Section
  skillsSection: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl
  },
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: '700',
    color: colors.light.text,
    marginBottom: spacing.xs
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: spacing.lg
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  skillCard: {
    width: (width - spacing.md * 3) / 2,
    aspectRatio: 1,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6
  },
  lockedSkill: {
    backgroundColor: '#E0E0E0'
  },
  skillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  skillIcon: {
    fontSize: 36
  },
  progressBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 12,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: palette.white
  },
  skillTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: spacing.sm
  },
  progressBarContainer: {
    marginTop: spacing.xs
  },
  progressBarBG: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: palette.white,
    borderRadius: 3
  },
  lockedText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    marginTop: spacing.xs
  },

  // Progress Summary
  progressSummary: {
    backgroundColor: palette.white,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3
  },
  summaryTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: '700',
    color: colors.light.text,
    marginBottom: spacing.md,
    textAlign: 'center'
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  statItem: {
    alignItems: 'center'
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: palette.primary,
    marginBottom: spacing.xs
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center'
  },

  // Achievement Section
  achievementSection: {
    marginBottom: spacing.lg
  },
  achievementList: {
    marginTop: spacing.md
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2
  },
  achievementIcon: {
    fontSize: 32,
    marginRight: spacing.md
  },
  achievementContent: {
    flex: 1
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.light.text,
    marginBottom: 2
  },
  achievementDesc: {
    fontSize: 12,
    color: '#666'
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxxl
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: spacing.sm
  },

  // Lesson Info
  lessonInfo: {
    backgroundColor: palette.white,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.lg,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3
  },
  lessonLevel: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.primary,
    marginBottom: spacing.xs
  },
  lessonDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: spacing.md
  },
  lessonStats: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.md
  },
  statIcon: {
    fontSize: 16,
    marginRight: spacing.xs
  },
  statText: {
    fontSize: 14,
    color: '#666'
  },
  premiumBadge: {
    backgroundColor: '#FCD34D',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12
  },
  premiumText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E'
  }
});
