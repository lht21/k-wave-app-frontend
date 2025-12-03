import * as React from 'react'
import { useState } from 'react'
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  ActivityIndicator
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import * as ImagePicker from 'expo-image-picker'
import { AuthContext } from '../../contexts/AuthContext'
import { userService } from '../../services/userService'
import { spacing } from '../../theme/spacing'
import { colors } from '../../theme/colors'
import { typography } from '../../theme/typography'

const EditProfile: React.FC = () => {
  const navigation = useNavigation()
  const authContext = React.useContext(AuthContext)

  if (!authContext) {
    throw new Error('EditProfile must be used within an AuthProvider')
  }

  const { user, getUserProfile, updateUser } = authContext

  // State for editable fields
  const [fullName, setFullName] = useState(user?.fullName || '')
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || '')
  const [loading, setLoading] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Track changes
  React.useEffect(() => {
    const nameChanged = fullName !== (user?.fullName || '')
    const avatarChanged = avatarUrl !== (user?.avatar || '')
    setHasChanges(nameChanged || avatarChanged)
  }, [fullName, avatarUrl, user])

  const handleSave = async () => {
    if (!hasChanges) {
      Alert.alert('Thông báo', 'Không có thay đổi nào để lưu')
      return
    }

    if (!fullName.trim()) {
      Alert.alert('Lỗi', 'Họ và tên không được để trống')
      return
    }

    try {
      setLoading(true)
      
      // Call API to update profile
      const response = await userService.updateProfile({
        fullName: fullName.trim(),
        ...(avatarUrl.trim() && { avatar: avatarUrl.trim() })
      })

      if (response.success) {
        // Update user in context
        if (response.user) {
          updateUser(response.user)
        }
        
        Alert.alert('Thành công', 'Cập nhật thông tin thành công!', [
          {
            text: 'OK',
            onPress: () => {
              navigation.goBack()
            }
          }
        ])
      } else {
        Alert.alert('Lỗi', response.msg || 'Không thể cập nhật thông tin')
      }
    } catch (error: any) {
      console.error('❌ Update profile error:', error)
      Alert.alert('Lỗi', 'Đã xảy ra lỗi khi cập nhật thông tin')
    } finally {
      setLoading(false)
    }
  }

  const pickImage = async () => {
    try {
      // Request permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync()
      
      if (permissionResult.granted === false) {
        Alert.alert('Cần quyền truy cập', 'Ứng dụng cần quyền truy cập thư viện ảnh để thay đổi avatar')
        return
      }

      // Show image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // Square aspect ratio
        quality: 0.8,
        base64: true, // Get base64 for upload
      })

      if (!result.canceled && result.assets[0]) {
        const selectedImage = result.assets[0]
        // For now, just set the local URI. In production, you'd upload to server
        setAvatarUrl(selectedImage.uri)
      }
    } catch (error) {
      console.error('Error picking image:', error)
      Alert.alert('Lỗi', 'Không thể chọn ảnh')
    }
  }

  const takePhoto = async () => {
    try {
      // Request camera permissions
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync()
      
      if (permissionResult.granted === false) {
        Alert.alert('Cần quyền truy cập', 'Ứng dụng cần quyền sử dụng camera để chụp ảnh đại diện')
        return
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1], // Square aspect ratio
        quality: 0.8,
        base64: true, // Get base64 for upload
      })

      if (!result.canceled && result.assets[0]) {
        const takenPhoto = result.assets[0]
        setAvatarUrl(takenPhoto.uri)
      }
    } catch (error) {
      console.error('Error taking photo:', error)
      Alert.alert('Lỗi', 'Không thể chụp ảnh')
    }
  }

  const showImageOptions = () => {
    Alert.alert(
      'Chọn ảnh avatar',
      'Bạn muốn thay đổi ảnh đại diện bằng cách nào?',
      [
        {
          text: 'Chụp ảnh mới',
          onPress: takePhoto
        },
        {
          text: 'Chọn từ thư viện',
          onPress: pickImage
        },
        {
          text: 'Nhập URL',
          onPress: () => {
            // User can manually type URL in the input field
          }
        },
        {
          text: 'Hủy',
          style: 'cancel'
        }
      ]
    )
  }

  const handleCancel = () => {
    if (hasChanges) {
      Alert.alert(
        'Hủy thay đổi',
        'Bạn có chắc chắn muốn hủy? Các thay đổi sẽ không được lưu.',
        [
          { text: 'Tiếp tục chỉnh sửa', style: 'cancel' },
          { 
            text: 'Hủy thay đổi', 
            style: 'destructive',
            onPress: () => navigation.goBack()
          }
        ]
      )
    } else {
      navigation.goBack()
    }
  }

  const resetAvatar = () => {
    setAvatarUrl('https://dimensions.edu.vn/upload/2025/01/avt-doi-meme-006.webp')
  }

  const updateUserProfile = async (data: { fullName: string; avatar: string | null }) => {
    const token = await authContext.token || ''
    
    const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/user/profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    })

    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.msg || 'Cập nhật thất bại')
    }

    return result
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleCancel}
        >
          <Text style={styles.backButtonText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chỉnh sửa thông tin</Text>
        <TouchableOpacity 
          style={[styles.saveButton, !hasChanges && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={!hasChanges || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={[styles.saveButtonText, !hasChanges && styles.saveButtonTextDisabled]}>
              Lưu
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <Text style={styles.sectionTitle}>Ảnh đại diện</Text>
          <View style={styles.avatarContainer}>
            <Image 
              source={{ uri: avatarUrl || 'https://dimensions.edu.vn/upload/2025/01/avt-doi-meme-006.webp' }} 
              style={styles.avatar} 
            />
            <TouchableOpacity style={styles.changeAvatarButton} onPress={showImageOptions}>
              <Text style={styles.changeAvatarText}>📷 Thay đổi</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.avatarInputSection}>
            <Text style={styles.inputLabel}>URL ảnh đại diện</Text>
            <TextInput
              style={styles.textInput}
              value={avatarUrl}
              onChangeText={setAvatarUrl}
              placeholder="Nhập URL ảnh đại diện hoặc chọn từ thư viện"
              placeholderTextColor={colors.light.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity style={styles.resetAvatarButton} onPress={resetAvatar}>
              <Text style={styles.resetAvatarText}>🔄 Đặt lại mặc định</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Basic Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>
          
          {/* Full Name - Editable */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Họ và tên *</Text>
            <TextInput
              style={styles.textInput}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Nhập họ và tên"
              placeholderTextColor={colors.light.textSecondary}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          {/* Username - Read Only */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Tên đăng nhập</Text>
            <View style={[styles.textInput, styles.readOnlyInput]}>
              <Text style={styles.readOnlyText}>{user?.username || 'Chưa cập nhật'}</Text>
            </View>
            <Text style={styles.helperText}>Tên đăng nhập không thể thay đổi</Text>
          </View>

          {/* Email - Read Only */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <View style={[styles.textInput, styles.readOnlyInput]}>
              <Text style={styles.readOnlyText}>{user?.email || 'Chưa cập nhật'}</Text>
            </View>
            <Text style={styles.helperText}>Email không thể thay đổi</Text>
          </View>

          {/* Role - Read Only */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Vai trò</Text>
            <View style={[styles.textInput, styles.readOnlyInput]}>
              <Text style={styles.readOnlyText}>
                {user?.role === 'student' ? '👩‍🎓 Học viên' : 
                 user?.role === 'teacher' ? '👨‍🏫 Giáo viên' : 
                 user?.role || 'Chưa xác định'}
              </Text>
            </View>
          </View>
        </View>

        {/* Additional Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin bổ sung</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Trình độ hiện tại</Text>
              <Text style={styles.infoValue}>{user?.level || 'Chưa xác định'}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>TOPIK đạt được</Text>
              <Text style={styles.infoValue}>{user?.topikAchievement || 'Chưa có'}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ngày tham gia</Text>
              <Text style={styles.infoValue}>
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'Không rõ'}
              </Text>
            </View>
          </View>
        </View>

        {/* Warning Text */}
        <View style={styles.warningSection}>
          <Text style={styles.warningText}>
            💡 Chỉ có thể thay đổi họ tên và ảnh đại diện. 
            Để thay đổi email hoặc tên đăng nhập, vui lòng liên hệ hỗ trợ.
          </Text>
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
  saveButton: {
    backgroundColor: colors.light.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButtonTextDisabled: {
    color: '#999',
  },
  avatarSection: {
    backgroundColor: colors.light.card,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.md,
    fontWeight: '600',
    color: colors.light.text,
    marginBottom: spacing.md,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f8f9fa',
    borderWidth: 3,
    borderColor: colors.light.primary,
  },
  changeAvatarButton: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: colors.light.primary,
    paddingHorizontal: spacing.xs,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  changeAvatarText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  avatarInputSection: {
    marginTop: spacing.sm,
  },
  section: {
    backgroundColor: colors.light.card,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.light.text,
    marginBottom: spacing.xs,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: colors.light.text,
    backgroundColor: colors.light.background,
  },
  readOnlyInput: {
    backgroundColor: '#f8f9fa',
    borderColor: '#e9ecef',
  },
  readOnlyText: {
    fontSize: 16,
    color: colors.light.textSecondary,
  },
  helperText: {
    fontSize: 12,
    color: colors.light.textSecondary,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  resetAvatarButton: {
    backgroundColor: '#6c757d',
    paddingVertical: spacing.xs,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  resetAvatarText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  infoCard: {
    backgroundColor: colors.light.background,
    borderRadius: 8,
    padding: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
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
  warningSection: {
    backgroundColor: '#fff3cd',
    padding: spacing.md,
    margin: spacing.md,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  warningText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
})

export default EditProfile