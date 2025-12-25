import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Headphones,
  BookOpen,
  Pencil,
  Clock,
  ListBullets,
} from 'phosphor-react-native';
import { examService, Exam } from '../../../services/examService';

const { width } = Dimensions.get('window');

const COLORS = {
  primaryGreen: '#00C853',
  textDark: '#1A1A1A',
  textGray: '#666666',
  cardBg: '#F0F2F5',
  iconBgGreen: '#E0F2E9',
  iconGreen: '#00C853',
  white: '#FFFFFF',
  listeningBg: '#E3F2FD',
  listeningIcon: '#2196F3',
  readingBg: '#FFF3E0',
  readingIcon: '#FF9800',
  writingBg: '#F3E5F5',
  writingIcon: '#9C27B0',
};

type SectionType = 'listening' | 'reading' | 'writing';

interface SkillSection {
  type: SectionType;
  name: string;
  icon: any;
  bgColor: string;
  iconColor: string;
  questionCount: number;
  duration: number; // Duration in minutes for this skill
  available: boolean;
}

export default function ExamDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const examId = params.examId as string;
  const isTrialMode = params.isTrialMode === 'true'; // Check if in trial mode
  
  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState<Exam | null>(null);

  useEffect(() => {
    loadExamDetail();
  }, [examId]);

  const loadExamDetail = async () => {
    try {
      setLoading(true);
      const data = await examService.getExamById(examId);
      setExam(data);
    } catch (error) {
      console.error('Error loading exam detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartSection = (sectionType: SectionType, duration: number) => {
    if (!exam) return;
    
    // Navigate to practice screen with specific section
    const practiceParams: any = { 
      examId: exam._id, 
      examTitle: exam.title,
      sectionType: sectionType,
    };
    
    // Add duration or trial mode flag
    if (isTrialMode) {
      practiceParams.isTrialMode = 'true';
    } else {
      practiceParams.sectionDuration = duration.toString();
    }
    
    router.push({
      pathname: '/(student)/exam/practice',
      params: practiceParams
    });
  };

  const getSkillSections = (): SkillSection[] => {
    if (!exam) return [];

    const isTopik1 = exam.examType === 'topik1';
    const isTopik2 = exam.examType === 'topik2';

    const allSections: SkillSection[] = [
      {
        type: 'listening',
        name: 'Nghe',
        icon: Headphones,
        bgColor: COLORS.listeningBg,
        iconColor: COLORS.listeningIcon,
        questionCount: exam.questions.listening?.length || 0,
        duration: isTopik1 ? 40 : 60, // TOPIK 1: 40 phút, TOPIK 2: 60 phút
        available: (exam.questions.listening?.length || 0) > 0,
      },
      {
        type: 'reading',
        name: 'Đọc',
        icon: BookOpen,
        bgColor: COLORS.readingBg,
        iconColor: COLORS.readingIcon,
        questionCount: exam.questions.reading?.length || 0,
        duration: isTopik1 ? 60 : 70, // TOPIK 1: 60 phút, TOPIK 2: 70 phút
        available: (exam.questions.reading?.length || 0) > 0,
      },
    ];

    // TOPIK 2 có thêm kỹ năng Viết
    if (isTopik2) {
      allSections.push({
        type: 'writing',
        name: 'Viết',
        icon: Pencil,
        bgColor: COLORS.writingBg,
        iconColor: COLORS.writingIcon,
        questionCount: exam.questions.writing?.length || 0,
        duration: 50, // TOPIK 2: 50 phút
        available: (exam.questions.writing?.length || 0) > 0,
      });
    }

    return allSections;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primaryGreen} />
        <Text style={styles.loadingText}>Đang tải chi tiết đề thi...</Text>
      </View>
    );
  }

  if (!exam) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Không tìm thấy đề thi</Text>
      </View>
    );
  }

  const skillSections = getSkillSections();

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={COLORS.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isTrialMode ? 'Chi tiết đề thi thử' : 'Chi tiết đề thi'}</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Exam Info Card */}
          <View style={styles.examInfoCard}>
            <Text style={styles.examTitle}>{exam.title}</Text>
            
            <View style={styles.examMetaRow}>
              <View style={styles.metaItem}>
                <Clock size={18} color={COLORS.textGray} />
                <Text style={styles.metaText}>{exam.duration} phút</Text>
              </View>
              <View style={styles.metaItem}>
                <ListBullets size={18} color={COLORS.textGray} />
                <Text style={styles.metaText}>{exam.totalQuestions} câu hỏi</Text>
              </View>
            </View>

            {exam.isPremium && (
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumBadgeText}>⭐ Premium</Text>
              </View>
            )}
          </View>

          {/* Skills Section */}
          <View style={styles.skillsSection}>
            <Text style={styles.sectionTitle}>Chọn kỹ năng để thi</Text>
            <Text style={styles.sectionSubtitle}>
              Bạn có thể thi từng kỹ năng riêng biệt
            </Text>

            <View style={styles.skillsList}>
              {skillSections.map((skill) => (
                <TouchableOpacity
                  key={skill.type}
                  style={[
                    styles.skillCard,
                    !skill.available && styles.skillCardDisabled
                  ]}
                  onPress={() => skill.available && handleStartSection(skill.type, skill.duration)}
                  disabled={!skill.available}
                  activeOpacity={0.7}
                >
                  <View style={[styles.skillIconContainer, { backgroundColor: skill.bgColor }]}>
                    <skill.icon size={28} color={skill.iconColor} weight="regular" />
                  </View>
                  
                  <View style={styles.skillInfo}>
                    <Text style={styles.skillName}>{skill.name}</Text>
                    <Text style={styles.skillMeta}>
                      {skill.questionCount} câu hỏi{isTrialMode ? ' • ⚡ Không giới hạn' : ` • ${skill.duration} phút`}
                    </Text>
                  </View>

                  {skill.available ? (
                    <View style={styles.startButton}>
                      <Text style={styles.startButtonText}>Bắt đầu</Text>
                    </View>
                  ) : (
                    <View style={styles.unavailableBadge}>
                      <Text style={styles.unavailableText}>Chưa có</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Start All Button */}
          <TouchableOpacity 
            style={styles.startAllButton}
            onPress={() => {
              const allParams: any = { 
                examId: exam._id, 
                examTitle: exam.title,
              };
              if (isTrialMode) {
                allParams.isTrialMode = 'true';
              }
              router.push({
                pathname: '/(student)/exam/practice',
                params: allParams
              });
            }}
          >
            <Text style={styles.startAllButtonText}>
              {isTrialMode ? 'Thi thử tất cả kỹ năng' : 'Thi tất cả kỹ năng'}
            </Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textGray,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.textGray,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  examInfoCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  examTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 8,
  },
  examDescription: {
    fontSize: 14,
    color: COLORS.textGray,
    lineHeight: 20,
    marginBottom: 16,
  },
  examMetaRow: {
    flexDirection: 'row',
    gap: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 14,
    color: COLORS.textGray,
    fontWeight: '600',
  },
  premiumBadge: {
    marginTop: 12,
    alignSelf: 'flex-start',
    backgroundColor: COLORS.iconBgGreen,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  premiumBadgeText: {
    fontSize: 12,
    color: COLORS.primaryGreen,
    fontWeight: '700',
  },
  skillsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.textGray,
    marginBottom: 16,
  },
  skillsList: {
    gap: 12,
  },
  skillCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#F0F0F0',
  },
  skillCardDisabled: {
    opacity: 0.5,
  },
  skillIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  skillInfo: {
    flex: 1,
  },
  skillName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  skillMeta: {
    fontSize: 13,
    color: COLORS.textGray,
  },
  startButton: {
    backgroundColor: COLORS.primaryGreen,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  startButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
  unavailableBadge: {
    backgroundColor: COLORS.cardBg,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  unavailableText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textGray,
  },
  startAllButton: {
    backgroundColor: COLORS.primaryGreen,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  startAllButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
});
