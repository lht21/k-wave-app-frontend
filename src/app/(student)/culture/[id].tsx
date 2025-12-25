import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { spacing } from '../../../theme/spacing';
import { colors, palette } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { cultureService, Culture } from '../../../services/cultureService';

interface CultureItem extends Culture {
  _id: string;
  title: string;
  subtitle: string;
  category: string;
  content: any[];
  vocabulary: any[];
  views?: number;
  likes?: number;
  author?: any;
  isPremium?: boolean;
  image: string;
}

const StdCultureDetail: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const itemId = params.id as string;
  const [item, setItem] = useState<CultureItem | null>(null);
  const [relatedItems, setRelatedItems] = useState<CultureItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentCategory, setCurrentCategory] = useState<string>('');

  useEffect(() => {
    if (itemId) {
      loadCultureItem();
    }
  }, [itemId]);

  const loadCultureItem = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading culture item with ID:', itemId);
      
      const itemData = await cultureService.getById(itemId);
      console.log('📊 Item data received:', itemData);
      
      setItem(itemData);
      setCurrentCategory(itemData.category);

      // Load related items from the same category
      await loadRelatedItems(itemData.category, itemId);
    } catch (error) {
      console.error('❌ Error loading culture item:', error);
      Alert.alert('Lỗi', 'Không thể tải nội dung văn hóa. Vui lòng kiểm tra kết nối mạng.');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const loadRelatedItems = async (category: string, currentItemId: string) => {
    try {
      console.log('🔄 Loading related items for category:', category);
      
      const response = await cultureService.getAll(category);
      
      // Lọc bỏ item hiện tại
      const filtered = response
        .filter((relatedItem: CultureItem) => relatedItem._id !== currentItemId)
        .slice(0, 3);
      
      console.log('📊 Related items found:', filtered.length);
      setRelatedItems(filtered);
    } catch (error) {
      console.error('❌ Error loading related items:', error);
      setRelatedItems([]);
    }
  };

  const renderContent = () => {
    if (!item || !item.content) return null;

    return item.content.map((section, index) => {
      if (section.type === 'text') {
        return (
          <View key={index} style={styles.contentSection}>
            <Text style={styles.contentText}>{section.content}</Text>
          </View>
        );
      } else if (section.type === 'image' && section.url) {
        return (
          <View key={index} style={styles.imageSection}>
            <Image 
              source={{ uri: section.url }} 
              style={styles.contentImage}
              resizeMode="cover"
            />
            {section.caption && (
              <Text style={styles.imageCaption}>{section.caption}</Text>
            )}
          </View>
        );
      }
      return null;
    });
  };

  const renderVocabulary = () => {
    if (!item || !item.vocabulary || item.vocabulary.length === 0) return null;

    return (
      <View style={styles.vocabularySection}>
        <Text style={styles.sectionTitle}>📚 Từ vựng liên quan</Text>
        {item.vocabulary.map((vocab, index) => (
          <View key={index} style={styles.vocabItem}>
            <Text style={styles.vocabWord}>
              {vocab.word} <Text style={styles.vocabPronunciation}>[{vocab.pronunciation}]</Text>
            </Text>
            <Text style={styles.vocabMeaning}>{vocab.meaning}</Text>
          </View>
        ))}
      </View>
    );
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
              onPress={() => router.back()}
            >
              <Text style={styles.backToListText}>Quay lại danh sách</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{item.title}</Text>
          <TouchableOpacity 
            style={styles.shareButton}
            onPress={() => Alert.alert('Chia sẻ', 'Tính năng chia sẻ đang phát triển')}
          >
            <Text style={styles.shareButtonText}>📤</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Hero Image */}
          {item.image && (
            <View style={styles.heroImageContainer}>
              <Image 
                source={{ uri: item.image }} 
                style={styles.heroImage}
                resizeMode="cover"
              />
              {item.isPremium && (
                <View style={styles.premiumBadge}>
                  <Text style={styles.premiumBadgeText}>⭐ Premium</Text>
                </View>
              )}
            </View>
          )}

          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>{item.title}</Text>
            {item.subtitle && (
              <Text style={styles.subtitle}>{item.subtitle}</Text>
            )}
            
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{item.category}</Text>
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.stat}>
                <Text style={styles.statIcon}>👁️</Text>
                <Text style={styles.statText}>{item.views || 0} lượt xem</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statIcon}>❤️</Text>
                <Text style={styles.statText}>{item.likes || 0} lượt thích</Text>
              </View>
              {item.author?.fullName && (
                <View style={styles.stat}>
                  <Text style={styles.statIcon}>✍️</Text>
                  <Text style={styles.statText}>{item.author.fullName}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Main Content */}
          <View style={styles.detailContent}>
            {renderContent()}
          </View>

          {/* Vocabulary */}
          {renderVocabulary()}

          {/* Related Items */}
          {relatedItems.length > 0 && (
            <View style={styles.relatedSection}>
              <Text style={styles.relatedTitle}>Nội dung liên quan</Text>
              {relatedItems.map((relatedItem) => (
                <TouchableOpacity
                  key={relatedItem._id}
                  style={styles.relatedItem}
                  onPress={() => {
                    router.push({
                      pathname: '/(student)/culture/[id]',
                      params: { 
                        id: relatedItem._id,
                        itemTitle: relatedItem.title 
                      }
                    });
                  }}
                >
                  <View style={styles.relatedItemContent}>
                    {relatedItem.image && (
                      <Image 
                        source={{ uri: relatedItem.image }} 
                        style={styles.relatedItemImage}
                      />
                    )}
                    <View style={styles.relatedItemText}>
                      <Text style={styles.relatedItemTitle}>{relatedItem.title}</Text>
                      <Text style={styles.relatedItemDescription} numberOfLines={2}>
                        {relatedItem.subtitle || relatedItem.content?.[0]?.content || 'Không có mô tả'}
                      </Text>
                    </View>
                  </View>
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
    paddingTop: spacing.xl,
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

  // Hero Image
  heroImageContainer: {
    position: 'relative',
    marginBottom: spacing.md
  },
  heroImage: {
    width: '100%',
    height: 200
  },
  premiumBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    backgroundColor: '#FFD700',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 4
  },
  premiumBadgeText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '700'
  },

  // Title Section
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
    fontSize: 16,
    color: '#269a56ff',
    fontWeight: '600',
    marginBottom: spacing.md,
    lineHeight: 22
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    marginBottom: spacing.md
  },
  categoryBadgeText: {
    fontSize: 14,
    color: '#269a56ff',
    fontWeight: '600'
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.md
  },
  stat: {
    alignItems: 'center'
  },
  statIcon: {
    fontSize: 16,
    marginBottom: spacing.xs
  },
  statText: {
    fontSize: 12,
    color: '#6B7280'
  },

  // Detail Content
  detailContent: {
    backgroundColor: palette.white,
    marginBottom: spacing.md,
    padding: spacing.lg
  },
  contentSection: {
    marginBottom: spacing.lg
  },
  contentText: {
    fontSize: 16,
    color: colors.light.text,
    lineHeight: 26,
    textAlign: 'justify'
  },
  imageSection: {
    marginVertical: spacing.lg
  },
  contentImage: {
    width: '100%',
    height: 200,
    borderRadius: 12
  },
  imageCaption: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: spacing.sm
  },

  // Vocabulary
  vocabularySection: {
    backgroundColor: palette.white,
    padding: spacing.lg,
    marginBottom: spacing.md
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.light.text,
    marginBottom: spacing.md
  },
  vocabItem: {
    backgroundColor: '#F8F9FA',
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.sm
  },
  vocabWord: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.light.text,
    marginBottom: spacing.xs
  },
  vocabPronunciation: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '400'
  },
  vocabMeaning: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20
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
    borderRadius: 12,
    marginBottom: spacing.sm,
    overflow: 'hidden'
  },
  relatedItemContent: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  relatedItemImage: {
    width: 80,
    height: 80
  },
  relatedItemText: {
    flex: 1,
    padding: spacing.md
  },
  relatedItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.light.text,
    marginBottom: spacing.xs
  },
  relatedItemDescription: {
    fontSize: 14,
    color: '#6B7280'
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