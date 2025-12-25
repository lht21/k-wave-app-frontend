import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  Alert, 
  ActivityIndicator, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  FlatList, 
  Dimensions 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Lesson, lessonService } from '../../../../services/lessonService';
import { colors, palette } from '../../../../theme/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CaretLeftIcon, CornersOutIcon, BookOpenIcon, ChalkboardTeacherIcon } from 'phosphor-react-native';
import { LessonProgress, lessonProgressService } from '../../../../services/lessonProgressService';

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

const LessonDetail = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<LessonProgress | null>(null);

  useEffect(() => {
    const initProgress = async () => {
      try {
        setLoading(true);
        // Gọi API khởi tạo
        const response = await lessonProgressService.initializeLessonProgress(id as string);
        
        setProgress(response.data);

        if (response.isFirstAccess) {
           console.log("🎉 Chào mừng bạn học bài này lần đầu tiên!");
           // Hiển thị Modal hướng dẫn hoặc Animation unlock tại đây
        } else {
           console.log("👋 Chào mừng quay lại!");
           // Resume bài học từ vị trí cũ
        }

      } catch (error) {
        console.error("Lỗi khởi tạo bài học:", error);
        // Xử lý lỗi (ví dụ: quay về màn hình trước)
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

  // Component Thẻ Từ vựng (Trượt ngang)
  const VocabCard = ({ item }: { item: any }) => (
    <View style={styles.vocabCard}>
      <Text style={styles.koreanText}>{item.word || '예절'}</Text>
      <View style={styles.vocabDivider} />
      <Text style={styles.vietText}>{item.meaning || 'nghi lễ'}</Text>
    </View>
  );

  // Component Thẻ Ngữ pháp (Trượt ngang)
  const GrammarCard = ({ item }: { item: any }) => (
    <View style={styles.grammarCard}>
      <Text style={styles.grammarMainText}>{item.structure || '예절'}</Text>
      <View style={styles.vocabDivider} />
      <Text style={styles.vietText}>{item.meaning || 'nghi lễ'}</Text>
      <TouchableOpacity 
        style={styles.expandIcon} 
        onPress={() => {
          // 👉 GIẢI PHÁP: Truyền object item qua params
          router.push({
            pathname: `/(student)/lesson/${id}/grammar`,
            params: { 
              grammarData: JSON.stringify(item) 
            }
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
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Header Navigation */}
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <CaretLeftIcon size={28} color={COLORS.primaryGreen} weight="bold" />
          </TouchableOpacity>

          <View style={styles.titleSection}>
            <Text style={styles.mainTitle}>{lesson?.title || 'Title'}</Text>
            <Text style={styles.description}>{lesson?.description || 'description'}</Text>
          </View>

          {/* Author & Level Row */}
          <View style={styles.metaRow}>
            <View style={styles.authorGroup}>
              <View style={styles.avatarPlaceholder} />
              <Text style={styles.authorEmail}>{lesson?.author?.email}</Text>
            </View>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>{lesson?.level}</Text>
            </View>
          </View>

          {/* Section: Từ vựng (Trượt ngang) */}
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
            data={lesson?.vocabulary || [{}, {}, {}]} // Dùng dữ liệu thật hoặc mock
            keyExtractor={(_, index) => `vocab-${index}`}
            renderItem={({ item }) => <VocabCard item={item} />}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalListPadding}
          />

          {/* Flashcard & Học Buttons */}
          <View style={styles.studyActionsRow}>
            <TouchableOpacity style={styles.studyCard} 
              
              onPress={() => router.push(`/(student)/lesson/${id}/flashcard`)}
            >
              <Text style={styles.studyCardText}>Flashcard</Text>
              <View style={styles.cardDecorativeIcon} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.studyCard}
              onPress={() => router.push(`/(student)/lesson/${id}/learn`)}
            >
              <Text style={styles.studyCardText}>Học</Text>
              <View style={styles.cardDecorativeIcon} />
            </TouchableOpacity>
          </View>

          {/* Section: Ngữ pháp (Trượt ngang) */}
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

          {/* Section: Bài tập */}
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
  
  // Vocab Card Style
  vocabCard: {
    width: 130,
    height: 160,
    backgroundColor: COLORS.cardBg,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  koreanText: { fontSize: 18, fontWeight: '800', color: COLORS.textDark, marginBottom: 10 },
  vocabDivider: { width: 40, height: 3, backgroundColor: COLORS.primaryGreen, borderRadius: 2, marginBottom: 10 },
  vietText: { fontSize: 14, fontWeight: '600', color: COLORS.textDark },

  // Grammar Card Style
  grammarCard: {
    width: 280,
    height: 160,
    backgroundColor: COLORS.cardBg,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    position: 'relative',
  },
  grammarMainText: { fontSize: 22, fontWeight: '800', color: COLORS.textDark, marginBottom:10 },
  expandIcon: { position: 'absolute', bottom: 15, right: 15 },

  // Study Buttons Row
  studyActionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 20 },
  studyCard: {
    width: '48%',
    height: 60,
    backgroundColor: COLORS.primaryBg,
    borderRadius: 20,
    padding: 15,
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.primaryGreen
  },
  studyCardText: { fontSize: 16, fontWeight: '700', color: COLORS.textDark, zIndex: 2 },
  cardDecorativeIcon: {
    position: 'absolute', bottom: -10, right: -10, width: 60, height: 60, 
    borderRadius: 30, backgroundColor: COLORS.primaryGreen, opacity: 0.5
  },

  // Exercise Card Style
  exerciseCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    overflow: 'hidden',
    position: 'relative',
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
  }
});

export default LessonDetail;