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
} from '@hugeicons/core-free-icons';

import Button from '../Button/Button';
import { colors, palette } from '../../theme/colors';
import { typography } from '../../theme/typography';

// Types
export interface WritingLesson {
  _id: string;
  title: string;
  type: string; // paragraph, email, sentence, story, essay, letter, description
  prompt: string;
  instruction?: string;
  wordHint: string[];
  grammarHint: string[];
  structureHint?: string;
  minWords: number;
  maxWords?: number;
  level: string;
  difficulty?: string;
  sampleAnswer?: string;
  sampleTranslation?: string;
  estimatedTime?: number;
  tags?: string[];
}

interface ModalWritingProps {
  isVisible: boolean;
  onClose: () => void;
  writing?: WritingLesson | null;
  onSave: (data: WritingLesson) => void;
  isAdding?: boolean;
}

type WritingFormData = Omit<WritingLesson, '_id'>;

const ModalWriting: React.FC<ModalWritingProps> = ({
  isVisible,
  onClose,
  writing,
  onSave,
  isAdding = false,
}) => {
  const [formData, setFormData] = useState<WritingFormData>({
    title: '',
    type: 'paragraph',
    prompt: '',
    instruction: '',
    wordHint: [''],
    grammarHint: [''],
    structureHint: '',
    minWords: 50,
    maxWords: undefined,
    level: 'Sơ cấp 1',
    difficulty: 'Trung bình',
    sampleAnswer: '',
    sampleTranslation: '',
    estimatedTime: 30,
    tags: [''],
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (writing) {
      setFormData({
        title: writing.title || '',
        type: writing.type || 'paragraph',
        prompt: writing.prompt || '',
        instruction: writing.instruction || '',
        wordHint: writing.wordHint?.length > 0 ? [...writing.wordHint] : [''],
        grammarHint: writing.grammarHint?.length > 0 ? [...writing.grammarHint] : [''],
        structureHint: writing.structureHint || '',
        minWords: writing.minWords || 50,
        maxWords: writing.maxWords,
        level: writing.level || 'Sơ cấp 1',
        difficulty: writing.difficulty || 'Trung bình',
        sampleAnswer: writing.sampleAnswer || '',
        sampleTranslation: writing.sampleTranslation || '',
        estimatedTime: writing.estimatedTime || 30,
      });
    } else {
      resetForm();
    }
    setErrors({});
  }, [writing, isVisible]);

  const resetForm = () => {
    setFormData({
      title: '',
      type: 'paragraph',
      prompt: '',
      instruction: '',
      wordHint: [''],
      grammarHint: [''],
      structureHint: '',
      minWords: 50,
      maxWords: undefined,
      level: 'Sơ cấp 1',
      difficulty: 'Trung bình',
      sampleAnswer: '',
      sampleTranslation: '',
      estimatedTime: 30,
      tags: [''],
    });
  };

  const handleFieldChange = <K extends keyof WritingFormData>(
    field: K,
    value: WritingFormData[K]
  ): void => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Array handlers
  const handleArrayChange = (field: 'wordHint' | 'grammarHint' | 'tags', index: number, value: string) => {
    const newArray = [...formData[field] as string[]];
    newArray[index] = value;
    handleFieldChange(field, newArray as any);
  };

  const addArrayItem = (field: 'wordHint' | 'grammarHint' | 'tags') => {
    handleFieldChange(field, [...(formData[field] as string[]), '']);
  };

  const removeArrayItem = (field: 'wordHint' | 'grammarHint' | 'tags', index: number) => {
    const newArray = (formData[field] as string[]).filter((_, i) => i !== index);
    handleFieldChange(field, newArray.length > 0 ? newArray : ['']);
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.title.trim()) newErrors.title = 'Vui lòng nhập tiêu đề';
    if (!formData.prompt.trim()) newErrors.prompt = 'Vui lòng nhập đề bài';
    if (formData.minWords <= 0) newErrors.minWords = 'Số từ phải lớn hơn 0';
    if (formData.maxWords && formData.maxWords < formData.minWords) {
      newErrors.maxWords = 'Số từ tối đa phải lớn hơn số từ tối thiểu';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const cleanData = {
      ...formData,
      title: formData.title.trim(),
      prompt: formData.prompt.trim(),
      instruction: formData.instruction?.trim(),
      structureHint: formData.structureHint?.trim(),
      sampleAnswer: formData.sampleAnswer?.trim(),
      sampleTranslation: formData.sampleTranslation?.trim(),
      wordHint: formData.wordHint.filter(t => t.trim() !== ''),
      grammarHint: formData.grammarHint.filter(t => t.trim() !== ''),
      tags: formData.tags?.filter(t => t.trim() !== ''),
      // Set undefined for empty optional fields
      maxWords: formData.maxWords && formData.maxWords > 0 ? formData.maxWords : undefined,
    };

    onSave({
      _id: writing?._id || Date.now().toString(),
      ...cleanData,
    });
  };

  const writingTypes = [
    { value: 'paragraph', label: 'Đoạn văn' },
    { value: 'email', label: 'Email' },
    { value: 'sentence', label: 'Câu' },
    { value: 'story', label: 'Câu chuyện' },
    { value: 'essay', label: 'Bài luận' },
    { value: 'letter', label: 'Thư' },
    { value: 'description', label: 'Miêu tả' },
  ];

  const difficultyLevels = [
    { value: 'Dễ', label: 'Dễ' },
    { value: 'Trung bình', label: 'Trung bình' },
    { value: 'Khó', label: 'Khó' },
  ];

  const languageLevels = [
    'Sơ cấp 1', 'Sơ cấp 2', 'Trung cấp 3', 'Trung cấp 4', 'Cao cấp 5', 'Cao cấp 6'
  ];

  return (
    <Modal visible={isVisible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{isAdding ? 'Thêm bài viết mới' : 'Sửa bài viết'}</Text>
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
                  placeholder="VD: Bài viết sơ cấp 1 - Giới thiệu bản thân"
                />
                {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.flex1]}>
                  <Text style={styles.label}>Loại bài</Text>
                  <View style={styles.pickerContainer}>
                    {writingTypes.map((type) => (
                      <TouchableOpacity
                        key={type.value}
                        style={[
                          styles.pickerOption,
                          formData.type === type.value && styles.pickerOptionSelected
                        ]}
                        onPress={() => handleFieldChange('type', type.value)}
                      >
                        <Text style={[
                          styles.pickerOptionText,
                          formData.type === type.value && styles.pickerOptionTextSelected
                        ]}>
                          {type.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                <View style={[styles.inputGroup, styles.flex1]}>
                  <Text style={styles.label}>Cấp độ</Text>
                  <View style={styles.pickerContainer}>
                    {languageLevels.map((level) => (
                      <TouchableOpacity
                        key={level}
                        style={[
                          styles.pickerOption,
                          formData.level === level && styles.pickerOptionSelected
                        ]}
                        onPress={() => handleFieldChange('level', level)}
                      >
                        <Text style={[
                          styles.pickerOptionText,
                          formData.level === level && styles.pickerOptionTextSelected
                        ]}>
                          {level}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.flex1]}>
                  <Text style={styles.label}>Độ khó</Text>
                  <View style={styles.pickerContainer}>
                    {difficultyLevels.map((difficulty) => (
                      <TouchableOpacity
                        key={difficulty.value}
                        style={[
                          styles.pickerOption,
                          formData.difficulty === difficulty.value && styles.pickerOptionSelected
                        ]}
                        onPress={() => handleFieldChange('difficulty', difficulty.value)}
                      >
                        <Text style={[
                          styles.pickerOptionText,
                          formData.difficulty === difficulty.value && styles.pickerOptionTextSelected
                        ]}>
                          {difficulty.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
                <View style={[styles.inputGroup, styles.flex1]}>
                  <Text style={styles.label}>Thời gian ước tính (phút)</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.estimatedTime?.toString()}
                    keyboardType="numeric"
                    onChangeText={(text) => handleFieldChange('estimatedTime', parseInt(text) || 30)}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.flex1]}>
                  <Text style={styles.label}>Số từ tối thiểu <Text style={styles.required}>*</Text></Text>
                  <TextInput
                    style={[styles.input, errors.minWords && styles.inputError]}
                    value={formData.minWords.toString()}
                    keyboardType="numeric"
                    onChangeText={(text) => handleFieldChange('minWords', parseInt(text) || 50)}
                  />
                  {errors.minWords && <Text style={styles.errorText}>{errors.minWords}</Text>}
                </View>
                <View style={[styles.inputGroup, styles.flex1]}>
                  <Text style={styles.label}>Số từ tối đa (nếu có)</Text>
                  <TextInput
                    style={[styles.input, errors.maxWords && styles.inputError]}
                    value={formData.maxWords?.toString() || ''}
                    keyboardType="numeric"
                    onChangeText={(text) => handleFieldChange('maxWords', parseInt(text) || undefined)}
                    placeholder="Không giới hạn"
                  />
                  {errors.maxWords && <Text style={styles.errorText}>{errors.maxWords}</Text>}
                </View>
              </View>
            </View>

            {/* Nội dung đề bài */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Nội dung đề bài</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Đề bài (Prompt) <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={[styles.textArea, errors.prompt && styles.inputError]}
                  value={formData.prompt}
                  onChangeText={(text) => handleFieldChange('prompt', text)}
                  multiline
                  numberOfLines={3}
                  placeholder="VD: Hãy viết một đoạn văn ngắn giới thiệu về bản thân bạn bằng tiếng Hàn"
                />
                {errors.prompt && <Text style={styles.errorText}>{errors.prompt}</Text>}
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Hướng dẫn chi tiết</Text>
                <TextInput
                  style={styles.textArea}
                  value={formData.instruction}
                  onChangeText={(text) => handleFieldChange('instruction', text)}
                  multiline
                  numberOfLines={2}
                  placeholder="VD: Giới thiệu tên, tuổi, nghề nghiệp, sở thích..."
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Gợi ý cấu trúc</Text>
                <TextInput
                  style={styles.textArea}
                  value={formData.structureHint}
                  onChangeText={(text) => handleFieldChange('structureHint', text)}
                  multiline
                  numberOfLines={2}
                  placeholder="VD: 1. Mở bài - 2. Thân bài - 3. Kết bài"
                />
              </View>
            </View>

            {/* Bài mẫu */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Bài mẫu</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Bài viết mẫu</Text>
                <TextInput
                  style={styles.textArea}
                  value={formData.sampleAnswer}
                  onChangeText={(text) => handleFieldChange('sampleAnswer', text)}
                  multiline
                  numberOfLines={4}
                  placeholder="Nhập bài viết mẫu hoàn chỉnh..."
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Bản dịch tiếng Việt</Text>
                <TextInput
                  style={styles.textArea}
                  value={formData.sampleTranslation}
                  onChangeText={(text) => handleFieldChange('sampleTranslation', text)}
                  multiline
                  numberOfLines={3}
                  placeholder="Dịch bài mẫu sang tiếng Việt..."
                />
              </View>
            </View>

            {/* Gợi ý từ vựng */}
            <View style={styles.section}>
              <View style={styles.headerRow}>
                <Text style={styles.sectionTitle}>Từ vựng gợi ý</Text>
                <TouchableOpacity onPress={() => addArrayItem('wordHint')}>
                  <HugeiconsIcon icon={Add01Icon} size={20} color={colors.light.primary} />
                </TouchableOpacity>
              </View>
              {formData.wordHint.map((item, index) => (
                <View key={index} style={styles.listItem}>
                  <TextInput
                    style={[styles.input, styles.flex1]}
                    value={item}
                    onChangeText={(text) => handleArrayChange('wordHint', index, text)}
                    placeholder={`Từ vựng ${index + 1}`}
                  />
                  <TouchableOpacity onPress={() => removeArrayItem('wordHint', index)}>
                    <HugeiconsIcon icon={Delete02Icon} size={20} color={palette.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* Gợi ý ngữ pháp */}
            <View style={styles.section}>
              <View style={styles.headerRow}>
                <Text style={styles.sectionTitle}>Ngữ pháp gợi ý</Text>
                <TouchableOpacity onPress={() => addArrayItem('grammarHint')}>
                  <HugeiconsIcon icon={Add01Icon} size={20} color={colors.light.primary} />
                </TouchableOpacity>
              </View>
              {formData.grammarHint.map((item, index) => (
                <View key={index} style={styles.listItem}>
                  <TextInput
                    style={[styles.input, styles.flex1]}
                    value={item}
                    onChangeText={(text) => handleArrayChange('grammarHint', index, text)}
                    placeholder={`Cấu trúc ngữ pháp ${index + 1}`}
                  />
                  <TouchableOpacity onPress={() => removeArrayItem('grammarHint', index)}>
                    <HugeiconsIcon icon={Delete02Icon} size={20} color={palette.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* Tags */}
            <View style={styles.section}>
              <View style={styles.headerRow}>
                <Text style={styles.sectionTitle}>Tags (từ khóa)</Text>
                <TouchableOpacity onPress={() => addArrayItem('tags')}>
                  <HugeiconsIcon icon={Add01Icon} size={20} color={colors.light.primary} />
                </TouchableOpacity>
              </View>
              {formData.tags?.map((item, index) => (
                <View key={index} style={styles.listItem}>
                  <TextInput
                    style={[styles.input, styles.flex1]}
                    value={item}
                    onChangeText={(text) => handleArrayChange('tags', index, text)}
                    placeholder={`Tag ${index + 1}`}
                  />
                  <TouchableOpacity onPress={() => removeArrayItem('tags', index)}>
                    <HugeiconsIcon icon={Delete02Icon} size={20} color={palette.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <Button 
              title="Hủy" 
              variant="secondary" 
              onPress={onClose}
            />
            <Button 
              title={isAdding ? 'Thêm mới' : 'Cập nhật'} 
              variant="primary" 
              onPress={handleSave} 
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
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 16 
  },
  modalContainer: { 
    backgroundColor: colors.light.background, 
    borderRadius: 12, 
    width: '100%', 
    maxHeight: '90%',
    minHeight: '80%'
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
    marginBottom: 12 
  },
  row: { 
    flexDirection: 'row', 
    gap: 12 
  },
  flex1: { 
    flex: 1 
  },
  label: { 
    fontSize: typography.fontSizes.sm, 
    fontFamily: typography.fonts.semiBold, 
    color: colors.light.text, 
    marginBottom: 6 
  },
  required: { 
    color: palette.error 
  },
  input: { 
    borderWidth: 1, 
    borderColor: colors.light.border, 
    borderRadius: 8, 
    padding: 10, 
    backgroundColor: colors.light.card,
    fontSize: typography.fontSizes.sm
  },
  textArea: { 
    borderWidth: 1, 
    borderColor: colors.light.border, 
    borderRadius: 8, 
    padding: 10, 
    backgroundColor: colors.light.card, 
    textAlignVertical: 'top', 
    minHeight: 80,
    fontSize: typography.fontSizes.sm
  },
  inputError: { 
    borderColor: palette.error 
  },
  errorText: {
    fontSize: typography.fontSizes.xs,
    color: palette.error,
    marginTop: 4
  },
  modalFooter: { 
    flexDirection: 'row', 
    padding: 16, 
    borderTopWidth: 1, 
    borderColor: colors.light.border, 
    gap: 12 
  },
  headerRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 8 
  },
  listItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8, 
    marginBottom: 8 
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4
  },
  pickerOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.light.border,
    backgroundColor: colors.light.background
  },
  pickerOptionSelected: {
    backgroundColor: colors.light.primary,
    borderColor: colors.light.primary
  },
  pickerOptionText: {
    fontSize: typography.fontSizes.xs,
    color: colors.light.text
  },
  pickerOptionTextSelected: {
    color: 'white',
    fontFamily: typography.fonts.semiBold
  }
});

export default ModalWriting;