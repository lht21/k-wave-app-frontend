import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  Add01Icon,
  Edit01Icon,
  Delete02Icon,
  Search01Icon,
  BookOpen01Icon,
  ClipboardIcon,
  PenTool03Icon,
  Clock01Icon,
  Idea01Icon,
  UserIcon,
  Note01Icon,
} from '@hugeicons/core-free-icons';

import Button from '../../components/Button/Button';
import ModalWriting, { WritingLesson } from '../Modal/ModalWriting';
import WritingPractice from './WritingPractice';
import WritingEvaluation from './WritingEvaluation';
import { colors, palette } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { writingService, Writing, WritingSubmission } from '../../services/writingService';

interface WritingTabProps {
  lessonId: string;
}

const WritingTab: React.FC<WritingTabProps> = ({ lessonId }) => {
  const [activeTab, setActiveTab] = useState<'lessons' | 'evaluations'>('lessons');
  const [lessons, setLessons] = useState<Writing[]>([]);
  const [submissions, setSubmissions] = useState<WritingSubmission[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Writing | null>(null);

  // View Navigation State
  const [currentView, setCurrentView] = useState<'list' | 'practice' | 'evaluation'>('list');
  const [selectedLesson, setSelectedLesson] = useState<Writing | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<WritingSubmission | null>(null);

const loadLessons = useCallback(async () => {
  try {
    setLoading(true);
    let response;
    
    if (lessonId) {
      response = await writingService.getWritingsByLesson(lessonId);
    } else {
      response = await writingService.getWritings({
        search: searchTerm,
        limit: 50
      });
    }
    
    // PHÒNG THỦ: Kiểm tra mọi trường hợp key có thể trả về
    const dataFromServer = response.writings || (Array.isArray(response) ? response : []);
    
    console.log('📝 Dữ liệu writing nhận được:', dataFromServer.length);
    setLessons(dataFromServer);
  } catch (error: any) {
    // ...
  } finally {
    setLoading(false);
  }
}, [lessonId, searchTerm]);


  // Load submissions (for teacher)
  const loadSubmissions = useCallback(async () => {
    try {
      setLoadingSubmissions(true);
      const response = await writingService.getSubmissions({
        page: 1,
        limit: 50
      });
      setSubmissions(response.submissions || []);
    } catch (error: any) {
      console.error('Error loading submissions:', error);
      Alert.alert('Lỗi', error.message || 'Không thể tải bài nộp');
    } finally {
      setLoadingSubmissions(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'lessons') {
      loadLessons();
    } else {
      loadSubmissions();
    }
  }, [activeTab, searchTerm, loadLessons, loadSubmissions]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (activeTab === 'lessons') {
      await loadLessons();
    } else {
      await loadSubmissions();
    }
    setRefreshing(false);
  }, [activeTab, loadLessons, loadSubmissions]);

  // Filter Logic
  const filteredLessons = lessons.filter(l => 
    l.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.level.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- HANDLERS ---
  const handleAdd = () => {
    setIsAdding(true);
    setEditingLesson(null);
    setIsModalOpen(true);
  };

  const handleEdit = (lesson: Writing) => {
    setIsAdding(false);
    setEditingLesson(lesson);
    setIsModalOpen(true);
  };

const handleSaveLesson = async (data: any) => {
  try {
    // Prepare data matching WritingCreateData interface
    const writingData: any = {
      title: data.title,
      prompt: data.prompt,
      instruction: data.instruction || undefined,
      level: data.level,
      type: data.type,
      minWords: data.minWords,
      maxWords: data.maxWords || undefined,
      wordHint: data.wordHint || [],
      grammarHint: data.grammarHint || [],
      sampleAnswer: data.sampleAnswer || undefined,
      sampleTranslation: data.sampleTranslation || undefined,
      estimatedTime: data.estimatedTime || 30,
      difficulty: data.difficulty || 'Trung bình',
      tags: data.tags || []
    };

    // Add optional fields if they exist
    if (data.structureHint?.trim()) {
      writingData.structureHint = data.structureHint.trim();
    }

    if (isAdding) {
      const savedLesson = await writingService.createWritingForLesson(lessonId || '', writingData);
      Alert.alert('Thành công', 'Đã thêm bài viết mới');
      loadLessons();
    } else if (editingLesson?._id) {
      const updatedLesson = await writingService.updateWriting(editingLesson._id, writingData);
      Alert.alert('Thành công', 'Đã cập nhật bài viết');
      loadLessons();
    }
    setIsModalOpen(false);
  } catch (error: any) {
    console.error('Error saving writing:', error);
    Alert.alert('Lỗi', error.message || 'Không thể lưu bài viết');
  }
};

  const handleDelete = async (id: string) => {
    Alert.alert('Xóa bài viết', 'Bạn có chắc muốn xóa bài viết này?', [
      { text: 'Hủy', style: 'cancel' },
      { 
        text: 'Xóa', 
        style: 'destructive', 
        onPress: async () => {
          try {
            await writingService.deleteWriting(id);
            Alert.alert('Thành công', 'Đã xóa bài viết');
            loadLessons();
          } catch (error: any) {
            Alert.alert('Lỗi', error.message || 'Không thể xóa bài viết');
          }
        }
      }
    ]);
  };

  const handleDeleteSubmission = async (id: string) => {
    Alert.alert('Xóa bài nộp', 'Bạn có chắc muốn xóa bài nộp này?', [
      { text: 'Hủy', style: 'cancel' },
      { 
        text: 'Xóa', 
        style: 'destructive', 
        onPress: async () => {
          try {
            await writingService.deleteSubmission(id);
            Alert.alert('Thành công', 'Đã xóa bài nộp');
            loadSubmissions();
          } catch (error: any) {
            Alert.alert('Lỗi', error.message || 'Không thể xóa bài nộp');
          }
        }
      }
    ]);
  };

  const startPractice = (lesson: Writing) => {
    setSelectedLesson(lesson);
    setCurrentView('practice');
  };

  const startEvaluation = (submission: WritingSubmission) => {
    setSelectedSubmission(submission);
    setCurrentView('evaluation');
  };

  const goBack = () => {
    setCurrentView('list');
    setSelectedLesson(null);
    setSelectedSubmission(null);
  };

  if (currentView === 'practice' && selectedLesson) {
    return <WritingPractice 
      lesson={convertToWritingLesson(selectedLesson)} 
      onBack={goBack} 
    />;
  }

  if (currentView === 'evaluation' && selectedSubmission) {
    return <WritingEvaluation 
      submission={selectedSubmission} 
      onBack={goBack} 
    />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tabBtn, activeTab === 'lessons' && styles.activeTab]}
            onPress={() => setActiveTab('lessons')}
          >
            <HugeiconsIcon icon={BookOpen01Icon} size={18} color={activeTab === 'lessons' ? colors.light.primary : colors.light.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'lessons' && styles.activeTabText]}>Bài học</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabBtn, activeTab === 'evaluations' && styles.activeTab]}
            onPress={() => setActiveTab('evaluations')}
          >
            <HugeiconsIcon icon={ClipboardIcon} size={18} color={activeTab === 'evaluations' ? colors.light.primary : colors.light.textSecondary} />
            <Text style={[styles.tabText, activeTab === 'evaluations' && styles.activeTabText]}>Chấm điểm</Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'lessons' && (
           <Button
             title="Thêm"
             variant="primary"
             size="small"
             onPress={handleAdd}
             leftIcon={<HugeiconsIcon icon={Add01Icon} size={16} color="white" />}
           />
        )}
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
         <HugeiconsIcon icon={Search01Icon} size={20} color={colors.light.textSecondary} />
         <TextInput 
           style={styles.searchInput}
           placeholder="Tìm kiếm..."
           value={searchTerm}
           onChangeText={setSearchTerm}
           returnKeyType="search"
         />
      </View>

      {/* Loading State */}
      {(loading || loadingSubmissions) && !refreshing && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.light.primary} />
        </View>
      )}

      {/* Content */}
      <ScrollView 
        style={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.light.primary]}
          />
        }
      >
        {activeTab === 'lessons' ? (
          filteredLessons.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                {loading ? 'Đang tải...' : 'Chưa có bài viết nào'}
              </Text>
              {!loading && (
                <Button
                  title="Thêm bài viết đầu tiên"
                  variant="primary"
                  onPress={handleAdd}
                />
              )}
            </View>
          ) : (
            filteredLessons.map((lesson, index) => (
              <View key={lesson._id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{index + 1}. {lesson.title}</Text>
                    <View style={styles.tagRow}>
                      <View style={[styles.tag, { backgroundColor: colors.light.primary + '20' }]}>
                        <Text style={[styles.tagText, { color: colors.light.primary }]}>{lesson.level}</Text>
                      </View>
                      <View style={[styles.tag, { backgroundColor: palette.purple + '20' }]}>
                        <Text style={[styles.tagText, { color: palette.purple }]}>{lesson.type}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.actionRow}>
                    <TouchableOpacity onPress={() => handleEdit(lesson)} style={styles.iconBtn}>
                      <HugeiconsIcon icon={Edit01Icon} size={18} color={palette.warning} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(lesson._id)} style={styles.iconBtn}>
                      <HugeiconsIcon icon={Delete02Icon} size={18} color={palette.error} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.infoGrid}>
                  <View style={styles.infoItem}>
                     <HugeiconsIcon icon={Clock01Icon} size={14} color={colors.light.textSecondary} />
                     <Text style={styles.infoText}>Min: {lesson.minWords} từ</Text>
                  </View>
                  <View style={styles.infoItem}>
                     <HugeiconsIcon icon={Idea01Icon} size={14} color={colors.light.textSecondary} />
                     <Text style={styles.infoText}>{lesson.wordHint?.length || 0} gợi ý</Text>
                  </View>
                </View>

                <View style={styles.previewBox}>
                  <Text style={styles.previewLabel}>Đề bài:</Text>
                  <Text style={styles.previewText} numberOfLines={2}>{lesson.prompt}</Text>
                </View>

                <Button 
                  title="Viết bài" 
                  variant="secondary" 
                  size="small"
                  leftIcon={<HugeiconsIcon icon={PenTool03Icon} size={16} color="black"/>}
                  onPress={() => startPractice(lesson)}
                />
              </View>
            ))
          )
        ) : (
          submissions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                {loadingSubmissions ? 'Đang tải...' : 'Chưa có bài nộp nào'}
              </Text>
            </View>
          ) : (
            submissions.map((sub) => (
              <View key={sub._id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{sub.writing.title}</Text>
                    <View style={styles.infoItem}>
                      <HugeiconsIcon icon={UserIcon} size={14} color={colors.light.textSecondary} />
                      <Text style={styles.subTitle}>{sub.user.name}</Text>
                    </View>
                  </View>
                  <View style={[styles.tag, { 
                    backgroundColor: sub.status === 'submitted' ? palette.warning + '20' : palette.success + '20' 
                  }]}>
                    <Text style={[styles.tagText, { 
                      color: sub.status === 'submitted' ? palette.warning : palette.success 
                    }]}>
                      {sub.status === 'submitted' ? 'Chờ chấm' : 'Đã chấm'}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.infoGrid}>
                  <View style={styles.infoItem}>
                    <HugeiconsIcon icon={Clock01Icon} size={14} color={colors.light.textSecondary} />
                    <Text style={styles.infoText}>Nộp: {new Date(sub.submittedAt).toLocaleDateString('vi-VN')}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <HugeiconsIcon icon={Note01Icon} size={14} color={colors.light.textSecondary} />
                    <Text style={styles.infoText}>{sub.wordCount} từ</Text>
                  </View>
                </View>

                <View style={styles.previewBox}>
                  <Text style={styles.previewLabel}>Bài làm:</Text>
                  <Text style={styles.previewText} numberOfLines={3}>{sub.content}</Text>
                </View>

                <View style={styles.buttonRow}>
                  <Button 
                    title="Chấm điểm" 
                    variant="primary" 
                    size="small"
                    leftIcon={<HugeiconsIcon icon={ClipboardIcon} size={16} color="white"/>}
                    onPress={() => startEvaluation(sub)}
                  />
                  <TouchableOpacity 
                    onPress={() => handleDeleteSubmission(sub._id)}
                    style={styles.deleteBtn}
                  >
                    <HugeiconsIcon icon={Delete02Icon} size={18} color={palette.error} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )
        )}
      </ScrollView>

      {/* Modal */}
      <ModalWriting
        isVisible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        writing={editingLesson ? convertToModalWriting(editingLesson) : null}
        onSave={handleSaveLesson}
        isAdding={isAdding}
      />
    </View>
  );
};

// Helper function to convert Writing to WritingLesson (for Modal)
const convertToModalWriting = (writing: Writing): WritingLesson => {
  return {
    _id: writing._id,
    title: writing.title,
    type: writing.type,
    prompt: writing.prompt,
    instruction: writing.instruction || '',
    wordHint: writing.wordHint || [],
    grammarHint: writing.grammarHint || [],
    structureHint: writing.structureHint || '',
    minWords: writing.minWords,
    maxWords: writing.maxWords,
    level: writing.level,
    sampleAnswer: writing.sampleAnswer || '',
    sampleTranslation: writing.sampleTranslation || '',
    estimatedTime: writing.estimatedTime || 30,
    difficulty: writing.difficulty || 'Trung bình',
    tags: writing.tags || []
  };
};

// Helper function to convert Writing to WritingLesson (for Practice)
// Helper function to convert Writing to WritingLesson (for Practice)
const convertToWritingLesson = (writing: Writing): any => {
  return {
    _id: writing._id,
    title: writing.title,
    type: writing.type,
    prompt: writing.prompt,
    instruction: writing.instruction || '',
    wordHint: writing.wordHint || [],
    grammarHint: writing.grammarHint || [],
    structureHint: writing.structureHint || '',
    minWords: writing.minWords,
    maxWords: writing.maxWords,
    level: writing.level,
    sampleAnswer: writing.sampleAnswer || '',
    sampleTranslation: writing.sampleTranslation || '',
    estimatedTime: writing.estimatedTime || 30,
    difficulty: writing.difficulty || 'Trung bình',
    tags: writing.tags || [],
    // Thêm các trường optional để khớp với Writing interface
    attemptCount: writing.attemptCount || 0,
    averageScore: writing.averageScore || 0,
    completionRate: writing.completionRate || 0,
    averageWordCount: writing.averageWordCount || 0,
    isActive: writing.isActive !== undefined ? writing.isActive : true,
    isPublic: writing.isPublic !== undefined ? writing.isPublic : false,
  };
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.light.background, marginBottom: 50 },
  header: { 
    padding: 16, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border
  },
  tabContainer: { flexDirection: 'row', gap: 16 },
  tabBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6, 
    paddingVertical: 8, 
    paddingHorizontal: 12, 
    borderRadius: 20 
  },
  activeTab: { backgroundColor: colors.light.primary + '15' },
  tabText: { 
    color: colors.light.textSecondary, 
    fontFamily: typography.fonts.regular,
    fontSize: 14
  },
  activeTabText: { 
    color: colors.light.primary, 
    fontFamily: typography.fonts.bold 
  },
  
  searchBar: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: colors.light.card, 
    margin: 10, 
    marginTop: 0, 
    padding: 5, 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: colors.light.border 
  },
  searchInput: { 
    flex: 1, 
    marginLeft: 8, 
    fontSize: 14,
    color: colors.light.text
  },

  loadingContainer: { 
    padding: 40, 
    alignItems: 'center' 
  },
  
  scrollContent: { 
    padding: 16 
  },
  card: { 
    backgroundColor: colors.light.card, 
    borderRadius: 12, 
    padding: 16, 
    marginBottom: 16, 
    borderWidth: 1, 
    borderColor: colors.light.border 
  },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    marginBottom: 12 
  },
  cardTitle: { 
    fontSize: 16, 
    fontFamily: typography.fonts.bold, 
    color: colors.light.text, 
    flex: 1, 
    marginRight: 12 
  },
  subTitle: { 
    fontSize: 13, 
    color: colors.light.textSecondary, 
    fontFamily: typography.fonts.regular 
  },
  
  tagRow: { 
    flexDirection: 'row', 
    gap: 8, 
    marginTop: 8 
  },
  tag: { 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 6,
    alignSelf: 'flex-start'
  },
  tagText: { 
    fontSize: 10, 
    fontFamily: typography.fonts.bold 
  },
  
  actionRow: { 
    flexDirection: 'row', 
    gap: 8 
  },
  iconBtn: { 
    padding: 6, 
    backgroundColor: colors.light.background, 
    borderRadius: 6 
  },

  infoGrid: { 
    flexDirection: 'row', 
    gap: 16, 
    marginTop: 12, 
    marginBottom: 10 
  },
  infoItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4 
  },
  infoText: { 
    fontSize: 12, 
    color: colors.light.textSecondary 
  },

  previewBox: { 
    marginTop: 12, 
    marginBottom: 16,
    padding: 10, 
    backgroundColor: colors.light.background, 
    borderRadius: 8 
  },
  previewLabel: { 
    fontSize: 12, 
    fontFamily: typography.fonts.bold, 
    marginBottom: 4,
    color: colors.light.textSecondary
  },
  previewText: { 
    fontSize: 13, 
    color: colors.light.text,
    lineHeight: 18
  },

  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  deleteBtn: {
    padding: 10,
    backgroundColor: palette.error + '15',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: palette.error + '30'
  },

  emptyState: { 
    alignItems: 'center', 
    padding: 40 
  },
  emptyText: { 
    fontSize: 16, 
    color: colors.light.textSecondary, 
    marginBottom: 20,
    textAlign: 'center'
  },
});

export default WritingTab;