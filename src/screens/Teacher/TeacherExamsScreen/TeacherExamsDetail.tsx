import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Audio } from 'expo-av';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  ArrowLeft01Icon,
  Add01Icon,
  Edit01Icon,
  Delete02Icon,
  HeadphonesIcon,
  BookOpen01Icon,
  PencilIcon,
  Clock01Icon,
  StarIcon,
  PlayCircle02Icon,
  PauseCircleIcon,
  Note01Icon,
  Search01Icon,
  LicenseDraftIcon,
  TranslateIcon,
  File01Icon,
  HelpCircleIcon,
  InformationCircleIcon,
  CheckmarkCircle02Icon,
  PenTool03Icon,
  ClipboardIcon,
} from '@hugeicons/core-free-icons';

import Button from '../../../components/Button/Button';
import ModalListening from '../../../components/Modal/ModalListening';
import ModalReading from '../../../components/Modal/ModalReading';
import ModalWriting from '../../../components/Modal/ModalWriting';
import { colors, palette } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { useExam } from '../../../hooks/useExam';
import { 
  Exam, 
  SectionType, 
  ListeningQuestionData, 
  ReadingQuestionData, 
  WritingQuestionData,
  QuestionOption
} from '../../../services/examService';

type TeacherStackParamList = {
  TeacherMain: undefined;
  LessonDetail: { lessonId: string };
  ExamDetail: { examId: string };
};
type ExamDetailRouteProp = RouteProp<TeacherStackParamList, 'ExamDetail'>;

// Component Audio Player cho phần Listening
const SimpleAudioPlayer = ({ 
  uri, 
  isActive, 
  isPlaying, 
  onPlay, 
  onPause, 
  position, 
  duration 
}: { 
  uri: string;
  isActive: boolean;
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  position: number;
  duration: number;
}) => {
  const formatTime = (millis: number) => {
    if (!millis || millis < 0) return '0:00';
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <View style={[styles.audioPlayer, isActive && styles.audioPlayerActive]}>
      <TouchableOpacity 
        style={styles.playButton}
        onPress={isPlaying ? onPause : onPlay}
        disabled={!uri}
      >
        <HugeiconsIcon 
          icon={isPlaying ? PauseCircleIcon : PlayCircle02Icon} 
          size={32} 
          color={isActive ? colors.light.primary : (uri ? palette.primary : colors.light.textSecondary)} 
        />
      </TouchableOpacity>

      <View style={styles.sliderContainer}>
        <Text style={styles.timeText}>
          {formatTime(position)} / {formatTime(duration)}
        </Text>
        
        {isActive ? (
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { width: `${duration > 0 ? (position / duration) * 100 : 0}%` }
              ]} 
            />
          </View>
        ) : (
          <Text style={styles.audioText}>
            {uri ? 'Ready to play' : 'No audio available'}
          </Text>
        )}
      </View>
    </View>
  );
};

const TeacherExamsDetail: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<TeacherStackParamList>>();
  const route = useRoute<ExamDetailRouteProp>();
  const { examId } = route.params;

  const [exam, setExam] = useState<Exam | null>(null);
  const [selectedSection, setSelectedSection] = useState<SectionType>('listening');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Audio State với useRef để tránh re-render
  const soundRef = useRef<Audio.Sound | null>(null);
  const [playingLessonId, setPlayingLessonId] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  // Modal State
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    type: SectionType | '';
    data: any;
  }>({
    isOpen: false,
    mode: 'add',
    type: '',
    data: null,
  });

  const { 
    loading, 
    fetchExamDetail, 
    addQuestion, 
    updateQuestion, 
    deleteQuestion,
    togglePremium 
  } = useExam();

  // --- EFFECTS ---
  useEffect(() => {
    loadExamDetail();

    // Cleanup khi component unmount
    return () => {
      unloadSound();
    };
  }, [examId]);

  // Cleanup khi component unmount
  useEffect(() => {
    return () => {
      unloadSound();
    };
  }, []);

  const loadExamDetail = async () => {
    // Dừng nhạc khi tải lại trang
    await unloadSound();
    
    setIsLoading(true);
    try {
      const data = await fetchExamDetail(examId);
      setExam(data);
    } catch (error) {
      console.error('Error loading exam detail:', error);
      Alert.alert('Lỗi', 'Không thể tải chi tiết đề thi');
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  // --- AUDIO HANDLERS ---
  const unloadSound = async () => {
    if (soundRef.current) {
      try {
        console.log('🔄 Unloading sound');
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      } catch (error) {
        console.error('Error unloading sound:', error);
      } finally {
        setPlayingLessonId(null);
        setIsPlaying(false);
        setPosition(0);
        setDuration(0);
      }
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis || 0);
      
      if (status.didJustFinish) {
        console.log('✅ Playback finished');
        setPlayingLessonId(null);
        setIsPlaying(false);
        setPosition(0);
      }
    }
  };

  const handlePlayAudio = async (lesson: ListeningQuestionData) => {
    console.log('🎵 Attempting to play audio:', lesson.audioUrl);
    
    if (!lesson.audioUrl) {
      Alert.alert('Thông báo', 'Bài học này chưa có file âm thanh');
      return;
    }

    // Kiểm tra URL hợp lệ
    if (!lesson.audioUrl.startsWith('http')) {
      Alert.alert('Lỗi', 'URL audio không hợp lệ. URL phải bắt đầu bằng http:// hoặc https://');
      return;
    }

    try {
      // Nếu đang phát bài này, pause
      if (playingLessonId === lesson.id) {
        console.log('⏸️ Pausing current audio');
        await handlePauseAudio();
        return;
      }

      // Nếu có sound đang phát, dừng nó trước
      await unloadSound();

      // Thiết lập Audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      console.log('▶️ Creating new sound object');
      const { sound } = await Audio.Sound.createAsync(
        { uri: lesson.audioUrl },
        {
          shouldPlay: true,
          isLooping: false,
          isMuted: false,
          volume: 1.0,
          rate: 1.0,
        },
        onPlaybackStatusUpdate
      );

      soundRef.current = sound;
      setPlayingLessonId(lesson.id);
      setIsPlaying(true);
      console.log('✅ Sound created and playing successfully');

    } catch (error: any) {
      console.error('❌ Error playing audio:', error);
      
      let errorMessage = 'Không thể phát file âm thanh này';
      
      if (error.message.includes('Network request failed')) {
        errorMessage = 'Không thể kết nối đến file audio. Vui lòng kiểm tra kết nối mạng.';
      } else if (error.message.includes('Unsupported')) {
        errorMessage = 'Định dạng file audio không được hỗ trợ. Vui lòng sử dụng file MP3 hoặc M4A.';
      } else if (error.message.includes('404')) {
        errorMessage = 'Không tìm thấy file audio tại URL này.';
      }
      
      Alert.alert('Lỗi', errorMessage);
      
      // Reset state
      setPlayingLessonId(null);
      setIsPlaying(false);
    }
  };

  const handlePauseAudio = async () => {
    if (soundRef.current) {
      try {
        console.log('⏸️ Pausing audio');
        await soundRef.current.pauseAsync();
        setIsPlaying(false);
      } catch (error) {
        console.error('Error pausing audio:', error);
      }
    }
  };

  // --- MODAL HANDLERS ---
  const openModal = (type: SectionType, mode: 'add' | 'edit' = 'add', data: any = null) => {
    setModalState({ isOpen: true, mode, type, data });
  };

  const closeModal = () => {
    setModalState({ ...modalState, isOpen: false });
  };

  const handleSaveData = async (data: any) => {
    if (!exam) return;

    try {
      if (modalState.mode === 'add') {
        // Tạo một bản sao của data để xử lý
        const payload = { ...data };
        
        // Xóa trường id hoặc _id nếu nó là chuỗi rỗng
        if (payload._id === '') delete payload._id;
        if (payload.id === '') delete payload.id;
        // Thậm chí xóa luôn cho chắc chắn vì đây là thao tác THÊM MỚI
        delete payload._id;
        delete payload.id;

        const newQuestion = await addQuestion(exam._id, {
          section: selectedSection,
          ...payload, // Gửi payload đã làm sạch
        });
        setExam(newQuestion);
        // --------------------
      } else {
        // Update existing question
        const updatedExam = await updateQuestion(
          exam._id,
          data.id || data._id, // Đảm bảo lấy đúng ID để update
          {
            ...data,
            section: selectedSection,
          }
        );
        setExam(updatedExam);
      }
      closeModal();
    } catch (error) {
      console.error('Error saving question:', error);
      Alert.alert('Lỗi', 'Không thể lưu câu hỏi. Vui lòng kiểm tra lại dữ liệu.');
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    Alert.alert('Xóa', 'Bạn có chắc muốn xóa câu hỏi này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          if (!exam) return;
          try {
            const updatedExam = await deleteQuestion(exam._id, itemId);
            setExam(updatedExam);
          } catch (error) {
            console.error('Error deleting question:', error);
          }
        }
      }
    ]);
  };

  const handleTogglePremium = async () => {
    if (!exam) return;
    
    try {
      const updatedExam = await togglePremium(exam._id);
      setExam(updatedExam);
      Alert.alert('Thành công', 'Đã cập nhật trạng thái premium');
    } catch (error) {
      console.error('Error toggling premium:', error);
    }
  };

  // --- RENDER HELPERS ---
  const getSections = () => {
    if (!exam) return [];
    const base = [
      { id: 'listening' as SectionType, label: 'NGHE', icon: HeadphonesIcon, count: exam.questions.listening.length },
      { id: 'reading' as SectionType, label: 'ĐỌC', icon: BookOpen01Icon, count: exam.questions.reading.length }
    ];
    
    if (exam.examType === 'topik2' || exam.examType === 'esp') {
      base.push({ 
        id: 'writing' as SectionType, 
        label: 'VIẾT', 
        icon: PencilIcon, 
        count: exam.questions.writing.length 
      });
    }
    return base;
  };

  const getLevelBadgeStyle = (level: string) => {
    if (level.includes('Sơ cấp')) return { backgroundColor: colors.light.success + '20' };
    if (level.includes('Trung cấp')) return { backgroundColor: colors.light.warning + '20' };
    return { backgroundColor: colors.light.error + '20' };
  };

  const filteredQuestions = () => {
    if (!exam) return [];
    const questions = exam.questions[selectedSection];
    return questions.filter((item: any) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.level.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.transcript && item.transcript.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.content && item.content.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.prompt && item.prompt.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  // --- RENDER COMPONENTS ---
  const renderListeningCard = (item: ListeningQuestionData, index: number) => {
    const isActive = playingLessonId === item.id;
    
    return (
      <View key={item.id} style={styles.questionCard}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.indexText}>#{index + 1}</Text>
            <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
          </View>
          <View style={[styles.levelBadge, getLevelBadgeStyle(item.level)]}>
            <Text style={styles.levelText}>{item.level}</Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          {/* Audio Player */}
          {item.audioUrl && (
            <SimpleAudioPlayer
              uri={item.audioUrl}
              isActive={isActive}
              isPlaying={isPlaying && isActive}
              onPlay={() => handlePlayAudio(item)}
              onPause={handlePauseAudio}
              position={position}
              duration={duration}
            />
          )}

          {/* Script */}
          {item.transcript && (
            <View style={styles.scriptBox}>
              <View style={styles.scriptHeader}>
                <HugeiconsIcon icon={LicenseDraftIcon} size={14} color={colors.light.text} />
                <Text style={styles.scriptTitle}>Script:</Text>
              </View>
              <Text style={styles.scriptText}>{item.transcript}</Text>
              {item.translation && (
                <Text style={styles.translationText}>{item.translation}</Text>
              )}
            </View>
          )}

          {/* Questions */}
          {item.questions && item.questions.length > 0 && (
            <View style={styles.subQuestions}>
              <Text style={styles.subQHeader}>Câu hỏi ({item.questions.length}):</Text>
              {item.questions.map((q: QuestionOption, idx: number) => (
                <View key={q._id} style={styles.subQItem}>
                  <Text style={styles.subQText}>{idx + 1}. {q.question}</Text>
                  <View style={styles.optionsContainer}>
                    {q.options.map((opt: string, optIdx: number) => {
                      const isAnswer = optIdx === q.answer;
                      return (
                        <View key={optIdx} style={styles.optionRow}>
                          <Text style={[styles.optionText, isAnswer && styles.correctOptionText]}>
                            {String.fromCharCode(65 + optIdx)}. {opt}
                          </Text>
                          {isAnswer && <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} color={palette.success} />}
                        </View>
                      );
                    })}
                  </View>
                  {q.explanation && (
                    <View style={styles.explanationBox}>
                      <Text style={styles.explanationText}>💡 {q.explanation}</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity 
            style={[styles.iconBtn, styles.editBtn]} 
            onPress={() => openModal('listening', 'edit', item)}
            disabled={loading}
          >
            <HugeiconsIcon icon={Edit01Icon} size={18} color={palette.warning} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.iconBtn, styles.deleteBtn]} 
            onPress={() => handleDeleteItem(item.id)}
            disabled={loading}
          >
            <HugeiconsIcon icon={Delete02Icon} size={18} color={palette.error} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderReadingCard = (item: ReadingQuestionData, index: number) => {
    return (
      <View key={item.id} style={styles.questionCard}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.indexText}>#{index + 1}</Text>
            <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
          </View>
          <View style={[styles.levelBadge, getLevelBadgeStyle(item.level)]}>
            <Text style={styles.levelText}>{item.level}</Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          {/* Content */}
          {item.content && (
            <View style={styles.textContainer}>
              <View style={styles.textHeader}>
                <HugeiconsIcon icon={LicenseDraftIcon} size={14} color={colors.light.text} />
                <Text style={styles.sectionHeaderTitle}>Nội dung:</Text>
              </View>
              <Text style={styles.contentText}>{item.content}</Text>
            </View>
          )}

          {/* Translation */}
          {item.translation && (
            <View style={[styles.textContainer, { backgroundColor: colors.light.primary + '05', borderColor: colors.light.primary + '20' }]}>
              <View style={styles.textHeader}>
                <HugeiconsIcon icon={TranslateIcon} size={14} color={colors.light.primary} />
                <Text style={[styles.sectionHeaderTitle, { color: colors.light.primary }]}>Dịch:</Text>
              </View>
              <Text style={styles.translationText}>{item.translation}</Text>
            </View>
          )}

          {/* Questions */}
          {item.questions && item.questions.length > 0 && (
            <View style={styles.subQuestions}>
              <Text style={styles.subQHeader}>Câu hỏi ({item.questions.length}):</Text>
              {item.questions.map((q: QuestionOption, idx: number) => (
                <View key={q._id} style={styles.subQItem}>
                  <Text style={styles.subQText}>{idx + 1}. {q.question}</Text>
                  <View style={styles.optionsContainer}>
                    {q.options.map((opt: string, optIdx: number) => {
                      const isAnswer = optIdx === q.answer;
                      return (
                        <View key={optIdx} style={styles.optionRow}>
                          <Text style={[styles.optionText, isAnswer && styles.correctOptionText]}>
                            {String.fromCharCode(65 + optIdx)}. {opt}
                          </Text>
                          {isAnswer && <HugeiconsIcon icon={CheckmarkCircle02Icon} size={16} color={palette.success} />}
                        </View>
                      );
                    })}
                  </View>
                  {q.explanation && (
                    <View style={styles.explanationBox}>
                      <Text style={styles.explanationText}>💡 {q.explanation}</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity 
            style={[styles.iconBtn, styles.editBtn]} 
            onPress={() => openModal('reading', 'edit', item)}
            disabled={loading}
          >
            <HugeiconsIcon icon={Edit01Icon} size={18} color={palette.warning} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.iconBtn, styles.deleteBtn]} 
            onPress={() => handleDeleteItem(item.id)}
            disabled={loading}
          >
            <HugeiconsIcon icon={Delete02Icon} size={18} color={palette.error} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderWritingCard = (item: WritingQuestionData, index: number) => {
    return (
      <View key={item.id} style={styles.questionCard}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.indexText}>#{index + 1}</Text>
            <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
          </View>
          <View style={[styles.levelBadge, getLevelBadgeStyle(item.level)]}>
            <Text style={styles.levelText}>{item.level}</Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          {/* Prompt */}
          {item.prompt && (
            <View style={styles.textContainer}>
              <View style={styles.textHeader}>
                <HugeiconsIcon icon={PenTool03Icon} size={14} color={colors.light.text} />
                <Text style={styles.sectionHeaderTitle}>Đề bài:</Text>
              </View>
              <Text style={styles.contentText}>{item.prompt}</Text>
            </View>
          )}

          {/* Instruction */}
          {item.instruction && (
            <View style={styles.textContainer}>
              <View style={styles.textHeader}>
                <HugeiconsIcon icon={InformationCircleIcon} size={14} color={colors.light.text} />
                <Text style={styles.sectionHeaderTitle}>Hướng dẫn:</Text>
              </View>
              <Text style={styles.contentText}>{item.instruction}</Text>
            </View>
          )}

          {/* Word Hints */}
          {item.wordHint && item.wordHint.length > 0 && (
            <View style={styles.hintContainer}>
              <Text style={styles.hintLabel}>Từ vựng gợi ý:</Text>
              <View style={styles.chipContainer}>
                {item.wordHint.map((w: string, i: number) => (
                  <View key={i} style={styles.chip}>
                    <Text style={styles.chipText}>{w}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Grammar Hints */}
          {item.grammarHint && item.grammarHint.length > 0 && (
            <View style={styles.hintContainer}>
              <Text style={styles.hintLabel}>Ngữ pháp gợi ý:</Text>
              <View style={styles.chipContainer}>
                {item.grammarHint.map((g: string, i: number) => (
                  <View key={i} style={[styles.chip, { backgroundColor: palette.purple + '15' }]}>
                    <Text style={[styles.chipText, { color: palette.purple }]}>{g}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Word Count */}
          {item.minWords && (
            <View style={styles.infoItem}>
              <HugeiconsIcon icon={File01Icon} size={14} color={colors.light.textSecondary} />
              <Text style={styles.infoText}>Số từ tối thiểu: {item.minWords} từ</Text>
            </View>
          )}

          {/* Sample Answer */}
          {item.sampleAnswer && (
            <View style={[styles.textContainer, { backgroundColor: palette.info + '05', borderColor: palette.info + '20' }]}>
              <View style={styles.textHeader}>
                <HugeiconsIcon icon={ClipboardIcon} size={14} color={palette.info} />
                <Text style={[styles.sectionHeaderTitle, { color: palette.info }]}>Bài viết mẫu:</Text>
              </View>
              <Text style={styles.contentText}>{item.sampleAnswer}</Text>
              {item.sampleTranslation && (
                <Text style={styles.translationText}>{item.sampleTranslation}</Text>
              )}
            </View>
          )}
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity 
            style={[styles.iconBtn, styles.editBtn]} 
            onPress={() => openModal('writing', 'edit', item)}
            disabled={loading}
          >
            <HugeiconsIcon icon={Edit01Icon} size={18} color={palette.warning} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.iconBtn, styles.deleteBtn]} 
            onPress={() => handleDeleteItem(item.id)}
            disabled={loading}
          >
            <HugeiconsIcon icon={Delete02Icon} size={18} color={palette.error} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderQuestionCard = (item: any, index: number) => {
    switch (selectedSection) {
      case 'listening':
        return renderListeningCard(item as ListeningQuestionData, index);
      case 'reading':
        return renderReadingCard(item as ReadingQuestionData, index);
      case 'writing':
        return renderWritingCard(item as WritingQuestionData, index);
      default:
        return null;
    }
  };

  // --- MAIN RENDER ---
  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={palette.primary} />
      </View>
    );
  }

  if (!exam) return null;

  const sections = getSections();
  const currentQuestions = filteredQuestions();
  const totalQuestions = exam.listening + exam.reading + exam.writing;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          // Dừng nhạc khi quay lại
          unloadSound();
          navigation.goBack();
        }} style={styles.backBtn}>
          <HugeiconsIcon icon={ArrowLeft01Icon} size={24} color={colors.light.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle} numberOfLines={1}>{exam.title}</Text>
          <View style={styles.headerBadges}>
            {exam.isPremium && (
              <TouchableOpacity 
                style={styles.premiumBadge}
                onPress={handleTogglePremium}
                disabled={loading}
              >
                <HugeiconsIcon icon={StarIcon} size={12} color={palette.warning} variant="solid" />
                <Text style={styles.premiumText}>Premium</Text>
              </TouchableOpacity>
            )}
            <Text style={styles.examTypeBadge}>{exam.examType}</Text>
          </View>
        </View>
        <Button 
          title="Lưu" 
          size="small" 
          variant="primary" 
          onPress={() => Alert.alert('Thông báo', 'Dữ liệu đã được tự động lưu')} 
          disabled={loading}
        />
      </View>

      {/* Stats Info */}
      <View style={styles.statsCard}>
        <View style={styles.statRow}>
          <View style={styles.statCol}>
            <Text style={styles.statLabel}>Loại đề</Text>
            <Text style={styles.statValue}>{exam.examType}</Text>
          </View>
          <View style={styles.statCol}>
            <Text style={styles.statLabel}>Thời gian</Text>
            <View style={{flexDirection:'row', alignItems:'center', gap:4}}>
               <HugeiconsIcon icon={Clock01Icon} size={14} color={colors.light.text} />
               <Text style={styles.statValue}>{exam.duration}p</Text>
            </View>
          </View>
          <View style={styles.statCol}>
            <Text style={styles.statLabel}>Tổng câu</Text>
            <Text style={styles.statValue}>{totalQuestions}</Text>
          </View>
        </View>
        <View style={styles.statRow}>
          <View style={styles.statCol}>
            <Text style={styles.statLabel}>Nghe</Text>
            <View style={{flexDirection:'row', alignItems:'center', gap:4}}>
              <HugeiconsIcon icon={HeadphonesIcon} size={14} color={colors.light.text} />
              <Text style={styles.statValue}>{exam.listening}</Text>
            </View>
          </View>
          <View style={styles.statCol}>
            <Text style={styles.statLabel}>Đọc</Text>
            <View style={{flexDirection:'row', alignItems:'center', gap:4}}>
              <HugeiconsIcon icon={BookOpen01Icon} size={14} color={colors.light.text} />
              <Text style={styles.statValue}>{exam.reading}</Text>
            </View>
          </View>
          <View style={styles.statCol}>
            <Text style={styles.statLabel}>Viết</Text>
            <View style={{flexDirection:'row', alignItems:'center', gap:4}}>
              <HugeiconsIcon icon={PencilIcon} size={14} color={colors.light.text} />
              <Text style={styles.statValue}>{exam.writing}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {sections.map((section) => (
          <TouchableOpacity
            key={section.id}
            style={[styles.tab, selectedSection === section.id && styles.activeTab]}
            onPress={() => setSelectedSection(section.id)}
            disabled={loading}
          >
            <HugeiconsIcon 
              icon={section.icon} 
              size={18} 
              color={selectedSection === section.id ? colors.light.primary : colors.light.textSecondary} 
            />
            <Text style={[styles.tabText, selectedSection === section.id && styles.activeTabText]}>
              {section.label}
            </Text>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{section.count}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search and Add Button */}
      <View style={styles.actionHeader}>
        <View style={styles.searchContainer}>
          <HugeiconsIcon icon={Search01Icon} size={20} color={colors.light.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={`Tìm kiếm trong phần ${selectedSection}...`}
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholderTextColor={colors.light.textSecondary}
            editable={!loading}
          />
        </View>
        
        <Button 
          title="Thêm câu hỏi" 
          size="small" 
          variant="primary" 
          onPress={() => openModal(selectedSection, 'add')}
          leftIcon={<HugeiconsIcon icon={Add01Icon} size={16} color="white" />}
          disabled={loading}
        />
      </View>

      {/* Content List */}
      <View style={styles.listHeader}>
        <Text style={styles.sectionTitle}>
          Danh sách câu hỏi ({currentQuestions.length})
        </Text>
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {currentQuestions.length > 0 ? (
          currentQuestions.map((item: any, index: number) => renderQuestionCard(item, index))
        ) : (
          <View style={styles.emptyState}>
            <HugeiconsIcon icon={Note01Icon} size={48} color={colors.light.border} />
            <Text style={styles.emptyText}>Chưa có nội dung nào trong phần này</Text>
            <Button 
              title="Thêm câu hỏi đầu tiên" 
              variant="secondary" 
              onPress={() => openModal(selectedSection, 'add')}
              style={{marginTop: 12}} 
              disabled={loading}
            />
          </View>
        )}
      </ScrollView>

      {/* Modals */}
      {modalState.type === 'listening' && (
        <ModalListening
          isVisible={modalState.isOpen}
          onClose={closeModal}
          listening={modalState.data}
          onSave={handleSaveData}
          isAdding={modalState.mode === 'add'}
        />
      )}
      {modalState.type === 'reading' && (
        <ModalReading
          isVisible={modalState.isOpen}
          onClose={closeModal}
          reading={modalState.data}
          onSave={handleSaveData}
          isAdding={modalState.mode === 'add'}
        />
      )}
      {modalState.type === 'writing' && (
        <ModalWriting
          isVisible={modalState.isOpen}
          onClose={closeModal}
          writing={modalState.data}
          onSave={handleSaveData}
          isAdding={modalState.mode === 'add'}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.light.background, marginBottom: 40 },
  center: { justifyContent: 'center', alignItems: 'center' },
  
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderColor: colors.light.border, gap: 12 },
  backBtn: { padding: 4 },
  headerInfo: { flex: 1 },
  headerTitle: { fontSize: 16, fontFamily: typography.fonts.bold, color: colors.light.text },
  headerBadges: { flexDirection: 'row', gap: 6, marginTop: 2 },
  premiumBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: palette.warning + '20', alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  premiumText: { fontSize: 10, color: palette.warning, fontFamily: typography.fonts.bold },
  examTypeBadge: { fontSize: 10, color: colors.light.primary, backgroundColor: colors.light.primary + '15', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },

  statsCard: { margin: 16, padding: 16, backgroundColor: colors.light.card, borderRadius: 12, borderWidth: 1, borderColor: colors.light.border, gap: 12 },
  statRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statCol: { alignItems: 'center', flex: 1 },
  statLabel: { fontSize: 12, color: colors.light.textSecondary, marginBottom: 4 },
  statValue: { fontSize: 16, fontFamily: typography.fonts.bold, color: colors.light.text },

  tabsContainer: { flexDirection: 'row', borderBottomWidth: 1, borderColor: colors.light.border, backgroundColor: colors.light.card },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, gap: 6, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: colors.light.primary },
  tabText: { fontSize: 14, color: colors.light.textSecondary, fontFamily: typography.fonts.regular },
  activeTabText: { color: colors.light.primary, fontFamily: typography.fonts.bold },
  countBadge: { backgroundColor: colors.light.border, paddingHorizontal: 6, borderRadius: 10 },
  countText: { fontSize: 10, color: colors.light.textSecondary },

  actionHeader: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.light.card, borderWidth: 1, borderColor: colors.light.border, borderRadius: 8, paddingHorizontal: 12, height: 40 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: typography.fontSizes.sm, color: colors.light.text, fontFamily: typography.fonts.regular, padding: 0 },

  listHeader: { paddingHorizontal: 16, paddingBottom: 8 },
  sectionTitle: { fontSize: 16, fontFamily: typography.fonts.bold, color: colors.light.text },
  
  content: { flex: 1, paddingHorizontal: 16 },
  
  // Question Card Styles
  questionCard: { backgroundColor: colors.light.card, borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.light.border },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  indexText: { fontSize: 14, fontFamily: typography.fonts.bold, color: colors.light.textSecondary },
  cardTitle: { fontSize: 14, fontFamily: typography.fonts.bold, color: colors.light.text, flex: 1 },
  levelBadge: { backgroundColor: colors.light.primary + '15', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  levelText: { fontSize: 10, color: colors.light.primary, fontFamily: typography.fonts.bold },

  cardContent: { gap: 12 },
  
  // Audio Player
  audioPlayer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: colors.light.primary + '10', 
    padding: 12, 
    borderRadius: 8, 
    gap: 12 
  },
  audioPlayerActive: { 
    backgroundColor: colors.light.card, 
    borderWidth: 1, 
    borderColor: colors.light.primary 
  },
  playButton: { 
    padding: 4 
  },
  sliderContainer: { 
    flex: 1 
  },
  timeText: { 
    fontSize: 12, 
    color: colors.light.textSecondary, 
    fontFamily: typography.fonts.regular,
    marginBottom: 4
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.light.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.light.primary,
  },
  audioText: { 
    fontSize: 12, 
    color: colors.light.textSecondary, 
    fontFamily: typography.fonts.regular 
  },

  // Text Content
  scriptBox: { backgroundColor: colors.light.background, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.light.border + '50' },
  scriptHeader: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  scriptTitle: { fontSize: 12, fontFamily: typography.fonts.bold, color: colors.light.text },
  scriptText: { fontSize: 14, color: colors.light.text, lineHeight: 22 },
  translationText: { fontSize: 13, color: colors.light.textSecondary, fontStyle: 'italic', marginTop: 8, borderTopWidth: 1, borderTopColor: colors.light.border + '50', paddingTop: 8 },

  textContainer: { backgroundColor: colors.light.background, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.light.border + '50' },
  textHeader: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  sectionHeaderTitle: { fontSize: 12, fontFamily: typography.fonts.bold, color: colors.light.text },
  contentText: { fontSize: 14, color: colors.light.text, lineHeight: 22 },

  // Hints
  hintContainer: { marginTop: 8 },
  hintLabel: { fontSize: 12, fontFamily: typography.fonts.bold, color: colors.light.text, marginBottom: 4 },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { backgroundColor: palette.warning + '15', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  chipText: { fontSize: 10, color: palette.warning, fontFamily: typography.fonts.semiBold },

  // Info Item
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  infoText: { fontSize: 12, color: colors.light.textSecondary },

  // Sub Questions
  subQuestions: { marginTop: 8 },
  subQHeader: { fontSize: 12, fontFamily: typography.fonts.bold, color: colors.light.text, marginBottom: 8 },
  subQItem: { backgroundColor: colors.light.background, borderWidth: 1, borderColor: colors.light.border, borderRadius: 8, padding: 12, marginBottom: 8 },
  subQText: { fontSize: 13, fontFamily: typography.fonts.regular, marginBottom: 6 },
  optionsContainer: { gap: 4 },
  optionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  optionText: { fontSize: 12, color: colors.light.textSecondary, flex: 1 },
  correctOptionText: { color: palette.success, fontFamily: typography.fonts.bold },
  explanationBox: { marginTop: 8, padding: 8, backgroundColor: palette.info + '10', borderRadius: 6, borderWidth: 1, borderColor: palette.info + '30' },
  explanationText: { fontSize: 11, color: palette.info },

  // Actions
  cardActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 12, borderTopWidth: 1, borderColor: colors.light.border + '50', paddingTop: 12 },
  iconBtn: { padding: 6, borderRadius: 6, backgroundColor: colors.light.background, borderWidth: 1, borderColor: colors.light.border },
  editBtn: { backgroundColor: palette.warning + '10', borderColor: palette.warning + '30' },
  deleteBtn: { backgroundColor: palette.error + '10', borderColor: palette.error + '30' },

  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { marginTop: 12, color: colors.light.textSecondary },
});

export default TeacherExamsDetail;