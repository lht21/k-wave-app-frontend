import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  StatusBar,
  ScrollView,
  Alert,
} from 'react-native';
import { CaretDownIcon, LightningIcon } from 'phosphor-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Lesson, lessonService } from '../../../services/lessonService';
import Modal from "react-native-modal";
import { useRouter } from 'expo-router';


const { width } = Dimensions.get('window');

const COLORS = {
  primaryGreen: '#3bbc84ff', 
  textDark: '#1A1A1A',     
  textGray: '#666666',
  cardBg: '#F0F2F5',      
  white: '#FFFFFF',
  decorativeShape: '#E5E7EB',
};

const levels = [
  {id: '1', levelName: 'Sơ cấp 1'},
  {id: '2', levelName: 'Sơ cấp 2'},
  {id: '3', levelName: 'Trung cấp 3'},
  {id: '4', levelName: 'Trung cấp 4'},
  {id: '5', levelName: 'Cao cấp 5'},
  {id: '6', levelName: 'Cao cấp 6'},


]



export default function StdLearn() {
  const [currentLevel, setCurrentLevel] = useState('Sơ cấp 1');
  const [isLoading, setIsLoading] = useState(false)
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false)
  const router = useRouter()

  const toggleSheet = () => {
      setIsModalVisible(!isModalVisible);
  };

  const handleSelectLevel = (selectedLevel: string) => {
    setCurrentLevel(selectedLevel)
    toggleSheet()
  }

  const loadLessons = async () => {
      try {
          setIsLoading(true);
          const response = await lessonService.getLessonsForStudent({ level: currentLevel });
          setLessons(response.lessons);
      } catch (error: any) {
          console.error('Error loading lessons:', error);
          Alert.alert('Lỗi', error.message || 'Không thể tải danh sách bài học');
      } finally {
          setIsLoading(false);
      }
  };

  useEffect(() => {
      loadLessons();
  }, [currentLevel]);

  // Component cho thẻ bài học
  const LessonCard = ({ item }: { item: typeof lessons[0] }) => (
    <TouchableOpacity style={styles.lessonCard} activeOpacity={0.8} 
        onPress={() => {
          router.push({
            pathname: "/(student)/lesson/[id]",
            params: { id: item._id }
          });
        }}
    >
      <View style={styles.lessonIconContainer}>
        <LightningIcon size={24} color={COLORS.primaryGreen} weight="fill" />
      </View>
      
      <View style={styles.lessonInfo}>
        <Text style={styles.lessonIndex}>{item.title} - {item.code}</Text>
        <Text style={styles.lessonTitle}>{item.title}</Text>
      </View>

      {/* {item.status === 'learning' && (
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>Đang học</Text>
        </View>
      )} */}

      {/* Mảng trang trí góc đặc trưng */}
      <View style={styles.decorativeShape} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Wavy Header Background */}
      <View style={styles.headerBackgroundShape} />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <Text style={styles.mainHeaderTitle}>Học tập</Text>

          {/* Section: Cấp độ */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cấp độ hiện tại</Text>
            <TouchableOpacity 
              style={styles.pickerContainer} 
              onPress={toggleSheet}
            >
              <Text style={styles.levelText}>{currentLevel}</Text>
              <CaretDownIcon size={24} color={COLORS.primaryGreen} weight="bold" />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* Section: Bài học tương ứng */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bài học tương ứng</Text>
            {lessons.map((lesson) => (
              <LessonCard key={lesson._id} item={lesson} />
            ))}
          </View>
          
          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
      <Modal 
        isVisible={isModalVisible}
        onBackdropPress={toggleSheet}
        style={{ justifyContent: 'flex-end', margin: 0 }}
      >
        <View style={styles.sheetContent}>
          <Text style={[styles.sheetTitle, {marginBottom: 15}]}>Tất cả cấp độ</Text>
    
          {levels.map(item => (
            <TouchableOpacity key={item.id} style={[styles.pickerContainer, {marginBottom: 10}]} onPress={() => handleSelectLevel(item.levelName)}>
              <Text style={styles.levelText}>{item.levelName}</Text>
              {currentLevel === item.levelName && (
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>Cấp độ đang chọn</Text>
                </View>

              )}      
            </TouchableOpacity>
          ))}
         
          
        </View>
        
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  headerBackgroundShape: {
    position: 'absolute',
    top: -width * 0.6,
    left: -width * 0.1,
    right: -width * 0.1,
    height: width * 0.8,
    backgroundColor: '#F7F9FC',
    borderBottomLeftRadius: width,
    borderBottomRightRadius: width,
    transform: [{ scaleX: 1.2 }],
  },
  safeArea: { flex: 1 },
  scrollContent: { padding: 20 },
  mainHeaderTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.primaryGreen,
    marginBottom: 30,
  },
  section: { marginTop: 10 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 15,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  levelText: { fontSize: 16, fontWeight: '600', color: COLORS.textDark },
  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 25,
    width: '100%',
  },

  // Lesson Card Styles
  lessonCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    overflow: 'hidden',
    position: 'relative',
    minHeight: 90,
  },
  lessonIconContainer: {
    width: 50,
    height: 50,
    backgroundColor: '#E0E0E0',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  lessonInfo: { flex: 1 },
  lessonIndex: { fontSize: 14, fontWeight: '700', color: COLORS.textDark },
  lessonTitle: { fontSize: 13, color: COLORS.textGray, marginTop: 2 },
  
  statusBadge: {
    backgroundColor: COLORS.primaryGreen,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 2,
  },
  statusText: { color: COLORS.white, fontSize: 12, fontWeight: '700' },

  decorativeShape: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E2E8F0',
    zIndex: -1,
  },


  ///modal style
  sheetContent: {
      backgroundColor: 'white',
      padding: 22,
      borderTopLeftRadius: 30, // Bo 2 góc trên
      borderTopRightRadius: 30,
      // Thêm 1 chút padding an toàn ở dưới cho các máy có thanh "home"
      paddingBottom: 30, 
  },
  sheetTitle: {
      fontSize: 20,
      color: '#333',
      fontWeight: 'bold',
  },
});