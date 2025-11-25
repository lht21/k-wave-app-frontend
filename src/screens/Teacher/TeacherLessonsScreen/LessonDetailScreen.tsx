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
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowLeftIcon } from '@hugeicons/core-free-icons';

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

// Types
interface Vocabulary {
  id: number;
  word: string;
  pronunciation: string;
  meaning: string;
  type: string;
  category: string;
  dateAdded: string;
  examples: string[];
}

interface Lesson {
  id: number;
  code: string;
  title: string;
  description: string;
  level: string;
  order: number;
  estimatedDuration: number;
  isPremium: boolean;
  viewCount: number;
  completionCount: number;
  vocabulary: Vocabulary[];
}

interface RootStackParamList {
  LessonDetail: { lessonId: number };
  [key: string]: object | undefined; 
}

type NavigationProp = StackNavigationProp<RootStackParamList, 'LessonDetail'>;
type RouteProps = RouteProp<RootStackParamList, 'LessonDetail'>;

const LessonDetailScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { lessonId } = route.params;

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [selectedTab, setSelectedTab] = useState<string>('vocabulary');
  const [speakingWord, setSpeakingWord] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingVocabulary, setEditingVocabulary] = useState<Vocabulary | null>(null);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Mock data
  const allLessons: Lesson[] = [
    {
      id: 1,
      code: 'BÀI 1',
      title: '0 - 알파벳 Bảng chữ cái',
      description: 'Tiếng Hàn sơ cấp 1',
      level: 'Sơ cấp 1',
      order: 1,
      estimatedDuration: 60,
      isPremium: false,
      viewCount: 150,
      completionCount: 120,
      vocabulary: [
        {
          id: 1,
          word: '일출',
          pronunciation: 'il-chul',
          meaning: 'mặt trời mọc',
          type: '명사',
          category: 'Cảnh trí',
          dateAdded: '01/07/2005',
          examples: [
            '아침에 일출을 보러 갔어요',
            'Đi ngắm mặt trời mọc vào buổi sáng'
          ]
        },
        {
          id: 2,
          word: '사랑',
          pronunciation: 'sa-rang',
          meaning: 'tình yêu',
          type: '명사',
          category: 'Cảm xúc',
          dateAdded: '01/07/2005',
          examples: [
            '사랑은 아름다워요',
            'Tình yêu thật đẹp'
          ]
        }
      ]
    },
    {
      id: 2,
      code: 'BÀI 2',
      title: '1 - 인사 Chào hỏi',
      description: 'Tiếng Hàn sơ cấp 1',
      level: 'Sơ cấp 1',
      order: 2,
      estimatedDuration: 75,
      isPremium: false,
      viewCount: 89,
      completionCount: 67,
      vocabulary: [
        {
          id: 3,
          word: '안녕',
          pronunciation: 'an-nyeong',
          meaning: 'xin chào',
          type: '명사',
          category: 'Chào hỏi',
          dateAdded: '01/07/2005',
          examples: [
            '안녕하세요',
            'Xin chào'
          ]
        }
      ]
    }
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      const foundLesson = allLessons.find(lesson => lesson.id === lessonId);
      
      if (foundLesson) {
        setLesson(foundLesson);
      } else {
        Alert.alert('Lỗi', 'Không tìm thấy bài học');
        navigation.goBack();
      }
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [lessonId, navigation]);

  const speakText = (text: string, wordId: number): void => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      utterance.rate = 0.8;
      utterance.pitch = 1;
      
      setSpeakingWord(wordId);
      
      utterance.onend = () => {
        setSpeakingWord(null);
      };
      
      utterance.onerror = () => {
        setSpeakingWord(null);
        Alert.alert('Lỗi', 'Không thể phát âm thanh. Vui lòng thử lại.');
      };
      
      window.speechSynthesis.speak(utterance);
    } else {
      Alert.alert('Lỗi', 'Trình duyệt của bạn không hỗ trợ Text-to-Speech');
    }
  };

  const stopSpeaking = (): void => {
    window.speechSynthesis.cancel();
    setSpeakingWord(null);
  };

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

  const handleDeleteVocabulary = (vocabId: number): void => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa từ vựng này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            if (lesson) {
              setLesson({
                ...lesson,
                vocabulary: lesson.vocabulary.filter(v => v.id !== vocabId)
              });
            }
          }
        }
      ]
    );
  };

  const handleSaveVocabulary = (formData: Omit<Vocabulary, 'id' | 'dateAdded'>): void => {
    if (isAdding && lesson) {
      const newVocabulary: Vocabulary = {
        id: Date.now(),
        ...formData,
        dateAdded: new Date().toLocaleDateString('vi-VN')
      };
      setLesson({
        ...lesson,
        vocabulary: [...lesson.vocabulary, newVocabulary]
      });
    } else if (editingVocabulary && lesson) {
      setLesson({
        ...lesson,
        vocabulary: lesson.vocabulary.map(v => 
          v.id === editingVocabulary.id ? { ...v, ...formData } : v
        )
      });
    }
    setIsModalOpen(false);
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
    if (!lesson) return <View />;

    switch (selectedTab) {
      case 'vocabulary':
        return (
        <VocabularyTab
          vocabulary={lesson.vocabulary}
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          onAddVocabulary={handleAddVocabulary}
          onEditVocabulary={handleEditVocabulary}
          onDeleteVocabulary={handleDeleteVocabulary}
        />
      );
      case 'grammar':
        return <GrammarTab />;
      case 'listening':
        return <ListeningTab />;
      case 'speaking':
        return <SpeakingTab />;
      case 'reading':
        return <ReadingTab />;
      case 'writing':
        return <WritingTab />;
      default:
        return <VocabularyTab />;
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
        <Text style={styles.lessonTitle}>{lesson.title}</Text>
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
    marginBottom: 40
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
  },
  lessonTitle: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fonts.bold,
    color: colors.light.text,
    flex: 1,
  },
  tabsContainer: {
    backgroundColor: colors.light.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  tabsContent: {
    paddingHorizontal: 16,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 16,
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
  footer: {
    padding: 16,
    backgroundColor: colors.light.card,
    borderTopWidth: 1,
    borderTopColor: colors.light.border,
  },
});

export default LessonDetailScreen;