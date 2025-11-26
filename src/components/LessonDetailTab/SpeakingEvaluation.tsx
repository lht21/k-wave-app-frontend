import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import { Audio } from 'expo-av';
import Slider from '@react-native-community/slider';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  ArrowLeft01Icon,
  PlayCircle02Icon,
  PauseCircleIcon,
  FloppyDiskIcon,
  UserIcon,
} from '@hugeicons/core-free-icons';

import Button from '../../components/Button/Button';
import { colors, palette } from '../../theme/colors';
import { typography } from '../../theme/typography';

interface SpeakingEvaluationProps {
  submission: any; // Thay any bằng Interface Submission nếu có
  onBack: () => void;
  onSave?: (submissionId: string, evaluation: any) => void;
}

const SpeakingEvaluation: React.FC<SpeakingEvaluationProps> = ({ 
  submission, 
  onBack, 
  onSave 
}) => {
  // State chấm điểm
  const [scores, setScores] = useState({
    pronunciation: 0,
    fluency: 0,
    vocabulary: 0,
    grammar: 0,
    content: 0
  });
  const [feedback, setFeedback] = useState('');
  const [suggestions, setSuggestions] = useState('');

  // Audio State
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);

  // Cleanup audio
  useEffect(() => {
    return () => {
      if (sound) sound.unloadAsync();
    };
  }, []);

  const handlePlayAudio = async () => {
    try {
      if (sound) {
        if (isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          await sound.playAsync();
          setIsPlaying(true);
        }
      } else {
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: submission.audioUrl },
          { shouldPlay: true },
          (status) => {
            if (status.isLoaded) {
              setDuration(status.durationMillis || 0);
              setPosition(status.positionMillis);
              if (status.didJustFinish) {
                setIsPlaying(false);
                newSound.setPositionAsync(0);
              }
            }
          }
        );
        setSound(newSound);
        setIsPlaying(true);
      }
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể phát file âm thanh này.');
    }
  };

  const handleSeek = async (value: number) => {
    if (sound) {
      await sound.setPositionAsync(value);
    }
  };

  const calculateTotal = () => {
    const total = Object.values(scores).reduce((acc, curr) => acc + curr, 0);
    return (total / 5).toFixed(1);
  };

  const handleScoreChange = (key: keyof typeof scores, value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0 && num <= 10) {
      setScores(prev => ({ ...prev, [key]: num }));
    } else if (value === '') {
      // Allow clearing input temporarily
      // Note: You might need a separate string state map if you want perfect UX for inputting decimals
    }
  };

  const handleSaveEvaluation = () => {
    const evaluationData = {
      scores,
      totalScore: calculateTotal(),
      feedback,
      suggestions,
      evaluatedAt: new Date().toISOString()
    };
    
    if (onSave) {
      onSave(submission.id, evaluationData);
    } else {
      Alert.alert('Đã lưu', 'Đánh giá đã được lưu thành công!');
    }
    onBack();
  };

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <HugeiconsIcon icon={ArrowLeft01Icon} size={24} color={colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chấm điểm: {submission.student.name}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Info Card */}
        <View style={styles.card}>
          <View style={styles.studentInfo}>
            <View style={styles.avatar}>
               <HugeiconsIcon icon={UserIcon} size={20} color={colors.light.primary} />
            </View>
            <View>
               <Text style={styles.studentName}>{submission.student.name}</Text>
               <Text style={styles.studentLevel}>{submission.student.level}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <Text style={styles.promptText}>Đề: {submission.speaking.title}</Text>
        </View>

        {/* Audio Player */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Bài làm của học sinh</Text>
          <View style={styles.playerRow}>
            <TouchableOpacity onPress={handlePlayAudio}>
              <HugeiconsIcon 
                icon={isPlaying ? PauseCircleIcon : PlayCircle02Icon} 
                size={40} 
                color={colors.light.primary} 
              />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Slider
                style={{ width: '100%', height: 40 }}
                minimumValue={0}
                maximumValue={duration}
                value={position}
                onSlidingComplete={handleSeek}
                minimumTrackTintColor={colors.light.primary}
                maximumTrackTintColor={colors.light.border}
                thumbTintColor={colors.light.primary}
              />
              <View style={styles.timeRow}>
                <Text style={styles.timeText}>{formatTime(position)}</Text>
                <Text style={styles.timeText}>{formatTime(duration)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Scoring Form */}
        <View style={styles.card}>
          <View style={styles.scoreHeader}>
             <Text style={styles.sectionTitle}>Bảng điểm</Text>
             <View style={styles.totalScoreBadge}>
                <Text style={styles.totalScoreText}>{calculateTotal()}</Text>
             </View>
          </View>
          
          <View style={styles.scoreGrid}>
             {[
               { key: 'pronunciation', label: 'Phát âm' },
               { key: 'fluency', label: 'Lưu loát' },
               { key: 'vocabulary', label: 'Từ vựng' },
               { key: 'grammar', label: 'Ngữ pháp' },
               { key: 'content', label: 'Nội dung' }
             ].map((item) => (
               <View key={item.key} style={styles.scoreRow}>
                 <Text style={styles.scoreLabel}>{item.label}</Text>
                 <TextInput
                   style={styles.scoreInput}
                   keyboardType="numeric"
                   placeholder="0-10"
                   onChangeText={(t) => handleScoreChange(item.key as keyof typeof scores, t)}
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
             multiline
             numberOfLines={4}
             placeholder="Nhập nhận xét chung..."
             value={feedback}
             onChangeText={setFeedback}
           />
           
           <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Gợi ý cải thiện</Text>
           <TextInput
             style={styles.textArea}
             multiline
             numberOfLines={3}
             placeholder="Gợi ý cách học..."
             value={suggestions}
             onChangeText={setSuggestions}
           />
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          title="Lưu đánh giá"
          onPress={handleSaveEvaluation}
          variant="primary"
          leftIcon={<HugeiconsIcon icon={FloppyDiskIcon} size={20} color="white" />}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.light.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
    
  },
  headerTitle: { fontSize: 16, fontFamily: typography.fonts.bold, color: colors.light.text },
  backBtn: { padding: 4},
  content: { padding: 16 },
  
  card: {
    backgroundColor: colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  
  studentInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.light.primary + '15', justifyContent: 'center', alignItems: 'center' },
  studentName: { fontSize: 14, fontFamily: typography.fonts.bold, color: colors.light.text },
  studentLevel: { fontSize: 12, color: colors.light.textSecondary },
  divider: { height: 1, backgroundColor: colors.light.border, marginVertical: 12 },
  promptText: { fontSize: 14, color: colors.light.text },

  sectionTitle: { fontSize: 14, fontFamily: typography.fonts.bold, color: colors.light.text, marginBottom: 12 },
  
  playerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 },
  timeText: { fontSize: 10, color: colors.light.textSecondary },

  scoreHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  totalScoreBadge: { backgroundColor: colors.light.primary, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  totalScoreText: { color: 'white', fontFamily: typography.fonts.bold, fontSize: 16 },
  
  scoreGrid: { gap: 12 },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  scoreLabel: { fontSize: 14, color: colors.light.text },
  scoreInput: { 
    borderWidth: 1, 
    borderColor: colors.light.border, 
    borderRadius: 6, 
    width: 60, 
    padding: 8, 
    textAlign: 'center',
    backgroundColor: colors.light.background
  },

  textArea: { 
    borderWidth: 1, 
    borderColor: colors.light.border, 
    borderRadius: 8, 
    padding: 12, 
    textAlignVertical: 'top', 
    backgroundColor: colors.light.background 
  },

  footer: { padding: 16, borderTopWidth: 1, borderColor: colors.light.border, backgroundColor: colors.light.card },
});

export default SpeakingEvaluation;