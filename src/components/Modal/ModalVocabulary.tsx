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

interface Vocabulary {
  id: number;
  word: string;
  pronunciation: string;
  meaning: string;
  type: string;
  category: string;
  dateAdded: string;
  examples: string[];
}

interface ModalVocabularyProps {
  isVisible: boolean;
  onClose: () => void;
  vocabulary?: Vocabulary | null;
  onSave: (formData: Omit<Vocabulary, 'id' | 'dateAdded'>) => void;
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
    pronunciation: '',
    meaning: '',
    type: '',
    category: '',
    examples: ['', ''],
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (vocabulary) {
      setFormData({
        word: vocabulary.word,
        pronunciation: vocabulary.pronunciation,
        meaning: vocabulary.meaning,
        type: vocabulary.type,
        category: vocabulary.category,
        examples: [...vocabulary.examples],
      });
    } else {
      // Reset form when adding new vocabulary
      setFormData({
        word: '',
        pronunciation: '',
        meaning: '',
        type: '',
        category: '',
        examples: ['', ''],
      });
    }
    setErrors({});
  }, [vocabulary, isVisible]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.word.trim()) {
      newErrors.word = 'Vui lòng nhập từ vựng';
    }

    if (!formData.pronunciation.trim()) {
      newErrors.pronunciation = 'Vui lòng nhập phiên âm';
    }

    if (!formData.meaning.trim()) {
      newErrors.meaning = 'Vui lòng nhập nghĩa';
    }

    if (!formData.type.trim()) {
      newErrors.type = 'Vui lòng nhập loại từ';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Vui lòng nhập danh mục';
    }

    // Validate examples - at least one example should be filled
    const hasValidExample = formData.examples.some(example => example.trim() !== '');
    if (!hasValidExample) {
      newErrors.examples = 'Vui lòng nhập ít nhất một ví dụ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = (): void => {
    if (!validateForm()) {
      return;
    }

    // Filter out empty examples
    const filteredExamples = formData.examples.filter(example => example.trim() !== '');

    onSave({
      word: formData.word.trim(),
      pronunciation: formData.pronunciation.trim(),
      meaning: formData.meaning.trim(),
      type: formData.type.trim(),
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

          <ScrollView style={styles.modalContent}>
            {/* Word Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Từ vựng <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={[styles.input, errors.word && styles.inputError]}
                value={formData.word}
                onChangeText={(text) => setFormData({ ...formData, word: text })}
                placeholder="Nhập từ vựng tiếng Hàn"
                placeholderTextColor={colors.light.textSecondary}
              />
              {errors.word && <Text style={styles.errorText}>{errors.word}</Text>}
            </View>

            {/* Pronunciation Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phiên âm <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={[styles.input, errors.pronunciation && styles.inputError]}
                value={formData.pronunciation}
                onChangeText={(text) => setFormData({ ...formData, pronunciation: text })}
                placeholder="Nhập phiên âm"
                placeholderTextColor={colors.light.textSecondary}
              />
              {errors.pronunciation && (
                <Text style={styles.errorText}>{errors.pronunciation}</Text>
              )}
            </View>

            {/* Meaning Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nghĩa <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={[styles.input, errors.meaning && styles.inputError]}
                value={formData.meaning}
                onChangeText={(text) => setFormData({ ...formData, meaning: text })}
                placeholder="Nhập nghĩa tiếng Việt"
                placeholderTextColor={colors.light.textSecondary}
              />
              {errors.meaning && <Text style={styles.errorText}>{errors.meaning}</Text>}
            </View>

            {/* Type Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Loại từ <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={[styles.input, errors.type && styles.inputError]}
                value={formData.type}
                onChangeText={(text) => setFormData({ ...formData, type: text })}
                placeholder="Ví dụ: 명사 (danh từ), 동사 (động từ)..."
                placeholderTextColor={colors.light.textSecondary}
              />
              {errors.type && <Text style={styles.errorText}>{errors.type}</Text>}
            </View>

            {/* Category Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Danh mục <Text style={styles.required}>*</Text></Text>
              <TextInput
                style={[styles.input, errors.category && styles.inputError]}
                value={formData.category}
                onChangeText={(text) => setFormData({ ...formData, category: text })}
                placeholder="Ví dụ: Cảm xúc, Chào hỏi, Ẩm thực..."
                placeholderTextColor={colors.light.textSecondary}
              />
              {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}
            </View>

            {/* Examples */}
            <View style={styles.inputGroup}>
              <View style={styles.examplesHeader}>
                <Text style={styles.label}>Ví dụ <Text style={styles.required}>*</Text></Text>
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
                    style={[styles.exampleInput, errors.examples && styles.inputError]}
                    value={example}
                    onChangeText={(text) => handleExampleChange(text, index)}
                    placeholder={`Ví dụ ${index + 1} (tiếng Hàn hoặc tiếng Việt)`}
                    placeholderTextColor={colors.light.textSecondary}
                    multiline
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
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.modalFooter}>
            <Button
              title="Hủy"
              variant="primary"
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
    borderRadius: 12,
    width: '100%',
    maxHeight: '80%',
    shadowColor: colors.light.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    maxHeight: 400,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fonts.semiBold,
    color: colors.light.text,
    marginBottom: 8,
  },
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
  inputError: {
    borderColor: palette.error,
  },
  errorText: {
    fontSize: typography.fontSizes.xs,
    color: palette.error,
    fontFamily: typography.fonts.regular,
    marginTop: 4,
  },
  examplesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  addExampleButton: {
    padding: 4,
  },
  addExampleText: {
    fontSize: typography.fontSizes.sm,
    color: colors.light.primary,
    fontFamily: typography.fonts.semiBold,
  },
  exampleInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  exampleInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.light.border,
    borderRadius: 8,
    padding: 12,
    fontSize: typography.fontSizes.md,
    fontFamily: typography.fonts.regular,
    color: colors.light.text,
    backgroundColor: colors.light.card,
    minHeight: 40,
  },
  removeExampleButton: {
    padding: 8,
    marginLeft: 8,
  },
  required: {
  color: palette.error,       // màu đỏ
  fontFamily: typography.fonts.semiBold,
},
  removeExampleText: {
    fontSize: typography.fontSizes.lg,
    color: palette.error,
    fontFamily: typography.fonts.bold,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.light.border,
    gap: 12,
  },
});

export default ModalVocabulary;