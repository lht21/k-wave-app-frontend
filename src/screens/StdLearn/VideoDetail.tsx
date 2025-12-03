import * as React from 'react';
import { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions,
  Modal,
  Switch,
  Linking
} from 'react-native';
import { WebView } from 'react-native-webview';
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
  const [showFullPlayer, setShowFullPlayer] = useState(false);

  // Handle different video ID formats to match backend data
  const getEmbedVideoId = (id: string): string => {
    // Always return the original video ID - we'll handle embedding issues with parameters
    if (id === 'zsVqNTb4YGg') {
      return 'zsVqNTb4YGg';
    }
    
    // Mapping other fallback video IDs to real YouTube videos
    if (id.includes('kbs-drama') || id.includes('fallback')) {
      const demoVideos: { [key: string]: string } = {
        'kbs-drama-1': 'pKoOlLAnn8w',  // 여신강림 하이라이트
        'kbs-drama-2': 'C2XEefFaLmg',  // 아는 형님 케미
        'kbs-drama-3': 'FPqPDQXAO6g',  // 펜트하우스 명장면
        'kbs-drama-4': 'PZW_XHSEG7E',  // K-POP 게스트 특집
        'kbs-drama-5': 'JrFhE7d_oMk',  // 전통 문화 체험
        'fallback1': 'pKoOlLAnn8w',
        'fallback2': 'C2XEefFaLmg'
      };
      return demoVideos[id] || 'zsVqNTb4YGg';
    }
    
    // For real YouTube video IDs, return as-is
    return id;
  };

  const embedVideoId = getEmbedVideoId(videoId);
  
  // Try different YouTube embed approaches for better compatibility
  const embedUrls = [
    // YouTube nocookie domain (usually less restricted)
    `https://www.youtube-nocookie.com/embed/${embedVideoId}?autoplay=0&rel=0&modestbranding=1&playsinline=1&controls=1`,
    // Standard embed URL without problematic parameters
    `https://www.youtube.com/embed/${embedVideoId}?autoplay=0&rel=0&controls=1&playsinline=1`,
    // Simple embed URL
    `https://www.youtube.com/embed/${embedVideoId}?autoplay=0&controls=1`,
    // Most basic embed
    `https://www.youtube.com/embed/${embedVideoId}`
  ];
  
  // Start with the first URL, we'll add retry logic
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const embedUrl = embedUrls[currentUrlIndex] || embedUrls[0];
  
  // Always use the original requested video for the watch URL
  const watchUrl = `https://www.youtube.com/watch?v=${embedVideoId}`;

  console.log('VideoDetail mounted:', {
    originalVideoId: videoId,
    embedVideoId,
    videoTitle,
    embedUrl,
    watchUrl
  });
  
  // Additional debug logging
  console.log('Video ID check:', {
    isZsVqNTb4YGg: videoId === 'zsVqNTb4YGg',
    videoIdType: typeof videoId,
    videoIdLength: videoId.length
  });

  // Test direct YouTube URL as fallback
  const testDirectUrl = `https://www.youtube.com/watch?v=${embedVideoId}`;
  console.log('Direct URL test:', testDirectUrl);
  
  // Handle WebView errors and try next URL
  const handleWebViewError = () => {
    console.log(`WebView error on URL ${currentUrlIndex + 1}, trying next embed URL...`);
    if (currentUrlIndex < embedUrls.length - 1) {
      setCurrentUrlIndex(currentUrlIndex + 1);
      console.log(`Switching to embed URL ${currentUrlIndex + 2}:`, embedUrls[currentUrlIndex + 1]);
    } else {
      console.log('All embed URLs failed, video cannot be embedded');
    }
  };
  
  // Reset to first URL
  const resetToFirstUrl = () => {
    console.log('Resetting to first embed URL');
    setCurrentUrlIndex(0);
  };

  // Enhanced data for KBS Drama content based on video ID
  const getVideoData = (videoId: string, videoTitle: string) => {
    const baseData = {
      id: videoId,
      title: videoTitle,
      description: 'KBS Drama에서 제공하는 고품질 한국어 학습 콘텐츠입니다. 실제 드라마와 뉴스를 통해 자연스러운 한국어를 배워보세요.',
      duration: '15:42',
      views: '2.1M',
      level: 'intermediate'
    };

    // Customize content based on video type
    if (videoId === 'zsVqNTb4YGg') {
      return {
        ...baseData,
        title: 'KBS 드라마 특별편 - 한국어 학습',
        description: 'KBS에서 제공하는 한국어 학습용 드라마 콘텐츠입니다. 실제 대화와 상황을 통해 자연스러운 한국어를 배워보세요.',
        transcript: [
          { time: '0:05', korean: '안녕하세요, KBS 드라마입니다', vietnamese: 'Xin chào, đây là KBS Drama', pronunciation: 'annyeong haseyo, KBS deurama imnida' },
          { time: '0:20', korean: '오늘은 한국어를 배워봅시다', vietnamese: 'Hôm nay chúng ta hãy học tiếng Hàn', pronunciation: 'oneureun hangugeoreul baewo bopsida' },
          { time: '0:35', korean: '드라마를 통해 재미있게 공부해요', vietnamese: 'Hãy học vui vẻ thông qua phim truyền hình', pronunciation: 'deuramareul tonghae jaemiitge gongbu haeyo' }
        ],
        vocabulary: [
          { word: '드라마', meaning: 'Phim truyền hình, drama', pronunciation: 'deurama', example: 'KBS 드라마를 좋아해요.' },
          { word: '배우다', meaning: 'Học', pronunciation: 'baeuda', example: '한국어를 배워요.' },
          { word: '재미있다', meaning: 'Thú vị, vui', pronunciation: 'jaemi-itda', example: '드라마가 재미있어요.' },
          { word: '공부하다', meaning: 'Học tập', pronunciation: 'gongbu-hada', example: '매일 공부해요.' }
        ]
      };
    } else if (videoId.includes('kbs-drama-1') || videoTitle.includes('여신강림')) {
      return {
        ...baseData,
        transcript: [
          { time: '0:05', korean: '안녕하세요, 여신강림입니다', vietnamese: 'Xin chào, đây là True Beauty', pronunciation: 'annyeong haseyo, yeosin gangrim imnida' },
          { time: '0:15', korean: '오늘은 로맨스 장면을 보겠습니다', vietnamese: 'Hôm nay chúng ta sẽ xem những cảnh lãng mạn', pronunciation: 'oneureun romaenseu jangmyeoneul bogesseumnida' },
          { time: '0:30', korean: '정말 아름다운 사랑이에요', vietnamese: 'Đó thực sự là tình yêu đẹp', pronunciation: 'jeongmal areumdaun sarang ieyo' }
        ],
        vocabulary: [
          { word: '여신', meaning: 'Nữ thần', pronunciation: 'yeosin', example: '그녀는 여신 같아요.' },
          { word: '강림', meaning: 'Giáng sinh, xuống', pronunciation: 'gangrim', example: '여신이 강림했어요.' },
          { word: '로맨스', meaning: 'Lãng mạn', pronunciation: 'romaenseu', example: '로맨스 영화를 좋아해요.' }
        ]
      };
    } else if (videoId.includes('kbs-drama-2') || videoTitle.includes('아는 형님')) {
      return {
        ...baseData,
        transcript: [
          { time: '0:05', korean: '아는 형님에 오신 것을 환영합니다', vietnamese: 'Chào mừng đến với Knowing Bros', pronunciation: 'aneun hyeongnim e osin geoseul hwanyeong hamnida' },
          { time: '0:15', korean: '오늘 게스트는 정말 특별해요', vietnamese: 'Khách mời hôm nay thực sự đặc biệt', pronunciation: 'oneul geseuteuneun jeongmal teukbyeol haeyo' }
        ],
        vocabulary: [
          { word: '형님', meaning: 'Anh/chị (tôn trọng)', pronunciation: 'hyeongnim', example: '아는 형님이 유명해요.' },
          { word: '게스트', meaning: 'Khách mời', pronunciation: 'geseuteu', example: '오늘 게스트는 누구예요?' }
        ]
      };
    } else {
      return {
        ...baseData,
        transcript: [
          { time: '0:05', korean: '안녕하세요, KBS 드라마입니다', vietnamese: 'Xin chào, đây là KBS Drama', pronunciation: 'annyeong haseyo, KBS deurama imnida' },
          { time: '0:15', korean: '오늘은 특별한 이야기를 들려드릴게요', vietnamese: 'Hôm nay chúng tôi sẽ kể cho bạn một câu chuyện đặc biệt', pronunciation: 'oneureun teukbyeolhan iyagireul deullyeo deurilgeyo' },
          { time: '0:30', korean: '한국의 아름다운 문화를 함께 알아봐요', vietnamese: 'Hãy cùng tìm hiểu về văn hóa tươi đẹp của Hàn Quốc', pronunciation: 'hangugeui areumdaun munhwareul hamkke arabwayo' }
        ],
        vocabulary: [
          { word: '드라마', meaning: 'Drama', pronunciation: 'deurama', example: 'KBS 드라마를 좋아해요.' },
          { word: '특별한', meaning: 'Đặc biệt', pronunciation: 'teukbyeolhan', example: '오늘은 특별한 날이에요.' },
          { word: '문화', meaning: 'Văn hóa', pronunciation: 'munhwa', example: '한국 문화에 관심이 있어요.' },
          { word: '이야기', meaning: 'Câu chuyện', pronunciation: 'iyagi', example: '재미있는 이야기를 들었어요.' }
        ]
      };
    }
  };

  const videoData = {
    ...getVideoData(videoId, videoTitle),
    grammar: [
      {
        pattern: '-을게요/-ㄹ게요',
        meaning: 'Tôi sẽ làm gì đó (hứa hẹn, ý định)',
        example: '들려드릴게요 = tôi sẽ kể cho bạn nghe',
        usage: 'Dùng khi muốn thể hiện ý định hoặc hứa hẹn làm gì đó cho người khác'
      },
      {
        pattern: '함께',
        meaning: 'Cùng nhau',
        example: '함께 알아봐요 = cùng tìm hiểu nào',
        usage: 'Dùng để thể hiện việc làm cùng với ai đó'
      }
    ]
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleFullScreen = () => {
    setShowFullPlayer(true);
  };

  const handleOpenYouTube = async () => {
    try {
      await Linking.openURL(watchUrl);
    } catch (error) {
      console.error('Error opening YouTube:', error);
    }
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
          <WebView
            key={`webview-${currentUrlIndex}-${embedVideoId}`}
            source={{ uri: embedUrl }}
            style={styles.webView}
            allowsFullscreenVideo={true}
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            scalesPageToFit={false}
            allowsInlineMediaPlayback={true}
            allowsBackForwardNavigationGestures={false}
            bounces={false}
            scrollEnabled={false}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            cacheEnabled={false}
            thirdPartyCookiesEnabled={true}
            sharedCookiesEnabled={true}
            incognito={false}
            mixedContentMode={'always'}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.error('WebView error:', nativeEvent);
              console.error('Error code:', nativeEvent.code);
              if (nativeEvent.code === -1003 || nativeEvent.code === 153) {
                console.log('Configuration error 153 detected, trying next embed URL');
                handleWebViewError();
              } else {
                handleWebViewError();
              }
            }}
            onHttpError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.error('HTTP error:', nativeEvent.statusCode, nativeEvent.description);
              if (nativeEvent.statusCode === 403 || nativeEvent.statusCode === 404) {
                console.log('HTTP error detected, trying next embed URL');
                handleWebViewError();
              }
            }}
            onLoadStart={() => console.log('WebView loading started:', embedUrl)}
            onLoad={() => console.log('WebView loaded successfully:', embedUrl)}
            onLoadEnd={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.log('WebView loading ended:', nativeEvent.url);
              if (nativeEvent.title && nativeEvent.title.includes('Error')) {
                console.log('Error detected in page title, trying next URL');
                handleWebViewError();
              }
            }}
            userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1"
          />
        </View>
        <View style={styles.videoControls}>
          <TouchableOpacity onPress={handleFullScreen} style={styles.controlButton}>
            <Text style={styles.controlText}>⛶ Toàn màn hình</Text>
          </TouchableOpacity>
          {currentUrlIndex < embedUrls.length - 1 ? (
            <TouchableOpacity onPress={handleWebViewError} style={[styles.controlButton, {backgroundColor: '#FFC107'}]}>
              <Text style={styles.controlText}>🔄 Thử URL {currentUrlIndex + 2}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={resetToFirstUrl} style={[styles.controlButton, {backgroundColor: '#28a745'}]}>
              <Text style={styles.controlText}>🔄 Reset</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.videoDuration}>{videoData.duration}</Text>
          <TouchableOpacity onPress={handleOpenYouTube} style={styles.controlButton}>
            <Text style={styles.controlText}>📺 Mở YouTube</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Video Info */}
      <View style={styles.videoInfo}>
        <Text style={styles.videoTitle}>{videoData.title}</Text>
        <Text style={styles.videoDescription}>{videoData.description}</Text>
        {currentUrlIndex >= 0 && (
          <View style={styles.fallbackNotice}>
            <Text style={styles.fallbackNoticeText}>
              📹 Đang phát từ: {currentUrlIndex === 0 ? 'YouTube-nocookie' : currentUrlIndex === 1 ? 'YouTube Standard' : currentUrlIndex === 2 ? 'YouTube Simple' : 'YouTube Basic'} (URL {currentUrlIndex + 1}/{embedUrls.length})
            </Text>
          </View>
        )}
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

      {/* Full Screen Video Modal */}
      <Modal
        visible={showFullPlayer}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowFullPlayer(false)}
      >
        <View style={styles.fullScreenContainer}>
          <View style={styles.fullScreenHeader}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowFullPlayer(false)}
            >
              <Text style={styles.closeButtonText}>✕ Đóng</Text>
            </TouchableOpacity>
          </View>
          <WebView
            source={{ uri: `${embedUrl}&autoplay=1` }}
            style={styles.fullScreenWebView}
            allowsFullscreenVideo={true}
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            allowsInlineMediaPlayback={true}
            scalesPageToFit={false}
            bounces={false}
            scrollEnabled={false}
            cacheEnabled={false}
            thirdPartyCookiesEnabled={true}
            sharedCookiesEnabled={true}
            mixedContentMode={'always'}
            userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1"
          />
        </View>
      </Modal>
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
    height: 220,
    backgroundColor: '#1a1a1a'
  },
  webView: {
    flex: 1,
    backgroundColor: '#000'
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
  controlButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.2)'
  },
  controlText: {
    fontSize: 12,
    color: palette.white,
    fontWeight: '600'
  },
  videoDuration: {
    fontSize: 14,
    color: palette.white,
    fontWeight: '600'
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
  fallbackNotice: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FFC107'
  },
  fallbackNoticeText: {
    fontSize: 12,
    color: '#856404',
    lineHeight: 16
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
  },

  // Full Screen Modal
  fullScreenContainer: {
    flex: 1,
    backgroundColor: '#000'
  },
  fullScreenHeader: {
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.8)'
  },
  closeButton: {
    alignSelf: 'flex-end',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.2)'
  },
  closeButtonText: {
    fontSize: 14,
    color: palette.white,
    fontWeight: '600'
  },
  fullScreenWebView: {
    flex: 1
  }
});

export default VideoDetail;