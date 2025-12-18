import React from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
// Import icons từ phosphor-react-native
import {
  ExamIcon,
  ArrowRightIcon,
  WavesIcon,
  ArrowClockwiseIcon,
  ArrowRight,
} from 'phosphor-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Lấy chiều rộng màn hình để tính toán layout lưới
const { width } = Dimensions.get('window');

// Định nghĩa màu sắc theo thiết kế
const COLORS = {
  primaryGreen: '#00C853', // Màu xanh lá chủ đạo
  textDark: '#1A1A1A', // Màu chữ đen
  textGray: '#666666', // Màu chữ xám phụ
  cardBg: '#F0F2F5', // Màu nền xám của các thẻ
  iconBgGreen: '#E0F2E9', // Nền xanh nhạt cho icon
  iconGreen: '#00C853', // Màu icon xanh
  decorativeShape: '#E5E7EB', // Màu các mảng trang trí góc
  white: '#FFFFFF',
};

// Dữ liệu giả lập (Mock Data) để hiển thị danh sách
// Sau này bạn sẽ thay thế bằng dữ liệu thật từ API
const MOCK_FEATURED_EXAMS = [
  { id: '1', title: 'Topik 2 - Kỳ 36' },
  { id: '2', title: 'Topik 3 - Kỳ 96' },
];

const MOCK_LEVEL_EXAMS = [
  { id: '1', title: 'Topik 1' },
  { id: '2', title: 'Topik 2' },
  { id: '3', title: 'Topik 3' },
  { id: '4', title: 'Topik 4' },
  { id: '5', title: 'Topik 5' },
  { id: '6', title: 'Topik 6' },
  { id: '7', title: 'EPS' },
];

export default function ExamsScreen() {
  // Component cho mảng trang trí góc phải dưới của các thẻ
  const DecorativeCorner = ({ isSmall = false }) => (
    <View
      style={[
        styles.decorativeShape,
        isSmall ? styles.decorativeShapeSmall : styles.decorativeShapeLarge,
      ]}
    />
  );

  return (
    <View style={styles.container}>
       {/* Tạo nền cong nhẹ trên header giống thiết kế */}
      <View style={styles.headerBackgroundShape} />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* --- Header Title --- */}
          <Text style={styles.mainHeaderTitle}>Luyện thi</Text>

          {/* --- Section 1: Thi lại (Retry Exam) --- */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thi lại</Text>
            {/* Thẻ bài thi chính */}
            <View style={styles.mainRetryCard}>
              <View style={styles.retryCardTopRow}>
                {/* Icon Container */}
                <View style={styles.iconContainerGreen}>
                  <ExamIcon size={28} color={COLORS.iconGreen} weight="fill" />
                </View>
                <Text style={styles.cardTitleLarge}>Topik 2 - Kỳ 36</Text>
              </View>

              <View style={styles.retryCardBottomRow}>
                <Text style={styles.previousScoreText}>Điểm lần trước: 60/100</Text>
                {/* Nút bấm Gradient */}
                <TouchableOpacity activeOpacity={0.8}>
                  <LinearGradient
                    colors={['#00D95F', '#00B34A']} // Gradient xanh
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.retryButtonGradient}
                  >
                    <ArrowClockwiseIcon size={18} color={COLORS.white} weight="bold" style={{ marginRight: 8 }} />
                    <Text style={styles.retryButtonText}>Thử sức lại ngay!</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
              {/* Mảng trang trí góc */}
              <DecorativeCorner />
            </View>
          </View>

          {/* --- Section 2: Đề thi nổi bật (Featured Exams) --- */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Đề thi nổi bật</Text>
              <TouchableOpacity>
                 <ArrowRightIcon size={24} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>
            
            {/* Danh sách đề thi nổi bật */}
            {MOCK_FEATURED_EXAMS.map((exam) => (
              <TouchableOpacity key={exam.id} style={styles.featuredCard} activeOpacity={0.7}>
                <View style={styles.iconContainerGreen}>
                   {/* Sử dụng icon Exam từ phosphor */}
                  <ExamIcon size={24} color={COLORS.iconGreen} weight="fill" />
                </View>
                <Text style={styles.cardTitleMedium}>{exam.title}</Text>
                <DecorativeCorner isSmall={true} />
              </TouchableOpacity>
            ))}
          </View>

          {/* --- Section 3: Đề thi theo cấp độ (Exams by Level) --- */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Đề thi theo cấp độ</Text>
            {/* Grid Layout 2 cột */}
            <View style={styles.gridContainer}>
              {MOCK_LEVEL_EXAMS.map((exam) => (
                <TouchableOpacity key={exam.id} style={styles.levelCard} activeOpacity={0.7}>
                  <View style={styles.iconContainerGray}>
                    {/* Sử dụng icon Waves để giống hình sóng trong thiết kế */}
                    <WavesIcon size={24} color={COLORS.iconGreen} weight="regular" />
                  </View>
                  <Text style={styles.cardTitleMedium}>{exam.title}</Text>
                   <DecorativeCorner isSmall={true} />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Khoảng trống dưới cùng */}
          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  // Tạo hình nền cong nhẹ ở top
  headerBackgroundShape: {
      position: 'absolute',
      top: -Dimensions.get('window').width * 0.6, // Đẩy lên trên màn hình
      left: -Dimensions.get('window').width * 0.1,
      right: -Dimensions.get('window').width * 0.1,
      height: Dimensions.get('window').width * 0.8, // Chiều cao lớn
      backgroundColor: '#F7F9FC', // Màu nền xám rất nhạt
      borderBottomLeftRadius: Dimensions.get('window').width, // Bo tròn cực lớn để tạo đường cong
      borderBottomRightRadius: Dimensions.get('window').width,
      transform: [{ scaleX: 1.2 }], // Kéo dãn để đường cong thoai thoải hơn
  },
  safeArea: {
    flex: 1,
    
  },
  scrollContent: {
    padding: 20,
  },
  mainHeaderTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.primaryGreen,
    marginBottom: 25,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 15,
  },

  // --- Styles cho thẻ "Thi lại" ---
  mainRetryCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 24,
    padding: 20,
    overflow: 'hidden', // Quan trọng để cắt các mảng trang trí góc
    position: 'relative',
  },
  retryCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  retryCardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previousScoreText: {
    fontSize: 14,
    color: COLORS.textGray,
    fontWeight: '600',
  },
  retryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
  },
  retryButtonText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 12,
  },

  // --- Styles chung cho Icon Container ---
  iconContainerGreen: {
    width: 50,
    height: 50,
    backgroundColor: COLORS.iconBgGreen,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconContainerGray: {
    width: 44,
    height: 44,
    backgroundColor: '#E0E0E0', // Xám đậm hơn một chút cho phần Cấp độ
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  // --- Text Styles ---
  cardTitleLarge: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  cardTitleMedium: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
  },

  // --- Styles cho thẻ "Nổi bật" ---
  featuredCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    overflow: 'hidden',
    position: 'relative',
    height: 80,
  },

  // --- Styles cho Grid "Cấp độ" ---
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  levelCard: {
    width: (width - 40 - 15) / 2, // (Màn hình - padding 2 bên - khoảng cách giữa 2 thẻ) / 2
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    padding: 16,
    marginBottom: 15,
    overflow: 'hidden',
    position: 'relative',
    height: 76,
  },

  // --- Decorative Shapes (Mảng trang trí góc) ---
  decorativeShape: {
    position: 'absolute',
    bottom: -30,
    right: -30,
    backgroundColor: COLORS.decorativeShape,
    zIndex: -1,
  },
  decorativeShapeLarge: {
      width: 140,
      height: 140,
      borderRadius: 70,
      borderTopLeftRadius: 100, // Tạo hình dáng méo mó tự nhiên hơn
  },
  decorativeShapeSmall: {
      width: 80,
      height: 80,
      borderRadius: 40,
      borderTopLeftRadius: 60,
  }
});