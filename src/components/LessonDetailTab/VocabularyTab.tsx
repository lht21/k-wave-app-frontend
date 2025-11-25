import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { 
  Search01Icon, 
  Add01Icon, 
  VolumeHighIcon,
  VolumeOffIcon,
  Edit01Icon,
  Delete02Icon 
} from '@hugeicons/core-free-icons';
import * as Speech from 'expo-speech';

import Button from '../../components/Button/Button';
import { colors, palette } from '../../theme/colors';
import { typography } from '../../theme/typography';

// Types
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

interface VocabularyTabProps {
  vocabulary?: Vocabulary[];
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  onAddVocabulary?: () => void;
  onEditVocabulary?: (vocab: Vocabulary) => void;
  onDeleteVocabulary?: (vocabId: number) => void;
}

const VocabularyTab: React.FC<VocabularyTabProps> = ({
  vocabulary = [],
  searchTerm = '',
  onSearchChange = () => {},
  onAddVocabulary = () => {},
  onEditVocabulary = () => {},
  onDeleteVocabulary = () => {},
}) => {
  const [speakingWord, setSpeakingWord] = React.useState<number | null>(null);

  // Filter vocabulary based on search term
  const filteredVocabulary = vocabulary.filter(item => 
    item.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.meaning.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.pronunciation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeletePress = (vocabId: number, word: string): void => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc chắn muốn xóa từ "${word}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => onDeleteVocabulary(vocabId),
        },
      ]
    );
  };

  const speakText = async (text: string, wordId: number): Promise<void> => {
    try {
      // Dừng phát âm thanh hiện tại nếu có
      await Speech.stop();
      
      setSpeakingWord(wordId);
      
      await Speech.speak(text, {
        language: 'ko-KR',
        pitch: 1.0,
        rate: 0.8,
        onStart: () => {
          setSpeakingWord(wordId);
        },
        onDone: () => {
          setSpeakingWord(null);
        },
        onError: (error) => {
          console.log('Speech error:', error);
          setSpeakingWord(null);
          Alert.alert('Lỗi', 'Không thể phát âm thanh. Vui lòng thử lại.');
        },
        onStopped: () => {
          setSpeakingWord(null);
        }
      });
    } catch (error) {
      console.log('Speak error:', error);
      setSpeakingWord(null);
      Alert.alert('Lỗi', 'Không thể phát âm thanh. Vui lòng thử lại.');
    }
  };

  const stopSpeaking = async (): Promise<void> => {
    try {
      await Speech.stop();
      setSpeakingWord(null);
    } catch (error) {
      console.log('Stop speaking error:', error);
    }
  };

  const handleSpeakPress = async (text: string, wordId: number): Promise<void> => {
    if (speakingWord === wordId) {
      await stopSpeaking();
    } else {
      await speakText(text, wordId);
    }
  };

  const renderVocabularyItem = (item: Vocabulary, index: number): React.ReactElement => (
    <View key={item.id} style={styles.vocabCard}>
      {/* Header Row */}
      <View style={styles.cardHeader}>
        <View style={styles.wordMain}>
          <View style={styles.wordRow}>
            <Text style={styles.wordText}>{item.word}</Text>
            <Text style={styles.pronunciation}>[{item.pronunciation}]</Text>
          </View>
          <Text style={styles.meaning}>{item.meaning}</Text>
        </View>
        
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.speakBtn, speakingWord === item.id && styles.speakingActive]}
            onPress={() => handleSpeakPress(item.word, item.id)}
          >
            <HugeiconsIcon 
              icon={speakingWord === item.id ? VolumeOffIcon : VolumeHighIcon} 
              size={20} 
              color={speakingWord === item.id ? palette.error : colors.light.primary} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tags Row */}
      <View style={styles.tagsRow}>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{item.type}</Text>
        </View>
        <View style={[styles.tag, styles.categoryTag]}>
          <Text style={styles.tagText}>{item.category}</Text>
        </View>
        <View style={styles.spacer} />
        <View style={styles.editActions}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => onEditVocabulary(item)}
          >
            <HugeiconsIcon icon={Edit01Icon} size={18} color={colors.light.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleDeletePress(item.id, item.word)}
          >
            <HugeiconsIcon icon={Delete02Icon} size={18} color={palette.error} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Examples */}
      {item.examples.length > 0 && (
        <View style={styles.examplesSection}>
          <Text style={styles.examplesLabel}>Ví dụ:</Text>
          <View style={styles.examplesList}>
            {item.examples.map((example, exampleIndex) => (
              <Text key={exampleIndex} style={styles.exampleText}>
                • {example}
              </Text>
            ))}
          </View>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.header}>
        <View style={styles.searchSection}>
          <View style={styles.searchBox}>
            <HugeiconsIcon 
              icon={Search01Icon} 
              size={20} 
              color={colors.light.textSecondary}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm từ vựng..."
              placeholderTextColor={colors.light.textSecondary}
              value={searchTerm}
              onChangeText={onSearchChange}
            />
          </View>
          <Text style={styles.resultCount}>
            {filteredVocabulary.length} từ vựng
          </Text>
        </View>
        
        <Button
          title=""
          variant="primary"
          size="medium"
          onPress={onAddVocabulary}
          leftIcon={<HugeiconsIcon icon={Add01Icon} size={16} color={colors.light.background} />}
        />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {filteredVocabulary.length > 0 ? (
          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {filteredVocabulary.map(renderVocabularyItem)}
          </ScrollView>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>
              {searchTerm ? 'Không tìm thấy kết quả' : 'Chưa có từ vựng'}
            </Text>
            <Text style={styles.emptyDescription}>
              {searchTerm 
                ? 'Hãy thử tìm kiếm với từ khóa khác'
                : 'Bắt đầu xây dựng bộ từ vựng của bạn'
              }
            </Text>
            {!searchTerm && (
              <Button
                title="Thêm từ vựng đầu tiên"
                variant="primary"
                onPress={onAddVocabulary}
                leftIcon={<HugeiconsIcon icon={Add01Icon} size={16} color={colors.light.background} />}
              />
            )}
          </View>
        )}
      </View>
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
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 16,
    gap: 12,
  },
searchSection: {
  flex: 1,
  marginRight: 12,
},
searchBox: {
  flexDirection: 'row',
  alignItems: 'center',     
  paddingHorizontal: 12,
  borderWidth: 1,
  borderColor: colors.light.border,
  borderRadius: 24,
  backgroundColor: colors.light.card,
},
  searchIcon: {
    position: 'absolute',
    left: 12,
    top: 10,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    borderColor: colors.light.card,
    paddingRight: 20,
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fonts.regular,
    color: colors.light.text,
  },
  resultCount: {
    fontSize: typography.fontSizes.sm,
    color: colors.light.textSecondary,
    fontFamily: typography.fonts.regular,
    marginTop: 6,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 12,
  },
  vocabCard: {
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
    marginBottom: 12,
  },
  wordMain: {
    flex: 1,
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  wordText: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fonts.bold,
    color: colors.light.text,
    marginRight: 8,
  },
  pronunciation: {
    fontSize: typography.fontSizes.sm,
    color: colors.light.textSecondary,
    fontFamily: typography.fonts.regular,
  },
  meaning: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fonts.semiBold,
    color: colors.light.primary,
  },
  actions: {
    marginLeft: 8,
  },
  speakBtn: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: colors.light.primary + '15',
  },
  speakingActive: {
    backgroundColor: palette.error + '15',
  },
  tagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: colors.light.primary + '15',
    marginRight: 8,
  },
  categoryTag: {
    backgroundColor: palette.success + '15',
  },
  tagText: {
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fonts.semiBold,
    color: colors.light.text,
  },
  spacer: {
    flex: 1,
  },
  editActions: {
    flexDirection: 'row',
    gap: 4,
  },
  editBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: colors.light.background,
  },
  deleteBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: colors.light.background,
  },
  examplesSection: {
    borderTopWidth: 1,
    borderTopColor: colors.light.border + '30',
    paddingTop: 12,
  },
  examplesLabel: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fonts.semiBold,
    color: colors.light.textSecondary,
    marginBottom: 6,
  },
  examplesList: {
    gap: 4,
  },
  exampleText: {
    fontSize: typography.fontSizes.sm,
    color: colors.light.text,
    fontFamily: typography.fonts.regular,
    lineHeight: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: typography.fontSizes.lg,
    color: colors.light.text,
    fontFamily: typography.fonts.bold,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: typography.fontSizes.md,
    color: colors.light.textSecondary,
    fontFamily: typography.fonts.regular,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
});

export default VocabularyTab;