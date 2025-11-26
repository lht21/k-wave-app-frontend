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

import Button from '../../components/Button/Button';
import { colors, palette } from '../../theme/colors';
import { typography } from '../../theme/typography';

// Types
interface ExampleSentence {
  korean: string;
  vietnamese: string;
}

interface Grammar {
  _id: string;
  structure: string;
  meaning: string;
  explanation: string;
  usage: string;
  level: string;
  exampleSentences: ExampleSentence[];
  similarGrammar: string[];
}

interface ModalGrammarProps {
  isVisible: boolean;
  onClose: () => void;
  grammar?: Grammar | null;
  onSave: (grammarData: Grammar) => void;
  isAdding?: boolean;
}

type GrammarFormData = Omit<Grammar, '_id'>;

const ModalGrammar: React.FC<ModalGrammarProps> = ({
  isVisible,
  onClose,
  grammar,
  onSave,
  isAdding = false,
}) => {
  const [formData, setFormData] = useState<GrammarFormData>({
    structure: '',
    meaning: '',
    explanation: '',
    usage: '',
    level: 'Sơ cấp 1',
    exampleSentences: [{ korean: '', vietnamese: '' }],
    similarGrammar: [''],
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (grammar) {
      setFormData({
        structure: grammar.structure,
        meaning: grammar.meaning,
        explanation: grammar.explanation,
        usage: grammar.usage,
        level: grammar.level,
        exampleSentences: [...grammar.exampleSentences],
        similarGrammar: [...grammar.similarGrammar],
      });
    } else {
      // Reset form
      setFormData({
        structure: '',
        meaning: '',
        explanation: '',
        usage: '',
        level: 'Sơ cấp 1',
        exampleSentences: [{ korean: '', vietnamese: '' }],
        similarGrammar: [''],
      });
    }
    setErrors({});
  }, [grammar, isVisible]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.structure.trim()) {
      newErrors.structure = 'Vui lòng nhập cấu trúc';
    }

    if (!formData.meaning.trim()) {
      newErrors.meaning = 'Vui lòng nhập nghĩa';
    }

    if (!formData.explanation.trim()) {
      newErrors.explanation = 'Vui lòng nhập giải thích';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = (): void => {
    if (!validateForm()) {
      return;
    }

    // Filter out empty examples and similar grammar
    const filteredExamples = formData.exampleSentences.filter(
      ex => ex.korean.trim() && ex.vietnamese.trim()
    );
    const filteredSimilar = formData.similarGrammar.filter(sg => sg.trim());

    const saveData: Grammar = {
      _id: grammar?._id || Date.now().toString(),
      ...formData,
      exampleSentences: filteredExamples.length > 0 ? filteredExamples : [{ korean: '', vietnamese: '' }],
      similarGrammar: filteredSimilar.length > 0 ? filteredSimilar : [''],
    };

    onSave(saveData);
  };

  const handleFieldChange = <K extends keyof GrammarFormData>(
    field: K,
    value: GrammarFormData[K]
  ): void => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleExampleChange = (
    index: number,
    field: keyof ExampleSentence,
    value: string
  ): void => {
    const newExamples = [...formData.exampleSentences];
    newExamples[index] = {
      ...newExamples[index],
      [field]: value,
    };
    handleFieldChange('exampleSentences', newExamples);
  };

  const addExample = (): void => {
    if (formData.exampleSentences.length < 5) {
      handleFieldChange('exampleSentences', [
        ...formData.exampleSentences,
        { korean: '', vietnamese: '' },
      ]);
    }
  };

  const removeExample = (index: number): void => {
    if (formData.exampleSentences.length > 1) {
      const newExamples = formData.exampleSentences.filter((_, i) => i !== index);
      handleFieldChange('exampleSentences', newExamples);
    }
  };

  const handleSimilarGrammarChange = (index: number, value: string): void => {
    const newSimilar = [...formData.similarGrammar];
    newSimilar[index] = value;
    handleFieldChange('similarGrammar', newSimilar);
  };

  const addSimilarGrammar = (): void => {
    if (formData.similarGrammar.length < 5) {
      handleFieldChange('similarGrammar', [...formData.similarGrammar, '']);
    }
  };

  const removeSimilarGrammar = (index: number): void => {
    if (formData.similarGrammar.length > 1) {
      const newSimilar = formData.similarGrammar.filter((_, i) => i !== index);
      handleFieldChange('similarGrammar', newSimilar);
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
              {isAdding ? 'Thêm ngữ pháp mới' : 'Sửa ngữ pháp'}
            </Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <HugeiconsIcon icon={Cancel01Icon} size={24} color={colors.light.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Cấu trúc */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Cấu trúc <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.structure && styles.inputError]}
                value={formData.structure}
                onChangeText={(text) => handleFieldChange('structure', text)}
                placeholder="VD: Danh từ + 입니다"
                placeholderTextColor={colors.light.textSecondary}
              />
              {errors.structure && <Text style={styles.errorText}>{errors.structure}</Text>}
            </View>

            <View style={styles.row}>
              {/* Nghĩa */}
              <View style={[styles.inputGroup, styles.flex1]}>
                <Text style={styles.label}>
                  Nghĩa <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.input, errors.meaning && styles.inputError]}
                  value={formData.meaning}
                  onChangeText={(text) => handleFieldChange('meaning', text)}
                  placeholder="VD: là (danh từ)"
                  placeholderTextColor={colors.light.textSecondary}
                />
                {errors.meaning && <Text style={styles.errorText}>{errors.meaning}</Text>}
              </View>

              {/* Cấp độ */}
              <View style={[styles.inputGroup, styles.flex1]}>
                <Text style={styles.label}>
                  Cấp độ <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.selectContainer}>
                  <TextInput
                    style={styles.input}
                    value={formData.level}
                    onChangeText={(text) => handleFieldChange('level', text)}
                    placeholder="Chọn cấp độ"
                    placeholderTextColor={colors.light.textSecondary}
                  />
                </View>
              </View>
            </View>

            {/* Giải thích */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Giải thích <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.textArea, errors.explanation && styles.inputError]}
                value={formData.explanation}
                onChangeText={(text) => handleFieldChange('explanation', text)}
                placeholder="VD: Hình thức kính ngữ của 이다 là 입니다"
                placeholderTextColor={colors.light.textSecondary}
                multiline
                numberOfLines={3}
              />
              {errors.explanation && <Text style={styles.errorText}>{errors.explanation}</Text>}
            </View>

            {/* Cách dùng */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Cách dùng</Text>
              <TextInput
                style={styles.input}
                value={formData.usage}
                onChangeText={(text) => handleFieldChange('usage', text)}
                placeholder="VD: Dùng trong câu trần thuật"
                placeholderTextColor={colors.light.textSecondary}
              />
            </View>

            {/* Ví dụ */}
            <View style={styles.inputGroup}>
              <View style={styles.examplesHeader}>
                <Text style={styles.label}>Ví dụ</Text>
                {formData.exampleSentences.length < 5 && (
                  <TouchableOpacity onPress={addExample} style={styles.addButton}>
                    <HugeiconsIcon icon={Add01Icon} size={16} color={colors.light.primary} />
                    <Text style={styles.addButtonText}>Thêm ví dụ</Text>
                  </TouchableOpacity>
                )}
              </View>

              {formData.exampleSentences.map((example, index) => (
                <View key={index} style={styles.exampleCard}>
                  <View style={styles.exampleRow}>
                    <View style={[styles.inputGroup, styles.flex1]}>
                      <Text style={styles.exampleLabel}>Tiếng Hàn</Text>
                      <TextInput
                        style={styles.input}
                        value={example.korean}
                        onChangeText={(text) => handleExampleChange(index, 'korean', text)}
                        placeholder="VD: 화입니다."
                        placeholderTextColor={colors.light.textSecondary}
                      />
                    </View>
                    <View style={[styles.inputGroup, styles.flex1]}>
                      <Text style={styles.exampleLabel}>Tiếng Việt</Text>
                      <TextInput
                        style={styles.input}
                        value={example.vietnamese}
                        onChangeText={(text) => handleExampleChange(index, 'vietnamese', text)}
                        placeholder="VD: Tôi là Hoa."
                        placeholderTextColor={colors.light.textSecondary}
                      />
                    </View>
                  </View>
                  {formData.exampleSentences.length > 1 && (
                    <TouchableOpacity
                      onPress={() => removeExample(index)}
                      style={styles.removeButton}
                    >
                      <HugeiconsIcon icon={Delete02Icon} size={16} color={palette.error} />
                      <Text style={styles.removeButtonText}>Xóa ví dụ</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>

            {/* Ngữ pháp tương đồng */}
            <View style={styles.inputGroup}>
              <View style={styles.examplesHeader}>
                <Text style={styles.label}>Ngữ pháp tương đồng</Text>
                {formData.similarGrammar.length < 5 && (
                  <TouchableOpacity onPress={addSimilarGrammar} style={styles.addButton}>
                    <HugeiconsIcon icon={Add01Icon} size={16} color={colors.light.primary} />
                    <Text style={styles.addButtonText}>Thêm</Text>
                  </TouchableOpacity>
                )}
              </View>

              {formData.similarGrammar.map((similar, index) => (
                <View key={index} style={styles.similarInputContainer}>
                  <TextInput
                    style={styles.input}
                    value={similar}
                    onChangeText={(text) => handleSimilarGrammarChange(index, text)}
                    placeholder="VD: 회사원입니다."
                    placeholderTextColor={colors.light.textSecondary}
                  />
                  {formData.similarGrammar.length > 1 && (
                    <TouchableOpacity
                      onPress={() => removeSimilarGrammar(index)}
                      style={styles.removeIconButton}
                    >
                      <HugeiconsIcon icon={Delete02Icon} size={18} color={palette.error} />
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
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  label: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fonts.semiBold,
    color: colors.light.text,
    marginBottom: 8,
  },
  required: {
    color: palette.error,
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
  textArea: {
    borderWidth: 1,
    borderColor: colors.light.border,
    borderRadius: 8,
    padding: 12,
    fontSize: typography.fontSizes.md,
    fontFamily: typography.fonts.regular,
    color: colors.light.text,
    backgroundColor: colors.light.card,
    minHeight: 80,
    textAlignVertical: 'top',
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
  selectContainer: {
    position: 'relative',
  },
  examplesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
  exampleCard: {
    borderWidth: 1,
    borderColor: colors.light.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  exampleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  exampleLabel: {
    fontSize: typography.fontSizes.xs,
    color: colors.light.textSecondary,
    fontFamily: typography.fonts.regular,
    marginBottom: 4,
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  removeButtonText: {
    fontSize: typography.fontSizes.sm,
    color: palette.error,
    fontFamily: typography.fonts.regular,
  },
  similarInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  removeIconButton: {
    padding: 8,
    marginLeft: 8,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.light.border,
    gap: 12,
  },
});

export default ModalGrammar;