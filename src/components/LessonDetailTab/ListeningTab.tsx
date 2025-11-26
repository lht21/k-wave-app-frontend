import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  TextInput
} from 'react-native';
import { Audio, AVPlaybackStatus } from 'expo-av'; 
import Slider from '@react-native-community/slider'; 
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  Add01Icon,
  Edit01Icon,
  Delete02Icon,
  HeadphonesIcon,
  HelpCircleIcon,
  Clock01Icon,
  PlayCircle02Icon,
  PauseCircleIcon,
  LicenseDraftIcon,
  Search01Icon
} from '@hugeicons/core-free-icons';

import Button from '../../components/Button/Button';
import ModalListening, { ListeningLesson } from '../Modal/ModalListening';
import { colors, palette } from '../../theme/colors';
import { typography } from '../../theme/typography';

const initialListeningData: ListeningLesson[] = [
  {
    _id: '1',
    title: 'Bài nghe sơ cấp 1 - Chào hỏi',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', 
    transcript: '안녕하세요. 저는 민수입니다. 만나서 반갑습니다. 오늘 날씨가 좋네요. 공원에 갈까요?',
    translation: 'Xin chào. Tôi là Minsu. Rất vui được gặp bạn. Hôm nay thời tiết đẹp nhỉ. Chúng ta đi công viên nhé?',
    level: 'Sơ cấp 1',
    duration: 150,
    questions: [
      {
        _id: 'q1',
        question: 'Người nói tên là gì?',
        options: ['민수', '영희', '철수', '지현'],
        answer: 0,
        explanation: 'Trong câu "저는 민수입니다" có nghĩa là "Tôi là Minsu"'
      },
      {
        _id: 'q2', 
        question: 'Thời tiết hôm nay thế nào?',
        options: ['Xấu', 'Rất tốt', 'Mưa', 'Lạnh'],
        answer: 1,
        explanation: 'Câu "오늘 날씨가 좋네요" có nghĩa là "Hôm nay thời tiết đẹp nhỉ"'
      }
    ]
  },
  {
    _id: '2',
    title: 'Bài nghe sơ cấp 2 - Mua sắm',
    audioUrl: '',
    transcript: '이거 얼마예요? 만원이에요. 너무 비싸요. 조금 깎아 주세요.',
    translation: 'Cái này bao nhiêu tiền? Một nghìn won. Đắt quá. Giảm giá cho tôi một chút đi.',
    level: 'Sơ cấp 1',
    duration: 120,
    questions: [
      {
        _id: 'q4',
        question: 'Giá ban đầu là bao nhiêu?',
        options: ['5,000 won', '8,000 won', '10,000 won', '12,000 won'],
        answer: 2,
        explanation: 'Câu "만원이에요" có nghĩa là "Một nghìn won" (10,000 won)'
      }
    ]
  }
];

const ListeningTab: React.FC = () => {
  const [data, setData] = useState<ListeningLesson[]>(initialListeningData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<ListeningLesson | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Audio State
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playingLessonId, setPlayingLessonId] = useState<string | null>(null);
  const [position, setPosition] = useState(0); // Vị trí hiện tại (ms)
  const [duration, setDuration] = useState(0); // Tổng thời lượng (ms)

  // Cleanup sound on unmount
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis || 0);
      
      if (status.didJustFinish) {
        setPlayingLessonId(null);
        setSound(null);
        setPosition(0);
        setDuration(0);
      }
    }
  };

  // Logic Play/Pause Audio
  const handlePlayAudio = async (lesson: ListeningLesson) => {
    if (!lesson.audioUrl) {
      Alert.alert('Thông báo', 'Bài học này chưa có file âm thanh');
      return;
    }

    try {
      // Trường hợp 1: Đang phát bài này -> Tắt (Pause/Stop)
      if (playingLessonId === lesson._id && sound) {
        await sound.pauseAsync(); // Hoặc stopAsync tùy nhu cầu
        setIsPlayingState(false); // Helper logic check below
        return;
      }

      // Trường hợp 2: Đang phát bài khác hoặc chưa phát -> Phát mới
      if (sound) {
        await sound.unloadAsync(); // Tắt bài cũ trước
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: lesson.audioUrl },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );

      setSound(newSound);
      setPlayingLessonId(lesson._id);
      setIsPlayingState(true);

    } catch (error) {
      console.error('Error playing audio', error);
      Alert.alert('Lỗi', 'Không thể phát file âm thanh này');
    }
  };

  // Resume playing current sound
  const handleResumeAudio = async () => {
    if (sound) {
      await sound.playAsync();
      setIsPlayingState(true);
    }
  };

  // Pause playing current sound
  const handlePauseAudio = async () => {
    if (sound) {
      await sound.pauseAsync();
      setIsPlayingState(false);
    }
  };

  const handleSeek = async (value: number) => {
    if (sound) {
      await sound.setPositionAsync(value);
    }
  };

  // Helper để track trạng thái Play/Pause thực tế (vì playingLessonId chỉ biết là "đang kích hoạt" chứ k biết đang pause hay play)
  const [isPlayingState, setIsPlayingState] = useState(false);


  // Lọc dữ liệu
  const filteredData = data.filter(lesson =>
    lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lesson.level.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lesson.transcript.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditLesson = (lesson: ListeningLesson): void => {
    if (playingLessonId === lesson._id && sound) {
       sound.stopAsync();
       setPlayingLessonId(null);
    }
    setEditingLesson(lesson);
    setIsAdding(false);
    setIsModalOpen(true);
  };

  const handleAddLesson = (): void => {
    setEditingLesson(null);
    setIsAdding(true);
    setIsModalOpen(true);
  };

  const handleDeleteLesson = (lessonId: string): void => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa bài nghe này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            if (playingLessonId === lessonId && sound) {
              sound.stopAsync();
              setPlayingLessonId(null);
            }
            setData(prev => prev.filter(item => item._id !== lessonId));
          },
        },
      ]
    );
  };

  const handleSaveLesson = (lessonData: ListeningLesson): void => {
    if (isAdding) {
      setData(prev => [...prev, lessonData]);
    } else {
      setData(prev =>
        prev.map(item => item._id === lessonData._id ? lessonData : item)
      );
    }
    setIsModalOpen(false);
    setEditingLesson(null);
    setIsAdding(false);
  };

  const handleCloseModal = (): void => {
    setIsModalOpen(false);
    setEditingLesson(null);
    setIsAdding(false);
  };

  const formatDurationText = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderLessonCard = (lesson: ListeningLesson): React.ReactElement => {
    const isThisLessonActive = playingLessonId === lesson._id;

    return (
      <View key={lesson._id} style={styles.lessonCard}>
        {/* Header Card */}
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <Text style={styles.lessonTitle}>{lesson.title}</Text>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>{lesson.level}</Text>
            </View>
          </View>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() => handleEditLesson(lesson)}
            >
              <HugeiconsIcon icon={Edit01Icon} size={18} color={palette.warning} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDeleteLesson(lesson._id)}
            >
              <HugeiconsIcon icon={Delete02Icon} size={18} color={palette.error} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Meta Info */}
        <View style={styles.metaInfo}>
          <View style={styles.metaItem}>
            <HugeiconsIcon icon={HeadphonesIcon} size={14} color={colors.light.textSecondary} />
            <Text style={styles.metaText}>Bài nghe</Text>
          </View>
          <View style={styles.metaItem}>
            <HugeiconsIcon icon={HelpCircleIcon} size={14} color={colors.light.textSecondary} />
            <Text style={styles.metaText}>{lesson.questions.length} câu hỏi</Text>
          </View>
          <View style={styles.metaItem}>
            <HugeiconsIcon icon={Clock01Icon} size={14} color={colors.light.textSecondary} />
            <Text style={styles.metaText}>{formatDurationText(lesson.duration)}</Text>
          </View>
        </View>

        {/* Content Section: Script & Audio */}
        <View style={styles.contentSection}>
          {/* Audio Player Control */}
          {lesson.audioUrl ? (
            <View style={[styles.audioPlayer, isThisLessonActive && styles.audioPlayerActive]}>
              {/* Nút Play/Pause */}
              <TouchableOpacity 
                style={styles.playButton}
                onPress={() => {
                  if (isThisLessonActive) {
                    if (isPlayingState) handlePauseAudio();
                    else handleResumeAudio();
                  } else {
                    handlePlayAudio(lesson);
                  }
                }}
              >
                <HugeiconsIcon 
                  icon={(isThisLessonActive && isPlayingState) ? PauseCircleIcon : PlayCircle02Icon} 
                  size={32} 
                  color={isThisLessonActive ? colors.light.primary : palette.primary} 
                />
              </TouchableOpacity>

              {/* Slider Area - Chỉ hiện khi đang active */}
              {isThisLessonActive ? (
                <View style={styles.sliderContainer}>
                  <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={duration}
                    value={position}
                    onSlidingComplete={handleSeek}
                    minimumTrackTintColor={colors.light.primary}
                    maximumTrackTintColor={colors.light.border}
                    thumbTintColor={colors.light.primary}
                  />
                  <View style={styles.timeRow}>
                    <Text style={styles.timeTextActive}>{formatTime(position)}</Text>
                    <Text style={styles.timeTextActive}>{formatTime(duration)}</Text>
                  </View>
                </View>
              ) : (
                // Nếu chưa play thì hiện text đơn giản
                <View style={{ justifyContent: 'center' }}>
                  <Text style={styles.audioText}>Audio</Text>
                </View>
              )}
            </View>
          ) : null}

          {/* Script */}
          <View style={styles.scriptBox}>
            <View style={styles.scriptHeader}>
              <HugeiconsIcon icon={LicenseDraftIcon} size={14} color={colors.light.text} />
              <Text style={styles.scriptTitle}>Script:</Text>
            </View>
            <Text style={styles.scriptText}>{lesson.transcript}</Text>
            {lesson.translation && (
              <Text style={styles.translationText}>{lesson.translation}</Text>
            )}
          </View>
        </View>

        {/* Questions Section */}
        <View style={styles.questionsSection}>
          <View style={styles.questionSectionHeader}>
            <Text style={styles.questionSectionTitle}>Câu hỏi & Đáp án:</Text>
          </View>
          
          {lesson.questions.length > 0 ? (
            <View style={styles.questionsList}>
              {lesson.questions.map((q, qIndex) => (
                <View key={q._id} style={styles.questionItem}>
                  <Text style={styles.questionText}>{qIndex + 1}. {q.question}</Text>
                  
                  <View style={styles.optionsList}>
                    {q.options.map((option, optIndex) => (
                      <View 
                        key={optIndex} 
                        style={[
                          styles.optionItem,
                          optIndex === q.answer && styles.correctOption
                        ]}
                      >
                        <Text style={[
                          styles.optionText,
                          optIndex === q.answer && styles.correctOptionText
                        ]}>
                          {String.fromCharCode(65 + optIndex)}. {option}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {q.explanation && (
                    <View style={styles.explanationBox}>
                      <Text style={styles.explanationLabel}>Giải thích:</Text>
                      <Text style={styles.explanationText}>{q.explanation}</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>Chưa có câu hỏi nào</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header with Search and Add Button */}
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <HugeiconsIcon icon={Search01Icon} size={20} color={colors.light.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm bài nghe..."
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
        <Text style={styles.resultCountText}>Tổng {filteredData.length} bài nghe</Text>
      </View>

      {/* Content List */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filteredData.length > 0 ? (
          filteredData.map(renderLessonCard)
        ) : (
          <View style={styles.emptyState}>
            <HugeiconsIcon icon={HeadphonesIcon} size={48} color={colors.light.border} />
            <Text style={styles.emptyStateText}>Không tìm thấy bài nghe nào</Text>
          </View>
        )}
      </ScrollView>

      {/* Modal */}
      <ModalListening
        isVisible={isModalOpen}
        onClose={handleCloseModal}
        lesson={editingLesson}
        onSave={handleSaveLesson}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    backgroundColor: colors.light.background,
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
  },
  searchIcon: { marginRight: 8 },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSizes.sm,
    color: colors.light.text,
    fontFamily: typography.fonts.regular,
    padding: 0,
  },
  resultCount: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  resultCountText: {
    fontSize: typography.fontSizes.xs,
    color: colors.light.textSecondary,
    fontFamily: typography.fonts.regular,
  },
  scrollView: { flex: 1 },
  scrollContent: {
    padding: 16,
    gap: 16,
    paddingTop: 0,
  },
  lessonCard: {
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
  titleContainer: { flex: 1, marginRight: 8 },
  lessonTitle: {
    fontSize: typography.fontSizes.md,
    fontFamily: typography.fonts.bold,
    color: colors.light.text,
    marginBottom: 6,
  },
  levelBadge: {
    backgroundColor: colors.light.primary + '20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  levelText: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fonts.semiBold,
    color: colors.light.primary,
  },
  actionButtons: { flexDirection: 'row', gap: 8 },
  actionButton: {
    padding: 8,
    borderRadius: 8,
  },
  editButton: { backgroundColor: palette.warning + '15' },
  deleteButton: { backgroundColor: palette.error + '15' },
  
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
    fontFamily: typography.fonts.regular,
  },
  contentSection: { gap: 12, marginBottom: 16 },
  
  // Audio Player Styles
  audioPlayer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.light.primary + '10',
    padding: 8,
    borderRadius: 8,
    gap: 12, // Tăng gap
    height: 60, // Cố định chiều cao để slider hiển thị đẹp
  },
  audioPlayerActive: {
    backgroundColor: colors.light.card, // Đổi màu nền khi active cho sạch
    borderWidth: 1,
    borderColor: colors.light.primary,
  },
  playButton: { 
    padding: 4,
  },
  audioText: {
    fontSize: typography.fontSizes.sm,
    color: colors.light.primary,
    fontFamily: typography.fonts.semiBold,
  },
  sliderContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -8,
    paddingHorizontal: 4,
  },
  timeTextActive: {
    fontSize: 10,
    color: colors.light.textSecondary,
    fontFamily: typography.fonts.regular,
  },

  scriptBox: {
    backgroundColor: colors.light.background,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.light.border + '50',
  },
  scriptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  scriptTitle: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fonts.bold,
    color: colors.light.text,
  },
  scriptText: {
    fontSize: typography.fontSizes.sm,
    color: colors.light.text,
    fontFamily: typography.fonts.regular,
    lineHeight: 20,
  },
  translationText: {
    fontSize: typography.fontSizes.sm,
    color: colors.light.textSecondary,
    fontFamily: typography.fonts.regular,
    marginTop: 4,
    fontStyle: 'italic',
  },
  
  // Question List Styles
  questionsSection: {
    borderTopWidth: 1,
    borderTopColor: colors.light.border,
    paddingTop: 12,
  },
  questionSectionHeader: { marginBottom: 8 },
  questionSectionTitle: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fonts.bold,
    color: colors.light.primary,
  },
  questionsList: { gap: 12 },
  questionItem: {
    backgroundColor: colors.light.background,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  questionText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fonts.semiBold,
    color: colors.light.text,
    marginBottom: 8,
  },
  optionsList: { gap: 6 },
  optionItem: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: colors.light.card,
    borderWidth: 1,
    borderColor: colors.light.border + '50',
  },
  correctOption: {
    backgroundColor: palette.success + '15',
    borderColor: palette.success + '30',
  },
  optionText: {
    fontSize: typography.fontSizes.xs,
    color: colors.light.textSecondary,
    fontFamily: typography.fonts.regular,
  },
  correctOptionText: {
    color: palette.success,
    fontFamily: typography.fonts.regular,
  },
  explanationBox: {
    marginTop: 8,
    padding: 8,
    backgroundColor: colors.light.primary + '05',
    borderRadius: 6,
  },
  explanationLabel: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fonts.bold,
    color: colors.light.primary,
    marginBottom: 2,
  },
  explanationText: {
    fontSize: typography.fontSizes.xs,
    color: colors.light.text,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: typography.fontSizes.sm,
    color: colors.light.textSecondary,
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: typography.fontSizes.md,
    color: colors.light.textSecondary,
  },
});

export default ListeningTab;