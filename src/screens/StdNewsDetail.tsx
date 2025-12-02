import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView, 
  TouchableOpacity, 
  Image,
  Dimensions,
  Share,
  ActivityIndicator
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { spacing } from '../theme/spacing';
import { colors, palette } from '../theme/colors';
import { typography } from '../theme/typography';
import { RootStackParamList } from '../types/navigation';
import ClickableText from '../components/ClickableText';
import WordPopup from '../components/WordPopup';
import { useWordPopup } from '../hooks/useWordPopup'
import { getNewsById, getRelatedNews } from '../services/newsApiService'
import { NewsArticle } from '../types/news'
import { useFavoriteNews } from '../contexts/FavoriteNewsContext'

type NewsDetailNavigationProp = StackNavigationProp<RootStackParamList>;
type NewsDetailRouteProp = RouteProp<RootStackParamList, 'NewsDetail'>;

const { width: screenWidth } = Dimensions.get('window');

const NewsDetail: React.FC = () => {
  const navigation = useNavigation<NewsDetailNavigationProp>();
  const route = useRoute<NewsDetailRouteProp>();
  const { newsId } = route.params;
  
  const [article, setArticle] = useState<any>(null) // Use any to handle API response
  const [relatedArticles, setRelatedArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Favorite functionality
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavoriteNews()
  const isLiked = article ? isFavorite(article.id) : false
  
  // Word popup functionality
  const { wordInfo, popupVisible, popupPosition, handleWordPress, closePopup } = useWordPopup();

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('Fetching article with ID:', newsId)
        
        // Fetch main article
        const articleResponse = await getNewsById(newsId)
        
        if (articleResponse.success && articleResponse.data) {
          setArticle(articleResponse.data)
          console.log('Article fetched successfully:', articleResponse.data.title)
          
          // Try to fetch related articles, but don't fail if it doesn't work
          try {
            const relatedResponse = await getRelatedNews(newsId, 3)
            if (relatedResponse.success && relatedResponse.data) {
              setRelatedArticles(relatedResponse.data)
              console.log('Related articles fetched:', relatedResponse.data.length)
            } else {
              console.log('No related articles found, using empty array')
              setRelatedArticles([])
            }
          } catch (relatedError) {
            console.log('Failed to fetch related articles:', relatedError)
            setRelatedArticles([]) // Set empty array if related articles fail
          }
        } else {
          console.log('Failed to fetch article, using mock data')
          // Article fetch failed, but we have mock data fallback in the API service
          if (articleResponse.data) {
            setArticle(articleResponse.data)
          } else {
            setError('기사를 불러오는데 실패했습니다')
          }
        }
      } catch (err) {
        console.error('Error fetching article:', err)
        setError('네트워크 오류가 발생했습니다')
      } finally {
        setLoading(false)
      }
    }
    
    fetchArticle()
  }, [newsId]);

  const handleShare = async () => {
    if (!article) return;
    
    try {
      await Share.share({
        message: `${article.title}\n\n${article.subtitle}\n\n읽어보세요!`,
        url: '', // You can add app deep link here
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleLike = () => {
    if (!article) return;
    
    if (isLiked) {
      removeFromFavorites(article.id);
    } else {
      // Convert API NewsArticle to types NewsArticle format for favorites
      const favoriteArticle: NewsArticle = {
        id: article.id,
        title: article.title || '제목 없음',
        subtitle: article.subtitle,
        content: article.content || '',
        author: article.author || '저자 없음',
        publishedDate: article.publishedDate,
        source: article.source || '출처 없음',
        imageUrl: article.imageUrl || '',
        category: article.category,
        tags: article.tags || [],
        readingTime: article.readingTime || 5,
        difficulty: article.difficulty || 'intermediate',
        vocabulary: article.keywords || [] // Map keywords to vocabulary
      };
      addToFavorites(favoriteArticle);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '#4CAF50';
      case 'intermediate': return '#FF9800';
      case 'advanced': return '#F44336';
      default: return '#6B7280';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '초급';
      case 'intermediate': return '중급';
      case 'advanced': return '고급';
      default: return '중급';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#269a56ff" />
          <Text style={styles.loadingText}>기사를 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (error && !article) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>돌아가기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  // Show article even if there was an error (fallback data)
  if (!article) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>기사를 찾을 수 없습니다</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>돌아가기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.goBack()}>
          <Text style={styles.headerButtonText}>←</Text>
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>뉴스 상세</Text>
        </View>

        <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
          <Text style={styles.headerButtonText}>📤</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Article Image */}
        {article.imageUrl ? (
          <Image source={{ uri: article.imageUrl }} style={styles.articleImage} />
        ) : (
          <View style={[styles.articleImage, { backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center' }]}>
            <Text style={{ fontSize: 48, color: '#9CA3AF' }}>📰</Text>
          </View>
        )}

        {/* Article Meta Info */}
        <View style={styles.metaContainer}>
          <View style={styles.metaRow}>
            <Text style={styles.sourceText}>📰 {article.source || '출처 없음'}</Text>
            <Text style={styles.dateText}>{article.publishedDate ? formatDate(article.publishedDate) : ''}</Text>
          </View>
          <View style={styles.metaRow}>
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(article.difficulty || 'intermediate') }]}>
              <Text style={styles.difficultyText}>{getDifficultyText(article.difficulty || 'intermediate')}</Text>
            </View>
            <Text style={styles.readingTime}>📖 {article.readingTime || 5}분 읽기</Text>
          </View>
        </View>

        {/* Article Title */}
        <View style={styles.titleContainer}>
          <ClickableText
            text={article.title || '제목 없음'}
            onWordPress={handleWordPress}
            style={styles.articleTitle}
          />
          {article.subtitle && (
            <ClickableText
              text={article.subtitle}
              onWordPress={handleWordPress}
              style={styles.articleSubtitle}
            />
          )}
        </View>

        {/* Article Content */}
        {article.content && (
          <View style={styles.contentContainer}>
            <ClickableText
              text={article.content}
              onWordPress={handleWordPress}
              style={styles.articleContent}
            />
          </View>
        )}

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            <Text style={styles.tagsTitle}>태그:</Text>
            <View style={styles.tagsWrapper}>
              {article.tags.map((tag: string, index: number) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, isLiked && styles.likedButton]} 
            onPress={handleLike}
          >
            <Text style={[styles.actionButtonText, isLiked && styles.likedText]}>
              {isLiked ? '❤️' : '🤍'} 좋아요
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Text style={styles.actionButtonText}>📤 공유하기</Text>
          </TouchableOpacity>
        </View>

        {/* Related Articles */}
        {relatedArticles && relatedArticles.length > 0 && (
          <View style={styles.relatedContainer}>
            <Text style={styles.relatedTitle}>관련 기사</Text>
            {relatedArticles.map((relatedArticle: any) => (
              <TouchableOpacity
                key={relatedArticle.id}
                style={styles.relatedCard}
                onPress={() => navigation.push('NewsDetail', { 
                  newsId: relatedArticle.id, 
                  title: relatedArticle.title || '제목 없음'
                })}
              >
                {relatedArticle.imageUrl ? (
                  <Image source={{ uri: relatedArticle.imageUrl }} style={styles.relatedImage} />
                ) : (
                  <View style={[styles.relatedImage, { backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center' }]}>
                    <Text style={{ fontSize: 16, color: '#9CA3AF' }}>📰</Text>
                  </View>
                )}
                <View style={styles.relatedContent}>
                  <Text style={styles.relatedCardTitle} numberOfLines={2}>
                    {relatedArticle.title || '제목 없음'}
                  </Text>
                  <View style={styles.relatedMeta}>
                    <Text style={styles.relatedSource}>{relatedArticle.source || '출처 없음'}</Text>
                    <Text style={styles.relatedDate}>{relatedArticle.publishedDate ? formatDate(relatedArticle.publishedDate) : ''}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Word Popup */}
      <WordPopup
        visible={popupVisible}
        onClose={closePopup}
        wordInfo={wordInfo}
        position={popupPosition}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    paddingTop: 25, // Match exam page header positioning
    backgroundColor: '#269a56ff',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtonText: {
    fontSize: 18,
    color: palette.white,
    fontWeight: '600',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: spacing.md,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.white,
  },

  // Content
  content: {
    flex: 1,
    marginTop: spacing.md, // Add spacing between header and content
  },
  articleImage: {
    width: screenWidth,
    height: 250,
    resizeMode: 'cover',
  },

  // Meta Info
  metaContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: palette.white,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  sourceText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  dateText: {
    fontSize: 14,
    color: '#6B7280',
  },
  difficultyBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    color: palette.white,
    fontWeight: '600',
  },
  readingTime: {
    fontSize: 14,
    color: '#6B7280',
  },

  // Title
  titleContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    backgroundColor: palette.white,
  },
  articleTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.light.text,
    lineHeight: 32,
    marginBottom: spacing.sm,
  },
  articleSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },

  // Content
  contentContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    backgroundColor: palette.white,
    marginTop: spacing.sm,
  },
  articleContent: {
    fontSize: 16,
    lineHeight: 28,
    color: colors.light.text,
  },

  // Tags
  tagsContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    backgroundColor: palette.white,
    marginTop: spacing.sm,
  },
  tagsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.light.text,
    marginBottom: spacing.sm,
  },
  tagsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tag: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 14,
    color: '#269a56ff',
    fontWeight: '500',
  },

  // Action Buttons
  actionContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    backgroundColor: palette.white,
    marginTop: spacing.sm,
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  likedButton: {
    backgroundColor: '#FECACA',
    borderColor: '#F87171',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  likedText: {
    color: '#DC2626',
  },

  // Related Articles
  relatedContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    backgroundColor: palette.white,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  relatedTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.light.text,
    marginBottom: spacing.md,
  },
  relatedCard: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: spacing.sm,
  },
  relatedImage: {
    width: 80,
    height: 60,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  relatedContent: {
    flex: 1,
    marginLeft: spacing.sm,
    justifyContent: 'space-between',
  },
  relatedCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.light.text,
    lineHeight: 20,
  },
  relatedMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  relatedSource: {
    fontSize: 12,
    color: '#6B7280',
  },
  relatedDate: {
    fontSize: 12,
    color: '#6B7280',
  },

  // Error
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  loadingText: {
    fontSize: 16,
    color: colors.light.text,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  errorText: {
    fontSize: 18,
    color: colors.light.text,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  backButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: '#269a56ff',
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.white,
  },
});

export default NewsDetail;