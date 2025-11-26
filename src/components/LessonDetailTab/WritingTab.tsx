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

// Mock Data
const mockWritingData: WritingLesson[] = [
  {
    _id: '1',
    title: 'Bài viết sơ cấp 1 - Giới thiệu bản thân',
    type: 'paragraph',
    prompt: 'Hãy viết một đoạn văn ngắn giới thiệu về bản thân bạn bằng tiếng Hàn',
    instruction: 'Giới thiệu tên, tuổi, nghề nghiệp, sở thích',
    wordHint: ['저는', '입니다', '취미는', '꿈은'],
    grammarHint: ['S + 는/은', 'S + 입니다'],
    minWords: 50,
    level: 'Sơ cấp 1',
    sampleAnswer: '안녕하세요. 저는 민호입니다...',
    sampleTranslation: 'Xin chào. Tôi là Minho...',
  },
];

const mockStudentSubmissions = [
  {
    id: 'sub-w-001',
    student: { name: 'Nguyễn Văn A', level: 'Sơ cấp 1' },
    writing: mockWritingData[0],
    content: '안녕하세요. 저는 응웬 반 아입니다...',
    wordCount: 45,
    submittedAt: '2024-01-15T10:30:00Z',
  }
];

const WritingTab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'lessons' | 'evaluations'>('lessons');
  const [lessons, setLessons] = useState<WritingLesson[]>(mockWritingData);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingLesson, setEditingLesson] = useState<WritingLesson | null>(null);

  const [currentView, setCurrentView] = useState<'list' | 'practice' | 'evaluation'>('list');
  const [selectedLesson, setSelectedLesson] = useState<WritingLesson | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);

  const filteredLessons = lessons.filter(l => 
    l.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    setIsAdding(true);
    setEditingLesson(null);
    setIsModalOpen(true);
  };

  const handleEdit = (lesson: WritingLesson) => {
    setIsAdding(false);
    setEditingLesson(lesson);
    setIsModalOpen(true);
  };

  const handleSaveLesson = (data: WritingLesson) => {
    if (isAdding) setLessons(prev => [...prev, data]);
    else setLessons(prev => prev.map(l => l._id === data._id ? data : l));
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Xóa', 'Bạn có chắc muốn xóa?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Xóa', style: 'destructive', onPress: () => setLessons(prev => prev.filter(l => l._id !== id)) }
    ]);
  };

  const startPractice = (lesson: WritingLesson) => {
    setSelectedLesson(lesson);
    setCurrentView('practice');
  };

  const startEvaluation = (sub: any) => {
    setSelectedSubmission(sub);
    setCurrentView('evaluation');
  };

  const goBack = () => {
    setCurrentView('list');
    setSelectedLesson(null);
    setSelectedSubmission(null);
  };

  if (currentView === 'practice' && selectedLesson) return <WritingPractice lesson={selectedLesson} onBack={goBack} />;
  if (currentView === 'evaluation' && selectedSubmission) return <WritingEvaluation submission={selectedSubmission} onBack={goBack} />;

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
            <Text style={[styles.tabText, activeTab === 'lessons' && styles.activeTabText]}>Bài viết</Text>
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
           <Button title="Thêm" variant="primary" size="small" onPress={handleAdd} leftIcon={<HugeiconsIcon icon={Add01Icon} size={16} color="white" />} />
        )}
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
         <HugeiconsIcon icon={Search01Icon} size={20} color={colors.light.textSecondary} />
         <TextInput style={styles.searchInput} placeholder="Tìm kiếm..." value={searchTerm} onChangeText={setSearchTerm} />
      </View>

      <ScrollView style={styles.scrollContent}>
        {activeTab === 'lessons' ? (
          /* --- TAB BÀI HỌC --- */
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
                   <Text style={styles.infoText}>{lesson.wordHint.length} gợi ý</Text>
                </View>
              </View>

              <Button title="Viết bài" variant="secondary" size="small" leftIcon={<HugeiconsIcon icon={PenTool03Icon} size={16} color="black"/>} onPress={() => startPractice(lesson)} />
            </View>
          ))
        ) : (
          /* --- TAB CHẤM ĐIỂM (Đã sửa giao diện) --- */
          mockStudentSubmissions.map((sub) => (
            <View key={sub.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={{flex: 1}}>
                  <Text style={styles.cardTitle}>{sub.writing.title}</Text>
                  <View style={styles.infoItem}>
                    <HugeiconsIcon icon={UserIcon} size={14} color={colors.light.textSecondary} />
                    <Text style={styles.subTitle}>{sub.student.name}</Text>
                  </View>
                </View>
                <View style={[styles.tag, { backgroundColor: palette.warning + '20' }]}>
                  <Text style={[styles.tagText, { color: palette.warning }]}>Chờ chấm</Text>
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

              <Button 
                title="Chấm điểm" 
                variant="primary" 
                size="small" 
                leftIcon={<HugeiconsIcon icon={ClipboardIcon} size={16} color="white"/>} 
                onPress={() => startEvaluation(sub)} 
              />
            </View>
          ))
        )}
      </ScrollView>

      <ModalWriting isVisible={isModalOpen} onClose={() => setIsModalOpen(false)} writing={editingLesson} onSave={handleSaveLesson} isAdding={isAdding} />
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
  
  card: { flexDirection: 'column', backgroundColor: colors.light.card, borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.light.border },
  
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  cardTitle: { fontSize: 16, fontFamily: typography.fonts.bold, color: colors.light.text, marginBottom: 4 },
  subTitle: { fontSize: 13, color: colors.light.textSecondary, fontFamily: typography.fonts.regular },
  
  tagRow: { flexDirection: 'row', gap: 8, marginTop: 6 },
  tag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start' },
  tagText: { fontSize: 10, fontFamily: typography.fonts.bold },
  
  actionRow: { flexDirection: 'row', gap: 8 },
  iconBtn: { padding: 6, backgroundColor: colors.light.background, borderRadius: 6 },
  
  infoGrid: { flexDirection: 'row', gap: 16, marginTop: 8, marginBottom: 16 },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  infoText: { fontSize: 12, color: colors.light.textSecondary },
});

export default WritingTab;