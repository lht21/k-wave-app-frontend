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
import CultureApiService from '../../../services/cultureApiService';

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
  category: {
    id: string;
    title: string;
  };
  tags?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  viewCount: number;
  author: {
    fullName: string;
  };
}

const StdCulture: React.FC = () => {
  const router = useRouter();
  const [categories, setCategories] = useState<CultureCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<CultureCategory | null>(null);
  const [cultureItems, setCultureItems] = useState<CultureItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [itemsLoading, setItemsLoading] = useState(false);

  // Load categories khi component mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Load culture items khi category thay đổi
  useEffect(() => {
    if (selectedCategory) {
      loadCultureItems();
    }
  }, [selectedCategory]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const categoriesData = await CultureApiService.getCategories();
      setCategories(categoriesData);
      
      // Chọn category đầu tiên làm mặc định
      if (categoriesData.length > 0) {
        setSelectedCategory(categoriesData[0]);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách chủ đề. Vui lòng kiểm tra kết nối mạng.');
    } finally {
      setLoading(false);
    }
  };

  const loadCultureItems = async () => {
    if (!selectedCategory) return;

    try {
      setItemsLoading(true);
      const response = await CultureApiService.getCultureItems({
        categoryId: selectedCategory.id,
        limit: 20
      });
      setCultureItems(response.items || []);
    } catch (error) {
      console.error('Error loading culture items:', error);
      Alert.alert('Lỗi', 'Không thể tải nội dung văn hóa. Vui lòng thử lại.');
    } finally {
      setItemsLoading(false);
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
      style={styles.itemCard}
      onPress={() => handleItemPress(item)}
    >
      <View style={styles.itemContent}>
        <View style={styles.itemHeader}>
          <View style={styles.itemIconContainer}>
            <Text style={styles.itemIcon}>🌸</Text>
          </View>
          <Text style={styles.itemTitle}>{item.title}</Text>
        </View>
        
        {item.subtitle && (
          <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
        )}
        
        <Text style={styles.itemDescription} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.itemMeta}>
          <Text style={styles.itemAuthor}>Bởi {item.author.fullName}</Text>
          <Text style={styles.itemViews}>{item.viewCount} lượt xem</Text>
        </View>
        
        {item.tags && item.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {item.tags.slice(0, 2).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
            {item.difficulty && (
              <View style={[styles.tag, styles.difficultyTag]}>
                <Text style={styles.tagText}>
                  {item.difficulty === 'beginner' ? 'Cơ bản' :
                   item.difficulty === 'intermediate' ? 'Trung bình' : 'Nâng cao'}
                </Text>
              </View>
            )}
          </View>
        )}
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
        Nội dung cho chủ đề này sẽ được cập nhật sớm
      </Text>
    </View>
  );

  const filteredItems = selectedCategory?.id === 'all' 
    ? cultureItems 
    : cultureItems;

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
            <Text style={styles.headerTitle}>Văn hóa</Text>
            <TouchableOpacity style={styles.infoButton}>
              <Text style={styles.infoButtonText}>ℹ️</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      {/* Category Tabs */}
      <View style={styles.categorySection}>
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

      {/* Selected Category Info */}
      {selectedCategory && (
        <View style={styles.categoryInfoSection}>
          <Text style={styles.categoryInfoTitle}>{selectedCategory.title}</Text>
          <Text style={styles.categoryInfoDescription}>
            {selectedCategory.description}
          </Text>
        </View>
      )}

      {/* Culture Items */}
      <View style={styles.itemsSection}>
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
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
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
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  infoButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  infoButtonText: {
    fontSize: 16,
    color: '#fff'
  },

  // Category Tabs
  categorySection: {
    backgroundColor: palette.white,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
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

  // Category Info
  categoryInfoSection: {
    backgroundColor: palette.white,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md
  },
  categoryInfoTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: '700',
    color: colors.light.text,
    marginBottom: spacing.xs
  },
  categoryInfoDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20
  },

  // Items
  itemsSection: {
    flex: 1,
    paddingTop: spacing.md
  },
  itemsList: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl
  },
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
  itemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.light.text,
    flex: 1
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
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 8
  },
  difficultyTag: {
    backgroundColor: '#E0F2FE'
  },
  tagText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500'
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

  // Item Meta
  itemMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm
  },
  itemAuthor: {
    fontSize: 12,
    color: '#6B7280'
  },
  itemViews: {
    fontSize: 12,
    color: '#6B7280'
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
    lineHeight: 20
  }
});

export default StdCulture;