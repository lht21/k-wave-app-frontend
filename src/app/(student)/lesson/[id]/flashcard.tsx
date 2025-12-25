import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  FlatList,
  
  Platform,
  StatusBar,
  Pressable,
} from 'react-native';
import { XIcon } from 'phosphor-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

// --- Reanimated & Gesture Handler Imports ---
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  runOnJS,
  Extrapolate,
} from 'react-native-reanimated';
import { GestureDetector, Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import {vocabularyService} from '../../../../services/vocabularyService';
import { ActivityIndicator } from 'react-native-paper';
import { lessonProgressService } from '../../../../services/lessonProgressService';

const { width, height } = Dimensions.get('window');

const COLORS = {
  primaryGreen: '#00C853',
  orange: '#FF9100',
  pinkBadge: '#FFB2B2',
  mintBadge: '#A7FFEB',
  textDark: '#1A1A1A',
  textGray: '#666666',
  cardBg: '#F0F2F5',
  white: '#FFFFFF',
  borderGray: '#EEEEEE',
};


// Cấu hình Animation
const SPRING_CONFIG = { damping: 15, stiffness: 150, mass: 0.8 };
const SWIPE_THRESHOLD = width * 0.3; // Ngưỡng để kích hoạt hành động vuốt


const ExampleItem = React.memo(({ item }: { item: string }) => (
  <View style={styles.exampleCard}>
    <Text style={styles.exampleKr}>{item}</Text>
  </View>
));

export default function FlashcardScreen() {

  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [flashCards, setFlashCards] = useState([]);
  const [loading, setLoading] = useState(true);

  // Shared values
  const flipRotation = useSharedValue(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const cardOpacity = useSharedValue(1);

  // 2. Tính toán các giá trị phái sinh sau khi đã có dữ liệu
  const totalCards = flashCards.length;
  const currentCard = flashCards[currentIndex];
  const knownCount = currentIndex;
  const reviewCount = Math.max(0, totalCards - currentIndex);


  React.useEffect(() => {
    const fetchFlashCards = async () => {
      try {
        const lessonId = Array.isArray(id) ? id[0] : id;
        if (!lessonId || lessonId.includes("{id}")) return;

        const response = await vocabularyService.getVocabularyByLesson(lessonId);
        const data = response.data || response.vocabulary;
        if (data) setFlashCards(data);
      } catch (error) {
        console.error("Error fetching flashcards:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFlashCards();
  }, [id]);

  const resetPosition = useCallback(() => {
    'worklet';
    translateX.value = withSpring(0, SPRING_CONFIG);
    translateY.value = withSpring(0, SPRING_CONFIG);
    flipRotation.value = withSpring(0, SPRING_CONFIG);
    cardOpacity.value = withTiming(1, { duration: 200 });
  }, []);

  const nextCard = useCallback(() => {
    if (currentIndex < totalCards - 1) {
      setCurrentIndex((prev) => prev + 1);
      setTimeout(() => {
        resetPosition();
        setIsAnimating(false);
      }, 100);
    } else {
      // Logic kết thúc chuyên nghiệp hơn
      setIsAnimating(false);
      resetPosition();
      router.back(); 
      alert("Chúc mừng! Bạn đã hoàn thành bộ thẻ.");
    }
  }, [currentIndex, totalCards, resetPosition, router]);

  
  // Hàm xử lý lưu tiến độ lên server
  const trackProgress = async (vocabId: string, status: 'mastered' | 'learning') => {
    try {
      const lessonId = Array.isArray(id) ? id[0] : id;

      if (!lessonId || lessonId === 'undefined' || lessonId.includes("{id}")) {
        console.warn("Lesson ID không hợp lệ, hủy gọi API:", lessonId);
        return;
      }
      
      await lessonProgressService.updateVocabularyStatus(lessonId, vocabId, status);
      console.log(`Đã cập nhật ${vocabId} thành ${status}`);
    } catch (error) {
      console.error("Lỗi lưu tiến độ:", error);
    }
  };

  // Xử lý hành động "Đã biết" (Vuốt trái hoặc bấm nút Xanh)
  const handleKnown = useCallback(() => {
    if (isAnimating || !currentCard) return;
    setIsAnimating(true);

    // Gọi API lưu tiến độ
    trackProgress(currentCard._id, 'mastered');

    // Animate bay sang trái
    translateX.value = withTiming(-width * 1.5, { duration: 300 }, () => {
      cardOpacity.value = 0;
      runOnJS(nextCard)();
    });
  }, [isAnimating, nextCard, currentCard, id]);

  // Xử lý hành động "Ôn từ này" (Vuốt phải hoặc bấm nút Cam)
  const handleReview = useCallback(() => {
    if (isAnimating || !currentCard) return;
    setIsAnimating(true);
    
    // Gọi API lưu tiến độ
    trackProgress(currentCard._id, 'learning');

    translateX.value = withTiming(width * 1.5, { duration: 300 }, () => {
      cardOpacity.value = 0;
      runOnJS(nextCard)();
    });
  }, [isAnimating, nextCard, currentCard, id]);

  // Xử lý lật thẻ
  const handleFlip = () => {
    // Nếu đang ở mặt trước (0) thì quay sang sau (180), và ngược lại
    flipRotation.value = withSpring(flipRotation.value === 0 ? 180 : 0, SPRING_CONFIG);
  };

  // --- Gesture & Animated Styles ---

  // Định nghĩa cử chỉ vuốt (Pan Gesture)
  const panGesture = Gesture.Pan()
    .enabled(!isAnimating)
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      // Kiểm tra ngưỡng vuốt để quyết định hành động
      if (event.translationX > SWIPE_THRESHOLD) {
        runOnJS(handleReview)(); // Vuốt phải -> Ôn tập
      } else if (event.translationX < -SWIPE_THRESHOLD) {
        runOnJS(handleKnown)(); // Vuốt trái -> Đã biết
      } else {
        resetPosition(); // Không đủ ngưỡng -> Quay về vị trí cũ
      }
    });

  // Style cho container chứa cả thẻ (di chuyển khi vuốt)
  const swipeContainerStyle = useAnimatedStyle(() => {
    // Thêm một chút xoay nhẹ khi vuốt để tạo cảm giác tự nhiên
    const rotateZ = interpolate(translateX.value, [-width, width], [-15, 15], Extrapolate.CLAMP);
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotateZ: `${rotateZ}deg` },
      ],
      opacity: cardOpacity.value,
    };
  });

  // Style cho mặt trước thẻ (Front)
  const frontAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${flipRotation.value}deg` }],
    // Ẩn mặt sau khi quay
    backfaceVisibility: 'hidden',
    zIndex: flipRotation.value < 90 ? 1 : 0,
  }));

  // Style cho mặt sau thẻ (Back)
  const backAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotateY: `${flipRotation.value + 180}deg` }],
    backfaceVisibility: 'hidden',
    zIndex: flipRotation.value > 90 ? 1 : 0,
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, // Đè lên mặt trước
  }));



  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.primaryGreen} />
      </View>
    );
  }


  if (totalCards === 0) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text>Không có từ vựng nào trong bài học này.</Text>
        <TouchableOpacity onPress={() => router.back()}>
           <Text style={{color: COLORS.primaryGreen, marginTop: 10}}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }


  if (!currentCard) return null;


  // Wrap toàn bộ bằng GestureHandlerRootView để cử chỉ hoạt động
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        {/* Giữ nguyên Header Background */}
        <View style={styles.headerBackgroundShape} />

        <SafeAreaView style={styles.safeArea}>
          {/* Top Navigation (Cập nhật progress) */}
          <View style={styles.topNav}>
            <TouchableOpacity onPress={() => router.back()}>
              <XIcon size={28} color={COLORS.primaryGreen} weight="bold" />
            </TouchableOpacity>
            <Text style={styles.progressText}>{currentIndex + 1}/{totalCards}</Text>
            <View style={{ width: 28 }} />
          </View>

          {/* --- KUU VỰC THẺ FLASHCARD CÓ ANIMATION --- */}
          <View style={styles.cardPerspectiveWrapper}>
            <GestureDetector gesture={panGesture}>
              {/* Container chịu trách nhiệm di chuyển khi Vuốt */}
              <Animated.View style={[styles.swipeContainer, swipeContainerStyle]}>
                <Pressable onPress={handleFlip} style={{ flex: 1 }}>
                  
                  {/* Mặt trước: Hiển thị từ vựng */}
                  <Animated.View style={[styles.flashCardFace, frontAnimatedStyle]}>
                    <Text style={styles.mainWord}>{currentCard.word}</Text>
                  </Animated.View>

                  {/* Mặt sau: Hiển thị nghĩa */}
                  <Animated.View style={[styles.flashCardFace, styles.cardBackFace, backAnimatedStyle]}>
                     <Text style={styles.meaningLabel}>Nghĩa:</Text>
                    <Text style={styles.meaningText}>{currentCard.meaning}</Text>
                  </Animated.View>

                </Pressable>
              </Animated.View>
            </GestureDetector>
          </View>
          {/* ------------------------------------------ */}

          {/* Badges / Tags (Cập nhật theo dữ liệu động) */}
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: COLORS.pinkBadge }]}>
              <Text style={styles.badgeText}>{currentCard.type}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: COLORS.mintBadge }]}>
              <Text style={styles.badgeText}>{currentCard.level}</Text>
            </View>
          </View>

          {/* Horizontal Examples List (Cập nhật theo dữ liệu động) */}
          <View style={styles.exampleSection}>
            <FlatList
              data={currentCard.examples}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item, index) => index.toString()} 
              renderItem={({ item }) => <ExampleItem item={item} />}
              contentContainerStyle={styles.horizontalListPadding}
            />
          </View>

          <View style={styles.divider} />

          {/* Footer Actions (Kết nối với hàm xử lý) */}
          <View style={styles.footer}>
            <View style={styles.actionColumn}>
              {/* Cập nhật số lượng động */}
              <Text style={[styles.counterText, { color: COLORS.primaryGreen }]}>{knownCount}</Text>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: COLORS.primaryGreen }]}
                onPress={handleKnown}
                disabled={isAnimating}
              >
                <Text style={styles.actionButtonText}>Đã biết</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.actionColumn}>
              <Text style={[styles.counterText, { color: COLORS.orange }]}>{reviewCount}</Text>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: COLORS.orange }]}
                onPress={handleReview}
                disabled={isAnimating}
              >
                <Text style={styles.actionButtonText}>Ôn từ này</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  // --- Giữ nguyên các styles cũ ---
  container: { flex: 1, backgroundColor: COLORS.white },
  headerBackgroundShape: {
    position: 'absolute', top: -width * 0.6, left: -width * 0.1, right: -width * 0.1, height: width * 0.8,
    backgroundColor: '#F7F9FC', borderBottomLeftRadius: width, borderBottomRightRadius: width, transform: [{ scaleX: 1.2 }],
  },
  safeArea: { flex: 1,},
  topNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, height: 50 },
  progressText: { fontSize: 16, fontWeight: '700', color: COLORS.textDark },
  
  // --- Styles mới cho Animation Card ---
  cardPerspectiveWrapper: {
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 30,
    // Quan trọng cho hiệu ứng 3D
    perspective: 1000, 
  },
  swipeContainer: {
    width: '100%',
    height: width * 1.1,
  },
  flashCardFace: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    // Style gốc của bạn
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.borderGray,
    // Cần thiết để mặt sau không bị lộ
    backfaceVisibility: 'hidden', 
  },
  cardBackFace: {
    // Mặt sau có thể style khác một chút nếu muốn
    backgroundColor: '#FAFAFA', 
  },

  mainWord: { fontSize: 48, fontWeight: '800', color: COLORS.textDark },
  // Style mới cho text mặt sau
  meaningLabel: { fontSize: 16, color: COLORS.textGray, marginBottom: 10 },
  meaningText: { fontSize: 32, fontWeight: '700', color: COLORS.primaryGreen },

  // --- Giữ nguyên các styles footer, badges, examples ---
  badgeRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 30, gap: 15 },
  badge: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 12 },
  badgeText: { fontSize: 14, fontWeight: '700', color: COLORS.textDark },
  exampleSection: { marginTop: 25 },
  horizontalListPadding: { paddingHorizontal: 20 },
  exampleCard: { backgroundColor: COLORS.cardBg, borderRadius: 15, paddingHorizontal: 20, paddingVertical: 12, marginRight: 10, flexDirection: 'row', alignItems: 'center', minWidth: width * 0.7 },
  exampleKr: { fontSize: 14, fontWeight: '700', color: COLORS.textDark, flex: 1 },
  exampleVi: { fontSize: 14, fontWeight: '600', color: COLORS.primaryGreen, marginLeft: 10 },
  divider: { height: 1, backgroundColor: COLORS.borderGray, marginHorizontal: 20, marginTop: 30 },
  actionColumn: { alignItems: 'center', width: '45%' },
  counterText: { fontSize: 32, fontWeight: '900', marginBottom: 10 },
  actionButton: { width: '100%', paddingVertical: 18, borderRadius: 30, alignItems: 'center' },
  actionButtonText: { color: COLORS.white, fontSize: 18, fontWeight: '800' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginTop: 'auto', // Đẩy footer xuống đáy nếu còn khoảng trống
    marginBottom: 40,   // Giữ khoảng cách với đáy màn hình
    width: '100%',
    // Xóa bỏ position: 'absolute' và bottom: 40
  },
});