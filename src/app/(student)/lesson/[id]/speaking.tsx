import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { 
  XIcon, 
  MicrophoneIcon, 
  PlayIcon, 
  PauseIcon, 
} from 'phosphor-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Audio } from 'expo-av'; // Import thư viện âm thanh
import { speakingService, Speaking } from '../../../../services/speakingService';

const COLORS = {
  primaryGreen: '#00C853',
  orange: '#FF9100',
  textDark: '#1A1A1A',
  textGray: '#666666',
  white: '#FFFFFF',
  cardBg: '#FFFFFF',
  lightGray: '#E9ECEF',
};

// --- Helper: Format thời gian ---
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// --- Component 1: Thẻ ghi âm (Visualizer) ---
const RecordingCard = ({ status, duration }: { status: string, duration: number }) => {
  return (
    <View style={styles.recordCard}>
      {status === 'idle' && (
        <MicrophoneIcon size={60} color={COLORS.primaryGreen} weight="light" />
      )}

      {(status === 'recording' || status === 'paused' || status === 'finished') && (
        <View style={styles.activeRecordView}>
          {status === 'finished' && (
            <View style={styles.badgeRow}>
               <Text style={styles.recordInfoText}>Bản thu: {formatTime(duration)}</Text>
               <View style={styles.reqBadge}>
                  <Text style={styles.reqBadgeText}>Đã hoàn thành</Text>
               </View>
            </View>
          )}
          
          {/* Giả lập Waveform (Animation đơn giản) */}
          <View style={styles.waveformContainer}>
             {[1, 2, 3, 4, 5, 6].map((i) => (
               <View 
                key={i} 
                style={[
                  styles.waveBar, 
                  { height: status === 'recording' ? 20 + Math.random() * 20 : 25 }
                ]} 
               />
             ))}
          </View>

          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: status === 'finished' ? '100%' : '60%' }]} />
            <Text style={styles.timerText}>{formatTime(duration)}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

// --- Component 2: Một bài tập nói (Logic ghi âm & Nộp bài nằm ở đây) ---
const SpeakingExerciseItem = ({ speaking }: { speaking: Speaking }) => {
  // State quản lý ghi âm
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  
  // State trạng thái UI
  const [status, setStatus] = useState<'idle' | 'recording' | 'paused' | 'finished'>('idle');
  const [duration, setDuration] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Timer reference
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up sound khi unmount
  useEffect(() => {
    return () => {
      if (sound) sound.unloadAsync();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [sound]);

  // 1. Bắt đầu ghi âm
  const startRecording = async () => {
    try {
      // Xin quyền
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert("Lỗi", "Cần cấp quyền microphone để ghi âm.");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setStatus('recording');
      
      // Bắt đầu đếm giờ
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

    } catch (err) {
      console.error('Failed to start recording', err);
      Alert.alert("Lỗi", "Không thể bắt đầu ghi âm.");
    }
  };

  // 2. Dừng ghi âm
  const stopRecording = async () => {
    if (!recording) return;

    if (timerRef.current) clearInterval(timerRef.current);
    setStatus('finished');

    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setAudioUri(uri);
    setRecording(null);
    
    // Reset Audio Mode để play loa ngoài to hơn
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });
  };

  // 3. Tạm dừng (Logic tạm dừng của expo-av hơi phức tạp, ở đây ta giả lập bằng stop/resume logic hoặc chỉ stop)
  // Để đơn giản cho MVP, nút "Tạm dừng" sẽ hoạt động như "Dừng tạm thời" (chưa implement pause thật sự của expo-av)
  const pauseRecording = async () => {
      // Expo AV pause recording phức tạp, ở đây ta clear interval để UI dừng
      if (timerRef.current) clearInterval(timerRef.current);
      if (recording) {
          await recording.pauseAsync();
      }
      setStatus('paused');
  };

  const resumeRecording = async () => {
      if (recording) {
          await recording.startAsync(); // Resume
          setStatus('recording');
          timerRef.current = setInterval(() => {
              setDuration(prev => prev + 1);
          }, 1000);
      }
  };

  // 4. Nghe lại
  const playRecording = async () => {
    if (!audioUri) return;
    try {
        if (sound) {
            await sound.unloadAsync();
        }
        const { sound: newSound } = await Audio.Sound.createAsync({ uri: audioUri });
        setSound(newSound);
        setIsPlaying(true);
        await newSound.playAsync();
        
        // Khi chạy hết
        newSound.setOnPlaybackStatusUpdate((status) => {
            if (status.isLoaded && status.didJustFinish) {
                setIsPlaying(false);
            }
        });
    } catch (error) {
        console.error(error);
        Alert.alert("Lỗi", "Không thể phát lại file ghi âm.");
    }
  };

  // 5. Thu lại (Reset)
  const resetRecording = () => {
      setStatus('idle');
      setDuration(0);
      setAudioUri(null);
      setRecording(null);
      setIsPlaying(false);
  };

  // 6. Nộp bài
  const handleSubmit = async () => {
    if (!audioUri) return;

    try {
        setSubmitting(true);

        // B1: Upload Audio
        const uploadResult = await speakingService.uploadAudio({
            uri: audioUri,
            name: `speaking_${speaking._id}_${Date.now()}.m4a`,
            type: 'audio/m4a'
        });

        // B2: Submit Data
        await speakingService.submitSpeaking(speaking._id, {
            audioUrl: uploadResult.audioUrl,
            recordingDuration: duration,
            wordCount: 0, // Backend có thể tự tính hoặc để 0
            fileSize: uploadResult.size
        });

        Alert.alert("Thành công", "Đã nộp bài nói thành công!");
        
        // Có thể disable nút nộp hoặc chuyển trạng thái UI
    } catch (error: any) {
        console.error(error);
        Alert.alert("Lỗi", error.message || "Nộp bài thất bại.");
    } finally {
        setSubmitting(false);
    }
  };

  return (
    <View style={styles.exerciseWrapper}>
      <Text style={styles.lessonTitle}>Bài tập: {speaking.title}</Text>

      <RecordingCard status={status} duration={duration} />

      {/* --- CÁC NÚT ĐIỀU KHIỂN --- */}
      <View style={styles.controlsRow}>
        {status === 'idle' && (
          <TouchableOpacity 
            style={styles.mainActionBtn} 
            onPress={startRecording}
          >
            <Text style={styles.mainActionBtnText}>Bắt đầu ghi âm</Text>
          </TouchableOpacity>
        )}

        {status === 'recording' && (
          <>
            <TouchableOpacity style={styles.orangeBtn} onPress={pauseRecording}>
              <Text style={styles.btnText}>Tạm dừng</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.greenBtn} onPress={stopRecording}>
              <Text style={styles.btnText}>Hoàn thành</Text>
            </TouchableOpacity>
          </>
        )}

        {status === 'paused' && (
          <>
            <TouchableOpacity style={styles.orangeBtn} onPress={resumeRecording}>
              <Text style={styles.btnText}>Tiếp tục</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.greenBtn} onPress={stopRecording}>
              <Text style={styles.btnText}>Hoàn thành</Text>
            </TouchableOpacity>
          </>
        )}

        {status === 'finished' && (
          <>
            <TouchableOpacity style={styles.orangeBtn} onPress={resetRecording} disabled={submitting}>
              <Text style={styles.btnText}>Thu lại</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.greenBtn} onPress={playRecording} disabled={submitting}>
               <View style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
                  {isPlaying ? <PauseIcon color="#FFF" size={20}/> : <PlayIcon color="#FFF" size={20}/>}
                  <Text style={styles.btnText}>{isPlaying ? "Đang phát" : "Nghe lại"}</Text>
               </View>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* --- THÔNG TIN BÀI TẬP --- */}
      <View style={styles.infoSection}>
        {/* Gợi ý */}
        {speaking.hints && speaking.hints.length > 0 && (
            <>
                <Text style={styles.infoLabel}>Gợi ý làm bài</Text>
                {speaking.hints.map((s, i) => (
                <Text key={i} style={styles.bulletItem}>• {s}</Text>
                ))}
            </>
        )}

        {/* Mẫu câu */}
        {speaking.sampleAnswer && (
            <>
                <Text style={[styles.infoLabel, { marginTop: 15 }]}>Ví dụ</Text>
                <Text style={styles.exampleText}>• {speaking.sampleAnswer}</Text>
            </>
        )}

        {/* Yêu cầu */}
        <Text style={[styles.infoLabel, { marginTop: 15 }]}>Yêu cầu</Text>
        <Text style={styles.bulletItem}>• Chủ đề: {speaking.prompt}</Text>
        {speaking.duration && <Text style={styles.bulletItem}>• Thời lượng gợi ý: {speaking.duration} giây</Text>}
      </View>
      
      {/* NÚT NỘP BÀI */}
      {status === 'finished' && (
        <TouchableOpacity 
            style={[styles.submitBtnLarge, submitting && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={submitting}
        >
          {submitting ? (
              <ActivityIndicator color={COLORS.white} />
          ) : (
              <Text style={styles.submitBtnText}>Nộp bài</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
};

// --- Màn hình chính ---
export default function SpeakingExerciseScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // lessonId

  const [speakings, setSpeakings] = useState<Speaking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSpeakings = async () => {
      try {
        const lessonId = Array.isArray(id) ? id[0] : id;
        if (lessonId) {
            const data = await speakingService.getSpeakingByLesson(lessonId);
            setSpeakings(data || []);
        }
      } catch (error) {
        console.error(error);
        Alert.alert("Lỗi", "Không thể tải bài tập nói.");
      } finally {
        setLoading(false);
      }
    };
    fetchSpeakings();
  }, [id]);

  if (loading) {
    return (
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
            <ActivityIndicator size="large" color={COLORS.primaryGreen} />
        </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()}>
              <XIcon size={28} color={COLORS.white} weight="bold" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Luyện Nói</Text>
            <View style={{ width: 28 }} />
          </View>
        </SafeAreaView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {speakings.length === 0 ? (
             <Text style={{textAlign: 'center', marginTop: 30, color: COLORS.textGray}}>
                 Không có bài tập nói nào.
             </Text>
        ) : (
            speakings.map(item => (
                <SpeakingExerciseItem key={item._id} speaking={item} />
            ))
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: { backgroundColor: COLORS.primaryGreen, paddingBottom: 20 },
  headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 10 },
  headerTitle: { color: COLORS.white, fontSize: 20, fontWeight: 'bold' },

  exerciseWrapper: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', paddingBottom: 40 },
  lessonTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textDark, marginBottom: 20 },

  // Record Card
  recordCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  activeRecordView: { alignItems: 'center', width: '100%', paddingHorizontal: 20 },
  waveformContainer: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 15 },
  waveBar: { width: 4, backgroundColor: COLORS.primaryGreen, borderRadius: 2 },
  progressContainer: { width: '100%', height: 6, backgroundColor: '#E0E0E0', borderRadius: 3, position: 'relative' },
  progressBar: { height: '100%', backgroundColor: COLORS.primaryGreen, borderRadius: 3 },
  timerText: { position: 'absolute', right: 0, top: 10, fontSize: 12, fontWeight: 'bold', color: COLORS.textDark },
  
  badgeRow: { alignItems: 'center', marginBottom: 10 },
  recordInfoText: { fontSize: 12, fontWeight: 'bold', color: COLORS.textDark, marginBottom: 5 },
  reqBadge: { backgroundColor: COLORS.orange, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 },
  reqBadgeText: { color: COLORS.white, fontSize: 10, fontWeight: 'bold' },

  // Buttons
  controlsRow: { flexDirection: 'row', justifyContent: 'center', gap: 15, marginBottom: 30 },
  mainActionBtn: { backgroundColor: COLORS.primaryGreen, paddingHorizontal: 40, paddingVertical: 14, borderRadius: 30 },
  mainActionBtnText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
  orangeBtn: { backgroundColor: COLORS.orange, flex: 1, paddingVertical: 14, borderRadius: 30, alignItems: 'center' },
  greenBtn: { backgroundColor: COLORS.primaryGreen, flex: 1, paddingVertical: 14, borderRadius: 30, alignItems: 'center' },
  btnText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },

  // Info Section
  infoSection: { marginTop: 10 },
  infoLabel: { fontSize: 16, fontWeight: 'bold', color: COLORS.primaryGreen, marginBottom: 12 },
  bulletItem: { fontSize: 14, color: COLORS.textDark, marginBottom: 6, fontWeight: '600' },
  exampleText: { fontSize: 14, color: COLORS.textDark, fontStyle: 'italic', marginBottom: 6 },

  // Submit
  submitBtnLarge: { backgroundColor: COLORS.primaryGreen, borderRadius: 30, paddingVertical: 16, alignItems: 'center', marginTop: 30 },
  submitBtnText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
});