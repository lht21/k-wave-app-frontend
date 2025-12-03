// src/components/LessonDetailTab/VocabularyTab.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  ActivityIndicator
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
import { Vocabulary } from '../../services/vocabularyService';

interface VocabularyTabProps {
  vocabulary?: Vocabulary[];
  loading?: boolean;
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  onAddVocabulary?: () => void;
  onEditVocabulary?: (vocab: Vocabulary) => void;
  onDeleteVocabulary?: (vocabId: string) => void;
}

const VocabularyTab: React.FC<VocabularyTabProps> = ({
  vocabulary = [],
  loading = false,
  searchTerm = '',
  onSearchChange = () => {},
  onAddVocabulary = () => {},
  onEditVocabulary = () => {},
  onDeleteVocabulary = () => {},
}) => {
  const [speakingWord, setSpeakingWord] = useState<string | null>(null);
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // Filter vocabulary locally first (client-side filtering)
  const filteredVocabulary = vocabulary.filter(item => 
    item.word.toLowerCase().includes(localSearchTerm.toLowerCase()) ||
    item.meaning.toLowerCase().includes(localSearchTerm.toLowerCase()) ||
    (item.pronunciation && item.pronunciation.toLowerCase().includes(localSearchTerm.toLowerCase()))
  );

  // Debounce search - wait 500ms before calling onSearchChange
  const handleSearchChange = useCallback((text: string) => {
    setLocalSearchTerm(text);
    
    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    
    // Set new timer for 500ms
    const timer = setTimeout(() => {
      onSearchChange(text);
    }, 500);
    
    setDebounceTimer(timer);
  }, [debounceTimer, onSearchChange]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  // Update local search term when prop changes (from parent)
  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  const handleDeletePress = (vocabId: string, word: string): void => {
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

  const speakText = async (text: string, wordId: string): Promise<void> => {
    try {
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

  const handleSpeakPress = async (text: string, wordId: string): Promise<void> => {
    if (speakingWord === wordId) {
      await stopSpeaking();
    } else {
      await speakText(text, wordId);
    }
  };

  const renderVocabularyItem = (item: Vocabulary): React.ReactElement => (
    <View key={item._id} style={styles.vocabCard}>
      {/* Header Row */}
      <View style={styles.cardHeader}>
        <View style={styles.wordMain}>
          <View style={styles.wordRow}>
            <Text style={styles.wordText}>{item.word}</Text>
            {item.pronunciation && (
              <Text style={styles.pronunciation}>[{item.pronunciation}]</Text>
            )}
          </View>
          <Text style={styles.meaning}>{item.meaning}</Text>
        </View>
        
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.speakBtn, speakingWord === item._id && styles.speakingActive]}
            onPress={() => handleSpeakPress(item.word, item._id!)}
          >
            <HugeiconsIcon 
              icon={speakingWord === item._id ? VolumeOffIcon : VolumeHighIcon} 
              size={20} 
              color={speakingWord === item._id ? palette.error : colors.light.primary} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tags Row */}
      <View style={styles.tagsRow}>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{item.type}</Text>
        </View>
        {item.category && (
          <View style={[styles.tag, styles.categoryTag]}>
            <Text style={styles.tagText}>{item.category}</Text>
          </View>
        )}
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
            onPress={() => handleDeletePress(item._id!, item.word)}
          >
            <HugeiconsIcon icon={Delete02Icon} size={18} color={palette.error} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Examples */}
      {item.examples && item.examples.length > 0 && (
        <View style={styles.examplesSection}>
          <Text style={styles.examplesLabel}>Ví dụ:</Text>
          <View style={styles.examplesList}>
            {item.examples.map((example, index) => (
              <Text key={index} style={styles.exampleText}>
                • {example}
              </Text>
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
        <Text style={styles.loadingText}>Đang tải từ vựng...</Text>
      </View>
    );
  }

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
              value={localSearchTerm}
              onChangeText={handleSearchChange}
              returnKeyType="search"
            />
            {localSearchTerm.length > 0 && (
              <TouchableOpacity
                style={styles.clearSearchButton}
                onPress={() => handleSearchChange('')}
              >
                <Text style={styles.clearSearchText}>×</Text>
              </TouchableOpacity>
            )}
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
              {localSearchTerm ? 'Không tìm thấy kết quả' : 'Chưa có từ vựng'}
            </Text>
            <Text style={styles.emptyDescription}>
              {localSearchTerm 
                ? 'Hãy thử tìm kiếm với từ khóa khác'
                : 'Bắt đầu xây dựng bộ từ vựng của bạn'
              }
            </Text>
            {!localSearchTerm && (
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
    position: 'relative',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fonts.regular,
    color: colors.light.text,
    paddingRight: 40, // Space for clear button
  },
  clearSearchButton: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },
  clearSearchText: {
    fontSize: 20,
    color: colors.light.textSecondary,
    fontWeight: 'bold',
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