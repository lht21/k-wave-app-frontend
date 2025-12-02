import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Dimensions } from 'react-native';
import { colors, palette } from '../theme/colors';
import { spacing } from '../theme/spacing';

interface WordInfo {
  korean: string;
  phonetic: string;
  meaning: string;
  topik: string;
  category: string;
}

interface WordPopupProps {
  visible: boolean;
  onClose: () => void;
  wordInfo: WordInfo | null;
  position: { x: number; y: number };
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const WordPopup: React.FC<WordPopupProps> = ({ visible, onClose, wordInfo, position }) => {
  if (!wordInfo) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <TouchableOpacity 
          style={[
            styles.popupContainer,
            {
              left: Math.max(10, Math.min(position.x - 160, screenWidth - 330)),
              top: Math.max(10, Math.min(position.y, screenHeight - 300))
            }
          ]}
          activeOpacity={1}
        >
          {/* Language flags */}
          <View style={styles.flagsContainer}>
            <View style={styles.vietnameseFlag}>
              <Text style={styles.flagText}>🇻🇳 VI</Text>
            </View>
            <View style={styles.englishFlag}>
              <Text style={styles.englishFlagText}>🏴󠁧󠁢󠁥󠁮󠁧󠁿 EN</Text>
            </View>
          </View>

          {/* Word and phonetic */}
          <View style={styles.wordContainer}>
            <View style={styles.wordHeader}>
              <Text style={styles.koreanWord}>{wordInfo.korean}</Text>
              <Text style={styles.phonetic}>{wordInfo.phonetic}</Text>
              <TouchableOpacity style={styles.speakerButton}>
                <Text style={styles.speakerIcon}>🔊</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.categoryInfo}>
              [{wordInfo.category}] • {wordInfo.topik}
            </Text>
          </View>

          {/* Category badge */}
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>⭐ {wordInfo.category}</Text>
          </View>

          {/* Meaning */}
          <View style={styles.meaningContainer}>
            <Text style={styles.meaningText}>{wordInfo.meaning}</Text>
          </View>

          {/* Note section */}
          <View style={styles.noteContainer}>
            <Text style={styles.noteText}>📝 Thêm ghi chú</Text>
          </View>

          {/* Action buttons */}
          <View style={styles.actionContainer}>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Xem thêm</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Sao chép</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>

          {/* Example sentence */}
          <View style={styles.exampleContainer}>
            <Text style={styles.exampleText}>검증을 거치는데요</Text>
            <Text style={styles.exampleText}>일부 매장에만 제품을 넣은 뒤 판매의 추이를 보</Text>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  popupContainer: {
    position: 'absolute',
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: spacing.md,
    width: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  flagsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  vietnameseFlag: {
    backgroundColor: '#DC2626',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 4,
  },
  flagText: {
    color: palette.white,
    fontSize: 12,
    fontWeight: '600',
  },
  englishFlag: {
    backgroundColor: palette.white,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 4,
  },
  englishFlagText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '600',
  },
  wordContainer: {
    marginBottom: spacing.md,
  },
  wordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: 4,
  },
  koreanWord: {
    color: '#FB923C',
    fontSize: 18,
    fontWeight: '500',
  },
  phonetic: {
    color: '#D1D5DB',
    fontSize: 14,
  },
  speakerButton: {
    padding: 4,
  },
  speakerIcon: {
    fontSize: 16,
    color: palette.white,
  },
  categoryInfo: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  categoryBadge: {
    marginBottom: spacing.md,
  },
  categoryBadgeText: {
    color: '#FCD34D',
    fontSize: 14,
  },
  meaningContainer: {
    marginBottom: spacing.md,
  },
  meaningText: {
    color: '#FB923C',
    fontSize: 14,
    fontWeight: '500',
  },
  noteContainer: {
    marginBottom: spacing.md,
  },
  noteText: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#4B5563',
    paddingTop: spacing.md,
    marginBottom: spacing.md,
  },
  actionButton: {
    padding: 4,
  },
  actionButtonText: {
    color: '#D1D5DB',
    fontSize: 14,
  },
  closeButton: {
    backgroundColor: '#EA580C',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 6,
  },
  closeButtonText: {
    color: palette.white,
    fontSize: 14,
    fontWeight: '600',
  },
  exampleContainer: {
    gap: 4,
  },
  exampleText: {
    color: '#9CA3AF',
    fontSize: 12,
  },
});

export default WordPopup;