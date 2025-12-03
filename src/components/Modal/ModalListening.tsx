// src/components/Modal/ModalListening.tsx
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
  ActivityIndicator
} from 'react-native';
import { Audio, AVPlaybackStatus } from 'expo-av';
import * as DocumentPicker from 'expo-document-picker';
import Slider from '@react-native-community/slider';
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
  Upload01Icon,
  AlertCircleIcon
} from '@hugeicons/core-free-icons';

import Button from '../../components/Button/Button';
import { colors, palette } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Listening, ListeningQuestion, listeningService } from '../../services/listeningService';

// Types
type ListeningFormData = Omit<Listening, '_id' | 'isActive' | 'playCount' | 'attemptCount' | 'averageScore' | 'successRate'>;

interface ModalListeningProps {
  isVisible: boolean;
  onClose: () => void;
  listening?: Listening | null;
  onSave: (listeningData: Omit<Listening, '_id' | 'isActive' | 'playCount' | 'attemptCount' | 'averageScore' | 'successRate'>) => void;
  isAdding?: boolean;
}

const ModalListening: React.FC<ModalListeningProps> = ({
  isVisible,
  onClose,
  listening,
  onSave,
  isAdding = false,
}) => {
  const [formData, setFormData] = useState<ListeningFormData>({
    title: '',
    audioUrl: '',
    transcript: '',
    translation: '',
    level: 'Sơ cấp 1',
    duration: 60,
    difficulty: 'Trung bình',
    tags: [],
    questions: [],
  });

  const [expandedQuestionIndex, setExpandedQuestionIndex] = useState<number | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  // Audio states
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [uploadingAudio, setUploadingAudio] = useState(false);

  useEffect(() => {
    if (listening && listening._id) {
      setFormData({
        title: listening.title || '',
        audioUrl: listening.audioUrl || '',
        transcript: listening.transcript || '',
        translation: listening.translation || '',
        level: listening.level || 'Sơ cấp 1',
        duration: listening.duration || 60,
        difficulty: listening.difficulty || 'Trung bình',
        tags: listening.tags || [],
        questions: listening.questions || [],
      });
    } else {
      resetForm();
    }
    setErrors({});
    setExpandedQuestionIndex(null);
    
    return () => {
      unloadSound();
    };
  }, [listening, isVisible]);

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
      duration: 60,
      difficulty: 'Trung bình',
      tags: [],
      questions: [],
    });
    setUploadingAudio(false);
  };

  const unloadSound = async () => {
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
      setIsPlaying(false);
      setPosition(0);
      setAudioDuration(0);
    }
  };

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Audio handling - CHỈ LƯU URL SERVER
  const handlePickDocument = async () => {
    try {
      
      setUploadingAudio(true);
      
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled === false) {
        const fileUri = result.assets[0].uri;
        const fileName = result.assets[0].name || `audio_${Date.now()}.mp3`;
        const fileType = result.assets[0].mimeType || 'audio/mpeg';
        
        console.log('📁 File selected, uploading to server...');
        
        try {
          // Tạo FormData
          const formData = new FormData();
          
          // Tạo file object đúng cách cho React Native
          const fileObject = {
            uri: fileUri,
            type: fileType,
            name: fileName,
          };
          
          // Thêm vào FormData - cách đúng trong React Native
          formData.append('audio', fileObject as any);
          
          console.log('📤 Uploading to server...');
          
          // Upload audio lên server - BẮT BUỘC
          const uploadResult = await listeningService.uploadAudio(formData);
          
          console.log('✅ Server response:', uploadResult);
          
          // CHỈ NHẬN URL SERVER (http://...)
          const serverAudioUrl = uploadResult.audioUrl || uploadResult.url;
          
          if (serverAudioUrl && serverAudioUrl.startsWith('http')) {
            handleFieldChange('audioUrl', serverAudioUrl);
            
            // Tự động lấy duration từ file audio
            try {
              const soundObject = new Audio.Sound();
              await soundObject.loadAsync({ uri: fileUri });
              const status = await soundObject.getStatusAsync();
              if (status.isLoaded && status.durationMillis) {
                const durationSeconds = Math.floor(status.durationMillis / 1000);
                handleFieldChange('duration', durationSeconds);
                setAudioDuration(status.durationMillis);
              }
              await soundObject.unloadAsync();
            } catch (durationError) {
              console.log('⚠️ Cannot get duration:', durationError);
            }
            
            Alert.alert('Thành công', 'Đã upload audio lên server thành công!');
          } else {
            throw new Error('Server không trả về URL hợp lệ');
          }
        } catch (uploadError: any) {
          console.error('❌ Upload failed:', uploadError);
          Alert.alert(
            'Upload thất bại', 
            'Không thể upload audio lên server.\n\n' +
            'Vui lòng kiểm tra:\n' +
            '• Server có đang chạy không\n' +
            '• Kết nối mạng\n' +
            '• File có quá lớn (>50MB) không'
          );
          // KHÔNG LƯU LOCAL URI - BÁO LỖI VÀ KHÔNG LÀM GÌ CẢ
          return;
        }
      }
    } catch (err: any) {
      console.error('❌ Document picker error:', err);
      Alert.alert('Lỗi', err.message || 'Không thể chọn file âm thanh');
    } finally {
      setUploadingAudio(false);
    }
  };

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setAudioDuration(status.durationMillis || 0);
      setIsPlaying(status.isPlaying);
      
      if (status.didJustFinish) {
        setIsPlaying(false);
        setPosition(0);
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
          onPlaybackStatusUpdate
        );
        setSound(newSound);
      }
    } catch (error) {
      console.error('Error playing sound:', error);
      Alert.alert('Lỗi', 'Không thể phát file này. URL có thể không hợp lệ hoặc server không truy cập được.');
    }
  };

  const handleSeek = async (value: number) => {
    if (sound) {
      await sound.setPositionAsync(value);
    }
  };

  // Form validation - CHỈ CHẤP NHẬN SERVER URL
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    
    // Required fields
    if (!formData.title.trim()) newErrors.title = 'Vui lòng nhập tiêu đề';
    if (!formData.transcript.trim()) newErrors.transcript = 'Vui lòng nhập nội dung bài nghe';
    if (!formData.audioUrl.trim()) newErrors.audioUrl = 'Vui lòng chọn file âm thanh';
    
    // QUAN TRỌNG: Chỉ chấp nhận server URL
    if (formData.audioUrl) {
      if (formData.audioUrl.startsWith('file://')) {
        Alert.alert(
          'Lỗi',
          'File audio chưa được upload lên server!\n\n' +
          'Vui lòng chọn file và nhấn nút Upload để tải lên server.',
          [{ text: 'OK' }]
        );
        return false;
      }
      
      if (!formData.audioUrl.startsWith('http')) {
        Alert.alert(
          'Lỗi',
          'URL audio không hợp lệ!\nURL phải bắt đầu bằng http:// hoặc https://',
          [{ text: 'OK' }]
        );
        return false;
      }
    }

    // Validate questions
    formData.questions.forEach((q, index) => {
      if (!q.question.trim()) {
        Alert.alert('Lỗi', `Vui lòng nhập nội dung câu hỏi #${index + 1}`);
        return false;
      }
      if (q.options.some(opt => !opt.trim())) {
        Alert.alert('Lỗi', `Vui lòng nhập đầy đủ đáp án cho câu hỏi #${index + 1}`);
        return false;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (): Promise<void> => {
    if (uploadingAudio) {
      Alert.alert('Vui lòng đợi', 'Đang upload audio, vui lòng đợi...');
      return;
    }
    
    if (!validateForm()) return;
    
    await unloadSound();
    
    // Create save data - CHỈ LƯU SERVER URL
    const saveData = {
      title: formData.title.trim(),
      audioUrl: formData.audioUrl, // Đảm bảo đây là server URL
      transcript: formData.transcript.trim(),
      translation: formData.translation?.trim() || '',
      level: formData.level,
      duration: formData.duration,
      difficulty: formData.difficulty,
      tags: formData.tags,
      questions: formData.questions.map(q => ({
        question: q.question.trim(),
        options: q.options.map(opt => opt.trim()),
        answer: q.answer,
        explanation: q.explanation?.trim() || ''
      }))
    };
    
    console.log('💾 Saving with server URL:', saveData.audioUrl);
    onSave(saveData);
  };

  const handleClose = async () => {
    await unloadSound();
    onClose();
  };

  const handleFieldChange = <K extends keyof ListeningFormData>(
    field: K,
    value: ListeningFormData[K]
  ): void => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addQuestion = () => {
    const newQuestion: ListeningQuestion = {
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

  const updateQuestion = (index: number, field: keyof ListeningQuestion, value: any) => {
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

  // Hiển thị trạng thái URL
  const renderAudioUrlStatus = () => {
    if (!formData.audioUrl) return null;
    
    if (formData.audioUrl.startsWith('http')) {
      return (
        <View style={styles.urlStatusContainer}>
          <HugeiconsIcon icon={Tick02Icon} size={14} color={palette.success} />
          <Text style={styles.urlStatusTextSuccess}>
            ✓ Đã upload lên server
          </Text>
        </View>
      );
    } else if (formData.audioUrl.startsWith('file://')) {
      return (
        <View style={[styles.urlStatusContainer, styles.urlStatusError]}>
          <HugeiconsIcon icon={AlertCircleIcon} size={14} color={palette.error} />
          <Text style={styles.urlStatusTextError}>
            ⚠ Chưa upload lên server (chỉ hoạt động trên thiết bị này)
          </Text>
        </View>
      );
    }
    
    return null;
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
            {/* General Info */}
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
                <View style={[styles.inputGroup, styles.flex1]}>
                  <Text style={styles.label}>Độ khó</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.difficulty}
                    onChangeText={(text) => handleFieldChange('difficulty', text)}
                    placeholder="VD: Trung bình"
                  />
                </View>
              </View>

              {/* Audio Upload & Player */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Audio File <Text style={styles.required}>*</Text></Text>
                
                {/* Loading indicator */}
                {uploadingAudio && (
                  <View style={styles.uploadingContainer}>
                    <ActivityIndicator size="small" color={colors.light.primary} />
                    <Text style={styles.uploadingText}>Đang upload audio lên server...</Text>
                  </View>
                )}
                
                {/* Hiển thị trạng thái URL */}
                {renderAudioUrlStatus()}
                
                <View style={styles.audioControlContainer}>
                  {/* URL Input + Upload Button */}
                  <View style={styles.audioInputRow}>
                    <TextInput
                      style={[
                        styles.input, 
                        styles.flex1, 
                        styles.audioUrlInput,
                        formData.audioUrl.startsWith('file://') && styles.inputError
                      ]}
                      value={formData.audioUrl}
                      onChangeText={(text) => handleFieldChange('audioUrl', text)}
                      placeholder="URL audio từ server (http://...)"
                      placeholderTextColor={colors.light.textSecondary}
                      editable={!uploadingAudio}
                    />
                    <TouchableOpacity 
                      style={[
                        styles.uploadButton, 
                        uploadingAudio && styles.uploadButtonDisabled
                      ]} 
                      onPress={handlePickDocument}
                      disabled={uploadingAudio}
                    >
                      <HugeiconsIcon 
                        icon={Upload01Icon} 
                        size={20} 
                        color={uploadingAudio ? colors.light.textSecondary : colors.light.primary} 
                      />
                    </TouchableOpacity>
                  </View>
                  
                  {errors.audioUrl && <Text style={styles.errorText}>{errors.audioUrl}</Text>}

                  {/* Player Preview - CHỈ HIỂN THỊ KHI CÓ SERVER URL */}
                  {formData.audioUrl && formData.audioUrl.startsWith('http') && (
                    <View style={styles.playerContainer}>
                      <TouchableOpacity 
                        style={styles.playButton}
                        onPress={handlePlayPause}
                        disabled={uploadingAudio}
                      >
                        <HugeiconsIcon 
                          icon={isPlaying ? PauseCircleIcon : PlayCircle02Icon} 
                          size={32} 
                          color={uploadingAudio ? colors.light.textSecondary : colors.light.primary} 
                        />
                      </TouchableOpacity>
                      
                      <View style={styles.sliderContainer}>
                        <Slider
                          style={styles.slider}
                          minimumValue={0}
                          maximumValue={audioDuration}
                          value={position}
                          onSlidingComplete={handleSeek}
                          minimumTrackTintColor={uploadingAudio ? colors.light.textSecondary : colors.light.primary}
                          maximumTrackTintColor={colors.light.border}
                          thumbTintColor={uploadingAudio ? colors.light.textSecondary : colors.light.primary}
                          disabled={uploadingAudio}
                        />
                        <View style={styles.timeRow}>
                          <Text style={[styles.timeText, uploadingAudio && styles.timeTextDisabled]}>
                            {formatTime(position)}
                          </Text>
                          <Text style={[styles.timeText, uploadingAudio && styles.timeTextDisabled]}>
                            {formatTime(audioDuration)}
                          </Text>
                        </View>
                      </View>
                    </View>
                  )}
                </View>
              </View>

              {/* Duration */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Thời lượng (giây)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.duration.toString()}
                  onChangeText={(text) => handleFieldChange('duration', parseInt(text) || 0)}
                  keyboardType="numeric"
                  placeholder="VD: 120"
                />
              </View>
            </View>

            {/* Script & Translation */}
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

            {/* Tags */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tags</Text>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Tags (phân cách bằng dấu phẩy)</Text>
                <TextInput
                  style={styles.input}
                  value={formData.tags.join(', ')}
                  onChangeText={(text) => handleFieldChange('tags', text.split(',').map(tag => tag.trim()).filter(tag => tag))}
                  placeholder="VD: chào hỏi, giới thiệu, sơ cấp"
                />
              </View>
            </View>

            {/* Questions */}
            <View style={styles.section}>
              <View style={styles.questionsHeader}>
                <Text style={styles.sectionTitle}>Câu hỏi ({formData.questions.length})</Text>
                <TouchableOpacity onPress={addQuestion} style={styles.addButton}>
                  <HugeiconsIcon icon={Add01Icon} size={16} color={colors.light.primary} />
                  <Text style={styles.addButtonText}>Thêm câu hỏi</Text>
                </TouchableOpacity>
              </View>

              {formData.questions.map((q, index) => (
                <View key={index} style={styles.questionCard}>
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
                          value={q.explanation || ''}
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
              variant="outline"
              onPress={handleClose}
              disabled={uploadingAudio}
            />
            <Button
              title={isAdding ? 'Thêm mới' : 'Cập nhật'}
              variant="primary"
              onPress={handleSave}
              disabled={uploadingAudio || formData.audioUrl.startsWith('file://')}
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
  uploadButtonDisabled: {
    backgroundColor: colors.light.border,
    borderColor: colors.light.border,
  },
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
    marginTop: -8,
  },
  timeText: {
    fontSize: 10,
    color: colors.light.textSecondary,
    fontFamily: typography.fonts.regular,
  },
  timeTextDisabled: {
    color: colors.light.textSecondary,
  },
  // Uploading Styles
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.light.primary + '10',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  uploadingText: {
    marginLeft: 8,
    fontSize: typography.fontSizes.sm,
    color: colors.light.primary,
    fontFamily: typography.fonts.regular,
  },
  // URL Status Styles
  urlStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 8,
    borderRadius: 6,
    backgroundColor: colors.light.card,
  },
  urlStatusError: {
    backgroundColor: palette.error + '10',
    borderWidth: 1,
    borderColor: palette.error + '30',
  },
  urlStatusTextSuccess: {
    fontSize: typography.fontSizes.xs,
    color: palette.success,
    fontFamily: typography.fonts.semiBold,
    marginLeft: 6,
  },
  urlStatusTextError: {
    fontSize: typography.fontSizes.xs,
    color: palette.error,
    fontFamily: typography.fonts.semiBold,
    marginLeft: 6,
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