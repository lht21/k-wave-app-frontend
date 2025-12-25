import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  Dimensions,
  Share,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { spacing } from '../../../theme/spacing';
import { colors, palette } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import ClickableText from '../../../components/ClickableText';
import WordPopup from '../../../components/WordPopup';
import { useWordPopup } from '../../../hooks/useWordPopup'
import { getNewsById, getRelatedNews } from '../../../services/newsApiService'
import { NewsArticle } from '../../../types/news'
import { useFavoriteNews } from '../../../contexts/FavoriteNewsContext'

const { width: screenWidth } = Dimensions.get('window');

const NewsDetail: React.FC = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const newsId = params.newsId as string;
  
  // Dữ liệu bài viết cố định
  const [article] = useState<any>({
    id: 'news-001',
    title: 'K-POP이 세계를 사로잡다: BTS와 블랙핑크의 글로벌 영향력',
    subtitle: 'K-POP이 어떻게 전 세계 음악 시장을 변화시키고 있는지 알아봅니다',
    content: `K-POP은 이제 단순한 음악 장르를 넘어 글로벌 문화 현상이 되었습니다. BTS와 블랙핑크를 중심으로 한 한국 아이돌 그룹들은 전 세계 팬들의 마음을 사로잡고 있습니다.

BTS는 2013년 데뷔 이후 빌보드 차트를 석권하며 한국 가수 최초로 그래미 어워드에 노미네이트되는 쾌거를 이뤘습니다. 그들의 음악은 청춘의 고뇌와 사회적 메시지를 담아 전 세계 젊은이들에게 깊은 울림을 주고 있습니다.

블랙핑크 역시 강렬한 퍼포먼스와 독특한 음악 스타일로 전 세계 여성 팬들의 아이콘이 되었습니다. 그들의 뮤직비디오는 유튜브에서 수억 뷰를 기록하며 K-POP의 위상을 높이고 있습니다.

K-POP의 성공 비결은 체계적인 연습생 시스템, 높은 퀄리티의 뮤직비디오, 그리고 SNS를 통한 적극적인 팬 소통에 있습니다. 이러한 요소들이 결합되어 K-POP은 전 세계 음악 시장에서 독보적인 위치를 차지하게 되었습니다.

앞으로도 K-POP은 계속해서 진화하며 더 많은 글로벌 팬들을 만나게 될 것입니다. 한국의 음악과 문화가 세계를 하나로 연결하는 다리 역할을 하고 있습니다.`,
    author: '김한글',
    publishedDate: '2025-12-25',
    source: 'K-Wave News',
    imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800',
    category: 'music',
    tags: ['K-POP', 'BTS', '블랙핑크', '한류', '음악'],
    readingTime: 5,
    difficulty: 'intermediate',
    keywords: ['사로잡다', '영향력', '석권하다', '노미네이트', '퍼포먼스']
  });
  
  const [relatedArticles] = useState<any[]>([
    {
      id: 'news-002',
      title: '한국 드라마의 세계적 인기, 넷플릭스가 주목하다',
      subtitle: '오징어 게임의 성공 이후 한국 드라마의 위상',
      imageUrl: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=400',
      source: 'Drama Weekly',
      publishedDate: '2025-12-20'
    },
    {
      id: 'news-003',
      title: '한식의 세계화: 김치와 비빔밥이 글로벌 푸드가 되다',
      subtitle: '한식당이 미슐랭 스타를 받으며 인정받는 한국의 맛',
      imageUrl: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=400',
      source: 'Food Culture',
      publishedDate: '2025-12-18'
    },
    {
      id: 'news-004',
      title: '한국 영화의 르네상스: 봉준호 감독의 아카데미 수상',
      subtitle: '기생충이 보여준 한국 영화의 예술성과 메시지',
      imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400',
      source: 'Cinema Review',
      publishedDate: '2025-12-15'
    }
  ]);
  
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);
  
  // Favorite functionality
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavoriteNews()
  const isLiked = article ? isFavorite(article.id) : false
  
  // Word popup functionality
  const { wordInfo, popupVisible, popupPosition, handleWordPress, closePopup } = useWordPopup();

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
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#269a56ff" />
          <Text style={styles.loadingText}>기사를 불러오는 중...</Text>
        </View>
      </View>
    )
  }

  if (error && !article) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>돌아가기</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  // Show article even if there was an error (fallback data)
  if (!article) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>기사를 찾을 수 없습니다</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>돌아가기</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header Profile Style */}
      <View style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
              <Text style={styles.headerButtonText}>←</Text>
            </TouchableOpacity>
            
            <Text style={styles.headerTitle} numberOfLines={1}>뉴스 상세</Text>

            <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
              <Text style={styles.headerButtonText}>📤</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
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
                onPress={() => router.push({
                  pathname: '/(student)/news/[id]',
                  params: {
                    newsId: relatedArticle.id, 
                    title: relatedArticle.title || '제목 없음'
                  }
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
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