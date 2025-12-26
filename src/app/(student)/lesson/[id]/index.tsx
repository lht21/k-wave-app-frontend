import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  Alert, 
  ActivityIndicator, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  FlatList, 
  Dimensions,
  Animated, // 1. Import Animated
  Easing
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Lesson, lessonService } from '../../../../services/lessonService';
import { colors, palette } from '../../../../theme/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  CaretLeftIcon, 
  CornersOutIcon, 
  BookOpenIcon, 
  ChalkboardTeacherIcon,
  HandWavingIcon, // Icon vẫy tay
  SparkleIcon     // Icon lấp lánh cho lần đầu
} from 'phosphor-react-native';
import { LessonProgress, lessonProgressService } from '../../../../services/lessonProgressService';
import ProcessBar from '../../../../components/ProcessBar/ProcessBar';

const { width } = Dimensions.get('window');

const COLORS = {
  primaryGreen: '#00C853',
  primaryBg: '#94ffc0ff',
  textDark: '#1A1A1A',
  textGray: '#666666',
  cardBg: '#F0F2F5',
  white: '#FFFFFF',
  decorativeShape: '#E5E7EB',
};

// --- COMPONENT THÔNG BÁO TỰ ĐỘNG TẮT ---
const WelcomeToast = ({ visible, message, type }: { visible: boolean, message: string, type: 'first' | 'return' }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current; // Opacity
    const slideAnim = useRef(new Animated.Value(-50)).current; // Slide từ trên xuống

    useEffect(() => {
        if (visible) {
            // Hiệu ứng xuất hiện
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.spring(slideAnim, {
                    toValue: 20, // Vị trí xuất hiện (cách top 20px)
                    useNativeDriver: true,
                    friction: 5
                })
            ]).start();
        } else {
            // Hiệu ứng biến mất
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(slideAnim, {
                    toValue: -50, // Trượt ngược lên trên
                    duration: 300,
                    useNativeDriver: true,
                })
            ]).start();
        }
    }, [visible]);

    if (!visible && fadeAnim._value === 0) return null; // Ẩn hẳn khi không dùng

    const bgColor = type === 'first' ? COLORS.primaryGreen : '#2196F3'; // Xanh lá cho lần đầu, Xanh dương cho quay lại
    const Icon = type === 'first' ? SparkleIcon : HandWavingIcon;

    return (
        <Animated.View style={[
            styles.toastContainer, 
            { 
                opacity: fadeAnim, 
                transform: [{ translateY: slideAnim }],
                backgroundColor: bgColor 
            }
        ]}>
            <Icon size={24} color="#FFF" weight="fill" style={{ marginRight: 10 }} />
            <Text style={styles.toastText}>{message}</Text>
        </Animated.View>
    );
};
// ----------------------------------------

const LessonDetail = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<LessonProgress | null>(null);

  // State cho Toast
  const [toastVisible, setToastVisible] = useState(false);
  const [toastConfig, setToastConfig] = useState<{ message: string, type: 'first' | 'return' }>({ message: '', type: 'return' });

  useEffect(() => {
    const initProgress = async () => {
      try {
        setLoading(true);
        const response = await lessonProgressService.initializeLessonProgress(id as string);
        
        setProgress(response.data);

        // --- LOGIC HIỂN THỊ TOAST ---
        if (response.isFirstAccess) {
           setToastConfig({
               message: "Chào mừng! Bắt đầu bài học mới nào!",
               type: 'first'
           });
        } else {
           setToastConfig({
               message: "Chào mừng bạn quay trở lại!",
               type: 'return'
           });
        }
        
        // Bật Toast
        setToastVisible(true);

        // Tự động tắt sau 3 giây
        setTimeout(() => {
            setToastVisible(false);
        }, 3000);
        // ---------------------------

      } catch (error) {
        console.error("Lỗi khởi tạo bài học:", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      loadLessonData();
      initProgress();
    };
  }, [id]);

  const loadLessonData = async () => {
    try {
      setLoading(true);
      const data = await lessonService.getLessonById(id as string);
      setLesson(data);
    } catch (error: any) {
      Alert.alert("Lỗi", "Không thể tải thông tin bài học");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primaryGreen} />
      </View>
    );
  }

  const VocabCard = ({ item }: { item: any }) => (
    <View style={styles.vocabCard}>
      <Text style={styles.koreanText}>{item.word || '예절'}</Text>
      <View style={styles.vocabDivider} />
      <Text style={styles.vietText}>{item.meaning || 'nghi lễ'}</Text>
    </View>
  );

  const GrammarCard = ({ item }: { item: any }) => (
    <View style={styles.grammarCard}>
      <Text style={styles.grammarMainText}>{item.structure || '예절'}</Text>
      <View style={styles.vocabDivider} />
      <Text style={styles.vietText}>{item.meaning || 'nghi lễ'}</Text>
      <TouchableOpacity 
        style={styles.expandIcon} 
        onPress={() => {
          router.push({
            pathname: `/(student)/lesson/${id}/grammar`,
            params: { grammarData: JSON.stringify(item) }
          });
        }}
      >
        <CornersOutIcon size={20} color={COLORS.textDark} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Wavy Header Background */}
      <View style={styles.headerBackgroundShape} />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* --- NHÚNG TOAST VÀO ĐÂY (Nằm trên cùng SafeArea nhưng absolute) --- */}
        <WelcomeToast 
            visible={toastVisible} 
            message={toastConfig.message} 
            type={toastConfig.type} 
        />
        {/* ----------------------------------------------------------------- */}

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <CaretLeftIcon size={28} color={COLORS.primaryGreen} weight="bold" />
          </TouchableOpacity>

          {progress && (
            <View style={styles.progressOverviewCard}>
              <Text style={styles.progressOverviewTitle}>Tiến độ học tập</Text>
              
              <View style={styles.progressGrid}>
                <View style={styles.progressColumn}>
                    <ProcessBar label="Từ vựng" percent={progress.vocabularyProgress} color={COLORS.primaryGreen} />
                    <ProcessBar label="Ngữ pháp" percent={progress.grammarProgress} color={palette.orange} />
                    <ProcessBar label="Đọc" percent={progress.readingProgress} color={palette.blue} />
                </View>
                <View style={{width: 15}} />
                <View style={styles.progressColumn}>
                    <ProcessBar label="Nghe" percent={progress.listeningProgress} color={palette.purple} />
                    <ProcessBar label="Viết" percent={progress.writingProgress} color={palette.red} />
                    <ProcessBar label="Nói" percent={progress.speakingProgress} color={palette.teal} />
                </View>
              </View>
            </View>
          )}

          <View style={styles.titleSection}>
            <Text style={styles.mainTitle}>{lesson?.title || 'Title'}</Text>
            <Text style={styles.description}>{lesson?.description || 'description'}</Text>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.authorGroup}>
              <View style={styles.avatarPlaceholder} />
              <Text style={styles.authorEmail}>{lesson?.author?.email}</Text>
            </View>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>{lesson?.level}</Text>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleGroup}>
              <Text style={styles.sectionTitle}>Từ vựng</Text>
              <View style={styles.verticalDivider} />
              <Text style={styles.itemCount}>{lesson?.vocabulary?.length || 0} từ</Text>
            </View>
            <TouchableOpacity onPress={() => router.push(`/(student)/lesson/${id}/vocabularies`)}>
              <Text style={styles.seeAllText}>Tất cả từ vựng</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            horizontal
            data={lesson?.vocabulary || [{}, {}, {}]}
            keyExtractor={(_, index) => `vocab-${index}`}
            renderItem={({ item }) => <VocabCard item={item} />}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalListPadding}
          />

          <View style={styles.studyActionsRow}>
            <TouchableOpacity style={styles.studyCard} onPress={() => router.push(`/(student)/lesson/${id}/flashcard`)}>
              <Text style={styles.studyCardText}>Flashcard</Text>
              <View style={styles.cardDecorativeIcon} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.studyCard} onPress={() => router.push(`/(student)/lesson/${id}/learn`)}>
              <Text style={styles.studyCardText}>Học</Text>
              <View style={styles.cardDecorativeIcon} />
            </TouchableOpacity>
          </View>

          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleGroup}>
              <Text style={styles.sectionTitle}>Ngữ pháp</Text>
              <View style={styles.verticalDivider} />
              <Text style={styles.itemCount}>{lesson?.grammar?.length || 0} ngữ pháp</Text>
            </View>
          </View>

          <FlatList
            horizontal
            data={lesson?.grammar || [{}, {}]}
            keyExtractor={(_, index) => `grammar-${index}`}
            renderItem={({ item }) => <GrammarCard item={item} />}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalListPadding}
          />

          <Text style={[styles.sectionTitle, { marginTop: 20, marginBottom: 15 }]}>Bài tập</Text>

          {lesson?.reading.length > 0 && (
            <TouchableOpacity style={styles.exerciseCard} onPress={() => router.push(`/(student)/lesson/${id}/reading`)}>
              <View style={styles.exerciseIconContainer}>
                <BookOpenIcon size={24} color={COLORS.primaryGreen} weight="fill" />
              </View>
              <View>
                <Text style={styles.exerciseTitle}>Bài đọc</Text>
                <Text style={styles.exerciseSub}>{lesson?.reading.length || 0} bài</Text>
              </View>
              <View style={styles.exerciseDecorativeShape} />
            </TouchableOpacity>
          )}
          
          {lesson?.writing.length > 0 && (
            <TouchableOpacity style={styles.exerciseCard} onPress={() => router.push(`/(student)/lesson/${id}/writing`)}>
              <View style={styles.exerciseIconContainer}>
                <ChalkboardTeacherIcon size={24} color={COLORS.primaryGreen} weight="fill" />
              </View>
              <View>
                <Text style={styles.exerciseTitle}>Bài viết</Text>
                <Text style={styles.exerciseSub}>{lesson?.writing.length || 0} bài</Text>
              </View>
              <View style={styles.exerciseDecorativeShape} />
            </TouchableOpacity>
          )}

          {lesson?.speaking.length > 0 && (
            <TouchableOpacity style={styles.exerciseCard} onPress={() => router.push(`/(student)/lesson/${id}/speaking`)}>
              <View style={styles.exerciseIconContainer}>
                <ChalkboardTeacherIcon size={24} color={COLORS.primaryGreen} weight="fill" />
              </View>
              <View>
                <Text style={styles.exerciseTitle}>Bài nói</Text>
                <Text style={styles.exerciseSub}>{lesson?.speaking.length || 0} bài</Text>
              </View>
              <View style={styles.exerciseDecorativeShape} />
            </TouchableOpacity>
          )}

          {lesson?.listening.length > 0 && (
            <TouchableOpacity style={styles.exerciseCard} onPress={() => router.push(`/(student)/lesson/${id}/listening`)}>
              <View style={styles.exerciseIconContainer}>
                <ChalkboardTeacherIcon size={24} color={COLORS.primaryGreen} weight="fill" />
              </View>
              <View>
                <Text style={styles.exerciseTitle}>Bài nghe</Text>
                <Text style={styles.exerciseSub}>{lesson?.listening.length || 0} bài</Text>
              </View>
              <View style={styles.exerciseDecorativeShape} />
            </TouchableOpacity>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  // ... (giữ nguyên các style cũ của bạn)
  container: { flex: 1, backgroundColor: COLORS.white },
  headerBackgroundShape: {
    position: 'absolute', top: -width * 0.6, left: -width * 0.1, right: -width * 0.1,
    height: width * 0.8, backgroundColor: '#F7F9FC', borderBottomLeftRadius: width,
    borderBottomRightRadius: width, transform: [{ scaleX: 1.2 }],
  },
  safeArea: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backButton: { marginBottom: 15 },
  titleSection: { marginBottom: 15 },
  mainTitle: { fontSize: 28, fontWeight: '800', color: COLORS.textDark },
  description: { fontSize: 14, color: COLORS.textGray, marginTop: 4 },
  
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  authorGroup: { flexDirection: 'row', alignItems: 'center' },
  avatarPlaceholder: { width: 35, height: 35, borderRadius: 18, backgroundColor: '#D1D1D1' },
  authorEmail: { marginLeft: 10, fontSize: 14, fontWeight: '600', color: COLORS.textDark },
  levelBadge: { backgroundColor: '#ffa866ff', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 12 },
  levelText: { fontSize: 14, fontWeight: '700', color: '#863a00ff' },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginBottom: 15 },
  sectionTitleGroup: { flexDirection: 'row', alignItems: 'center' },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: COLORS.textDark },
  verticalDivider: { width: 2, height: 20, backgroundColor: COLORS.primaryGreen, marginHorizontal: 10 },
  itemCount: { fontSize: 14, color: COLORS.textDark, fontWeight: '600' },
  seeAllText: { fontSize: 12, color: COLORS.primaryGreen, fontWeight: '700' },

  horizontalListPadding: { paddingRight: 20 },
  
  vocabCard: {
    width: 130, height: 160, backgroundColor: COLORS.cardBg, borderRadius: 24,
    justifyContent: 'center', alignItems: 'center', marginRight: 15,
    borderWidth: 1, borderColor: '#E0E0E0',
  },
  koreanText: { fontSize: 18, fontWeight: '800', color: COLORS.textDark, marginBottom: 10 },
  vocabDivider: { width: 40, height: 3, backgroundColor: COLORS.primaryGreen, borderRadius: 2, marginBottom: 10 },
  vietText: { fontSize: 14, fontWeight: '600', color: COLORS.textDark },

  grammarCard: {
    width: 280, height: 160, backgroundColor: COLORS.cardBg, borderRadius: 24,
    justifyContent: 'center', alignItems: 'center', marginRight: 15, position: 'relative',
  },
  grammarMainText: { fontSize: 22, fontWeight: '800', color: COLORS.textDark, marginBottom:10 },
  expandIcon: { position: 'absolute', bottom: 15, right: 15 },

  studyActionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 20 },
  studyCard: {
    width: '48%', height: 60, backgroundColor: COLORS.primaryBg, borderRadius: 20,
    padding: 15, justifyContent: 'center', overflow: 'hidden', borderWidth: 2, borderColor: COLORS.primaryGreen
  },
  studyCardText: { fontSize: 16, fontWeight: '700', color: COLORS.textDark, zIndex: 2 },
  cardDecorativeIcon: {
    position: 'absolute', bottom: -10, right: -10, width: 60, height: 60, 
    borderRadius: 30, backgroundColor: COLORS.primaryGreen, opacity: 0.5
  },

  exerciseCard: {
    backgroundColor: COLORS.cardBg, borderRadius: 24, padding: 16, flexDirection: 'row',
    alignItems: 'center', marginBottom: 12, overflow: 'hidden', position: 'relative',
  },
  exerciseIconContainer: {
    width: 50, height: 50, backgroundColor: '#E0E0E0', borderRadius: 16,
    justifyContent: 'center', alignItems: 'center', marginRight: 15
  },
  exerciseTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textDark },
  exerciseSub: { fontSize: 12, color: COLORS.textGray, fontWeight: '600' },
  exerciseDecorativeShape: {
    position: 'absolute', bottom: -25, right: -25, width: 100, height: 100, 
    borderRadius: 50, backgroundColor: COLORS.decorativeShape
  },
  progressOverviewCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 15,
    margin: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  progressOverviewTitle: {
    fontSize: 16, fontWeight: '800', color: COLORS.textDark, marginBottom: 15,
  },
  progressGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  progressColumn: { flex: 1 },

  // --- STYLE CHO TOAST MỚI ---
  toastContainer: {
    position: 'absolute',
    top: 50, // Hoặc 10 nếu muốn sát hơn
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999, // Đảm bảo nổi lên trên cùng
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 10,
  },
  toastText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  }
});

export default LessonDetail;