import * as React from 'react';
import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { spacing } from '../../theme/spacing';
import { colors, palette } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { RootStackParamList } from '../../types/navigation';
import { mockExamTypes, mockExamSets } from '../../data/mockExamData';
import { ExamType, ExamSet } from '../../types/exam';
import ExamModeComparison from '../../components/ExamModeComparison';

type StdPracticeExamNavigationProp = StackNavigationProp<RootStackParamList>;

const StdPracticeExam: React.FC = () => {
  const navigation = useNavigation<StdPracticeExamNavigationProp>();
  const [selectedExamType, setSelectedExamType] = useState<ExamType | null>(null);

  // Filter exam sets for practice mode
  const filteredExamSets = selectedExamType 
    ? mockExamSets.filter(set => set.examTypeId === selectedExamType.id)
    : [];

  const handleStartPracticeExam = (examSet: ExamSet) => {
    navigation.navigate('StdExamTaking', {
      examId: examSet.id,
      examType: 'practice',
      examTitle: `${selectedExamType?.title} - ${examSet.title} (Thi thử)`,
      questions: []
    });
  };

  const ExamTypeCard = ({ examType }: { examType: ExamType }) => (
    <TouchableOpacity
      style={[
        styles.examTypeCard,
        selectedExamType?.id === examType.id && styles.selectedExamType
      ]}
      onPress={() => setSelectedExamType(examType)}
    >
      <View style={[styles.examTypeIconContainer, { backgroundColor: examType.color }]}>
        <Text style={styles.examTypeIcon}>{examType.icon}</Text>
      </View>
      <Text style={[
        styles.examTypeTitle,
        selectedExamType?.id === examType.id && styles.selectedExamTypeText
      ]}>
        {examType.title}
      </Text>
      <Text style={styles.examTypeDescription}>
        {examType.description}
      </Text>
    </TouchableOpacity>
  );

  const PracticeExamCard = ({ examSet }: { examSet: ExamSet }) => (
    <TouchableOpacity 
      style={[styles.examSetCard, examSet.isLocked && styles.lockedExamSet]}
      onPress={() => !examSet.isLocked && handleStartPracticeExam(examSet)}
      disabled={examSet.isLocked}
    >
      <View style={styles.examSetHeader}>
        <Text style={[styles.examSetTitle, examSet.isLocked && styles.lockedText]}>
          {examSet.title}
        </Text>
        {examSet.isPremium && (
          <View style={styles.premiumBadge}>
            <Text style={styles.premiumText}>PREMIUM</Text>
          </View>
        )}
        {examSet.isLocked && (
          <Text style={styles.lockIcon}>🔒</Text>
        )}
      </View>

      <View style={styles.examSetInfo}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Số câu hỏi:</Text>
          <Text style={styles.infoValue}>{examSet.questionCount} câu</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Độ khó:</Text>
          <Text style={[styles.infoValue, styles.difficultyText, 
            examSet.difficulty === 'easy' ? styles.easyDifficulty :
            examSet.difficulty === 'medium' ? styles.mediumDifficulty : styles.hardDifficulty
          ]}>
            {examSet.difficulty === 'easy' ? 'Dễ' : 
             examSet.difficulty === 'medium' ? 'Trung bình' : 'Khó'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Chế độ:</Text>
          <Text style={styles.practiceMode}>Không giới hạn thời gian</Text>
        </View>
      </View>

      <View style={styles.practiceButton}>
        <Text style={styles.practiceButtonText}>
          🎯 Bắt đầu thi thử
        </Text>
      </View>
    </TouchableOpacity>
  );

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
        <Text style={styles.headerTitle}>Thi thử</Text>
        <View style={styles.practiceIndicator}>
          <Text style={styles.practiceIndicatorText}>🎯</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Exam Types */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chọn loại bài thi</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.examTypesContainer}
          >
            {mockExamTypes.map((examType) => (
              <ExamTypeCard key={examType.id} examType={examType} />
            ))}
          </ScrollView>
        </View>

        {/* Exam Sets */}
        {selectedExamType && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Đề thi {selectedExamType.title} - Chế độ thi thử
            </Text>
            <Text style={styles.sectionSubtitle}>
              Làm bài không giới hạn thời gian, xem giải thích ngay khi chọn đáp án
            </Text>

            <View style={styles.examSetsContainer}>
              {filteredExamSets.map((examSet) => (
                <PracticeExamCard key={examSet.id} examSet={examSet} />
              ))}
            </View>
          </View>
        )}

        {/* Practice Mode Features */}
        <View style={styles.featuresSection}>
          <Text style={styles.featuresSectionTitle}>🎯 Tính năng thi thử</Text>
          <View style={styles.featuresList}>
            <Text style={styles.featureItem}>
              • Không giới hạn thời gian làm bài
            </Text>
            <Text style={styles.featureItem}>
              • Xem giải thích chi tiết ngay khi chọn đáp án
            </Text>
            <Text style={styles.featureItem}>
              • Có thể quay lại xem lại các câu đã làm
            </Text>
            <Text style={styles.featureItem}>
              • Phù hợp để học và nắm chắc kiến thức
            </Text>
            <Text style={styles.featureItem}>
              • Không áp lực thời gian, tập trung vào việc học
            </Text>
          </View>
        </View>

        {/* Exam Mode Comparison */}
        <ExamModeComparison />

        {/* Premium Banner */}
        <View style={styles.premiumBanner}>
          <Text style={styles.bannerTitle}>📝 Nâng cấp Premium</Text>
          <Text style={styles.bannerSubtitle}>
            Mở khóa kho đề thi thử không giới hạn và chấm điểm tự động
          </Text>
          <TouchableOpacity style={styles.upgradeButton}>
            <Text style={styles.upgradeButtonText}>Nâng cấp ngay</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom spacing */}
        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </View>
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
    paddingVertical: spacing.lg,
    paddingTop: spacing.xl,
    backgroundColor: '#269a56ff', // Green for consistency with app theme
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
  practiceIndicator: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  practiceIndicatorText: {
    fontSize: 20
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: spacing.md
  },
  section: {
    marginTop: spacing.lg,
    marginBottom: spacing.lg
  },
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: '700',
    color: colors.light.text,
    marginBottom: spacing.xs
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#4CAF50',
    marginBottom: spacing.md,
    fontWeight: '600'
  },

  // Exam Types
  examTypesContainer: {
    marginTop: spacing.md
  },
  examTypeCard: {
    backgroundColor: palette.white,
    borderRadius: 16,
    padding: spacing.md,
    marginRight: spacing.md,
    width: 140,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3
  },
  selectedExamType: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E8'
  },
  examTypeIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm
  },
  examTypeIcon: {
    fontSize: 24,
    color: palette.white
  },
  examTypeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.light.text,
    marginBottom: spacing.xs,
    textAlign: 'center'
  },
  selectedExamTypeText: {
    color: '#269a56ff',
  },
  examTypeDescription: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    lineHeight: 14
  },

  // Exam Sets
  examSetsContainer: {
    gap: spacing.md
  },
  examSetCard: {
    backgroundColor: palette.white,
    borderRadius: 16,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3
  },
  lockedExamSet: {
    backgroundColor: '#F5F5F5',
    opacity: 0.7
  },
  examSetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md
  },
  examSetTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: '700',
    color: colors.light.text,
    flex: 1
  },
  lockedText: {
    color: '#999'
  },
  premiumBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: spacing.sm
  },
  premiumText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FF6B00'
  },
  lockIcon: {
    fontSize: 20,
    marginLeft: spacing.sm
  },

  // Exam Set Info
  examSetInfo: {
    marginBottom: spacing.md
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs
  },
  infoLabel: {
    fontSize: 14,
    color: '#666'
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.light.text
  },
  difficultyText: {
    fontWeight: '700'
  },
  easyDifficulty: {
    color: '#269a56ff',
  },
  mediumDifficulty: {
    color: '#FF9800'
  },
  hardDifficulty: {
    color: '#F44336'
  },
  practiceMode: {
    fontSize: 14,
    fontWeight: '600',
    color: '#269a56ff'
  },

  // Practice Button
  practiceButton: {
    backgroundColor: '#E8F5E8',
    borderWidth: 2,
    borderColor: '#269a56ff',
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: 'center'
  },
  practiceButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#269a56ff'
  },

  // Features Section
  featuresSection: {
    backgroundColor: '#E8F5E8',
    borderRadius: 16,
    padding: spacing.lg,
    marginTop: spacing.lg
  },
  featuresSectionTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: spacing.md
  },
  featuresList: {
    gap: spacing.sm
  },
  featureItem: {
    fontSize: 14,
    color: '#2E7D32',
    lineHeight: 20
  },

  // Premium Banner
  premiumBanner: {
    backgroundColor: '#FF6B35',
    borderRadius: 16,
    padding: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.lg
  },
  bannerTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: '700',
    color: palette.white,
    marginBottom: spacing.sm
  },
  bannerSubtitle: {
    fontSize: 14,
    color: palette.white,
    textAlign: 'center',
    marginBottom: spacing.md
  },
  upgradeButton: {
    backgroundColor: palette.white,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 20
  },
  upgradeButtonText: {
    color: '#FF6B35',
    fontWeight: '700',
    fontSize: 14
  }
});

export default StdPracticeExam;