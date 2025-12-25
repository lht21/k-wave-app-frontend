import React from 'react'
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native'
import { useRouter } from 'expo-router';
import { spacing } from '../../../theme/spacing'
import { colors, palette } from '../../../theme/colors'
import { typography } from '../../../theme/typography'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
import { useAuth } from '../../../hooks/useAuth';

const { width } = Dimensions.get('window')

const HomeStd: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();

  // Giữ nguyên Logic Data
  const learningModules = [
    { id: '1', title: 'Lộ trình', icon: '🛣️', navigateTo: '/(student)/roadmap/roadmap' },
    { id: '2', title: 'Thi thử', icon: '🎯', navigateTo: '/(student)/exam/trial' },
    { id: '3', title: 'Luyện thi', icon: '⏰', navigateTo: '/(student)/exam/real' },
    { id: '4', title: 'Video', icon: '🎥', navigateTo: '/(student)/video/learning' },
    { id: '5', title: 'Văn hoá', icon: '🏛️', navigateTo: '/(student)/culture/culture-list' },
    { id: '6', title: 'Tin tức', icon: '📰', navigateTo: '/(student)/news/news' }
  ]

  const cultureCategories = [
    { id: '1', title: 'Văn hoá lịch sử', icon: '🏯' },
    { id: '2', title: 'Văn hoá trang phục', icon: '👘' },
    { id: '3', title: 'Văn hoá âm nhạc', icon: '🎵' },
    { id: '4', title: 'Văn hoá ẩm thực', icon: '🍜' },
    { id: '5', title: 'Văn hoá điện ảnh', icon: '🎬' },
  ]

  // Component phụ trợ cho Grid 2 cột mới
  const LearningModule = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.moduleCard}
      onPress={() => item.navigateTo && router.push(item.navigateTo)}
    >
      <View style={styles.moduleTextContainer}>
        <Text style={styles.moduleTitleText}>{item.title}</Text>
      </View>
      {/* Decorative Icon Background giống thiết kế */}
      <View style={styles.moduleDecor}>
         <View style={styles.decorCircle} />
         <Text style={styles.decorIcon}>{item.icon}</Text> 
      </View>
    </TouchableOpacity>
  )

  const CultureItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.cultureRow}
      onPress={() => router.push('/(student)/culture/culture-list')}
    >
      <View style={styles.cultureIconCircle}>
        <Text style={{ fontSize: 20 }}>{item.icon}</Text>
      </View>
      <Text style={styles.cultureRowTitle}>{item.title}</Text>
      <View style={styles.cultureDecorShape} />
    </TouchableOpacity>
  )

  return (
    <View style={styles.screen}>
      {/* Custom Header Section */}
      <View style={styles.headerContainer}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.headerSmallText}>Học ngay thôi!</Text>
              <Text style={styles.headerUsername}>{user?.fullName || 'username'}</Text>
            </View>
            <Image 
              source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }} 
              style={styles.avatar} 
            />
          </View>
        </SafeAreaView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Section 1: Khám phá */}
        <Text style={styles.sectionTitle}>Khám phá học tập</Text>
        <View style={styles.grid}>
          {learningModules.map((item) => (
            <LearningModule key={item.id} item={item} />
          ))}
        </View>

        {/* Section 2: Premium Banner */}
        <Text style={styles.sectionTitle}>Trải nghiệm Premium</Text>
        <LinearGradient
          colors={['#E8FBF2', '#C2F3D9']}
          style={styles.premiumCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.premiumTextContent}>
            <Text style={styles.premiumTitle}>Học tiếng Hàn dễ dàng!</Text>
            <Text style={styles.premiumSubtitle}>Seoul trong tầm tay</Text>
          </View>
          
          <TouchableOpacity style={styles.premiumBtn} onPress={() => router.push('/(student)/premium/update')}>
            <Text style={styles.premiumBtnText}>Đăng ký ngay!</Text>
          </TouchableOpacity>
          
          {/* Abstract circles for UI */}
          <View style={[styles.absCircle, { bottom: -20, left: -20, backgroundColor: '#A8E7C5' }]} />
        </LinearGradient>

        {/* Section 3: Văn hoá */}
        <Text style={styles.sectionTitle}>Văn hoá Hàn Quốc</Text>
        {cultureCategories.map((item) => (
          <CultureItem key={item.id} item={item} />
        ))}
        
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  headerContainer: {
    backgroundColor: '#00ca5e',
    borderBottomRightRadius: 40,
    paddingHorizontal: 20,
    paddingBottom: 25,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  headerSmallText: { color: '#fff', fontSize: 14, opacity: 0.9 },
  headerUsername: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  avatar: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: '#fff' },

  scrollContainer: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 15, marginTop: 10 },

  // Grid Modules
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  moduleCard: {
    width: '48%',
    height: 90,
    backgroundColor: '#F5F7FA',
    borderRadius: 20,
    padding: 15,
    marginBottom: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EEE',
  },
  moduleTextContainer: { flex: 1, justifyContent: 'center' },
  moduleTitleText: { fontSize: 16, fontWeight: '700', color: '#333' },
  moduleDecor: {
    position: 'absolute',
    bottom: -10,
    right: -10,
    width: 60,
    height: 60,
  },
  decorCircle: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E2E8F0',
    bottom: -20,
    right: -20,
  },
  decorIcon: { position: 'absolute', bottom: 20, right: 20, fontSize: 24, opacity: 0.5 },

  // Premium Card
  premiumCard: {
    borderRadius: 25,
    padding: 25,
    marginBottom: 25,
    overflow: 'hidden',
    position: 'relative',
    height: 180,
    justifyContent: 'space-between'
  },
  premiumTextContent: { maxWidth: '70%' },
  premiumTitle: { fontSize: 22, fontWeight: 'bold', color: '#1A1A1A' },
  premiumSubtitle: { fontSize: 14, color: '#ff9d4dff', fontWeight: '600', marginTop: 5 },
  premiumBtn: {
    backgroundColor: '#00ca5e',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: 'flex-end',
  },
  premiumBtnText: { color: '#fff', fontWeight: 'bold' },
  absCircle: { position: 'absolute', width: 120, height: 120, borderRadius: 60, zIndex: -1 },

  // Culture Rows
  cultureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    borderRadius: 20,
    padding: 15,
    marginBottom: 12,
    overflow: 'hidden'
  },
  cultureIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  cultureRowTitle: { fontSize: 16, fontWeight: '600', color: '#333' },
  cultureDecorShape: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E2E8F0',
    zIndex: -1,
  }
})

export default HomeStd