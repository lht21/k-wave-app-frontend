// src/components/Modal/ModalLesson.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Switch,
  StyleSheet,
  Alert,
  Platform
} from 'react-native';
import { colors, palette } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Lesson } from '../../services/lessonService';

// SỬA INTERFACE - Dùng interface từ lessonService
interface ModalLessonProps {
  isVisible: boolean;
  onClose: () => void;
  lesson?: Lesson | null;
  onSave: (data: Omit<Lesson, '_id' | 'viewCount' | 'completionCount' | 'author'>) => void;
}

const ModalLesson: React.FC<ModalLessonProps> = ({
  isVisible,
  onClose,
  lesson,
  onSave
}) => {
  const [formData, setFormData] = useState({
    code: '',
    title: '',
    description: '',
    level: 'Sơ cấp 1',
    order: 1,
    estimatedDuration: 60,
    isPremium: false
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (lesson) {
      setFormData({
        code: lesson.code,
        title: lesson.title,
        description: lesson.description,
        level: lesson.level,
        order: lesson.order,
        estimatedDuration: lesson.estimatedDuration || 60,
        isPremium: lesson.isPremium || false
      });
    } else {
      setFormData({
        code: '',
        title: '',
        description: '',
        level: 'Sơ cấp 1',
        order: 1,
        estimatedDuration: 60,
        isPremium: false
      });
    }
    setErrors({});
  }, [lesson, isVisible]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.code.trim()) {
      newErrors.code = 'Mã bài học là bắt buộc';
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Tên bài học là bắt buộc';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Mô tả là bắt buộc';
    }

    if (formData.order <= 0) {
      newErrors.order = 'Thứ tự phải lớn hơn 0';
    }

    if (formData.estimatedDuration <= 0) {
      newErrors.estimatedDuration = 'Thời lượng phải lớn hơn 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = (): void => {
    if (!validateForm()) {
      Alert.alert('Lỗi', 'Vui lòng kiểm tra lại thông tin');
      return;
    }

    onSave(formData);
    onClose();
  };

  const handleChange = (field: string, value: string | number | boolean): void => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Component để hiển thị label với dấu * màu đỏ
  const RequiredLabel: React.FC<{ children: string }> = ({ children }) => (
    <Text style={styles.label}>
      {children}
      <Text style={styles.requiredStar}> *</Text>
    </Text>
  );

  const levels = ['Sơ cấp 1', 'Sơ cấp 2', 'Trung cấp 3', 'Trung cấp 4', 'Cao cấp 5', 'Cao cấp 6'];

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
              {lesson ? 'Chỉnh sửa Bài học' : 'Thêm Bài học Mới'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Code */}
            <View style={styles.formGroup}>
              <RequiredLabel>Mã bài học</RequiredLabel>
              <TextInput
                style={[
                  styles.input,
                  errors.code && styles.inputError
                ]}
                value={formData.code}
                onChangeText={(value) => handleChange('code', value)}
                placeholder="VD: BÀI 1"
                placeholderTextColor={colors.light.textSecondary}
              />
              {errors.code && <Text style={styles.errorText}>{errors.code}</Text>}
            </View>

            {/* Title */}
            <View style={styles.formGroup}>
              <RequiredLabel>Tên bài học</RequiredLabel>
              <TextInput
                style={[
                  styles.input,
                  errors.title && styles.inputError
                ]}
                value={formData.title}
                onChangeText={(value) => handleChange('title', value)}
                placeholder="VD: 0 - 알파벳 Bảng chữ cái"
                placeholderTextColor={colors.light.textSecondary}
              />
              {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
            </View>

            {/* Description */}
            <View style={styles.formGroup}>
              <RequiredLabel>Mô tả</RequiredLabel>
              <TextInput
                style={[
                  styles.textArea,
                  errors.description && styles.inputError
                ]}
                value={formData.description}
                onChangeText={(value) => handleChange('description', value)}
                placeholder="Mô tả về bài học..."
                placeholderTextColor={colors.light.textSecondary}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
              {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
            </View>

            {/* Level */}
            <View style={styles.formGroup}>
              <Text style={styles.label}>Cấp độ</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.levelScroll}
              >
                <View style={styles.levelContainer}>
                  {levels.map((level) => (
                    <TouchableOpacity
                      key={level}
                      style={[
                        styles.levelOption,
                        formData.level === level && styles.levelOptionSelected
                      ]}
                      onPress={() => handleChange('level', level)}
                    >
                      <Text style={[
                        styles.levelText,
                        formData.level === level && styles.levelTextSelected
                      ]}>
                        {level}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Order */}
            <View style={styles.formGroup}>
              <RequiredLabel>Thứ tự</RequiredLabel>
              <TextInput
                style={[
                  styles.input,
                  errors.order && styles.inputError
                ]}
                value={formData.order.toString()}
                onChangeText={(value) => handleChange('order', parseInt(value) || 0)}
                placeholder="1"
                placeholderTextColor={colors.light.textSecondary}
                keyboardType="numeric"
              />
              {errors.order && <Text style={styles.errorText}>{errors.order}</Text>}
            </View>

            {/* Estimated Duration */}
            <View style={styles.formGroup}>
              <RequiredLabel>Thời lượng ước tính (phút)</RequiredLabel>
              <TextInput
                style={[
                  styles.input,
                  errors.estimatedDuration && styles.inputError
                ]}
                value={formData.estimatedDuration.toString()}
                onChangeText={(value) => handleChange('estimatedDuration', parseInt(value) || 0)}
                placeholder="60"
                placeholderTextColor={colors.light.textSecondary}
                keyboardType="numeric"
              />
              {errors.estimatedDuration && <Text style={styles.errorText}>{errors.estimatedDuration}</Text>}
            </View>

            {/* Premium Switch */}
            <View style={styles.switchContainer}>
              <Text style={styles.label}>Bài học Premium</Text>
              <Switch
                value={formData.isPremium}
                onValueChange={(value) => handleChange('isPremium', value)}
                trackColor={{ false: colors.light.border, true: colors.light.primary }}
                thumbColor={colors.light.card}
              />
            </View>

            {formData.isPremium && (
              <View style={styles.premiumNote}>
                <Text style={styles.premiumNoteText}>
                  Bài học Premium chỉ dành cho thành viên trả phí
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.button, styles.outlineButton]}
              onPress={onClose}
            >
              <Text style={styles.outlineButtonText}>Hủy</Text>
            </TouchableOpacity>
            
            <View style={styles.spacer} />
            
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleSave}
            >
              <Text style={styles.primaryButtonText}>
                {lesson ? 'Cập nhật' : 'Thêm mới'}
              </Text>
            </TouchableOpacity>
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
    backgroundColor: colors.light.card,
    borderRadius: 16,
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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  modalTitle: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fonts.bold,
    color: colors.light.text,
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 24,
    color: colors.light.textSecondary,
    fontWeight: 'bold',
  },
  modalContent: {
    padding: 20,
    maxHeight: 400,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.light.border,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fonts.semiBold,
    color: colors.light.text,
    marginBottom: 8,
  },
  requiredStar: {
    color: palette.error,
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fonts.semiBold,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.light.border,
    borderRadius: 8,
    padding: 12,
    fontSize: typography.fontSizes.sm,
    color: colors.light.text,
    backgroundColor: colors.light.card,
    fontFamily: typography.fonts.regular,
  },
  textArea: {
    borderWidth: 1,
    borderColor: colors.light.border,
    borderRadius: 8,
    padding: 12,
    fontSize: typography.fontSizes.sm,
    color: colors.light.text,
    backgroundColor: colors.light.card,
    minHeight: 80,
    fontFamily: typography.fonts.regular,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: palette.error,
  },
  errorText: {
    fontSize: typography.fontSizes.xs,
    color: palette.error,
    marginTop: 4,
    fontFamily: typography.fonts.regular,
  },
  row: {
    flexDirection: 'row',
  },
  flex1: {
    flex: 1,
  },
  marginLeft: {
    marginLeft: 8,
  },
  spacer: {
    width: 12,
  },
  levelScroll: {
    marginHorizontal: -4,
  },
  levelContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
  },
  levelOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.light.border,
    backgroundColor: colors.light.card,
  },
  levelOptionSelected: {
    backgroundColor: colors.light.primary,
    borderColor: colors.light.primary,
  },
  levelText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fonts.regular,
    color: colors.light.text,
  },
  levelTextSelected: {
    color: colors.light.card,
    fontFamily: typography.fonts.semiBold,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  premiumNote: {
    backgroundColor: colors.light.background,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: palette.purple,
    marginBottom: 30,
  },
  premiumNoteText: {
    fontSize: typography.fontSizes.sm,
    color: colors.light.textSecondary,
    fontFamily: typography.fonts.regular,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: colors.light.primary,
  },
  outlineButton: {
    backgroundColor: colors.light.card,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  primaryButtonText: {
    color: colors.light.card,
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fonts.semiBold,
  },
  outlineButtonText: {
    color: colors.light.text,
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fonts.semiBold,
  },
});

export default ModalLesson;