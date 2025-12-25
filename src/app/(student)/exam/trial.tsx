import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
// Import icons từ phosphor-react-native
import {
  Exam,
  ArrowRight,
  Waves,
  Lightning,
} from 'phosphor-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useExam } from '../../../hooks/useExam';
import { Exam as ExamType, ExamType as ExamTypeEnum } from '../../../services/examService';

// Lấy chiều rộng màn hình để tính toán layout lưới
const { width } = Dimensions.get('window');

// Định nghĩa màu sắc theo thiết kế
const COLORS = {
  primaryBlue: '#00C853', // Màu xanh dương chủ đạo cho thi thử
  textDark: '#1A1A1A', // Màu chữ đen
  textGray: '#666666', // Màu chữ xám phụ
  cardBg: '#F0F2F5', // Màu nền xám của các thẻ
  iconBgBlue: '#E3F2FD', // Nền xanh nhạt cho icon
  iconBlue: '#00C853', // Màu icon xanh
  decorativeShape: '#E5E7EB', // Màu các mảng trang trí góc
  white: '#FFFFFF',
  accentOrange: '#FF9800', // Màu nhấn cam cho "Thi thử"
};

// Exam type labels
const examTypeLabels: { [key in ExamTypeEnum]: string } = {
  topik1: 'TOPIK I',
  topik2: 'TOPIK II',
  esp: 'ESP',
};

export default function TrialExamsScreen() {
  const router = useRouter();
  const { loading, fetchExams } = useExam();
  
  const [selectedType, setSelectedType] = useState<ExamTypeEnum>('topik1');
  const [exams, setExams] = useState<ExamType[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [featuredExams, setFeaturedExams] = useState<ExamType[]>([]);

  // Load exams when component mounts or type changes
  useEffect(() => {
    loadExams();
  }, [selectedType]);

  const loadExams = async () => {
    try {
      setRefreshing(true);
      const data = await fetchExams(selectedType);
      setExams(data);
      
      // Get featured exams (premium ones or latest 2)
      const featured = data.filter(exam => exam.isPremium).slice(0, 2);
      if (featured.length === 0) {
        setFeaturedExams(data.slice(0, 2));
      } else {
        setFeaturedExams(featured);
      }
    } catch (error) {
      console.error('Error loading exams:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleStartTrialExam = (examId: string, examTitle: string) => {
    // Navigate to exam detail screen to choose skill (trial mode)
    router.push({
      pathname: '/(student)/exam/exam-detail',
      params: { 
        examId,
        isTrialMode: 'true' // Flag to indicate trial mode (no timer)
      }
    });
  };

  const handleChangeExamType = (type: ExamTypeEnum) => {
    setSelectedType(type);
  };

  // Component cho mảng trang trí góc phải dưới của các thẻ
  const DecorativeCorner = ({ isSmall = false }) => (
    <View
      style={[
        styles.decorativeShape,
        isSmall ? styles.decorativeShapeSmall : styles.decorativeShapeLarge,
      ]}
    />
  );

  if (loading && exams.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primaryBlue} />
        <Text style={styles.loadingText}>Đang tải đề thi thử...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
       {/* Tạo nền cong nhẹ trên header giống thiết kế */}
      <View style={styles.headerBackgroundShape} />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={loadExams}
              colors={[COLORS.primaryBlue]}
              tintColor={COLORS.primaryBlue}
            />
          }
        >
          {/* --- Header Title --- */}
          <View style={styles.headerTitleContainer}>
            <Text style={styles.mainHeaderTitle}>Thi thử</Text>
            <View style={styles.trialBadge}>
              <Lightning size={16} color={COLORS.accentOrange} weight="fill" />
              <Text style={styles.trialBadgeText}>Không giới hạn thời gian</Text>
            </View>
          </View>

          {/* Exam Type Tabs */}
          <View style={styles.typeTabsContainer}>
            {(Object.keys(examTypeLabels) as ExamTypeEnum[]).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeTab,
                  selectedType === type && styles.activeTypeTab
                ]}
                onPress={() => handleChangeExamType(type)}
              >
                <Text style={[
                  styles.typeTabText,
                  selectedType === type && styles.activeTypeTabText
                ]}>
                  {examTypeLabels[type]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* --- Section 2: Đề thi nổi bật (Featured Exams) --- */}
          {featuredExams.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Đề thi nổi bật</Text>
                <TouchableOpacity>
                  <ArrowRight size={24} color={COLORS.textDark} />
                </TouchableOpacity>
              </View>
              
              {/* Danh sách đề thi nổi bật */}
              {featuredExams.map((exam) => (
                <TouchableOpacity 
                  key={exam._id} 
                  style={styles.featuredCard} 
                  activeOpacity={0.7}
                  onPress={() => handleStartTrialExam(exam._id, exam.title)}
                >
                  <View style={styles.iconContainerBlue}>
                    <Exam size={24} color={COLORS.iconBlue} weight="fill" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitleMedium}>{exam.title}</Text>
                    <View style={styles.examMetaRow}>
                      {exam.isPremium && (
                        <Text style={styles.premiumBadgeText}>⭐ Premium</Text>
                      )}
                      <Text style={styles.trialLabel}>🚀 Thi thử</Text>
                    </View>
                  </View>
                  <DecorativeCorner isSmall={true} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* --- Section 3: Tất cả đề thi (All Exams) --- */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tất cả đề thi thử</Text>
            {exams.length === 0 ? (
              <View style={styles.emptyState}>
                <Exam size={48} color={COLORS.textGray} weight="thin" />
                <Text style={styles.emptyText}>Chưa có đề thi thử nào</Text>
              </View>
            ) : (
              <View style={styles.gridContainer}>
                {exams.map((exam) => (
                  <TouchableOpacity 
                    key={exam._id} 
                    style={styles.levelCard} 
                    activeOpacity={0.7}
                    onPress={() => handleStartTrialExam(exam._id, exam.title)}
                  >
                    <View style={styles.iconContainerGray}>
                      <Waves size={24} color={COLORS.iconBlue} weight="regular" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitleMedium} numberOfLines={2}>
                        {exam.title}
                      </Text>
                      <Text style={styles.examMeta}>
                        {exam.totalQuestions || 0} câu
                      </Text>
                      <Text style={styles.trialLabel}>⚡ Không giới hạn</Text>
                    </View>
                    <DecorativeCorner isSmall={true} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textGray,
  },
  // Tạo hình nền cong nhẹ ở top
  headerBackgroundShape: {
      position: 'absolute',
      top: -Dimensions.get('window').width * 0.6, // Đẩy lên trên màn hình
      left: -Dimensions.get('window').width * 0.1,
      right: -Dimensions.get('window').width * 0.1,
      height: Dimensions.get('window').width * 0.8, // Chiều cao lớn
      backgroundColor: '#E3F2FD', // Màu nền xanh nhạt cho thi thử
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
  headerTitleContainer: {
    marginBottom: 20,
  },
  mainHeaderTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.primaryBlue,
    marginBottom: 8,
  },
  trialBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  trialBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.accentOrange,
  },
  // Exam Type Tabs
  typeTabsContainer: {
    flexDirection: 'row',
    marginBottom: 25,
    gap: 12,
  },
  typeTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: COLORS.cardBg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeTypeTab: {
    backgroundColor: COLORS.primaryBlue + '15',
    borderColor: COLORS.primaryBlue,
  },
  typeTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textGray,
  },
  activeTypeTabText: {
    color: COLORS.primaryBlue,
    fontWeight: '700',
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

  // --- Styles chung cho Icon Container ---
  iconContainerBlue: {
    width: 50,
    height: 50,
    backgroundColor: COLORS.iconBgBlue,
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
  examMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  premiumBadgeText: {
    fontSize: 10,
    color: COLORS.primaryBlue,
    fontWeight: '600',
  },
  trialLabel: {
    fontSize: 10,
    color: COLORS.accentOrange,
    fontWeight: '700',
  },
  examMeta: {
    fontSize: 11,
    color: COLORS.textGray,
    marginTop: 4,
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
    minHeight: 80,
  },

  // --- Styles cho Grid "Tất cả đề thi" ---
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  levelCard: {
    width: (width - 40 - 15) / 2, // (Màn hình - padding 2 bên - khoảng cách giữa 2 thẻ) / 2
    flexDirection: 'column',
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    padding: 16,
    marginBottom: 15,
    overflow: 'hidden',
    position: 'relative',
    minHeight: 120,
  },

  // --- Empty State ---
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textGray,
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
