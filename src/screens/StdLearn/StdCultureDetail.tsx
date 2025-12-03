import * as React from 'react';
import { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { spacing } from '../../theme/spacing';
import { colors, palette } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { RootStackParamList } from '../../types/navigation';
import CultureApiService from '../../services/cultureApiService';

interface CultureItem {
  _id: string;
  title: string;
  subtitle?: string;
  description: string;
  content?: string;
  category: {
    id: string;
    title: string;
    description?: string;
  };
  tags?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  viewCount: number;
  author: {
    fullName: string;
    email?: string;
  };
  createdAt?: string;
  publishedAt?: string;
  status?: string;
  isPublished?: boolean;
}

type CultureDetailNavigationProp = StackNavigationProp<RootStackParamList>;
type CultureDetailRouteProp = RouteProp<any, 'StdCultureDetail'>;

const StdCultureDetail: React.FC = () => {
  const navigation = useNavigation<CultureDetailNavigationProp>();
  const route = useRoute<CultureDetailRouteProp>();
  
  const { itemId } = route.params as { itemId: string; itemTitle: string };
  const [item, setItem] = useState<CultureItem | null>(null);
  const [relatedItems, setRelatedItems] = useState<CultureItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCultureItem();
  }, [itemId]);

  const loadCultureItem = async () => {
    try {
      setLoading(true);
      const itemData = await CultureApiService.getCultureItem(itemId);
      setItem(itemData);

      // Load related items
      if (itemData.category.id) {
        loadRelatedItems(itemData.category.id, itemId);
      }
    } catch (error) {
      console.error('Error loading culture item:', error);
      Alert.alert('Lỗi', 'Không thể tải nội dung văn hóa');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedItems = async (categoryId: string, currentItemId: string) => {
    try {
      const response = await CultureApiService.getCultureItems({
        categoryId,
        limit: 4
      });
      
      // Lọc bỏ item hiện tại
      const filtered = response.items?.filter((relatedItem: CultureItem) => 
        relatedItem._id !== currentItemId
      ).slice(0, 3) || [];
      
      setRelatedItems(filtered);
    } catch (error) {
      console.error('Error loading related items:', error);
    }
  };

  if (loading) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#269a56ff" />
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  if (!item) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Không tìm thấy nội dung!</Text>
            <TouchableOpacity 
              style={styles.backToListButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backToListText}>Quay lại</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  const getDetailContent = (item: CultureItem) => {
    // Nếu có content từ database thì dùng, không thì dùng description
    const contentText = item.content || item.description;
    
    // Format nội dung để hiển thị tốt hơn
    const formatContent = (text: string) => {
      // Tách content thành các đoạn dựa trên double line breaks
      const paragraphs = text.split('\n\n').filter(p => p.trim());
      
      return paragraphs.map((paragraph, index) => {
        // Kiểm tra nếu là tiêu đề (có emoji hoặc 📖, 🎯, 💡, v.v.)
        const isHeader = /^[📖🎯💡🏮🍽️🎊📚👥🌟⚡]/.test(paragraph.trim());
        
        return (
          <View key={index} style={isHeader ? styles.sectionHeader : styles.paragraph}>
            <Text style={isHeader ? styles.sectionHeaderText : styles.contentText}>
              {paragraph.trim()}
            </Text>
          </View>
        );
      });
    };

    return (
      <View style={styles.detailContent}>
        <View style={styles.contentSection}>
          {formatContent(contentText)}
        </View>
        
        <View style={styles.metaInfo}>
          <Text style={styles.metaLabel}>Tác giả: <Text style={styles.metaValue}>{item.author.fullName}</Text></Text>
          <Text style={styles.metaLabel}>Lượt xem: <Text style={styles.metaValue}>{item.viewCount}</Text></Text>
          <Text style={styles.metaLabel}>Chủ đề: <Text style={styles.metaValue}>{item.category.title}</Text></Text>
          {item.publishedAt && (
            <Text style={styles.metaLabel}>
              Xuất bản: <Text style={styles.metaValue}>{new Date(item.publishedAt).toLocaleDateString('vi-VN')}</Text>
            </Text>
          )}
        </View>
        
        {item.tags && item.tags.length > 0 && (
          <View style={styles.tagsSection}>
            <Text style={styles.tagsSectionTitle}>Từ khóa:</Text>
            <View style={styles.tagsContainer}>
              {item.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    );
  };

  // relatedItems đã được khai báo ở state

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{item.title}</Text>
        <TouchableOpacity style={styles.shareButton}>
          <Text style={styles.shareButtonText}>📤</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>{item.title}</Text>
          {item.subtitle && (
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          )}
          <Text style={styles.description}>{item.description}</Text>
          
          {item.difficulty && (
            <View style={styles.difficultyBadge}>
              <Text style={styles.difficultyText}>
                Mức độ: {item.difficulty === 'beginner' ? 'Cơ bản' :
                        item.difficulty === 'intermediate' ? 'Trung bình' : 'Nâng cao'}
              </Text>
            </View>
          )}
        </View>

        {/* Content */}
        {getDetailContent(item)}

        {/* Related Items */}
        {relatedItems.length > 0 && (
          <View style={styles.relatedSection}>
            <Text style={styles.relatedTitle}>Nội dung liên quan</Text>
            {relatedItems.map((relatedItem) => (
              <TouchableOpacity
                key={relatedItem._id}
                style={styles.relatedItem}
                onPress={() => navigation.push('StdCultureDetail' as any, { 
                  itemId: relatedItem._id,
                  itemTitle: relatedItem.title 
                })}
              >
                <Text style={styles.relatedItemTitle}>{relatedItem.title}</Text>
                <Text style={styles.relatedItemDescription} numberOfLines={1}>
                  {relatedItem.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Bottom spacing */}
        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA'
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    paddingTop: spacing.xl, // Match exam page header positioning
    backgroundColor: '#269a56ff',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20
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
    fontSize: 20,
    color: palette.white,
    fontWeight: '600'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.white,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: spacing.md
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  shareButtonText: {
    fontSize: 16
  },

  // Content
  content: {
    flex: 1
  },
  titleSection: {
    backgroundColor: palette.white,
    padding: spacing.lg,
    marginBottom: spacing.md
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.light.text,
    marginBottom: spacing.sm
  },
  subtitle: {
    fontSize: 18,
    color: '#269a56ff',
    fontWeight: '600',
    marginBottom: spacing.sm
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
    marginBottom: spacing.md
  },
  difficultyBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 12
  },
  difficultyText: {
    fontSize: 14,
    color: '#0369A1',
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

  // Meta Info
  metaInfo: {
    backgroundColor: '#F8F9FA',
    padding: spacing.md,
    borderRadius: 12,
    marginTop: spacing.md
  },
  metaLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: spacing.xs
  },
  metaValue: {
    fontWeight: '600',
    color: colors.light.text
  },

  // Detail Content
  detailContent: {
    backgroundColor: palette.white,
    marginBottom: spacing.md,
    padding: spacing.lg
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.light.text,
    marginBottom: spacing.md,
    lineHeight: 26
  },
  contentText: {
    fontSize: 16,
    color: colors.light.text,
    lineHeight: 26,
    marginBottom: spacing.md,
    textAlign: 'justify'
  },

  // Sunbae-Hoobae specific
  illustrationContainer: {
    backgroundColor: '#FFF7ED',
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    alignItems: 'center'
  },
  characterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%'
  },
  character: {
    alignItems: 'center'
  },
  characterEmoji: {
    fontSize: 48,
    marginBottom: spacing.sm
  },
  characterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EA580C'
  },

  // Image
  imageSection: {
    marginVertical: spacing.md
  },
  contentImage: {
    width: '100%',
    height: 150,
    borderRadius: 12
  },

  // Highlight box
  highlightBox: {
    backgroundColor: '#E8F5E8',
    borderLeftWidth: 4,
    borderLeftColor: '#269a56ff',
    padding: spacing.md,
    borderRadius: 8,
    marginTop: spacing.md
  },
  highlightTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#166534',
    marginBottom: spacing.sm
  },
  highlightText: {
    fontSize: 14,
    color: '#166534',
    lineHeight: 20
  },

  // K-pop specific
  heroSection: {
    alignItems: 'center',
    marginBottom: spacing.lg
  },
  heroTitle: {
    fontSize: 32,
    marginBottom: spacing.sm
  },
  heroSubtitle: {
    fontSize: 18,
    color: '#6B7280',
    fontStyle: 'italic'
  },

  // Timeline
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingLeft: spacing.md
  },
  timelineYear: {
    fontSize: 16,
    fontWeight: '700',
    color: '#269a56ff',
    width: 60
  },
  timelineEvent: {
    fontSize: 16,
    color: colors.light.text,
    flex: 1
  },

  // Food specific
  foodGrid: {
    alignItems: 'center',
    marginBottom: spacing.lg
  },
  foodGridTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.md
  },
  dishesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md
  },
  dishItem: {
    backgroundColor: '#FFF7ED',
    padding: spacing.sm,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center'
  },
  dishEmoji: {
    fontSize: 14
  },

  // Tip box
  tipBox: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: spacing.md,
    marginTop: spacing.md
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#D97706',
    marginBottom: spacing.sm
  },
  tipText: {
    fontSize: 14,
    color: '#D97706',
    lineHeight: 20
  },

  // Tags
  tagsSection: {
    marginTop: spacing.lg
  },
  tagsSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.light.text,
    marginBottom: spacing.sm
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 8
  },
  tagText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500'
  },

  // Related Items
  relatedSection: {
    backgroundColor: palette.white,
    padding: spacing.lg,
    marginBottom: spacing.md
  },
  relatedTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.light.text,
    marginBottom: spacing.md
  },
  relatedItem: {
    backgroundColor: '#F8F9FA',
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm
  },
  relatedItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.light.text,
    marginBottom: spacing.xs
  },

  // New styles for formatted content
  contentSection: {
    marginBottom: spacing.lg
  },
  sectionHeader: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    paddingLeft: spacing.xs
  },
  sectionHeaderText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#269a56ff',
    lineHeight: 24
  },
  paragraph: {
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs
  },
  relatedItemDescription: {
    fontSize: 14,
    color: '#6B7280'
  },

  // Error
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg
  },
  errorText: {
    fontSize: 18,
    color: colors.light.text,
    textAlign: 'center',
    marginBottom: spacing.lg
  },
  backToListButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: '#269a56ff',
    borderRadius: 12
  },
  backToListText: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.white
  }
});

export default StdCultureDetail;