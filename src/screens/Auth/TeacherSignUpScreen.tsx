import * as React from 'react';
import { useState } from 'react';
import { View, ScrollView, TextInput, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Button from '../../components/Button/Button';
import { colors, palette } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { ViewOffIcon, EyeIcon, GoogleIcon,Facebook02Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react-native';

type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  TeacherSignUp: undefined;
  Main: {
    screen?: string;
  };
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

const TeacherSignUpScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleTeacherSignUp = () => {
    setLoading(true);
    setMessage(null);
    // Giả lập đăng ký giáo viên
    setTimeout(() => {
      setLoading(false);
      setMessage('Đăng ký giáo viên thành công! Vui lòng kiểm tra email để xác thực tài khoản.');
    }, 1500);
  };

  const goToLogin = () => {
    navigation.navigate('Login');
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.backgroundOverlay} />
      
      <View style={styles.contentContainer}>
        <View style={styles.formSection}>
          <Text style={styles.formTitle}>
            Đăng ký giáo viên tại <Text style={styles.brandText}>K-Wave</Text>
          </Text>
          
          {message && (
            <View style={styles.messageBox}>
              <Text style={styles.messageText}>{message}</Text>
            </View>
          )}
          
          <View style={styles.form}>
            <TextInput
              placeholder="Tên đăng nhập"
              placeholderTextColor={colors.light.textSecondary}
              style={styles.input}
              value={formData.username}
              onChangeText={(text) => updateFormData('username', text)}
              autoCapitalize="none"
            />
            
            <TextInput
              placeholder="Họ và tên đầy đủ"
              placeholderTextColor={colors.light.textSecondary}
              style={styles.input}
              value={formData.fullName}
              onChangeText={(text) => updateFormData('fullName', text)}
            />
            
            <TextInput
              placeholder="Nhập Email của bạn"
              placeholderTextColor={colors.light.textSecondary}
              style={styles.input}
              value={formData.email}
              onChangeText={(text) => updateFormData('email', text)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            
            <View style={styles.passwordContainer}>
              <TextInput
                placeholder="Đặt mật khẩu"
                placeholderTextColor={colors.light.textSecondary}
                secureTextEntry={!showPassword}
                style={styles.input}
                value={formData.password}
                onChangeText={(text) => updateFormData('password', text)}
              />
                <TouchableOpacity 
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <HugeiconsIcon 
                    icon={showPassword ? ViewOffIcon : EyeIcon} 
                    size={20} 
                    color={colors.light.textSecondary}
                  />
                </TouchableOpacity>
            </View>
            
            <View style={styles.passwordContainer}>
              <TextInput
                placeholder="Xác nhận mật khẩu"
                placeholderTextColor={colors.light.textSecondary}
                secureTextEntry={!showConfirmPassword}
                style={styles.input}
                value={formData.confirmPassword}
                onChangeText={(text) => updateFormData('confirmPassword', text)}
              />
                <TouchableOpacity 
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <HugeiconsIcon 
                    icon={showPassword ? ViewOffIcon : EyeIcon} 
                    size={20} 
                    color={colors.light.textSecondary}
                  />
                </TouchableOpacity>
            </View>
            
            <Button
              title={loading ? 'Đang đăng ký...' : 'Đăng ký'}
              onPress={handleTeacherSignUp}
              loading={loading}
              size="small"
            />
            
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>hoặc</Text>
              <View style={styles.dividerLine} />
            </View>
            
            <View style={styles.socialLogin}>
              <Text style={styles.socialLoginText}>Hoặc đăng ký bằng</Text>
            <View style={styles.socialButtons}>
                <TouchableOpacity style={styles.socialButton}>
                  <HugeiconsIcon
                    icon={GoogleIcon}
                    size={28}
                    color="#DB4437"     // màu Google
                    strokeWidth={1.8}
                  />
                </TouchableOpacity>

                <TouchableOpacity style={styles.socialButton}>
                  <HugeiconsIcon
                    icon={Facebook02Icon}
                    size={28}
                    color="#1877F2"     // màu Facebook
                    strokeWidth={1.8}
                  />
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.loginSection}>
              <Text style={styles.loginText}>Bạn đã có tài khoản giáo viên?</Text>
              <Button
                title="Đăng nhập ngay!"
                onPress={goToLogin}
                variant="outline"
                size="small"
              />
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.light.background,
    marginTop: 20,
  },
  backgroundOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: palette.gray100,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  formSection: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: palette.white,
    borderRadius: 24,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  formTitle: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 24,
    color: colors.light.text,
    fontFamily: typography.fonts.regular,
  },
  brandText: {
    fontFamily: typography.fonts.koreanBold,
    color: palette.primary,
  },
  messageBox: {
    backgroundColor: palette.success,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  messageText: {
    color: palette.white,
    textAlign: 'center',
    fontFamily: typography.fonts.semiBold,
    fontSize: 14,
  },
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: palette.gray100,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontFamily: typography.fonts.regular,
    fontSize: 14,
    color: colors.light.text,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  passwordContainer: {
    position: 'relative',
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 16,
    zIndex: 1,
  },
  eyeIconText: {
    fontSize: 20,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.light.border,
  },
  dividerText: {
    marginHorizontal: 16,
    fontFamily: typography.fonts.regular,
    fontSize: 14,
    color: colors.light.textSecondary,
  },
  socialLogin: {
    alignItems: 'center',
  },
  socialLoginText: {
    fontFamily: typography.fonts.regular,
    fontSize: 14,
    color: colors.light.textSecondary,
    marginBottom: 16,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialButton: {
    backgroundColor: palette.white,
    padding: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  socialIcon: {
    width: 24,
    height: 24,
  },
  loginSection: {
    alignItems: 'center',
  },
  loginText: {
    fontFamily: typography.fonts.regular,
    fontSize: 14,
    color: colors.light.textSecondary,
    marginBottom: 16,
  },
});

export default TeacherSignUpScreen;