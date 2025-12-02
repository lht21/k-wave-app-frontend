import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { spacing } from '../theme/spacing';
import { colors, palette } from '../theme/colors';
import { RootStackParamList } from '../types/navigation';
import ClickableText from '../components/ClickableText';
import WordPopup from '../components/WordPopup';
import { useWordPopup } from '../hooks/useWordPopup';

type WordPopupDemoNavigationProp = StackNavigationProp<RootStackParamList>;

const WordPopupDemo: React.FC = () => {
  const navigation = useNavigation<WordPopupDemoNavigationProp>();
  const { wordInfo, popupVisible, popupPosition, handleWordPress, closePopup } = useWordPopup();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Demo Word Popup</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nhấn vào từ tiếng Hàn để xem nghĩa:</Text>
          
          <View style={styles.exampleContainer}>
            <Text style={styles.exampleLabel}>Câu ví dụ 1:</Text>
            <ClickableText
              text="학생이 선생님에게 인사했습니다."
              onWordPress={handleWordPress}
              style={styles.exampleText}
            />
          </View>

          <View style={styles.exampleContainer}>
            <Text style={styles.exampleLabel}>Câu ví dụ 2:</Text>
            <ClickableText
              text="나라 프랑스에서 미식을 공부하고 있습니다."
              onWordPress={handleWordPress}
              style={styles.exampleText}
            />
          </View>

          <View style={styles.exampleContainer}>
            <Text style={styles.exampleLabel}>Câu ví dụ 3:</Text>
            <ClickableText
              text="매력적인 한국어를 재미있게 공부해보세요!"
              onWordPress={handleWordPress}
              style={styles.exampleText}
            />
          </View>

          <View style={styles.instructionContainer}>
            <Text style={styles.instructionTitle}>📖 Hướng dẫn sử dụng:</Text>
            <Text style={styles.instructionText}>• Nhấn vào bất kỳ từ tiếng Hàn nào</Text>
            <Text style={styles.instructionText}>• Popup sẽ hiển thị nghĩa, phiên âm và thông tin từ</Text>
            <Text style={styles.instructionText}>• Nhấn "Đóng" hoặc bên ngoài popup để đóng</Text>
            <Text style={styles.instructionText}>• Tính năng này có sẵn trong các bài thi</Text>
          </View>

          <View style={styles.featureContainer}>
            <Text style={styles.featureTitle}>✨ Tính năng bao gồm:</Text>
            <Text style={styles.featureText}>• Tra cứu từ điển tức thì</Text>
            <Text style={styles.featureText}>• Hiển thị phiên âm tiếng Hàn</Text>
            <Text style={styles.featureText}>• Phân loại từ (danh từ, động từ, tính từ)</Text>
            <Text style={styles.featureText}>• Thông tin cấp độ TOPIK</Text>
            <Text style={styles.featureText}>• Ghi chú và lưu từ vựng</Text>
          </View>
        </View>
      </ScrollView>

      {/* Word Popup */}
      <WordPopup
        visible={popupVisible}
        onClose={closePopup}
        wordInfo={wordInfo}
        position={popupPosition}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: '#269a56ff',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 20,
    color: palette.white,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.white,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  section: {
    paddingVertical: spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.light.text,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  exampleContainer: {
    backgroundColor: palette.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exampleLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: spacing.sm,
  },
  exampleText: {
    fontSize: 18,
    lineHeight: 28,
    color: colors.light.text,
  },
  instructionContainer: {
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    padding: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2E7D32',
    marginBottom: spacing.md,
  },
  instructionText: {
    fontSize: 14,
    color: '#2E7D32',
    lineHeight: 22,
    marginBottom: spacing.xs,
  },
  featureContainer: {
    backgroundColor: '#FFF3CD',
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#856404',
    marginBottom: spacing.md,
  },
  featureText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 22,
    marginBottom: spacing.xs,
  },
});

export default WordPopupDemo;