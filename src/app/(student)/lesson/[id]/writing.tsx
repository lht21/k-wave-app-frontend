import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { XIcon, PenNibIcon } from 'phosphor-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { writingService, Writing } from '../../../../services/writingService';

const { width } = Dimensions.get('window');

const COLORS = {
  primaryGreen: '#00C853',
  orangeStatus: '#FF9100',
  textDark: '#1A1A1A',
  textGray: '#666666',
  white: '#FFFFFF',
  cardBg: '#FFFFFF',
  lightGray: '#F5F5F5',
  badgeBg: '#E9ECEF',
};

// --- Component 1: Một bài tập viết ---
interface WritingItemProps {
  writing: Writing;
  content: string;
  onContentChange: (text: string) => void;
}

const WritingExerciseItem = ({ writing, content, onContentChange }: WritingItemProps) => {
  const [isEditing, setIsEditing] = useState(false);

  // Tạo danh sách gợi ý từ các trường hint
  const suggestions = [
    ...(writing.wordHint || []),
    ...(writing.grammarHint || []),
    writing.structureHint
  ].filter(Boolean); // Lọc bỏ giá trị null/undefined

  return (
    <View style={styles.exerciseWrapper}>
      <Text style={styles.lessonTitle}>Bài viết: {writing.title}</Text>
      <Text style={styles.instructionText}>{writing.instruction || writing.prompt}</Text>

      {/* Khung nhập liệu Card */}
      <View style={styles.inputCard}>
        {!isEditing && content === '' ? (
          // Trạng thái: Chưa bắt đầu
          <View style={styles.startContainer}>
            <View style={styles.iconCircle}>
              <PenNibIcon size={40} color={COLORS.primaryGreen} weight="duotone" />
            </View>
            <TouchableOpacity 
              style={styles.startBtn} 
              onPress={() => setIsEditing(true)}
            >
              <Text style={styles.startBtnText}>Bắt đầu viết</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Trạng thái: Đang soạn thảo
          <View style={styles.editingContainer}>
            <TextInput
              style={styles.textInput}
              multiline
              placeholder="Soạn bài viết của bạn tại đây..."
              placeholderTextColor={COLORS.textGray}
              value={content}
              onChangeText={onContentChange}
              autoFocus={isEditing}
            />
            <View style={styles.cardFooter}>
              {content.length >= writing.minWords && (
                <View style={styles.statusBadge}>
                  <Text style={styles.statusBadgeText}>Đã đạt yêu cầu</Text>
                </View>
              )}
              <View style={styles.charCountBadge}>
                <Text style={styles.charCountText}>{content.length} ký tự</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Thông tin bổ trợ */}
      <View style={styles.infoSection}>
        {suggestions.length > 0 && (
          <>
            <Text style={styles.infoLabel}>Gợi ý làm bài</Text>
            {suggestions.map((s: any, i: number) => (
              <Text key={i} style={styles.bulletItem}>• {s}</Text>
            ))}
          </>
        )}

        {(writing.sampleAnswer || writing.sampleTranslation) && (
          <>
            <Text style={[styles.infoLabel, { marginTop: 15 }]}>Ví dụ</Text>
            <View style={styles.exampleItem}>
              {writing.sampleAnswer && <Text style={styles.exampleKr}>• {writing.sampleAnswer}</Text>}
              {writing.sampleTranslation && <Text style={styles.exampleVi}>• {writing.sampleTranslation}</Text>}
            </View>
          </>
        )}

        <Text style={[styles.infoLabel, { marginTop: 15 }]}>Yêu cầu</Text>
        <Text style={styles.bulletItem}>• Tối thiểu: {writing.minWords} từ</Text>
        <Text style={styles.bulletItem}>• Thời gian gợi ý: {writing.estimatedTime} phút</Text>
      </View>
    </View>
  );
};

// --- Màn hình chính ---
export default function WritingExerciseScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // id là lessonId
  
  const [writings, setWritings] = useState<Writing[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // State lưu nội dung bài làm: { writingId: content }
  const [answers, setAnswers] = useState<Record<string, string>>({});
  
  // Dùng để tính thời gian làm bài (đơn giản)
  const startTimeRef = useRef<number>(Date.now());

  // 1. Fetch dữ liệu
  useEffect(() => {
    const fetchWritings = async () => {
      try {
        const lessonId = Array.isArray(id) ? id[0] : id;
        if (lessonId) {
          const data = await writingService.getWritingsByLesson(lessonId);
          setWritings(data.writings || []);
        }
      } catch (error) {
        console.error(error);
        Alert.alert("Lỗi", "Không thể tải bài tập viết.");
      } finally {
        setLoading(false);
      }
    };
    fetchWritings();
  }, [id]);

  // 2. Xử lý thay đổi nội dung
  const handleContentChange = (writingId: string, text: string) => {
    setAnswers(prev => ({
      ...prev,
      [writingId]: text
    }));
  };

  // 3. Xử lý nộp bài
  const handleSubmit = async () => {
    const lessonId = Array.isArray(id) ? id[0] : id;
    if (!lessonId) return;

    // Kiểm tra xem có bài nào chưa làm không
    const answeredCount = Object.keys(answers).filter(key => answers[key].trim().length > 0).length;
    
    if (answeredCount === 0) {
      Alert.alert("Thông báo", "Bạn chưa viết bài nào cả!");
      return;
    }

    try {
      setSubmitting(true);
      const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000); // Tính giây

      // Duyệt qua danh sách bài tập và nộp những bài có nội dung
      for (const writing of writings) {
        const content = answers[writing._id];
        
        // Chỉ nộp những bài có nội dung
        if (content && content.trim().length > 0) {
          await writingService.submitWriting(writing._id, {
            content: content,
            timeSpent: timeSpent, // Hoặc logic chia thời gian chi tiết hơn nếu cần
            isDraft: false,
            lessonId: lessonId
          });
        }
      }

      Alert.alert(
        "Thành công", 
        "Đã nộp bài viết thành công! Giáo viên sẽ chấm bài và phản hồi sớm nhất.",
        [{ text: "OK", onPress: () => router.back() }]
      );

    } catch (error: any) {
      console.error(error);
      Alert.alert("Lỗi", error.message || "Nộp bài thất bại.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.primaryGreen} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()}>
              <XIcon size={28} color={COLORS.white} weight="bold" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Luyện Viết</Text>
            <View style={{ width: 28 }} />
          </View>
        </SafeAreaView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPadding}>
        {writings?.length === 0 ? (
          <View style={styles.center}>
            <Text style={{ color: COLORS.textGray, marginTop: 20 }}>Không có bài tập viết nào.</Text>
          </View>
        ) : (
          (writings || []).map((writing) => (
            <WritingExerciseItem 
              key={writing._id} 
              writing={writing} 
              content={answers[writing._id] || ''}
              onContentChange={(text) => handleContentChange(writing._id, text)}
            />
          ))
        )}
      </ScrollView>

      {/* Footer Nộp bài */}
      {writings?.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.submitBtn, submitting && { opacity: 0.7 }]} 
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

  scrollPadding: { paddingBottom: 100 },
  
  exerciseWrapper: { padding: 20 },
  lessonTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.textDark, marginBottom: 8 },
  instructionText: { fontSize: 14, color: COLORS.textDark, lineHeight: 20, marginBottom: 20 },

  // Card Input Styles
  inputCard: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    minHeight: 250,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  startContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F7F9FC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  startBtn: {
    backgroundColor: COLORS.primaryGreen,
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 30,
  },
  startBtnText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },

  editingContainer: { flex: 1 },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textDark,
    textAlignVertical: 'top',
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 10,
    gap: 8,
  },
  statusBadge: {
    backgroundColor: COLORS.orangeStatus,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusBadgeText: { color: COLORS.white, fontSize: 11, fontWeight: 'bold' },
  charCountBadge: {
    backgroundColor: COLORS.badgeBg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  charCountText: { fontSize: 11, color: COLORS.textDark, fontWeight: 'bold' },

  // Info Section Styles
  infoSection: { marginTop: 10 },
  infoLabel: { fontSize: 16, fontWeight: 'bold', color: COLORS.primaryGreen, marginBottom: 12 },
  bulletItem: { fontSize: 14, color: COLORS.textDark, marginBottom: 6, fontWeight: '600' },
  exampleItem: { marginBottom: 12 },
  exampleKr: { fontSize: 14, color: COLORS.textDark, fontWeight: '600', marginBottom: 4 },
  exampleVi: { fontSize: 14, color: COLORS.textDark, fontStyle: 'italic' },

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