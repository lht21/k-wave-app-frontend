import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions,
  Modal,
  Switch
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { spacing } from '../../theme/spacing';
import { colors, palette } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { RootStackParamList } from '../../types/navigation';

type VideoDetailNavigationProp = StackNavigationProp<RootStackParamList>;
type VideoDetailRouteProp = RouteProp<RootStackParamList, 'VideoDetail'>;

const { width, height } = Dimensions.get('window');

const VideoDetail: React.FC = () => {
  const navigation = useNavigation<VideoDetailNavigationProp>();
  const route = useRoute<VideoDetailRouteProp>();
  const { videoId, videoTitle } = route.params;
  
  const [selectedTab, setSelectedTab] = useState<'listening' | 'vocabulary' | 'grammar' | 'settings'>('listening');
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [subtitleLanguage, setSubtitleLanguage] = useState<'korean' | 'vietnamese' | 'both'>('both');
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);

  // Mock data cho video
  const videoData = {
    id: videoId,
    title: videoTitle,
    description: 'Video này giúp bạn học các cụm từ và từ vựng thông dụng khi đi du lịch. Rất hữu ích cho việc giao tiếp trong các tình huống thực tế.',
    duration: '10:05',
    views: '2567',
    level: 'beginner',
    transcript: [
      { time: '0:05', korean: '안녕하세요', vietnamese: 'Xin chào', pronunciation: 'annyeong haseyo' },
      { time: '0:10', korean: '저는 한국어를 배우고 있어요', vietnamese: 'Tôi đang học tiếng Hàn', pronunciation: 'jeoneun hangugeoreul baeugo isseoyo' },
      { time: '0:20', korean: '오늘은 날씨가 좋네요', vietnamese: 'Hôm nay thời tiết đẹp nhỉ', pronunciation: 'oneureun nalssiga jonneyo' }
    ],
    vocabulary: [
      { word: '안녕하세요', meaning: 'Xin chào', pronunciation: 'annyeong haseyo', example: '안녕하세요? 처음 뵙겠습니다.' },
      { word: '배우다', meaning: 'Học', pronunciation: 'baeuda', example: '한국어를 배우고 있어요.' },
      { word: '날씨', meaning: 'Thời tiết', pronunciation: 'nalssi', example: '오늘 날씨가 어때요?' }
    ],
    grammar: [
      {
        pattern: '-고 있다',
        meaning: 'Đang làm gì đó (thì hiện tại tiếp diễn)',
        example: '배우고 있어요 = đang học',
        usage: 'Dùng để diễn tả hành động đang diễn ra'
      },
      {
        pattern: '-네요',
        meaning: 'Cảm thán, nhận xét',
        example: '좋네요 = hay nhỉ, tốt nhỉ',
        usage: 'Dùng khi nhận xét về điều gì đó'
      }
    ]
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const TabButton = ({ 
    tab, 
    title, 
    icon 
  }: { 
    tab: 'listening' | 'vocabulary' | 'grammar' | 'settings', 
    title: string, 
    icon: string 
  }) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        selectedTab === tab && styles.activeTab
      ]}
      onPress={() => setSelectedTab(tab)}
    >
      <Text style={styles.tabIcon}>{icon}</Text>
      <Text style={[
        styles.tabText,
        selectedTab === tab && styles.activeTabText
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderContent = () => {
    switch (selectedTab) {
      case 'listening':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.sectionTitle}>Luyện nghe</Text>
            <Text style={styles.sectionSubtitle}>
              Nghe và đọc theo phụ đề để cải thiện kỹ năng nghe
            </Text>
            
            {videoData.transcript.map((item, index) => (
              <View key={index} style={styles.transcriptItem}>
                <Text style={styles.timestamp}>{item.time}</Text>
                <View style={styles.transcriptContent}>
                  {(subtitleLanguage === 'korean' || subtitleLanguage === 'both') && (
                    <Text style={styles.koreanText}>{item.korean}</Text>
                  )}
                  <Text style={styles.pronunciationText}>{item.pronunciation}</Text>
                  {(subtitleLanguage === 'vietnamese' || subtitleLanguage === 'both') && (
                    <Text style={styles.vietnameseText}>{item.vietnamese}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        );

      case 'vocabulary':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.sectionTitle}>Từ vựng</Text>
            <Text style={styles.sectionSubtitle}>
              Các từ vựng quan trọng trong video
            </Text>
            
            {videoData.vocabulary.map((item, index) => (
              <View key={index} style={styles.vocabularyItem}>
                <View style={styles.vocabularyHeader}>
                  <Text style={styles.vocabularyWord}>{item.word}</Text>
                  <TouchableOpacity style={styles.speakerButton}>
                    <Text style={styles.speakerIcon}>🔊</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.pronunciation}>[{item.pronunciation}]</Text>
                <Text style={styles.meaning}>{item.meaning}</Text>
                <Text style={styles.example}>
                  <Text style={styles.exampleLabel}>Ví dụ: </Text>
                  {item.example}
                </Text>
              </View>
            ))}
          </View>
        );

      case 'grammar':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.sectionTitle}>Ngữ pháp</Text>
            <Text style={styles.sectionSubtitle}>
              Cấu trúc ngữ pháp xuất hiện trong video
            </Text>
            
            {videoData.grammar.map((item, index) => (
              <View key={index} style={styles.grammarItem}>
                <Text style={styles.grammarPattern}>{item.pattern}</Text>
                <Text style={styles.grammarMeaning}>{item.meaning}</Text>
                <Text style={styles.grammarExample}>
                  <Text style={styles.exampleLabel}>Ví dụ: </Text>
                  {item.example}
                </Text>
                <Text style={styles.grammarUsage}>{item.usage}</Text>
              </View>
            ))}
          </View>
        );

      case 'settings':
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.sectionTitle}>Cài đặt</Text>
            
            {/* Subtitle Settings */}
            <View style={styles.settingSection}>
              <Text style={styles.settingTitle}>Hiển thị phụ đề</Text>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Hiển thị Hàn</Text>
                <Switch
                  value={showSubtitles}
                  onValueChange={setShowSubtitles}
                  trackColor={{ false: '#E5E7EB', true: '#269a56ff' }}
                  thumbColor={showSubtitles ? palette.white : '#F3F4F6'}
                />
              </View>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Hiển thị Việt</Text>
                <Switch
                  value={showSubtitles}
                  onValueChange={setShowSubtitles}
                  trackColor={{ false: '#E5E7EB', true: '#269a56ff' }}
                  thumbColor={showSubtitles ? palette.white : '#F3F4F6'}
                />
              </View>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Năng cấp</Text>
                <Switch
                  value={showSubtitles}
                  onValueChange={setShowSubtitles}
                  trackColor={{ false: '#E5E7EB', true: '#269a56ff' }}
                  thumbColor={showSubtitles ? palette.white : '#F3F4F6'}
                />
              </View>
            </View>

            {/* Playback Speed */}
            <View style={styles.settingSection}>
              <Text style={styles.settingTitle}>Tốc độ phát</Text>
              <View style={styles.speedButtons}>
                {[0.5, 0.75, 1.0, 1.25, 1.5].map((speed) => (
                  <TouchableOpacity
                    key={speed}
                    style={[
                      styles.speedButton,
                      playbackSpeed === speed && styles.activeSpeedButton
                    ]}
                    onPress={() => setPlaybackSpeed(speed)}
                  >
                    <Text style={[
                      styles.speedButtonText,
                      playbackSpeed === speed && styles.activeSpeedButtonText
                    ]}>
                      {speed}x
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

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
        <Text style={styles.headerTitle} numberOfLines={1}>{videoTitle}</Text>
        <TouchableOpacity style={styles.favoriteButton}>
          <Text style={styles.favoriteIcon}>🤍</Text>
        </TouchableOpacity>
      </View>

      {/* Video Player */}
      <View style={styles.videoContainer}>
        <View style={styles.videoPlayer}>
          <TouchableOpacity 
            style={styles.playButton}
            onPress={handlePlayPause}
          >
            <Text style={styles.playIcon}>
              {isPlaying ? '⏸' : '▶'}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.videoControls}>
          <Text style={styles.videoDuration}>0:00 / {videoData.duration}</Text>
          <Text style={styles.videoViews}>👁 {videoData.views}</Text>
        </View>
      </View>

      {/* Video Info */}
      <View style={styles.videoInfo}>
        <Text style={styles.videoTitle}>{videoData.title}</Text>
        <Text style={styles.videoDescription}>{videoData.description}</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TabButton tab="listening" title="Luyện nghe" icon="👂" />
        <TabButton tab="vocabulary" title="Từ vựng" icon="📝" />
        <TabButton tab="grammar" title="Ngữ pháp" icon="📚" />
        <TabButton tab="settings" title="Cài đặt" icon="⚙️" />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderContent()}
        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </View>
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
    fontSize: 16,
    fontWeight: '700',
    color: palette.white,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: spacing.md
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  favoriteIcon: {
    fontSize: 20
  },

  // Video Player
  videoContainer: {
    backgroundColor: '#000',
    marginTop: spacing.md,
    marginHorizontal: spacing.md,
    borderRadius: 12,
    overflow: 'hidden'
  },
  videoPlayer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a'
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  playIcon: {
    fontSize: 24,
    color: '#269a56ff',
    marginLeft: 2
  },
  videoControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.8)'
  },
  videoDuration: {
    fontSize: 14,
    color: palette.white,
    fontWeight: '600'
  },
  videoViews: {
    fontSize: 14,
    color: palette.white
  },

  // Video Info
  videoInfo: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: palette.white,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    borderRadius: 12
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.light.text,
    marginBottom: spacing.sm
  },
  videoDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20
  },

  // Tab Container
  tabContainer: {
    flexDirection: 'row',
    marginTop: spacing.md,
    marginHorizontal: spacing.md,
    backgroundColor: palette.white,
    borderRadius: 12,
    padding: spacing.xs
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: 8
  },
  activeTab: {
    backgroundColor: '#269a56ff'
  },
  tabIcon: {
    fontSize: 16,
    marginBottom: spacing.xs
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666'
  },
  activeTabText: {
    color: palette.white
  },

  // Content
  content: {
    flex: 1,
    marginTop: spacing.md
  },
  contentContainer: {
    paddingHorizontal: spacing.md
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.light.text,
    marginBottom: spacing.xs
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: spacing.lg
  },

  // Transcript
  transcriptItem: {
    flexDirection: 'row',
    backgroundColor: palette.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm
  },
  timestamp: {
    fontSize: 12,
    color: '#269a56ff',
    fontWeight: '600',
    marginRight: spacing.md,
    minWidth: 40
  },
  transcriptContent: {
    flex: 1
  },
  koreanText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.light.text,
    marginBottom: spacing.xs
  },
  pronunciationText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: spacing.xs
  },
  vietnameseText: {
    fontSize: 14,
    color: '#269a56ff'
  },

  // Vocabulary
  vocabularyItem: {
    backgroundColor: palette.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm
  },
  vocabularyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs
  },
  vocabularyWord: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.light.text
  },
  speakerButton: {
    padding: spacing.xs
  },
  speakerIcon: {
    fontSize: 16
  },
  pronunciation: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: spacing.xs
  },
  meaning: {
    fontSize: 16,
    color: '#269a56ff',
    fontWeight: '600',
    marginBottom: spacing.sm
  },
  example: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18
  },
  exampleLabel: {
    fontWeight: '600'
  },

  // Grammar
  grammarItem: {
    backgroundColor: palette.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm
  },
  grammarPattern: {
    fontSize: 20,
    fontWeight: '700',
    color: '#269a56ff',
    marginBottom: spacing.xs
  },
  grammarMeaning: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.light.text,
    marginBottom: spacing.sm
  },
  grammarExample: {
    fontSize: 14,
    color: '#666',
    marginBottom: spacing.sm,
    lineHeight: 18
  },
  grammarUsage: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    lineHeight: 18
  },

  // Settings
  settingSection: {
    backgroundColor: palette.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.light.text,
    marginBottom: spacing.md
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md
  },
  settingLabel: {
    fontSize: 14,
    color: colors.light.text
  },
  speedButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  speedButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  activeSpeedButton: {
    backgroundColor: '#269a56ff',
    borderColor: '#269a56ff'
  },
  speedButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600'
  },
  activeSpeedButtonText: {
    color: palette.white
  }
});

export default VideoDetail;