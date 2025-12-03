import * as React from 'react'
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity,
  SafeAreaView,
  Alert 
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { AuthContext } from '../../contexts/AuthContext'
import { spacing } from '../../theme/spacing'
import { colors } from '../../theme/colors'
import { typography } from '../../theme/typography'

const UserProfile: React.FC = () => {
  const navigation = useNavigation()
  const authContext = React.useContext(AuthContext)

  if (!authContext) {
    throw new Error('UserProfile must be used within an AuthProvider')
  }

  const { user, getUserProfile } = authContext

  // Load user profile if not available
  React.useEffect(() => {
    if (!user) {
      getUserProfile()
    }
  }, [])

  const handleEditProfile = () => {
    (navigation as any).navigate('EditProfile')
  }

  const handleChangeAvatar = () => {
    Alert.alert('Thông báo', 'Chức năng thay đổi avatar đang phát triển')
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thông tin cá nhân</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <TouchableOpacity 
            style={styles.avatarContainer}
            onPress={handleChangeAvatar}
          >
            <Image 
              source={{ 
                uri: user?.avatar || 'https://dimensions.edu.vn/upload/2025/01/avt-doi-meme-006.webp' 
              }} 
              style={styles.avatar} 
            />
            <View style={styles.avatarOverlay}>
              <Text style={styles.avatarOverlayText}>📷</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.changeAvatarText}>Nhấn để thay đổi avatar</Text>
        </View>

        {/* User Info Cards */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>Thông tin cơ bản</Text>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Họ và tên</Text>
              <Text style={styles.infoValue}>{user?.fullName || 'Chưa cập nhật'}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Tên đăng nhập</Text>
              <Text style={styles.infoValue}>{user?.username || 'Chưa cập nhật'}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user?.email || 'Chưa cập nhật'}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Vai trò</Text>
              <Text style={styles.infoValue}>
                {user?.role === 'student' ? '👩‍🎓 Học viên' : 
                 user?.role === 'teacher' ? '👨‍🏫 Giáo viên' : 
                 user?.role || 'Chưa xác định'}
              </Text>
            </View>

            <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
              <Text style={styles.editButtonText}>✏️ Chỉnh sửa thông tin</Text>
            </TouchableOpacity>
          </View>

          {/* Learning Stats Card */}
          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>Thống kê học tập</Text>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Trình độ hiện tại</Text>
              <Text style={styles.infoValue}>{user?.level || 'Chưa xác định'}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>TOPIK đạt được</Text>
              <Text style={styles.infoValue}>{user?.topikAchievement || 'Chưa có'}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Tổng thời gian học</Text>
              <Text style={styles.infoValue}>
                {user?.progress?.totalStudyTime || 0} phút
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Chuỗi ngày học</Text>
              <Text style={styles.infoValue}>
                {user?.progress?.streakDays || 0} ngày
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Bài học hoàn thành</Text>
              <Text style={styles.infoValue}>
                {user?.progress?.completedLessons?.length || 0} bài
              </Text>
            </View>
          </View>

          {/* Subscription Card */}
          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>Thông tin gói</Text>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Gói hiện tại</Text>
              <Text style={[styles.infoValue, 
                user?.subscription?.type === 'premium' ? styles.premiumText : styles.freeText
              ]}>
                {user?.subscription?.type === 'premium' ? '🌟 Premium' : '🆓 Miễn phí'}
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Trạng thái</Text>
              <Text style={styles.infoValue}>
                {user?.subscription?.isActive ? '✅ Đang hoạt động' : '⏸️ Không hoạt động'}
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Bài học/ngày</Text>
              <Text style={styles.infoValue}>
                {user?.limits?.dailyLessons || 0} bài
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Bài thi/tháng</Text>
              <Text style={styles.infoValue}>
                {user?.limits?.monthlyExams || 0} bài
              </Text>
            </View>
            
            {user?.subscription?.type === 'free' && (
              <TouchableOpacity style={styles.upgradeButton}>
                <Text style={styles.upgradeButtonText}>⬆️ Nâng cấp Premium</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Account Info Card */}
          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>Thông tin tài khoản</Text>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Email xác thực</Text>
              <Text style={styles.infoValue}>
                {user?.isEmailVerified ? '✅ Đã xác thực' : '❌ Chưa xác thực'}
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Ngày tham gia</Text>
              <Text style={styles.infoValue}>
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'Không rõ'}
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Cập nhật lần cuối</Text>
              <Text style={styles.infoValue}>
                {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString('vi-VN') : 'Không rõ'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.light.card,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 18,
    color: colors.light.text,
  },
  headerTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: '600',
    color: colors.light.text,
  },
  placeholder: {
    width: 40,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    backgroundColor: colors.light.card,
    marginBottom: spacing.md,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f8f9fa',
    borderWidth: 4,
    borderColor: colors.light.primary,
  },
  avatarOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.light.card,
  },
  avatarOverlayText: {
    fontSize: 16,
    color: 'white',
  },
  changeAvatarText: {
    fontSize: 14,
    color: colors.light.textSecondary,
    fontStyle: 'italic',
  },
  infoSection: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
  },
  infoCard: {
    backgroundColor: colors.light.card,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  cardTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: '600',
    color: colors.light.text,
    marginBottom: spacing.md,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.light.textSecondary,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.light.text,
    flex: 1,
    textAlign: 'right',
  },
  premiumText: {
    color: '#f59e0b',
    fontWeight: '600',
  },
  freeText: {
    color: colors.light.textSecondary,
  },
  editButton: {
    backgroundColor: colors.light.primary,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  editButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  upgradeButton: {
    backgroundColor: '#f59e0b',
    paddingVertical: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  upgradeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
})

export default UserProfile