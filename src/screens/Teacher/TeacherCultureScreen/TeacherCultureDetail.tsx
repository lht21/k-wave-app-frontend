import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  StarIcon,
  ViewIcon,
  Delete02Icon,
  TagIcon,
  Clock01Icon,
  BookOpen01Icon,
  FavouriteIcon,
} from '@hugeicons/core-free-icons';

import Button from '../../../components/Button/Button';
import { colors, palette } from '../../../theme/colors';
import { typography } from '../../../theme/typography';

// --- TYPES ---
type CultureCategory = 
  | 'Tất cả' 
  | 'Âm nhạc' 
  | 'Ẩm thực' 
  | 'Du lịch' 
  | 'Điện ảnh' 
  | 'Gia đình & Xã hội' 
  | 'Làm đẹp' 
  | 'Lễ hội' 
  | 'Lịch sử' 
  | 'Trang phục' 
  | 'Trường học' 
  | 'Uống rượu' 
  | 'Ứng xử';

interface CultureContent {
  type: 'text' | 'image';
  content?: string;
  url?: any;
  caption?: string;
}

interface Vocabulary {
  word: string;
  meaning: string;
  pronunciation: string;
}

interface CultureDetail {
  id: number;
  title: string;
  subtitle: string;
  category: CultureCategory;
  isPremium: boolean;
  views: number;
  likes: number;
  isFavorite: boolean; // Thêm trường yêu thích
  image: any;
  icon: string;
  content: CultureContent[];
  vocabulary?: Vocabulary[];
  level?: string;
  duration?: number;
}

type TeacherStackParamList = {
  TeacherCultureScreen: undefined;
  TeacherCultureDetail: { cultureId: number };
};

// --- MOCK DATA ---
const mockCultureData: Record<number, CultureDetail> = {
  1: {
    id: 1, 
    title: 'Văn hóa Sunbae-Hoobae', 
    subtitle: 'Mối quan hệ tiền bối - hậu bối trong xã hội Hàn Quốc',
    category: 'Ứng xử',
    isPremium: false,
    views: 1250,
    likes: 89,
    isFavorite: true, // Thêm trạng thái yêu thích
    image: require('../../../assets/culture/th2.png'),
    icon: '/flower.png',
    level: 'Sơ cấp',
    duration: 15,
    content: [
      {
        type: 'text',
        content: 'Ở Hàn Quốc có một văn hóa rất đặc trưng gọi là sunbae-hoobae (선배-후배). Sunbae có nghĩa là "tiền bối" – tức là những anh chị đi trước, có nhiều kinh nghiệm hơn. Hoobae là "hậu bối" – những người mới hơn, nhỏ tuổi hơn hoặc ít thâm niên hơn.'
      },
      {
        type: 'image',
        url: require('../../../assets/culture/ux1.png'),
        caption: 'Minh họa mối quan hệ Sunbae-Hoobae'
      },
      {
        type: 'text',
        content: 'Văn hóa này thể hiện rõ trong môi trường học đường, công sở và cả trong ngành giải trí. Sunbae có trách nhiệm hướng dẫn, giúp đỡ hoobae, trong khi hoobae phải thể hiện sự tôn trọng với sunbae.'
      }
    ],
    vocabulary: [
      { word: '선배', meaning: 'Tiền bối', pronunciation: 'seon-bae' },
      { word: '후배', meaning: 'Hậu bối', pronunciation: 'hu-bae' },
      { word: '존댓말', meaning: 'Kính ngữ', pronunciation: 'jon-daen-mal' }
    ]
  },
  2: {
    id: 2, 
    title: 'Nghệ thuật Kimchi', 
    subtitle: 'Lịch sử và quy trình làm kimchi truyền thống',
    category: 'Ẩm thực',
    isPremium: false,
    views: 980,
    likes: 76,
    isFavorite: false, // Thêm trạng thái yêu thích
    image: require('../../../assets/culture/at3.png'),
    icon: '/flower.png',
    level: 'Trung cấp',
    duration: 20,
    content: [
      {
        type: 'text',
        content: 'Kimchi là món ăn truyền thống không thể thiếu trong ẩm thực Hàn Quốc, với lịch sử hơn 3,000 năm. Món ăn này không chỉ là thực phẩm mà còn là biểu tượng văn hóa của Hàn Quốc.'
      },
      {
        type: 'image',
        url: require('../../../assets/culture/at3.png'),
        caption: 'Kimchi truyền thống Hàn Quốc'
      }
    ],
    vocabulary: [
      { word: '김치', meaning: 'Kimchi', pronunciation: 'gim-chi' },
      { word: '배추', meaning: 'Bắp cải', pronunciation: 'bae-chu' }
    ]
  }
};

const TeacherCultureDetail: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<TeacherStackParamList>>();
  const route = useRoute();
  const { cultureId } = route.params as { cultureId: number };
  
  const [culture, setCulture] = useState<CultureDetail | null>(null);

  useEffect(() => {
    const cultureDetail = mockCultureData[cultureId];
    
    if (cultureDetail) {
      setCulture(cultureDetail);
    } else {
      Alert.alert('Xin lỗi', 'Hiện tại bài này đang không có sẵn. Xin vui lòng thử lại sau.');
      navigation.goBack();
    }
  }, [cultureId, navigation]);

  // --- HANDLERS ---
  const handleTogglePremium = () => {
    if (!culture) return;
    
    const action = culture.isPremium ? 'bỏ đánh dấu Premium' : 'đánh dấu làm Premium';
    
    Alert.alert(
      'Xác nhận',
      `Bạn có muốn ${action} cho bài văn hóa này?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: () => {
            setCulture(prev => prev ? { ...prev, isPremium: !prev.isPremium } : null);
            Alert.alert('Thành công', `Đã ${action} thành công!`);
          }
        }
      ]
    );
  };

  const handleToggleFavorite = () => {
    if (!culture) return;
    
    const action = culture.isFavorite ? 'bỏ yêu thích' : 'thêm vào yêu thích';
    
    Alert.alert(
      'Xác nhận',
      `Bạn có muốn ${action} bài văn hóa này?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: () => {
            setCulture(prev => prev ? { 
              ...prev, 
              isFavorite: !prev.isFavorite,
              likes: prev.isFavorite ? prev.likes - 1 : prev.likes + 1 // Cập nhật số lượt thích
            } : null);
            Alert.alert('Thành công', `Đã ${action} thành công!`);
          }
        }
      ]
    );
  };

  const handleDeleteCulture = () => {
    Alert.alert('Xác nhận', 'Bạn có chắc chắn muốn xóa bài văn hóa này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: () => {
          Alert.alert('Thành công', 'Xóa bài văn hóa thành công!');
          navigation.navigate('TeacherCultureScreen');
        }
      }
    ]);
  };

  const handleEdit = () => {
    Alert.alert('Thông báo', 'Chức năng chỉnh sửa đang được phát triển');
  };

  // --- RENDER HELPERS ---
  const renderContent = (content: CultureContent[]) => {
    return content.map((item, index) => {
      switch (item.type) {
        case 'text':
          return (
            <View key={index} style={styles.contentTextContainer}>
              <Text style={styles.contentText}>{item.content}</Text>
            </View>
          );
        case 'image':
          return (
            <View key={index} style={styles.contentImageContainer}>
              <Image 
                source={item.url} 
                style={styles.contentImage}
                resizeMode="cover"
              />
              {item.caption && (
                <Text style={styles.imageCaption}>{item.caption}</Text>
              )}
            </View>
          );
        default:
          return null;
      }
    });
  };

  const renderVocabulary = (vocabulary: Vocabulary[] = []) => {
    return (
      <View style={styles.vocabularySection}>
        <Text style={styles.sectionTitle}>Từ vựng liên quan</Text>
        <View style={styles.vocabularyGrid}>
          {vocabulary.map((vocab, index) => (
            <View key={index} style={styles.vocabularyCard}>
              <View style={styles.vocabHeader}>
                <Text style={styles.vocabWord}>{vocab.word}</Text>
                <Text style={styles.vocabPronunciation}>{vocab.pronunciation}</Text>
              </View>
              <Text style={styles.vocabMeaning}>{vocab.meaning}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  if (!culture) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Đang tải bài văn hóa...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Main Image */}
        <View style={styles.mainImageContainer}>
          <Image 
            source={culture.image} 
            style={styles.mainImage}
            resizeMode="cover"
          />
          {culture.isPremium && (
            <View style={styles.premiumOverlayBadge}>
              <HugeiconsIcon icon={StarIcon} size={16} color={palette.warning} variant="solid" />
              <Text style={styles.premiumOverlayText}>Premium</Text>
            </View>
          )}
        </View>

        {/* Basic Info */}
        <View style={styles.basicInfo}>
          <View style={styles.titleSection}>
            <View style={styles.iconContainer}>
              <Text style={styles.iconText}>🌸</Text>
            </View>
            <View style={styles.titleTextContainer}>
              <Text style={styles.cultureTitle}>{culture.title}</Text>
              <Text style={styles.cultureSubtitle}>{culture.subtitle}</Text>
            </View>
          </View>

          <View style={styles.metaInfo}>
            <View style={styles.metaItem}>
              <HugeiconsIcon icon={TagIcon} size={16} color={colors.light.textSecondary} />
              <Text style={styles.metaText}>{culture.category}</Text>
            </View>
            {culture.level && (
              <View style={styles.metaItem}>
                <HugeiconsIcon icon={BookOpen01Icon} size={16} color={colors.light.textSecondary} />
                <Text style={styles.metaText}>{culture.level}</Text>
              </View>
            )}
            {culture.duration && (
              <View style={styles.metaItem}>
                <HugeiconsIcon icon={Clock01Icon} size={16} color={colors.light.textSecondary} />
                <Text style={styles.metaText}>{culture.duration} phút</Text>
              </View>
            )}
            <View style={styles.metaItem}>
              <HugeiconsIcon icon={ViewIcon} size={16} color={colors.light.textSecondary} />
              <Text style={styles.metaText}>{culture.views} lượt xem</Text>
            </View>
            <View style={styles.metaItem}>
              <HugeiconsIcon icon={StarIcon} size={16} color={colors.light.textSecondary} />
              <Text style={styles.metaText}>{culture.likes} lượt thích</Text>
            </View>
            {/* Nút Yêu Thích */}
            <TouchableOpacity 
              style={[
                styles.metaItem,
                styles.favoriteButton,
                culture.isFavorite && styles.favoriteButtonActive
              ]}
              onPress={handleToggleFavorite}
            >
              <HugeiconsIcon 
                icon={FavouriteIcon} 
                size={16} 
                color={culture.isFavorite ? palette.error : colors.light.textSecondary}
                variant={culture.isFavorite ? "solid" : "stroke"}
              />
              <Text style={[
                styles.metaText,
                culture.isFavorite && styles.favoriteTextActive
              ]}>
                {culture.isFavorite ? 'Đã yêu thích' : 'Yêu thích'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        <View style={styles.contentSection}>
          {renderContent(culture.content)}
        </View>

        {/* Vocabulary */}
        {culture.vocabulary && culture.vocabulary.length > 0 && renderVocabulary(culture.vocabulary)}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.light.background,
  },
  loadingText: {
    fontSize: typography.fontSizes.md,
    color: colors.light.textSecondary,
  },
  
  // Scroll Content
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },

  // Main Image
  mainImageContainer: {
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: 250,
  },
  premiumOverlayBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: palette.warning + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.warning + '40',
  },
  premiumOverlayText: {
    fontSize: 12,
    color: palette.warning,
    fontFamily: typography.fonts.bold,
  },

  // Basic Info
  basicInfo: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    marginBottom: 20,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: colors.light.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 28,
  },
  titleTextContainer: {
    flex: 1,
  },
  cultureTitle: {
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fonts.bold,
    color: colors.light.text,
    marginBottom: 8,
    lineHeight: 32,
  },
  cultureSubtitle: {
    fontSize: typography.fontSizes.md,
    color: colors.light.textSecondary,
    fontFamily: typography.fonts.regular,
    lineHeight: 24,
  },
  metaInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.light.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  favoriteButton: {
    borderColor: colors.light.border,
  },
  favoriteButtonActive: {
    backgroundColor: palette.error + '15',
    borderColor: palette.error + '40',
  },
  metaText: {
    fontSize: typography.fontSizes.sm,
    color: colors.light.textSecondary,
    fontFamily: typography.fonts.regular,
  },
  favoriteTextActive: {
    color: palette.error,
    fontFamily: typography.fonts.regular,
  },

  // Content Sections
  contentSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.md,
    fontFamily: typography.fonts.bold,
    color: colors.light.text,
    marginBottom: 20,
  },
  contentTextContainer: {
    marginBottom: 20,
  },
  contentText: {
    fontSize: typography.fontSizes.md,
    color: colors.light.text,
    fontFamily: typography.fonts.regular,
    lineHeight: 26,
  },
  contentImageContainer: {
    marginBottom: 20,
  },
  contentImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 8,
  },
  imageCaption: {
    fontSize: typography.fontSizes.sm,
    color: colors.light.textSecondary,
    fontFamily: typography.fonts.regular,
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Vocabulary
  vocabularySection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  vocabularyGrid: {
    gap: 12,
  },
  vocabularyCard: {
    backgroundColor: colors.light.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.light.border,
    shadowColor: colors.light.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  vocabHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  vocabWord: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fonts.bold,
    color: colors.light.text,
  },
  vocabPronunciation: {
    fontSize: typography.fontSizes.sm,
    color: colors.light.textSecondary,
    fontFamily: typography.fonts.regular,
  },
  vocabMeaning: {
    fontSize: typography.fontSizes.sm,
    color: colors.light.text,
    fontFamily: typography.fonts.regular,
    lineHeight: 22,
  },

});

export default TeacherCultureDetail;