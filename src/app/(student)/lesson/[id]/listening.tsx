import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,

  Platform,
  StatusBar,
} from 'react-native';
import { XIcon, PlayIcon, PauseIcon, Headphones, EarIcon, Pause, Play, Ear } from 'phosphor-react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';


const { width } = Dimensions.get('window');

const COLORS = {
  primaryGreen: '#00C853',
  textDark: '#1A1A1A',
  textGray: '#666666',
  white: '#FFFFFF',
  cardBg: '#F0F2F5',
  optionBg: '#E0E0E0',
};

// --- Component 1: Một câu hỏi (Tương tự reading.tsx) ---
const QuestionItem = ({ qIndex, question, options, selectedId, onSelect }: any) => {
  return (
    <View style={styles.questionContainer}>
      <Text style={styles.questionText}>Câu {qIndex}: {question}</Text>
      
      {options.map((option: any) => {
        const isSelected = selectedId === option.id;
        return (
          <TouchableOpacity
            key={option.id}
            style={styles.optionItem}
            activeOpacity={0.7}
            onPress={() => onSelect(option.id)}
          >
            <View style={[styles.radioButton, isSelected && styles.radioActive]}>
              {isSelected && <View style={styles.radioInner} />}
            </View>
            <Text style={styles.optionLabel}>{option.text}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

// --- Component 2: Bộ phát âm thanh (Audio Player) ---
const AudioPlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState('1x');

  return (
    <View style={styles.playerCard}>
      <TouchableOpacity 
        style={styles.playBtn} 
        onPress={() => setIsPlaying(!isPlaying)}
      >
        {isPlaying ? (
          <PauseIcon size={60} color={COLORS.primaryGreen} weight="fill" />
        ) : (
          <PlayIcon size={60} color={COLORS.primaryGreen} weight="fill" />
        )}
      </TouchableOpacity>

      <View style={styles.progressSection}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: '60%' }]} />
        </View>
        <View style={styles.playerControls}>
          <TouchableOpacity>
            <EarIcon size={24} color={COLORS.textDark} weight="bold" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.speedBadge}>
            <Text style={styles.speedText}>{playbackSpeed}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// --- Component 3: Một bài nghe (Title + Player + Questions) ---
const ListeningSection = ({ section, answers, onAnswerSelect }: any) => {
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Bài {section.id}: {section.title}</Text>
      
      <AudioPlayer />

      <Text style={styles.subLabel}>Câu hỏi:</Text>
      {section.questions.map((q: any, idx: number) => (
        <QuestionItem
          key={q.id}
          qIndex={idx + 1}
          question={q.text}
          options={q.options}
          selectedId={answers[q.id]}
          onSelect={(optionId: string) => onAnswerSelect(q.id, optionId)}
        />
      ))}
    </View>
  );
};

// --- Màn hình chính ---
export default function ListeningExerciseScreen() {
  const router = useRouter();
  const [answers, setAnswers] = useState<any>({});

  // Mock data theo hình ảnh thiết kế 13 & 24
  const mockData = [
    {
      id: 1,
      title: 'Gia đình của tôi',
      questions: [
        {
          id: 'l1_q1',
          text: 'Gia đình có mấy người?',
          options: [
            { id: 'a', text: '2 người' },
            { id: 'b', text: '2 người' },
            { id: 'c', text: '2 người' },
            { id: 'd', text: '2 người' },
          ]
        },
        {
          id: 'l1_q2',
          text: 'Gia đình có mấy người?',
          options: [
            { id: 'a', text: '2 người' },
            { id: 'b', text: '2 người' },
            { id: 'c', text: '2 người' },
            { id: 'd', text: '2 người' },
          ]
        }
      ]
    }
  ];

  const handleSelect = (qId: string, optionId: string) => {
    setAnswers({ ...answers, [qId]: optionId });
  };

  return (
    <View style={styles.container}>
      {/* Header xanh theo thiết kế */}
      <View style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()}>
              <XIcon size={28} color={COLORS.white} weight="bold" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Bài nghe</Text>
            <View style={{ width: 28 }} />
          </View>
        </SafeAreaView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPadding}>
        {mockData.map((section) => (
          <ListeningSection 
            key={section.id} 
            section={section} 
            answers={answers}
            onAnswerSelect={handleSelect}
          />
        ))}
      </ScrollView>

      {/* Footer Nộp bài */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitBtn} activeOpacity={0.8}>
          <Text style={styles.submitBtnText}>Nộp bài</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
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

  // Player Card Styles (iPhone 14 Plus - 24.png)
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
    gap: 15,
  },
  speedBadge: {
    backgroundColor: COLORS.primaryGreen,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  speedText: { color: COLORS.white, fontSize: 12, fontWeight: 'bold' },

  // Question Styles
  questionContainer: { marginBottom: 25 },
  questionText: { fontSize: 15, fontWeight: '700', color: COLORS.textDark, marginBottom: 12 },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.optionBg,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
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
  optionLabel: { fontSize: 15, fontWeight: '600', color: COLORS.textDark },

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