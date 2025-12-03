// src/components/LessonDetailTab/ListeningTab.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  TextInput,
  ActivityIndicator
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
import ModalListening from '../Modal/ModalListening';
import { colors, palette } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { listeningService, Listening } from '../../services/listeningService'; 

interface ListeningTabProps {
  lessonId: string; 
}

const ListeningTab: React.FC<ListeningTabProps> = ({
  lessonId, 
}) => {
  const [data, setData] = useState<Listening[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingListening, setEditingListening] = useState<Listening | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // ✅ Audio State
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playingListeningId, setPlayingListeningId] = useState<string | null>(null);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // ✅ Load listening từ API
  const loadListenings = async () => {
    try {
      setLoading(true);
      console.log('📡 Loading listenings for lesson:', lessonId);
      
      const response = await listeningService.getListeningsByLesson(lessonId, {
        search: searchTerm,
        limit: 50
      });
      
      console.log('✅ Response from API:', response.listenings.length);
      setData(response.listenings);
    } catch (error: any) {
      console.error('❌ Error loading listenings:', error);
      Alert.alert('Lỗi', error.message || 'Không thể tải bài nghe');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (lessonId) {
      loadListenings();
    }
  }, [lessonId, searchTerm]);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  // ✅ Format time function
  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // ✅ Playback status update
  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis || 0);
      setIsPlaying(status.isPlaying);
      
      if (status.didJustFinish) {
        setPlayingListeningId(null);
        setSound(null);
        setIsPlaying(false);
        setPosition(0);
        setDuration(0);
      }
    }
  };

  // ✅ Handle play audio
  const handlePlayAudio = async (listening: Listening) => {
    if (!listening.audioUrl || !listening._id) {
      Alert.alert('Thông báo', 'Bài nghe này chưa có file âm thanh');
      return;
    }

    try {
      // Đang phát bài này -> Pause
      if (playingListeningId === listening._id && sound) {
        await sound.pauseAsync();
        setIsPlaying(false);
        return;
      }

      // Đang phát bài khác -> Unload trước
      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: listening.audioUrl },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );

      setSound(newSound);
      setPlayingListeningId(listening._id);
      setIsPlaying(true);

    } catch (error) {
      console.error('Error playing audio', error);
      Alert.alert('Lỗi', 'Không thể phát file âm thanh này');
    }
  };

  // ✅ Handle seek
  const handleSeek = async (value: number) => {
    if (sound) {
      await sound.setPositionAsync(value);
    }
  };

  // ✅ Handle add listening
  const handleAddListening = (): void => {
    setEditingListening(null);
    setIsAdding(true);
    setIsModalOpen(true);
  };

  // ✅ Handle edit listening
  const handleEditListening = (listeningItem: Listening): void => {
    if (playingListeningId === listeningItem._id && sound) {
      sound.stopAsync();
      setPlayingListeningId(null);
      setIsPlaying(false);
    }
    setEditingListening(listeningItem);
    setIsAdding(false);
    setIsModalOpen(true);
  };

  // ✅ Handle delete listening
  const handleDeleteListening = async (listeningId: string): Promise<void> => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa bài nghe này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              if (playingListeningId === listeningId && sound) {
                await sound.stopAsync();
                setPlayingListeningId(null);
                setIsPlaying(false);
              }
              
              await listeningService.deleteListening(listeningId);
              Alert.alert('Thành công', 'Đã xóa bài nghe');
              loadListenings();
            } catch (error: any) {
              Alert.alert('Lỗi', error.message || 'Không thể xóa bài nghe');
            }
          },
        },
      ]
    );
  };

  // ✅ Handle save listening
  const handleSaveListening = async (listeningData: Listening): Promise<void> => {
    try {
      if (isAdding) {
        // ✅ DÙNG API MỚI: Tạo listening cho lesson
        const newListening = await listeningService.createListeningForLesson(
          lessonId,
          listeningData
        );
        Alert.alert('Thành công', 'Đã thêm bài nghe mới');
      } else if (editingListening && editingListening._id) {
        // Update listening (vẫn dùng API cũ)
        await listeningService.updateListening(editingListening._id, listeningData);
        Alert.alert('Thành công', 'Đã cập nhật bài nghe');
      }
      
      // Reload data
      await loadListenings();
      
      // Close modal
      setIsModalOpen(false);
      setEditingListening(null);
      setIsAdding(false);
    } catch (error: any) {
      console.error('Error saving listening:', error);
      Alert.alert('Lỗi', error.message || 'Không thể lưu bài nghe');
    }
  };

  const handleCloseModal = (): void => {
    setIsModalOpen(false);
    setEditingListening(null);
    setIsAdding(false);
  };

  const formatDurationText = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderListeningCard = (listening: Listening): React.ReactElement => {
    const isThisListeningActive = playingListeningId === listening._id;

    return (
      <View key={listening._id} style={styles.listeningCard}>
        {/* Header Card */}
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <Text style={styles.listeningTitle}>{listening.title}</Text>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>{listening.level}</Text>
            </View>
          </View>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() => handleEditListening(listening)}
            >
              <HugeiconsIcon icon={Edit01Icon} size={18} color={palette.warning} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => listening._id && handleDeleteListening(listening._id)}
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
            <Text style={styles.metaText}>{listening.questions?.length || 0} câu hỏi</Text>
          </View>
          <View style={styles.metaItem}>
            <HugeiconsIcon icon={Clock01Icon} size={14} color={colors.light.textSecondary} />
            <Text style={styles.metaText}>{formatDurationText(listening.duration || 0)}</Text>
          </View>
        </View>

        {/* Content Section: Script & Audio */}
        <View style={styles.contentSection}>
          {/* Audio Player Control */}
          {listening.audioUrl ? (
            <View style={[styles.audioPlayer, isThisListeningActive && styles.audioPlayerActive]}>
              {/* Play/Pause Button */}
              <TouchableOpacity 
                style={styles.playButton}
                onPress={() => handlePlayAudio(listening)}
              >
                <HugeiconsIcon 
                  icon={(isThisListeningActive && isPlaying) ? PauseCircleIcon : PlayCircle02Icon} 
                  size={32} 
                  color={isThisListeningActive ? colors.light.primary : palette.primary} 
                />
              </TouchableOpacity>

              {/* Slider - Only show when active */}
              {isThisListeningActive ? (
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
            <Text style={styles.scriptText}>{listening.transcript}</Text>
            {listening.translation && (
              <Text style={styles.translationText}>{listening.translation}</Text>
            )}
          </View>
        </View>

        {/* Questions Section */}
        {listening.questions && listening.questions.length > 0 && (
          <View style={styles.questionsSection}>
            <View style={styles.questionSectionHeader}>
              <Text style={styles.questionSectionTitle}>Câu hỏi & Đáp án:</Text>
            </View>
            
            <View style={styles.questionsList}>
              {listening.questions.map((q, qIndex) => (
                <View key={qIndex} style={styles.questionItem}>
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
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.light.primary} />
        <Text style={styles.loadingText}>Đang tải bài nghe...</Text>
      </View>
    );
  }

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
          onPress={handleAddListening}
          leftIcon={<HugeiconsIcon icon={Add01Icon} size={16} color={colors.light.background} />}
        />
      </View>
      
      <View style={styles.resultCount}>
        <Text style={styles.resultCountText}>Tổng {data.length} bài nghe</Text>
      </View>

      {/* Content List */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {data.length > 0 ? (
          data.map(renderListeningCard)
        ) : (
          <View style={styles.emptyState}>
            <HugeiconsIcon icon={HeadphonesIcon} size={48} color={colors.light.border} />
            <Text style={styles.emptyStateText}>
              {searchTerm ? 'Không tìm thấy kết quả' : 'Chưa có bài nghe nào'}
            </Text>
            <Text style={styles.emptyStateDescription}>
              {searchTerm 
                ? 'Hãy thử tìm kiếm với từ khóa khác'
                : 'Bắt đầu thêm bài nghe đầu tiên'
              }
            </Text>
            {!searchTerm && (
              <Button
                title="Thêm bài nghe đầu tiên"
                variant="primary"
                onPress={handleAddListening}
                size="small"
                leftIcon={<HugeiconsIcon icon={Add01Icon} size={16} color={colors.light.background} />}
              />
            )}
          </View>
        )}
      </ScrollView>

      {/* Modal */}
      <ModalListening
        isVisible={isModalOpen}
        onClose={handleCloseModal}
        listening={editingListening}
        onSave={handleSaveListening}
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
  },
  loadingText: {
    marginTop: 12,
    fontSize: typography.fontSizes.md,
    color: colors.light.textSecondary,
    fontFamily: typography.fonts.regular,
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
  listeningCard: {
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
  listeningTitle: {
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
    gap: 12,
    height: 60,
  },
  audioPlayerActive: {
    backgroundColor: colors.light.card,
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
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateText: {
    marginTop: 12,
    fontSize: typography.fontSizes.md,
    color: colors.light.text,
    fontFamily: typography.fonts.bold,
  },
  emptyStateDescription: {
    fontSize: typography.fontSizes.sm,
    color: colors.light.textSecondary,
    marginTop: 4,
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: typography.fonts.regular,
  },
});

export default ListeningTab;