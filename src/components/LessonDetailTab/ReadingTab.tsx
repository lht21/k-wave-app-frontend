import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  Add01Icon,
  Edit01Icon,
  Delete02Icon,
  Search01Icon,
  File01Icon,
  HelpCircleIcon,
  InformationCircleIcon,
  LicenseDraftIcon,
  TranslateIcon,
} from '@hugeicons/core-free-icons';

import Button from '../../components/Button/Button';
import ModalReading from '../Modal/ModalReading';
import { colors, palette } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { readingService, Reading, Question } from '../../services/readingService';

interface ReadingTabProps {
  lessonId: string;
}

const ReadingTab: React.FC<ReadingTabProps> = ({ lessonId }) => {
  // State management
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReading, setEditingReading] = useState<Reading | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Load readings từ API
const loadReadings = useCallback(async (isRefresh = false) => {
  try {
    isRefresh ? setRefreshing(true) : setLoading(true);
    const currentPage = isRefresh ? 1 : page;

    let readingsData: Reading[] = [];
    let total = 1;

    if (lessonId) {
      // ✅ Trường hợp lấy theo bài học
      const response = await readingService.getReadingsByLesson(lessonId);
      // Backend trả về { success: true, readings: [...] }
      readingsData = Array.isArray(response?.readings) ? response.readings : [];
      total = 1; // Không phân trang
    } else {
      // ✅ Trường hợp lấy danh sách tổng
      const response = await readingService.getReadings({
        search: searchTerm,
        page: currentPage,
        limit: 10,
      });
      readingsData = Array.isArray(response?.readings) ? response.readings : [];
      total = response?.totalPages ?? 1;
    }

    if (isRefresh || lessonId) {
      // Nếu là theo bài học thì thay thế hoàn toàn, không cộng dồn (prev => [...prev])
      setReadings(readingsData);
      if (isRefresh) setPage(1);
    } else {
      setReadings(prev => [...prev, ...readingsData]);
    }

    setTotalPages(total);
    setHasMore(lessonId ? false : currentPage < total); // Theo bài học thì không có "Load more"
  } catch (error) {
    console.error('Error loading readings:', error);
    Alert.alert('Lỗi', 'Không thể tải danh sách bài đọc');
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
}, [lessonId, searchTerm, page]);
  // Load more data
  const handleLoadMore = () => {
    if (hasMore && !loading) {
      setPage(prev => prev + 1);
    }
  };

  // Refresh data
  const handleRefresh = () => {
    loadReadings(true);
  };

  // Search với debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      loadReadings(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, loadReadings]);

  // Load data khi component mount
  useEffect(() => {
    loadReadings();
  }, [page]);

  // CRUD Operations
  const handleAddReading = () => {
    setEditingReading(null);
    setIsAdding(true);
    setIsModalOpen(true);
  };

  const handleEditReading = (reading: Reading) => {
    setEditingReading(reading);
    setIsAdding(false);
    setIsModalOpen(true);
  };

  const handleDeleteReading = async (readingId: string) => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa bài đọc này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await readingService.deleteReading(readingId);
              Alert.alert('Thành công', 'Đã xóa bài đọc');
              loadReadings(true); // Refresh data
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa bài đọc');
            }
          },
        },
      ]
    );
  };

// Trong ReadingTab component
// ReadingTab.tsx - Sửa handleSaveReading
const handleSaveReading = async (readingData: Reading) => {
  try {
    // Chuẩn bị data - bỏ tất cả _id trong questions
    const readingForAPI = {
      ...readingData,
    questions: Array.isArray(readingData.questions)
      ? readingData.questions.map(q => ({
          question: q.question,
          options: q.options,
          answer: q.answer,
          explanation: q.explanation || '',
        }))
      : [],
    };

    if (isAdding) {
      if (lessonId) {
        // Tạo mới với lessonId
        await readingService.createReadingForLesson(lessonId, readingForAPI);
        Alert.alert('Thành công', 'Đã tạo bài đọc mới');
      } else {
        // Tạo mới không có lesson
        const { lesson, ...dataWithoutLesson } = readingForAPI;
        await readingService.createReading(dataWithoutLesson);
        Alert.alert('Thành công', 'Đã tạo bài đọc mới');
      }
    } else {
      // Cập nhật bài đọc
      if (readingData._id) {
        await readingService.updateReading(readingData._id, readingForAPI);
        Alert.alert('Thành công', 'Đã cập nhật bài đọc');
      } else {
        throw new Error('Không tìm thấy ID bài đọc');
      }
    }
    
    setIsModalOpen(false);
    loadReadings(true);
    
  } catch (error: any) {
    console.error('Error saving reading:', error);
    Alert.alert('Lỗi', error.message || 'Không thể lưu bài đọc');
  }
};

// Render Reading Card
  const renderReadingCard = (reading: Reading) => (
    <View key={reading._id} style={styles.card}>
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {reading.title}
          </Text>
          <View style={styles.levelRow}>
            {reading.level && (
              <View style={styles.levelBadge}>
                <Text style={styles.levelText}>{reading.level}</Text>
              </View>
            )}
            {reading.difficulty && (
              <View style={styles.difficultyBadge}>
                <Text style={styles.difficultyText}>{reading.difficulty}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => handleEditReading(reading)}
          >
            <HugeiconsIcon icon={Edit01Icon} size={18} color={palette.warning} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => reading._id && handleDeleteReading(reading._id)}
          >
            <HugeiconsIcon icon={Delete02Icon} size={18} color={palette.error} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Lesson Info */}
      {reading.lesson && (
        <View style={styles.lessonInfo}>
          <Text style={styles.lessonText}>
              Bài học: {typeof reading.lesson === 'object' ? reading.lesson.title : reading.lesson}
          </Text>
        </View>
      )}

      {/* Meta Info */}
      <View style={styles.metaInfo}>
        <View style={styles.metaItem}>
          <HugeiconsIcon icon={File01Icon} size={14} color={colors.light.textSecondary} />
          <Text style={styles.metaText}>Bài đọc</Text>
        </View>
        <View style={styles.metaItem}>
          <HugeiconsIcon icon={HelpCircleIcon} size={14} color={colors.light.textSecondary} />
          <Text style={styles.metaText}>{reading.questions?.length || 0} câu hỏi</Text>
        </View>
        {reading.viewCount !== undefined && (
          <View style={styles.metaItem}>
            <HugeiconsIcon icon={InformationCircleIcon} size={14} color={colors.light.textSecondary} />
            <Text style={styles.metaText}>{reading.viewCount} lượt xem</Text>
          </View>
        )}
      </View>

      {/* Content Preview */}
      <View style={styles.contentSection}>
        <View style={styles.textContainer}>
          <View style={styles.textHeader}>
            <HugeiconsIcon icon={LicenseDraftIcon} size={14} color={colors.light.text} />
            <Text style={styles.sectionHeaderTitle}>Nội dung:</Text>
          </View>
          <Text style={styles.contentText} numberOfLines={3}>
            {reading.content}
          </Text>
        </View>

        {reading.translation && (
          <View style={[styles.textContainer, { backgroundColor: colors.light.primary + '05' }]}>
            <View style={styles.textHeader}>
              <HugeiconsIcon icon={TranslateIcon} size={14} color={colors.light.primary} />
              <Text style={[styles.sectionHeaderTitle, { color: colors.light.primary }]}>Dịch:</Text>
            </View>
            <Text style={styles.translationText} numberOfLines={2}>
              {reading.translation}
            </Text>
          </View>
        )}
      </View>

      {/* Questions Preview */}
      {reading.questions && reading.questions.length > 0 && (
        <View style={styles.questionsSection}>
          <View style={styles.questionSectionHeader}>
            <Text style={styles.questionSectionTitle}>
              Câu hỏi ({reading.questions.length})
            </Text>
          </View>
          {reading.questions.slice(0, 2).map((q, i) => (
            <View key={q._id || i} style={styles.questionItem}>
              <Text style={styles.questionText} numberOfLines={1}>
                {i + 1}. {q.question}
              </Text>
            </View>
          ))}
          {reading.questions.length > 2 && (
            <Text style={styles.moreQuestionsText}>
              ...và {reading.questions.length - 2} câu hỏi khác
            </Text>
          )}
        </View>
      )}

      {/* Tags */}
      {reading.tags && reading.tags.length > 0 && (
        <View style={styles.tagsContainer}>
          {reading.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  // Loading state
  if (loading && readings.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.light.primary} />
        <Text style={styles.loadingText}>Đang tải bài đọc...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header với search */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <HugeiconsIcon icon={Search01Icon} size={20} color={colors.light.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm bài đọc..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholderTextColor={colors.light.textSecondary}
          />
          {searchTerm ? (
            <TouchableOpacity onPress={() => setSearchTerm('')}>
              <HugeiconsIcon icon={Delete02Icon} size={16} color={colors.light.textSecondary} />
            </TouchableOpacity>
          ) : null}
        </View>

        <Button
          title="Thêm mới"
          variant="primary"
          size="small"
          onPress={handleAddReading}
          leftIcon={<HugeiconsIcon icon={Add01Icon} size={16} color={colors.light.background} />}
        />
      </View>

      {/* Result count */}
      <View style={styles.resultCount}>
        <Text style={styles.resultCountText}>
          {lessonId ? `Bài đọc trong bài học (${readings.length})` : `Tổng ${readings.length} bài đọc`}
        </Text>
        {searchTerm ? (
          <Text style={styles.searchResultText}>
            Kết quả tìm kiếm: "{searchTerm}"
          </Text>
        ) : null}
      </View>

      {/* Reading List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const paddingToBottom = 20;
          if (
            layoutMeasurement.height + contentOffset.y >=
            contentSize.height - paddingToBottom
          ) {
            handleLoadMore();
          }
        }}
        scrollEventThrottle={400}
      >
        {readings.length > 0 ? (
          <>
            {readings.map(renderReadingCard)}
            {hasMore && (
              <View style={styles.loadMoreContainer}>
                <ActivityIndicator size="small" color={colors.light.primary} />
                <Text style={styles.loadMoreText}>Đang tải thêm...</Text>
              </View>
            )}
          </>
        ) : (
          <View style={styles.emptyState}>
            <HugeiconsIcon icon={File01Icon} size={64} color={colors.light.border} />
            <Text style={styles.emptyStateTitle}>
              {searchTerm ? 'Không tìm thấy bài đọc' : 'Chưa có bài đọc nào'}
            </Text>
            <Text style={styles.emptyStateSubtitle}>
              {searchTerm
                ? 'Thử tìm kiếm với từ khóa khác'
                : lessonId
                ? 'Bấm "Thêm mới" để tạo bài đọc đầu tiên'
                : 'Không có bài đọc nào trong hệ thống'}
            </Text>
            {!searchTerm && (
              <Button
                title="Tạo bài đọc đầu tiên"
                variant="primary"
                onPress={handleAddReading}
                style={styles.emptyStateButton}
              />
            )}
          </View>
        )}
      </ScrollView>

      {/* Reading Modal */}
      <ModalReading
        isVisible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        reading={editingReading}
        onSave={handleSaveReading}
        isAdding={isAdding}
        lessonId={lessonId}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: typography.fontSizes.sm,
    color: colors.light.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.light.card,
    borderWidth: 1,
    borderColor: colors.light.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSizes.sm,
    color: colors.light.text,
    fontFamily: typography.fonts.regular,
    padding: 0,
  },
  resultCount: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  resultCountText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fonts.semiBold,
    color: colors.light.text,
  },
  searchResultText: {
    fontSize: typography.fontSizes.xs,
    color: colors.light.textSecondary,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
    paddingTop: 0,
  },
  card: {
    backgroundColor: colors.light.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.light.border,
    shadowColor: colors.light.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flex: 1,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: typography.fontSizes.md,
    fontFamily: typography.fonts.bold,
    color: colors.light.text,
    marginBottom: 8,
  },
  levelRow: {
    flexDirection: 'row',
    gap: 8,
  },
  levelBadge: {
    backgroundColor: colors.light.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  levelText: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fonts.semiBold,
    color: colors.light.primary,
  },
  difficultyBadge: {
    backgroundColor: colors.light.secondary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  difficultyText: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fonts.semiBold,
    color: colors.light.secondary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
  },
  editButton: {
    backgroundColor: palette.warning + '15',
  },
  deleteButton: {
    backgroundColor: palette.error + '15',
  },
  lessonInfo: {
    backgroundColor: colors.light.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  lessonText: {
    fontSize: typography.fontSizes.xs,
    color: colors.light.textSecondary,
  },
  metaInfo: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: typography.fontSizes.xs,
    color: colors.light.textSecondary,
  },
  contentSection: {
    gap: 12,
    marginBottom: 16,
  },
  textContainer: {
    backgroundColor: colors.light.background,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.light.border + '50',
  },
  textHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  sectionHeaderTitle: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fonts.bold,
    color: colors.light.text,
  },
  contentText: {
    fontSize: typography.fontSizes.sm,
    color: colors.light.text,
    lineHeight: 20,
  },
  translationText: {
    fontSize: typography.fontSizes.sm,
    color: colors.light.textSecondary,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  questionsSection: {
    borderTopWidth: 1,
    borderColor: colors.light.border,
    paddingTop: 12,
    marginBottom: 12,
  },
  questionSectionHeader: {
    marginBottom: 8,
  },
  questionSectionTitle: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fonts.bold,
    color: colors.light.primary,
  },
  questionItem: {
    marginBottom: 4,
  },
  questionText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fonts.regular,
    color: colors.light.text,
  },
  moreQuestionsText: {
    fontSize: typography.fontSizes.xs,
    color: colors.light.textSecondary,
    fontStyle: 'italic',
    marginTop: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    backgroundColor: colors.light.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  tagText: {
    fontSize: typography.fontSizes.xs,
    color: colors.light.textSecondary,
  },
  loadMoreContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    gap: 8,
  },
  loadMoreText: {
    fontSize: typography.fontSizes.sm,
    color: colors.light.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateTitle: {
    fontSize: typography.fontSizes.md,
    fontFamily: typography.fonts.bold,
    color: colors.light.text,
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.light.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyStateButton: {
    marginTop: 20,
  },
});

export default ReadingTab;