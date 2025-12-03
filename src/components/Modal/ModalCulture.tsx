import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity, Modal,
  StyleSheet, Alert, KeyboardAvoidingView, Platform, Image, ActivityIndicator
} from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Cancel01Icon, Delete02Icon, FolderIcon } from '@hugeicons/core-free-icons';
import * as ImagePicker from 'expo-image-picker';
import Button from '../Button/Button'; // Chỉnh lại đường dẫn import nếu cần
import { colors, palette } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { cultureService, Culture } from '../../services/cultureService';

interface ModalCultureProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'add' | 'edit';
  onSave: (data: Partial<Culture>) => void;
  culture?: Culture | null;
}

const categories = [
  'Âm nhạc', 'Ẩm thực', 'Du lịch', 'Điện ảnh', 
  'Gia đình & Xã hội', 'Làm đẹp', 'Lễ hội', 'Lịch sử',
  'Trang phục', 'Trường học', 'Uống rượu', 'Ứng xử'
];

const ModalCulture: React.FC<ModalCultureProps> = ({
  isOpen, onClose, mode, onSave, culture
}) => {
  const [formData, setFormData] = useState<Partial<Culture>>({
    title: '', subtitle: '', category: 'Ứng xử',
    image: '', icon: '',
    content: [{ type: 'text', content: '' }],
    vocabulary: [{ word: '', meaning: '', pronunciation: '' }]
  });
  
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (culture) {
      setFormData(culture);
    } else {
      resetForm();
    }
  }, [culture, isOpen]);

  const resetForm = () => {
    setFormData({
      title: '', subtitle: '', category: 'Ứng xử',
      image: '', icon: '',
      content: [{ type: 'text', content: '' }],
      vocabulary: [{ word: '', meaning: '', pronunciation: '' }]
    });
  };

  const handleImagePick = async (field: 'image' | 'contentImage', contentIndex?: number) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const localUri = result.assets[0].uri;
        
        // Upload ngay lập tức
        setUploading(true);
        try {
          console.log('📤 Uploading image...', localUri);
          const serverUrl = await cultureService.uploadImage(localUri);
          console.log('✅ Upload success:', serverUrl);

          if (field === 'image') {
            setFormData(prev => ({ ...prev, image: serverUrl }));
          } else if (field === 'contentImage' && contentIndex !== undefined) {
            const newContent = [...(formData.content || [])];
            newContent[contentIndex] = {
              ...newContent[contentIndex],
              url: serverUrl // Lưu URL từ server
            };
            setFormData(prev => ({ ...prev, content: newContent }));
          }
        } catch (error: any) {
          Alert.alert('Lỗi Upload', error.message || 'Không thể upload ảnh lên server');
        } finally {
          setUploading(false);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      setUploading(false);
    }
  };

  const handleSubmit = () => {
    if (!formData.title?.trim() || !formData.subtitle?.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề và mô tả');
      return;
    }
    if (!formData.image) {
      Alert.alert('Lỗi', 'Vui lòng upload hình ảnh chính');
      return;
    }

    onSave(formData);
  };

  // Helper functions for content manipulation
  const updateContent = (index: number, field: string, value: string) => {
    const newContent = [...(formData.content || [])];
    newContent[index] = { ...newContent[index], [field]: value };
    setFormData({ ...formData, content: newContent });
  };

  const addContent = (type: 'text' | 'image') => {
    setFormData({
      ...formData,
      content: [...(formData.content || []), { type, content: '', url: '', caption: '' }]
    });
  };

  const removeContent = (index: number) => {
    const newContent = (formData.content || []).filter((_, i) => i !== index);
    setFormData({ ...formData, content: newContent });
  };

  // Helper functions for vocabulary
  const updateVocab = (index: number, field: string, value: string) => {
    const newVocab = [...(formData.vocabulary || [])];
    newVocab[index] = { ...newVocab[index], [field] : value } as any;
    setFormData({ ...formData, vocabulary: newVocab });
  };

  const addVocab = () => {
    setFormData({
      ...formData,
      vocabulary: [...(formData.vocabulary || []), { word: '', meaning: '', pronunciation: '' }]
    });
  };

  const removeVocab = (index: number) => {
    const newVocab = (formData.vocabulary || []).filter((_, i) => i !== index);
    setFormData({ ...formData, vocabulary: newVocab });
  };

  if (!isOpen) return null;

  return (
    <Modal visible={isOpen} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>{mode === 'add' ? 'Thêm Bài Văn Hóa' : 'Sửa Bài Văn Hóa'}</Text>
              <TouchableOpacity onPress={onClose}><HugeiconsIcon icon={Cancel01Icon} size={24} color={colors.light.text} /></TouchableOpacity>
            </View>

            <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
              {/* Image Upload Status */}
              {uploading && (
                <View style={styles.uploadingBanner}>
                  <ActivityIndicator size="small" color={palette.primary} />
                  <Text style={styles.uploadingText}>Đang upload ảnh lên server...</Text>
                </View>
              )}

              {/* Main Info */}
              <View style={styles.section}>
                <Text style={styles.label}>Tiêu đề *</Text>
                <TextInput 
                  style={styles.input} 
                  value={formData.title} 
                  onChangeText={t => setFormData({...formData, title: t})}
                  placeholder="Nhập tiêu đề"
                />

                <Text style={styles.label}>Mô tả ngắn *</Text>
                <TextInput 
                  style={[styles.input, { height: 60 }]} 
                  multiline 
                  value={formData.subtitle} 
                  onChangeText={t => setFormData({...formData, subtitle: t})}
                  placeholder="Nhập mô tả ngắn"
                />

                <Text style={styles.label}>Thể loại</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
                  {categories.map(cat => (
                    <TouchableOpacity 
                      key={cat} 
                      style={[styles.chip, formData.category === cat && styles.activeChip]}
                      onPress={() => setFormData({...formData, category: cat})}
                    >
                      <Text style={[styles.chipText, formData.category === cat && styles.activeChipText]}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Text style={styles.label}>Hình ảnh chính (Bìa) *</Text>
                <TouchableOpacity style={styles.imagePicker} onPress={() => handleImagePick('image')} disabled={uploading}>
                  {formData.image ? (
                    <Image source={{ uri: formData.image }} style={styles.imagePreview} />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <HugeiconsIcon icon={FolderIcon} size={32} color={colors.light.textSecondary} />
                      <Text style={{ color: colors.light.textSecondary }}>Chọn ảnh bìa</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>

              {/* Content Section */}
              <View style={styles.section}>
                <View style={styles.rowBetween}>
                  <Text style={styles.sectionTitle}>Nội dung bài viết</Text>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Button title="+ Text" size="small" onPress={() => addContent('text')} />
                    <Button title="+ Ảnh" size="small" onPress={() => addContent('image')} />
                  </View>
                </View>

                {formData.content?.map((item, index) => (
                  <View key={index} style={styles.cardItem}>
                    <View style={styles.rowBetween}>
                      <Text style={styles.itemLabel}>{item.type === 'text' ? 'Đoạn văn' : 'Hình ảnh'}</Text>
                      <TouchableOpacity onPress={() => removeContent(index)}>
                        <HugeiconsIcon icon={Delete02Icon} size={18} color={palette.error} />
                      </TouchableOpacity>
                    </View>

                    {item.type === 'text' ? (
                      <TextInput 
                        style={[styles.input, { height: 80 }]} 
                        multiline 
                        value={item.content}
                        onChangeText={t => updateContent(index, 'content', t)}
                        placeholder="Nội dung đoạn văn..."
                      />
                    ) : (
                      <>
                        <TouchableOpacity 
                          style={styles.imagePickerSmall} 
                          onPress={() => handleImagePick('contentImage', index)}
                          disabled={uploading}
                        >
                          {item.url ? (
                            <Image source={{ uri: item.url }} style={styles.imagePreviewSmall} />
                          ) : (
                            <Text style={{ color: colors.light.textSecondary }}>+ Upload ảnh minh họa</Text>
                          )}
                        </TouchableOpacity>
                        <TextInput 
                          style={[styles.input, { marginTop: 8 }]}
                          value={item.caption}
                          onChangeText={t => updateContent(index, 'caption', t)}
                          placeholder="Chú thích ảnh (tùy chọn)"
                        />
                      </>
                    )}
                  </View>
                ))}
              </View>

              {/* Vocabulary Section */}
              <View style={styles.section}>
                <View style={styles.rowBetween}>
                  <Text style={styles.sectionTitle}>Từ vựng</Text>
                  <Button title="+ Thêm từ" size="small" onPress={addVocab} />
                </View>
                {formData.vocabulary?.map((vocab, index) => (
                  <View key={index} style={styles.cardItem}>
                    <View style={styles.rowBetween}>
                      <Text style={styles.itemLabel}>Từ vựng {index + 1}</Text>
                      <TouchableOpacity onPress={() => removeVocab(index)}>
                        <HugeiconsIcon icon={Delete02Icon} size={18} color={palette.error} />
                      </TouchableOpacity>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <TextInput style={[styles.input, { flex: 1 }]} placeholder="Từ (Hàn)" value={vocab.word} onChangeText={t => updateVocab(index, 'word', t)} />
                      <TextInput style={[styles.input, { flex: 1 }]} placeholder="Nghĩa (Việt)" value={vocab.meaning} onChangeText={t => updateVocab(index, 'meaning', t)} />
                    </View>
                    <TextInput style={styles.input} placeholder="Phát âm" value={vocab.pronunciation} onChangeText={t => updateVocab(index, 'pronunciation', t)} />
                  </View>
                ))}
              </View>

            </ScrollView>

            <View style={styles.footer}>
              <Button title="Hủy" variant="outline" onPress={onClose} disabled={uploading} />
              <Button title={uploading ? "Đang xử lý..." : "Lưu"} variant="primary" onPress={handleSubmit} disabled={uploading} />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 16 },
  modal: { backgroundColor: colors.light.background, borderRadius: 12, maxHeight: '90%', flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderColor: colors.light.border },
  headerTitle: { fontSize: 18, fontFamily: typography.fonts.bold },
  contentContainer: { padding: 16 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontFamily: typography.fonts.bold, marginBottom: 8 },
  label: { fontSize: 14, fontFamily: typography.fonts.semiBold, marginBottom: 6, color: colors.light.text },
  input: { borderWidth: 1, borderColor: colors.light.border, borderRadius: 8, padding: 10, marginBottom: 12, backgroundColor: colors.light.card },
  
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: colors.light.border, marginRight: 8, backgroundColor: colors.light.card },
  activeChip: { backgroundColor: colors.light.primary, borderColor: colors.light.primary },
  chipText: { fontSize: 12, color: colors.light.text },
  activeChipText: { color: 'white' },

  imagePicker: { height: 150, borderWidth: 1, borderColor: colors.light.border, borderRadius: 8, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', marginBottom: 12, overflow: 'hidden' },
  imagePlaceholder: { alignItems: 'center' },
  imagePreview: { width: '100%', height: '100%' },

  cardItem: { backgroundColor: colors.light.card, padding: 12, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: colors.light.border },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  itemLabel: { fontSize: 14, fontFamily: typography.fonts.bold, color: colors.light.primary },

  imagePickerSmall: { height: 100, borderWidth: 1, borderColor: colors.light.border, borderRadius: 8, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  imagePreviewSmall: { width: '100%', height: '100%', borderRadius: 8 },

  footer: { flexDirection: 'row', gap: 12, padding: 16, borderTopWidth: 1, borderColor: colors.light.border, justifyContent: 'flex-end' },
  uploadingBanner: { flexDirection: 'row', alignItems: 'center', padding: 8, backgroundColor: colors.light.primary + '15', marginBottom: 10, borderRadius: 6 },
  uploadingText: { marginLeft: 8, fontSize: 12, color: colors.light.primary }
});

export default ModalCulture;