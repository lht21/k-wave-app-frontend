import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { colors, palette } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Grammar } from '../../services/grammarService';

// Định nghĩa Props tương tự VocabularyTab
interface GrammarTabProps {
  grammar?: Grammar[];
  loading?: boolean;
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  onAddGrammar?: () => void;
  onEditGrammar?: (grammar: Grammar) => void;
  onDeleteGrammar?: (grammarId: string) => void;
}

const GrammarTab: React.FC<GrammarTabProps> = ({
  grammar = [],
  loading = false,
  searchTerm = '',
  onSearchChange = () => {},
  onAddGrammar = () => {},
  onEditGrammar = () => {},
  onDeleteGrammar = () => {},
}) => {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // 1. Logic lọc local để UI mượt mà (Tương tự VocabularyTab)
  const filteredGrammar = useMemo(() => {
    return grammar.filter(item => 
      item.structure.toLowerCase().includes(localSearchTerm.toLowerCase()) ||
      item.meaning.toLowerCase().includes(localSearchTerm.toLowerCase()) ||
      item.explanation.toLowerCase().includes(localSearchTerm.toLowerCase())
    );
  }, [grammar, localSearchTerm]);

  // 2. Xử lý Debounce search
  const handleSearchChange = useCallback((text: string) => {
    setLocalSearchTerm(text);
    if (debounceTimer) clearTimeout(debounceTimer);
    
    const timer = setTimeout(() => {
      onSearchChange(text);
    }, 500);
    setDebounceTimer(timer);
  }, [debounceTimer, onSearchChange]);

  // Sync local state khi prop từ cha thay đổi
  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  const handleDeletePress = (grammarId: string, structure: string): void => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc chắn muốn xóa ngữ pháp "${structure}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => onDeleteGrammar(grammarId),
        },
      ]
    );
  };

  const renderGrammarCard = (item: Grammar): React.ReactElement => (
    <View key={item._id} style={styles.grammarCard}>
      <View style={styles.cardHeader}>
        <View style={styles.structureContainer}>
          <Text style={styles.structureText}>{item.structure}</Text>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>{item.level}</Text>
          </View>
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => onEditGrammar(item)}
          >
            <HugeiconsIcon icon={Edit01Icon} size={18} color={palette.warning} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => item._id && handleDeletePress(item._id, item.structure)}
          >
            <HugeiconsIcon icon={Delete02Icon} size={18} color={palette.error} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.infoSection}>
        <View style={styles.sectionHeader}>
          <HugeiconsIcon icon={InformationDiamondIcon} size={16} color={colors.light.primary} />
          <Text style={styles.sectionTitle}>Thông tin</Text>
        </View>
        <View style={styles.infoGrid}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nghĩa:</Text>
            <Text style={styles.infoValue}>{item.meaning}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Giải thích:</Text>
            <Text style={styles.infoValue}>{item.explanation}</Text>
          </View>
        </View>
      </View>

      {item.exampleSentences && item.exampleSentences.length > 0 && (
        <View style={styles.examplesSection}>
          <View style={styles.sectionHeader}>
            <HugeiconsIcon icon={LicenseDraftIcon} size={16} color={palette.success} />
            <Text style={styles.sectionTitle}>Ví dụ</Text>
          </View>
          {item.exampleSentences.slice(0, 2).map((ex, idx) => (
            <View key={idx} style={styles.exampleMiniCard}>
              <Text style={styles.exampleKorean}>{ex.korean}</Text>
              <Text style={styles.exampleVietnamese}>{ex.vietnamese}</Text>
            </View>
          ))}
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
      <View style={styles.header}>
        <View style={styles.searchBox}>
          <HugeiconsIcon icon={Search01Icon} size={20} color={colors.light.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm ngữ pháp..."
            value={localSearchTerm}
            onChangeText={handleSearchChange}
          />
        </View>
        <Button
          title=""
          variant="primary"
          onPress={onAddGrammar}
          leftIcon={<HugeiconsIcon icon={Add01Icon} size={16} color={colors.light.background} />}
        />
      </View>

      <View style={styles.content}>
        {filteredGrammar.length > 0 ? (
          <ScrollView 
            style={styles.scrollView} 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {filteredGrammar.map(renderGrammarCard)}
          </ScrollView>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>{localSearchTerm ? 'Không tìm thấy' : 'Chưa có ngữ pháp'}</Text>
            {!localSearchTerm && <Button title="Thêm ngữ pháp" variant="primary" onPress={onAddGrammar} size="small" />}
          </View>
        )}
      </View>
    </View>
  );
};

// ... Styles giữ nguyên từ GrammarTab cũ của bạn hoặc chỉnh sửa cho gọn ...
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.light.background },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 12, fontSize: typography.fontSizes.md, color: colors.light.textSecondary },
    header: { flexDirection: 'row', padding: 16, gap: 12, alignItems: 'center' },
    searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, borderWidth: 1, borderColor: colors.light.border, borderRadius: 24, backgroundColor: colors.light.card },
    searchIcon: { marginRight: 8 },
    searchInput: { flex: 1, paddingVertical: 10, fontSize: typography.fontSizes.sm, color: colors.light.text },
    content: { flex: 1 },
    scrollView: { flex: 1 },
    scrollContent: { padding: 16, gap: 16 },
    grammarCard: { backgroundColor: colors.light.card, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.light.border, elevation: 2 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    structureContainer: { flex: 1 },
    structureText: { fontSize: typography.fontSizes.lg, fontFamily: typography.fonts.bold, color: colors.light.text },
    levelBadge: { backgroundColor: colors.light.primary + '20', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start', marginTop: 4 },
    levelText: { fontSize: typography.fontSizes.xs, color: colors.light.primary, fontFamily: typography.fonts.semiBold },
    actionButtons: { flexDirection: 'row', gap: 8 },
    actionButton: { padding: 6, borderRadius: 6 },
    editButton: { backgroundColor: palette.warning + '15' },
    deleteButton: { backgroundColor: palette.error + '15' },
    infoSection: { marginBottom: 12 },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
    sectionTitle: { fontSize: typography.fontSizes.sm, fontFamily: typography.fonts.semiBold, color: colors.light.text },
    infoGrid: { gap: 4 },
    infoRow: { flexDirection: 'row' },
    infoLabel: { fontSize: typography.fontSizes.xs, color: colors.light.textSecondary, width: 70 },
    infoValue: { fontSize: typography.fontSizes.xs, color: colors.light.text, flex: 1 },
    examplesSection: { borderTopWidth: 1, borderTopColor: colors.light.border + '50', paddingTop: 12 },
    exampleMiniCard: { marginBottom: 8 },
    exampleKorean: { fontSize: typography.fontSizes.xs, color: colors.light.text, fontFamily: typography.fonts.regular },
    exampleVietnamese: { fontSize: typography.fontSizes.xs, color: colors.light.textSecondary },
    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    emptyTitle: { fontSize: typography.fontSizes.md, color: colors.light.textSecondary, marginBottom: 12 }
});

export default GrammarTab;