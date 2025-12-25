import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing } from '../../../theme/spacing';
import { colors, palette } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { cultureService } from '../../../services/cultureService';

// Định nghĩa interface phù hợp với cultureService
interface CultureCategory {
  _id?: string;
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
  category: string; // cultureService dùng string thay vì object
  tags?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  views?: number; // cultureService dùng views thay vì viewCount
  author?: any;
  image?: string;
  isPremium?: boolean;
  likes?: number;
}

const StdCulture: React.FC = () => {
  const router = useRouter();
  const [categories, setCategories] = useState<CultureCategory[]>([
    { id: 'Tất cả', title: 'Tất cả',description: ''},
    { id: 'Âm nhạc', title: 'Âm nhạc',description: '', icon: '🎵' },
    { id: 'Ẩm thực', title: 'Ẩm thực',description: '', icon: '🍳' },
    { id: 'Du lịch', title: 'Du lịch',description: '', icon: '🛩️' },
    { id: 'Điện ảnh', title: 'Điện ảnh',description: '', icon: '📽️' },
    { id: 'Làm đẹp', title: 'Làm đẹp',description: '', icon: '💅🏻' },
    { id: 'Lễ hội', title: 'Lễ hội',description: '', icon: '🎎' },
    { id: 'Lịch sử', title: 'Lịch sử',description: '', icon: '🏯' },
    { id: 'Trang phục', title: 'Trang phục',description: '', icon: '👜' },
    { id: 'Trường học', title: 'Trường học',description: '', icon: '🎓' },
    { id: 'Uống rượu', title: 'Uống rượu',description: '', icon: '🥂' },
    { id: 'Ứng xử', title: 'Ứng xử',description: '', icon: '🤝🏻' }

  ]);
  

  const [selectedCategory, setSelectedCategory] = useState<CultureCategory>(categories[0]);
  const [cultureItems, setCultureItems] = useState<CultureItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [itemsLoading, setItemsLoading] = useState(false);

  // Load culture items khi component mount và khi category thay đổi
  useEffect(() => {
    loadCultureItems();
  }, [selectedCategory]);

  const loadCultureItems = async () => {
    try {
      setItemsLoading(true);
      
      // Gọi cultureService.getAll() với category (nếu không phải 'all')
      const categoryParam = selectedCategory.id === 'all' ? undefined : selectedCategory.title;
      
      console.log('🔄 Loading culture items for category:', categoryParam);
      
      const response = await cultureService.getAll(categoryParam);
      
      console.log('📊 Culture items response:', response);
      
      // Chuyển đổi dữ liệu từ cultureService sang format phù hợp
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
      Alert.alert('Lỗi', 'Không thể tải nội dung văn hóa. Vui lòng thử lại.');
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
      params: { 
        id: item._id,
        itemTitle: item.title 
      }
    });
  };

  const handleRefresh = () => {
    loadCultureItems();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#269a56ff" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const CategoryTab = ({ category }: { category: CultureCategory }) => (
    <TouchableOpacity
      style={[
        styles.categoryTab,
        selectedCategory?.id === category.id && styles.selectedCategoryTab
      ]}
      onPress={() => handleCategorySelect(category)}
    >
      <Text style={[
        styles.categoryTabText,
        selectedCategory?.id === category.id && styles.selectedCategoryTabText
      ]}>
        {category.icon} {category.title}
      </Text>
    </TouchableOpacity>
  );

  const CultureItemCard = ({ item }: { item: CultureItem }) => (
    <TouchableOpacity
      style={[
        styles.itemCard,
        item.isPremium && styles.premiumItemCard
      ]}
      onPress={() => handleItemPress(item)}
    >
      <View style={styles.itemContent}>
        <View style={styles.itemHeader}>
          <View style={styles.itemIconContainer}>
            {item.isPremium ? (
              <Text style={styles.premiumIcon}>⭐</Text>
            ) : (
              <Text style={styles.itemIcon}>🌸</Text>
            )}
          </View>
          <View style={styles.itemTitleContainer}>
            <Text style={styles.itemTitle}>{item.title}</Text>
            {item.isPremium && (
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumBadgeText}>Premium</Text>
              </View>
            )}
          </View>
        </View>
        
        {item.subtitle && (
          <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
        )}
        
        <Text style={styles.itemDescription} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.itemMeta}>
          <Text style={styles.itemCategory}>Chủ đề: {item.category}</Text>
          <Text style={styles.itemViews}>{item.views || 0} lượt xem</Text>
        </View>
        
        <View style={styles.itemStats}>
          <Text style={styles.itemAuthor}>
            {item.author?.fullName || 'Admin'}
          </Text>
          <View style={styles.likesContainer}>
            <Text style={styles.likesIcon}>❤️</Text>
            <Text style={styles.likesCount}>{item.likes || 0}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.itemArrow}>
        <Text style={styles.arrowText}>→</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>📚</Text>
      <Text style={styles.emptyStateTitle}>Chưa có nội dung</Text>
      <Text style={styles.emptyStateDescription}>
        {selectedCategory.id === 'all' 
          ? 'Hiện chưa có nội dung văn hóa nào.' 
          : `Chưa có nội dung cho chủ đề "${selectedCategory.title}".`}
      </Text>
      <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
        <Text style={styles.refreshButtonText}>⟳ Thử lại</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header Profile Style */}
      <View style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Văn hóa Hàn Quốc</Text>
            <TouchableOpacity 
              style={styles.refreshHeaderButton}
              onPress={handleRefresh}
            >
              <Text style={styles.refreshHeaderButtonText}>⟳</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      {/* Category Tabs */}
      <View style={styles.categorySection}>
        <Text style={styles.categorySectionTitle}>Chủ đề</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScrollContainer}
        >
          {categories.map((category) => (
            <CategoryTab key={category.id} category={category} />
          ))}
        </ScrollView>
      </View>

      {/* Stats Overview */}
      <View style={styles.statsOverview}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{cultureItems.length}</Text>
          <Text style={styles.statLabel}>Bài viết</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {cultureItems.reduce((sum, item) => sum + (item.views || 0), 0)}
          </Text>
          <Text style={styles.statLabel}>Lượt xem</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {cultureItems.reduce((sum, item) => sum + (item.likes || 0), 0)}
          </Text>
          <Text style={styles.statLabel}>Lượt thích</Text>
        </View>
      </View>

      {/* Culture Items */}
      <View style={styles.itemsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {selectedCategory.id === 'all' 
              ? 'Tất cả bài viết' 
              : selectedCategory.title}
          </Text>
          <Text style={styles.sectionSubtitle}>
            {cultureItems.length} bài viết
          </Text>
        </View>
        
        {itemsLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#269a56ff" />
            <Text style={styles.loadingText}>Đang tải nội dung...</Text>
          </View>
        ) : (
          <FlatList
            data={cultureItems}
            renderItem={({ item }) => <CultureItemCard item={item} />}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.itemsList}
            ListEmptyComponent={renderEmptyState}
            refreshControl={undefined} // Bỏ qua warning refreshControl
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA'
  },

  // Header Profile Style
  header: {
    backgroundColor: '#00D95F',
    borderBottomRightRadius: 40,
    paddingBottom: 25,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  backButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold'
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  refreshHeaderButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  refreshHeaderButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '600'
  },

  // Category Section
  categorySection: {
    backgroundColor: palette.white,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  categorySectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.light.text,
    marginBottom: spacing.sm,
    marginHorizontal: spacing.md
  },
  categoryScrollContainer: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm
  },
  categoryTab: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    minWidth: 80,
    alignItems: 'center'
  },
  selectedCategoryTab: {
    backgroundColor: '#269a56ff'
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280'
  },
  selectedCategoryTabText: {
    color: palette.white
  },

  // Stats Overview
  statsOverview: {
    backgroundColor: palette.white,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  statItem: {
    alignItems: 'center'
  },
  statValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#269a56ff',
    marginBottom: spacing.xs
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280'
  },
  statDivider: {
    width: 1,
    height: '60%',
    backgroundColor: '#E5E7EB',
    alignSelf: 'center'
  },

  // Items Section
  itemsSection: {
    flex: 1,
    paddingTop: spacing.md
  },
  sectionHeader: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.light.text
  },
  sectionSubtitle: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: spacing.xs
  },
  itemsList: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl
  },
  
  // Item Card
  itemCard: {
    backgroundColor: palette.white,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3
  },
  premiumItemCard: {
    borderWidth: 1,
    borderColor: '#FFD700',
    backgroundColor: '#FFFDF0'
  },
  itemContent: {
    flex: 1
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs
  },
  itemIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm
  },
  itemIcon: {
    fontSize: 16
  },
  premiumIcon: {
    fontSize: 16,
    color: '#FFD700'
  },
  itemTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.light.text,
    flex: 1
  },
  premiumBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: spacing.xs
  },
  premiumBadgeText: {
    fontSize: 10,
    color: '#333',
    fontWeight: '700'
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#269a56ff',
    fontWeight: '600',
    marginBottom: spacing.xs
  },
  itemDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: spacing.sm
  },
  itemMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs
  },
  itemCategory: {
    fontSize: 12,
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 8
  },
  itemViews: {
    fontSize: 12,
    color: '#6B7280'
  },
  itemStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  itemAuthor: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic'
  },
  likesContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  likesIcon: {
    fontSize: 12,
    marginRight: spacing.xs
  },
  likesCount: {
    fontSize: 12,
    color: '#6B7280'
  },
  itemArrow: {
    marginLeft: spacing.sm
  },
  arrowText: {
    fontSize: 18,
    color: '#D1D5DB',
    fontWeight: '600'
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxxl
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: spacing.sm
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.lg
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: spacing.md
  },
  emptyStateTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: '700',
    color: colors.light.text,
    marginBottom: spacing.sm,
    textAlign: 'center'
  },
  emptyStateDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg
  },
  refreshButton: {
    backgroundColor: '#269a56ff',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8
  },
  refreshButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.white
  }
});

export default StdCulture;