import React, { useState, useEffect } from 'react';
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
  UserIcon,
} from '@hugeicons/core-free-icons';

import Button from '../../../components/Button/Button';
import ModalListening from '../../../components/Modal/ModalListening';
import ModalReading from '../../../components/Modal/ModalReading';
import ModalWriting from '../../../components/Modal/ModalWriting';
import { colors, palette } from '../../../theme/colors';
import { typography } from '../../../theme/typography';

// --- TYPES ---
type ExamType = 'TOPIK I' | 'TOPIK II' | 'ESP';
type SectionType = 'listening' | 'reading' | 'writing';

interface QuestionOption {
  _id: string;
  question: string;
  options: string[];
  answer: number;
  explanation?: string;
}

interface QuestionBase {
  id: number;
  type: SectionType;
  title: string;
  level: string;
  questions?: QuestionOption[];
}

interface ListeningQuestion extends QuestionBase {
  audioUrl?: string;
  transcript?: string;
  translation?: string;
  duration?: number;
}

interface ReadingQuestion extends QuestionBase {
  content?: string;
  translation?: string;
}

interface WritingQuestion extends QuestionBase {
  prompt?: string;
  instruction?: string;
  wordHint?: string[];
  grammarHint?: string[];
  minWords?: number;
  sampleAnswer?: string;
  sampleTranslation?: string;
}

type QuestionItem = ListeningQuestion & ReadingQuestion & WritingQuestion;

interface ExamDetail {
  id: number;
  name: string;
  type: ExamType;
  isPremium: boolean;
  duration: number;
  listening: number;
  reading: number;
  writing: number;
  questions: {
    listening: ListeningQuestion[];
    reading: ReadingQuestion[];
    writing: WritingQuestion[];
  };
}

type TeacherStackParamList = {
  TeacherMain: undefined;
  LessonDetail: { lessonId: number };
  ExamDetail: { examId: number };
};
type ExamDetailRouteProp = RouteProp<TeacherStackParamList, 'ExamDetail'>;

// --- MOCK DATA ---
const mockExamData: Record<number, ExamDetail> = {
  1: {
    id: 1,
    name: '제1회 한국어능력시험',
    type: 'TOPIK I',
    isPremium: false,
    duration: 100,
    listening: 30,
    reading: 40,
    writing: 0,
    questions: {
      listening: [
        {
          id: 1,
          type: 'listening',
          title: 'Bài nghe chào hỏi',
          audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
          transcript: '안녕하세요. 저는 민수입니다. 만나서 반갑습니다.',
          translation: 'Xin chào. Tôi là Minsu. Rất vui được gặp bạn.',
          level: 'Sơ cấp 1',
          duration: 120,
          questions: [
            {
              _id: 'q1',
              question: 'Người nói tên là gì?',
              options: ['민수', '영희', '철수', '지현'],
              answer: 0,
              explanation: 'Trong câu "저는 민수입니다" có nghĩa là "Tôi là Minsu"'
            }
          ]
        }
      ],
      reading: [
        {
          id: 101,
          type: 'reading',
          title: 'Bài đọc về gia đình',
          content: '저는 가족이 4명입니다. 아버지, 어머니, 누나, 그리고 저입니다.\n아버지는 회사원입니다. 어머니는 선생님입니다.',
          translation: 'Gia đình tôi có 4 người. Bố, mẹ, chị gái và tôi.\nBố tôi là nhân viên công ty. Mẹ tôi là giáo viên.',
          level: 'Sơ cấp 1',
          questions: [
            {
              _id: 'q2',
              question: 'Gia đình có mấy người?',
              options: ['3 người', '4 người', '5 người', '6 người'],
              answer: 1,
              explanation: 'Câu "가족이 4명입니다" có nghĩa là "Gia đình có 4 người"'
            }
          ]
        }
      ],
      writing: []
    }
  },
  10: {
    id: 10,
    name: '제1회 한국어능력시험',
    type: 'TOPIK II',
    isPremium: false,
    duration: 180,
    listening: 50,
    reading: 50,
    writing: 4,
    questions: {
      listening: [],
      reading: [],
      writing: [
        {
          id: 201,
          type: 'writing',
          title: '사회 문제에 대한 의견 쓰기',
          prompt: '최근 증가하고 있는 1인 가구에 대해 어떻게 생각합니까?',
          instruction: '1인 가구의 증가 원인과 이에 대한 여러분의 생각을 200자 이상으로 쓰세요.',
          wordHint: ['1인 가구', '증가', '원인', '사회 현상'],
          grammarHint: ['-에 대해', '-ㄴ/은/는 이유', '-다고 생각하다'],
          minWords: 200,
          level: 'Trung cấp',
          sampleAnswer: '최근 1인 가구가 증가하는 이유는...',
          sampleTranslation: 'Lý do số hộ gia đình một người gần đây tăng lên là...'
        }
      ]
    }
  }
};

// Component Audio Player cho phần Listening
const SimpleAudioPlayer = ({ uri, isActive, isPlaying, onPlay, onPause, position, duration, onSeek }: any) => {
  const formatTime = (millis: number) => {
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
      >
        <HugeiconsIcon 
          icon={isPlaying ? PauseCircleIcon : PlayCircle02Icon} 
          size={32} 
          color={isActive ? colors.light.primary : palette.primary} 
        />
      </TouchableOpacity>

      {isActive ? (
        <View style={styles.sliderContainer}>
          <Text style={styles.timeTextActive}>{formatTime(position)} / {formatTime(duration)}</Text>
        </View>
      ) : (
        <View style={{ justifyContent: 'center' }}>
          <Text style={styles.audioText}>Audio</Text>
        </View>
      )}
    </View>
  );
};

const TeacherExamsDetail: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<TeacherStackParamList>>();
  const route = useRoute<ExamDetailRouteProp>();
  const { examId } = route.params;

  const [exam, setExam] = useState<ExamDetail | null>(null);
  const [selectedSection, setSelectedSection] = useState<SectionType>('listening');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Audio State
  const [sound, setSound] = useState<Audio.Sound | null>(null);
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

  // --- EFFECTS ---
  useEffect(() => {
    const timer = setTimeout(() => {
      const data = mockExamData[examId];
      if (data) {
        setExam(data);
      } else {
        Alert.alert('Xin lỗi', 'Hiện tại đề thi đang không có sẵn. Vui lòng thử lại sau.', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [examId]);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  // --- AUDIO HANDLERS ---
  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis || 0);
      
      if (status.didJustFinish) {
        setPlayingLessonId(null);
        setIsPlaying(false);
        setPosition(0);
      }
    }
  };

  const handlePlayAudio = async (lesson: ListeningQuestion) => {
    if (!lesson.audioUrl) {
      Alert.alert('Thông báo', 'Bài học này chưa có file âm thanh');
      return;
    }

    try {
      if (playingLessonId === lesson.id && sound) {
        await sound.pauseAsync();
        setIsPlaying(false);
        return;
      }

      if (sound) {
        await sound.unloadAsync();
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: lesson.audioUrl },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );

      setSound(newSound);
      setPlayingLessonId(lesson.id);
      setIsPlaying(true);

    } catch (error) {
      Alert.alert('Lỗi', 'Không thể phát file âm thanh này');
    }
  };

  const handlePauseAudio = async () => {
    if (sound) {
      await sound.pauseAsync();
      setIsPlaying(false);
    }
  };

  // --- MODAL HANDLERS ---
  const openModal = (type: SectionType, mode: 'add' | 'edit' = 'add', data: any = null) => {
    setModalState({ isOpen: true, mode, type, data });
  };

  const closeModal = () => {
    setModalState({ ...modalState, isOpen: false });
  };

  const handleSaveData = (data: any) => {
    if (!exam) return;

    if (modalState.mode === 'add') {
      const newFromModal = { 
        ...data, 
        id: Date.now(),
        type: selectedSection
      };
      
      setExam({
        ...exam,
        questions: {
          ...exam.questions,
          [selectedSection]: [...exam.questions[selectedSection], newFromModal]
        }
      });
    } else {
      setExam({
        ...exam,
        questions: {
          ...exam.questions,
          [selectedSection]: exam.questions[selectedSection].map((item: any) => 
            item.id === data.id ? data : item
          )
        }
      });
    }
    closeModal();
  };

  const handleDeleteItem = (itemId: number) => {
    Alert.alert('Xóa', 'Bạn có chắc muốn xóa câu hỏi này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: () => {
          if (!exam) return;
          setExam({
            ...exam,
            questions: {
              ...exam.questions,
              [selectedSection]: exam.questions[selectedSection].filter((q: any) => q.id !== itemId)
            }
          });
        }
      }
    ]);
  };

  // --- RENDER HELPERS ---
  const getSections = () => {
    if (!exam) return [];
    const base = [
      { id: 'listening' as SectionType, label: 'NGHE', icon: HeadphonesIcon, count: exam.questions.listening.length },
      { id: 'reading' as SectionType, label: 'ĐỌC', icon: BookOpen01Icon, count: exam.questions.reading.length }
    ];
    
    if (exam.type === 'TOPIK II' || exam.type === 'ESP') {
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
  const renderListeningCard = (item: ListeningQuestion, index: number) => {
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

          {/* Questions */}
          {item.questions && item.questions.length > 0 && (
            <View style={styles.subQuestions}>
              <Text style={styles.subQHeader}>Câu hỏi ({item.questions.length}):</Text>
              {item.questions.map((q, idx) => (
                <View key={q._id} style={styles.subQItem}>
                  <Text style={styles.subQText}>{idx + 1}. {q.question}</Text>
                  <View style={styles.optionsContainer}>
                    {q.options.map((opt, optIdx) => {
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
          <TouchableOpacity style={[styles.iconBtn, styles.editBtn]} onPress={() => openModal('listening', 'edit', item)}>
            <HugeiconsIcon icon={Edit01Icon} size={18} color={palette.warning} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconBtn, styles.deleteBtn]} onPress={() => handleDeleteItem(item.id)}>
            <HugeiconsIcon icon={Delete02Icon} size={18} color={palette.error} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderReadingCard = (item: ReadingQuestion, index: number) => {
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
          <View style={styles.textContainer}>
            <View style={styles.textHeader}>
              <HugeiconsIcon icon={LicenseDraftIcon} size={14} color={colors.light.text} />
              <Text style={styles.sectionHeaderTitle}>Nội dung:</Text>
            </View>
            <Text style={styles.contentText}>{item.content}</Text>
          </View>

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
              {item.questions.map((q, idx) => (
                <View key={q._id} style={styles.subQItem}>
                  <Text style={styles.subQText}>{idx + 1}. {q.question}</Text>
                  <View style={styles.optionsContainer}>
                    {q.options.map((opt, optIdx) => {
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
          <TouchableOpacity style={[styles.iconBtn, styles.editBtn]} onPress={() => openModal('reading', 'edit', item)}>
            <HugeiconsIcon icon={Edit01Icon} size={18} color={palette.warning} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconBtn, styles.deleteBtn]} onPress={() => handleDeleteItem(item.id)}>
            <HugeiconsIcon icon={Delete02Icon} size={18} color={palette.error} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderWritingCard = (item: WritingQuestion, index: number) => {
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
          <View style={styles.textContainer}>
            <View style={styles.textHeader}>
              <HugeiconsIcon icon={PenTool03Icon} size={14} color={colors.light.text} />
              <Text style={styles.sectionHeaderTitle}>Đề bài:</Text>
            </View>
            <Text style={styles.contentText}>{item.prompt}</Text>
          </View>

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
                {item.wordHint.map((w, i) => (
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
                {item.grammarHint.map((g, i) => (
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
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity style={[styles.iconBtn, styles.editBtn]} onPress={() => openModal('writing', 'edit', item)}>
            <HugeiconsIcon icon={Edit01Icon} size={18} color={palette.warning} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconBtn, styles.deleteBtn]} onPress={() => handleDeleteItem(item.id)}>
            <HugeiconsIcon icon={Delete02Icon} size={18} color={palette.error} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderQuestionCard = (item: QuestionItem, index: number) => {
    switch (selectedSection) {
      case 'listening':
        return renderListeningCard(item as ListeningQuestion, index);
      case 'reading':
        return renderReadingCard(item as ReadingQuestion, index);
      case 'writing':
        return renderWritingCard(item as WritingQuestion, index);
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
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <HugeiconsIcon icon={ArrowLeft01Icon} size={24} color={colors.light.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle} numberOfLines={1}>{exam.name}</Text>
          {exam.isPremium && (
            <View style={styles.premiumBadge}>
              <HugeiconsIcon icon={StarIcon} size={12} color={palette.warning} variant="solid" />
              <Text style={styles.premiumText}>Premium</Text>
            </View>
          )}
        </View>
        <Button 
          title="Lưu" 
          size="small" 
          variant="primary" 
          onPress={() => Alert.alert('Thành công', 'Đã lưu thay đổi')} 
        />
      </View>

      {/* Stats Info */}
      <View style={styles.statsCard}>
        <View style={styles.statRow}>
          <View style={styles.statCol}>
            <Text style={styles.statLabel}>Loại đề</Text>
            <Text style={styles.statValue}>{exam.type}</Text>
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
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {sections.map((section) => (
          <TouchableOpacity
            key={section.id}
            style={[styles.tab, selectedSection === section.id && styles.activeTab]}
            onPress={() => setSelectedSection(section.id)}
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
          />
        </View>
        
        <Button 
          title="Thêm câu hỏi" 
          size="small" 
          variant="primary" 
          onPress={() => openModal(selectedSection, 'add')}
          leftIcon={<HugeiconsIcon icon={Add01Icon} size={16} color="white" />}
        />
      </View>

      {/* Content List */}
      <View style={styles.listHeader}>
        <Text style={styles.sectionTitle}>
          Danh sách câu hỏi ({currentQuestions.length})
        </Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }}>
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
            />
          </View>
        )}
      </ScrollView>

      {/* Modals */}
      {modalState.type === 'listening' && (
        <ModalListening
          isVisible={modalState.isOpen}
          onClose={closeModal}
          lesson={modalState.data}
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
  premiumBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: palette.warning + '20', alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 2 },
  premiumText: { fontSize: 10, color: palette.warning, fontFamily: typography.fonts.bold },

  statsCard: { margin: 16, padding: 16, backgroundColor: colors.light.card, borderRadius: 12, borderWidth: 1, borderColor: colors.light.border },
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
  audioPlayer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.light.primary + '10', padding: 12, borderRadius: 8, gap: 12 },
  audioPlayerActive: { backgroundColor: colors.light.card, borderWidth: 1, borderColor: colors.light.primary },
  playButton: { padding: 4 },
  sliderContainer: { flex: 1 },
  timeTextActive: { fontSize: 12, color: colors.light.textSecondary, fontFamily: typography.fonts.regular },
  audioText: { fontSize: 14, color: colors.light.primary, fontFamily: typography.fonts.semiBold },

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