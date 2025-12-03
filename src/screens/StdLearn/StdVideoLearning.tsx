import * as React from 'react';
import { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Dimensions, 
  RefreshControl,
  ActivityIndicator 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { spacing } from '../../theme/spacing';
import { colors, palette } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { RootStackParamList } from '../../types/navigation';
import { useLatestVideos, useTrendingVideos, useVideoCategories } from '../../hooks/useYouTube';
import youtubeApiService, { YouTubeVideo } from '../../services/youtubeApiService';

type StdVideoLearningNavigationProp = StackNavigationProp<RootStackParamList>;

const { width } = Dimensions.get('window');

const StdVideoLearning: React.FC = () => {
  const navigation = useNavigation<StdVideoLearningNavigationProp>();
  const [refreshing, setRefreshing] = useState(false);

  // Use YouTube API hooks
  const { videos: latestVideos, loading: latestLoading, refresh: refreshLatest } = useLatestVideos(10);
  const { videos: trendingVideos, loading: trendingLoading, refresh: refreshTrending } = useTrendingVideos(8);
  const { categories, loading: categoriesLoading, refresh: refreshCategories } = useVideoCategories();

  // Test API connection on mount
  React.useEffect(() => {
    const testConnection = async () => {
      try {
        const result = await youtubeApiService.testConnection();
        if (result.success) {
          console.log('✅ API Connection OK:', result.url);
        } else {
          console.warn('⚠️ API Connection Failed:', result.message, 'URL:', result.url);
        }
      } catch (error) {
        console.error('❌ Connection test error:', error);
      }
    };
    testConnection();
  }, []);

  // Create video categories with real data
  const videoCategories = [
    {
      id: 'latest',
      title: 'Video mới nhất từ KBS Drama',
      videos: latestVideos
    },
    {
      id: 'trending', 
      title: 'Video được xem nhiều',
      videos: trendingVideos
    },
    ...categories.map(cat => ({
      id: cat.id,
      title: cat.title,
      videos: cat.videos.slice(0, 6) // Limit to 6 videos per category
    }))
  ];

  const handleVideoPress = (video: YouTubeVideo) => {
    console.log('Navigating to video detail:', {
      videoId: video.id,
      videoTitle: video.title,
      thumbnail: video.thumbnail
    });
    
    navigation.navigate('VideoDetail', {
      videoId: video.id,
      videoTitle: video.title
    });
  };

  const handleSeeMore = (categoryId: string, categoryTitle: string) => {
    navigation.navigate('VideoCategory', {
      categoryId,
      categoryTitle
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      refreshLatest(),
      refreshTrending(),
      refreshCategories()
    ]);
    setRefreshing(false);
  };

  const VideoCard = ({ video }: { video: YouTubeVideo }) => {
    const thumbnailUrl = youtubeApiService.getVideoThumbnail(video, 'medium');
    const fallbackUrl = `https://img.youtube.com/vi/${video.id}/mqdefault.jpg`;
    
    return (
      <TouchableOpacity 
        style={styles.videoCard}
        onPress={() => handleVideoPress(video)}
        activeOpacity={0.8}
      >
        <View style={styles.thumbnailContainer}>
          <Image 
            source={{ 
              uri: thumbnailUrl || fallbackUrl
            }} 
            style={styles.thumbnail}
            resizeMode="cover"
            onError={() => {
              console.log('Image load error for video:', video.id);
            }}
          />
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{video.duration}</Text>
          </View>
          <View style={styles.playButton}>
            <Text style={styles.playIcon}>▶</Text>
          </View>
        </View>
        
        <View style={styles.videoInfo}>
          <Text style={styles.videoTitle} numberOfLines={2}>
            {video.title}
          </Text>
          <View style={styles.videoMeta}>
            <Text style={styles.views}>👁 {video.viewCount}</Text>
            <View style={[styles.levelBadge, { backgroundColor: youtubeApiService.getLevelColor(video.level) }]}>
              <Text style={styles.levelText}>{youtubeApiService.getLevelText(video.level)}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const isLoading = latestLoading || trendingLoading || categoriesLoading;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Học qua Video</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Text style={styles.searchButtonText}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Premium Banner */}
      <View style={styles.premiumBanner}>
        <View style={styles.bannerLeft}>
          <View style={styles.premiumIcon}>
            <Text style={styles.iconText}>👑</Text>
          </View>
          <View style={styles.bannerTextContent}>
            <Text style={styles.bannerTitle}>K-Wave Premium</Text>
            <Text style={styles.bannerSubtitle}>Học không giới hạn • Không quảng cáo</Text>
            <View style={styles.priceContainer}>
              <Text style={styles.oldPrice}>5.000.000đ</Text>
              <Text style={styles.newPrice}>990.000đ</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity style={styles.upgradeButton}>
          <Text style={styles.upgradeButtonText}>Nâng cấp</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#269a56ff']}
            tintColor="#269a56ff"
          />
        }
      >
        {/* Loading State */}
        {isLoading && videoCategories.every(cat => cat.videos.length === 0) && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#269a56ff" />
            <Text style={styles.loadingText}>Đang tải video từ KBS Drama...</Text>
          </View>
        )}

        {/* Video Categories */}
        {videoCategories.map((category) => (
          category.videos.length > 0 && (
            <View key={category.id} style={styles.categorySection}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryTitle}>{category.title}</Text>
                <TouchableOpacity 
                  style={styles.seeMoreButton}
                  onPress={() => handleSeeMore(category.id, category.title)}
                >
                  <Text style={styles.seeMoreText}>Xem thêm</Text>
                </TouchableOpacity>
              </View>

              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.videosContainer}
              >
                {category.videos.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </ScrollView>
            </View>
          )
        ))}

        {/* Bottom spacing */}
        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </View>
  );
};

export default StdVideoLearning;

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
    fontSize: typography.fontSizes.lg,
    fontWeight: '700',
    color: palette.white
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  searchButtonText: {
    fontSize: 16,
    color: palette.white
  },

  // Premium Banner
  premiumBanner: {
    backgroundColor: '#FF6B35',
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: 16,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  premiumIcon: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md
  },
  iconText: {
    fontSize: 24
  },
  bannerTextContent: {
    flex: 1
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: palette.white,
    marginBottom: 4
  },
  bannerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 6
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  oldPrice: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    textDecorationLine: 'line-through',
    marginRight: spacing.xs
  },
  newPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFD700'
  },
  upgradeButton: {
    backgroundColor: palette.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  upgradeButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF6B35'
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: spacing.md
  },

  // Category Section
  categorySection: {
    marginTop: spacing.lg
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md
  },
  categoryTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: '700',
    color: colors.light.text
  },
  seeMoreButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm
  },
  seeMoreText: {
    fontSize: 14,
    color: '#269a56ff',
    fontWeight: '600'
  },

  // Videos Container
  videosContainer: {
    paddingVertical: spacing.sm
  },
  videoCard: {
    width: 200,
    marginRight: spacing.md,
    backgroundColor: palette.white,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3
  },
  thumbnailContainer: {
    position: 'relative'
  },
  thumbnail: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12
  },
  durationBadge: {
    position: 'absolute',
    bottom: spacing.xs,
    right: spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 4,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2
  },
  durationText: {
    fontSize: 12,
    color: palette.white,
    fontWeight: '600'
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -15 }, { translateY: -15 }],
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  playIcon: {
    fontSize: 12,
    color: '#269a56ff',
    marginLeft: 2
  },

  // Video Info
  videoInfo: {
    padding: spacing.sm
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.light.text,
    marginBottom: spacing.xs,
    lineHeight: 18
  },
  videoMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  views: {
    fontSize: 12,
    color: '#6B7280'
  },
  levelBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 8
  },
  levelText: {
    fontSize: 10,
    color: palette.white,
    fontWeight: '600'
  },

  // Loading States
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    marginHorizontal: spacing.md
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: spacing.md,
    fontWeight: '500'
  }
});