import React from 'react'
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, FlatList, ImageBackground } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { spacing } from '../../theme/spacing'
import { colors, palette } from '../../theme/colors'
import { typography } from '../../theme/typography'

const HomeStd: React.FC = () => {
  const navigation = useNavigation<any>()
  // Learning modules với navigation
  const learningModules = [
    { id: '1', title: 'Lộ trình', icon: '🗺️', navigateTo: 'StdRoadmap' },
    { id: '2', title: 'Thi thử', icon: '🎯', navigateTo: 'StdPracticeExam' },
    { id: '3', title: 'Luyện thi', icon: '⏰', navigateTo: 'StdRealExam' },
    { id: '4', title: 'Học qua video', icon: '🎥', navigateTo: 'StdVideoLearning' },
    { id: '5', title: 'Văn hóa', icon: '🏛️', navigateTo: 'StdCulture' },
    { id: '6', title: 'Tin tức', icon: '📰', navigateTo: 'News' }
  ]

  // Korean culture categories
  const cultureCategories = [
    { id: '1', title: 'Văn hóa lịch sử', icon: '🏯' },
    { id: '2', title: 'Văn hóa trang phục', icon: '👘' },
    { id: '3', title: 'Văn hóa âm nhạc', icon: '🎵' },
    { id: '4', title: 'Văn hóa ẩm thực', icon: '🍜' }
  ]

  // Daily challenge data
  const dailyChallenge = {
    title: 'Học tiếng Hàn dễ dàng!',
    subtitle: 'Trải nghiệm Seoul ngay trong tay!',
    hint: 'Đam mê K-pop, K-Drama hay muốn đạt Topik cao?',
    participants: 2003238,
    description: 'Người đã tìm từng và số dụng để chính phúc tiếng Hàn!'
  }

  const LearningModule = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.moduleItem}
      onPress={() => {
        if (item.navigateTo) {
          switch(item.navigateTo) {
            case 'StdRoadmap':
              navigation.navigate('StdRoadmap')
              break
            case 'StdPracticeExam':
              navigation.navigate('StdPracticeExam')
              break
            case 'StdRealExam':
              navigation.navigate('StdRealExam')
              break
            case 'StdVideoLearning':
              navigation.navigate('StdVideoLearning')
              break
            case 'StdCulture':
              (navigation as any).navigate('StdCulture')
              break
            case 'News':
              // Navigate to News tab
              navigation.jumpTo('News')
              break
            default:
              console.log(`Tính năng ${item.title} đang phát triển`)
          }
        } else {
          console.log(`Tính năng ${item.title} đang phát triển`)
        }
      }}
    >
      <View style={styles.moduleIcon}>
        <Text style={styles.icon}>{item.icon}</Text>
      </View>
      <Text style={styles.moduleTitle}>{item.title}</Text>
    </TouchableOpacity>
  )

  const CultureItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.cultureCard}
      onPress={() => (navigation as any).navigate('StdCulture')}
    >
      <Text style={styles.cultureIcon}>{item.icon}</Text>
      <Text style={styles.cultureTitle}>{item.title}</Text>
    </TouchableOpacity>
  )

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      {/* Header - Welcome Section */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👋</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>Xin chào</Text>
            <Text style={styles.greetingSubtitle}>Mỗi ngày một bước, chinh phục tiếng Hàn dễ dàng!</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.signUpBtn}>
          <Text style={styles.signUpText}>Đăng ký ngay!</Text>
        </TouchableOpacity>
      </View>

      {/* Learning Modules */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Học tập:</Text>
        <View style={styles.modulesGrid}>
          {learningModules.map((module) => (
            <LearningModule key={module.id} item={module} />
          ))}
        </View>
      </View>

      {/* Daily Challenge / Featured Content */}
      <ImageBackground
        source={{ uri: 'https://i.pinimg.com/736x/ce/4c/ff/ce4cff826575cd2add5099f1c2e3c9ad.jpg' }}
        style={styles.dailyChallengeCard}
        imageStyle={styles.backgroundImage}
      >
        <View style={styles.challengeOverlay}>
          <Text style={styles.challengeTag}>Ưu đãi</Text>
          
          <Text style={styles.challengeTitle}>{dailyChallenge.title}</Text>
        <Text style={styles.challengeSubtitle}>{dailyChallenge.subtitle}</Text>
        <Text style={styles.challengeHint}>{dailyChallenge.hint}</Text>

        {/* Counter */}
        <View style={styles.counterContainer}>
          {dailyChallenge.participants
            .toString()
            .split('')
            .map((digit, idx) => (
              <View key={idx} style={styles.counterDigit}>
                <Text style={styles.digitText}>{digit}</Text>
              </View>
            ))}
        </View>

        <View style={styles.challengeInfo}>
          <View style={styles.infoRow}>
            <Image
              source={{ uri: 'https://placehold.co/50x50' }}
              style={styles.infoAvatar}
            />
            <Text style={styles.infoText}>{dailyChallenge.description}</Text>
          </View>
        </View>

        {/* Flags and features */}
        <View style={styles.flagsSection}>
          <View style={styles.flagRowCenter}>
            <Text style={styles.flag}>🇻🇳</Text>
            <Text style={styles.flag}>🇰🇷</Text>
          </View>
          <View style={styles.flagRow}>
            <View style={styles.checkmarkContainer}>
              <Text style={styles.checkmark}>✅</Text>
            </View>
            <Text style={styles.flagLabel}>Tiết kiệm chi phí – chỉ bằng 1/5 so với học tại trung tâm.</Text>
          </View>
          <View style={styles.flagRow}>
            <View style={styles.checkmarkContainer}>
              <Text style={styles.checkmark}>✅</Text>
            </View>
            <Text style={styles.flagLabel}>Học mọi lúc, mọi nơi – chỉ cần điện thoại, không lo lệch lịch.</Text>
          </View>
          <View style={styles.flagRow}>
            <View style={styles.checkmarkContainer}>
              <Text style={styles.checkmark}>✅</Text>
            </View>
            <Text style={styles.flagLabel}>Tiến bộ nhanh – lộ trình cá nhân hóa, phù hợp từng trình độ.</Text>
          </View>
          <View style={styles.flagRow}>
            <View style={styles.checkmarkContainer}>
              <Text style={styles.checkmark}>✅</Text>
            </View>
            <Text style={styles.flagLabel}>Phát âm chuẩn bản xứ – luyện với công nghệ Al nhận diện giọng nói.</Text>
          </View>
          <View style={styles.flagRow}>
            <View style={styles.checkmarkContainer}>
              <Text style={styles.checkmark}>✅</Text>
            </View>
            <Text style={styles.flagLabel}>Đầy đủ kỹ năng – nghe, nói, đọc, viết từ sơ cấp đến ΤΟΡΙΚ 6.</Text>
          </View>
        </View>

          <TouchableOpacity style={styles.upgradeBtn}>
            <Text style={styles.upgradeBtnText}>Nâng cấp gói</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>

      {/* Korean Culture Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Văn hóa Hàn Quốc</Text>
          <TouchableOpacity onPress={() => (navigation as any).navigate('StdCulture')}>
            <Text style={styles.seeAll}>Xem thêm</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={cultureCategories}
          renderItem={({ item }) => <CultureItem item={item} />}
          keyExtractor={(item) => item.id}
          numColumns={1}
          scrollEnabled={false}
        />
      </View>

      {/* Bottom spacing */}
      <View style={{ height: spacing.xxl }} />
    </ScrollView>
  )
}

export default HomeStd

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.light.background },
  container: { padding: spacing.md, paddingBottom: spacing.xxl },

  // Header
  header: { backgroundColor: colors.light.primary, borderRadius: 12, padding: spacing.lg, marginBottom: spacing.lg },
  headerContent: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.md },
  avatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: palette.white, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  avatarText: { fontSize: 28 },
  greeting: { fontSize: typography.fontSizes.lg, fontWeight: '700', color: palette.white, marginBottom: 4 },
  greetingSubtitle: { fontSize: 12, color: palette.white, lineHeight: 16 },
  signUpBtn: { backgroundColor: palette.white, paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: 8, alignSelf: 'flex-start' },
  signUpText: { color: colors.light.primary, fontWeight: '700', fontSize: 12 },

  // Section
  section: { marginBottom: spacing.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  sectionTitle: { fontSize: typography.fontSizes.md, fontWeight: '700', color: colors.light.text, marginBottom: spacing.md },
  seeAll: { color: colors.light.primary, fontSize: 12, fontWeight: '600' },

  // Learning Modules Grid
  modulesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  moduleItem: { width: '32%', alignItems: 'center', marginBottom: spacing.md },
  moduleIcon: { width: 70, height: 70, borderRadius: 12, borderWidth: 2, borderColor: colors.light.primary, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.sm },
  icon: { fontSize: 32 },
  moduleTitle: { fontSize: 12, color: colors.light.text, fontWeight: '600', textAlign: 'center' },

  // Daily Challenge Card
  dailyChallengeCard: { 
    borderRadius: 12, 
    marginBottom: spacing.lg,
    overflow: 'hidden',
    minHeight: 500
  },
  backgroundImage: {
    borderRadius: 12,
    opacity: 0.6
  },
  challengeOverlay: {
    borderRadius: 12,
    padding: spacing.lg,
    margin: spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4
  },
  challengeTag: { backgroundColor: '#FF6B35', color: palette.white, paddingHorizontal: spacing.md, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start', marginBottom: spacing.md, fontWeight: '700', fontSize: 12 },
  challengeTitle: { 
    fontSize: typography.fontSizes.lg, 
    fontWeight: '800', 
    color: '#1a202c', 
    marginBottom: 6,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2
  },
  challengeSubtitle: { 
    fontSize: 13, 
    color: '#2d3748', 
    marginBottom: spacing.sm,
    fontWeight: '600',
    textShadowColor: 'rgba(255, 255, 255, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1
  },
  challengeHint: { 
    fontSize: 12, 
    color: '#c53030', 
    marginBottom: spacing.md, 
    fontStyle: 'italic',
    fontWeight: '600',
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1
  },

  // Counter
  counterContainer: { flexDirection: 'row', justifyContent: 'flex-start', marginBottom: spacing.lg, gap: spacing.xs },
  counterDigit: { 
    width: 40, 
    height: 40, 
    backgroundColor: 'rgba(255, 255, 255, 0.9)', 
    borderRadius: 4, 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3
  },
  digitText: { fontSize: 18, fontWeight: '700', color: colors.light.text },

  // Challenge Info
  challengeInfo: { 
    backgroundColor: 'rgba(168, 197, 216, 0.85)', 
    borderRadius: 8, 
    padding: spacing.md, 
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2
  },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  infoAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: spacing.sm },
  infoText: { flex: 1, fontSize: 11, color: palette.white, lineHeight: 14 },

  // Flags
  flagsSection: { marginBottom: spacing.md },
  flagRowCenter: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md, gap: spacing.xs },
  flagRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.sm },
  checkmarkContainer: {
    marginRight: spacing.sm,
    width: 30,
    alignItems: 'center'
  },
  checkmark: {
    fontSize: 18,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2
  },
  flag: { fontSize: 32, marginRight: spacing.sm, width: 30 },
  flagLabel: { 
    flex: 1, 
    fontSize: 12, 
    color: '#2d3748', 
    lineHeight: 16,
    fontWeight: '600',
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1
  },

  // Upgrade Button
  upgradeBtn: { backgroundColor: '#FF6B35', paddingVertical: spacing.md, borderRadius: 8, alignItems: 'center' },
  upgradeBtnText: { color: palette.white, fontWeight: '700', fontSize: typography.fontSizes.md },

  // Culture Card
  cultureCard: { backgroundColor: colors.light.card, borderRadius: 12, padding: spacing.md, marginBottom: spacing.md, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.light.border },
  cultureIcon: { fontSize: 32, marginRight: spacing.md },
  cultureTitle: { fontSize: typography.fontSizes.md, fontWeight: '600', color: colors.light.text }
})
