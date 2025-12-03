import * as React from 'react'
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { AuthContext } from '../../contexts/AuthContext'
import { spacing } from '../../theme/spacing'
import { colors } from '../../theme/colors'
import { typography } from '../../theme/typography'

// Vertical pill used for weekly progress (vertical bar with fill based on percentage)
const ProgressPill: React.FC<{ percent: number; active?: boolean }> = ({ percent = 0, active = false }) => {
  const fillHeight = Math.max(0, percent)
  const emptyHeight = 100 - fillHeight
  return (
    <View style={styles.pillContainer}>
      <View style={styles.pillWrapper}>
        {/* Empty (light) portion - top */}
        {emptyHeight > 0 && (
          <View style={[styles.pillSegment, { flex: emptyHeight, backgroundColor: '#D8F1E4' }]} />
        )}
        {/* Filled (dark) portion - bottom */}
        {fillHeight > 0 && (
          <View style={[styles.pillSegment, { flex: fillHeight, backgroundColor: colors.light.primary }]} />
        )}
      </View>
    </View>
  )
}

// Horizontal bar used for lesson / stat lines
const HorizontalBar: React.FC<{ percent: number }> = ({ percent = 0 }) => {
  return (
    <View style={styles.hBarWrap}>
      <View style={[styles.hBar, { width: `${percent}%` }]} />
    </View>
  )
}

const DashboardStd: React.FC = () => {
  const navigation = useNavigation()
  const authContext = React.useContext(AuthContext)
  const [activeTab, setActiveTab] = React.useState('progress')

  if (!authContext) {
    throw new Error('DashboardStd must be used within an AuthProvider')
  }

  const { user, getUserProfile, logout } = authContext

  // Load user profile if not available
  React.useEffect(() => {
    if (!user) {
      getUserProfile()
    }
  }, [])

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        {
          text: 'Hủy',
          style: 'cancel'
        },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout()
              // Navigate to login screen
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' as never }]
              })
            } catch (error) {
              console.error('❌ Logout error:', error)
              Alert.alert('Lỗi', 'Không thể đăng xuất. Vui lòng thử lại.')
            }
          }
        }
      ]
    )
  }

  const handleTabPress = (tabName: string) => {
    setActiveTab(tabName)
  }

  const renderProgressContent = () => {
    // Calculate real progress data
    const completedLessons = user?.progress?.completedLessons?.length || 0;
    const totalStudyTime = user?.progress?.totalStudyTime || 0;
    const streakDays = user?.progress?.streakDays || 0;
    
    return (
      <>
        {/* Weekly practice progress card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tiến độ luyện tập hàng tuần</Text>

          <View style={styles.weeklyRow}>
            <View style={{ width: 132, justifyContent: 'center' }}>
              <Text style={styles.smallText}>Hôm nay, {new Date().toLocaleDateString('vi-VN')}</Text>
              <Text style={styles.bigText}>{user?.usageStats?.lessonsToday || 0} bài học</Text>
              <Text style={styles.smallText}>Tổng thời gian</Text>
              <Text style={[styles.bigText, { fontSize: 12 }]}>{user?.progress?.totalStudyTime || 0} phút</Text>
            </View>

            <View style={styles.weekPills}>
              {weeklyProgress.map((w, idx) => (
                <View key={w.day} style={styles.weekItem}>
                  <ProgressPill percent={w.percent} active={idx === 0} />
                  <Text style={styles.weekLabel}>{w.day}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* User Stats Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Thông tin tài khoản</Text>
          <View style={styles.userStatsContainer}>
            <View style={styles.userStatItem}>
              <Text style={styles.userStatLabel}>Gói đăng ký</Text>
              <Text style={styles.userStatValue}>
                {user?.subscription?.type === 'premium' ? '🌟 Premium' : '🆓 Miễn phí'}
              </Text>
            </View>
            <View style={styles.userStatItem}>
              <Text style={styles.userStatLabel}>Bài học hoàn thành</Text>
              <Text style={styles.userStatValue}>{completedLessons} bài</Text>
            </View>
            <View style={styles.userStatItem}>
              <Text style={styles.userStatLabel}>Chuỗi ngày học</Text>
              <Text style={styles.userStatValue}>{streakDays} ngày</Text>
            </View>
            <View style={styles.userStatItem}>
              <Text style={styles.userStatLabel}>TOPIK</Text>
              <Text style={styles.userStatValue}>{user?.topikAchievement || 'Chưa có'}</Text>
            </View>
          </View>
        </View>

        {/* Lesson stats card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Thống kê bài học</Text>
          <View style={{ marginTop: spacing.sm }}>
            {lessonStats.map((ls) => (
              <View key={ls.title} style={styles.lessonRow}>
                <Text style={styles.lessonTitle}>{ls.title}</Text>
                <HorizontalBar percent={ls.percent} />
              </View>
            ))}
          </View>
        </View>

        {/* Exam stats */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Thống kê điểm thi</Text>
          <View style={{ marginTop: spacing.sm }}>
            <View style={styles.weeklyRow}>
              <View style={{ width: 132, justifyContent: 'center' }}>
                <Text style={styles.smallText}>Tháng này</Text>
                <Text style={styles.bigText}>{user?.usageStats?.examsThisMonth || 0} bài thi</Text>
                <Text style={styles.smallText}>Giới hạn</Text>
                <Text style={[styles.bigText, { fontSize: 12 }]}>{user?.limits?.monthlyExams || 0} bài/tháng</Text>
              </View>

              <View style={styles.weekPills}>
                {weeklyProgress.map((w, idx) => (
                  <View key={`exam-${w.day}`} style={styles.weekItem}>
                    <ProgressPill percent={w.percent > 10 ? w.percent - 10 : w.percent} active={idx === 0} />
                    <Text style={styles.weekLabel}>{w.day}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>
      </>
    )
  }

  const renderAchievementsContent = () => (
    <>
      {/* Achievements/Badges */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Danh hiệu đạt được</Text>
        
        <View style={styles.achievementGrid}>
          <View style={styles.achievementItem}>
            <View style={styles.achievementIcon}>
              <Text style={styles.achievementEmoji}>🏆</Text>
            </View>
            <Text style={styles.achievementTitle}>Chuỗi ngày vàng</Text>
            <Text style={styles.achievementDesc}>Học 7 ngày liên tiếp</Text>
          </View>
          
          <View style={styles.achievementItem}>
            <View style={styles.achievementIcon}>
              <Text style={styles.achievementEmoji}>⚡</Text>
            </View>
            <Text style={styles.achievementTitle}>Người không bỏ cuộc</Text>
            <Text style={styles.achievementDesc}>Hoàn thành 50 bài</Text>
          </View>
          
          <View style={styles.achievementItem}>
            <View style={styles.achievementIcon}>
              <Text style={styles.achievementEmoji}>🎯</Text>
            </View>
            <Text style={styles.achievementTitle}>Người thí đinh cao</Text>
            <Text style={styles.achievementDesc}>Đạt 90% điểm thi</Text>
          </View>
        </View>
      </View>

      {/* Ranking */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Bảng xếp hạng</Text>
        <View style={styles.rankingHeader}>
          <Text style={styles.rankingTitle}>TOP 5</Text>
        </View>
        
        <View style={styles.rankingList}>
          <View style={styles.rankingItem}>
            <Text style={styles.rank}>1</Text>
            <View style={styles.rankingAvatar}>
              <Text style={styles.rankingAvatarText}>A</Text>
            </View>
            <Text style={styles.rankingName}>Nguyễn Thị A</Text>
            <Text style={styles.rankingScore}>1250 exp</Text>
          </View>
          
          <View style={styles.rankingItem}>
            <Text style={styles.rank}>2</Text>
            <View style={styles.rankingAvatar}>
              <Text style={styles.rankingAvatarText}>B</Text>
            </View>
            <Text style={styles.rankingName}>Trần Văn B</Text>
            <Text style={styles.rankingScore}>1180 exp</Text>
          </View>
          
          <View style={styles.rankingItem}>
            <Text style={styles.rank}>3</Text>
            <View style={styles.rankingAvatar}>
              <Text style={styles.rankingAvatarText}>C</Text>
            </View>
            <Text style={styles.rankingName}>Lê Thị C</Text>
            <Text style={styles.rankingScore}>950 exp</Text>
          </View>
          
          <View style={styles.rankingItem}>
            <Text style={styles.rank}>4</Text>
            <View style={styles.rankingAvatar}>
              <Text style={styles.rankingAvatarText}>D</Text>
            </View>
            <Text style={styles.rankingName}>Phạm Văn D</Text>
            <Text style={styles.rankingScore}>820 exp</Text>
          </View>
          
          <View style={[styles.rankingItem, styles.currentUser]}>
            <Text style={[styles.rank, styles.currentUserText]}>5</Text>
            <View style={[styles.rankingAvatar, styles.currentUserAvatar]}>
              <Text style={styles.rankingAvatarText}>
                {user?.fullName?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            <Text style={[styles.rankingName, styles.currentUserText]}>
              {user?.fullName || 'Người dùng'} (Bạn)
            </Text>
            <Text style={[styles.rankingScore, styles.currentUserText]}>
              {user?.progress?.totalStudyTime || 0} phút
            </Text>
          </View>
        </View>
      </View>
    </>
  )

  const renderSettingsContent = () => (
    <>
      {/* Account Settings */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Tài khoản</Text>
        <TouchableOpacity 
          style={styles.settingItem}
          onPress={() => (navigation as any).navigate('UserProfile')}
        >
          <Text style={styles.settingText}>Thông tin cá nhân</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>Đổi mật khẩu</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>Email & thông báo</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Learning Settings */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Học tập</Text>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>Mục tiêu hàng ngày</Text>
          <Text style={styles.settingValue}>30 phút</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>Nhắc nhở học tập</Text>
          <Text style={styles.settingValue}>Bật</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>Âm thanh</Text>
          <Text style={styles.settingValue}>Bật</Text>
        </TouchableOpacity>
      </View>

      {/* Other Settings */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Khác</Text>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>Về K-Wave</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>Điều khoản sử dụng</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.settingItem}
          onPress={handleLogout}
        >
          <Text style={[styles.settingText, styles.logoutText]}>Đăng xuất</Text>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
      </View>
    </>
  )

  const renderTabContent = () => {
    switch (activeTab) {
      case 'achievements':
        return renderAchievementsContent()
      case 'settings':
        return renderSettingsContent()
      default:
        return renderProgressContent()
    }
  }
  // Mocked data for now — the UI is ready to receive real API data
  const weeklyProgress = [
    { day: 'T2', percent: 80 },
    { day: 'T3', percent: 40 },
    { day: 'T4', percent: 0 },
    { day: 'T5', percent: 0 },
    { day: 'T6', percent: 0 },
    { day: 'T7', percent: 0 },
    { day: 'CN', percent: 0 }
  ]

  const lessonStats = [
    { title: 'Từ vựng', percent: 80 },
    { title: 'Ngữ pháp', percent: 60 },
    { title: 'Nghe', percent: 50 },
    { title: 'Đọc', percent: 40 },
    { title: 'Viết', percent: 20 }
  ]

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image 
          source={{ 
            uri: user?.avatar || 'https://dimensions.edu.vn/upload/2025/01/avt-doi-meme-006.webp' 
          }} 
          style={styles.avatar} 
        />
        <View style={{ marginLeft: spacing.md }}>
          <Text style={styles.name}>{user?.fullName || 'Đang tải...'}</Text>
          <Text style={styles.sub}>
            {user?.progress?.totalStudyTime || 0} phút học • {user?.level || 'Chưa xác định'}
          </Text>
          <Text style={styles.sub}>
            Chuỗi ngày: {user?.progress?.streakDays || 0} ngày
          </Text>
        </View>
      </View>

      {/* Tabs - now with active state */}
      <View style={styles.tabsRow}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'progress' && styles.tabActive]} 
          onPress={() => handleTabPress('progress')}
        >
          <Text style={[styles.tabText, activeTab === 'progress' && styles.tabTextActive]}>Tiến độ</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'achievements' && styles.tabActive]} 
          onPress={() => handleTabPress('achievements')}
        >
          <Text style={[styles.tabText, activeTab === 'achievements' && styles.tabTextActive]}>Thành tích</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'settings' && styles.tabActive]} 
          onPress={() => handleTabPress('settings')}
        >
          <Text style={[styles.tabText, activeTab === 'settings' && styles.tabTextActive]}>Cài đặt</Text>
        </TouchableOpacity>
      </View>

      {/* Tab content */}
      {renderTabContent()}

    </ScrollView>
  )
}

export default DashboardStd

const styles = StyleSheet.create({
  screen: { backgroundColor: colors.light.background },
  container: { padding: spacing.md, paddingTop: 40 },
  header: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.light.card },
  name: { fontSize: typography.fontSizes.lg, fontFamily: typography.fonts.bold, color: colors.light.text, marginBottom: 6 },
  sub: { color: colors.light.textSecondary, fontSize: 12 },

  tabsRow: { flexDirection: 'row', marginTop: spacing.md, marginBottom: spacing.md },
  tab: { 
    flex: 1, 
    paddingVertical: spacing.sm, 
    alignItems: 'center', 
    borderBottomWidth: 2, 
    borderColor: 'transparent',
    backgroundColor: 'transparent'
  },
  tabActive: { borderColor: colors.light.primary },
  tabText: { color: colors.light.textSecondary, fontSize: typography.fontSizes.md },
  tabTextActive: { color: colors.light.primary, fontWeight: '700' },

  card: { backgroundColor: colors.light.card, borderRadius: 12, padding: spacing.md, marginBottom: spacing.md, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 1 },
  cardTitle: { color: colors.light.textSecondary, fontWeight: '700', marginBottom: spacing.sm },

  weeklyRow: { flexDirection: 'row', alignItems: 'center' },
  weekPills: { flex: 1, flexDirection: 'row', justifyContent: 'space-around', paddingLeft: spacing.md, paddingRight: spacing.sm },
  weekItem: { alignItems: 'center', width: 30 },
  weekLabel: { fontSize: 12, color: colors.light.textSecondary, marginTop: 6 },

  pillContainer: { justifyContent: 'flex-end', alignItems: 'center', height: 80 },
  pillWrapper: { width: 18, height: '100%', borderRadius: 9, overflow: 'hidden', flexDirection: 'column' },
  pillSegment: { width: '100%' },
  pill: { width: 20, borderRadius: 20 },
  pillActive: { backgroundColor: colors.light.primary },
  pillInactive: { backgroundColor: '#D8F1E4' },

  // horizontal lesson list
  lessonRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  lessonTitle: { width: 80, color: colors.light.textSecondary, fontSize: 13 },
  hBarWrap: { flex: 1, height: 14, backgroundColor: '#F1F7F3', borderRadius: 12, overflow: 'hidden' },
  hBar: { height: '100%', backgroundColor: colors.light.primary, borderRadius: 12 },

  smallText: { fontSize: 12, color: colors.light.textSecondary },
  bigText: { fontSize: 16, fontWeight: '700', color: colors.light.text },

  // Settings styles
  comingSoon: {
    fontSize: 14,
    color: colors.light.primary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: spacing.sm
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  settingText: {
    fontSize: 14,
    color: colors.light.text,
    flex: 1
  },
  settingValue: {
    fontSize: 14,
    color: colors.light.primary,
    fontWeight: '500'
  },
  settingArrow: {
    fontSize: 18,
    color: '#ccc',
    marginLeft: spacing.sm
  },

  // Achievements styles
  achievementGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm
  },
  achievementItem: {
    alignItems: 'center',
    flex: 1,
    marginHorizontal: spacing.xs
  },
  achievementIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs
  },
  achievementEmoji: {
    fontSize: 24
  },
  achievementTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.light.text,
    textAlign: 'center',
    marginBottom: 4
  },
  achievementDesc: {
    fontSize: 10,
    color: colors.light.textSecondary,
    textAlign: 'center'
  },

  // Ranking styles
  rankingHeader: {
    alignItems: 'center',
    marginBottom: spacing.md
  },
  rankingTitle: {
    backgroundColor: colors.light.primary,
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    overflow: 'hidden'
  },
  rankingList: {
    gap: spacing.sm
  },
  rankingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs
  },
  rank: {
    width: 24,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: colors.light.textSecondary
  },
  rankingAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
    marginRight: spacing.sm
  },
  rankingAvatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.light.text
  },
  rankingName: {
    flex: 1,
    fontSize: 14,
    color: colors.light.text
  },
  rankingScore: {
    fontSize: 12,
    color: colors.light.textSecondary,
    fontWeight: '500'
  },
  currentUser: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    marginTop: spacing.xs
  },
  currentUserAvatar: {
    backgroundColor: colors.light.primary
  },
  currentUserText: {
    color: colors.light.primary,
    fontWeight: '600'
  },

  // User stats styles
  userStatsContainer: {
    marginTop: spacing.sm,
    gap: spacing.sm
  },
  userStatItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs
  },
  userStatLabel: {
    fontSize: 14,
    color: colors.light.textSecondary,
    flex: 1
  },
  userStatValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.light.text
  },

  // Logout styles
  logoutText: {
    color: '#dc3545',
    fontWeight: '600'
  }
})
