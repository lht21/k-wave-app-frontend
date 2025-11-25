import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  Add01Icon,
  Delete02Icon,
  ViewIcon,
  StarIcon,
  Clock01Icon,
  Note01Icon,
  HeadphonesIcon,
  BookOpen01Icon,
  PencilIcon,
  Sorting05Icon,
  Mortarboard02Icon,
} from '@hugeicons/core-free-icons';

import Button from '../../../components/Button/Button';
import { colors, palette } from '../../../theme/colors';
import { typography } from '../../../theme/typography';

// --- TYPES ---
type ExamType = 'TOPIK I' | 'TOPIK II' | 'ESP';

interface Exam {
  id: number;
  name: string;
  isPremium: boolean;
  listening: number;
  reading: number;
  writing: number;
  duration: number;
}

// --- MOCK DATA ---
const initialExams: Record<ExamType, Exam[]> = {
  'TOPIK I': [
    { id: 1, name: '제1회 한국어능력시험', isPremium: false, listening: 30, reading: 40, writing: 0, duration: 100 },
    { id: 2, name: '제2회 한국어능력시험', isPremium: false, listening: 30, reading: 40, writing: 0, duration: 100 },
    { id: 3, name: '제3회 한국어능력시험', isPremium: true, listening: 30, reading: 40, writing: 0, duration: 100 },
  ],
  'TOPIK II': [
    { id: 10, name: '제1회 한국어능력시험', isPremium: false, listening: 50, reading: 50, writing: 4, duration: 180 },
    { id: 11, name: '제2회 한국어능력시험', isPremium: false, listening: 50, reading: 50, writing: 4, duration: 180 },
  ],
  'ESP': [
    { id: 19, name: '제1회 한국어 ESP 시험', isPremium: false, listening: 25, reading: 25, writing: 2, duration: 90 },
  ]
};

type TeacherStackParamList = {
  TeacherMain: undefined;
  LessonDetail: { lessonId: number };
  ExamDetail: { examId: number };
};

const TeacherExamsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<TeacherStackParamList>>();
  const [selectedType, setSelectedType] = useState<ExamType>('TOPIK I');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [examData, setExamData] = useState(initialExams);

  const examTypes: { id: ExamType; label: string }[] = [
    { id: 'TOPIK I', label: 'TOPIK I' },
    { id: 'TOPIK II', label: 'TOPIK II' },
    { id: 'ESP', label: 'ESP' }
  ];

  // --- LOGIC HANDLERS ---

  const getExamTypeName = (type: ExamType) => {
    const names = {
      'TOPIK I': '한국어능력시험',
      'TOPIK II': '한국어능력시험',
      'ESP': '한국어 ESP 시험'
    };
    return names[type];
  };

  const findMissingExamNumber = (currentExams: Exam[]) => {
    if (currentExams.length === 0) return 1;
    const existingNumbers = currentExams.map(exam => {
      const match = exam.name.match(/제(\d+)회/);
      return match ? parseInt(match[1]) : 0;
    }).filter(num => num > 0);
    
    if (existingNumbers.length === 0) return 1;
    existingNumbers.sort((a, b) => a - b);
    
    for (let i = 1; i <= existingNumbers[existingNumbers.length - 1]; i++) {
      if (!existingNumbers.includes(i)) return i;
    }
    return existingNumbers[existingNumbers.length - 1] + 1;
  };

  const handleQuickCreate = () => {
    const currentExams = examData[selectedType];
    const nextNumber = findMissingExamNumber(currentExams);
    
    const defaultValues = {
      'TOPIK I': { listening: 30, reading: 40, writing: 0, duration: 100 },
      'TOPIK II': { listening: 50, reading: 50, writing: 4, duration: 180 },
      'ESP': { listening: 25, reading: 25, writing: 2, duration: 90 },
    };

    const newExam: Exam = {
      id: Date.now(),
      name: `제${nextNumber}회 ${getExamTypeName(selectedType)}`,
      isPremium: false,
      ...defaultValues[selectedType]
    };

    setExamData(prev => ({
      ...prev,
      [selectedType]: [newExam, ...prev[selectedType]]
    }));

    Alert.alert('Thành công', `Đã tạo đề số ${nextNumber} cho ${selectedType}`);
  };

  const handleDeleteExam = (examId: number) => {
    Alert.alert('Xác nhận', 'Bạn có chắc chắn muốn xóa đề thi này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: () => {
          setExamData(prev => ({
            ...prev,
            [selectedType]: prev[selectedType].filter(exam => exam.id !== examId)
          }));
        }
      }
    ]);
  };

  const handleTogglePremium = (examId: number, currentPremiumStatus: boolean) => {
    const action = currentPremiumStatus ? 'bỏ đánh dấu Premium' : 'đánh dấu làm Premium';
    
    Alert.alert(
      'Xác nhận',
      `Bạn có muốn ${action} cho đề thi này?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: () => {
            setExamData(prev => ({
              ...prev,
              [selectedType]: prev[selectedType].map(exam => 
                exam.id === examId ? { ...exam, isPremium: !exam.isPremium } : exam
              )
            }));
            
            // Hiển thị thông báo thành công
            Alert.alert(
              'Thành công',
              `Đã ${action} thành công!`,
              [{ text: 'OK' }]
            );
          }
        }
      ]
    );
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const handleViewDetail = (examId: number) => {
    navigation.navigate('ExamDetail', { examId });
  };

  // --- RENDER HELPERS ---

  const sortedExams = [...(examData[selectedType] || [])].sort((a, b) => {
    const getNum = (name: string) => {
      const match = name.match(/제(\d+)회/);
      return match ? parseInt(match[1]) : 0;
    };
    return sortOrder === 'asc' ? getNum(a.name) - getNum(b.name) : getNum(b.name) - getNum(a.name);
  });

  const renderExamCard = ({ item }: { item: Exam }) => (
    <View style={styles.card}>
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <View style={styles.titleContainer}>
          <HugeiconsIcon icon={Mortarboard02Icon} size={20} color={colors.light.primary} />
          <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
        </View>
        <TouchableOpacity 
          onPress={() => handleTogglePremium(item.id, item.isPremium)}
          style={styles.starButton}
        >
          <HugeiconsIcon 
            icon={StarIcon} 
            size={20} 
            color={item.isPremium ? palette.warning : colors.light.gray500} 
            variant={item.isPremium ? 'solid' : 'stroke'}
            fill={item.isPremium ? palette.warning : 'none'}
          />
        </TouchableOpacity>
      </View>

      {/* Exam Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <HugeiconsIcon icon={HeadphonesIcon} size={14} color={colors.light.textSecondary} />
          <Text style={styles.statText}>{item.listening}</Text>
        </View>
        <View style={styles.statItem}>
          <HugeiconsIcon icon={BookOpen01Icon} size={14} color={colors.light.textSecondary} />
          <Text style={styles.statText}>{item.reading}</Text>
        </View>
        {item.writing > 0 && (
          <View style={styles.statItem}>
            <HugeiconsIcon icon={PencilIcon} size={14} color={colors.light.textSecondary} />
            <Text style={styles.statText}>{item.writing}</Text>
          </View>
        )}
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <HugeiconsIcon icon={Note01Icon} size={14} color={colors.light.textSecondary} />
          <Text style={styles.statText}>{item.listening + item.reading + item.writing} câu</Text>
        </View>
      </View>

      {/* Footer Info & Actions */}
      <View style={styles.cardFooter}>
        <View style={styles.footerLeft}>
          <View style={styles.durationBadge}>
            <HugeiconsIcon icon={Clock01Icon} size={12} color={colors.light.textSecondary} />
            <Text style={styles.durationText}>{item.duration} phút</Text>
          </View>
          {item.isPremium && (
            <View style={styles.premiumBadge}>
              <HugeiconsIcon icon={StarIcon} size={10} color={palette.warning} variant="solid" />
              <Text style={styles.premiumText}>Premium</Text>
            </View>
          )}
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.iconBtn} 
            onPress={() => handleViewDetail(item.id)}
          >
            <HugeiconsIcon icon={ViewIcon} size={18} color={palette.info} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconBtn} 
            onPress={() => handleDeleteExam(item.id)}
          >
            <HugeiconsIcon icon={Delete02Icon} size={18} color={palette.error} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quản lý Đề Thi</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.sortBtn} onPress={toggleSortOrder}>
            <HugeiconsIcon icon={Sorting05Icon} size={20} color={colors.light.text} />
            <Text style={styles.sortBtnText}>
              {sortOrder === 'asc' ? 'Cũ nhất' : 'Mới nhất'}
            </Text>
          </TouchableOpacity>
          <Button 
            title="Tạo mới" 
            size="small" 
            variant="primary" 
            onPress={handleQuickCreate}
            leftIcon={<HugeiconsIcon icon={Add01Icon} size={16} color="white" />}
          />
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {examTypes.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.tabBtn,
              selectedType === type.id && styles.activeTabBtn
            ]}
            onPress={() => setSelectedType(type.id)}
          >
            <Text style={[
              styles.tabText,
              selectedType === type.id && styles.activeTabText
            ]}>
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <View style={styles.content}>
        <View style={styles.listHeader}>
          <Text style={styles.listInfoText}>
            Hiển thị {sortedExams.length} đề • {sortOrder === 'asc' ? 'Cũ nhất trước' : 'Mới nhất trước'}
          </Text>
        </View>

        <FlatList
          data={sortedExams}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderExamCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <HugeiconsIcon icon={Mortarboard02Icon} size={48} color={colors.light.border} />
              <Text style={styles.emptyText}>Chưa có đề thi nào</Text>
              <Button 
                title="Tạo đề đầu tiên" 
                variant="secondary" 
                onPress={handleQuickCreate} 
                style={{marginTop: 12}} 
              />
            </View>
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
    marginTop: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  headerTitle: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fonts.bold,
    color: colors.light.text,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 8,
    borderRadius: 8,
    backgroundColor: colors.light.card,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  sortBtnText: {
    fontSize: typography.fontSizes.xs,
    color: colors.light.text,
    fontFamily: typography.fonts.regular,
  },
  
  // Tabs
  tabContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: colors.light.card,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  activeTabBtn: {
    backgroundColor: colors.light.primary + '15',
    borderColor: colors.light.primary,
  },
  tabText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fonts.regular,
    color: colors.light.textSecondary,
  },
  activeTabText: {
    color: colors.light.primary,
    fontFamily: typography.fonts.bold,
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listHeader: {
    marginBottom: 12,
  },
  listInfoText: {
    fontSize: typography.fontSizes.xs,
    color: colors.light.textSecondary,
  },
  listContent: {
    paddingBottom: 20,
    gap: 16,
  },

  // Card
  card: {
    backgroundColor: colors.light.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.light.border,
    shadowColor: colors.light.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  cardTitle: {
    fontSize: typography.fontSizes.md,
    fontFamily: typography.fonts.semiBold,
    color: colors.light.text,
    flex: 1,
  },
  starButton: {
    padding: 4,
  },
  
  // Stats
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.light.background,
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: typography.fontSizes.xs,
    color: colors.light.textSecondary,
    fontFamily: typography.fonts.regular,
  },
  statDivider: {
    width: 1,
    height: 12,
    backgroundColor: colors.light.border,
  },

  // Footer
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.light.border + '50',
    paddingTop: 12,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.light.border + '40',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  durationText: {
    fontSize: 10,
    color: colors.light.textSecondary,
    fontFamily: typography.fonts.regular,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: palette.warning + '20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  premiumText: {
    fontSize: 10,
    color: palette.warning,
    fontFamily: typography.fonts.bold,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: colors.light.background,
    borderWidth: 1,
    borderColor: colors.light.border,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: typography.fontSizes.sm,
    color: colors.light.textSecondary,
  },
});

export default TeacherExamsScreen;