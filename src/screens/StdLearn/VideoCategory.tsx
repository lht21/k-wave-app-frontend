import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  TextInput 
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { spacing } from '../../theme/spacing';
import { colors, palette } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { RootStackParamList } from '../../types/navigation';

type VideoCategoryNavigationProp = StackNavigationProp<RootStackParamList>;
type VideoCategoryRouteProp = RouteProp<RootStackParamList, 'VideoCategory'>;

const VideoCategory: React.FC = () => {
  const navigation = useNavigation<VideoCategoryNavigationProp>();
  const route = useRoute<VideoCategoryRouteProp>();
  const { categoryId, categoryTitle } = route.params;
  
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data cho tất cả video trong danh mục
  const allVideos = [
    {
      id: 'v1',
      title: 'Things You Don\'t Want to on a Holiday',
      thumbnail: 'https://via.placeholder.com/120x80',
      duration: '10:05',
      views: '2567',
      level: 'beginner',
      description: 'Học các từ vựng và cụm từ phổ biến khi đi du lịch'
    },
    {
      id: 'v2',
      title: 'Korean Daily Conversation',
      thumbnail: 'https://via.placeholder.com/120x80',
      duration: '08:30',
      views: '1845',
      level: 'intermediate',
      description: 'Những cuộc hội thoại thông dụng trong cuộc sống hàng ngày'
    },
    {
      id: 'v3',
      title: 'Learning Korean Grammar',
      thumbnail: 'https://via.placeholder.com/120x80',
      duration: '12:15',
      views: '3201',
      level: 'advanced',
      description: 'Ngữ pháp tiếng Hàn cơ bản và nâng cao'
    },
    {
      id: 'v4',
      title: 'Korean Culture Introduction',
      thumbnail: 'https://via.placeholder.com/120x80',
      duration: '15:42',
      views: '2890',
      level: 'beginner',
      description: 'Giới thiệu về văn hóa và truyền thống Hàn Quốc'
    },
    {
      id: 'v5',
      title: 'K-pop Vocabulary',
      thumbnail: 'https://via.placeholder.com/120x80',
      duration: '09:20',
      views: '5432',
      level: 'beginner',
      description: 'Từ vựng thường gặp trong các bài hát K-pop'
    },
    {
      id: 'v6',
      title: 'Korean Food Names',
      thumbnail: 'https://via.placeholder.com/120x80',
      duration: '07:15',
      views: '4321',
      level: 'beginner',
      description: 'Tên gọi các món ăn Hàn Quốc phổ biến'
    }
  ];

  const filteredVideos = allVideos.filter(video =>
    video.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleVideoPress = (video: any) => {
    navigation.navigate('VideoDetail', {
      videoId: video.id,
      videoTitle: video.title
    });
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return '#4CAF50';
      case 'intermediate': return '#FF9800';
      case 'advanced': return '#F44336';
      default: return '#6B7280';
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case 'beginner': return 'Cơ bản';
      case 'intermediate': return 'Trung bình';
      case 'advanced': return 'Nâng cao';
      default: return 'Trung bình';
    }
  };

  const VideoListItem = ({ video }: { video: any }) => (
    <TouchableOpacity 
      style={styles.videoItem}
      onPress={() => handleVideoPress(video)}
    >
      <View style={styles.thumbnailContainer}>
        <Image 
          source={{ uri: video.thumbnail }} 
          style={styles.thumbnail}
          resizeMode="cover"
        />
        <View style={styles.durationBadge}>
          <Text style={styles.durationText}>{video.duration}</Text>
        </View>
        <View style={styles.playButton}>
          <Text style={styles.playIcon}>▶</Text>
        </View>
      </View>
      
      <View style={styles.videoContent}>
        <Text style={styles.videoTitle} numberOfLines={2}>
          {video.title}
        </Text>
        <Text style={styles.videoDescription} numberOfLines={2}>
          {video.description}
        </Text>
        <View style={styles.videoMeta}>
          <Text style={styles.views}>👁 {video.views}</Text>
          <View style={[styles.levelBadge, { backgroundColor: getLevelColor(video.level) }]}>
            <Text style={styles.levelText}>{getLevelText(video.level)}</Text>
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
              onPress={() => setSearchQuery('')}
            >
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Video Count */}
        <Text style={styles.videoCount}>
          {filteredVideos.length} video{filteredVideos.length !== 1 ? 's' : ''}
        </Text>

        {/* Videos List */}
        <View style={styles.videosList}>
          {filteredVideos.map((video) => (
            <VideoListItem key={video.id} video={video} />
          ))}
        </View>

        {/* Empty State */}
        {filteredVideos.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Không tìm thấy video nào</Text>
            <Text style={styles.emptySubtext}>Thử tìm kiếm với từ khóa khác</Text>
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

  // Videos List
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
  }
});