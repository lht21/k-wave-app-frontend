import * as React from 'react';
import { useState, useEffect } from 'react';
import { View, ScrollView, Alert, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { 
  UserIcon,
  Notification01Icon,
  SecurityWifiIcon,
  GlobalIcon,
  BubbleChatQuestionIcon,
  InformationDiamondIcon,
  Logout01Icon,
  SecurityIcon,
  LockIcon,
  ArrowRight01Icon
} from '@hugeicons/core-free-icons';
import Button from '../../components/Button/Button';
import { colors, palette } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { useAuth } from '../../hooks/useAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';

type RootStackParamList = {
  Login: undefined;
  Setting: undefined;
  Home: undefined;
  Profile: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: string;
}

const SettingScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { logout } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // Lấy thông tin user từ AsyncStorage hoặc từ context
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Đăng xuất', 
          onPress: async () => {
            await logout();
            navigation.navigate('Login');
          }
        },
      ]
    );
  };

  const getInitials = (name: string) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
  };

  const accountItems = [
    { 
      title: 'Thông tin cá nhân', 
      icon: UserIcon,
      description: 'Quản lý thông tin tài khoản',
      onPress: () => navigation.navigate('Profile')
    },
    { 
      title: 'Thông báo', 
      icon: Notification01Icon,
      description: 'Cài đặt thông báo',
      onPress: () => console.log('Thông báo')
    },
  ];

  const securityItems = [
    { 
      title: 'Quyền riêng tư', 
      icon: SecurityIcon,
      description: 'Kiểm soát quyền riêng tư',
      onPress: () => console.log('Quyền riêng tư')
    },
    { 
      title: 'Bảo mật', 
      icon: SecurityWifiIcon,
      description: 'Cài đặt bảo mật tài khoản',
      onPress: () => console.log('Bảo mật')
    },
    { 
      title: 'Quyền ứng dụng', 
      icon: LockIcon,
      description: 'Quản lý quyền truy cập',
      onPress: () => console.log('Quyền ứng dụng')
    },
  ];

  const supportItems = [
    { 
      title: 'Ngôn ngữ', 
      icon: GlobalIcon,
      description: 'Thay đổi ngôn ngữ',
      onPress: () => console.log('Ngôn ngữ')
    },
    { 
      title: 'Trợ giúp & Hỗ trợ', 
      icon: BubbleChatQuestionIcon,
      description: 'Câu hỏi thường gặp và hỗ trợ',
      onPress: () => console.log('Trợ giúp')
    },
    { 
      title: 'Về ứng dụng', 
      icon: InformationDiamondIcon,
      description: 'Thông tin phiên bản và giấy phép',
      onPress: () => console.log('Về ứng dụng')
    },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Đang tải...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Cài đặt</Text>
      </View>

      {/* User Info Card */}
      <View style={styles.userCard}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {getInitials(user?.fullName || 'Người dùng')}
            </Text>
          </View>
          <View style={styles.verifiedBadge}>
            <HugeiconsIcon 
              icon={SecurityWifiIcon} 
              size={12} 
              color={palette.white}
            />
          </View>
        </View>
        
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {user?.fullName || 'Người dùng'}
          </Text>
          <Text style={styles.userEmail}>
            {user?.email || 'user@example.com'}
          </Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>
              {user?.role === 'teacher' ? 'Giáo viên' : 'Học viên'}
            </Text>
          </View>
        </View>
      </View>

      {/* Tài khoản */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tài khoản</Text>
        <View style={styles.sectionCard}>
          {accountItems.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={[
                styles.menuItem,
                index === accountItems.length - 1 && styles.lastMenuItem
              ]}
              onPress={item.onPress}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.iconContainer}>
                  <HugeiconsIcon 
                    icon={item.icon} 
                    size={20} 
                    color={colors.light.primary}
                    strokeWidth={2}
                  />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuDescription}>{item.description}</Text>
                </View>
              </View>
              <HugeiconsIcon 
                icon={ArrowRight01Icon} 
                size={16} 
                color={colors.light.textSecondary}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Quyền riêng tư & Bảo mật */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quyền riêng tư & Bảo mật</Text>
        <View style={styles.sectionCard}>
          {securityItems.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={[
                styles.menuItem,
                index === securityItems.length - 1 && styles.lastMenuItem
              ]}
              onPress={item.onPress}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.iconContainer}>
                  <HugeiconsIcon 
                    icon={item.icon} 
                    size={20} 
                    color={colors.light.primary}
                    strokeWidth={2}
                  />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuDescription}>{item.description}</Text>
                </View>
              </View>
              <HugeiconsIcon 
                icon={ArrowRight01Icon} 
                size={16} 
                color={colors.light.textSecondary}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Hỗ trợ & Thông tin */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hỗ trợ & Thông tin</Text>
        <View style={styles.sectionCard}>
          {supportItems.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={[
                styles.menuItem,
                index === supportItems.length - 1 && styles.lastMenuItem
              ]}
              onPress={item.onPress}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.iconContainer}>
                  <HugeiconsIcon 
                    icon={item.icon} 
                    size={20} 
                    color={colors.light.primary}
                    strokeWidth={2}
                  />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuDescription}>{item.description}</Text>
                </View>
              </View>
              <HugeiconsIcon 
                icon={ArrowRight01Icon} 
                size={16} 
                color={colors.light.textSecondary}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Logout Button */}
      <View style={styles.logoutSection}>
        <Button
          title="Đăng xuất"
          onPress={handleLogout}
          variant="danger"
          size="small"
          leftIcon={
            <HugeiconsIcon 
              icon={Logout01Icon} 
              size={20} 
              color={palette.white}
              strokeWidth={2}
            />
          }
        />
        
        {/* Version Info */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>K-Wave v1.0.0</Text>
          <Text style={styles.copyrightText}>© 2024 K-Wave. All rights reserved.</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
    marginTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.light.background,
  },
  header: {
    padding: 20,
    backgroundColor: palette.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  title: {
    fontFamily: typography.fonts.koreanBold,
    fontSize: 24,
    color: colors.light.text,
    textAlign: 'center',
  },
  userCard: {
    backgroundColor: palette.white,
    margin: 16,
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: `linear-gradient(135deg, ${colors.light.primary}, ${palette.primary}99)`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontFamily: typography.fonts.bold,
    fontSize: 20,
    color: palette.white,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: palette.success,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: palette.white,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontFamily: typography.fonts.bold,
    fontSize: 18,
    color: colors.light.text,
    marginBottom: 4,
  },
  userEmail: {
    fontFamily: typography.fonts.regular,
    fontSize: 14,
    color: colors.light.textSecondary,
    marginBottom: 8,
  },
  roleBadge: {
    backgroundColor: colors.light.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  roleText: {
    fontSize: 12,
    color: colors.light.primary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: typography.fonts.semiBold,
    fontSize: 16,
    color: colors.light.text,
    marginLeft: 16,
    marginBottom: 8,
  },
  sectionCard: {
    backgroundColor: palette.white,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: palette.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.light.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    color: colors.light.text,
    marginBottom: 2,
  },
  menuDescription: {
    fontFamily: typography.fonts.regular,
    fontSize: 12,
    color: colors.light.textSecondary,
  },
  logoutSection: {
    padding: 16,
    marginTop: 8,
    marginBottom: 32,
  },
  logoutButton: {
    marginBottom: 20,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  versionText: {
    fontSize: 14,
    color: colors.light.textSecondary,
    marginBottom: 4,
  },
  copyrightText: {
    fontFamily: typography.fonts.regular,
    fontSize: 12,
    color: colors.light.textSecondary,
  },
});

export default SettingScreen;