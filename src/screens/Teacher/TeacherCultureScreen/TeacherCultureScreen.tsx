import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  Add01Icon,
  Delete02Icon,
  ViewIcon,
  StarIcon,
  PenTool03Icon,
  BookOpen01Icon,
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

import { cultureService, Culture } from '../../../services/cultureService'; // Import Service
import ModalCulture from '../../../components/Modal/ModalCulture';
import Button from '../../../components/Button/Button';
import { colors, palette } from '../../../theme/colors';
import { typography } from '../../../theme/typography';

// Định nghĩa Type cho Navigation
type TeacherStackParamList = {
  TeacherCultureScreen: undefined;
  TeacherCultureDetail: { cultureId: string }; // Dùng string vì MongoDB ID là string
};

// Danh mục và Icon tương ứng
const categories = [
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

const TeacherCultureScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<TeacherStackParamList>>();
  
  // State
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [cultures, setCultures] = useState<Culture[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc'); // Mặc định mới nhất trước
  
  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedCulture, setSelectedCulture] = useState<Culture | null>(null);

  // --- API CALLS ---
  const loadCultures = async () => {
    setLoading(true);
    try {
      // includeDrafts=true để giáo viên thấy cả bài chưa publish (nếu backend hỗ trợ logic này)
      // Mặc định cultureService.getAll đã handle param này
      const data = await cultureService.getAll(selectedCategory);
      
      // Sắp xếp client-side (hoặc backend nếu muốn)
      const sortedData = [...data].sort((a, b) => {
        if (sortOrder === 'asc') return a.title.localeCompare(b.title);
        // Desc theo ngày tạo (giả sử _id hoặc createdAt, ở đây sort theo title desc cho demo)
        return b.title.localeCompare(a.title); 
      });

      setCultures(sortedData);
    } catch (error) {
      console.error('Failed to load cultures:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách văn hóa. Kiểm tra kết nối server.');
    } finally {
      setLoading(false);
    }
  };

  // Tải lại dữ liệu khi màn hình được focus hoặc category thay đổi
  useFocusEffect(
    useCallback(() => {
      loadCultures();
    }, [selectedCategory, sortOrder])
  );

  // --- HANDLERS ---
  const handleOpenAdd = () => {
    setSelectedCulture(null);
    setModalMode('add');
    setModalVisible(true);
  };

  const handleOpenEdit = (culture: Culture) => {
    setSelectedCulture(culture);
    setModalMode('edit');
    setModalVisible(true);
  };

  const handleSave = async (data: Partial<Culture>) => {
    try {
      if (modalMode === 'add') {
        await cultureService.create(data);
        Alert.alert('Thành công', 'Đã tạo bài văn hóa mới');
      } else if (selectedCulture?._id) {
        await cultureService.update(selectedCulture._id, data);
        Alert.alert('Thành công', 'Đã cập nhật bài văn hóa');
      }
      setModalVisible(false);
      loadCultures(); // Reload list
    } catch (error: any) {
      console.error('Save error:', error);
      Alert.alert('Lỗi', error.message || 'Có lỗi xảy ra khi lưu');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Xác nhận', 'Bạn có chắc muốn xóa bài văn hóa này?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          try {
            await cultureService.delete(id);
            Alert.alert('Thành công', 'Đã xóa bài văn hóa');
            loadCultures();
          } catch (error) {
            Alert.alert('Lỗi', 'Không thể xóa bài văn hóa');
          }
        }
      }
    ]);
  };

  const handleTogglePremium = async (id: string) => {
    try {
      await cultureService.togglePremium(id);
      loadCultures(); // Refresh để thấy thay đổi icon
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể thay đổi trạng thái Premium');
    }
  };

  const toggleSort = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  // --- RENDER ---
  const renderItem = ({ item }: { item: Culture }) => (
    <View style={styles.card}>
      <View style={styles.cardImageContainer}>
        {/* URL ảnh từ Server */}
        <Image 
          source={{ uri: item.image }} 
          style={styles.cardImage} 
          resizeMode="cover" 
          defaultSource={require('../../../assets/flower.png')} // Ảnh placeholder nếu lỗi
        />
        {item.isPremium && (
          <View style={styles.premiumBadge}>
            <HugeiconsIcon icon={StarIcon} size={12} color={palette.warning} variant="solid" />
            <Text style={styles.premiumBadgeText}>Premium</Text>
          </View>
        )}
      </View>

      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.cardSubtitle} numberOfLines={2}>{item.subtitle}</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
          <View style={styles.statItem}>
            <HugeiconsIcon icon={ViewIcon} size={14} color={colors.light.textSecondary} />
            <Text style={styles.statText}>{item.views || 0} xem</Text>
          </View>
          <View style={styles.statItem}>
            <HugeiconsIcon icon={FavouriteIcon} size={14} color={colors.light.textSecondary} />
            <Text style={styles.statText}>{item.likes || 0} thích</Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionBtn, styles.viewBtn]}
            onPress={() => navigation.navigate('TeacherCultureDetail', { cultureId: item._id! })}
          >
            <HugeiconsIcon icon={ViewIcon} size={16} color={colors.light.white} />
            <Text style={styles.viewBtnText}>Chi tiết</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.iconBtn} onPress={() => handleOpenEdit(item)}>
            <HugeiconsIcon icon={PenTool03Icon} size={18} color={colors.light.text} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.iconBtn} onPress={() => handleTogglePremium(item._id!)}>
            <HugeiconsIcon 
              icon={StarIcon} 
              size={18} 
              color={item.isPremium ? palette.warning : colors.light.textSecondary}
              variant={item.isPremium ? "solid" : "stroke"}
            />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.iconBtn} onPress={() => handleDelete(item._id!)}>
            <HugeiconsIcon icon={Delete02Icon} size={18} color={palette.error} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quản lý Văn Hóa</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.sortBtn} onPress={toggleSort}>
            <HugeiconsIcon icon={Sorting05Icon} size={20} color={colors.light.text} />
            <Text style={styles.sortBtnText}>{sortOrder === 'asc' ? 'A-Z' : 'Mới nhất'}</Text>
          </TouchableOpacity>
          <Button 
            title="Tạo mới" 
            size="small" 
            variant="primary" 
            onPress={handleOpenAdd}
            leftIcon={<HugeiconsIcon icon={Add01Icon} size={16} color="white" />}
          />
        </View>
      </View>

      {/* Category Filter */}
      <View style={styles.categorySection}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
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

      {/* List Content */}
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color={palette.primary} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={cultures}
            keyExtractor={(item) => item._id || Math.random().toString()}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <HugeiconsIcon icon={BookOpen01Icon} size={48} color={colors.light.border} />
                <Text style={styles.emptyTitle}>Chưa có bài văn hóa nào</Text>
                <Text style={styles.emptySubtitle}>Hãy tạo bài đầu tiên cho mục {selectedCategory}</Text>
              </View>
            }
          />
        )}
      </View>

      {/* Modal */}
      <ModalCulture
        isOpen={modalVisible}
        onClose={() => setModalVisible(false)}
        mode={modalMode}
        onSave={handleSave}
        culture={selectedCulture}
      />
    </View>
  );
};

// Styles (Giữ nguyên hoặc tùy chỉnh nhẹ)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.light.background , marginTop: 40},
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, backgroundColor: colors.light.background, borderBottomWidth: 1, borderColor: colors.light.border,
  },
  headerTitle: { fontSize: typography.fontSizes.lg, fontFamily: typography.fonts.bold, color: colors.light.text },
  headerActions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  sortBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 8, backgroundColor: colors.light.card, borderRadius: 8, borderWidth: 1, borderColor: colors.light.border },
  sortBtnText: { fontSize: 12, color: colors.light.text },
  
  categorySection: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.light.border },
  tabContentContainer: { paddingHorizontal: 16, gap: 8 },
  tabBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.light.card, borderWidth: 1, borderColor: colors.light.border },
  activeTabBtn: { backgroundColor: colors.light.primary + '15', borderColor: colors.light.primary },
  tabText: { fontSize: 13, color: colors.light.textSecondary },
  activeTabText: { color: colors.light.primary, fontFamily: typography.fonts.bold },

  content: { flex: 1, paddingHorizontal: 16 },
  listContent: { paddingVertical: 16, gap: 16 },
  
  // Card Styles
  card: { backgroundColor: colors.light.card, borderRadius: 12, borderWidth: 1, borderColor: colors.light.border, overflow: 'hidden' },
  cardImageContainer: { height: 160, position: 'relative' },
  cardImage: { width: '100%', height: '100%' },
  premiumBadge: { position: 'absolute', top: 12, right: 12, flexDirection: 'row', gap: 4, backgroundColor: palette.warning + '20', padding: 6, borderRadius: 6, alignItems: 'center' },
  premiumBadgeText: { fontSize: 10, color: palette.warning, fontWeight: 'bold' },
  
  cardContent: { padding: 16 },
  cardHeader: { marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: colors.light.text, marginBottom: 4 },
  cardSubtitle: { fontSize: 13, color: colors.light.textSecondary },
  
  statsContainer: { flexDirection: 'row', gap: 12, marginBottom: 12, alignItems: 'center' },
  categoryBadge: { backgroundColor: palette.info + '15', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  categoryText: { fontSize: 11, color: palette.info },
  statItem: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  statText: { fontSize: 11, color: colors.light.textSecondary },

  actionButtons: { flexDirection: 'row', gap: 8, paddingTop: 12, borderTopWidth: 1, borderColor: colors.light.border + '50' },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, padding: 8, borderRadius: 6 },
  viewBtn: { backgroundColor: colors.light.secondary },
  viewBtnText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  iconBtn: { padding: 8, borderRadius: 6, borderWidth: 1, borderColor: colors.light.border },

  emptyState: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyTitle: { fontSize: 16, fontWeight: 'bold', color: colors.light.text },
  emptySubtitle: { fontSize: 14, color: colors.light.textSecondary }
});

export default TeacherCultureScreen;