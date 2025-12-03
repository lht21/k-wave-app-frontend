import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  Add01Icon,
  Edit01Icon,
  Delete02Icon,
  Mic02Icon,
  Clock01Icon,
  Search01Icon,
  ClipboardIcon,
  BookOpen01Icon,
} from '@hugeicons/core-free-icons';

import Button from '../../components/Button/Button';
import ModalSpeaking, { SpeakingLesson } from '../Modal/ModalSpeaking';
import SpeakingPractice from './SpeakingPractice';
import SpeakingEvaluation from './SpeakingEvaluation';
import { colors, palette } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { speakingService, Speaking, SpeakingSubmission } from '../../services/speakingService';

interface SpeakingTabProps {
  lessonId: string;
}

const SpeakingTab: React.FC<SpeakingTabProps> = ({ lessonId }) => {
  const [activeTab, setActiveTab] = useState<'lessons' | 'evaluations'>('lessons');
  const [lessons, setLessons] = useState<Speaking[]>([]);
  const [submissions, setSubmissions] = useState<SpeakingSubmission[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Speaking | null>(null);

  // View Navigation State
  const [currentView, setCurrentView] = useState<'list' | 'practice' | 'evaluation'>('list');
  const [selectedLesson, setSelectedLesson] = useState<Speaking | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<SpeakingSubmission | null>(null);

  // Load speaking lessons
  const loadLessons = async () => {
    try {
      setLoading(true);
      const response = await speakingService.getSpeakingByLesson(lessonId, {
        search: searchTerm,
        limit: 50
      });
      setLessons(response.speakings);
    } catch (error: any) {
      console.error('Error loading speaking lessons:', error);
      Alert.alert('Lỗi', error.message || 'Không thể tải bài nói');
    } finally {
      setLoading(false);
    }
  };

  // Load submissions (for teacher)
// SpeakingTab.jsx - SỬA HÀM loadSubmissions
const loadSubmissions = async () => {
  try {
    setLoadingSubmissions(true);
    let response;

    if (lessonId) {
      // TRƯỜNG HỢP 1: Có Lesson ID -> Gọi API lấy theo Lesson
      console.log('📚 [SpeakingTab] Loading submissions for lesson:', lessonId);
      response = await speakingService.getSubmissionsByLesson(lessonId, {
        page: 1,
        limit: 50
      });
      console.log('✅ [SpeakingTab] Submissions loaded:', response.submissions?.length || 0);
    } else {
      // TRƯỜNG HỢP 2: Không có Lesson ID -> Lấy tất cả (tạm thời)
      console.log('📚 [SpeakingTab] Loading all submissions (no lessonId)');
      response = await speakingService.getSubmissions({
        page: 1,
        limit: 50
      });
    }
    
    // DEBUG: Kiểm tra dữ liệu trả về
    console.log('📊 [SpeakingTab] Final submissions data:', {
      total: response.submissions?.length || 0,
      lessonId: lessonId,
      firstSubmission: response.submissions?.[0]
    });
    
    setSubmissions(response.submissions || []);
  } catch (error: any) {
    console.error('❌ [SpeakingTab] Error loading submissions:', error);
    setSubmissions([]);
  } finally {
    setLoadingSubmissions(false);
  }
};
// SpeakingTab.jsx - THÊM useEffect để debug
useEffect(() => {
  console.log('🔍 [SpeakingTab] Component mounted with lessonId:', lessonId);
  console.log('🔍 [SpeakingTab] Active tab:', activeTab);
}, [lessonId, activeTab]);

useEffect(() => {
  if (activeTab === 'evaluations') {
    console.log('🔄 [SpeakingTab] Loading submissions for tab:', activeTab);
    console.log('📌 [SpeakingTab] Using lessonId:', lessonId);
    loadSubmissions();
  }
}, [activeTab]);

  useEffect(() => {
    if (activeTab === 'lessons') {
      loadLessons();
    } else {
      loadSubmissions();
    }
  }, [activeTab, searchTerm]);

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

  const handleEdit = (lesson: Speaking) => {
    setIsAdding(false);
    setEditingLesson(lesson);
    setIsModalOpen(true);
  };

  const handleSaveLesson = async (data: any) => {
    try {
      if (isAdding) {
        const savedLesson = await speakingService.createSpeakingForLesson(lessonId, {
          title: data.title,
          prompt: data.prompt,
          description: data.instruction,
          level: data.level,
          type: data.type,
          duration: data.duration,
          hints: [...data.wordHint, ...data.pronunciationHint],
          sampleAnswer: data.sampleAnswer
        });
        Alert.alert('Thành công', 'Đã thêm bài nói mới');
        loadLessons();
      } else if (editingLesson?._id) {
        const updatedLesson = await speakingService.updateSpeaking(editingLesson._id, {
          title: data.title,
          prompt: data.prompt,
          description: data.instruction,
          level: data.level,
          type: data.type,
          duration: data.duration,
          hints: [...data.wordHint, ...data.pronunciationHint],
          sampleAnswer: data.sampleAnswer
        });
        Alert.alert('Thành công', 'Đã cập nhật bài nói');
        loadLessons();
      }
      setIsModalOpen(false);
    } catch (error: any) {
      Alert.alert('Lỗi', error.message || 'Không thể lưu bài nói');
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert('Xóa bài nói', 'Bạn có chắc muốn xóa bài nói này?', [
      { text: 'Hủy', style: 'cancel' },
      { 
        text: 'Xóa', 
        style: 'destructive', 
        onPress: async () => {
          try {
            await speakingService.deleteSpeaking(id);
            Alert.alert('Thành công', 'Đã xóa bài nói');
            loadLessons();
          } catch (error: any) {
            Alert.alert('Lỗi', error.message || 'Không thể xóa bài nói');
          }
        }
      }
    ]);
  };

  const startPractice = (lesson: Speaking) => {
    setSelectedLesson(lesson);
    setCurrentView('practice');
  };

  const startEvaluation = (submission: SpeakingSubmission) => {
    setSelectedSubmission(submission);
    setCurrentView('evaluation');
  };

  const goBack = () => {
    setCurrentView('list');
    setSelectedLesson(null);
    setSelectedSubmission(null);
  };

  if (currentView === 'practice' && selectedLesson) {
    return <SpeakingPractice 
      lesson={convertToSpeakingLesson(selectedLesson)} 
      onBack={goBack} 
    />;
  }

  if (currentView === 'evaluation' && selectedSubmission) {
    return <SpeakingEvaluation 
      submission={selectedSubmission} 
      onBack={goBack} 
      lessonId={lessonId} 
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
         />
      </View>

      {/* Loading State */}
      {(loading || loadingSubmissions) && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.light.primary} />
        </View>
      )}

      {/* Content */}
      <ScrollView style={styles.scrollContent}>
        {activeTab === 'lessons' ? (
          filteredLessons.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Chưa có bài nói nào</Text>
              <Button
                title="Thêm bài nói đầu tiên"
                variant="primary"
                onPress={handleAdd}
              />
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
                     <Text style={styles.infoText}>Thời gian: {lesson.duration || 60}s</Text>
                  </View>
                </View>

                <View style={styles.previewBox}>
                  <Text style={styles.previewLabel}>Đề bài:</Text>
                  <Text style={styles.previewText} numberOfLines={2}>{lesson.prompt}</Text>
                </View>

                <Button 
                  title="Luyện nói ngay" 
                  variant="secondary" 
                  size="small"
                  leftIcon={<HugeiconsIcon icon={Mic02Icon} size={16} color="black"/>}
                  onPress={() => startPractice(lesson)}
                />
              </View>
            ))
          )
        ) : (
          submissions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Chưa có bài nộp nào</Text>
            </View>
          ) : (
            submissions.map((sub) => (
              <View key={sub._id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{sub.student.name} - {sub.speaking.title}</Text>
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
                  <Text style={styles.infoText}>Nộp: {new Date(sub.submittedAt).toLocaleDateString()}</Text>
                  <Text style={styles.infoText}>Thời lượng: {sub.recordingDuration}s</Text>
                </View>

                <Button 
                  title="Chấm điểm" 
                  variant="secondary" 
                  size="small"
                  leftIcon={<HugeiconsIcon icon={ClipboardIcon} size={16} color="white"/>}
                  onPress={() => startEvaluation(sub)}
                />
              </View>
            ))
          )
        )}
      </ScrollView>

      {/* Modal */}
      <ModalSpeaking
        isVisible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        speaking={editingLesson ? convertToModalSpeaking(editingLesson) : null}
        onSave={handleSaveLesson}
        isAdding={isAdding}
      />
    </View>
  );
};

// Helper function to convert Speaking to SpeakingLesson (for Modal)
const convertToModalSpeaking = (speaking: Speaking): SpeakingLesson => {
  const hints = speaking.hints || [];
  const wordHint = hints.filter(h => !h.includes('phát âm'));
  const pronunciationHint = hints.filter(h => h.includes('phát âm'));

  return {
    _id: speaking._id,
    title: speaking.title,
    type: speaking.type,
    prompt: speaking.prompt,
    instruction: speaking.description || '',
    targetSentence: '',
    sampleAnswer: speaking.sampleAnswer || '',
    sampleTranslation: '',
    level: speaking.level,
    duration: speaking.duration || 60,
    recordingLimit: speaking.duration || 60,
    wordHint,
    pronunciationHint
  };
};

// Helper function to convert Speaking to SpeakingLesson (for Practice)
const convertToSpeakingLesson = (speaking: Speaking): SpeakingLesson => {
  const hints = speaking.hints || [];
  const wordHint = hints.filter(h => !h.includes('phát âm'));
  const pronunciationHint = hints.filter(h => h.includes('phát âm'));

  return {
    _id: speaking._id,
    title: speaking.title,
    type: speaking.type,
    prompt: speaking.prompt,
    instruction: speaking.description || '',
    targetSentence: '',
    sampleAnswer: speaking.sampleAnswer || '',
    sampleTranslation: '',
    level: speaking.level,
    duration: speaking.duration || 60,
    recordingLimit: speaking.duration || 60,
    wordHint,
    pronunciationHint
  };
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.light.background , marginBottom: 50},
  header: { padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tabContainer: { flexDirection: 'row', gap: 16 },
  tabBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20 },
  activeTab: { backgroundColor: colors.light.primary + '15' },
  tabText: { color: colors.light.textSecondary, fontFamily: typography.fonts.regular },
  activeTabText: { color: colors.light.primary, fontFamily: typography.fonts.bold },
  
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.light.card, margin: 16, marginTop: 0, padding: 5, borderRadius: 8, borderWidth: 1, borderColor: colors.light.border },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 13 },

  loadingContainer: { padding: 40, alignItems: 'center' },
  
  scrollContent: { padding: 16 },
  card: { backgroundColor: colors.light.card, borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.light.border },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  cardTitle: { fontSize: 16, fontFamily: typography.fonts.bold, color: colors.light.text, flex: 1, marginRight: 12 },
  
  tagRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  tag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  tagText: { fontSize: 10, fontFamily: typography.fonts.bold },
  
  actionRow: { flexDirection: 'row', gap: 8 },
  iconBtn: { padding: 6, backgroundColor: colors.light.background, borderRadius: 6 },

  infoGrid: { flexDirection: 'row', gap: 16, marginTop: 12, marginBottom: 10 },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  infoText: { fontSize: 12, color: colors.light.textSecondary },

  previewBox: { marginTop: 12, padding: 10, backgroundColor: colors.light.background, borderRadius: 8 },
  previewLabel: { fontSize: 12, fontFamily: typography.fonts.bold, marginBottom: 4 },
  previewText: { fontSize: 13, color: colors.light.text },

  emptyState: { alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 16, color: colors.light.textSecondary, marginBottom: 20 },
});

export default SpeakingTab;