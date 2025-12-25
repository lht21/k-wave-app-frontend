// src/components/LessonDetailTab/GrammarTab.tsx
import React, { useState, useEffect, useCallback } from 'react';
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

  // Tải dữ liệu ngữ pháp
  const loadGrammar = useCallback(async () => {
    try {
      setLoading(true);
      const response = await grammarService.getGrammarByLesson(lessonId, {
        search: searchTerm,
        limit: 50
      });
      setData(response.grammar);
    } catch (error: any) {
      console.error('Error loading grammar:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách ngữ pháp');
    } finally {
      setLoading(false);
    }
  }, [lessonId, searchTerm]);

  useEffect(() => {
    loadGrammar();
  }, [loadGrammar]);

  const handleAddGrammar = () => {
    setEditingGrammar(null);
    setIsAdding(true);
    setIsModalOpen(true);
  };

  const handleEditGrammar = (item: Grammar) => {
    setEditingGrammar(item);
    setIsAdding(false);
    setIsModalOpen(true);
  };

  const handleDeleteGrammar = async (grammarId: string) => {
    Alert.alert('Xác nhận', 'Bạn có chắc chắn muốn xóa ngữ pháp này?', [
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
            Alert.alert('Lỗi', 'Không thể xóa ngữ pháp');
          }
        },
      },
    ]);
  };

  const handleSaveGrammar = async (grammarData: Grammar) => {
    try {
      if (isAdding) {
        await grammarService.createGrammarForLesson(lessonId, grammarData);
        Alert.alert('Thành công', 'Đã thêm ngữ pháp mới');
      } else if (editingGrammar?._id) {
        await grammarService.updateGrammar(editingGrammar._id, grammarData);
        Alert.alert('Thành công', 'Đã cập nhật ngữ pháp');
      }
      loadGrammar();
      setIsModalOpen(false);
    } catch (error: any) {
      Alert.alert('Lỗi', 'Không thể lưu dữ liệu');
    }
  };

  const renderGrammarCard = (item: Grammar) => (
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
            onPress={() => handleEditGrammar(item)}
          >
            <HugeiconsIcon icon={Edit01Icon} size={18} color={palette.warning} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]} 
            onPress={() => item._id && handleDeleteGrammar(item._id)}
          >
            <HugeiconsIcon icon={Delete02Icon} size={18} color={palette.error} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.infoSection}>
        <View style={styles.sectionHeader}>
          <HugeiconsIcon icon={InformationDiamondIcon} size={16} color={colors.light.primary} />
          <Text style={styles.sectionTitle}>Thông tin ngữ pháp</Text>
        </View>
        <View style={styles.infoGrid}>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Nghĩa:</Text><Text style={styles.infoValue}>{item.meaning}</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Giải thích:</Text><Text style={styles.infoValue}>{item.explanation}</Text></View>
          {item.usage && <View style={styles.infoRow}><Text style={styles.infoLabel}>Cách dùng:</Text><Text style={styles.infoValue}>{item.usage}</Text></View>}
        </View>
      </View>

      {item.exampleSentences && item.exampleSentences.length > 0 && (
        <View style={styles.examplesSection}>
          <View style={styles.sectionHeader}>
            <HugeiconsIcon icon={LicenseDraftIcon} size={16} color={palette.success} />
            <Text style={styles.sectionTitle}>Ví dụ minh họa</Text>
          </View>
          {item.exampleSentences.map((ex, idx) => (
            <View key={idx} style={styles.exampleCard}>
              <Text style={styles.exampleKorean}>{ex.korean}</Text>
              <Text style={styles.exampleVietnamese}>{ex.vietnamese}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchBox}>
          <HugeiconsIcon icon={Search01Icon} size={20} color={colors.light.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm ngữ pháp..."
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>
        <Button
          title="Thêm"
          variant="primary"
          size="small"
          onPress={handleAddGrammar}
          leftIcon={<HugeiconsIcon icon={Add01Icon} size={16} color="white" />}
        />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} color={colors.light.primary} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {data.length > 0 ? data.map(renderGrammarCard) : (
            <View style={styles.emptyState}><Text>Chưa có dữ liệu ngữ pháp</Text></View>
          )}
        </ScrollView>
      )}

      <ModalGrammar
        isVisible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        grammar={editingGrammar}
        onSave={handleSaveGrammar}
        isAdding={isAdding}
        lessonLevel={lessonLevel}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.light.background },
  header: { padding: 16, flexDirection: 'row', gap: 12, alignItems: 'center' },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, borderWidth: 1, borderColor: colors.light.border, borderRadius: 24, backgroundColor: colors.light.card },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, paddingVertical: 8, color: colors.light.text },
  scrollContent: { padding: 16, gap: 16 },
  grammarCard: { backgroundColor: 'white', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.light.border, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  structureContainer: { flex: 1 },
  structureText: { fontSize: 18, fontWeight: 'bold', color: colors.light.text },
  levelBadge: { backgroundColor: colors.light.primary + '20', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, alignSelf: 'flex-start', marginTop: 4 },
  levelText: { fontSize: 10, color: colors.light.primary, fontWeight: 'bold' },
  actionButtons: { flexDirection: 'row', gap: 8 },
  actionButton: { padding: 8, borderRadius: 8 },
  editButton: { backgroundColor: palette.warning + '15' },
  deleteButton: { backgroundColor: palette.error + '15' },
  infoSection: { marginBottom: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: colors.light.text },
  infoGrid: { gap: 6 },
  infoRow: { flexDirection: 'row' },
  infoLabel: { fontSize: 13, fontWeight: '600', color: colors.light.textSecondary, width: 80 },
  infoValue: { fontSize: 13, color: colors.light.text, flex: 1 },
  examplesSection: { borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 12 },
  exampleCard: { backgroundColor: '#f9f9f9', padding: 10, borderRadius: 8, marginBottom: 8 },
  exampleKorean: { fontSize: 14, color: colors.light.text, marginBottom: 2 },
  exampleVietnamese: { fontSize: 12, color: colors.light.textSecondary, fontStyle: 'italic' },
  emptyState: { alignItems: 'center', marginTop: 40 }
});

export default GrammarTab;