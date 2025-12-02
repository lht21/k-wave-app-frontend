import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  TextInput,
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
import ModalReading, { ReadingLesson } from '../Modal/ModalReading';
import { colors, palette } from '../../theme/colors';
import { typography } from '../../theme/typography';

// Mock Data
const initialReadingData: ReadingLesson[] = [
  {
    _id: '1',
    title: 'Bài đọc sơ cấp 1 - Giới thiệu bản thân',
    content: '안녕하세요. 저는 한국 대학교에서 경제학을 공부하는 학생입니다. 제 취미는 독서와 음악 감상입니다. 주말에는 친구들과 함께 영화를 보거나 카페에 가서 시간을 보냅니다.',
    translation: 'Xin chào. Tôi là sinh viên học ngành kinh tế tại trường đại học Hàn Quốc. Sở thích của tôi là đọc sách và nghe nhạc. Vào cuối tuần, tôi thường xem phim hoặc đi cà phê với bạn bè.',
    level: 'Sơ cấp 1',
    questions: [
      {
        _id: 'q1',
        question: 'Người viết học ngành gì?',
        options: ['Kinh tế', 'Y học', 'Luật', 'Kỹ thuật'],
        answer: 0,
        explanation: 'Trong câu "경제학을 공부하는 학생입니다" có nghĩa là "sinh viên học ngành kinh tế"'
      },
      {
        _id: 'q2', 
        question: 'Sở thích của người viết là gì?',
        options: ['Đọc sách và nghe nhạc', 'Thể thao', 'Nấu ăn', 'Du lịch'],
        answer: 0,
        explanation: 'Câu "제 취미는 독서와 음악 감상입니다" có nghĩa là "Sở thích của tôi là đọc sách và nghe nhạc"'
      },
    ]
  },
  {
    _id: '2',
    title: 'Bài đọc sơ cấp 2 - Thói quen hàng ngày',
    content: '저는 아침 7시에 일어납니다. 8시에 아침을 먹고 9시부터 학교에 갑니다. 오후 5시에 집에 와서 공부를 합니다.',
    translation: 'Tôi thức dậy lúc 7 giờ sáng. Tôi ăn sáng lúc 8 giờ và đi học từ 9 giờ. Tôi về nhà lúc 5 giờ chiều và học bài.',
    level: 'Sơ cấp 1',
    questions: [
      {
        _id: 'q4',
        question: 'Người viết đi học lúc mấy giờ?',
        options: ['9 giờ', '7 giờ', '8 giờ', '5 giờ'],
        answer: 0,
        explanation: 'Câu "9시부터 학교에 갑니다" có nghĩa là "đi học từ 9 giờ"'
      }
    ]
  }
];

const ReadingTab: React.FC = () => {
  const [data, setData] = useState<ReadingLesson[]>(initialReadingData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<ReadingLesson | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Logic Filter
  const filteredData = data.filter(lesson =>
    lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lesson.level.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lesson.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Logic CRUD
  const handleEditLesson = (lesson: ReadingLesson) => {
    setEditingLesson(lesson);
    setIsAdding(false);
    setIsModalOpen(true);
  };

  const handleAddLesson = () => {
    setEditingLesson(null);
    setIsAdding(true);
    setIsModalOpen(true);
  };

  const handleDeleteLesson = (lessonId: string) => {
    Alert.alert('Xác nhận xóa', 'Bạn có chắc chắn muốn xóa bài đọc này?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Xóa', style: 'destructive', onPress: () => setData(prev => prev.filter(item => item._id !== lessonId)) },
    ]);
  };

  const handleSaveLesson = (lessonData: ReadingLesson) => {
    if (isAdding) {
      setData(prev => [...prev, lessonData]);
    } else {
      setData(prev => prev.map(item => item._id === lessonData._id ? lessonData : item));
    }
    setIsModalOpen(false);
  };

  // Render Card
  const renderReadingCard = (lesson: ReadingLesson) => (
    <View key={lesson._id} style={styles.card}>
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{lesson.title}</Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>{lesson.level}</Text>
          </View>
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={() => handleEditLesson(lesson)}>
            <HugeiconsIcon icon={Edit01Icon} size={18} color={palette.warning} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={() => handleDeleteLesson(lesson._id)}>
            <HugeiconsIcon icon={Delete02Icon} size={18} color={palette.error} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Meta Info */}
      <View style={styles.metaInfo}>
        <View style={styles.metaItem}>
          <HugeiconsIcon icon={File01Icon} size={14} color={colors.light.textSecondary} />
          <Text style={styles.metaText}>Bài đọc</Text>
        </View>
        <View style={styles.metaItem}>
          <HugeiconsIcon icon={HelpCircleIcon} size={14} color={colors.light.textSecondary} />
          <Text style={styles.metaText}>{lesson.questions.length} câu hỏi</Text>
        </View>
        <View style={styles.metaItem}>
          <HugeiconsIcon icon={InformationCircleIcon} size={14} color={colors.light.textSecondary} />
          <Text style={styles.metaText}>{lesson.content.length} ký tự</Text>
        </View>
      </View>

      {/* Content Section */}
      <View style={styles.contentSection}>
        <View style={styles.textContainer}>
          <View style={styles.textHeader}>
            <HugeiconsIcon icon={LicenseDraftIcon} size={14} color={colors.light.text} />
            <Text style={styles.sectionHeaderTitle}>Nội dung:</Text>
          </View>
          <Text style={styles.contentText}>{lesson.content}</Text>
        </View>

        {lesson.translation && (
          <View style={[styles.textContainer, { backgroundColor: colors.light.primary + '05', borderColor: colors.light.primary + '20' }]}>
            <View style={styles.textHeader}>
              <HugeiconsIcon icon={TranslateIcon} size={14} color={colors.light.primary} />
              <Text style={[styles.sectionHeaderTitle, { color: colors.light.primary }]}>Dịch:</Text>
            </View>
            <Text style={styles.translationText}>{lesson.translation}</Text>
          </View>
        )}
      </View>

      {/* Questions Preview */}
      <View style={styles.questionsSection}>
        <View style={styles.questionSectionHeader}>
          <Text style={styles.questionSectionTitle}>Câu hỏi ({lesson.questions.length})</Text>
        </View>
        {lesson.questions.map((q, i) => (
          <View key={q._id} style={styles.questionItem}>
            <Text style={styles.questionText}>{i + 1}. {q.question}</Text>
            <View style={styles.optionsGrid}>
              {q.options.map((opt, optIdx) => (
                <Text key={optIdx} style={[
                  styles.optionText,
                  optIdx === q.answer && styles.correctOptionText
                ]}>
                  {String.fromCharCode(65 + optIdx)}. {opt} {optIdx === q.answer ? '✓' : ''}
                </Text>
              ))}
            </View>
            {q.explanation && (
              <Text style={styles.explanationText}>💡 {q.explanation}</Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <HugeiconsIcon icon={Search01Icon} size={20} color={colors.light.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm bài đọc..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholderTextColor={colors.light.textSecondary}
          />
        </View>
        
        <Button
          title="Thêm mới"
          variant="primary"
          size="small"
          onPress={handleAddLesson}
          leftIcon={<HugeiconsIcon icon={Add01Icon} size={16} color={colors.light.background} />}
        />
      </View>
      
      <View style={styles.resultCount}>
        <Text style={styles.resultCountText}>Tổng {filteredData.length} bài đọc</Text>
      </View>

      {/* Content List */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {filteredData.length > 0 ? (
          filteredData.map(renderReadingCard)
        ) : (
          <View style={styles.emptyState}>
            <HugeiconsIcon icon={File01Icon} size={48} color={colors.light.border} />
            <Text style={styles.emptyStateText}>Không tìm thấy bài đọc nào</Text>
          </View>
        )}
      </ScrollView>

      {/* Modal */}
      <ModalReading
        isVisible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        reading={editingLesson}
        onSave={handleSaveLesson}
        isAdding={isAdding}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.light.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.light.card, borderWidth: 1, borderColor: colors.light.border, borderRadius: 8, paddingHorizontal: 12, height: 40 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: typography.fontSizes.sm, color: colors.light.text, fontFamily: typography.fonts.regular, padding: 0 },
  resultCount: { paddingHorizontal: 16, paddingBottom: 8 },
  resultCountText: { fontSize: typography.fontSizes.xs, color: colors.light.textSecondary },
  
  scrollView: { flex: 1 },
  scrollContent: { padding: 16, gap: 16, paddingTop: 0 },
  
  card: { backgroundColor: colors.light.card, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.light.border, shadowColor: colors.light.black, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  cardTitle: { fontSize: typography.fontSizes.md, fontFamily: typography.fonts.bold, color: colors.light.text, marginBottom: 6, flex: 1 },
  levelBadge: { backgroundColor: colors.light.primary + '20', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start' },
  levelText: { fontSize: typography.fontSizes.xs, fontFamily: typography.fonts.semiBold, color: colors.light.primary },
  
  actionButtons: { flexDirection: 'row', gap: 8 },
  actionButton: { padding: 8, borderRadius: 8 },
  editButton: { backgroundColor: palette.warning + '15' },
  deleteButton: { backgroundColor: palette.error + '15' },
  
  metaInfo: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: typography.fontSizes.xs, color: colors.light.textSecondary },
  
  contentSection: { gap: 12, marginBottom: 16 },
  textContainer: { backgroundColor: colors.light.background, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.light.border + '50' },
  textHeader: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  sectionHeaderTitle: { fontSize: typography.fontSizes.xs, fontFamily: typography.fonts.bold, color: colors.light.text },
  contentText: { fontSize: typography.fontSizes.sm, color: colors.light.text, lineHeight: 20 },
  translationText: { fontSize: typography.fontSizes.sm, color: colors.light.textSecondary, fontStyle: 'italic', lineHeight: 20 },
  
  questionsSection: { borderTopWidth: 1, borderColor: colors.light.border, paddingTop: 12 },
  questionSectionHeader: { marginBottom: 8 },
  questionSectionTitle: { fontSize: typography.fontSizes.sm, fontFamily: typography.fonts.bold, color: colors.light.primary },
  questionItem: { marginBottom: 12 },
  questionText: { fontSize: typography.fontSizes.sm, fontFamily: typography.fonts.semiBold, color: colors.light.text, marginBottom: 4 },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionText: { fontSize: typography.fontSizes.xs, color: colors.light.textSecondary },
  correctOptionText: { color: palette.success, fontFamily: typography.fonts.bold },
  explanationText: { fontSize: typography.fontSizes.xs, color: palette.info, marginTop: 4, fontStyle: 'italic' },

  emptyState: { alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyStateText: { marginTop: 12, fontSize: typography.fontSizes.md, color: colors.light.textSecondary },
});

export default ReadingTab;