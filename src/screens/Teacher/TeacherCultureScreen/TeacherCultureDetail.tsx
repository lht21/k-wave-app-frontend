import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  StarIcon,
  ViewIcon,
  TagIcon,
  Clock01Icon,
  BookOpen01Icon,
  FavouriteIcon,
  ArrowLeft01Icon
} from '@hugeicons/core-free-icons';

import { cultureService, Culture } from '../../../services/cultureService'; // Import Service
import { colors, palette } from '../../../theme/colors';
import { typography } from '../../../theme/typography';

const TeacherCultureDetail: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const { cultureId } = route.params; // Nhận ID từ route

  const [culture, setCulture] = useState<Culture | null>(null);
  const [loading, setLoading] = useState(true);

  // Load chi tiết bài văn hóa
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const data = await cultureService.getById(cultureId);
        setCulture(data);
      } catch (error) {
        console.error('Fetch detail error:', error);
        Alert.alert('Lỗi', 'Không thể tải chi tiết bài văn hóa');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    if (cultureId) {
      fetchDetail();
    }
  }, [cultureId]);

  // --- HANDLERS ---
  const handleTogglePremium = async () => {
    if (!culture) return;
    try {
      await cultureService.togglePremium(culture._id!);
      setCulture(prev => prev ? { ...prev, isPremium: !prev.isPremium } : null);
      Alert.alert('Thành công', `Đã ${!culture.isPremium ? 'bật' : 'tắt'} Premium`);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể thay đổi trạng thái');
    }
  };

  // --- RENDER ---
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={palette.primary} />
        <Text style={styles.loadingText}>Đang tải nội dung...</Text>
      </View>
    );
  }

  if (!culture) return null;

  return (
    <View style={styles.container}>
      {/* Back Button Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <HugeiconsIcon icon={ArrowLeft01Icon} size={24} color={colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{culture.title}</Text>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Main Image */}
        <View style={styles.mainImageContainer}>
          <Image 
            source={{ uri: culture.image }} 
            style={styles.mainImage}
            resizeMode="cover"
          />
          {culture.isPremium && (
            <View style={styles.premiumOverlayBadge}>
              <HugeiconsIcon icon={StarIcon} size={14} color={palette.warning} variant="solid" />
              <Text style={styles.premiumOverlayText}>Premium</Text>
            </View>
          )}
        </View>

        {/* Basic Info */}
        <View style={styles.basicInfo}>
          <Text style={styles.cultureTitle}>{culture.title}</Text>
          <Text style={styles.cultureSubtitle}>{culture.subtitle}</Text>

          <View style={styles.metaInfo}>
            <View style={styles.metaItem}>
              <HugeiconsIcon icon={TagIcon} size={14} color={colors.light.textSecondary} />
              <Text style={styles.metaText}>{culture.category}</Text>
            </View>
            <View style={styles.metaItem}>
              <HugeiconsIcon icon={ViewIcon} size={14} color={colors.light.textSecondary} />
              <Text style={styles.metaText}>{culture.views || 0} xem</Text>
            </View>
            <View style={styles.metaItem}>
              <HugeiconsIcon icon={FavouriteIcon} size={14} color={colors.light.textSecondary} />
              <Text style={styles.metaText}>{culture.likes || 0} thích</Text>
            </View>
            
            {/* Action Buttons */}
            <TouchableOpacity 
              style={[styles.metaItem, styles.actionButton, culture.isPremium && styles.activePremiumBtn]}
              onPress={handleTogglePremium}
            >
              <HugeiconsIcon icon={StarIcon} size={14} color={culture.isPremium ? palette.warning : colors.light.textSecondary} variant={culture.isPremium ? 'solid' : 'stroke'} />
              <Text style={[styles.metaText, culture.isPremium && { color: palette.warning, fontWeight: 'bold' }]}>
                {culture.isPremium ? 'Premium' : 'Đặt Premium'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Dynamic Content Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nội dung</Text>
          {culture.content.map((item, index) => (
            <View key={index} style={styles.contentBlock}>
              {item.type === 'text' ? (
                <Text style={styles.contentText}>{item.content}</Text>
              ) : (
                <View style={styles.contentImageWrapper}>
                  <Image 
                    source={{ uri: item.url }} 
                    style={styles.contentImage}
                    resizeMode="cover"
                  />
                  {item.caption ? (
                    <Text style={styles.imageCaption}>{item.caption}</Text>
                  ) : null}
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Vocabulary Section */}
        {culture.vocabulary && culture.vocabulary.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Từ vựng ({culture.vocabulary.length})</Text>
            <View style={styles.vocabularyGrid}>
              {culture.vocabulary.map((vocab, index) => (
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
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.light.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: colors.light.textSecondary },
  
  header: {
    flexDirection: 'row', alignItems: 'center', padding: 16, 
    borderBottomWidth: 1, borderColor: colors.light.border, gap: 12
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', flex: 1, color: colors.light.text },

  scrollContent: { paddingBottom: 40 },
  
  mainImageContainer: { position: 'relative', height: 250 },
  mainImage: { width: '100%', height: '100%' },
  premiumOverlayBadge: {
    position: 'absolute', top: 16, right: 16, flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 4
  },
  premiumOverlayText: { color: palette.warning, fontSize: 12, fontWeight: 'bold' },

  basicInfo: { padding: 20, borderBottomWidth: 1, borderColor: colors.light.border },
  cultureTitle: { fontSize: 22, fontWeight: 'bold', color: colors.light.text, marginBottom: 8 },
  cultureSubtitle: { fontSize: 15, color: colors.light.textSecondary, lineHeight: 22, marginBottom: 16 },
  
  metaInfo: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.light.card, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, borderWidth: 1, borderColor: colors.light.border },
  metaText: { fontSize: 12, color: colors.light.textSecondary },
  actionButton: { borderColor: colors.light.primary },
  activePremiumBtn: { borderColor: palette.warning, backgroundColor: palette.warning + '10' },

  section: { padding: 20, borderBottomWidth: 1, borderColor: colors.light.border },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: colors.light.text },
  
  contentBlock: { marginBottom: 16 },
  contentText: { fontSize: 16, lineHeight: 26, color: colors.light.text },
  contentImageWrapper: { marginVertical: 8 },
  contentImage: { width: '100%', height: 200, borderRadius: 8 },
  imageCaption: { textAlign: 'center', fontSize: 13, color: colors.light.textSecondary, marginTop: 6, fontStyle: 'italic' },

  vocabularyGrid: { gap: 12 },
  vocabularyCard: { backgroundColor: colors.light.card, padding: 16, borderRadius: 10, borderWidth: 1, borderColor: colors.light.border },
  vocabHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' },
  vocabWord: { fontSize: 16, fontWeight: 'bold', color: colors.light.primary },
  vocabPronunciation: { fontSize: 13, color: colors.light.textSecondary },
  vocabMeaning: { fontSize: 15, color: colors.light.text },
});

export default TeacherCultureDetail;