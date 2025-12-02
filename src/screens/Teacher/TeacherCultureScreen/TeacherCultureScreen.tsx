import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  FlatList,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  Add01Icon,
  Delete02Icon,
  ViewIcon,
  StarIcon,
  BookOpen01Icon,
  PenTool03Icon,
  Sorting05Icon,
  GlobeIcon,
  MusicNote03Icon,
  FirePitIcon,
  AirplaneIcon,
  FlimSlateIcon,
  UserLove01Icon,
  SparklesIcon,
  Location01Icon,
  TShirtIcon,
  Mortarboard01Icon,
  MilkBottleIcon,
  Agreement01Icon,
  FavouriteIcon
} from '@hugeicons/core-free-icons';

import Button from '../../../components/Button/Button';
import { colors, palette } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import ModalCulture from '../../../components/Modal/ModalCulture';

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

type ContentType = 'text' | 'image';

interface ContentItem {
  type: ContentType;
  content: string;
  url?: string;
  caption?: string;
  localImage?: any;
}

interface VocabularyItem {
  word: string;
  meaning: string;
  pronunciation: string;
}

interface CultureData {
  id?: number;
  title: string;
  subtitle: string;
  category: string;
  image: any;
  icon: string;
  content: ContentItem[];
  vocabulary: VocabularyItem[];
  isPremium?: boolean;
  views?: number;
  likes?: number;
}

interface CultureItem {
  id: number;
  title: string;
  subtitle: string;
  category: CultureCategory;
  isPremium: boolean;
  views: number;
  likes: number;
  image: any;
  icon: string;
}

// --- MOCK DATA ---
const initialCultureData: Record<CultureCategory, CultureItem[]> = {
  'Tất cả': [
    { 
      id: 1, 
      title: 'Văn hóa Sunbae-Hoobae', 
      subtitle: 'Mối quan hệ tiền bối - hậu bối trong xã hội Hàn Quốc',
      category: 'Ứng xử',
      isPremium: false,
      views: 1250,
      likes: 89,
      image: require('../../../assets/culture/th2.png'),
      icon: '/flower.png'
    },
    { 
      id: 2, 
      title: 'Nghệ thuật Kimchi', 
      subtitle: 'Lịch sử và quy trình làm kimchi truyền thống',
      category: 'Ẩm thực',
      isPremium: false,
      views: 980,
      likes: 76,
      image: require('../../../assets/culture/at3.png'),
      icon: '/flower.png'
    },
    { 
      id: 3, 
      title: 'Lễ hội Chuseok', 
      subtitle: 'Tết trung thu truyền thống của Hàn Quốc',
      category: 'Lễ hội',
      isPremium: true,
      views: 750,
      likes: 64,
      image: require('../../../assets/culture/lh1.png'),
      icon: '/flower.png'
    },
    { 
      id: 4, 
      title: 'Nhạc K-pop Evolution', 
      subtitle: 'Sự phát triển của âm nhạc đại chúng Hàn Quốc',
      category: 'Âm nhạc',
      isPremium: true,
      views: 2100,
      likes: 156,
      image: require('../../../assets/culture/an5.png'),
      icon: '/flower.png'
    },
  ],
  'Âm nhạc': [
    { 
      id: 4, 
      title: 'Nhạc K-pop Evolution', 
      subtitle: 'Sự phát triển của âm nhạc đại chúng Hàn Quốc',
      category: 'Âm nhạc',
      isPremium: true,
      views: 2100,
      likes: 156,
      image: require('../../../assets/culture/an5.png'),
      icon: '/flower.png'
    }
  ],
  'Ẩm thực': [
    { 
      id: 2, 
      title: 'Nghệ thuật Kimchi', 
      subtitle: 'Lịch sử và quy trình làm kimchi truyền thống',
      category: 'Ẩm thực',
      isPremium: false,
      views: 980,
      likes: 76,
      image: require('../../../assets/culture/at3.png'),
      icon: '/flower.png'
    }
  ],
  'Du lịch': [],
  'Điện ảnh': [],
  'Gia đình & Xã hội': [],
  'Làm đẹp': [],
  'Lễ hội': [
    { 
      id: 3, 
      title: 'Lễ hội Chuseok', 
      subtitle: 'Tết trung thu truyền thống của Hàn Quốc',
      category: 'Lễ hội',
      isPremium: true,
      views: 750,
      likes: 64,
      image: require('../../../assets/culture/lh1.png'),
      icon: '/flower.png'
    }
  ],
  'Lịch sử': [],
  'Trang phục': [],
  'Trường học': [],
  'Uống rượu': [],
  'Ứng xử': [
    { 
      id: 1, 
      title: 'Văn hóa Sunbae-Hoobae', 
      subtitle: 'Mối quan hệ tiền bối - hậu bối trong xã hội Hàn Quốc',
      category: 'Ứng xử',
      isPremium: false,
      views: 1250,
      likes: 89,
      image: require('../../../assets/culture/ux1.png'),
      icon: '/flower.png'
    }
  ]
};

const categories: { id: CultureCategory; label: string; icon: any }[] = [
  { id: 'Tất cả', label: 'Tất cả', icon: GlobeIcon },
  { id: 'Âm nhạc', label: 'Âm nhạc', icon: MusicNote03Icon },
  { id: 'Ẩm thực', label: 'Ẩm thực', icon: FirePitIcon },
  { id: 'Du lịch', label: 'Du lịch', icon: AirplaneIcon },
  { id: 'Điện ảnh', label: 'Điện ảnh', icon: FlimSlateIcon },
  { id: 'Gia đình & Xã hội', label: 'Gia đình & Xã hội', icon: UserLove01Icon },
  { id: 'Làm đẹp', label: 'Làm đẹp', icon: SparklesIcon },
  { id: 'Lễ hội', label: 'Lễ hội', icon: Location01Icon },
  { id: 'Lịch sử', label: 'Lịch sử', icon: BookOpen01Icon },
  { id: 'Trang phục', label: 'Trang phục', icon: TShirtIcon },
  { id: 'Trường học', label: 'Trường học', icon: Mortarboard01Icon },
  { id: 'Uống rượu', label: 'Uống rượu', icon: MilkBottleIcon },
  { id: 'Ứng xử', label: 'Ứng xử', icon: Agreement01Icon }
];

type TeacherStackParamList = {
  TeacherMain: undefined;
  CultureDetail: { cultureId: number };
};

const TeacherCultureScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<TeacherStackParamList>>();
  const [selectedCategory, setSelectedCategory] = useState<CultureCategory>('Tất cả');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [cultureData, setCultureData] = useState(initialCultureData);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedCulture, setSelectedCulture] = useState<CultureData | null>(null);

  // --- HANDLERS ---
  const handleAddCulture = () => {
    setModalMode('add');
    setSelectedCulture(null);
    setModalVisible(true);
  };

  const handleEditCulture = (cultureId: number) => {
    const culture = Object.values(cultureData)
      .flat()
      .find(item => item.id === cultureId);
    
    if (culture) {
      // Convert CultureItem to CultureData for the modal
      const cultureDataForModal: CultureData = {
        id: culture.id,
        title: culture.title,
        subtitle: culture.subtitle,
        category: culture.category,
        image: culture.image,
        icon: culture.icon,
        content: [{ type: 'text', content: culture.subtitle }],
        vocabulary: [{ word: 'Ví dụ', meaning: 'Example', pronunciation: '' }],
        isPremium: culture.isPremium,
        views: culture.views,
        likes: culture.likes
      };
      
      setModalMode('edit');
      setSelectedCulture(cultureDataForModal);
      setModalVisible(true);
    }
  };

  const handleSaveCulture = (data: CultureData) => {
    if (modalMode === 'add') {
      const newId = Date.now();
      const newCulture: CultureItem = {
        id: newId,
        title: data.title,
        subtitle: data.subtitle,
        category: data.category as CultureCategory,
        isPremium: false,
        views: 0,
        likes: 0,
        image: data.image || require('../../../assets/flower.png'),
        icon: data.icon
      };
      
      setCultureData(prev => ({
        ...prev,
        [data.category]: [...(prev[data.category as CultureCategory] || []), newCulture],
        'Tất cả': [...prev['Tất cả'], newCulture]
      }));
      
      Alert.alert('Thành công', 'Đã thêm bài văn hóa mới');
    } else {
      // Update logic for edit mode
      setCultureData(prev => {
        const newData = { ...prev };
        Object.keys(newData).forEach(category => {
          newData[category as CultureCategory] = newData[category as CultureCategory].map(
            item => {
              if (item.id === selectedCulture?.id) {
                return {
                  ...item,
                  title: data.title,
                  subtitle: data.subtitle,
                  category: data.category as CultureCategory,
                  image: data.image,
                  icon: data.icon
                };
              }
              return item;
            }
          );
        });
        return newData;
      });
      
      Alert.alert('Thành công', 'Đã cập nhật bài văn hóa');
    }
    
    setModalVisible(false);
  };

  const handleDeleteCulture = (cultureId: number) => {
    Alert.alert('Xác nhận', 'Bạn có chắc chắn muốn xóa bài văn hóa này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: () => {
          setCultureData(prev => {
            const newData = { ...prev };
            Object.keys(newData).forEach(category => {
              newData[category as CultureCategory] = newData[category as CultureCategory].filter(
                item => item.id !== cultureId
              );
            });
            return newData;
          });
          Alert.alert('Thành công', 'Đã xóa bài văn hóa thành công!');
        }
      }
    ]);
  };

  const handleTogglePremium = (cultureId: number, currentPremiumStatus: boolean) => {
    const action = currentPremiumStatus ? 'bỏ đánh dấu Premium' : 'đánh dấu làm Premium';
    
    Alert.alert(
      'Xác nhận',
      `Bạn có muốn ${action} cho bài văn hóa này?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xác nhận',
          onPress: () => {
            setCultureData(prev => {
              const newData = { ...prev };
              Object.keys(newData).forEach(category => {
                newData[category as CultureCategory] = newData[category as CultureCategory].map(
                  item => item.id === cultureId 
                    ? { ...item, isPremium: !item.isPremium }
                    : item
                );
              });
              return newData;
            });
          }
        }
      ]
    );
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const handleViewDetail = (cultureId: number) => {
    navigation.navigate('CultureDetail', { cultureId });
  };

  // --- RENDER HELPERS ---
  const sortedItems = [...(cultureData[selectedCategory] || [])].sort((a, b) => {
    return sortOrder === 'asc' 
      ? a.title.localeCompare(b.title)
      : b.title.localeCompare(a.title);
  });

  const renderCultureCard = ({ item }: { item: CultureItem }) => (
    <View style={styles.card}>
      <View style={styles.cardImageContainer}>
        <Image source={item.image} style={styles.cardImage} resizeMode="cover" />
        {item.isPremium && (
          <View style={styles.premiumBadge}>
            <HugeiconsIcon icon={StarIcon} size={12} color={palette.warning} variant="solid" />
            <Text style={styles.premiumBadgeText}>Premium</Text>
          </View>
        )}
      </View>

      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <View style={styles.iconContainer}>
              <Text style={styles.iconText}>🌸</Text>
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.cardSubtitle} numberOfLines={2}>{item.subtitle}</Text>
            </View>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
          <View style={styles.statItem}>
            <HugeiconsIcon icon={ViewIcon} size={14} color={colors.light.textSecondary} />
            <Text style={styles.statText}>{item.views} lượt xem</Text>
          </View>
          <View style={styles.statItem}>
            <HugeiconsIcon icon={FavouriteIcon} size={14} color={colors.light.textSecondary} />
            <Text style={styles.statText}>{item.likes} lượt thích</Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.viewBtn]}
            onPress={() => handleViewDetail(item.id)}
          >
            <HugeiconsIcon icon={ViewIcon} size={16} color={colors.light.white} />
            <Text style={styles.viewBtnText}>Xem chi tiết</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.iconBtn}
            onPress={() => handleEditCulture(item.id)}
          >
            <HugeiconsIcon 
              icon={PenTool03Icon} 
              size={18} 
              color={colors.light.text}
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.iconBtn}
            onPress={() => handleTogglePremium(item.id, item.isPremium)}
          >
            <HugeiconsIcon 
              icon={StarIcon} 
              size={18} 
              color={item.isPremium ? palette.warning : colors.light.textSecondary}
              variant={item.isPremium ? "solid" : "stroke"}
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.iconBtn}
            onPress={() => handleDeleteCulture(item.id)}
          >
            <HugeiconsIcon icon={Delete02Icon} size={18} color={palette.error} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quản lý Văn Hóa</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.sortBtn} onPress={toggleSortOrder}>
            <HugeiconsIcon icon={Sorting05Icon} size={20} color={colors.light.text} />
            <Text style={styles.sortBtnText}>
              {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
            </Text>
          </TouchableOpacity>
          <Button 
            title="Tạo mới" 
            size="small" 
            variant="primary" 
            onPress={handleAddCulture}
            leftIcon={<HugeiconsIcon icon={Add01Icon} size={16} color="white" />}
          />
        </View>
      </View>

      {/* Category Filter Section */}
      <View style={styles.categorySection}>
        <Text style={styles.sectionLabel}>Thể loại</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.tabScrollContainer}
          contentContainerStyle={styles.tabContentContainer}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.tabBtn,
                selectedCategory === category.id && styles.activeTabBtn
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <HugeiconsIcon 
                icon={category.icon} 
                size={16} 
                color={selectedCategory === category.id ? colors.light.primary : colors.light.textSecondary} 
              />
              <Text style={[
                styles.tabText,
                selectedCategory === category.id && styles.activeTabText
              ]}>
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Content Section */}
      <View style={styles.content}>
        <View style={styles.listHeader}>
          <Text style={styles.listInfoText}>
            Hiển thị {sortedItems.length} bài văn hóa • 
            Sắp xếp: {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
          </Text>
        </View>

        <FlatList
          data={sortedItems}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderCultureCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <HugeiconsIcon icon={BookOpen01Icon} size={48} color={colors.light.border} />
              <Text style={styles.emptyTitle}>
                Chưa có bài văn hóa nào trong {selectedCategory}
              </Text>
              <Text style={styles.emptySubtitle}>
                Hãy tạo bài văn hóa đầu tiên để chia sẻ kiến thức về văn hóa Hàn Quốc
              </Text>
              <Button 
                title="Tạo bài văn hóa đầu tiên" 
                variant="secondary" 
                onPress={handleAddCulture} 
                leftIcon={<HugeiconsIcon icon={Add01Icon} size={16} color={colors.light.primary} />}
              />
            </View>
          }
        />
      </View>

      {/* Modal Culture */}
      <ModalCulture
        isOpen={modalVisible}
        onClose={() => setModalVisible(false)}
        mode={modalMode}
        onSave={handleSaveCulture}
        culture={selectedCulture}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
    marginTop: 40,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  headerTitle: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fonts.bold,
    color: colors.light.text,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.light.card,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  sortBtnText: {
    fontSize: typography.fontSizes.xs,
    color: colors.light.text,
    fontFamily: typography.fonts.regular,
  },

  // Category Section
  categorySection: {
    backgroundColor: colors.light.background,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  sectionLabel: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fonts.regular,
    color: colors.light.textSecondary,
    marginBottom: 12,
  },
  tabScrollContainer: {
    height: 40,
  },
  tabContentContainer: {
    gap: 8,
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.light.card,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  activeTabBtn: {
    backgroundColor: colors.light.primary + '15',
    borderColor: colors.light.primary,
  },
  tabText: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fonts.regular,
    color: colors.light.textSecondary,
  },
  activeTabText: {
    color: colors.light.primary,
    fontFamily: typography.fonts.regular,
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  listHeader: {
    marginTop: 20,
    marginBottom: 16,
  },
  listInfoText: {
    fontSize: typography.fontSizes.xs,
    color: colors.light.textSecondary,
    fontFamily: typography.fonts.regular,
  },
  listContent: {
    paddingBottom: 20,
    gap: 16,
  },

  // Card
  card: {
    backgroundColor: colors.light.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.light.border,
    shadowColor: colors.light.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  cardImageContainer: {
    position: 'relative',
    height: 160,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  premiumBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: palette.warning + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  premiumBadgeText: {
    fontSize: 10,
    color: palette.warning,
    fontFamily: typography.fonts.bold,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.light.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 20,
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: typography.fontSizes.md,
    fontFamily: typography.fonts.semiBold,
    color: colors.light.text,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.light.textSecondary,
    fontFamily: typography.fonts.regular,
    lineHeight: 20,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: palette.info + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 12,
  },
  categoryText: {
    fontSize: typography.fontSizes.xs,
    color: palette.info,
    fontFamily: typography.fonts.regular,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.light.border + '30',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: typography.fontSizes.xs,
    color: colors.light.textSecondary,
    fontFamily: typography.fonts.regular,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    flex: 1,
  },
  viewBtn: {
    backgroundColor: colors.light.secondary,
  },
  viewBtnText: {
    fontSize: typography.fontSizes.xs,
    color: colors.light.white,
    fontFamily: typography.fonts.regular,
  },
  iconBtn: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: colors.light.background,
    borderWidth: 1,
    borderColor: colors.light.border,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: typography.fontSizes.lg,
    color: colors.light.text,
    fontFamily: typography.fonts.semiBold,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.light.textSecondary,
    fontFamily: typography.fonts.regular,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
});

export default TeacherCultureScreen;