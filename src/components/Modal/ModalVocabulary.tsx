// components/Modal/ModalVocabulary.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Cancel01Icon } from '@hugeicons/core-free-icons';
import Button from '../Button/Button';
import { colors, palette } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Vocabulary } from '../../services/vocabularyService';

interface ModalVocabularyProps {
  isVisible: boolean;
  onClose: () => void;
  vocabulary?: Vocabulary | null;
  onSave: (formData: Omit<Vocabulary, '_id' | 'lesson' | 'level'>) => void;
  isAdding?: boolean;
}

const ModalVocabulary: React.FC<ModalVocabularyProps> = ({
  isVisible,
  onClose,
  vocabulary,
  onSave,
  isAdding = false,
}) => {
  const [formData, setFormData] = useState({
    word: '',
    meaning: '',
    pronunciation: '',
    type: '명사', // Mặc định là 명사
    category: '',
    examples: [''],
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Danh sách loại từ (word types) từ BE model
  const wordTypes = ['명사', '동사', '형용사', '부사', '대명사', '감탄사'];

  useEffect(() => {
    if (vocabulary) {
      // Khi chỉnh sửa, set dữ liệu từ vocabulary
      setFormData({
        word: vocabulary.word || '',
        meaning: vocabulary.meaning || '',
        pronunciation: vocabulary.pronunciation || '',
        type: vocabulary.type || '명사',
        category: vocabulary.category || '',
        examples: vocabulary.examples && vocabulary.examples.length > 0 
          ? [...vocabulary.examples] 
          : [''],
      });
    } else {
      // Reset form khi thêm mới
      setFormData({
        word: '',
        meaning: '',
        pronunciation: '',
        type: '명사',
        category: '',
        examples: [''],
      });
    }
    setErrors({});
  }, [vocabulary, isVisible]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.word.trim()) {
      newErrors.word = 'Vui lòng nhập từ vựng';
    }

    if (!formData.meaning.trim()) {
      newErrors.meaning = 'Vui lòng nhập nghĩa';
    }

    if (!formData.type.trim()) {
      newErrors.type = 'Vui lòng chọn loại từ';
    }

    // Examples không bắt buộc trong BE, nhưng có thể kiểm tra nếu muốn
    // const hasValidExample = formData.examples.some(example => example.trim() !== '');
    // if (!hasValidExample) {
    //   newErrors.examples = 'Vui lòng nhập ít nhất một ví dụ';
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = (): void => {
    if (!validateForm()) {
      Alert.alert('Lỗi', 'Vui lòng kiểm tra lại thông tin bắt buộc');
      return;
    }

    // Lọc bỏ các ví dụ rỗng
    const filteredExamples = formData.examples.filter(example => example.trim() !== '');

    // Gửi dữ liệu theo đúng interface của BE
    onSave({
      word: formData.word.trim(),
      meaning: formData.meaning.trim(),
      pronunciation: formData.pronunciation.trim(),
      type: formData.type,
      category: formData.category.trim(),
      examples: filteredExamples,
    });
  };

  const handleExampleChange = (text: string, index: number): void => {
    const newExamples = [...formData.examples];
    newExamples[index] = text;
    setFormData({ ...formData, examples: newExamples });
  };

  const addExampleField = (): void => {
    if (formData.examples.length < 5) {
      setFormData({
        ...formData,
        examples: [...formData.examples, ''],
      });
    }
  };

  const removeExampleField = (index: number): void => {
    if (formData.examples.length > 1) {
      const newExamples = formData.examples.filter((_, i) => i !== index);
      setFormData({ ...formData, examples: newExamples });
    }
  };

  const handleClose = (): void => {
    setErrors({});
    onClose();
  };

  const handleTypeSelect = (type: string): void => {
    setFormData({ ...formData, type });
    if (errors.type) {
      setErrors(prev => ({ ...prev, type: '' }));
    }
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
              {isAdding ? 'Thêm từ vựng mới' : 'Chỉnh sửa từ vựng'}
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <HugeiconsIcon icon={Cancel01Icon} size={24} color={colors.light.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Word Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Từ vựng (Tiếng Hàn) <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.word && styles.inputError]}
                value={formData.word}
                onChangeText={(text) => {
                  setFormData({ ...formData, word: text });
                  if (errors.word) setErrors(prev => ({ ...prev, word: '' }));
                }}
                placeholder="Nhập từ vựng tiếng Hàn"
                placeholderTextColor={colors.light.textSecondary}
              />
              {errors.word && <Text style={styles.errorText}>{errors.word}</Text>}
            </View>

            {/* Pronunciation Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phát âm</Text>
              <TextInput
                style={styles.input}
                value={formData.pronunciation}
                onChangeText={(text) => setFormData({ ...formData, pronunciation: text })}
                placeholder="Nhập phiên âm (romaji)"
                placeholderTextColor={colors.light.textSecondary}
              />
              <Text style={styles.hintText}>
                Ví dụ: "sa-rang" cho từ "사랑"
              </Text>
            </View>

            {/* Meaning Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Nghĩa (Tiếng Việt) <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.meaning && styles.inputError]}
                value={formData.meaning}
                onChangeText={(text) => {
                  setFormData({ ...formData, meaning: text });
                  if (errors.meaning) setErrors(prev => ({ ...prev, meaning: '' }));
                }}
                placeholder="Nhập nghĩa tiếng Việt"
                placeholderTextColor={colors.light.textSecondary}
              />
              {errors.meaning && <Text style={styles.errorText}>{errors.meaning}</Text>}
            </View>

            {/* Type Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Loại từ <Text style={styles.required}>*</Text>
              </Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.typeScrollView}
              >
                <View style={styles.typeContainer}>
                  {wordTypes.map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeButton,
                        formData.type === type && styles.typeButtonSelected
                      ]}
                      onPress={() => handleTypeSelect(type)}
                    >
                      <Text style={[
                        styles.typeButtonText,
                        formData.type === type && styles.typeButtonTextSelected
                      ]}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
              {errors.type && <Text style={styles.errorText}>{errors.type}</Text>}
              <Text style={styles.hintText}>
                Danh từ, động từ, tính từ, trạng từ, đại từ, thán từ
              </Text>
            </View>

            {/* Category Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Chủ đề</Text>
              <TextInput
                style={styles.input}
                value={formData.category}
                onChangeText={(text) => setFormData({ ...formData, category: text })}
                placeholder="Ví dụ: Cảm xúc, Chào hỏi, Ẩm thực..."
                placeholderTextColor={colors.light.textSecondary}
              />
            </View>

            {/* Examples */}
            <View style={styles.inputGroup}>
              <View style={styles.examplesHeader}>
                <Text style={styles.label}>Ví dụ</Text>
                {formData.examples.length < 5 && (
                  <TouchableOpacity onPress={addExampleField} style={styles.addExampleButton}>
                    <Text style={styles.addExampleText}>+ Thêm ví dụ</Text>
                  </TouchableOpacity>
                )}
              </View>
              
              {errors.examples && (
                <Text style={styles.errorText}>{errors.examples}</Text>
              )}

              {formData.examples.map((example, index) => (
                <View key={index} style={styles.exampleInputContainer}>
                  <TextInput
                    style={styles.exampleInput}
                    value={example}
                    onChangeText={(text) => handleExampleChange(text, index)}
                    placeholder={`Ví dụ ${index + 1} (tiếng Hàn hoặc tiếng Việt)`}
                    placeholderTextColor={colors.light.textSecondary}
                    multiline
                    numberOfLines={2}
                  />
                  {formData.examples.length > 1 && (
                    <TouchableOpacity
                      onPress={() => removeExampleField(index)}
                      style={styles.removeExampleButton}
                    >
                      <Text style={styles.removeExampleText}>×</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              <Text style={styles.hintText}>
                Có thể nhập ví dụ bằng tiếng Hàn hoặc tiếng Việt
              </Text>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.modalFooter}>
            <Button
              title="Hủy"
              variant="outline"
              onPress={handleClose}
            />
            <Button
              title={isAdding ? 'Thêm từ vựng' : 'Lưu thay đổi'}
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    backgroundColor: colors.light.background,
    borderRadius: 16,
    width: '100%',
    maxHeight: '85%',
    shadowColor: colors.light.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  modalTitle: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fonts.bold,
    color: colors.light.text,
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    padding: 20,
    maxHeight: 400,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fonts.semiBold,
    color: colors.light.text,
    marginBottom: 8,
  },
  required: {
    color: palette.error,
    fontFamily: typography.fonts.semiBold,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.light.border,
    borderRadius: 10,
    padding: 14,
    fontSize: typography.fontSizes.md,
    fontFamily: typography.fonts.regular,
    color: colors.light.text,
    backgroundColor: colors.light.card,
  },
  inputError: {
    borderColor: palette.error,
    backgroundColor: palette.error + '10',
  },
  errorText: {
    fontSize: typography.fontSizes.xs,
    color: palette.error,
    fontFamily: typography.fonts.regular,
    marginTop: 6,
  },
  hintText: {
    fontSize: typography.fontSizes.xs,
    color: colors.light.textSecondary,
    fontFamily: typography.fonts.regular,
    marginTop: 6,
    fontStyle: 'italic',
  },
  typeScrollView: {
    marginHorizontal: -4,
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.light.border,
    backgroundColor: colors.light.card,
  },
  typeButtonSelected: {
    backgroundColor: colors.light.primary,
    borderColor: colors.light.primary,
  },
  typeButtonText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fonts.regular,
    color: colors.light.text,
  },
  typeButtonTextSelected: {
    color: colors.light.card,
    fontFamily: typography.fonts.semiBold,
  },
  examplesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addExampleButton: {
    padding: 8,
  },
  addExampleText: {
    fontSize: typography.fontSizes.sm,
    color: colors.light.primary,
    fontFamily: typography.fonts.semiBold,
  },
  exampleInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  exampleInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.light.border,
    borderRadius: 10,
    padding: 14,
    fontSize: typography.fontSizes.md,
    fontFamily: typography.fonts.regular,
    color: colors.light.text,
    backgroundColor: colors.light.card,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  removeExampleButton: {
    padding: 8,
    marginLeft: 8,
    marginTop: 8,
  },
  removeExampleText: {
    fontSize: typography.fontSizes.lg,
    color: palette.error,
    fontFamily: typography.fonts.bold,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.light.border,
    gap: 12,
  },
});

export default ModalVocabulary;