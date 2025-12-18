import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../../hooks/useAuth';
import { typography } from '../../../theme/typography';
// Icons từ phosphor
import {
  TrendUpIcon,
  MedalIcon,
  UserIcon,
  LockIcon,
  BellIcon,
  TargetIcon,
  TimerIcon,
  CaretRightIcon,
} from 'phosphor-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

// Khớp với bảng màu của Exams Screen
const COLORS = {
  primaryGreen: '#00C853',
  textDark: '#1A1A1A',
  textGray: '#666666',
  cardBg: '#F0F2F5',
  iconContainer: '#E0E0E0',
  white: '#FFFFFF',
  error: '#FF5252',
  logoutBg: '#FFCDD2',
};

export default function DashboardStd() {
  const { logout, user } = useAuth();
  const router = useRouter()

  // Logic Đăng xuất giữ nguyên
  const handleLogout = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: async () => {
          try {
            await logout();
          } catch (error) {
            console.error(error);
          }
        }
      }
    ]);
  };

  // Component phụ trợ cho từng dòng cài đặt
  const SettingRow = ({ icon: Icon, label, onPress, isLast = false }: any) => (
    <TouchableOpacity 
      style={[styles.settingRow, !isLast && styles.borderBottom]} 
      onPress={onPress}
      activeOpacity={0.6}
    >
      <View style={styles.iconWrapper}>
        <Icon size={22} color={COLORS.primaryGreen} weight="bold" />
      </View>
      <Text style={styles.settingLabel}>{label}</Text>
      <CaretRightIcon size={18} color={COLORS.textDark} weight="bold" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header cong giống màn hình Exams */}
      <View style={styles.headerBackgroundShape} />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          <Text style={styles.headerTitle}>Cá nhân</Text>

          {/* --- Profile Info Section --- */}
          <View style={styles.profileSection}>
            <Image 
              source={{ uri: user?.avatar || 'https://dimensions.edu.vn/upload/2025/01/avt-doi-meme-006.webp' }} 
              style={styles.avatar} 
            />
            <View style={styles.profileText}>
              <Text style={styles.username}>{user?.fullName || 'username'}</Text>
              <Text style={styles.expText}>470 exp</Text>
            </View>
          </View>

          {/* --- Top Quick Nav Cards --- */}
          <View style={styles.quickNavContainer}>
            <TouchableOpacity style={styles.navCard} onPress={() => {
              router.push('/(student)/learning-history/progress');
            }}>
              <View style={styles.iconWrapper}>
                <TrendUpIcon size={24} color={COLORS.primaryGreen} weight="bold" />
              </View>
              <Text style={styles.navCardText}>Tiến độ học tập</Text>
              <CaretRightIcon size={18} color={COLORS.textDark} weight="bold" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.navCard} onPress={() => {
              router.push('/(student)/learning-history/achievements');
            }}>
              <View style={styles.iconWrapper}>
                <MedalIcon size={24} color={COLORS.primaryGreen} weight="bold" />
              </View>
              <Text style={styles.navCardText}>Thành tích</Text>
              <CaretRightIcon size={18} color={COLORS.textDark} weight="bold" />
            </TouchableOpacity>
          </View>

          {/* --- Tài khoản Group --- */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Tài khoản</Text>
            <SettingRow icon={UserIcon} label="Thông tin cá nhân" />
            <SettingRow icon={LockIcon} label="Đổi mật khẩu" />
            <SettingRow icon={BellIcon} label="Email và thông báo" isLast={true} />
          </View>

          {/* --- Học tập Group --- */}
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Học tập</Text>
            <SettingRow icon={TargetIcon} label="Mục tiêu hằng ngày" />
            <SettingRow icon={TimerIcon} label="Nhắc nhở học tập" isLast={true} />
          </View>

          {/* --- Logout Button --- */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Đăng xuất</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  // Header Wavy Shape
  headerBackgroundShape: {
    position: 'absolute',
    top: -width * 0.6,
    left: -width * 0.1,
    right: -width * 0.1,
    height: width * 0.8,
    backgroundColor: '#F7F9FC',
    borderBottomLeftRadius: width,
    borderBottomRightRadius: width,
    transform: [{ scaleX: 1.2 }],
  },
  safeArea: { flex: 1},
  scrollContent: { padding: 20 },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.primaryGreen,
    marginBottom: 30,
  },

  // Profile
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: { width: 90, height: 90, borderRadius: 45, borderWidth: 2, borderColor: COLORS.primaryGreen },
  profileText: { marginLeft: 20 },
  username: { fontSize: 20, fontWeight: '700', color: COLORS.textDark },
  expText: { fontSize: 14, color: COLORS.textGray, marginTop: 4 },

  // Nav Cards
  quickNavContainer: { marginBottom: 20 },
  navCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  navCardText: { flex: 1, fontSize: 16, fontWeight: '700', color: COLORS.textDark, marginLeft: 12 },

  // Sections
  sectionCard: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 24,
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 16,
    marginLeft: 4,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  iconWrapper: {
    width: 40,
    height: 40,
    backgroundColor: COLORS.iconContainer,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textDark,
    marginLeft: 12,
  },

  // Logout
  logoutButton: {
    backgroundColor: COLORS.logoutBg,
    borderRadius: 30,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 2,
    borderColor: COLORS.error,
  },
  logoutText: {
    color: COLORS.error,
    fontWeight: '800',
    fontSize: 16,
  },
});