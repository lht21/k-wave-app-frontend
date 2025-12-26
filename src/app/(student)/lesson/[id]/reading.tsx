import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
 
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import { XIcon, CheckIcon } from 'phosphor-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ReadingExercise, readingService } from '../../../../services/readingService';
import { ActivityIndicator } from 'react-native-paper';


const COLORS = {
  primaryGreen: '#00C853',
  textDark: '#1A1A1A',
  textGray: '#666666',
  white: '#FFFFFF',
  optionBg: '#E0E0E0',
};

// --- Component 1: Một câu hỏi ---
const QuestionItem = ({ qIndex, question, options, selectedIndex, onSelect, result }: any) => {
  return (
    <View style={styles.questionContainer}>
      <Text style={styles.questionText}>Câu {qIndex}: {question}</Text>
      
      {/* SỬA 1: Map qua mảng string, dùng index làm key */}
      {options.map((optionText: string, index: number) => {
        const isSelected = selectedIndex === index;
        
        // Logic tô màu kết quả (Chấm điểm)
        let itemStyle = styles.optionItem;
        let textStyle = styles.optionLabel;

        if (result) {
            // Nếu đây là đáp án ĐÚNG (theo server)
            if (result.correctAnswer === index) {
                itemStyle = { ...styles.optionItem, backgroundColor: '#C8E6C9', borderColor: '#00C853', borderWidth: 1 };
            }
            // Nếu user chọn SAI
            if (isSelected && !result.isCorrect) {
                itemStyle = { ...styles.optionItem, backgroundColor: '#FFCDD2', borderColor: '#F44336', borderWidth: 1 };
            }
        } else if (isSelected) {
            // Trạng thái đang chọn (chưa nộp)
            itemStyle = { ...styles.optionItem, borderColor: COLORS.primaryGreen, borderWidth: 1, backgroundColor: '#E8F5E9' };
        }

        return (
          <TouchableOpacity
            key={index} // Dùng index làm key vì options là mảng string
            style={itemStyle}
            activeOpacity={0.7}
            // SỬA 2: Truyền index thay vì option.id
            onPress={() => !result && onSelect(index)}
            disabled={!!result} // Khóa không cho chọn lại khi đã có kết quả
          >
            <View style={[styles.radioButton, isSelected && styles.radioActive]}>
              {isSelected && <View style={styles.radioInner} />}
            </View>
            {/* SỬA 3: Hiển thị trực tiếp optionText */}
            <Text style={textStyle}>{optionText}</Text>
          </TouchableOpacity>
        );
      })}
      
      {/* Hiển thị giải thích nếu sai */}
      {result && !result.isCorrect && (
           <Text style={{color: '#F44336', marginTop: 8, fontStyle: 'italic', fontSize: 13}}>
               👉 Đáp án đúng: {options[result.correctAnswer]}
           </Text>
      )}
    </View>
  );
};
// --- Component 2: Một bài đọc (Passage + Questions) ---
const ReadingSection = ({ section, answers, onAnswerSelect, sectionResult }: any) => {
  return (
    <View style={styles.sectionContainer}>
      {/* Dùng section.title thay vì _id cho đẹp */}
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <Text style={styles.passageContent}>{section.content}</Text>
      
      {/* Hiển thị bản dịch nếu cần (Optional) */}
      {section.translation && (
        <Text style={{fontSize: 14, color: '#666', fontStyle: 'italic', marginBottom: 15}}>
            {section.translation}
        </Text>
      )}

      <Text style={styles.subLabel}>Câu hỏi:</Text>
      {section.questions.map((q: any, idx: number) => {
        // --- SỬA LỖI TẠI ĐÂY ---
        // Thêm ?. trước .find
        const qResult = sectionResult?.results?.find((r: any) => r.questionId.toString() === q._id.toString());
        
        return (
            <QuestionItem
              key={q._id}
              qIndex={idx + 1}
              question={q.question}
              options={q.options}
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
export default function ReadingExerciseScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  
  const [readings, setReadings] = useState<ReadingExercise[]>([]);
  const [loading, setLoading] = useState(true);

  // State lưu đáp án: { "questionId": 0, "questionId2": 1 }
  const [answers, setAnswers] = useState<Record<string, number>>({});
  
  // State lưu kết quả sau khi chấm: { "readingId": { score: 80, results: [...] } }
  const [results, setResults] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);

  // 1. Fetch dữ liệu khi vào màn hình
  useEffect(() => {
    const fetchReadings = async () => {
      try {
        const lessonId = Array.isArray(id) ? id[0] : id;
        if (lessonId) {
            const data = await readingService.getReadingsByLesson(lessonId);
            setReadings(data.readings || []);
        }
      } catch (error) {
        Alert.alert("Lỗi", "Không thể tải bài tập đọc.");
      } finally {
        setLoading(false);
      }
    };
    fetchReadings();
  }, [id]);


  // 2. Xử lý chọn đáp án (Lưu index)
  const handleSelect = (qId: string, optionIndex: number) => {
    setAnswers({ ...answers, [qId]: optionIndex });
  };

  // 3. Xử lý Nộp bài
  const handleSubmit = async () => {
    try {
        setSubmitting(true);
        const lessonId = Array.isArray(id) ? id[0] : id;
        
        let newResults = {};
        let totalScore = 0;
        let answeredCount = 0;

        // Duyệt qua từng bài đọc
        for (const reading of readings) {
            const readingAnswers: Record<string, number> = {};
            
            // Lọc answers thuộc về bài đọc này
            reading.questions.forEach(q => {
                if (answers[q._id] !== undefined) {
                    readingAnswers[q._id] = answers[q._id];
                }
            });

            // Chỉ nộp nếu user có làm bài này
            if (Object.keys(readingAnswers).length > 0) {
                answeredCount++;
                const response = await readingService.submitReading(
                    reading._id, 
                    lessonId!, 
                    readingAnswers
                );

                // ✅ SỬA: Lấy dữ liệu từ thuộc tính .data
                // Backend trả về: { success: true, data: { score: 10, results: [...] } }
                const resultData = response.data; 

                // Kiểm tra an toàn trước khi cộng điểm
                if (resultData) {
                    // Lưu kết quả theo readingId
                    newResults = { ...newResults, [reading._id]: resultData }; 
                    totalScore += resultData.score;
                }
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
        {readings.length === 0 ? (
            <Text style={{textAlign: 'center', marginTop: 20}}>Không có bài đọc nào.</Text>
        ) : (
            (readings || []).map((section) => (
            <ReadingSection 
                key={section._id} 
                section={section} 
                answers={answers}
                onAnswerSelect={handleSelect}
                sectionResult={results[section._id]} // Truyền kết quả xuống
            />
            ))
        )}
      </ScrollView>

      {/* Footer Nộp bài (Chỉ hiện khi chưa có kết quả) */}
      {Object.keys(results).length === 0 && readings.length > 0 && (
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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