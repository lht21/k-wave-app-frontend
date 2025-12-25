import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useLocalSearchParams } from 'expo-router'; 
import Button from '../../../components/Button/Button';
import ModalVocabulary from '../../../components/Modal/ModalVocabulary';
import VocabularyTab from '../../../components/LessonDetailTab/VocabularyTab';
import GrammarTab from '../../../components/LessonDetailTab/GrammarTab';
import ListeningTab from '../../../components/LessonDetailTab/ListeningTab';
import SpeakingTab from '../../../components/LessonDetailTab/SpeakingTab';
import ReadingTab from '../../../components/LessonDetailTab/ReadingTab';
import WritingTab from '../../../components/LessonDetailTab/WritingTab';
import { colors, palette } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { lessonService, Lesson } from '../../../services/lessonService';
import { vocabularyService, Vocabulary } from '../../../services/vocabularyService';
import { Grammar } from '../../../types/lesson';
import { Listening } from '../../../services/listeningService';

// Types
interface RootStackParamList {
  LessonDetail: { lessonId: string };
  [key: string]: object | undefined; 
}

type NavigationProp = StackNavigationProp<RootStackParamList, 'LessonDetail'>;
type RouteProps = RouteProp<RootStackParamList, 'LessonDetail'>;

const LessonDetailScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { id } = useLocalSearchParams();
  

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [vocabulary, setVocabulary] = useState<Vocabulary[]>([]);
  const [grammar, setGrammar] = useState<Grammar[]>([]);
  const [listenings, setListenings] = useState<Listening[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>('vocabulary');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingVocabulary, setEditingVocabulary] = useState<Vocabulary | null>(null);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [vocabularyLoading, setVocabularyLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Load bài học từ API
  const loadLesson = async () => {
    if (!id || id === 'undefined') {
      console.warn('ID không hợp lệ:', id);
      return;
    }
    try {
      setLoading(true);
      const lessonData = await lessonService.getLessonById(id);
      setLesson(lessonData);
      setVocabulary(lessonData.vocabulary || []);
      setGrammar(lessonData.grammar || []);
      setListenings(lessonData.listening || []);
    } catch (error: any) {
      console.error('Error loading lesson:', error);
      Alert.alert('Lỗi', error.message || 'Không thể tải bài học');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  

  useEffect(() => {
    loadLesson();
  }, [id]);



  const handleAddVocabulary = (): void => {
    setIsAdding(true);
    setEditingVocabulary(null);
    setIsModalOpen(true);
  };

  const handleEditVocabulary = (vocab: Vocabulary): void => {
    setEditingVocabulary(vocab);
    setIsAdding(false);
    setIsModalOpen(true);
  };

  const handleDeleteVocabulary = async (vocabId: string): Promise<void> => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa từ vựng này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await vocabularyService.deleteVocabulary(vocabId);
              Alert.alert('Thành công', 'Đã xóa từ vựng');
              // Reload vocabulary
              loadVocabulary();
            } catch (error: any) {
              Alert.alert('Lỗi', error.message || 'Không thể xóa từ vựng');
            }
          }
        }
      ]
    );
  };

  const handleSaveVocabulary = async (formData: Omit<Vocabulary, '_id' | 'lesson' | 'level'>): Promise<void> => {
    try {
      if (isAdding && lesson) {
        // Tạo từ vựng mới cho lesson
        const savedVocabulary = await vocabularyService.createVocabularyForLesson(lessonId, formData);
        Alert.alert('Thành công', 'Đã thêm từ vựng mới');
        // Reload vocabulary
        loadVocabulary();
      } else if (editingVocabulary && editingVocabulary._id) {
        // Cập nhật từ vựng
        const updatedVocabulary = await vocabularyService.updateVocabulary(editingVocabulary._id, formData);
        Alert.alert('Thành công', 'Đã cập nhật từ vựng');
        // Reload vocabulary
        loadVocabulary();
      }
      setIsModalOpen(false);
      setEditingVocabulary(null);
      setIsAdding(false);
    } catch (error: any) {
      console.error('Error saving vocabulary:', error);
      Alert.alert('Lỗi', error.message || 'Không thể lưu từ vựng');
    }
  };

  const handleCloseModal = (): void => {
    setIsModalOpen(false);
    setEditingVocabulary(null);
    setIsAdding(false);
  };

  const handleSearchChange = (value: string): void => {
    setSearchTerm(value);
  };

  interface TabItem {
    id: string;
    label: string;
  }

  const tabs: TabItem[] = [
    { id: 'vocabulary', label: 'TỪ VỰNG' },
    { id: 'grammar', label: 'NGỮ PHÁP' },
    { id: 'listening', label: 'LUYỆN NGHE' },
    { id: 'speaking', label: 'LUYỆN NÓI' },
    { id: 'reading', label: 'LUYỆN ĐỌC' },
    { id: 'writing', label: 'LUYỆN VIẾT' }
  ];

  const renderTabContent = (): React.ReactElement => {
    switch (selectedTab) {
      case 'vocabulary':
        return (
          <VocabularyTab
            vocabulary={vocabulary}
            loading={vocabularyLoading}
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            onAddVocabulary={handleAddVocabulary}
            onEditVocabulary={handleEditVocabulary}
            onDeleteVocabulary={handleDeleteVocabulary}
          />
        );
      case 'grammar':
        return (
          <GrammarTab 
            grammar={grammar} // Truyền mảng trực tiếp từ object lesson
            loading={loading}
            // onAddGrammar={handleOpenAddModal}
            // onEditGrammar={(item) => handleOpenEditModal(item)}
            // onDeleteGrammar={handleDeleteGrammarApi}
          />
        )

      case 'listening':
        return (
          <ListeningTab 
            listenings={listenings}
            // loading={listeningsLoading}
            // onAddListening={() => { /* Mở modal listening */ }}
            // onEditListening={(item) => { /* Logic edit */ }}
            // onDeleteListening={async (id) => {
            //     // Thực hiện xóa API và reload data
            //     await listeningService.deleteListening(id);
            //     loadListenings();
            // }}
          />
        );
      case 'speaking':
        return <SpeakingTab 
            lessonId={id} 
          />;
      case 'reading':
        return <ReadingTab 
            lessonId={id} 
        />;
      case 'writing':
        return <WritingTab 
           lessonId={id} 
        />;
      default:
        return (
          <VocabularyTab
            vocabulary={vocabulary}
            loading={vocabularyLoading}
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            onAddVocabulary={handleAddVocabulary}
            onEditVocabulary={handleEditVocabulary}
            onDeleteVocabulary={handleDeleteVocabulary}
          />
        );
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.light.primary} />
        <Text style={styles.loadingText}>Đang tải bài học...</Text>
      </View>
    );
  }

  if (!lesson) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Không tìm thấy bài học</Text>
        <Button
          title="Quay lại"
          variant="primary"
          onPress={() => navigation.goBack()}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.lessonCode}>{lesson.code}</Text>
          <Text style={styles.lessonTitle}>{lesson.title}</Text>
          <View style={styles.lessonMeta}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>{lesson.level}</Text>
            </View>
            {lesson.isPremium && (
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumText}>Premium</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Lesson Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{lesson.viewCount || 0}</Text>
          <Text style={styles.statLabel}>Lượt xem</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{lesson.completionCount || 0}</Text>
          <Text style={styles.statLabel}>Hoàn thành</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{lesson.estimatedDuration || 60} phút</Text>
          <Text style={styles.statLabel}>Thời lượng</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {lesson.isPremium ? 'Premium' : 'Free'}
          </Text>
          <Text style={styles.statLabel}>Trạng thái</Text>
        </View>
      </View>

      {/* Description */}
      <View style={styles.descriptionContainer}>
        <Text style={styles.descriptionLabel}>Mô tả</Text>
        <Text style={styles.descriptionText}>{lesson.description}</Text>
      </View>

      {/* Tabs Navigation */}
      <View style={styles.tabsContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContent}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tab,
                selectedTab === tab.id && styles.tabActive
              ]}
              onPress={() => setSelectedTab(tab.id)}
            >
              <Text style={[
                styles.tabText,
                selectedTab === tab.id && styles.tabTextActive
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Tab Content */}
      <View style={styles.tabContentContainer}>
        {renderTabContent()}
      </View>

      {/* Modal */}
      <ModalVocabulary
        isVisible={isModalOpen}
        onClose={handleCloseModal}
        vocabulary={editingVocabulary}
        onSave={handleSaveVocabulary}
        isAdding={isAdding}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.light.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: typography.fontSizes.md,
    color: colors.light.textSecondary,
    fontFamily: typography.fonts.regular,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.light.background,
    padding: 20,
  },
  errorText: {
    fontSize: typography.fontSizes.lg,
    color: palette.error,
    marginBottom: 20,
    fontFamily: typography.fonts.semiBold,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.light.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  backButton: {
    marginRight: 12,
  },
  backButtonText: {
    fontSize: 24,
    color: colors.light.text,
  },
  headerContent: {
    flex: 1,
  },
  lessonCode: {
    fontSize: typography.fontSizes.sm,
    color: colors.light.textSecondary,
    fontFamily: typography.fonts.regular,
    marginBottom: 2,
  },
  lessonTitle: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fonts.bold,
    color: colors.light.text,
    marginBottom: 8,
  },
  lessonMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  levelBadge: {
    backgroundColor: palette.success + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelText: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fonts.semiBold,
    color: palette.success,
  },
  premiumBadge: {
    backgroundColor: palette.purple + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  premiumText: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fonts.semiBold,
    color: palette.purple,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.light.card,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSizes.md,
    fontFamily: typography.fonts.bold,
    color: colors.light.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: typography.fontSizes.xs,
    color: colors.light.textSecondary,
    fontFamily: typography.fonts.regular,
  },
  descriptionContainer: {
    backgroundColor: colors.light.card,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  descriptionLabel: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fonts.semiBold,
    color: colors.light.textSecondary,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: typography.fontSizes.sm,
    color: colors.light.text,
    fontFamily: typography.fonts.regular,
    lineHeight: 20,
  },
  tabsContainer: {
    backgroundColor: colors.light.card,
  },
  tabsContent: {
    paddingHorizontal: 16,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.light.primary,
  },
  tabText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fonts.semiBold,
    color: colors.light.textSecondary,
  },
  tabTextActive: {
    color: colors.light.primary,
  },
  tabContentContainer: {
    flex: 1,
  },
});

export default LessonDetailScreen;