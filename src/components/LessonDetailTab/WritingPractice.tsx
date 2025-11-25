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
} from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  ArrowLeft01Icon,
  Clock01Icon,
  SentIcon,
  FloppyDiskIcon,
  Download01Icon,
  PlayCircle02Icon,
  PauseCircleIcon,
  InformationCircleIcon,
  Delete02Icon,
} from '@hugeicons/core-free-icons';

import Button from '../../components/Button/Button';
import { colors, palette } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { WritingLesson } from '../Modal/ModalWriting';

interface WritingPracticeProps {
  lesson: WritingLesson;
  onBack: () => void;
}

const WritingPractice: React.FC<WritingPracticeProps> = ({ lesson, onBack }) => {
  const [userAnswer, setUserAnswer] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [showSample, setShowSample] = useState(false);

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

  const handleSubmit = () => {
    if (wordCount < lesson.minWords) {
      Alert.alert('Thông báo', `Bài viết cần tối thiểu ${lesson.minWords} từ. Hiện tại: ${wordCount} từ.`);
      return;
    }
    Alert.alert('Thành công', 'Bài viết đã được nộp!');
    onBack();
  };

  const handleSaveDraft = () => {
    Alert.alert('Đã lưu', 'Bản nháp đã được lưu vào thiết bị.');
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
        <View style={styles.card}>
          {lesson.wordHint.length > 0 && (
            <View style={{ marginBottom: 12 }}>
              <Text style={styles.hintLabel}>Từ vựng:</Text>
              <View style={styles.chipContainer}>
                {lesson.wordHint.map((w, i) => (
                  <Text key={i} style={[styles.chip, { backgroundColor: palette.warning + '20', color: palette.warning }]}>{w}</Text>
                ))}
              </View>
            </View>
          )}
          {lesson.grammarHint.length > 0 && (
            <View>
              <Text style={styles.hintLabel}>Ngữ pháp:</Text>
              <View style={styles.chipContainer}>
                {lesson.grammarHint.map((g, i) => (
                  <Text key={i} style={[styles.chip, { backgroundColor: palette.purple + '20', color: palette.purple }]}>{g}</Text>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Toggle Sample */}
        <TouchableOpacity onPress={() => setShowSample(!showSample)} style={styles.toggleSampleBtn}>
          <Text style={styles.toggleSampleText}>{showSample ? 'Ẩn bài mẫu' : 'Xem bài mẫu'}</Text>
        </TouchableOpacity>

        {showSample && (
          <View style={[styles.card, { backgroundColor: colors.light.primary + '05' }]}>
            <Text style={styles.sampleText}>{lesson.sampleAnswer}</Text>
            {lesson.sampleTranslation && (
              <Text style={styles.sampleTranslation}>{lesson.sampleTranslation}</Text>
            )}
          </View>
        )}

        {/* Writing Area */}
        <View style={styles.editorContainer}>
          <Text style={styles.editorLabel}>Bài làm của bạn:</Text>
          <TextInput
            style={styles.textInput}
            multiline
            placeholder="Nhập bài viết của bạn tại đây..."
            value={userAnswer}
            onChangeText={setUserAnswer}
            textAlignVertical="top"
          />
          <View style={styles.wordCounter}>
            <Text style={[styles.wordCountText, wordCount < lesson.minWords && { color: palette.error }]}>
              {wordCount} / {lesson.minWords} từ
            </Text>
            <TouchableOpacity onPress={() => setUserAnswer('')}>
              <HugeiconsIcon icon={Delete02Icon} size={16} color={colors.light.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.footer}>
        <Button 
          title={isTimerRunning ? "Tạm dừng" : "Tiếp tục"} 
          variant="danger" 
          onPress={() => setIsTimerRunning(!isTimerRunning)}
          leftIcon={<HugeiconsIcon icon={isTimerRunning ? PauseCircleIcon : PlayCircle02Icon} size={18} color={colors.light.white} />}
        />
        <Button 
          title="Nộp bài" 
          variant="primary" 
          onPress={handleSubmit}
          leftIcon={<HugeiconsIcon icon={SentIcon} size={18} color="white" />}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.light.background },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.light.border, backgroundColor: colors.light.card },
  backBtn: { padding: 4 },
  headerInfo: { flex: 1, marginHorizontal: 12 },
  headerTitle: { fontSize: 16, fontFamily: typography.fonts.bold, color: colors.light.text },
  headerMeta: { flexDirection: 'row', gap: 12, marginTop: 2 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: colors.light.textSecondary },
  headerActions: { flexDirection: 'row', gap: 8 },
  
  scrollContent: { padding: 16 },
  card: { backgroundColor: colors.light.card, borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.light.border },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  cardTitle: { fontSize: 14, fontFamily: typography.fonts.bold, color: colors.light.primary },
  promptText: { fontSize: 16, color: colors.light.text, lineHeight: 24 },
  instructionText: { fontSize: 14, color: colors.light.textSecondary, marginTop: 8, fontStyle: 'italic' },
  
  hintLabel: { fontSize: 13, fontFamily: typography.fonts.bold, marginBottom: 6, color: colors.light.text },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, fontSize: 12, fontFamily: typography.fonts.regular },
  
  toggleSampleBtn: { alignItems: 'center', marginBottom: 16 },
  toggleSampleText: { color: colors.light.primary, fontSize: 14, fontFamily: typography.fonts.regular },
  sampleText: { fontSize: 14, color: colors.light.text, marginBottom: 8, lineHeight: 20 },
  sampleTranslation: { fontSize: 14, color: colors.light.textSecondary, fontStyle: 'italic' },

  editorContainer: { marginBottom: 20 },
  editorLabel: { fontSize: 14, fontFamily: typography.fonts.bold, color: colors.light.text, marginBottom: 8 },
  textInput: { backgroundColor: colors.light.card, borderWidth: 1, borderColor: colors.light.border, borderRadius: 12, padding: 16, minHeight: 200, fontSize: 16, color: colors.light.text },
  wordCounter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  wordCountText: { fontSize: 12, color: colors.light.textSecondary },

  footer: { flexDirection: 'row', padding: 16, gap: 12, borderTopWidth: 1, borderTopColor: colors.light.border, backgroundColor: colors.light.card },
});

export default WritingPractice;