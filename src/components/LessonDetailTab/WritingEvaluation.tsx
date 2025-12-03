import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
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
import { WritingSubmission, writingService } from '../../services/writingService';

interface WritingEvaluationProps {
  submission: WritingSubmission;
  onBack: () => void;
}

const WritingEvaluation: React.FC<WritingEvaluationProps> = ({ submission, onBack }) => {
  const [scores, setScores] = useState({
    grammar: submission.evaluation?.grammar || 0,
    vocabulary: submission.evaluation?.vocabulary || 0,
    structure: submission.evaluation?.structure || 0,
    content: submission.evaluation?.content || 0,
    coherence: submission.evaluation?.coherence || 0,
  });
  const [feedback, setFeedback] = useState(submission.evaluation?.feedback || '');
  const [corrections, setCorrections] = useState(submission.evaluation?.corrections || '');
  const [suggestions, setSuggestions] = useState(submission.evaluation?.suggestions || '');
  const [isSaving, setIsSaving] = useState(false);

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

  const handleSave = async () => {
    // Validate scores
    const invalidScores = Object.entries(scores).filter(([_, score]) => score < 0 || score > 10);
    if (invalidScores.length > 0) {
      Alert.alert('Lỗi', 'Điểm phải từ 0 đến 10');
      return;
    }

    if (!feedback.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập nhận xét');
      return;
    }

    try {
      setIsSaving(true);
      const evaluationData = {
        grammar: scores.grammar,
        vocabulary: scores.vocabulary,
        structure: scores.structure,
        content: scores.content,
        coherence: scores.coherence,
        feedback: feedback.trim(),
        corrections: corrections.trim(),
        suggestions: suggestions.trim(),
      };

      await writingService.evaluateSubmission(submission._id, evaluationData);
      
      Alert.alert('Thành công', 'Đã lưu đánh giá!', [
        { text: 'OK', onPress: onBack }
      ]);
    } catch (error: any) {
      console.error('Error saving evaluation:', error);
      Alert.alert('Lỗi', error.message || 'Không thể lưu đánh giá');
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'evaluated': return palette.success;
      case 'submitted': return palette.warning;
      case 'draft': return palette.info;
      default: return colors.light.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'evaluated': return 'Đã chấm';
      case 'submitted': return 'Chờ chấm';
      case 'draft': return 'Bản nháp';
      default: return status;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <HugeiconsIcon icon={ArrowLeft01Icon} size={24} color={colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chấm điểm bài viết</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(submission.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(submission.status) }]}>
            {getStatusText(submission.status)}
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Student Info */}
        <View style={styles.card}>
          <View style={styles.studentInfo}>
              <View style={styles.avatar}>
                {submission.user?.name ? (
                  <Text style={styles.avatarText}>
                    {submission.user.name.charAt(0).toUpperCase()}
                  </Text>
                ) : (
                  <HugeiconsIcon icon={UserIcon} size={20} color={colors.light.primary} />
                )}
              </View>
            <View style={styles.studentDetails}>
                <Text style={styles.studentName}>{submission.user?.name || 'Không xác định'}</Text>
                <Text style={styles.studentLevel}>
                  {submission.user?.level || 'Không xác định'} • {submission.wordCount} từ • {submission.timeSpent}s
                </Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View>
            <Text style={styles.promptLabel}>Đề bài:</Text>
            <Text style={styles.promptText}>{submission.writing.prompt}</Text>
          </View>
        </View>

        {/* Student Content */}
        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Bài làm của học viên</Text>
            <View style={styles.wordCountBadge}>
              <Text style={styles.wordCountText}>{submission.wordCount} từ</Text>
            </View>
          </View>
          <View style={styles.contentBox}>
            <Text style={styles.contentBody}>{submission.content}</Text>
          </View>
        </View>

        {/* Scoring */}
        <View style={styles.card}>
          <View style={styles.scoreHeader}>
            <Text style={styles.sectionTitle}>Bảng điểm</Text>
            <View style={styles.totalBadge}>
              <Text style={styles.totalText}>{calculateTotal()}/10</Text>
            </View>
          </View>
          <View style={styles.scoreGrid}>
            {[
              { k: 'grammar', l: 'Ngữ pháp', weight: 25 },
              { k: 'vocabulary', l: 'Từ vựng', weight: 25 },
              { k: 'structure', l: 'Cấu trúc', weight: 20 },
              { k: 'content', l: 'Nội dung', weight: 20 },
              { k: 'coherence', l: 'Mạch lạc', weight: 10 },
            ].map((item) => (
              <View key={item.k} style={styles.scoreRow}>
                <View>
                  <Text style={styles.scoreLabel}>{item.l}</Text>
                  <Text style={styles.scoreWeight}>{item.weight}%</Text>
                </View>
                <View style={styles.scoreInputContainer}>
                  <TextInput
                    style={[styles.scoreInput, {
                      borderColor: scores[item.k as keyof typeof scores] > 8 ? palette.success : 
                                    scores[item.k as keyof typeof scores] > 6 ? palette.warning : 
                                    palette.error
                    }]}
                    placeholder="0-10"
                    keyboardType="numeric"
                    value={scores[item.k as keyof typeof scores].toString()}
                    onChangeText={(t) => handleScoreChange(item.k as keyof typeof scores, t)}
                    maxLength={4}
                  />
                  <Text style={styles.scoreMax}>/10</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Feedback */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Nhận xét</Text>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={4}
            placeholder="Nhận xét chung về bài viết..."
            value={feedback}
            onChangeText={setFeedback}
          />
          
          <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Sửa lỗi</Text>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={3}
            placeholder="Chỉ ra các lỗi sai cần sửa..."
            value={corrections}
            onChangeText={setCorrections}
          />
          
          <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Gợi ý cải thiện</Text>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={3}
            placeholder="Đề xuất cách cải thiện bài viết..."
            value={suggestions}
            onChangeText={setSuggestions}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={isSaving ? "Đang lưu..." : "Lưu đánh giá"}
          onPress={handleSave}
          variant="primary"
          disabled={isSaving}
          leftIcon={
            isSaving ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <HugeiconsIcon icon={FloppyDiskIcon} size={20} color="white" />
            )
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.light.background ,
    marginBottom: 40
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: colors.light.border,
    gap: 12
  },
  headerTitle: { 
    fontSize: 16, 
    fontFamily: typography.fonts.bold, 
    color: colors.light.text,
    flex: 1
  },
  backBtn: { 
    padding: 4 
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontFamily: typography.fonts.bold,
  },
  content: { 
    padding: 16 
  },
  card: { 
    backgroundColor: colors.light.card, 
    borderRadius: 12, 
    padding: 16, 
    marginBottom: 16, 
    borderWidth: 1, 
    borderColor: colors.light.border 
  },
  studentInfo: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12 
  },
  avatar: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: colors.light.primary + '15', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  avatarText: {
    fontSize: 16,
    fontFamily: typography.fonts.bold,
    color: colors.light.primary
  },
  studentDetails: {
    flex: 1
  },
  studentName: { 
    fontSize: 14, 
    fontFamily: typography.fonts.bold, 
    color: colors.light.text 
  },
  studentLevel: { 
    fontSize: 12, 
    color: colors.light.textSecondary,
    marginTop: 2
  },
  divider: { 
    height: 1, 
    backgroundColor: colors.light.border, 
    marginVertical: 12 
  },
  promptLabel: { 
    fontSize: 12, 
    fontFamily: typography.fonts.bold, 
    color: colors.light.textSecondary 
  },
  promptText: { 
    fontSize: 14, 
    color: colors.light.text, 
    marginTop: 4,
    lineHeight: 20
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  sectionTitle: { 
    fontSize: 14, 
    fontFamily: typography.fonts.bold, 
    color: colors.light.text, 
    marginBottom: 8 
  },
  wordCountBadge: {
    backgroundColor: colors.light.primary + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6
  },
  wordCountText: {
    fontSize: 10,
    fontFamily: typography.fonts.bold,
    color: colors.light.primary
  },
  contentBox: { 
    backgroundColor: colors.light.background, 
    padding: 12, 
    borderRadius: 8 
  },
  contentBody: { 
    fontSize: 14, 
    lineHeight: 22, 
    color: colors.light.text 
  },
  scoreHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 16 
  },
  totalBadge: { 
    backgroundColor: colors.light.primary, 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 12 
  },
  totalText: { 
    color: 'white', 
    fontFamily: typography.fonts.bold, 
    fontSize: 16 
  },
  scoreGrid: { 
    gap: 12 
  },
  scoreRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  scoreLabel: { 
    fontSize: 14, 
    color: colors.light.text 
  },
  scoreWeight: {
    fontSize: 11,
    color: colors.light.textSecondary,
    marginTop: 2
  },
  scoreInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  scoreInput: { 
    borderWidth: 1, 
    borderRadius: 6, 
    width: 60, 
    padding: 8, 
    textAlign: 'center', 
    backgroundColor: colors.light.background,
    fontSize: 14,
    fontFamily: typography.fonts.bold
  },
  scoreMax: {
    fontSize: 12,
    color: colors.light.textSecondary
  },
  textArea: { 
    borderWidth: 1, 
    borderColor: colors.light.border, 
    borderRadius: 8, 
    padding: 12, 
    textAlignVertical: 'top', 
    backgroundColor: colors.light.background,
    fontSize: 14,
    lineHeight: 20,
    minHeight: 80
  },
  footer: { 
    padding: 16, 
    borderTopWidth: 1, 
    borderColor: colors.light.border, 
    backgroundColor: colors.light.card 
  },
});

export default WritingEvaluation;