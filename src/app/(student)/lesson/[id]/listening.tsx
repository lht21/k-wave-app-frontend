import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { XIcon, PlayIcon, PauseIcon, EarIcon } from 'phosphor-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { listeningService, Listening } from '../../../../services/listeningService';
import { Audio, AVPlaybackStatus } from 'expo-av'; 

const COLORS = {
  primaryGreen: '#00C853',
  textDark: '#1A1A1A',
  textGray: '#666666',
  white: '#FFFFFF',
  cardBg: '#F0F2F5',
  optionBg: '#E0E0E0',
  correctBg: '#C8E6C9',
  wrongBg: '#FFCDD2',
  correctBorder: '#00C853',
  wrongBorder: '#F44336',
};

// --- Component 1: Một câu hỏi ---
const QuestionItem = ({ qIndex, questionData, selectedIndex, onSelect, result }: any) => {
  return (
    <View style={styles.questionContainer}>
      <Text style={styles.questionText}>
        <Text style={{ fontWeight: '800', color: COLORS.primaryGreen }}>Câu {qIndex}: </Text>
        {questionData.question}
      </Text>
      
      {questionData.options.map((optionText: string, index: number) => {
        const isSelected = selectedIndex === index;
        
        let containerStyle = styles.optionItem;
        let textStyle = styles.optionLabel;

        if (result) {
            if (result.correctAnswer === index) {
                containerStyle = { ...styles.optionItem, backgroundColor: COLORS.correctBg, borderColor: COLORS.correctBorder, borderWidth: 1 };
            }
            if (isSelected && !result.isCorrect) {
                containerStyle = { ...styles.optionItem, backgroundColor: COLORS.wrongBg, borderColor: COLORS.wrongBorder, borderWidth: 1 };
            }
        } else if (isSelected) {
            containerStyle = { ...styles.optionItem, borderColor: COLORS.primaryGreen, borderWidth: 1, backgroundColor: '#E8F5E9' };
        }

        return (
          <TouchableOpacity
            key={index}
            style={containerStyle}
            activeOpacity={0.7}
            onPress={() => !result && onSelect(index)}
            disabled={!!result}
          >
            <View style={[styles.radioButton, isSelected && styles.radioActive]}>
              {isSelected && <View style={styles.radioInner} />}
            </View>
            <Text style={textStyle}>{optionText}</Text>
          </TouchableOpacity>
        );
      })}

      {result && !result.isCorrect && (
           <View style={styles.explanationBox}>
               <Text style={styles.explanationTitle}>💡 Đáp án đúng:</Text>
               <Text style={styles.explanationText}>{questionData.options[result.correctAnswer]}</Text>
               {result.explanation ? <Text style={[styles.explanationText, {marginTop: 4, fontStyle:'italic'}]}>{result.explanation}</Text> : null}
           </View>
      )}
    </View>
  );
};

// --- Component 2: Bộ phát âm thanh (Audio Player - Tích hợp expo-av) ---
const AudioPlayer = ({ audioUrl }: { audioUrl: string }) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);

  // 1. Load Audio khi component mount hoặc audioUrl thay đổi
  useEffect(() => {
    let isMounted = true;

    const loadAudio = async () => {
      if (!audioUrl) return;
      
      try {
        setIsLoadingAudio(true);
        // Cấu hình audio mode (để chạy được trên iOS ngay cả khi chế độ im lặng)
        await Audio.setAudioModeAsync({
            playsInSilentModeIOS: true,
            staysActiveInBackground: false,
            shouldDuckAndroid: true,
        });

        const { sound: newSound, status } = await Audio.Sound.createAsync(
          { uri: audioUrl },
          { shouldPlay: false },
          onPlaybackStatusUpdate
        );

        if (isMounted) {
          setSound(newSound);
          if (status.isLoaded) {
            setDuration(status.durationMillis || 0);
          }
        }
      } catch (error) {
        console.error("Error loading audio:", error);
      } finally {
        if (isMounted) setIsLoadingAudio(false);
      }
    };

    loadAudio();

    // Cleanup: Unload audio khi component unmount
    return () => {
      isMounted = false;
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [audioUrl]);

  // 2. Hàm cập nhật trạng thái playback (Progress bar)
  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis || 0);
      setIsPlaying(status.isPlaying);
      
      // Tự động reset về đầu khi chạy hết
      if (status.didJustFinish) {
        setIsPlaying(false);
        setPosition(0);
        // sound?.setPositionAsync(0); // Nếu muốn tua về đầu
      }
    }
  };

  // 3. Xử lý Play/Pause
  const togglePlayback = async () => {
    if (!sound) return;

    if (isPlaying) {
      await sound.pauseAsync();
    } else {
      // Nếu đã chạy hết thì replay
      if (position >= duration && duration > 0) {
        await sound.replayAsync();
      } else {
        await sound.playAsync();
      }
    }
  };

  // Tính phần trăm cho thanh progress
  const progressPercent = duration > 0 ? (position / duration) * 100 : 0;

  return (
    <View style={styles.playerCard}>
      <TouchableOpacity 
        style={styles.playBtn} 
        onPress={togglePlayback}
        disabled={isLoadingAudio || !audioUrl}
      >
        {isLoadingAudio ? (
          <ActivityIndicator size="large" color={COLORS.primaryGreen} />
        ) : isPlaying ? (
          <PauseIcon size={60} color={COLORS.primaryGreen} weight="fill" />
        ) : (
          <PlayIcon size={60} color={audioUrl ? COLORS.primaryGreen : COLORS.textGray} weight="fill" />
        )}
      </TouchableOpacity>

      <View style={styles.progressSection}>
        <View style={styles.progressBar}>
          {/* Thanh tiến trình chạy theo thời gian thực */}
          <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
        </View>
        <View style={styles.playerControls}>
          <TouchableOpacity>
            <EarIcon size={24} color={COLORS.textDark} weight="bold" />
          </TouchableOpacity>
          
          {/* Hiển thị thông báo nếu không có file */}
          <Text style={{fontSize: 12, color: COLORS.textGray}}>
             {!audioUrl ? 'Không có file nghe' : formatTime(position) + ' / ' + formatTime(duration)}
          </Text>
        </View>
      </View>
    </View>
  );
};

// Hàm format thời gian (mm:ss)
const formatTime = (millis: number) => {
    if (!millis) return '00:00';
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

// --- Component 3: Một bài nghe ---
const ListeningSection = ({ section, answers, onAnswerSelect, sectionResult }: any) => {
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      
      {/* Audio Player tích hợp */}
      <AudioPlayer audioUrl={section.audioUrl} />
      
      <Text style={styles.subLabel}>Câu hỏi:</Text>
      {section.questions.map((q: any, idx: number) => {
        const qResult = sectionResult?.results?.find((r: any) => r.questionId.toString() === q._id.toString());
        
        return (
            <QuestionItem
            key={q._id}
            qIndex={idx + 1}
            questionData={q}
            selectedIndex={answers[q._id]}
            onSelect={(index: number) => onAnswerSelect(q._id, index)}
            result={qResult}
            />
        );
      })}
    </View>
  );
};

// --- Màn hình chính ---
export default function ListeningExerciseScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [listenings, setListenings] = useState<Listening[]>([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [results, setResults] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchListenings = async () => {
      try {
        const lessonId = Array.isArray(id) ? id[0] : id;
        if (lessonId) {
            const data = await listeningService.getListeningsByLesson(lessonId);
            setListenings(data);
        }
      } catch (error) {
        Alert.alert("Lỗi", "Không thể tải bài tập nghe.");
      } finally {
        setLoading(false);
      }
    };
    fetchListenings();
  }, [id]);

  const handleSelect = (qId: string, optionIndex: number) => {
    setAnswers({ ...answers, [qId]: optionIndex });
  };

  const handleSubmit = async () => {
    try {
        setSubmitting(true);
        const lessonId = Array.isArray(id) ? id[0] : id;
        
        let newResults = {};
        let totalScore = 0;
        let answeredCount = 0;

        for (const listening of listenings) {
            const listeningAnswers: Record<string, number> = {};
            console.log("Frontend submitting ID:", listening._id);

            if (!listening._id) {
                console.error("❌ Listening ID bị thiếu!");
                continue; 
            }

            listening.questions.forEach(q => {
                // @ts-ignore
                if (answers[q._id] !== undefined) {
                    // @ts-ignore
                    listeningAnswers[q._id] = answers[q._id];
                }
            });

            if (Object.keys(listeningAnswers).length > 0) {
                answeredCount++;
                const response = await listeningService.submitListening(
                    listening._id, 
                    lessonId!, 
                    listeningAnswers
                );
                
                newResults = { ...newResults, [listening._id]: response.data };
                totalScore += response.data.score;
            }
        }

        if (answeredCount === 0) {
            Alert.alert("Thông báo", "Bạn chưa làm câu nào cả!");
            setSubmitting(false);
            return;
        }

        setResults(newResults);
        const avgScore = Math.round(totalScore / answeredCount);
        Alert.alert("Kết quả", `Điểm trung bình: ${avgScore}/100`);

    } catch (error) {
        Alert.alert("Lỗi", "Có lỗi xảy ra khi nộp bài.");
    } finally {
        setSubmitting(false);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primaryGreen} /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()}>
              <XIcon size={28} color={COLORS.white} weight="bold" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Luyện Nghe</Text>
            <View style={{ width: 28 }} />
          </View>
        </SafeAreaView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPadding}>
        {listenings.length === 0 ? (
            <Text style={{textAlign: 'center', marginTop: 20, color: COLORS.textGray}}>Chưa có bài nghe nào.</Text>
        ) : (
            listenings.map((section) => (
              <ListeningSection 
                key={section._id} 
                section={section} 
                answers={answers}
                onAnswerSelect={handleSelect}
                sectionResult={section._id ? results[section._id] : null}
              />
            ))
        )}
      </ScrollView>

      {Object.keys(results).length === 0 && listenings.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.submitBtn, submitting && {opacity: 0.7}]} 
            activeOpacity={0.8}
            onPress={handleSubmit}
            disabled={submitting}
          >
             {submitting ? (
                <ActivityIndicator color={COLORS.white} />
            ) : (
                <Text style={styles.submitBtnText}>Nộp bài</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: COLORS.primaryGreen, paddingBottom: 20 },
  headerContent: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20,
    marginTop: 10
  },
  headerTitle: { color: COLORS.white, fontSize: 20, fontWeight: 'bold' },

  scrollPadding: { padding: 20, paddingBottom: 100 },
  
  // Section Styles
  sectionContainer: { marginBottom: 30 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textDark, marginBottom: 20 },
  subLabel: { fontSize: 16, fontWeight: 'bold', color: COLORS.textDark, marginBottom: 15, marginTop: 25 },
  
  // Player Card Styles
  playerCard: {
    backgroundColor: COLORS.white,
    borderRadius: 30,
    padding: 30,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  playBtn: { marginBottom: 30 },
  progressSection: { width: '100%' },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    width: '100%',
    overflow: 'hidden',
    marginBottom: 15,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primaryGreen,
  },
  playerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 5
  },

  // Question Styles
  questionContainer: { marginBottom: 25 },
  questionText: { fontSize: 16, color: COLORS.textDark, marginBottom: 12, lineHeight: 24 },
  
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.optionBg,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'transparent'
  },
  optionLabel: { fontSize: 15, fontWeight: '600', color: COLORS.textDark },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.primaryGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  radioActive: { backgroundColor: 'transparent' },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primaryGreen,
  },

  // Explanation
  explanationBox: { marginTop: 10, padding: 10, backgroundColor: '#FFF9C4', borderRadius: 8 },
  explanationTitle: { fontWeight: 'bold', fontSize: 12, color: '#FBC02D', marginBottom: 2 },
  explanationText: { fontSize: 13, color: COLORS.textDark },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  submitBtn: {
    backgroundColor: COLORS.primaryGreen,
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitBtnText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
});