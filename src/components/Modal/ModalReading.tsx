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
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  Cancel01Icon,
  Add01Icon,
  Delete02Icon,
  Tick02Icon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  BookOpen01Icon,
  TranslateIcon,
} from '@hugeicons/core-free-icons';

import Button from '../../components/Button/Button';
import { colors, palette } from '../../theme/colors';
import { typography } from '../../theme/typography';

// Sử dụng types từ service
import { Reading, Question } from '../../services/readingService';

interface ModalReadingProps {
  isVisible: boolean;
  onClose: () => void;
  reading?: Reading | null;
  onSave: (readingData: Reading) => void;
  isAdding?: boolean;
  lessonId?: string; 
}

type ReadingFormData = Omit<Reading, '_id'>;

const ModalReading: React.FC<ModalReadingProps> = ({
  isVisible,
  onClose,
  reading,
  onSave,
  isAdding = false,
  lessonId,
}) => {
  const [formData, setFormData] = useState<ReadingFormData>({
    title: '',
    content: '',
    translation: '',
    level: 'Sơ cấp 1',
    questions: [],
    difficulty: 'Trung bình',
    tags: [],
    lesson: lessonId,
  });

  const [expandedQuestionIndex, setExpandedQuestionIndex] = useState<number | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (reading) {
      setFormData({
        title: reading.title,
        content: reading.content,
        translation: reading.translation,
        level: reading.level,
        difficulty: reading.difficulty || 'Trung bình',
        tags: reading.tags || [],
        questions: reading.questions ? JSON.parse(JSON.stringify(reading.questions)) : [],
        // Xử lý lesson: nếu là object, lấy _id; nếu là string, giữ nguyên
        lesson: typeof reading.lesson === 'object' ? reading.lesson._id : reading.lesson,
      });
    } else {
      resetForm();
    }
    setErrors({});
    setExpandedQuestionIndex(null);
  }, [reading, isVisible, lessonId]);

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      translation: '',
      level: 'Sơ cấp 1',
      difficulty: 'Trung bình',
      tags: [],
      questions: [],
      lesson: lessonId,
    });
  };

  const handleFieldChange = <K extends keyof ReadingFormData>(
    field: K,
    value: ReadingFormData[K]
  ): void => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // --- Logic Question ---
const addQuestion = () => {
  const newQuestion = {
    question: '',
    options: ['', '', '', ''],
    answer: 0,
    explanation: ''
  };
  setFormData(prev => ({
    ...prev,
    questions: [...prev.questions, newQuestion]
  }));
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

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.title.trim()) newErrors.title = 'Vui lòng nhập tiêu đề';
    if (!formData.content.trim()) newErrors.content = 'Vui lòng nhập nội dung bài đọc';
    
    // Check questions
    const invalidQuestion = formData.questions.some(
      q => !q.question.trim() || q.options.some(opt => !opt.trim())
    );
    if (invalidQuestion) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin câu hỏi và đáp án');
      return false;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const readingData: Reading = {
      _id: reading?._id || '',
      ...formData,
      lesson: lessonId || formData.lesson,
    };

    onSave(readingData);
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {isAdding ? 'Thêm bài đọc mới' : 'Sửa bài đọc'}
              {lessonId && <Text style={styles.lessonIndicator}> (Bài học)</Text>}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
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
                  placeholder="VD: Bài đọc sơ cấp 1 - Giới thiệu"
                />
                {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Cấp độ</Text>
                <TextInput
                  style={styles.input}
                  value={formData.level}
                  onChangeText={(text) => handleFieldChange('level', text)}
                  placeholder="VD: Sơ cấp 1"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Độ khó</Text>
                <TextInput
                  style={styles.input}
                  value={formData.difficulty}
                  onChangeText={(text) => handleFieldChange('difficulty', text)}
                  placeholder="VD: Trung bình"
                />
              </View>
            </View>

            {/* Nội dung bài đọc */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Nội dung bài đọc</Text>
              
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <HugeiconsIcon icon={BookOpen01Icon} size={16} color={colors.light.primary} />
                  <Text style={styles.label}>Nội dung (Tiếng Hàn) <Text style={styles.required}>*</Text></Text>
                </View>
                <TextInput
                  style={[styles.textArea, errors.content && styles.inputError]}
                  value={formData.content}
                  onChangeText={(text) => handleFieldChange('content', text)}
                  multiline
                  numberOfLines={6}
                  placeholder="Nhập nội dung bài đọc..."
                />
                {errors.content && <Text style={styles.errorText}>{errors.content}</Text>}
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <HugeiconsIcon icon={TranslateIcon} size={16} color={colors.light.primary} />
                  <Text style={styles.label}>Bản dịch (Tiếng Việt)</Text>
                </View>
                <TextInput
                  style={styles.textArea}
                  value={formData.translation}
                  onChangeText={(text) => handleFieldChange('translation', text)}
                  multiline
                  numberOfLines={4}
                  placeholder="Nhập bản dịch..."
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
                <View key={index} style={styles.questionCard}>
                  <TouchableOpacity 
                    style={styles.questionHeader} 
                    onPress={() => toggleExpandQuestion(index)}
                  >
                    <Text style={styles.questionTitle} numberOfLines={1}>
                      {index + 1}. {q.question || '(Chưa nhập câu hỏi)'}
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
                            style={[styles.input, { flex: 1 }]}
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
                          placeholder="Giải thích..."
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

          <View style={styles.modalFooter}>
            <Button title="Hủy" variant="primary" onPress={onClose} />
            <Button title={isAdding ? 'Thêm mới' : 'Cập nhật'} variant="primary" onPress={handleSave} size='small' />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 16 
  },
  modalContainer: { 
    backgroundColor: colors.light.background, 
    borderRadius: 12, 
    width: '100%', 
    height: '90%', 
    shadowColor: '#000', 
    shadowOffset: {width:0,height:2}, 
    shadowOpacity:0.25, 
    elevation: 5 
  },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 16, 
    borderBottomWidth: 1, 
    borderColor: colors.light.border 
  },
  modalTitle: { 
    fontSize: typography.fontSizes.lg, 
    fontFamily: typography.fonts.bold, 
    color: colors.light.text 
  },
  lessonIndicator: {
    fontSize: typography.fontSizes.sm,
    color: colors.light.primary,
  },
  closeButton: { 
    padding: 4 
  },
  modalContent: { 
    padding: 16 
  },
  
  section: { 
    marginBottom: 24 
  },
  sectionTitle: { 
    fontSize: typography.fontSizes.md, 
    fontFamily: typography.fonts.bold, 
    color: colors.light.primary, 
    marginBottom: 12 
  },
  
  inputGroup: { 
    marginBottom: 16 
  },
  labelRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6, 
    marginBottom: 8 
  },
  label: { 
    fontSize: typography.fontSizes.sm, 
    fontFamily: typography.fonts.semiBold, 
    color: colors.light.text 
  },
  required: { 
    color: palette.error 
  },
  
  input: { 
    borderWidth: 1, 
    borderColor: colors.light.border, 
    borderRadius: 8, 
    padding: 12, 
    backgroundColor: colors.light.card, 
    fontSize: typography.fontSizes.sm 
  },
  inputError: { 
    borderColor: palette.error 
  },
  errorText: { 
    color: palette.error, 
    fontSize: typography.fontSizes.xs, 
    marginTop: 4 
  },
  
  textArea: { 
    borderWidth: 1, 
    borderColor: colors.light.border, 
    borderRadius: 8, 
    padding: 12, 
    backgroundColor: colors.light.card, 
    fontSize: typography.fontSizes.md, 
    minHeight: 100, 
    textAlignVertical: 'top' 
  },
  textAreaSmall: { 
    borderWidth: 1, 
    borderColor: colors.light.border, 
    borderRadius: 8, 
    padding: 12, 
    backgroundColor: colors.light.card, 
    fontSize: typography.fontSizes.md, 
    minHeight: 60, 
    textAlignVertical: 'top' 
  },

  // Question Styles
  questionsHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  addButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4, 
    padding: 4 
  },
  addButtonText: { 
    color: colors.light.primary, 
    fontSize: typography.fontSizes.sm 
  },
  
  questionCard: { 
    backgroundColor: colors.light.card, 
    borderWidth: 1, 
    borderColor: colors.light.border, 
    borderRadius: 8, 
    marginBottom: 12, 
    overflow: 'hidden' 
  },
  questionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 12, 
    backgroundColor: colors.light.background 
  },
  questionTitle: { 
    fontSize: typography.fontSizes.sm, 
    fontFamily: typography.fonts.semiBold, 
    color: colors.light.text, 
    flex: 1, 
    marginRight: 8 
  },
  questionBody: { 
    padding: 12, 
    borderTopWidth: 1, 
    borderColor: colors.light.border 
  },
  
  optionRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 8, 
    gap: 8 
  },
  radioBox: { 
    width: 24, 
    height: 24, 
    borderRadius: 12, 
    borderWidth: 2, 
    borderColor: colors.light.border, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  radioSelected: { 
    backgroundColor: palette.success, 
    borderColor: palette.success 
  },
  
  deleteQuestionButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 6, 
    marginTop: 12, 
    padding: 8, 
    backgroundColor: palette.error + '10', 
    borderRadius: 6 
  },
  deleteQuestionText: { 
    color: palette.error, 
    fontSize: typography.fontSizes.sm 
  },

  modalFooter: { 
    flexDirection: 'row', 
    padding: 16, 
    borderTopWidth: 1, 
    borderColor: colors.light.border, 
    gap: 12 
  },
});

export default ModalReading;