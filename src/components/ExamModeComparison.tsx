import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { spacing } from '../theme/spacing';
import { colors, palette } from '../theme/colors';
import { typography } from '../theme/typography';

const ExamModeComparison: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>So sánh chế độ thi</Text>
      
      <View style={styles.comparisonContainer}>
        {/* Practice Mode */}
        <View style={styles.modeCard}>
          <View style={styles.modeHeader}>
            <Text style={styles.modeIcon}>🎯</Text>
            <Text style={styles.modeTitle}>Thi thử</Text>
          </View>
          
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Text style={styles.checkIcon}>✅</Text>
              <Text style={styles.featureText}>Không giới hạn thời gian</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.checkIcon}>✅</Text>
              <Text style={styles.featureText}>Xem giải thích ngay</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.checkIcon}>✅</Text>
              <Text style={styles.featureText}>Có thể quay lại</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.checkIcon}>✅</Text>
              <Text style={styles.featureText}>Phù hợp học tập</Text>
            </View>
          </View>
          
          <Text style={styles.modeDescription}>
            Dành cho việc học và luyện tập kiến thức
          </Text>
        </View>

        {/* Real Mode */}
        <View style={styles.modeCard}>
          <View style={styles.modeHeader}>
            <Text style={styles.modeIcon}>⏰</Text>
            <Text style={styles.modeTitle}>Thi thật</Text>
          </View>
          
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Text style={styles.timeIcon}>⏱️</Text>
              <Text style={styles.featureText}>Có giới hạn thời gian</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.strictIcon}>🚫</Text>
              <Text style={styles.featureText}>Không xem giải thích</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.autoIcon}>🔄</Text>
              <Text style={styles.featureText}>Tự động nộp bài</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.realIcon}>🎯</Text>
              <Text style={styles.featureText}>Giống thi thực tế</Text>
            </View>
          </View>
          
          <Text style={styles.modeDescription}>
            Dành cho đánh giá năng lực thật sự
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    backgroundColor: palette.white,
    borderRadius: 16,
    margin: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4
  },
  
  title: {
    fontSize: typography.fontSizes.lg,
    fontWeight: '700',
    color: colors.light.text,
    textAlign: 'center',
    marginBottom: spacing.lg
  },
  
  comparisonContainer: {
    flexDirection: 'row',
    gap: spacing.md
  },
  
  modeCard: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  
  modeHeader: {
    alignItems: 'center',
    marginBottom: spacing.md
  },
  
  modeIcon: {
    fontSize: 32,
    marginBottom: spacing.xs
  },
  
  modeTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.light.text
  },
  
  featuresList: {
    gap: spacing.sm,
    marginBottom: spacing.md
  },
  
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs
  },
  
  checkIcon: {
    fontSize: 14,
    color: '#4CAF50'
  },
  
  timeIcon: {
    fontSize: 14
  },
  
  strictIcon: {
    fontSize: 14,
    color: '#FF5722'
  },
  
  autoIcon: {
    fontSize: 14,
    color: '#FF9800'
  },
  
  realIcon: {
    fontSize: 14,
    color: '#2196F3'
  },
  
  featureText: {
    fontSize: 13,
    color: colors.light.text,
    flex: 1,
    lineHeight: 18
  },
  
  modeDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 16
  }
});

export default ExamModeComparison;