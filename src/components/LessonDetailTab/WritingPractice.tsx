import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  ArrowLeft01Icon,
  Clock01Icon,
  SentIcon,
  FloppyDiskIcon,
  PlayCircle02Icon,
  PauseCircleIcon,
  InformationCircleIcon,
  Delete02Icon,
} from '@hugeicons/core-free-icons';

import Button from '../../components/Button/Button';
import { colors, palette } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Writing } from '../../services/writingService';
import { writingService } from '../../services/writingService';

interface WritingPracticeProps {
  lesson: Writing;
  onBack: () => void;
}

const WritingPractice: React.FC<WritingPracticeProps> = ({ lesson, onBack }) => {
  const [userAnswer, setUserAnswer] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [showSample, setShowSample] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => setTimeSpent(prev => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  useEffect(() => {
    const words = userAnswer.trim() ? userAnswer.trim().split(/\s+/).length : 0;
    setWordCount(words);
  }, [userAnswer]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async () => {
    if (wordCount < lesson.minWords) {
      Alert.alert('Thông báo', `Bài viết cần tối thiểu ${lesson.minWords} từ. Hiện tại: ${wordCount} từ.`);
      return;
    }

    try {
      setSubmitting(true);
      await writingService.submitWriting(lesson._id, {
        content: userAnswer,
        timeSpent,
        isDraft: false,
      });
      
      Alert.alert('Thành công', 'Bài viết đã được nộp thành công!');
      onBack();
    } catch (error: any) {
      console.error('Error submitting writing:', error);
      Alert.alert('Lỗi', error.message || 'Không thể nộp bài viết');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!userAnswer.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập nội dung trước khi lưu nháp');
      return;
    }

    try {
      setSavingDraft(true);
      await writingService.submitWriting(lesson._id, {
        content: userAnswer,
        timeSpent,
        isDraft: true,
      });
      
      Alert.alert('Đã lưu', 'Bản nháp đã được lưu thành công');
    } catch (error: any) {
      console.error('Error saving draft:', error);
      Alert.alert('Lỗi', error.message || 'Không thể lưu bản nháp');
    } finally {
      setSavingDraft(false);
    }
  };

  const clearAnswer = () => {
    Alert.alert(
      'Xóa nội dung',
      'Bạn có chắc muốn xóa toàn bộ nội dung đã viết?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa', 
          style: 'destructive', 
          onPress: () => setUserAnswer('') 
        }
      ]
    );
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <HugeiconsIcon icon={ArrowLeft01Icon} size={24} color={colors.light.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle} numberOfLines={1}>{lesson.title}</Text>
          <View style={styles.headerMeta}>
            <View style={styles.metaItem}>
              <HugeiconsIcon icon={Clock01Icon} size={14} color={colors.light.textSecondary} />
              <Text style={styles.metaText}>{formatTime(timeSpent)}</Text>
            </View>
            <Text style={styles.metaText}>Min: {lesson.minWords} từ</Text>
            {lesson.maxWords && (
              <Text style={styles.metaText}>Max: {lesson.maxWords} từ</Text>
            )}
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Prompt Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <HugeiconsIcon icon={InformationCircleIcon} size={18} color={colors.light.primary} />
            <Text style={styles.cardTitle}>Đề bài</Text>
          </View>
          <Text style={styles.promptText}>{lesson.prompt}</Text>
          {lesson.instruction ? (
            <Text style={styles.instructionText}>💡 {lesson.instruction}</Text>
          ) : null}
        </View>

        {/* Hints */}
        {(lesson.wordHint?.length > 0 || lesson.grammarHint?.length > 0) && (
          <View style={styles.card}>
            {lesson.wordHint?.length > 0 && (
              <View style={{ marginBottom: 12 }}>
                <Text style={styles.hintLabel}>Từ vựng gợi ý:</Text>
                <View style={styles.chipContainer}>
                  {lesson.wordHint.map((w, i) => (
                    <Text key={i} style={[styles.chip, { backgroundColor: palette.warning + '20', color: palette.warning }]}>{w}</Text>
                  ))}
                </View>
              </View>
            )}
            {lesson.grammarHint?.length > 0 && (
              <View>
                <Text style={styles.hintLabel}>Ngữ pháp gợi ý:</Text>
                <View style={styles.chipContainer}>
                  {lesson.grammarHint.map((g, i) => (
                    <Text key={i} style={[styles.chip, { backgroundColor: palette.purple + '20', color: palette.purple }]}>{g}</Text>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {/* Toggle Sample */}
        {lesson.sampleAnswer && (
          <>
            <TouchableOpacity onPress={() => setShowSample(!showSample)} style={styles.toggleSampleBtn}>
              <Text style={styles.toggleSampleText}>
                {showSample ? 'Ẩn bài mẫu' : 'Xem bài mẫu'}
              </Text>
            </TouchableOpacity>

            {showSample && (
              <View style={[styles.card, { backgroundColor: colors.light.primary + '05' }]}>
                <Text style={styles.sampleLabel}>Bài mẫu:</Text>
                <Text style={styles.sampleText}>{lesson.sampleAnswer}</Text>
                {lesson.sampleTranslation && (
                  <>
                    <Text style={styles.sampleLabel}>Dịch:</Text>
                    <Text style={styles.sampleTranslation}>{lesson.sampleTranslation}</Text>
                  </>
                )}
              </View>
            )}
          </>
        )}

        {/* Writing Area */}
        <View style={styles.editorContainer}>
          <View style={styles.editorHeader}>
            <Text style={styles.editorLabel}>Bài làm của bạn:</Text>
            <View style={styles.wordCounter}>
              <Text style={[
                styles.wordCountText, 
                wordCount < lesson.minWords ? { color: palette.error } : 
                (lesson.maxWords && wordCount > lesson.maxWords) ? { color: palette.error } :
                { color: palette.success }
              ]}>
                {wordCount} {lesson.maxWords ? `/${lesson.maxWords}` : ''} từ
              </Text>
              <TouchableOpacity onPress={clearAnswer} style={styles.clearBtn}>
                <HugeiconsIcon icon={Delete02Icon} size={16} color={colors.light.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
          <TextInput
            style={styles.textInput}
            multiline
            placeholder="Nhập bài viết của bạn tại đây..."
            placeholderTextColor={colors.light.textSecondary}
            value={userAnswer}
            onChangeText={setUserAnswer}
            textAlignVertical="top"
          />
          <Text style={styles.minWordsText}>
            Yêu cầu tối thiểu: {lesson.minWords} từ
            {lesson.maxWords && `, tối đa: ${lesson.maxWords} từ`}
          </Text>
        </View>
      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.footer}>
        <View style={styles.footerActions}>
          <Button 
            title={isTimerRunning ? "Tạm dừng" : "Tiếp tục"} 
            variant="secondary"
            size="small"
            onPress={() => setIsTimerRunning(!isTimerRunning)}
            leftIcon={<HugeiconsIcon icon={isTimerRunning ? PauseCircleIcon : PlayCircle02Icon} size={18} color={colors.light.text} />}
          />
          <Button 
            title="Lưu nháp" 
            variant="outline"
            size="small"
            onPress={handleSaveDraft}
            disabled={savingDraft || !userAnswer.trim()}
            leftIcon={
              savingDraft ? (
                <ActivityIndicator size="small" color={colors.light.primary} />
              ) : (
                <HugeiconsIcon icon={FloppyDiskIcon} size={18} color={colors.light.primary} />
              )
            }
          />
          <Button 
            title="Nộp bài" 
            variant="primary"
            size="small"
            onPress={handleSubmit}
            disabled={submitting || wordCount < lesson.minWords}
            leftIcon={
              submitting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <HugeiconsIcon icon={SentIcon} size={18} color="white" />
              )
            }
          />
        </View>
        {wordCount < lesson.minWords && (
          <Text style={styles.warningText}>
            ⚠️ Cần thêm {lesson.minWords - wordCount} từ để đạt yêu cầu
          </Text>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.light.background,     marginBottom: 40 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: colors.light.border, 
    backgroundColor: colors.light.card 
  },
  backBtn: { padding: 4 },
  headerInfo: { flex: 1, marginHorizontal: 12 },
  headerTitle: { 
    fontSize: 16, 
    fontFamily: typography.fonts.bold, 
    color: colors.light.text 
  },
  headerMeta: { 
    flexDirection: 'row', 
    gap: 12, 
    marginTop: 4,
    flexWrap: 'wrap'
  },
  metaItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4 
  },
  metaText: { 
    fontSize: 12, 
    color: colors.light.textSecondary 
  },
  
  scrollContent: { padding: 16 },
  card: { 
    backgroundColor: colors.light.card, 
    borderRadius: 12, 
    padding: 16, 
    marginBottom: 16, 
    borderWidth: 1, 
    borderColor: colors.light.border 
  },
  cardHeader: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8, 
    marginBottom: 8 
  },
  cardTitle: { 
    fontSize: 14, 
    fontFamily: typography.fonts.bold, 
    color: colors.light.primary 
  },
  promptText: { 
    fontSize: 16, 
    color: colors.light.text, 
    lineHeight: 24 
  },
  instructionText: { 
    fontSize: 14, 
    color: colors.light.textSecondary, 
    marginTop: 8, 
    fontStyle: 'italic' 
  },
  
  hintLabel: { 
    fontSize: 13, 
    fontFamily: typography.fonts.bold, 
    marginBottom: 6, 
    color: colors.light.text 
  },
  chipContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 8 
  },
  chip: { 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 6, 
    fontSize: 12, 
    fontFamily: typography.fonts.regular 
  },
  
  toggleSampleBtn: { 
    alignItems: 'center', 
    marginBottom: 16 
  },
  toggleSampleText: { 
    color: colors.light.primary, 
    fontSize: 14, 
    fontFamily: typography.fonts.regular 
  },
  sampleLabel: {
    fontSize: 12,
    fontFamily: typography.fonts.bold,
    color: colors.light.textSecondary,
    marginBottom: 4
  },
  sampleText: { 
    fontSize: 14, 
    color: colors.light.text, 
    marginBottom: 8, 
    lineHeight: 20 
  },
  sampleTranslation: { 
    fontSize: 14, 
    color: colors.light.textSecondary, 
    fontStyle: 'italic',
    lineHeight: 20
  },

  editorContainer: { 
    marginBottom: 20 
  },
  editorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  editorLabel: { 
    fontSize: 14, 
    fontFamily: typography.fonts.bold, 
    color: colors.light.text 
  },
  wordCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  wordCountText: { 
    fontSize: 12, 
    fontFamily: typography.fonts.bold
  },
  clearBtn: {
    padding: 4
  },
  minWordsText: {
    fontSize: 11,
    color: colors.light.textSecondary,
    marginTop: 4,
    marginLeft: 4
  },
  textInput: { 
    backgroundColor: colors.light.card, 
    borderWidth: 1, 
    borderColor: colors.light.border, 
    borderRadius: 12, 
    padding: 16, 
    minHeight: 200, 
    fontSize: 16, 
    color: colors.light.text,
    lineHeight: 24
  },

  footer: { 
    padding: 16, 
    borderTopWidth: 1, 
    borderTopColor: colors.light.border, 
    backgroundColor: colors.light.card 
  },
  footerActions: { 
    flexDirection: 'row', 
    gap: 8,
    marginBottom: 8
  },
  warningText: {
    fontSize: 11,
    color: palette.error,
    textAlign: 'center'
  }
});

export default WritingPractice;