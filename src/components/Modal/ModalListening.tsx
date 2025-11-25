import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { Audio, AVPlaybackStatus } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';
import Slider from '@react-native-community/slider'; // Import Slider
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  Cancel01Icon,
  Add01Icon,
  Delete02Icon,
  Tick02Icon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  PlayCircle02Icon,
  PauseCircleIcon,
  Upload01Icon
} from '@hugeicons/core-free-icons';

import Button from '../../components/Button/Button';
import { colors, palette } from '../../theme/colors';
import { typography } from '../../theme/typography';

// Types
export interface Question {
  _id: string;
  question: string;
  options: string[];
  answer: number; // Index of correct option (0-3)
  explanation: string;
}

export interface ListeningLesson {
  _id: string;
  title: string;
  audioUrl: string;
  transcript: string;
  translation: string;
  level: string;
  duration: number; // seconds
  questions: Question[];
}

interface ModalListeningProps {
  isVisible: boolean;
  onClose: () => void;
  lesson?: ListeningLesson | null;
  onSave: (lessonData: ListeningLesson) => void;
  isAdding?: boolean;
}

type LessonFormData = Omit<ListeningLesson, '_id'>;

const ModalListening: React.FC<ModalListeningProps> = ({
  isVisible,
  onClose,
  lesson,
  onSave,
  isAdding = false,
}) => {
  const [formData, setFormData] = useState<LessonFormData>({
    title: '',
    audioUrl: '',
    transcript: '',
    translation: '',
    level: 'Sơ cấp 1',
    duration: 0,
    questions: [],
  });

  const [expandedQuestionIndex, setExpandedQuestionIndex] = useState<number | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  // Audio states
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0); // Vị trí hiện tại (ms)
  const [duration, setDuration] = useState(0); // Tổng thời lượng (ms)

  useEffect(() => {
    if (lesson) {
      setFormData({
        title: lesson.title,
        audioUrl: lesson.audioUrl,
        transcript: lesson.transcript,
        translation: lesson.translation,
        level: lesson.level,
        duration: lesson.duration,
        questions: JSON.parse(JSON.stringify(lesson.questions)),
      });
    } else {
      resetForm();
    }
    setErrors({});
    setExpandedQuestionIndex(null);
    
    return () => {
      unloadSound();
    };
  }, [lesson, isVisible]);

  useEffect(() => {
    return () => {
      unloadSound();
    };
  }, []);

  const resetForm = () => {
    setFormData({
      title: '',
      audioUrl: '',
      transcript: '',
      translation: '',
      level: 'Sơ cấp 1',
      duration: 120,
      questions: [],
    });
  };

  const unloadSound = async () => {
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
      setIsPlaying(false);
      setPosition(0);
      setDuration(0);
    }
  };

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // --- Logic Audio ---

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled === false) {
        handleFieldChange('audioUrl', result.assets[0].uri);
        await unloadSound();
      }
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể chọn file âm thanh');
      console.error(err);
    }
  };

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis || 0);
      setIsPlaying(status.isPlaying);
      
      if (status.didJustFinish) {
        setIsPlaying(false);
        setPosition(0);
        // Tự động replay hoặc stop
        // sound?.setPositionAsync(0); 
      }
    }
  };

  const handlePlayPause = async () => {
    if (!formData.audioUrl) return;

    try {
      if (sound) {
        if (isPlaying) {
          await sound.pauseAsync();
        } else {
          await sound.playAsync();
        }
      } else {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: formData.audioUrl },
          { shouldPlay: true },
          onPlaybackStatusUpdate // Callback cập nhật progress
        );
        setSound(newSound);
      }
    } catch (error) {
      console.error('Error playing sound:', error);
      Alert.alert('Lỗi', 'Không thể phát file này (URL lỗi hoặc định dạng không hỗ trợ)');
    }
  };

  const handleSeek = async (value: number) => {
    if (sound) {
      await sound.setPositionAsync(value);
    }
  };

  // --- Logic Form & Questions (Giữ nguyên) ---
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.title.trim()) newErrors.title = 'Vui lòng nhập tiêu đề';
    if (!formData.transcript.trim()) newErrors.transcript = 'Vui lòng nhập nội dung bài nghe';
    
    const invalidQuestion = formData.questions.some(
      q => !q.question.trim() || q.options.some(opt => !opt.trim())
    );
    if (invalidQuestion) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin câu hỏi và các đáp án');
      return false;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (): Promise<void> => {
    if (!validateForm()) return;
    await unloadSound();
    const saveData: ListeningLesson = {
      _id: lesson?._id || Date.now().toString(),
      ...formData,
      duration: Math.floor(duration / 1000) || formData.duration, // Tự động lấy duration từ file audio nếu có
    };
    onSave(saveData);
  };

  const handleClose = async () => {
    await unloadSound();
    onClose();
  };

  const handleFieldChange = <K extends keyof LessonFormData>(
    field: K,
    value: LessonFormData[K]
  ): void => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      _id: Date.now().toString(),
      question: '',
      options: ['', '', '', ''],
      answer: 0,
      explanation: ''
    };
    setFormData(prev => ({ ...prev, questions: [...prev.questions, newQuestion] }));
    setExpandedQuestionIndex(formData.questions.length);
  };

  const removeQuestion = (index: number) => {
    const newQuestions = formData.questions.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, questions: newQuestions }));
    setExpandedQuestionIndex(null);
  };

  const updateQuestion = (index: number, field: keyof Question, value: any) => {
    const newQuestions = [...formData.questions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setFormData(prev => ({ ...prev, questions: newQuestions }));
  };

  const updateOption = (qIndex: number, optIndex: number, value: string) => {
    const newQuestions = [...formData.questions];
    newQuestions[qIndex].options[optIndex] = value;
    setFormData(prev => ({ ...prev, questions: newQuestions }));
  };

  const toggleExpandQuestion = (index: number) => {
    setExpandedQuestionIndex(expandedQuestionIndex === index ? null : index);
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {isAdding ? 'Thêm bài nghe mới' : 'Sửa bài nghe'}
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <HugeiconsIcon icon={Cancel01Icon} size={24} color={colors.light.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Thông tin chung */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Thông tin chung</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Tiêu đề <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={[styles.input, errors.title && styles.inputError]}
                  value={formData.title}
                  onChangeText={(text) => handleFieldChange('title', text)}
                  placeholder="VD: Bài nghe sơ cấp 1 - Chào hỏi"
                  placeholderTextColor={colors.light.textSecondary}
                />
                {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.flex1]}>
                  <Text style={styles.label}>Cấp độ</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.level}
                    onChangeText={(text) => handleFieldChange('level', text)}
                    placeholder="VD: Sơ cấp 1"
                  />
                </View>
              </View>

              {/* Phần Audio Upload & Player với Slider */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Audio File</Text>
                <View style={styles.audioControlContainer}>
                  {/* Dòng Input URL + Upload Button */}
                  <View style={styles.audioInputRow}>
                     <TextInput
                      style={[styles.input, styles.flex1, styles.audioUrlInput]}
                      value={formData.audioUrl}
                      onChangeText={(text) => handleFieldChange('audioUrl', text)}
                      placeholder="Chọn file hoặc nhập URL..."
                      placeholderTextColor={colors.light.textSecondary}
                    />
                    <TouchableOpacity 
                      style={styles.uploadButton} 
                      onPress={handlePickDocument}
                    >
                      <HugeiconsIcon icon={Upload01Icon} size={20} color={colors.light.primary} />
                    </TouchableOpacity>
                  </View>

                  {/* Player Preview - Giao diện ----o----- */}
                  {formData.audioUrl ? (
                    <View style={styles.playerContainer}>
                      <TouchableOpacity 
                        style={styles.playButton}
                        onPress={handlePlayPause}
                      >
                         <HugeiconsIcon 
                            icon={isPlaying ? PauseCircleIcon : PlayCircle02Icon} 
                            size={32} 
                            color={colors.light.primary} 
                          />
                      </TouchableOpacity>
                      
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
                          <Text style={styles.timeText}>{formatTime(position)}</Text>
                          <Text style={styles.timeText}>{formatTime(duration)}</Text>
                        </View>
                      </View>
                    </View>
                  ) : null}
                </View>
              </View>
            </View>

            {/* Script & Dịch */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Nội dung bài nghe</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Script (Tiếng Hàn) <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={[styles.textArea, errors.transcript && styles.inputError]}
                  value={formData.transcript}
                  onChangeText={(text) => handleFieldChange('transcript', text)}
                  multiline
                  numberOfLines={4}
                  placeholder="Nhập nội dung bài nghe tiếng Hàn..."
                />
                {errors.transcript && <Text style={styles.errorText}>{errors.transcript}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Dịch (Tiếng Việt)</Text>
                <TextInput
                  style={styles.textArea}
                  value={formData.translation}
                  onChangeText={(text) => handleFieldChange('translation', text)}
                  multiline
                  numberOfLines={4}
                  placeholder="Nhập bản dịch tiếng Việt..."
                />
              </View>
            </View>

            {/* Danh sách câu hỏi */}
            <View style={styles.section}>
              <View style={styles.questionsHeader}>
                <Text style={styles.sectionTitle}>Câu hỏi ({formData.questions.length})</Text>
                <TouchableOpacity onPress={addQuestion} style={styles.addButton}>
                  <HugeiconsIcon icon={Add01Icon} size={16} color={colors.light.primary} />
                  <Text style={styles.addButtonText}>Thêm câu hỏi</Text>
                </TouchableOpacity>
              </View>

              {formData.questions.map((q, index) => (
                <View key={q._id || index} style={styles.questionCard}>
                  <TouchableOpacity 
                    style={styles.questionHeader} 
                    onPress={() => toggleExpandQuestion(index)}
                  >
                    <Text style={styles.questionTitle} numberOfLines={1}>
                      {index + 1}. {q.question || '(Chưa nhập nội dung)'}
                    </Text>
                    <HugeiconsIcon 
                      icon={expandedQuestionIndex === index ? ArrowUp01Icon : ArrowDown01Icon} 
                      size={20} 
                      color={colors.light.textSecondary} 
                    />
                  </TouchableOpacity>

                  {expandedQuestionIndex === index && (
                    <View style={styles.questionBody}>
                      <View style={styles.inputGroup}>
                        <Text style={styles.label}>Câu hỏi:</Text>
                        <TextInput
                          style={styles.input}
                          value={q.question}
                          onChangeText={(text) => updateQuestion(index, 'question', text)}
                          placeholder="Nhập câu hỏi..."
                        />
                      </View>

                      <Text style={styles.label}>Đáp án (Chọn đáp án đúng):</Text>
                      {q.options.map((opt, optIndex) => (
                        <View key={optIndex} style={styles.optionRow}>
                          <TouchableOpacity 
                            style={[styles.radioBox, q.answer === optIndex && styles.radioSelected]}
                            onPress={() => updateQuestion(index, 'answer', optIndex)}
                          >
                            {q.answer === optIndex && (
                              <HugeiconsIcon icon={Tick02Icon} size={14} color="white" />
                            )}
                          </TouchableOpacity>
                          <TextInput
                            style={[styles.input, styles.flex1]}
                            value={opt}
                            onChangeText={(text) => updateOption(index, optIndex, text)}
                            placeholder={`Đáp án ${String.fromCharCode(65 + optIndex)}`}
                          />
                        </View>
                      ))}

                      <View style={[styles.inputGroup, { marginTop: 12 }]}>
                        <Text style={styles.label}>Giải thích:</Text>
                        <TextInput
                          style={styles.textAreaSmall}
                          value={q.explanation}
                          onChangeText={(text) => updateQuestion(index, 'explanation', text)}
                          placeholder="Giải thích vì sao đúng..."
                          multiline
                        />
                      </View>

                      <TouchableOpacity 
                        style={styles.deleteQuestionButton}
                        onPress={() => removeQuestion(index)}
                      >
                        <HugeiconsIcon icon={Delete02Icon} size={16} color={palette.error} />
                        <Text style={styles.deleteQuestionText}>Xóa câu hỏi này</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.modalFooter}>
            <Button
              title="Hủy"
              variant="primary"
              onPress={handleClose}
            />
            <Button
              title={isAdding ? 'Thêm mới' : 'Cập nhật'}
              variant="primary"
              onPress={handleSave}
              size='small'
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    backgroundColor: colors.light.background,
    borderRadius: 12,
    width: '100%',
    height: '90%',
    shadowColor: colors.light.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  modalTitle: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fonts.bold,
    color: colors.light.text,
  },
  closeButton: { padding: 4 },
  modalContent: { padding: 16 },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: typography.fontSizes.md,
    fontFamily: typography.fonts.bold,
    color: colors.light.primary,
    marginBottom: 12,
  },
  inputGroup: { marginBottom: 16 },
  row: { flexDirection: 'row', gap: 12 },
  flex1: { flex: 1 },
  label: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fonts.semiBold,
    color: colors.light.text,
    marginBottom: 8,
  },
  required: { color: palette.error },
  input: {
    borderWidth: 1,
    borderColor: colors.light.border,
    borderRadius: 8,
    padding: 12,
    fontSize: typography.fontSizes.md,
    fontFamily: typography.fonts.regular,
    color: colors.light.text,
    backgroundColor: colors.light.card,
  },
  inputError: { borderColor: palette.error },
  errorText: {
    fontSize: typography.fontSizes.xs,
    color: palette.error,
    marginTop: 4,
  },
  textArea: {
    borderWidth: 1,
    borderColor: colors.light.border,
    borderRadius: 8,
    padding: 12,
    fontSize: typography.fontSizes.md,
    fontFamily: typography.fonts.regular,
    color: colors.light.text,
    backgroundColor: colors.light.card,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  textAreaSmall: {
    borderWidth: 1,
    borderColor: colors.light.border,
    borderRadius: 8,
    padding: 12,
    fontSize: typography.fontSizes.md,
    color: colors.light.text,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  // Audio Styles
  audioControlContainer: {
    gap: 12,
  },
  audioInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  audioUrlInput: {
    backgroundColor: colors.light.background,
  },
  uploadButton: {
    width: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.light.primary + '15',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.light.primary + '30',
  },
  // New Player Styles
  playerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.light.card,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.light.border,
    gap: 12,
  },
  playButton: {
    padding: 4,
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
    paddingHorizontal: 4,
    marginTop: -8, // Kéo text lên gần slider hơn
  },
  timeText: {
    fontSize: 10,
    color: colors.light.textSecondary,
    fontFamily: typography.fonts.regular,
  },
  // Question styles
  questionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 4,
  },
  addButtonText: {
    fontSize: typography.fontSizes.sm,
    color: colors.light.primary,
    fontFamily: typography.fonts.semiBold,
  },
  questionCard: {
    backgroundColor: colors.light.card,
    borderWidth: 1,
    borderColor: colors.light.border,
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.light.background,
  },
  questionTitle: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fonts.semiBold,
    color: colors.light.text,
    flex: 1,
    marginRight: 8,
  },
  questionBody: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: colors.light.border,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  radioBox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.light.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    backgroundColor: palette.success,
    borderColor: palette.success,
  },
  deleteQuestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
    padding: 8,
    backgroundColor: palette.error + '10',
    borderRadius: 6,
  },
  deleteQuestionText: {
    color: palette.error,
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fonts.regular,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.light.border,
    gap: 12,
  },
});

export default ModalListening;