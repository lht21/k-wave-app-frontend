import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  Cancel01Icon,
  PlusSignIcon,
  Delete02Icon,
  FolderIcon,
} from '@hugeicons/core-free-icons';
import * as ImagePicker from 'expo-image-picker';
import Button from '../../components/Button/Button';
import { colors, palette } from '../../theme/colors';
import { typography } from '../../theme/typography';

// --- TYPES ---
type ContentType = 'text' | 'image';

interface ContentItem {
  type: ContentType;
  content: string;
  url?: string;
  caption?: string;
  localImage?: any;
}

interface VocabularyItem {
  word: string;
  meaning: string;
  pronunciation: string;
}

interface CultureData {
  id?: number;
  title: string;
  subtitle: string;
  category: string;
  image: any;
  icon: string;
  content: ContentItem[];
  vocabulary: VocabularyItem[];
}

interface ModalCultureProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'add' | 'edit';
  onSave: (data: CultureData) => void;
  culture?: CultureData | null;
}

const categories = [
  'Âm nhạc', 'Ẩm thực', 'Du lịch', 'Điện ảnh', 
  'Gia đình & Xã hội', 'Làm đẹp', 'Lễ hội', 'Lịch sử',
  'Trang phục', 'Trường học', 'Uống rượu', 'Ứng xử'
];

const ModalCulture: React.FC<ModalCultureProps> = ({
  isOpen,
  onClose,
  mode,
  onSave,
  culture
}) => {
  const [formData, setFormData] = useState<CultureData>({
    title: '',
    subtitle: '',
    category: 'Ứng xử',
    image: null,
    icon: '',
    content: [{ type: 'text', content: '' }],
    vocabulary: [{ word: '', meaning: '', pronunciation: '' }]
  });

  useEffect(() => {
    if (culture) {
      setFormData(culture);
    } else {
      // Reset form when adding new
      setFormData({
        title: '',
        subtitle: '',
        category: 'Ứng xử',
        image: null,
        icon: '',
        content: [{ type: 'text', content: '' }],
        vocabulary: [{ word: '', meaning: '', pronunciation: '' }]
      });
    }
  }, [culture, isOpen]);

  // Request permissions khi component mount
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Cần quyền truy cập', 'Ứng dụng cần quyền truy cập thư viện ảnh để chọn hình ảnh.');
      }
    })();
  }, []);

  const handleSubmit = () => {
    // Validate required fields
    if (!formData.title.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề');
      return;
    }
    if (!formData.subtitle.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mô tả ngắn');
      return;
    }
    if (!formData.image) {
      Alert.alert('Lỗi', 'Vui lòng chọn hình ảnh chính');
      return;
    }
    if (formData.content.some(item => item.type === 'text' && !item.content.trim())) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ nội dung văn bản');
      return;
    }
    if (formData.vocabulary.some(vocab => !vocab.word.trim() || !vocab.meaning.trim())) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ từ và nghĩa cho từ vựng');
      return;
    }

    onSave(formData);
  };

  const handleImagePick = async (field: 'image' | 'contentImage', contentIndex?: number) => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      console.log('Image picker result:', result);

      if (!result.canceled && result.assets && result.assets[0]) {
        const imageAsset = result.assets[0];
        
        if (field === 'image') {
          setFormData(prev => ({
            ...prev,
            image: { uri: imageAsset.uri }
          }));
        } else if (field === 'contentImage' && contentIndex !== undefined) {
          const newContent = [...formData.content];
          newContent[contentIndex] = {
            ...newContent[contentIndex],
            url: imageAsset.uri,
            localImage: { uri: imageAsset.uri }
          };
          setFormData(prev => ({ ...prev, content: newContent }));
        }
        
        Alert.alert('Thành công', 'Đã chọn hình ảnh thành công');
      } else if (result.canceled) {
        console.log('User cancelled image picker');
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Lỗi', 'Không thể chọn hình ảnh. Vui lòng thử lại.');
    }
  };

  const handleContentChange = (index: number, field: keyof ContentItem, value: string) => {
    const newContent = [...formData.content];
    newContent[index] = { ...newContent[index], [field]: value };
    setFormData(prev => ({ ...prev, content: newContent }));
  };

  const addContent = (type: ContentType) => {
    setFormData(prev => ({
      ...prev,
      content: [...prev.content, { type, content: '', url: '', caption: '' }]
    }));
  };

  const removeContent = (index: number) => {
    if (formData.content.length <= 1) {
      Alert.alert('Lỗi', 'Phải có ít nhất một phần nội dung');
      return;
    }
    
    const newContent = formData.content.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, content: newContent }));
  };

  const handleVocabularyChange = (index: number, field: keyof VocabularyItem, value: string) => {
    const newVocabulary = [...formData.vocabulary];
    newVocabulary[index] = { ...newVocabulary[index], [field]: value };
    setFormData(prev => ({ ...prev, vocabulary: newVocabulary }));
  };

  const addVocabulary = () => {
    setFormData(prev => ({
      ...prev,
      vocabulary: [...prev.vocabulary, { word: '', meaning: '', pronunciation: '' }]
    }));
  };

  const removeVocabulary = (index: number) => {
    if (formData.vocabulary.length <= 1) {
      Alert.alert('Lỗi', 'Phải có ít nhất một từ vựng');
      return;
    }
    
    const newVocabulary = formData.vocabulary.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, vocabulary: newVocabulary }));
  };

  if (!isOpen) return null;

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>
                {mode === 'add' ? 'Thêm Bài Văn Hóa Mới' : 'Chỉnh Sửa Bài Văn Hóa'}
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <HugeiconsIcon icon={Cancel01Icon} size={24} color={colors.light.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Thông tin cơ bản */}
              <View style={styles.section}>                
                <View style={styles.formRow}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Tiêu đề <Text style={styles.required}>*</Text></Text>
                    <TextInput
                      value={formData.title}
                      onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
                      style={styles.textInput}
                      placeholder="Nhập tiêu đề..."
                      placeholderTextColor={colors.light.textSecondary}
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Thể loại <Text style={styles.required}>*</Text></Text>
                    <View style={styles.pickerContainer}>
                      <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false}
                        style={styles.categoryScroll}
                      >
                        <View style={styles.categoryContainer}>
                          {categories.map(category => (
                            <TouchableOpacity
                              key={category}
                              style={[
                                styles.categoryChip,
                                formData.category === category && styles.categoryChipActive
                              ]}
                              onPress={() => setFormData(prev => ({ ...prev, category }))}
                            >
                              <Text style={[
                                styles.categoryChipText,
                                formData.category === category && styles.categoryChipTextActive
                              ]}>
                                {category}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </ScrollView>
                    </View>
                  </View>
                </View>

                <View style={styles.formRow}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Mô tả ngắn <Text style={styles.required}>*</Text></Text>
                    <TextInput
                      value={formData.subtitle}
                      onChangeText={(text) => setFormData(prev => ({ ...prev, subtitle: text }))}
                      style={styles.textInput}
                      placeholder="Nhập mô tả ngắn..."
                      placeholderTextColor={colors.light.textSecondary}
                      multiline
                    />
                  </View>
                </View>

                <View style={styles.formRow}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Hình ảnh chính <Text style={styles.required}>*</Text></Text>
                    <TouchableOpacity 
                      style={styles.imagePicker}
                      onPress={() => handleImagePick('image')}
                    >
                      {formData.image ? (
                        <Image source={formData.image} style={styles.selectedImage} />
                      ) : (
                        <View style={styles.imagePlaceholder}>
                          <HugeiconsIcon icon={FolderIcon} size={32} color={colors.light.textSecondary} />
                          <Text style={styles.imagePlaceholderText}>Chọn hình ảnh</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>URL icon</Text>
                    <TextInput
                      value={formData.icon}
                      onChangeText={(text) => setFormData(prev => ({ ...prev, icon: text }))}
                      style={styles.textInput}
                      placeholder="/icons/culture/example.svg"
                      placeholderTextColor={colors.light.textSecondary}
                    />
                  </View>
                </View>
              </View>

              {/* Nội dung chi tiết */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Nội dung</Text>
                  <View style={styles.sectionActions}>
                    <Button 
                      title="Thêm văn bản"
                      variant="primary"
                      size="small"
                      onPress={() => addContent('text')}
                                        />
                    <Button 
                      title="Thêm ảnh"
                      variant="primary"
                      size="small"
                      onPress={() => addContent('image')}
                    />
                  </View>
                </View>

                <View style={styles.contentList}>
                  {formData.content.map((item, index) => (
                    <View key={index} style={styles.contentItem}>
                      <View style={styles.contentHeader}>
                        <Text style={styles.contentType}>
                          {item.type === 'text' ? 'Văn bản' : 'Hình ảnh'}
                        </Text>
                        <TouchableOpacity
                          onPress={() => removeContent(index)}
                          style={styles.deleteButton}
                        >
                          <HugeiconsIcon icon={Delete02Icon} size={16} color={palette.error} />
                        </TouchableOpacity>
                      </View>

                      {item.type === 'text' ? (
                        <TextInput
                          value={item.content}
                          onChangeText={(text) => handleContentChange(index, 'content', text)}
                          style={[styles.textInput, styles.textArea]}
                          placeholder="Nhập nội dung văn bản..."
                          placeholderTextColor={colors.light.textSecondary}
                          multiline
                          numberOfLines={4}
                          textAlignVertical="top"
                        />
                      ) : (
                        <View style={styles.imageInputs}>
                          <TouchableOpacity 
                            style={styles.imagePicker}
                            onPress={() => handleImagePick('contentImage', index)}
                          >
                            {item.localImage || item.url ? (
                              <Image 
                                source={item.localImage || { uri: item.url }} 
                                style={styles.selectedImage} 
                              />
                            ) : (
                              <View style={styles.imagePlaceholder}>
                                <HugeiconsIcon icon={FolderIcon} size={24} color={colors.light.textSecondary} />
                                <Text style={styles.imagePlaceholderText}>Chọn hình ảnh</Text>
                              </View>
                            )}
                          </TouchableOpacity>
                          <TextInput
                            value={item.caption}
                            onChangeText={(text) => handleContentChange(index, 'caption', text)}
                            style={styles.textInput}
                            placeholder="Chú thích hình ảnh"
                            placeholderTextColor={colors.light.textSecondary}
                          />
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              </View>

              {/* Từ vựng liên quan */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Từ vựng liên quan</Text>
                  <Button 
                    title="Thêm từ vựng"
                    variant="primary"
                    size="small"
                    onPress={addVocabulary}
                  />
                </View>

                <View style={styles.vocabularyList}>
                  {formData.vocabulary.map((vocab, index) => (
                    <View key={index} style={styles.vocabularyItem}>
                      <View style={styles.vocabularyHeader}>
                        <Text style={styles.vocabularyTitle}>Từ vựng #{index + 1}</Text>
                        <TouchableOpacity
                          onPress={() => removeVocabulary(index)}
                          style={styles.deleteButton}
                        >
                          <HugeiconsIcon icon={Delete02Icon} size={16} color={palette.error} />
                        </TouchableOpacity>
                      </View>
                      
                      <View style={styles.vocabularyInputs}>
                        <View style={styles.inputGroup}>
                          <Text style={styles.smallLabel}>Từ <Text style={styles.required}>*</Text></Text>
                          <TextInput
                            value={vocab.word}
                            onChangeText={(text) => handleVocabularyChange(index, 'word', text)}
                            style={styles.textInput}
                            placeholder="Nhập từ..."
                            placeholderTextColor={colors.light.textSecondary}
                          />
                        </View>
                        
                        <View style={styles.inputGroup}>
                          <Text style={styles.smallLabel}>Nghĩa <Text style={styles.required}>*</Text></Text>
                          <TextInput
                            value={vocab.meaning}
                            onChangeText={(text) => handleVocabularyChange(index, 'meaning', text)}
                            style={styles.textInput}
                            placeholder="Nhập nghĩa..."
                            placeholderTextColor={colors.light.textSecondary}
                          />
                        </View>
                        
                        <View style={styles.inputGroup}>
                          <Text style={styles.smallLabel}>Phát âm</Text>
                          <TextInput
                            value={vocab.pronunciation}
                            onChangeText={(text) => handleVocabularyChange(index, 'pronunciation', text)}
                            style={styles.textInput}
                            placeholder="Nhập phát âm..."
                            placeholderTextColor={colors.light.textSecondary}
                          />
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionSection}>
                <Button 
                  title="Hủy"
                  variant="primary"
                  onPress={onClose}
                  />
                <Button 
                  title={mode === 'add' ? 'Thêm Bài Văn Hóa' : 'Lưu Thay Đổi'}
                  variant="primary"
                  size='small'
                  onPress={handleSubmit}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// Styles giữ nguyên...
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: colors.light.background,
    borderRadius: 12,
    width: '100%',
    maxHeight: '90%',
    shadowColor: colors.light.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  headerTitle: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fonts.semiBold,
    color: colors.light.text,
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    maxHeight: '100%',
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.md,
    fontFamily: typography.fonts.semiBold,
    color: colors.light.text,
  },
  sectionActions: {
    flexDirection: 'row',
    gap: 8,
  },
  formRow: {
    gap: 16,
    marginBottom: 16,
  },
  inputGroup: {
    flex: 1,
  },
  label: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fonts.regular,
    color: colors.light.text,
    marginBottom: 8,
  },
  smallLabel: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fonts.regular,
    color: colors.light.textSecondary,
    marginBottom: 4,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.light.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: typography.fontSizes.sm,
    color: colors.light.text,
    backgroundColor: colors.light.card,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.light.border,
    borderRadius: 8,
    backgroundColor: colors.light.card,
  },
  categoryScroll: {
    maxHeight: 50,
  },
  categoryContainer: {
    flexDirection: 'row',
    padding: 8,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.light.background,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  categoryChipActive: {
    backgroundColor: colors.light.primary,
    borderColor: colors.light.primary,
  },
  categoryChipText: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fonts.regular,
    color: colors.light.text,
  },
  categoryChipTextActive: {
    color: colors.light.white,
    fontFamily: typography.fonts.regular,
  },
  imagePicker: {
    borderWidth: 1,
    borderColor: colors.light.border,
    borderRadius: 8,
    backgroundColor: colors.light.card,
    overflow: 'hidden',
  },
  imagePlaceholder: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.light.background,
  },
  imagePlaceholderText: {
    marginTop: 8,
    fontSize: typography.fontSizes.sm,
    color: colors.light.textSecondary,
    fontFamily: typography.fonts.regular,
  },
  selectedImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  contentList: {
    gap: 16,
  },
  contentItem: {
    borderWidth: 1,
    borderColor: colors.light.border,
    borderRadius: 8,
    padding: 16,
    backgroundColor: colors.light.card,
  },
  contentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  contentType: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fonts.regular,
    color: colors.light.text,
  },
  deleteButton: {
    padding: 4,
  },
  imageInputs: {
    gap: 12,
  },
  vocabularyList: {
    gap: 16,
  },
  vocabularyItem: {
    borderWidth: 1,
    borderColor: colors.light.border,
    borderRadius: 8,
    padding: 16,
    backgroundColor: colors.light.card,
  },
  vocabularyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  vocabularyTitle: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fonts.regular,
    color: colors.light.text,
  },
  vocabularyInputs: {
    gap: 12,
  },
  actionSection: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.light.border,
  },
    required: { color: palette.error },
});

export default ModalCulture;