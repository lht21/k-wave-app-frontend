import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system'; // Thêm import này
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  ArrowLeft01Icon,
  Mic02Icon,
  StopCircleIcon,
  PlayCircle02Icon,
  PauseCircleIcon,
  SentIcon,
  RecordIcon,
  InformationCircleIcon,
} from '@hugeicons/core-free-icons';

import Button from '../../components/Button/Button';
import { colors, palette } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { SpeakingLesson } from '../Modal/ModalSpeaking';
import { speakingService } from '../../services/speakingService';

interface SpeakingPracticeProps {
  lesson: SpeakingLesson;
  onBack: () => void;
}

// Tạo interface cho audio file trong React Native
interface AudioFile {
  uri: string;
  name: string;
  type: string;
  size?: number;
}

const SpeakingPractice: React.FC<SpeakingPracticeProps> = ({ lesson, onBack }) => {
  const [status, setStatus] = useState<'preparing' | 'recording' | 'finished'>('preparing');
  const [timeLeft, setTimeLeft] = useState(lesson.duration); 
  
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [recordedAudio, setRecordedAudio] = useState<AudioFile | null>(null); // Đổi type
  
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);

  // Timer Logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (status === 'preparing' || status === 'recording') {
      if (timeLeft > 0) {
        timer = setInterval(() => {
          setTimeLeft((prev) => {
            const newTime = prev - 1;
            if (status === 'recording') {
              setRecordingDuration(lesson.recordingLimit - newTime);
            }
            return newTime;
          });
        }, 1000);
      } else {
        if (status === 'preparing') {
          startRecording(); 
        } else if (status === 'recording') {
          stopRecording(); 
        }
      }
    }
    return () => clearInterval(timer);
  }, [timeLeft, status]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (recording) recording.stopAndUnloadAsync();
      if (sound) sound.unloadAsync();
    };
  }, []);

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status === 'granted') {
        await Audio.setAudioModeAsync({ 
          allowsRecordingIOS: true, 
          playsInSilentModeIOS: true,
          staysActiveInBackground: false 
        });
        
        if (sound) {
          await sound.unloadAsync();
          setSound(null);
        }

        const { recording: newRecording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        
        setRecording(newRecording);
        setStatus('recording');
        setTimeLeft(lesson.recordingLimit);
        setRecordingDuration(0); // Reset duration
      } else {
        Alert.alert('Quyền truy cập', 'Vui lòng cấp quyền Microphone để ghi âm.');
      }
    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert('Lỗi', 'Không thể bắt đầu ghi âm.');
    }
  };

const stopRecording = async () => {
  if (!recording) return;
  try {
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecordingUri(uri);
    
    // Lấy thông tin file trong React Native
    if (uri) {
      // Xác định extension và MIME type dựa trên platform
      const isIOS = Platform.OS === 'ios';
      const extension = isIOS ? 'm4a' : 'aac';
      const mimeType = isIOS ? 'audio/x-m4a' : 'audio/aac';
      
      // Tạo object audio file cho React Native
      const audioFile: AudioFile = {
        uri: uri,
        name: `recording-${Date.now()}.${extension}`,
        type: mimeType,
        size: 0 // Tạm thời set 0, có thể tính sau nếu cần
      };
      
      setRecordedAudio(audioFile);
      console.log('✅ Audio file created:', {
        name: audioFile.name,
        type: audioFile.type,
        size: audioFile.size
      });
    }
    
    setRecording(null);
    setStatus('finished');
  } catch (error) {
    console.error('Error stopping recording:', error);
    Alert.alert('Lỗi', 'Không thể dừng ghi âm.');
  }
};

const playRecordedAudio = async () => {
    if (!recordingUri) return;
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
          { uri: recordingUri },
          { shouldPlay: true }
        );
        setSound(newSound);
        setIsPlaying(true);
        
        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            setIsPlaying(false);
            newSound.stopAsync();
          }
        });
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể phát file ghi âm');
    }
  };

  const handleRetry = () => {
    Alert.alert('Ghi âm lại', 'Bản ghi âm hiện tại sẽ bị mất. Bạn có chắc không?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đồng ý',
        onPress: async () => {
          if (sound) {
            await sound.unloadAsync();
            setSound(null);
          }
          setStatus('preparing');
          setTimeLeft(lesson.duration);
          setRecordingUri(null);
          setRecordedAudio(null);
          setIsPlaying(false);
          setRecordingDuration(0);
        }
      }
    ]);
  };

  const handleSubmit = async () => {
    if (!recordedAudio || !recordingUri) {
      Alert.alert('Lỗi', 'Không có bản ghi âm để nộp');
      return;
    }

    try {
      setSubmitting(true);
      
      console.log('📤 Starting submission...');
      console.log('📤 Audio file:', recordedAudio);
      console.log('📤 Recording duration:', recordingDuration);
      
      // 1. Upload audio
      const uploadResult = await speakingService.uploadAudio(recordedAudio);
      console.log('✅ Upload result:', uploadResult);
      
      // 2. Submit speaking
      await speakingService.submitSpeaking(lesson._id, {
        audioUrl: uploadResult.audioUrl,
        recordingDuration: recordingDuration || lesson.recordingLimit,
        wordCount: 0,
        fileSize: recordedAudio.size || 0
      });
      
      Alert.alert('Thành công', 'Bài nói của bạn đã được nộp!');
      onBack();
    } catch (error: any) {
      console.error('❌ Submission error:', error);
      Alert.alert('Lỗi', error.message || 'Không thể nộp bài');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <HugeiconsIcon icon={ArrowLeft01Icon} size={24} color={colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{lesson.title}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Question Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <HugeiconsIcon icon={InformationCircleIcon} size={18} color={colors.light.primary} />
            <Text style={styles.cardTitle}>Đề bài</Text>
          </View>
          <Text style={styles.promptText}>{lesson.prompt}</Text>
          {lesson.instruction ? (
            <Text style={styles.instructionText}>💡 Hướng dẫn: {lesson.instruction}</Text>
          ) : null}
        </View>

        {/* Hints */}
        {(lesson.wordHint.length > 0 || lesson.pronunciationHint.length > 0) && (
          <View style={[styles.card, { backgroundColor: colors.light.card }]}>
             {lesson.wordHint.length > 0 && (
               <View style={{ marginBottom: 12 }}>
                 <Text style={styles.hintLabel}>Từ gợi ý:</Text>
                 <View style={styles.chipContainer}>
                   {lesson.wordHint.map((w, i) => (
                     <Text key={i} style={styles.chip}>{w}</Text>
                   ))}
                 </View>
               </View>
             )}
             
             {lesson.pronunciationHint.length > 0 && (
               <View>
                 <Text style={styles.hintLabel}>Lưu ý phát âm:</Text>
                 {lesson.pronunciationHint.map((p, i) => (
                   <Text key={i} style={styles.pronunciationText}>• {p}</Text>
                 ))}
               </View>
             )}
          </View>
        )}

        {/* Status Circle & Timer */}
        <View style={styles.timerContainer}>
          <View style={[
            styles.timerCircle,
            status === 'recording' ? styles.recordingBorder : 
            status === 'preparing' ? styles.preparingBorder : styles.finishedBorder
          ]}>
            <Text style={styles.statusLabel}>
              {status === 'preparing' ? 'Chuẩn bị' : status === 'recording' ? 'Đang ghi' : 'Hoàn tất'}
            </Text>
            {status !== 'finished' ? (
              <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
            ) : (
              <HugeiconsIcon icon={SentIcon} size={40} color={palette.success} />
            )}
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          {status === 'preparing' && (
            <Button
              title="Bỏ qua chuẩn bị"
              onPress={startRecording}
              variant="primary"
              leftIcon={<HugeiconsIcon icon={Mic02Icon} size={20} color={colors.light.primary} />}
            />
          )}

          {status === 'recording' && (
            <Button
              title="Dừng ghi âm"
              onPress={stopRecording}
              variant="danger"
              leftIcon={<HugeiconsIcon icon={StopCircleIcon} size={20} color="white" />}
            />
          )}

          {status === 'finished' && (
            <View style={styles.finishedControls}>
              <Button
                title={isPlaying ? "Tạm dừng" : "Nghe lại"}
                onPress={playRecordedAudio}
                variant="primary"
                leftIcon={<HugeiconsIcon icon={isPlaying ? PauseCircleIcon : PlayCircle02Icon} size={20} color={colors.light.primary} />}
              />
              <View style={styles.row}>
                <Button
                  title="Ghi lại"
                  onPress={handleRetry}
                  variant="outline"
                  leftIcon={<HugeiconsIcon icon={RecordIcon} size={20} color={colors.light.text} />}
                />
                <Button
                  title={submitting ? "Đang nộp..." : "Nộp bài"}
                  onPress={handleSubmit}
                  variant="primary"
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <HugeiconsIcon icon={SentIcon} size={20} color="white" style={{ marginRight: 8 }} />
                      <Text style={{ color: 'white' }}>Nộp bài</Text>
                    </View>
                  )}
                </Button>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.light.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  headerTitle: {
    fontSize: typography.fontSizes.md,
    fontFamily: typography.fonts.bold,
    color: colors.light.text,
    flex: 1,
    textAlign: 'center',
  },
  backBtn: { padding: 4 },
  scrollContent: { padding: 16 },
  
  card: {
    backgroundColor: colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  cardTitle: { fontSize: 14, fontFamily: typography.fonts.bold, color: colors.light.primary },
  promptText: { fontSize: 16, color: colors.light.text, lineHeight: 24 },
  instructionText: { fontSize: 14, color: colors.light.textSecondary, marginTop: 8, fontStyle: 'italic' },
  
  hintLabel: { fontSize: 13, fontFamily: typography.fonts.bold, marginBottom: 6, color: colors.light.text },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { 
    backgroundColor: palette.warning + '20', 
    color: palette.warning, 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 6, 
    fontSize: 12,
    fontFamily: typography.fonts.regular 
  },
  pronunciationText: { fontSize: 13, color: colors.light.text, marginBottom: 4 },

  timerContainer: { alignItems: 'center', marginVertical: 24 },
  timerCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.light.card,
  },
  preparingBorder: { borderColor: palette.info },
  recordingBorder: { borderColor: palette.error },
  finishedBorder: { borderColor: palette.success },
  statusLabel: { fontSize: 14, color: colors.light.textSecondary, marginBottom: 4 },
  timerText: { fontSize: 32, fontFamily: typography.fonts.bold, color: colors.light.text },

  controls: { paddingBottom: 32 },
  finishedControls: { gap: 12 },
  row: { flexDirection: 'row', gap: 12, justifyContent: 'space-around', alignItems: 'center' },
});

export default SpeakingPractice;