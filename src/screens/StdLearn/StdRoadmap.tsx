import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { spacing } from '../../theme/spacing';
import { colors, palette } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { RootStackParamList } from '../../types/navigation';

type StdRoadmapNavigationProp = StackNavigationProp<RootStackParamList>;

const StdRoadmap: React.FC = () => {
  const navigation = useNavigation<StdRoadmapNavigationProp>();

  // Learning path data
  const learningPath = [
    {
      id: '692ead3558ea326e3da336f9',
      title: 'Bảng chữ cái',
      subtitle: '한글',
      level: 'Sơ cấp 1',
      color: '#FFD700',
      textColor: '#000',
      completed: false,
      locked: false
    },
    {
      id: '692ead3558ea326e3da336fa',
      title: 'Giới thiệu',
      subtitle: '소개',
      level: 'Sơ cấp 2',
      color: '#FFD700',
      textColor: '#000',
      completed: false,
      locked: false
    },
    {
      id: '692ead3558ea326e3da336fb',
      title: 'Trường học',
      subtitle: '학교',
      level: 'Trung cấp 3',
      color: '#E8E8E8',
      textColor: '#999',
      completed: false,
      locked: true
    },
    {
      id: '692ead3558ea326e3da336fc',
      title: 'Sinh hoạt hàng ngày',
      subtitle: '일상생활',
      level: 'Trung cấp 4',
      color: '#E8E8E8',
      textColor: '#999',
      completed: false,
      locked: true
    },
    {
      id: '692ead3558ea326e3da336fd',
      title: 'Ngày và thứ',
      subtitle: '날짜와 요일',
      level: 'Cao cấp 5',
      color: '#E8E8E8',
      textColor: '#999',
      completed: false,
      locked: true
    },
    {
      id: '692ead3558ea326e3da336fe',
      title: 'Công việc trong ngày',
      subtitle: '하루 일과',
      level: 'Cao cấp 6',
      color: '#E8E8E8',
      textColor: '#999',
      completed: false,
      locked: true
    }
  ];

  const levelCategories = [
    { id: 'beginner1', title: 'Sơ cấp 1', color: palette.primary, active: true },
    { id: 'beginner2', title: 'Sơ cấp 2', color: palette.primary, active: false },
    { id: 'intermediate3', title: 'Trung cấp 3', color: palette.gray500, active: false },
    { id: 'intermediate4', title: 'Trung cấp 4', color: palette.gray500, active: false },
    { id: 'advanced5', title: 'Cao cấp 5', color: palette.gray500, active: false },
    { id: 'advanced6', title: 'Cao cấp 6', color: palette.gray500, active: false }
  ];

  const handleLessonPress = (item: any) => {
    if (!item.locked) {
      navigation.navigate('StdLesson', {
        lessonId: item.id,
        lessonTitle: item.title
      });
    }
  };

  const LearningPathItem = ({ item, index }: { item: any; index: number }) => (
    <View style={styles.pathItemContainer}>
      {/* Path line connector */}
      {index < learningPath.length - 1 && (
        <View style={styles.pathLine} />
      )}
      
      <TouchableOpacity 
        style={[
          styles.pathItem,
          { backgroundColor: item.color }
        ]}
        disabled={item.locked}
        onPress={() => handleLessonPress(item)}
      >
        <View style={styles.pathContent}>
          <Text style={[styles.pathIndex, { color: item.textColor }]}>
            {index + 1}
          </Text>
          <View style={styles.pathTextContainer}>
            <Text style={[styles.pathTitle, { color: item.textColor }]}>
              {item.title}
            </Text>
            <Text style={[styles.pathSubtitle, { color: item.textColor, opacity: 0.8 }]}>
              {item.subtitle}
            </Text>
          </View>
          {item.locked && (
            <View style={styles.lockIcon}>
              <Text style={styles.lockText}>🔒</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );

  const LevelTab = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[
        styles.levelTab,
        { backgroundColor: item.color },
        item.active && styles.activeLevelTab
      ]}
    >
      <Text style={[styles.levelText, { color: palette.white }]}>
        {item.title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lộ trình</Text>
        <TouchableOpacity style={styles.infoButton}>
          <Text style={styles.infoButtonText}>ℹ️</Text>
        </TouchableOpacity>
      </View>

      {/* Level Categories */}
      <View style={styles.levelTabs}>
        {levelCategories.map((level) => (
          <LevelTab key={level.id} item={level} />
        ))}
      </View>

      {/* Learning Path */}
      <View style={styles.pathContainer}>
        {learningPath.map((item, index) => (
          <LearningPathItem key={item.id} item={item} index={index} />
        ))}
      </View>

      {/* Premium Banner */}
      <View style={styles.premiumBanner}>
        <View style={styles.premiumContent}>
          <Text style={styles.premiumText}>
            Nhận gói Premium để mở khóa tất cả nội dung và tính năng.{'\n'}
            Mua một lần và sử dụng mãi
          </Text>
          <TouchableOpacity style={styles.premiumButton}>
            <Text style={styles.premiumButtonText}>Đăng giảm giá!</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Complete Learning Text */}
      <View style={styles.completeSection}>
        <Text style={styles.completeText}>Hoàn thành lộ trình học</Text>
      </View>

      {/* Bottom padding */}
      <View style={{ height: spacing.xxxl }} />
    </ScrollView>
  );
};

export default StdRoadmap;

const styles = StyleSheet.create({
  screen: { 
    backgroundColor: '#F0F4F8',
    flex: 1
  },
  container: { 
    flexGrow: 1,
    paddingHorizontal: spacing.md
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.lg,
    paddingTop: spacing.xl,
    backgroundColor: palette.primary,
    marginHorizontal: -spacing.md,
    paddingHorizontal: spacing.md,
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

  // Level Tabs
  levelTabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    marginBottom: spacing.xl
  },
  levelTab: {
    width: '32%',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: 8,
    marginBottom: spacing.sm,
    alignItems: 'center'
  },
  activeLevelTab: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  levelText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center'
  },

  // Learning Path
  pathContainer: {
    flex: 1,
    paddingHorizontal: spacing.sm
  },
  pathItemContainer: {
    position: 'relative',
    marginBottom: spacing.lg,
    alignItems: 'center'
  },
  pathLine: {
    position: 'absolute',
    top: 80,
    width: 3,
    height: 60,
    backgroundColor: '#D1D5DB',
    zIndex: 0
  },
  pathItem: {
    width: '85%',
    borderRadius: 16,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 1
  },
  pathContent: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  pathIndex: {
    fontSize: 24,
    fontWeight: '700',
    marginRight: spacing.md,
    minWidth: 30
  },
  pathTextContainer: {
    flex: 1
  },
  pathTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2
  },
  pathSubtitle: {
    fontSize: 14,
    fontWeight: '500'
  },
  lockIcon: {
    marginLeft: spacing.sm
  },
  lockText: {
    fontSize: 18
  },

  // Premium Banner
  premiumBanner: {
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    padding: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.lg
  },
  premiumContent: {
    alignItems: 'center'
  },
  premiumText: {
    color: palette.white,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.md
  },
  premiumButton: {
    backgroundColor: palette.white,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 20
  },
  premiumButtonText: {
    color: '#FF6B35',
    fontSize: 14,
    fontWeight: '700'
  },

  // Complete Section
  completeSection: {
    alignItems: 'center',
    marginTop: spacing.lg
  },
  completeText: {
    fontSize: 14,
    color: colors.light.textSecondary,
    fontWeight: '500'
  }
});