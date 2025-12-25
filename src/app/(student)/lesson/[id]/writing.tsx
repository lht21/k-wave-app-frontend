import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  
  Platform,
  StatusBar,
} from 'react-native';
import { XIcon, PenNibIcon } from 'phosphor-react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

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
const WritingExerciseItem = ({ lesson }: any) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState('');

  return (
    <View style={styles.exerciseWrapper}>
      <Text style={styles.lessonTitle}>Bài {lesson.id}: {lesson.title}</Text>
      <Text style={styles.instructionText}>{lesson.instruction}</Text>

      {/* Khung nhập liệu Card */}
      <View style={styles.inputCard}>
        {!isEditing && content === '' ? (
          // Trạng thái: Chưa bắt đầu (Ảnh 18)
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
          // Trạng thái: Đang soạn thảo hoặc Đã viết xong (Ảnh 20, 21)
          <View style={styles.editingContainer}>
            <TextInput
              style={styles.textInput}
              multiline
              placeholder="Soạn bài viết của bạn tại đây..."
              placeholderTextColor={COLORS.textGray}
              value={content}
              onChangeText={setContent}
              autoFocus={isEditing}
            />
            <View style={styles.cardFooter}>
              {content.length > 50 && (
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
        <Text style={styles.infoLabel}>Gợi ý làm bài</Text>
        {lesson.suggestions.map((s: string, i: number) => (
          <Text key={i} style={styles.bulletItem}>• {s}</Text>
        ))}

        <Text style={[styles.infoLabel, { marginTop: 15 }]}>Ví dụ</Text>
        {lesson.examples.map((ex: any, i: number) => (
          <View key={i} style={styles.exampleItem}>
            <Text style={styles.exampleKr}>• {ex.kr}</Text>
            <Text style={styles.exampleVi}>• {ex.vi}</Text>
          </View>
        ))}

        <Text style={[styles.infoLabel, { marginTop: 15 }]}>Yêu cầu</Text>
        <Text style={styles.bulletItem}>• Thời lượng bản ghi: {lesson.requirement}</Text>
      </View>
    </View>
  );
};

// --- Màn hình chính ---
export default function WritingExerciseScreen() {
  const router = useRouter();

  // Mock data giả lập nhiều bài viết
  const mockLessons = [
    {
      id: 1,
      title: 'Gia đình của tôi',
      instruction: 'Hãy viết một đoạn văn ngắn (3-5 câu) giới thiệu về bản thân (Tên, tuổi...',
      suggestions: [
        'Giới thiệu tên, tuổi, quê quán, sở thích và ước mơ',
        'Từ khoá có thể sử dụng:',
        'Mẫu:'
      ],
      examples: [
        { 
          kr: '안녕하세요. 저는 민호입니다. 25살입니다. 베트남에서 왔습니다. 제 취미는 음악 감상입니다. 제 꿈은 한국에 가는 것입니다.',
          vi: 'Xin chào. Tôi là Minho. Tôi 25 tuổi. Tôi đến từ Việt Nam. Sở thích của...'
        }
      ],
      requirement: '60 phút'
    }
  ];

  return (
    <View style={styles.container}>
      {/* Header xanh (Ảnh 18) */}
      <View style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()}>
              <XIcon size={28} color={COLORS.white} weight="bold" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Bài viết</Text>
            <View style={{ width: 28 }} />
          </View>
        </SafeAreaView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPadding}>
        {mockLessons.map((lesson) => (
          <WritingExerciseItem key={lesson.id} lesson={lesson} />
        ))}
      </ScrollView>

      {/* Nộp bài Button (Ảnh 21) */}
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