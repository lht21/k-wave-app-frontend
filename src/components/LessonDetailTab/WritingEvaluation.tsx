import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  ArrowLeft01Icon,
  UserIcon,
  FloppyDiskIcon,
} from '@hugeicons/core-free-icons';

import Button from '../../components/Button/Button';
import { colors, palette } from '../../theme/colors';
import { typography } from '../../theme/typography';

interface WritingEvaluationProps {
  submission: any;
  onBack: () => void;
  onSave?: (id: string, data: any) => void;
}

const WritingEvaluation: React.FC<WritingEvaluationProps> = ({ submission, onBack, onSave }) => {
  const [scores, setScores] = useState({
    grammar: 0,
    vocabulary: 0,
    structure: 0,
    content: 0,
    coherence: 0,
  });
  const [feedback, setFeedback] = useState('');
  const [corrections, setCorrections] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const calculateTotal = () => {
    const total = Object.values(scores).reduce((a, b) => a + b, 0);
    return (total / 5).toFixed(1);
  };

  const handleScoreChange = (key: keyof typeof scores, value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0 && num <= 10) {
      setScores(prev => ({ ...prev, [key]: num }));
    }
  };

  const handleSave = () => {
    Alert.alert('Thành công', 'Đánh giá đã được lưu!');
    setIsEditing(false);
    if (onSave) onSave(submission.id, { scores, feedback, corrections, suggestions });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <HugeiconsIcon icon={ArrowLeft01Icon} size={24} color={colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chấm điểm bài viết</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Student Info */}
        <View style={styles.card}>
          <View style={styles.studentInfo}>
            <View style={styles.avatar}>
              <HugeiconsIcon icon={UserIcon} size={20} color={colors.light.primary} />
            </View>
            <View>
              <Text style={styles.studentName}>{submission.student.name}</Text>
              <Text style={styles.studentLevel}>{submission.student.level} • {submission.wordCount} từ</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <Text style={styles.promptLabel}>Đề bài:</Text>
          <Text style={styles.promptText}>{submission.writing.prompt}</Text>
        </View>

        {/* Student Content */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Bài làm:</Text>
          <View style={styles.contentBox}>
            <Text style={styles.contentBody}>{submission.content}</Text>
          </View>
        </View>

        {/* Scoring */}
        <View style={styles.card}>
          <View style={styles.scoreHeader}>
            <Text style={styles.sectionTitle}>Bảng điểm</Text>
            <View style={styles.totalBadge}>
              <Text style={styles.totalText}>{calculateTotal()}</Text>
            </View>
          </View>
          <View style={styles.scoreGrid}>
            {[
              { k: 'grammar', l: 'Ngữ pháp' },
              { k: 'vocabulary', l: 'Từ vựng' },
              { k: 'structure', l: 'Cấu trúc' },
              { k: 'content', l: 'Nội dung' },
              { k: 'coherence', l: 'Mạch lạc' },
            ].map((item) => (
              <View key={item.k} style={styles.scoreRow}>
                <Text style={styles.scoreLabel}>{item.l}</Text>
                <TextInput
                  style={styles.scoreInput}
                  placeholder="0-10"
                  keyboardType="numeric"
                  onChangeText={(t) => handleScoreChange(item.k as keyof typeof scores, t)}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Feedback */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Nhận xét</Text>
          <TextInput
            style={styles.textArea}
            multiline numberOfLines={4}
            placeholder="Nhận xét chung..."
            value={feedback}
            onChangeText={setFeedback}
          />
          <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Sửa lỗi</Text>
          <TextInput
            style={styles.textArea}
            multiline numberOfLines={3}
            placeholder="Ghi chú các lỗi sai..."
            value={corrections}
            onChangeText={setCorrections}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Lưu đánh giá"
          onPress={handleSave}
          variant="primary"
          leftIcon={<HugeiconsIcon icon={FloppyDiskIcon} size={20} color="white" />}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.light.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.light.border },
  headerTitle: { fontSize: 16, fontFamily: typography.fonts.bold, color: colors.light.text },
  backBtn: { padding: 4 },
  content: { padding: 16 },
  card: { backgroundColor: colors.light.card, borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.light.border },
  studentInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.light.primary + '15', justifyContent: 'center', alignItems: 'center' },
  studentName: { fontSize: 14, fontFamily: typography.fonts.bold, color: colors.light.text },
  studentLevel: { fontSize: 12, color: colors.light.textSecondary },
  divider: { height: 1, backgroundColor: colors.light.border, marginVertical: 12 },
  promptLabel: { fontSize: 12, fontFamily: typography.fonts.bold, color: colors.light.textSecondary },
  promptText: { fontSize: 14, color: colors.light.text, marginTop: 4 },
  sectionTitle: { fontSize: 14, fontFamily: typography.fonts.bold, color: colors.light.text, marginBottom: 8 },
  contentBox: { backgroundColor: colors.light.background, padding: 12, borderRadius: 8 },
  contentBody: { fontSize: 14, lineHeight: 22, color: colors.light.text },
  scoreHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  totalBadge: { backgroundColor: colors.light.primary, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  totalText: { color: 'white', fontFamily: typography.fonts.bold, fontSize: 16 },
  scoreGrid: { gap: 12 },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  scoreLabel: { fontSize: 14, color: colors.light.text },
  scoreInput: { borderWidth: 1, borderColor: colors.light.border, borderRadius: 6, width: 60, padding: 8, textAlign: 'center', backgroundColor: colors.light.background },
  textArea: { borderWidth: 1, borderColor: colors.light.border, borderRadius: 8, padding: 12, textAlignVertical: 'top', backgroundColor: colors.light.background },
  footer: { padding: 16, borderTopWidth: 1, borderColor: colors.light.border, backgroundColor: colors.light.card },
});

export default WritingEvaluation;