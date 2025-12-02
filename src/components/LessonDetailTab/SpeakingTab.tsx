import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  Alert,
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

// --- MOCK DATA ---
const mockSpeakingData: SpeakingLesson[] = [
  {
    _id: '1',
    title: 'Bài nói sơ cấp 1 - Giới thiệu bản thân',
    type: 'self_introduction',
    prompt: 'Hãy giới thiệu về bản thân bạn bằng tiếng Hàn',
    instruction: 'Giới thiệu tên, tuổi, quê quán, sở thích và ước mơ',
    targetSentence: '안녕하세요. 저는 [이름]입니다. [나이]살입니다.',
    sampleAnswer: '안녕하세요. 저는 민호입니다. 25살입니다. 베트남에서 왔습니다.',
    sampleTranslation: 'Xin chào. Tôi là Minho. Tôi 25 tuổi. Tôi đến từ Việt Nam.',
    level: 'Sơ cấp 1',
    duration: 10,
    recordingLimit: 30,
    wordHint: ['저는', '입니다', '살입니다'],
    pronunciationHint: ['안녕하세요 (an-nyeong-ha-se-yo)']
  },
  {
    _id: '2',
    title: 'Bài nói sơ cấp 2 - Gia đình',
    type: 'description',
    prompt: 'Mô tả gia đình của bạn',
    instruction: 'Nói về số lượng thành viên, nghề nghiệp',
    targetSentence: '우리 가족은 [숫자]명입니다.',
    sampleAnswer: '우리 가족은 4명입니다. 아버지, 어머니, 동생이 있습니다.',
    sampleTranslation: 'Gia đình tôi có 4 người. Có bố, mẹ và em.',
    level: 'Sơ cấp 1',
    duration: 90,
    recordingLimit: 45,
    wordHint: ['가족', '아버지', '어머니'],
    pronunciationHint: ['가족 (ga-jok)']
  }
];

const mockStudentSubmissions = [
  {
    id: 'sub-001',
    student: { name: 'Nguyễn Văn A', level: 'Sơ cấp 1' },
    speaking: mockSpeakingData[0],
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Mock audio
    submittedAt: '2024-01-15T10:30:00Z',
    recordingDuration: 45,
    wordCount: 85
  }
];

const SpeakingTab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'lessons' | 'evaluations'>('lessons');
  const [lessons, setLessons] = useState<SpeakingLesson[]>(mockSpeakingData);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingLesson, setEditingLesson] = useState<SpeakingLesson | null>(null);

  // View Navigation State
  const [currentView, setCurrentView] = useState<'list' | 'practice' | 'evaluation'>('list');
  const [selectedLesson, setSelectedLesson] = useState<SpeakingLesson | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);

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

  const handleEdit = (lesson: SpeakingLesson) => {
    setIsAdding(false);
    setEditingLesson(lesson);
    setIsModalOpen(true);
  };

  const handleSaveLesson = (data: SpeakingLesson) => {
    if (isAdding) {
      setLessons(prev => [...prev, data]);
    } else {
      setLessons(prev => prev.map(l => l._id === data._id ? data : l));
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Xóa', 'Bạn có chắc muốn xóa?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Xóa', style: 'destructive', onPress: () => setLessons(prev => prev.filter(l => l._id !== id)) }
    ]);
  };

  const startPractice = (lesson: SpeakingLesson) => {
    setSelectedLesson(lesson);
    setCurrentView('practice');
  };

  const startEvaluation = (submission: any) => {
    setSelectedSubmission(submission);
    setCurrentView('evaluation');
  };

  const goBack = () => {
    setCurrentView('list');
    setSelectedLesson(null);
    setSelectedSubmission(null);
  };

  if (currentView === 'practice' && selectedLesson) {
    return <SpeakingPractice lesson={selectedLesson} onBack={goBack} />;
  }

  if (currentView === 'evaluation' && selectedSubmission) {
    return <SpeakingEvaluation submission={selectedSubmission} onBack={goBack} />;
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

      {/* Content */}
      <ScrollView style={styles.scrollContent}>
        {activeTab === 'lessons' ? (
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
                   <Text style={styles.infoText}>Chuẩn bị: {lesson.duration}s</Text>
                </View>
                <View style={styles.infoItem}>
                   <HugeiconsIcon icon={Mic02Icon} size={14} color={colors.light.textSecondary} />
                   <Text style={styles.infoText}>Ghi âm: {lesson.recordingLimit}s</Text>
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
        ) : (
          mockStudentSubmissions.map((sub, index) => (
            <View key={sub.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{sub.student.name} - {sub.speaking.title}</Text>
                <View style={[styles.tag, { backgroundColor: palette.warning + '20' }]}>
                <Text style={[styles.tagText, { color: palette.error }]}>Chờ chấm</Text>
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
        )}
      </ScrollView>

      {/* Modal */}
      <ModalSpeaking
        isVisible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        speaking={editingLesson}
        onSave={handleSaveLesson}
        isAdding={isAdding}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.light.background },
  header: { padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tabContainer: { flexDirection: 'row', gap: 16 },
  tabBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20 },
  activeTab: { backgroundColor: colors.light.primary + '15' },
  tabText: { color: colors.light.textSecondary, fontFamily: typography.fonts.regular },
  activeTabText: { color: colors.light.primary, fontFamily: typography.fonts.bold },
  
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.light.card, margin: 16, marginTop: 0, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: colors.light.border },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14 },

  scrollContent: { padding: 16 },
  card: { backgroundColor: colors.light.card, borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.light.border },
  cardHeader: { flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardTitle: { fontSize: 16, fontFamily: typography.fonts.bold, color: colors.light.text, marginBottom: 8 },
  
  tagRow: { flexDirection: 'row', gap: 8 },
  tag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  tagText: { fontSize: 10, fontFamily: typography.fonts.bold },
  
  actionRow: { flexDirection: 'row', gap: 8 },
  iconBtn: { padding: 6, backgroundColor: colors.light.background, borderRadius: 6 },

  infoGrid: { flexDirection: 'row', gap: 16, marginTop: 12 , marginBottom: 10},
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  infoText: { fontSize: 12, color: colors.light.textSecondary },

  previewBox: { marginTop: 12, padding: 10, backgroundColor: colors.light.background, borderRadius: 8 },
  previewLabel: { fontSize: 12, fontFamily: typography.fonts.bold, marginBottom: 4 },
  previewText: { fontSize: 13, color: colors.light.text },
});

export default SpeakingTab;