import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  Add01Icon,
  Edit01Icon,
  Delete02Icon,
  InformationDiamondIcon,
  LicenseDraftIcon,
  LinkIcon,
} from '@hugeicons/core-free-icons';

import Button from '../../components/Button/Button';
import ModalGrammar from '../Modal/ModalGrammar';
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

interface GrammarTabProps {
  grammarData?: Grammar[];
}

const initialGrammarData: Grammar[] = [
  {
    _id: '1',
    structure: 'Danh từ + 이/가 아닙니다',
    meaning: 'không phải là (danh từ)',
    explanation: 'Dạng phủ định của "입니다". Dùng khi nói lịch sự.',
    usage: 'Dùng trong câu trần thuật phủ định.',
    level: 'Sơ cấp 1',
    exampleSentences: [
      { korean: '저는 학생이 아닙니다.', vietnamese: 'Tôi không phải là học sinh.' },
      { korean: '여기는 학교가 아닙니다.', vietnamese: 'Đây không phải là trường học.' }
    ],
    similarGrammar: ['이/가 아니다', '아니에요', '아닙니까?']
  },
  {
    _id: '2',
    structure: 'Động từ/ Tính từ + -습니다/ -ㅂ니다',
    meaning: 'đuôi câu trần thuật lịch sự',
    explanation: 'Được dùng trong văn viết hoặc hoàn cảnh trang trọng.',
    usage: 'Dùng để kết thúc câu trần thuật hoặc mô tả lịch sự.',
    level: 'Sơ cấp 1',
    exampleSentences: [
      { korean: '저는 베트남에서 왔습니다.', vietnamese: 'Tôi đến từ Việt Nam.' },
      { korean: '한국어를 공부합니다.', vietnamese: 'Tôi học tiếng Hàn.' }
    ],
    similarGrammar: ['아요/어요', '-지요', '-네요']
  },
  {
    _id: '3',
    structure: 'Danh từ + 에서',
    meaning: 'ở (nơi diễn ra hành động)',
    explanation: 'Chỉ nơi chốn xảy ra hành động (khác với 에 chỉ vị trí tồn tại).',
    usage: 'Dùng sau danh từ chỉ địa điểm.',
    level: 'Sơ cấp 1',
    exampleSentences: [
      { korean: '학교에서 공부합니다.', vietnamese: 'Tôi học ở trường.' },
      { korean: '회사에서 일합니다.', vietnamese: 'Tôi làm việc ở công ty.' }
    ],
    similarGrammar: ['에', '으로', '에서부터']
  },
];

const GrammarTab: React.FC<GrammarTabProps> = ({
  grammarData = initialGrammarData,
}) => {
  const [data, setData] = useState<Grammar[]>(grammarData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGrammar, setEditingGrammar] = useState<Grammar | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleEditGrammar = (grammarItem: Grammar): void => {
    setEditingGrammar(grammarItem);
    setIsAdding(false);
    setIsModalOpen(true);
  };

  const handleAddGrammar = (): void => {
    setEditingGrammar(null);
    setIsAdding(true);
    setIsModalOpen(true);
  };

  const handleDeleteGrammar = (grammarId: string): void => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa ngữ pháp này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            setData(prev => prev.filter(item => item._id !== grammarId));
          },
        },
      ]
    );
  };

  const handleSaveGrammar = (grammarData: Grammar): void => {
    if (isAdding) {
      // Thêm mới
      const newGrammar: Grammar = {
        ...grammarData,
        _id: Date.now().toString(),
      };
      setData(prev => [...prev, newGrammar]);
    } else {
      // Cập nhật
      setData(prev =>
        prev.map(g => g._id === grammarData._id ? grammarData : g)
      );
    }
    setIsModalOpen(false);
    setEditingGrammar(null);
    setIsAdding(false);
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
            onPress={() => handleDeleteGrammar(grammar._id)}
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
      {grammar.exampleSentences.length > 0 && (
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
      {grammar.similarGrammar.length > 0 && (
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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>NGỮ PHÁP</Text>
          <Text style={styles.subtitle}>Tổng hợp ngữ pháp từ sơ cấp đến cao cấp</Text>
        </View>
        
        <Button
          title="Thêm ngữ pháp"
          variant="primary"
          size="small"
          onPress={handleAddGrammar}
          leftIcon={<HugeiconsIcon icon={Add01Icon} size={16} color={colors.light.background} />}
        />
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
            <Text style={styles.emptyTitle}>Chưa có nội dung ngữ pháp</Text>
            <Text style={styles.emptyDescription}>
              Bắt đầu xây dựng bộ ngữ pháp của bạn
            </Text>
            <Button
              title="Thêm ngữ pháp đầu tiên"
              variant="primary"
              onPress={handleAddGrammar}
              size='small'
              leftIcon={<HugeiconsIcon icon={Add01Icon} size={16} color={colors.light.background} />}
            />
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
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: colors.light.background,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fonts.bold,
    color: colors.light.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.light.textSecondary,
    fontFamily: typography.fonts.regular,
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