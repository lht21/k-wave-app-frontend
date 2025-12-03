// src/components/LessonDetailTab/GrammarTab.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  Add01Icon,
  Edit01Icon,
  Delete02Icon,
  InformationDiamondIcon,
  LicenseDraftIcon,
  LinkIcon,
  Search01Icon,
} from '@hugeicons/core-free-icons';

import Button from '../../components/Button/Button';
import ModalGrammar from '../Modal/ModalGrammar';
import { colors, palette } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { grammarService, Grammar } from '../../services/grammarService';

interface GrammarTabProps {
  lessonId: string; 
  lessonLevel?: string; 
}

const GrammarTab: React.FC<GrammarTabProps> = ({
  lessonId, 
  lessonLevel = 'Sơ cấp 1',
}) => {
  const [data, setData] = useState<Grammar[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGrammar, setEditingGrammar] = useState<Grammar | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Load grammar từ API
  const loadGrammar = async () => {
    try {
      setLoading(true);
      const response = await grammarService.getGrammarByLesson(lessonId, {
        search: searchTerm,
        limit: 50
      });
      setData(response.grammar);
    } catch (error: any) {
      console.error('Error loading grammar:', error);
      Alert.alert('Lỗi', error.message || 'Không thể tải ngữ pháp');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (lessonId) {
      loadGrammar();
    }
  }, [lessonId, searchTerm]);


  const handleAddGrammar = (): void => {
    setEditingGrammar(null);
    setIsAdding(true);
    setIsModalOpen(true);
  };

  const handleEditGrammar = (grammarItem: Grammar): void => {
    setEditingGrammar(grammarItem);
    setIsAdding(false);
    setIsModalOpen(true);
  };

  const handleDeleteGrammar = async (grammarId: string): Promise<void> => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa ngữ pháp này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await grammarService.deleteGrammar(grammarId);
              Alert.alert('Thành công', 'Đã xóa ngữ pháp');
              loadGrammar();
            } catch (error: any) {
              Alert.alert('Lỗi', error.message || 'Không thể xóa ngữ pháp');
            }
          },
        },
      ]
    );
  };

  // ✅ SỬA: Sử dụng API mới cho lesson
  const handleSaveGrammar = async (grammarData: Grammar): Promise<void> => {
    try {
      if (isAdding) {
        // ✅ DÙNG API MỚI: Tạo grammar cho lesson
        const newGrammar = await grammarService.createGrammarForLesson(
          lessonId,
          grammarData
        );
        Alert.alert('Thành công', 'Đã thêm ngữ pháp mới');
      } else if (editingGrammar && editingGrammar._id) {
        // Update grammar (vẫn dùng API cũ)
        await grammarService.updateGrammar(editingGrammar._id, grammarData);
        Alert.alert('Thành công', 'Đã cập nhật ngữ pháp');
      }
      
      // Reload data
      await loadGrammar();
      
      // Close modal
      setIsModalOpen(false);
      setEditingGrammar(null);
      setIsAdding(false);
    } catch (error: any) {
      console.error('Error saving grammar:', error);
      Alert.alert('Lỗi', error.message || 'Không thể lưu ngữ pháp');
    }
  };

  const handleCloseModal = (): void => {
    setIsModalOpen(false);
    setEditingGrammar(null);
    setIsAdding(false);
  };

  const renderGrammarCard = (grammar: Grammar): React.ReactElement => (
    <View key={grammar._id} style={styles.grammarCard}>
      {/* Header với cấu trúc và action buttons */}
      <View style={styles.cardHeader}>
        <View style={styles.structureContainer}>
          <Text style={styles.structureText}>{grammar.structure}</Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>{grammar.level}</Text>
          </View>
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => handleEditGrammar(grammar)}
          >
            <HugeiconsIcon icon={Edit01Icon} size={18} color={palette.warning} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => grammar._id && handleDeleteGrammar(grammar._id)}
          >
            <HugeiconsIcon icon={Delete02Icon} size={18} color={palette.error} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Thông tin ngữ pháp */}
      <View style={styles.infoSection}>
        <View style={styles.sectionHeader}>
          <HugeiconsIcon icon={InformationDiamondIcon} size={16} color={colors.light.primary} />
          <Text style={styles.sectionTitle}>Thông tin ngữ pháp</Text>
        </View>
        
        <View style={styles.infoGrid}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nghĩa:</Text>
            <Text style={styles.infoValue}>{grammar.meaning}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Giải thích:</Text>
            <Text style={styles.infoValue}>{grammar.explanation}</Text>
          </View>
          {grammar.usage && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Cách dùng:</Text>
              <Text style={styles.infoValue}>{grammar.usage}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Ví dụ minh họa */}
      {grammar.exampleSentences && grammar.exampleSentences.length > 0 && (
        <View style={styles.examplesSection}>
          <View style={styles.sectionHeader}>
            <HugeiconsIcon icon={LicenseDraftIcon} size={16} color={palette.success} />
            <Text style={styles.sectionTitle}>Ví dụ minh họa</Text>
          </View>
          
          <View style={styles.examplesList}>
            {grammar.exampleSentences.map((example, index) => (
              <View key={index} style={styles.exampleCard}>
                <View style={styles.exampleHeader}>
                  <Text style={styles.exampleKorean}>{example.korean}</Text>
                  <View style={styles.exampleIndex}>
                    <Text style={styles.exampleIndexText}>#{index + 1}</Text>
                  </View>
                </View>
                <Text style={styles.exampleVietnamese}>{example.vietnamese}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Ngữ pháp tương đồng */}
      {grammar.similarGrammar && grammar.similarGrammar.length > 0 && (
        <View style={styles.similarSection}>
          <View style={styles.sectionHeader}>
            <HugeiconsIcon icon={LinkIcon} size={16} color={palette.purple} />
            <Text style={styles.sectionTitle}>Ngữ pháp tương đồng</Text>
          </View>
          
          <View style={styles.similarTags}>
            {grammar.similarGrammar.map((similar, index) => (
              <View key={index} style={styles.similarTag}>
                <Text style={styles.similarTagText}>{similar}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.light.primary} />
        <Text style={styles.loadingText}>Đang tải ngữ pháp...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header với search */}
      <View style={styles.header}>
      
        <View style={styles.searchContainer}>
          <View style={styles.searchBox}>
            <HugeiconsIcon 
              icon={Search01Icon} 
              size={20} 
              color={colors.light.textSecondary}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm ngữ pháp..."
              placeholderTextColor={colors.light.textSecondary}
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
          </View>
          
          <Button
            title="Thêm"
            variant="primary"
            size="small"
            onPress={handleAddGrammar}
            leftIcon={<HugeiconsIcon icon={Add01Icon} size={16} color={colors.light.background} />}
          />
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {data.length > 0 ? (
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {data.map(renderGrammarCard)}
          </ScrollView>
        ) : (
          <View style={styles.emptyState}>
            <HugeiconsIcon icon={LicenseDraftIcon} size={48} color={colors.light.border} />
            <Text style={styles.emptyTitle}>
              {searchTerm ? 'Không tìm thấy kết quả' : 'Chưa có nội dung ngữ pháp'}
            </Text>
            <Text style={styles.emptyDescription}>
              {searchTerm 
                ? 'Hãy thử tìm kiếm với từ khóa khác'
                : 'Bắt đầu xây dựng bộ ngữ pháp của bạn'
              }
            </Text>
            {!searchTerm && (
              <Button
                title="Thêm ngữ pháp đầu tiên"
                variant="primary"
                onPress={handleAddGrammar}
                size='small'
                leftIcon={<HugeiconsIcon icon={Add01Icon} size={16} color={colors.light.background} />}
              />
            )}
          </View>
        )}
      </View>

      {/* Modal */}
      <ModalGrammar
        isVisible={isModalOpen}
        onClose={handleCloseModal}
        grammar={editingGrammar}
        onSave={handleSaveGrammar}
        isAdding={isAdding}
        lessonLevel={lessonLevel}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: typography.fontSizes.md,
    color: colors.light.textSecondary,
    fontFamily: typography.fonts.regular,
  },
  header: {
    padding: 16,
    backgroundColor: colors.light.background,
    gap: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.light.border,
    borderRadius: 24,
    backgroundColor: colors.light.card,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fonts.regular,
    color: colors.light.text,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  grammarCard: {
    backgroundColor: colors.light.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.light.border,
    shadowColor: colors.light.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  structureContainer: {
    flex: 1,
  },
  structureText: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fonts.bold,
    color: colors.light.text,
    marginBottom: 8,
  },
  levelBadge: {
    backgroundColor: colors.light.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  levelText: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fonts.semiBold,
    color: colors.light.primary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 12,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
  },
  editButton: {
    backgroundColor: palette.warning + '15',
  },
  deleteButton: {
    backgroundColor: palette.error + '15',
  },
  infoSection: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.md,
    fontFamily: typography.fonts.semiBold,
    color: colors.light.text,
  },
  infoGrid: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
  },
  infoLabel: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fonts.semiBold,
    color: colors.light.textSecondary,
    width: 80,
    flexShrink: 0,
  },
  infoValue: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fonts.regular,
    color: colors.light.text,
    flex: 1,
    lineHeight: 20,
  },
  examplesSection: {
    marginBottom: 16,
  },
  examplesList: {
    gap: 12,
  },
  exampleCard: {
    backgroundColor: colors.light.background,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.light.border + '30',
  },
  exampleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  exampleKorean: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fonts.regular,
    color: colors.light.text,
    flex: 1,
    lineHeight: 20,
  },
  exampleIndex: {
    backgroundColor: colors.light.background,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  exampleIndexText: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fonts.semiBold,
    color: colors.light.textSecondary,
  },
  exampleVietnamese: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fonts.regular,
    color: colors.light.textSecondary,
    lineHeight: 18,
  },
  similarSection: {
    marginBottom: 8,
  },
  similarTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  similarTag: {
    backgroundColor: palette.purple + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  similarTagText: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fonts.regular,
    color: palette.purple,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fonts.bold,
    color: colors.light.text,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: typography.fontSizes.md,
    fontFamily: typography.fonts.regular,
    color: colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
});

export default GrammarTab;