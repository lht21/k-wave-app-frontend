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
  type: string; // paragraph, email, sentence
  prompt: string;
  instruction: string;
  wordHint: string[];
  grammarHint: string[];
  minWords: number;
  level: string;
  sampleAnswer: string;
  sampleTranslation: string;
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
    minWords: 50,
    level: 'Sơ cấp 1',
    sampleAnswer: '',
    sampleTranslation: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (writing) {
      setFormData({
        title: writing.title,
        type: writing.type,
        prompt: writing.prompt,
        instruction: writing.instruction,
        wordHint: writing.wordHint.length > 0 ? [...writing.wordHint] : [''],
        grammarHint: writing.grammarHint.length > 0 ? [...writing.grammarHint] : [''],
        minWords: writing.minWords,
        level: writing.level,
        sampleAnswer: writing.sampleAnswer,
        sampleTranslation: writing.sampleTranslation,
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
      minWords: 50,
      level: 'Sơ cấp 1',
      sampleAnswer: '',
      sampleTranslation: '',
    });
  };

  const handleFieldChange = <K extends keyof WritingFormData>(
    field: K,
    value: WritingFormData[K]
  ): void => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Array handlers
  const handleArrayChange = (field: 'wordHint' | 'grammarHint', index: number, value: string) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    handleFieldChange(field, newArray);
  };

  const addArrayItem = (field: 'wordHint' | 'grammarHint') => {
    handleFieldChange(field, [...formData[field], '']);
  };

  const removeArrayItem = (field: 'wordHint' | 'grammarHint', index: number) => {
    const newArray = formData[field].filter((_, i) => i !== index);
    handleFieldChange(field, newArray.length > 0 ? newArray : ['']);
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.title.trim()) newErrors.title = 'Vui lòng nhập tiêu đề';
    if (!formData.prompt.trim()) newErrors.prompt = 'Vui lòng nhập đề bài';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    const cleanData = {
      ...formData,
      wordHint: formData.wordHint.filter(t => t.trim() !== ''),
      grammarHint: formData.grammarHint.filter(t => t.trim() !== ''),
    };

    onSave({
      _id: writing?._id || Date.now().toString(),
      ...cleanData,
    });
  };

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
                  placeholder="VD: Bài viết sơ cấp 1"
                />
              </View>
              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.flex1]}>
                  <Text style={styles.label}>Loại bài</Text>
                  <TextInput style={styles.input} value={formData.type} onChangeText={(text) => handleFieldChange('type', text)} />
                </View>
                <View style={[styles.inputGroup, styles.flex1]}>
                  <Text style={styles.label}>Cấp độ</Text>
                  <TextInput style={styles.input} value={formData.level} onChangeText={(text) => handleFieldChange('level', text)} />
                </View>
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Số từ tối thiểu</Text>
                <TextInput
                  style={styles.input}
                  value={formData.minWords.toString()}
                  keyboardType="numeric"
                  onChangeText={(text) => handleFieldChange('minWords', parseInt(text) || 0)}
                />
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
                  multiline numberOfLines={3}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Hướng dẫn</Text>
                <TextInput
                  style={styles.input}
                  value={formData.instruction}
                  onChangeText={(text) => handleFieldChange('instruction', text)}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Bài mẫu</Text>
                <TextInput
                  style={styles.textArea}
                  value={formData.sampleAnswer}
                  onChangeText={(text) => handleFieldChange('sampleAnswer', text)}
                  multiline numberOfLines={4}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Dịch bài mẫu</Text>
                <TextInput
                  style={styles.textArea}
                  value={formData.sampleTranslation}
                  onChangeText={(text) => handleFieldChange('sampleTranslation', text)}
                  multiline numberOfLines={4}
                />
              </View>
            </View>

            {/* Gợi ý */}
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
                  />
                  <TouchableOpacity onPress={() => removeArrayItem('wordHint', index)}>
                    <HugeiconsIcon icon={Delete02Icon} size={20} color={palette.error} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

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
                  />
                  <TouchableOpacity onPress={() => removeArrayItem('grammarHint', index)}>
                    <HugeiconsIcon icon={Delete02Icon} size={20} color={palette.error} />
                  </TouchableOpacity>
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
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  modalContainer: { backgroundColor: colors.light.background, borderRadius: 12, width: '100%', height: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderColor: colors.light.border },
  modalTitle: { fontSize: typography.fontSizes.lg, fontFamily: typography.fonts.bold, color: colors.light.text },
  closeButton: { padding: 4 },
  modalContent: { padding: 16 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: typography.fontSizes.md, fontFamily: typography.fonts.bold, color: colors.light.primary, marginBottom: 12 },
  inputGroup: { marginBottom: 12 },
  row: { flexDirection: 'row', gap: 12 },
  flex1: { flex: 1 },
  label: { fontSize: typography.fontSizes.sm, fontFamily: typography.fonts.semiBold, color: colors.light.text, marginBottom: 6 },
  required: { color: palette.error },
  input: { borderWidth: 1, borderColor: colors.light.border, borderRadius: 8, padding: 10, backgroundColor: colors.light.card },
  textArea: { borderWidth: 1, borderColor: colors.light.border, borderRadius: 8, padding: 10, backgroundColor: colors.light.card, textAlignVertical: 'top', minHeight: 80 },
  inputError: { borderColor: palette.error },
  modalFooter: { flexDirection: 'row', padding: 16, borderTopWidth: 1, borderColor: colors.light.border, gap: 12 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  listItem: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
});

export default ModalWriting;