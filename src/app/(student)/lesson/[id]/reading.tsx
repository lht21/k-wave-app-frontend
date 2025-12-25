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
import { XIcon, CheckIcon } from 'phosphor-react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const COLORS = {
  primaryGreen: '#00C853',
  textDark: '#1A1A1A',
  textGray: '#666666',
  white: '#FFFFFF',
  optionBg: '#E0E0E0',
};

// --- Component 1: Một câu hỏi ---
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

// --- Component 2: Một bài đọc (Passage + Questions) ---
const ReadingSection = ({ section, answers, onAnswerSelect }: any) => {
  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Bài {section.id}: {section.title}</Text>
      <Text style={styles.passageContent}>{section.content}</Text>

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
export default function ReadingExerciseScreen() {
  const router = useRouter();
  const [answers, setAnswers] = useState<any>({});

  // Mock data theo hình ảnh thiết kế
  const mockData = [
    {
      id: 1,
      title: 'Gia đình của tôi',
      content: '우리 가족은 네 명입니다. 아버지, 어머니, 형, 그리고 저입니다. 아버지는 의사입니다. 어머니는 선생님입니다.',
      questions: [
        {
          id: 'q1_1',
          text: 'Gia đình có mấy người?',
          options: [
            { id: 'a', text: '2 người' },
            { id: 'b', text: '3 người' },
            { id: 'c', text: '4 người' },
            { id: 'd', text: '5 người' },
          ]
        },
        {
          id: 'q1_2',
          text: 'Bố làm nghề gì?',
          options: [
            { id: 'a', text: 'Bác sĩ' },
            { id: 'b', text: 'Giáo viên' },
          ]
        }
      ]
    },
    {
      id: 2,
      title: 'Gia đình của tôi',
      content: '우리 가족은 네 명입니다. 아버지, 어머니, 형, 그리고 저입니다. 아버지는 의사입니다. 어머니는 선생님입니다.',
      questions: [
        {
          id: 'q1_1',
          text: 'Gia đình có mấy người?',
          options: [
            { id: 'a', text: '2 người' },
            { id: 'b', text: '3 người' },
            { id: 'c', text: '4 người' },
            { id: 'd', text: '5 người' },
          ]
        },
        {
          id: 'q1_2',
          text: 'Bố làm nghề gì?',
          options: [
            { id: 'a', text: 'Bác sĩ' },
            { id: 'b', text: 'Giáo viên' },
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
      {/* Header xanh full màn hình theo ảnh 12 */}
      <View style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()}>
              <XIcon size={28} color={COLORS.white} weight="bold" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Bài đọc</Text>
            <View style={{ width: 28 }} />
          </View>
        </SafeAreaView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPadding}>
        {mockData.map((section) => (
          <ReadingSection 
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
  sectionContainer: { marginBottom: 30, borderColor: '#DDDDDD', borderRadius: 12, padding: 15, borderBottomWidth: 1},
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textDark, marginBottom: 15 },
  passageContent: { fontSize: 15, color: COLORS.textDark, lineHeight: 22, marginBottom: 20 },
  subLabel: { fontSize: 16, fontWeight: 'bold', color: COLORS.textDark, marginBottom: 15 },

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