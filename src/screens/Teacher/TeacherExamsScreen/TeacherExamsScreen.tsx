import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
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
import { useExam } from '../../../hooks/useExam';
import { Exam, ExamType, examService } from '../../../services/examService';

type TeacherStackParamList = {
  TeacherMain: undefined;
  LessonDetail: { lessonId: string };
  ExamDetail: { examId: string };
};

const examTypes: { id: ExamType; label: string }[] = [
  { id: 'topik1', label: 'TOPIK I' },
  { id: 'topik2', label: 'TOPIK II' },
  { id: 'esp', label: 'ESP' },
];

const TeacherExamsScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<TeacherStackParamList>>();
  const [selectedType, setSelectedType] = useState<ExamType>('topik1');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [exams, setExams] = useState<Exam[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const { loading, fetchExams, createDefaultExam, deleteExam, togglePremium } = useExam();

  // Load exams khi màn hình được focus
  useFocusEffect(
    React.useCallback(() => {
      loadExams();
    }, [selectedType])
  );

  const loadExams = async (showLoader: boolean = true) => {
    try {
      setRefreshing(showLoader);
      const data = await fetchExams(selectedType);
      setExams(data);
    } catch (error) {
      console.error('Error loading exams:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // --- LOGIC HANDLERS ---
// screens/TeacherExamsScreen.tsx
const handleQuickCreate = async () => {
  try {
    const nextExamNumber = examService.findNextExamNumber(exams);

    // Sử dụng phương thức service đã sửa
    const newExamData = examService.createDefaultExam(selectedType, nextExamNumber);

    console.log('🔄 Đang tạo đề thi với dữ liệu:', newExamData); // Thêm dòng này để debug
    
    const newExam = await examService.createExam(newExamData);

    setExams(prev => [newExam, ...prev]);
  } catch (error: any) {
    Alert.alert('Lỗi', error.message || 'Tạo đề thất bại');
    console.error('Tạo đề thất bại:', error);
  }
};
  const handleDeleteExam = async (examId: string) => {
    Alert.alert('Xác nhận', 'Bạn có chắc chắn muốn xóa đề thi này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteExam(examId);
            setExams(prev => prev.filter(exam => exam._id !== examId));
          } catch (error) {}
        },
      },
    ]);
  };

  const handleTogglePremium = async (examId: string, currentPremiumStatus: boolean) => {
    const action = currentPremiumStatus ? 'bỏ đánh dấu Premium' : 'đánh dấu làm Premium';

    Alert.alert('Xác nhận', `Bạn có muốn ${action} cho đề thi này?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xác nhận',
        onPress: async () => {
          try {
            const updatedExam = await togglePremium(examId);
            setExams(prev => prev.map(exam => (exam._id === examId ? updatedExam : exam)));
          } catch (error) {}
        },
      },
    ]);
  };

  const handleViewDetail = (examId: string) => {
    navigation.navigate('ExamDetail', { examId });
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
  };

  // --- RENDER HELPERS ---
  const sortedExams = [...exams].sort((a, b) => {
    const getNum = (title: string) => {
      const match = title.match(/제(\d+)회/);
      return match ? parseInt(match[1]) : 0;
    };
    const aNum = getNum(a.title);
    const bNum = getNum(b.title);

    if (sortOrder === 'asc') {
      return aNum - bNum;
    } else {
      if (aNum === 0 || bNum === 0) {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return bNum - aNum;
    }
  });

  const renderExamCard = ({ item }: { item: Exam }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.titleContainer}>
          <HugeiconsIcon icon={Mortarboard02Icon} size={20} color={colors.light.primary} />
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.title}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => handleTogglePremium(item._id, item.isPremium)}
          style={styles.starButton}
          disabled={loading}
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
          <Text style={styles.statText}>{item.totalQuestions} câu</Text>
        </View>
      </View>

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
          <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</Text>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => handleViewDetail(item._id)}>
            <HugeiconsIcon icon={ViewIcon} size={18} color={palette.info} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => handleDeleteExam(item._id)}
            disabled={loading}
          >
            <HugeiconsIcon icon={Delete02Icon} size={18} color={palette.error} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (refreshing && exams.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.light.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quản lý Đề Thi</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.sortBtn} onPress={toggleSortOrder} disabled={loading}>
            <HugeiconsIcon icon={Sorting05Icon} size={20} color={colors.light.text} />
            <Text style={styles.sortBtnText}>{sortOrder === 'asc' ? 'Cũ nhất' : 'Mới nhất'}</Text>
          </TouchableOpacity>
          <Button
            title="Tạo mới"
            size="small"
            variant="primary"
            onPress={handleQuickCreate}
            leftIcon={<HugeiconsIcon icon={Add01Icon} size={16} color="white" />}
            disabled={loading}
          />
        </View>
      </View>

      <View style={styles.tabContainer}>
        {examTypes.map(type => (
          <TouchableOpacity
            key={type.id}
            style={[styles.tabBtn, selectedType === type.id && styles.activeTabBtn]}
            onPress={() => setSelectedType(type.id)}
            disabled={loading}
          >
            <Text style={[styles.tabText, selectedType === type.id && styles.activeTabText]}>
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.content}>
        <View style={styles.listHeader}>
          <Text style={styles.listInfoText}>
            Hiển thị {sortedExams.length} đề • {sortOrder === 'asc' ? 'Cũ nhất trước' : 'Mới nhất trước'}
          </Text>
        </View>

        <FlatList
          data={sortedExams}
          keyExtractor={item => item._id}
          renderItem={renderExamCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadExams(true)}
              colors={[colors.light.primary]}
              tintColor={colors.light.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <HugeiconsIcon icon={Mortarboard02Icon} size={48} color={colors.light.border} />
              <Text style={styles.emptyText}>Chưa có đề thi nào</Text>
              <Button
                title="Tạo đề đầu tiên"
                variant="secondary"
                onPress={handleQuickCreate}
                style={{ marginTop: 12 }}
                disabled={loading}
              />
            </View>
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.light.background, marginTop: 40 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.light.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.light.background, borderBottomWidth: 1, borderBottomColor: colors.light.border },
  headerTitle: { fontSize: typography.fontSizes.lg, fontFamily: typography.fonts.bold, color: colors.light.text },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sortBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 8, borderRadius: 8, backgroundColor: colors.light.card, borderWidth: 1, borderColor: colors.light.border },
  sortBtnText: { fontSize: typography.fontSizes.xs, color: colors.light.text, fontFamily: typography.fonts.regular },
  tabContainer: { flexDirection: 'row', padding: 16, gap: 12 },
  tabBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 20, backgroundColor: colors.light.card, borderWidth: 1, borderColor: colors.light.border },
  activeTabBtn: { backgroundColor: colors.light.primary + '15', borderColor: colors.light.primary },
  tabText: { fontSize: typography.fontSizes.sm, fontFamily: typography.fonts.regular, color: colors.light.textSecondary },
  activeTabText: { color: colors.light.primary, fontFamily: typography.fonts.bold },
  content: { flex: 1, paddingHorizontal: 16 },
  listHeader: { marginBottom: 12 },
  listInfoText: { fontSize: typography.fontSizes.xs, color: colors.light.textSecondary },
  listContent: { paddingBottom: 20, gap: 16 },
  card: { backgroundColor: colors.light.card, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.light.border, shadowColor: colors.light.black, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  titleContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  cardTitle: { fontSize: typography.fontSizes.md, fontFamily: typography.fonts.semiBold, color: colors.light.text, flex: 1 },
  starButton: { padding: 4 },
  statsContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.light.background, padding: 8, borderRadius: 8, marginBottom: 12, gap: 12 },
  statItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { fontSize: typography.fontSizes.xs, color: colors.light.textSecondary, fontFamily: typography.fonts.regular },
  statDivider: { width: 1, height: 12, backgroundColor: colors.light.border },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.light.border + '50', paddingTop: 12 },
  footerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  durationBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.light.border + '40', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  durationText: { fontSize: 10, color: colors.light.textSecondary, fontFamily: typography.fonts.regular },
  premiumBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: palette.warning + '20', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  premiumText: { fontSize: 10, color: palette.warning, fontFamily: typography.fonts.bold },
  dateText: { fontSize: 10, color: colors.light.textSecondary, fontFamily: typography.fonts.regular, marginLeft: 4 },
  actionButtons: { flexDirection: 'row', gap: 8 },
  iconBtn: { padding: 6, borderRadius: 6, backgroundColor: colors.light.background, borderWidth: 1, borderColor: colors.light.border },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  emptyText: { marginTop: 12, fontSize: typography.fontSizes.sm, color: colors.light.textSecondary },
});

export default TeacherExamsScreen;
