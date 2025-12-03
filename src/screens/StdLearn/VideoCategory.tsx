import * as React from 'react';
import { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  TextInput,
  RefreshControl,
  ActivityIndicator 
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { spacing } from '../../theme/spacing';
import { colors, palette } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { RootStackParamList } from '../../types/navigation';
import { useVideosByCategory, useVideoSearch } from '../../hooks/useYouTube';
import youtubeApiService, { YouTubeVideo } from '../../services/youtubeApiService';

type VideoCategoryNavigationProp = StackNavigationProp<RootStackParamList>;
type VideoCategoryRouteProp = RouteProp<RootStackParamList, 'VideoCategory'>;

const VideoCategory: React.FC = () => {
  const navigation = useNavigation<VideoCategoryNavigationProp>();
  const route = useRoute<VideoCategoryRouteProp>();
  const { categoryId, categoryTitle } = route.params;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [isSearchMode, setIsSearchMode] = useState(false);

  // Use YouTube API hooks - limit to 6 videos for 2 rows
  const { videos: categoryVideos, loading: categoryLoading, refresh: refreshCategory } = useVideosByCategory(categoryId, 6);
  const { videos: searchResults, loading: searchLoading, searchVideos, clearSearch } = useVideoSearch();

  // Determine which videos to show - limit to 6 videos maximum
  const displayVideos = (isSearchMode ? searchResults : categoryVideos).slice(0, 6);
  const isLoading = isSearchMode ? searchLoading : categoryLoading;

  useEffect(() => {
    if (searchQuery.trim()) {
      setIsSearchMode(true);
      const timeoutId = setTimeout(() => {
        searchVideos(searchQuery, 6);
      }, 500); // Debounce search
      
      return () => clearTimeout(timeoutId);
    } else {
      setIsSearchMode(false);
      clearSearch();
    }
  }, [searchQuery]);

  const handleVideoPress = (video: YouTubeVideo) => {
    navigation.navigate('VideoDetail', {
      videoId: video.id,
      videoTitle: video.title
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (isSearchMode && searchQuery.trim()) {
      await searchVideos(searchQuery, 6);
    } else {
      await refreshCategory();
    }
    setRefreshing(false);
  };

  const handleSearchClear = () => {
    setSearchQuery('');
    setIsSearchMode(false);
    clearSearch();
  };

  const VideoListItem = ({ video }: { video: YouTubeVideo }) => (
    <TouchableOpacity 
      style={styles.videoItemGrid}
      onPress={() => handleVideoPress(video)}
    >
      <View style={styles.thumbnailContainerGrid}>
        <Image 
          source={{ uri: youtubeApiService.getVideoThumbnail(video, 'medium') }} 
          style={styles.thumbnailGrid}
          resizeMode="cover"
          defaultSource={{ uri: 'https://via.placeholder.com/120x80?text=KBS+Drama' }}
        />
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{video.duration}</Text>
        </View>
        <View style={styles.playButtonGrid}>
          <Text style={styles.playIcon}>▶</Text>
        </View>
      </View>
      
      <View style={styles.videoContentGrid}>
        <Text style={styles.videoTitleGrid} numberOfLines={2}>
          {video.title}
        </Text>
        <View style={styles.videoMetaGrid}>
          <Text style={styles.viewsSmall}>👁 {video.viewCount}</Text>
          <View style={[styles.levelBadgeSmall, { backgroundColor: youtubeApiService.getLevelColor(video.level) }]}>
            <Text style={styles.levelTextSmall}>{youtubeApiService.getLevelText(video.level)}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

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
        <Text style={styles.headerTitle} numberOfLines={1}>{categoryTitle}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm video..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={handleSearchClear}
            >
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
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
        {/* Video Count */}
        {!isLoading && (
          <Text style={styles.videoCount}>
            {displayVideos.length} video{displayVideos.length !== 1 ? 's' : ''} (hiển thị tối đa 6)
            {isSearchMode && ` cho "${searchQuery}"`}
          </Text>
        )}

        {/* Loading State */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#269a56ff" />
            <Text style={styles.loadingText}>
              {isSearchMode ? `Đang tìm kiếm "${searchQuery}"...` : 'Đang tải video...'}
            </Text>
          </View>
        )}

        {/* Videos Grid - 2 rows, 3 columns */}
        {!isLoading && (
          <View style={styles.videosGrid}>
            {displayVideos.map((video, index) => (
              <View key={video.id} style={styles.videoGridItem}>
                <VideoListItem video={video} />
              </View>
            ))}
          </View>
        )}

        {/* Empty State */}
        {!isLoading && displayVideos.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              {isSearchMode ? `Không tìm thấy video nào cho "${searchQuery}"` : 'Không có video nào'}
            </Text>
            <Text style={styles.emptySubtext}>
              {isSearchMode ? 'Thử tìm kiếm với từ khóa khác' : 'Vui lòng thử lại sau'}
            </Text>
          </View>
        )}

        {/* Bottom spacing */}
        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </View>
  );
};

export default VideoCategory;

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
  placeholder: {
    width: 40,
    height: 40
  },

  // Search
  searchContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.white,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2
  },
  searchIcon: {
    fontSize: 16,
    marginRight: spacing.sm
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.light.text
  },
  clearButton: {
    marginLeft: spacing.sm
  },
  clearIcon: {
    fontSize: 14,
    color: '#999'
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: spacing.md
  },
  videoCount: {
    fontSize: 14,
    color: '#666',
    marginVertical: spacing.md,
    fontWeight: '500'
  },

  // Videos Grid
  videosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xs
  },
  videoGridItem: {
    width: '31%', // 3 columns with small gaps
    marginBottom: spacing.md
  },
  videoItemGrid: {
    backgroundColor: palette.white,
    borderRadius: 8,
    padding: spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2
  },
  thumbnailContainerGrid: {
    position: 'relative',
    marginBottom: spacing.xs
  },
  thumbnailGrid: {
    width: '100%',
    height: 60,
    borderRadius: 6
  },
  playButtonGrid: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -8 }, { translateY: -8 }],
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  videoContentGrid: {
    flex: 1
  },
  videoTitleGrid: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.light.text,
    marginBottom: spacing.xs,
    lineHeight: 14
  },
  videoMetaGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  viewsSmall: {
    fontSize: 10,
    color: '#6B7280'
  },
  levelBadgeSmall: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4
  },
  levelTextSmall: {
    fontSize: 8,
    color: palette.white,
    fontWeight: '600'
  },

  // Videos List (keep original for compatibility)
  videosList: {
    marginTop: spacing.sm
  },
  videoItem: {
    flexDirection: 'row',
    backgroundColor: palette.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3
  },
  thumbnailContainer: {
    position: 'relative',
    marginRight: spacing.md
  },
  thumbnail: {
    width: 120,
    height: 80,
    borderRadius: 8
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
    fontSize: 10,
    color: palette.white,
    fontWeight: '600'
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -12 }, { translateY: -12 }],
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  playIcon: {
    fontSize: 10,
    color: '#269a56ff',
    marginLeft: 1
  },

  // Video Content
  videoContent: {
    flex: 1,
    justifyContent: 'space-between'
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.light.text,
    marginBottom: spacing.xs,
    lineHeight: 20
  },
  videoDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: spacing.sm,
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

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingTop: spacing.xxxl
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: spacing.sm
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999'
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