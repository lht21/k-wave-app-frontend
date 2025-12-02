import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  ScrollView,
  Dimensions
} from 'react-native';
import { spacing } from '../theme/spacing';
import { colors, palette } from '../theme/colors';
import { typography } from '../theme/typography';

interface QuestionGridModalProps {
  visible: boolean;
  onClose: () => void;
  totalQuestions: number;
  currentQuestionIndex: number;
  selectedAnswers: { [key: number]: number };
  onQuestionSelect: (index: number) => void;
}

const { width } = Dimensions.get('window');
const GRID_COLUMNS = 5;
const BUTTON_SIZE = (width - spacing.xl * 2 - spacing.md * (GRID_COLUMNS - 1)) / GRID_COLUMNS;

const QuestionGridModal: React.FC<QuestionGridModalProps> = ({
  visible,
  onClose,
  totalQuestions,
  currentQuestionIndex,
  selectedAnswers,
  onQuestionSelect
}) => {
  const handleQuestionPress = (index: number) => {
    onQuestionSelect(index);
    onClose();
  };

  const getQuestionStatus = (index: number) => {
    if (index === currentQuestionIndex) return 'current';
    if (selectedAnswers[index] !== undefined) return 'answered';
    return 'unanswered';
  };

  const getQuestionButtonStyle = (status: string) => {
    switch (status) {
      case 'current':
        return [styles.questionButton, styles.currentQuestion];
      case 'answered':
        return [styles.questionButton, styles.answeredQuestion];
      default:
        return [styles.questionButton, styles.unansweredQuestion];
    }
  };

  const getQuestionTextStyle = (status: string) => {
    switch (status) {
      case 'current':
        return [styles.questionNumber, styles.currentQuestionText];
      case 'answered':
        return [styles.questionNumber, styles.answeredQuestionText];
      default:
        return [styles.questionNumber, styles.unansweredQuestionText];
    }
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const completionPercentage = Math.round((answeredCount / totalQuestions) * 100);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Tổng quan câu hỏi</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{answeredCount}</Text>
              <Text style={styles.statLabel}>Đã làm</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{totalQuestions - answeredCount}</Text>
              <Text style={styles.statLabel}>Còn lại</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{completionPercentage}%</Text>
              <Text style={styles.statLabel}>Hoàn thành</Text>
            </View>
          </View>

          {/* Legend */}
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.currentQuestion]} />
              <Text style={styles.legendText}>Đang làm</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.answeredQuestion]} />
              <Text style={styles.legendText}>Đã làm</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.unansweredQuestion]} />
              <Text style={styles.legendText}>Chưa làm</Text>
            </View>
          </View>

          {/* Question Grid */}
          <ScrollView style={styles.gridContainer} showsVerticalScrollIndicator={false}>
            <View style={styles.grid}>
              {Array.from({ length: totalQuestions }, (_, index) => {
                const status = getQuestionStatus(index);
                return (
                  <TouchableOpacity
                    key={index}
                    style={getQuestionButtonStyle(status)}
                    onPress={() => handleQuestionPress(index)}
                  >
                    <Text style={getQuestionTextStyle(status)}>
                      {index + 1}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          {/* Action Button */}
          <TouchableOpacity style={styles.actionButton} onPress={onClose}>
            <Text style={styles.actionButtonText}>Tiếp tục làm bài</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  modalContainer: {
    backgroundColor: palette.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    minHeight: '60%'
  },
  
  // Header
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  modalTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: '700',
    color: colors.light.text
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center'
  },
  closeButtonText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '600'
  },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
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
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500'
  },

  // Legend
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    backgroundColor: '#F9FAFB'
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6
  },
  legendText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500'
  },

  // Grid
  gridContainer: {
    flex: 1,
    paddingHorizontal: spacing.xl
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    paddingVertical: spacing.lg,
    justifyContent: 'space-between'
  },
  questionButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2
  },
  
  // Question States
  currentQuestion: {
    backgroundColor: palette.primary,
    borderColor: palette.primary
  },
  answeredQuestion: {
    backgroundColor: '#10B981',
    borderColor: '#10B981'
  },
  unansweredQuestion: {
    backgroundColor: palette.white,
    borderColor: '#D1D5DB'
  },
  
  // Text States
  questionNumber: {
    fontSize: 16,
    fontWeight: '700'
  },
  currentQuestionText: {
    color: palette.white
  },
  answeredQuestionText: {
    color: palette.white
  },
  unansweredQuestionText: {
    color: '#6B7280'
  },

  // Action Button
  actionButton: {
    margin: spacing.xl,
    paddingVertical: spacing.lg,
    backgroundColor: palette.primary,
    borderRadius: 16,
    alignItems: 'center'
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.white
  }
});

export default QuestionGridModal;