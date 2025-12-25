import React, { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing } from '../../../theme/spacing';
import { colors, palette } from '../../../theme/colors';
import { cultureService } from '../../../services/cultureService';

const { width } = Dimensions.get('window');

// 1. Định nghĩa danh sách categories cố định bên ngoài component để dùng chung
const CATEGORIES_DATA: CultureCategory[] = [
  { id: 'Tất cả', title: 'Tất cả', description: '', },
  { id: 'Âm nhạc', title: 'Âm nhạc', description: '', icon: '🎵' },
  { id: 'Ẩm thực', title: 'Ẩm thực', description: '', icon: '🍳' },
  { id: 'Du lịch', title: 'Du lịch', description: '', icon: '🛩️' },
  { id: 'Điện ảnh', title: 'Điện ảnh', description: '', icon: '📽️' },
  { id: 'Làm đẹp', title: 'Làm đẹp', description: '', icon: '💅🏻' },
  { id: 'Lễ hội', title: 'Lễ hội', description: '', icon: '🎎' },
  { id: 'Lịch sử', title: 'Lịch sử', description: '', icon: '🏯' },
  { id: 'Trang phục', title: 'Trang phục', description: '', icon: '👜' },
  { id: 'Trường học', title: 'Trường học', description: '', icon: '🎓' },
  { id: 'Uống rượu', title: 'Uống rượu', description: '', icon: '🥂' },
  { id: 'Ứng xử', title: 'Ứng xử', description: '', icon: '🤝🏻' }
];

interface CultureCategory {
  id: string;
  title: string;
  description: string;
  icon?: string;
}

interface CultureItem {
  _id: string;
  title: string;
  subtitle?: string;
  description: string;
  category: string;
  views?: number;
  author?: any;
  image?: string;
  isPremium?: boolean;
  likes?: number;
}

const StdCulture: React.FC = () => {
  const router = useRouter();
  const { category: categoryParamFromHome } = useLocalSearchParams(); 

  // 2. Khởi tạo state dựa trên param truyền vào
  const [selectedCategory, setSelectedCategory] = useState<CultureCategory>(() => {
    if (categoryParamFromHome) {
      const found = CATEGORIES_DATA.find(c => c.title === categoryParamFromHome);
      if (found) return found;
    }
    return CATEGORIES_DATA[0];
  });

  const [cultureItems, setCultureItems] = useState<CultureItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [itemsLoading, setItemsLoading] = useState(false);

  // Load items mỗi khi selectedCategory thay đổi
  useEffect(() => {
    loadCultureItems();
  }, [selectedCategory]);

  const loadCultureItems = async () => {
    try {
      setItemsLoading(true);
      
      // Chốt giá trị gửi lên API
      const apiCategory = selectedCategory.id === 'Tất cả' ? undefined : selectedCategory.title;
      
      console.log('🔄 Đang gọi API với category:', apiCategory);
      const response = await cultureService.getAll(apiCategory);
      
      const items: CultureItem[] = response.map((item: any) => ({
        _id: item._id,
        title: item.title,
        subtitle: item.subtitle || '',
        description: item.content?.[0]?.content || item.description || 'Không có mô tả',
        category: item.category || 'Không xác định',
        views: item.views || 0,
        author: item.author || { fullName: 'Admin' },
        image: item.image,
        isPremium: item.isPremium || false,
        likes: item.likes || 0
      }));
      
      setCultureItems(items);
    } catch (error) {
      console.error('❌ Error loading culture items:', error);
      Alert.alert('Lỗi', 'Không thể tải nội dung văn hóa.');
      setCultureItems([]);
    } finally {
      setItemsLoading(false);
      setLoading(false);
    }
  };

  const handleCategorySelect = (category: CultureCategory) => {
    setSelectedCategory(category);
  };

  const handleItemPress = (item: CultureItem) => {
    router.push({
      pathname: '/(student)/culture/[id]',
      params: { id: item._id, itemTitle: item.title }
    });
  };

  const CategoryTab = ({ category }: { category: CultureCategory }) => (
    <TouchableOpacity
      style={[
        styles.categoryTab,
        selectedCategory.id === category.id && styles.selectedCategoryTab
      ]}
      onPress={() => handleCategorySelect(category)}
    >
      <Text style={[
        styles.categoryTabText,
        selectedCategory.id === category.id && styles.selectedCategoryTabText
      ]}>
        {category.icon} {category.title}
      </Text>
    </TouchableOpacity>
  );

  const CultureItemCard = ({ item }: { item: CultureItem }) => (
    <TouchableOpacity
      style={[styles.itemCard, item.isPremium && styles.premiumItemCard]}
      onPress={() => handleItemPress(item)}
    >
      <View style={styles.itemContent}>
        <View style={styles.itemHeader}>
          <View style={styles.itemIconContainer}>
            <Text style={styles.itemIcon}>{item.isPremium ? '⭐' : '🌸'}</Text>
          </View>
          <View style={styles.itemTitleContainer}>
            <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
            {item.isPremium && (
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumBadgeText}>PREMIUM</Text>
              </View>
            )}
          </View>
        </View>
        
        <Text style={styles.itemDescription} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.itemFooter}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{item.category}</Text>
          </View>
          <View style={styles.statsRow}>
            <Text style={styles.statText}>👁️ {item.views}</Text>
            <Text style={styles.statText}>❤️ {item.likes}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.arrowIcon}>→</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header Profile Style */}
      <View style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Văn hóa Hàn Quốc</Text>
            <View style={{ width: 40 }} /> 
          </View>
        </SafeAreaView>
      </View>

      {/* Categories Tabs */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {CATEGORIES_DATA.map((cat) => (
            <CategoryTab key={cat.id} category={cat} />
          ))}
        </ScrollView>
      </View>

      {/* Main List */}
      <View style={styles.listSection}>
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{selectedCategory.title}</Text>
            <Text style={styles.itemCount}>{cultureItems.length} bài viết</Text>
        </View>

        {itemsLoading ? (
          <ActivityIndicator size="large" color="#00D95F" style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={cultureItems}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => <CultureItemCard item={item} />}
            contentContainerStyle={styles.flatListContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Chưa có bài viết nào ở mục này 📚</Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    backgroundColor: '#00D95F',
    borderBottomRightRadius: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  backButtonText: { fontSize: 24, color: '#fff', fontWeight: 'bold' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  
  tabContainer: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  categoryScroll: { paddingHorizontal: 20, gap: 10 },
  categoryTab: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F5F7FA', borderWidth: 1, borderColor: '#E5E7EB' },
  selectedCategoryTab: { backgroundColor: '#00D95F', borderColor: '#00D95F' },
  categoryTabText: { fontSize: 14, fontWeight: '600', color: '#666' },
  selectedCategoryTabText: { color: '#fff' },

  listSection: { flex: 1, backgroundColor: '#F8F9FA', paddingHorizontal: 20, paddingTop: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 15 },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', color: '#1A1A1A' },
  itemCount: { fontSize: 13, color: '#888', fontWeight: '500' },

  flatListContent: { paddingBottom: 40 },
  itemCard: { 
    backgroundColor: '#fff', 
    borderRadius: 20, 
    padding: 16, 
    marginBottom: 15, 
    flexDirection: 'row', 
    alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2
  },
  premiumItemCard: { borderLeftWidth: 4, borderLeftColor: '#FFD700' },
  itemContent: { flex: 1 },
  itemHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  itemIconContainer: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#F0F9F4', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  itemIcon: { fontSize: 16 },
  itemTitleContainer: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  itemTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', flexShrink: 1 },
  premiumBadge: { backgroundColor: '#FFD700', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: 8 },
  premiumBadgeText: { fontSize: 8, fontWeight: '900', color: '#fff' },
  itemDescription: { fontSize: 13, color: '#666', lineHeight: 18, marginBottom: 12 },
  itemFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  categoryBadge: { backgroundColor: '#F0F2F5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  categoryBadgeText: { fontSize: 11, color: '#777', fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: 12 },
  statText: { fontSize: 12, color: '#999' },
  arrowIcon: { fontSize: 20, color: '#CCC', marginLeft: 10 },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#999', fontSize: 16 }
});

export default StdCulture;