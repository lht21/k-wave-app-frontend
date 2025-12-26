import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
 
  Platform,
  StatusBar,
  FlatList,
} from 'react-native';
import { XIcon, SpeakerHighIcon, StarIcon} from 'phosphor-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import { vocabularyService, Vocabulary } from '../../../../services/vocabularyService';
import { palette } from '../../../../theme/colors';
import { ActivityIndicator } from 'react-native-paper';
import { lessonProgressService, PopulatedVocabularyStatus } from '../../../../services/lessonProgressService';
import ProcessBar from '../../../../components/ProcessBar/ProcessBar';

const { width } = Dimensions.get('window');

const COLORS = {
  primaryGreen: '#00C853',
  textDark: '#1A1A1A',
  textGray: '#666666',
  white: '#FFFFFF',
  cardBg: '#FFFFFF',
  borderGray: '#E0E0E0',
  // Màu sắc cho các thẻ thống kê
  statBlue: '#C5D8FF',
  statOrange: '#FFCC91',
  statGreen: '#C7FFD8',
};

// --- Component 1: Thẻ thống kê (Stat Card) ---
const StatCard = ({ title, count, color, textColor }: any) => (
  <View style={[styles.statCard, { backgroundColor: color }]}>
    <Text style={styles.statTitle}>{title}</Text>
    <Text style={[styles.statCount, { color: textColor }]}>{count}</Text>
  </View>
);

// --- Component 2: Thẻ từ vựng (Vocab Card) ---
const VocabItem = ({ item, onToggleStatus, onSpeak }: any) => (
  <View style={styles.vocabCard}>
    <View style={styles.vocabInfo}>
      <Text style={styles.krText}>{item.vocabularyId.word}</Text>
      <Text style={styles.viText}>{item.vocabularyId.meaning}</Text>
    </View>
    <View style={styles.vocabActions}>
      <TouchableOpacity style={styles.iconBtn} onPress={() => onSpeak(item.vocabularyId.word)}>
        <SpeakerHighIcon size={24} color={COLORS.textDark} weight="regular" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.iconBtn}
        onPress={() => {
          // Logic toggle: Nếu đang là mastered -> chuyển về learning, ngược lại -> mastered
          const newStatus = item.status === 'mastered' ? 'learning' : 'mastered';
          onToggleStatus(item.vocabularyId._id, newStatus);
        }}
      >
        <StarIcon size={24} color={COLORS.textDark} weight="regular" />
      </TouchableOpacity>
    </View>
  </View>
);

export default function ListVocabularyScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [vocabStatusList, setVocabStatusList] = useState<PopulatedVocabularyStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('Tất cả');
  const [vocabularyProgress, setVocabularyProgress] = useState(0);


  // 1. Fetch dữ liệu thực tế từ API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const lessonId = Array.isArray(id) ? id[0] : id;
        if (!lessonId) return;

        // Gọi API lấy chi tiết tiến độ
        const response = await lessonProgressService.getLessonProgressDetail(lessonId);
        
        if (response.success && response.data.vocabularyStatus) {
           setVocabStatusList(response.data.vocabularyStatus);
            setVocabularyProgress(response.data.vocabularyProgress || 0);
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách từ vựng:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // 2. Hàm xử lý: Đánh dấu đã thuộc / chưa thuộc
  const handleToggleStatus = async (vocabId: string, newStatus: 'learning' | 'mastered') => {
    try {
      const lessonId = Array.isArray(id) ? id[0] : id;
      
      // Gọi API cập nhật Backend (Code backend bạn đã viết trước đó)
      await lessonProgressService.updateVocabularyStatus(lessonId!, vocabId, newStatus);

      // Cập nhật State Frontend ngay lập tức (Optimistic Update)
      setVocabStatusList(prevList => 
        prevList.map(item => 
          item.vocabularyId._id === vocabId 
            ? { ...item, status: newStatus } 
            : item
        )
      );
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái:", error);
    }
  };

  // 2. Tính toán thống kê dựa trên dữ liệu thực
  const stats = useMemo(() => ({
    unlearned: vocabStatusList.filter(v => v.status === 'unlearned').length,
    learning: vocabStatusList.filter(v => v.status === 'learning').length,
    mastered: vocabStatusList.filter(v => v.status === 'mastered').length,
  }), [vocabStatusList]);

  // 3. Logic lọc danh sách
  const filteredVocabs = useMemo(() => {
    if (activeFilter === 'Tất cả') return vocabStatusList;
    if (activeFilter === 'Chưa học') return vocabStatusList.filter(v => v.status === 'unlearned');
    if (activeFilter === 'Đang học') return vocabStatusList.filter(v => v.status === 'learning');
    if (activeFilter === 'Thành thạo') return vocabStatusList.filter(v => v.status === 'mastered');
    return vocabStatusList;
  }, [vocabStatusList, activeFilter]);

  // 4. Hàm phát âm (TTS)
  const speak = (text: string) => {
    Speech.speak(text, { language: 'ko-KR' });
  };
  
  const filters = [
    { label: `Tất cả (${vocabStatusList.length})`, value: 'Tất cả' },
    { label: 'Chưa học', value: 'Chưa học' },
    { label: 'Đang học', value: 'Đang học' },
    { label: 'Thành thạo', value: 'Thành thạo' },
  ];

  if (loading) return <ActivityIndicator style={{flex: 1}} size="large" color={COLORS.primaryGreen} />;

  return (
    <View style={styles.container}>
      {/* Nền Header cong mờ nhẹ phía sau */}
      <View style={styles.headerBackgroundShape} />

      <SafeAreaView style={styles.safeArea}>
        {/* Nút Đóng (X) */}
        <View style={styles.topNav}>
          <TouchableOpacity onPress={() => router.back()}>
            <XIcon size={28} color={COLORS.primaryGreen} weight="bold" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

          <ProcessBar label='Tiến trình học từ vựng của bài học này' percent={vocabularyProgress} color={palette.primary} />
          
          {/* Section: Thống kê (Stat Cards) */}
          <View style={styles.statsRow}>
            <StatCard title="Chưa học" count={stats.unlearned} color={COLORS.statBlue} textColor="#2B59C3" />
            <StatCard title="Đang học" count={stats.learning} color={COLORS.statOrange} textColor="#C37E2B" />
            <StatCard title="Thành thạo" count={stats.mastered} color={COLORS.statGreen} textColor="#2BC359" />
          </View>

          {/* Section: Bộ lọc (Filters) */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar}>
            {filters.map((f) => (
              <TouchableOpacity
                key={f.value}
                style={[
                  styles.filterBtn,
                  activeFilter === f.value ? styles.filterBtnActive : styles.filterBtnInactive
                ]}
                onPress={() => setActiveFilter(f.value)}
              >
                <Text style={[
                  styles.filterLabel,
                  activeFilter === f.value ? styles.filterLabelActive : styles.filterLabelInactive
                ]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Section: Danh sách từ vựng */}
          <View style={styles.listContainer}>
            {filteredVocabs.length === 0 ? (
                <Text style={{textAlign: 'center', color: COLORS.textGray, marginTop: 20}}>
                    Không có từ vựng nào trong mục này.
                </Text>
            ) : (
                filteredVocabs.map((item) => (
                <VocabItem 
                    key={item._id} // ID của status object
                    item={item} 
                    onToggleStatus={handleToggleStatus}
                    onSpeak={speak}
                />
                ))
            )}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
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
  safeArea: { flex: 1},
  topNav: { paddingHorizontal: 20, height: 50, justifyContent: 'center' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 10 },

  // Stats Styles
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    width: (width - 60) / 3,
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 20,
    height: 90,
    justifyContent: 'center',
  },
  statTitle: { fontSize: 11, fontWeight: '700', color: COLORS.textDark, marginBottom: 4 },
  statCount: { fontSize: 18, fontWeight: '800' },

  // Filter Styles
  filterBar: { marginBottom: 20, flexDirection: 'row' },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 10,
    borderWidth: 1,
    justifyContent: 'center',
  },
  filterBtnActive: { backgroundColor: COLORS.primaryGreen, borderColor: COLORS.primaryGreen },
  filterBtnInactive: { backgroundColor: COLORS.white, borderColor: COLORS.borderGray },
  filterLabel: { fontSize: 13, fontWeight: '700' },
  filterLabelActive: { color: COLORS.white },
  filterLabelInactive: { color: COLORS.textGray },

  // Vocab Card Styles
  listContainer: { gap: 12 },
  vocabCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderGray,
    
  },
  vocabInfo: { flex: 1 },
  krText: { fontSize: 18, fontWeight: '800', color: COLORS.primaryGreen, marginBottom: 2 },
  viText: { fontSize: 14, fontWeight: '700', color: COLORS.textDark },
  vocabActions: { flexDirection: 'row', gap: 10 },
  iconBtn: { padding: 5 },
});