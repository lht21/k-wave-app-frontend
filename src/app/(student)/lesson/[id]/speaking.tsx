import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  
  Platform,
  StatusBar,
  Image,
} from 'react-native';
import { XIcon, MicrophoneIcon, MicrophoneStageIcon, PlayIcon, PauseIcon, ArrowClockwiseIcon, CheckIcon } from 'phosphor-react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
const { width } = Dimensions.get('window');

const COLORS = {
  primaryGreen: '#00C853',
  orange: '#FF9100',
  textDark: '#1A1A1A',
  textGray: '#666666',
  white: '#FFFFFF',
  cardBg: '#FFFFFF',
  lightGray: '#E9ECEF',
};

// --- Component 1: Thẻ ghi âm (Thay đổi theo trạng thái) ---
const RecordingCard = ({ status, duration }: { status: string, duration: number }) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')} phút`;
  };

  return (
    <View style={styles.recordCard}>
      {status === 'idle' && (
        <MicrophoneIcon size={60} color={COLORS.primaryGreen} weight="light" />
      )}

      {(status === 'recording' || status === 'paused' || status === 'finished') && (
        <View style={styles.activeRecordView}>
          {status === 'finished' && (
            <View style={styles.badgeRow}>
               <Text style={styles.recordInfoText}>Bản thu của bạn: {formatTime(duration)}</Text>
               <View style={styles.reqBadge}>
                  <Text style={styles.reqBadgeText}>Đã đạt Yêu cầu</Text>
               </View>
            </View>
          )}
          
          {/* Giả lập Waveform */}
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

// --- Component 2: Một bài tập nói ---
const SpeakingExerciseItem = ({ lesson }: any) => {
  const [status, setStatus] = useState<'idle' | 'recording' | 'paused' | 'finished'>('idle');
  const [duration, setDuration] = useState(0);

  // Logic đếm giờ đơn giản
  useEffect(() => {
    let interval: any;
    if (status === 'recording') {
      interval = setInterval(() => setDuration(prev => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [status]);

  return (
    <View style={styles.exerciseWrapper}>
      <Text style={styles.lessonTitle}>Bài {lesson.id}: {lesson.title}</Text>

      <RecordingCard status={status} duration={duration} />

      {/* Nhóm nút điều khiển thay đổi theo trạng thái */}
      <View style={styles.controlsRow}>
        {status === 'idle' && (
          <TouchableOpacity 
            style={styles.mainActionBtn} 
            onPress={() => setStatus('recording')}
          >
            <Text style={styles.mainActionBtnText}>Bắt đầu ghi âm</Text>
          </TouchableOpacity>
        )}

        {status === 'recording' && (
          <>
            <TouchableOpacity style={styles.orangeBtn} onPress={() => setStatus('paused')}>
              <Text style={styles.btnText}>Tạm dừng</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.greenBtn} onPress={() => setStatus('finished')}>
              <Text style={styles.btnText}>Kết thúc</Text>
            </TouchableOpacity>
          </>
        )}

        {status === 'paused' && (
          <>
            <TouchableOpacity style={styles.orangeBtn} onPress={() => setStatus('recording')}>
              <Text style={styles.btnText}>Tiếp tục</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.greenBtn} onPress={() => setStatus('finished')}>
              <Text style={styles.btnText}>Kết thúc</Text>
            </TouchableOpacity>
          </>
        )}

        {status === 'finished' && (
          <>
            <TouchableOpacity style={styles.orangeBtn} onPress={() => { setStatus('idle'); setDuration(0); }}>
              <Text style={styles.btnText}>Thu lại</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.greenBtn}>
              <Text style={styles.btnText}>Nghe lại</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Thông tin bài tập */}
      <View style={styles.infoSection}>
        <Text style={styles.infoLabel}>Gợi ý làm bài</Text>
        {lesson.suggestions.map((s: string, i: number) => (
          <Text key={i} style={styles.bulletItem}>• {s}</Text>
        ))}

        <Text style={[styles.infoLabel, { marginTop: 15 }]}>Ví dụ</Text>
        <Text style={styles.exampleKr}>• {lesson.example.kr}</Text>
        <Text style={styles.exampleVi}>• {lesson.example.vi}</Text>

        <Text style={[styles.infoLabel, { marginTop: 15 }]}>Yêu cầu</Text>
        <Text style={styles.bulletItem}>• Thời lượng bản ghi: {lesson.requirement}</Text>
      </View>
      
      {status === 'finished' && (
        <TouchableOpacity style={styles.submitBtnLarge}>
          <Text style={styles.submitBtnText}>Nộp bài</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// --- Màn hình chính ---
export default function SpeakingExerciseScreen() {
  const router = useRouter();

  const mockLessons = [
    {
      id: 1,
      title: 'Gia đình của tôi',
      suggestions: [
        'Giới thiệu tên, tuổi, quê quán, sở thích và ước mơ',
        'Từ khoá có thể sử dụng:',
        'Mẫu:'
      ],
      example: {
        kr: '안녕하세요. 저는 민호입니다. 25살입니다...',
        vi: 'Xin chào. Tôi là Minho. Tôi 25 tuổi...'
      },
      requirement: '60 phút'
    }
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()}>
              <XIcon size={28} color={COLORS.white} weight="bold" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Bài nói</Text>
            <View style={{ width: 28 }} />
          </View>
        </SafeAreaView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {mockLessons.map(lesson => (
          <SpeakingExerciseItem key={lesson.id} lesson={lesson} />
        ))}
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

  exerciseWrapper: { padding: 20 },
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
  exampleKr: { fontSize: 14, color: COLORS.textDark, fontWeight: '600', marginBottom: 4 },
  exampleVi: { fontSize: 14, color: COLORS.textDark, fontStyle: 'italic' },

  // Submit
  submitBtnLarge: { backgroundColor: COLORS.primaryGreen, borderRadius: 30, paddingVertical: 16, alignItems: 'center', marginTop: 30 },
  submitBtnText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
});