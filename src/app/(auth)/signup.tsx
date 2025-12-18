// app/(auth)/signup.tsx
import React, { useState } from 'react';
import { View, ScrollView, TextInput, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
// --- THAY ĐỔI 1: Sử dụng useRouter của Expo Router ---
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ViewOffIcon, EyeIcon, GoogleIcon, Facebook02Icon } from '@hugeicons/core-free-icons';

// --- THAY ĐỔI 2: Cập nhật đường dẫn import về src/ ---
import Button from '../../components/Button/Button';
import { colors, palette } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { useAuth } from '../../hooks/useAuth';

const { width } = Dimensions.get('window');

// --- THAY ĐỔI 3: Loại bỏ các Type Navigation cũ ---

interface SignUpFormData {
  username: string;
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const SignUpScreen = () => {
  // --- THAY ĐỔI 4: Khởi tạo Router ---
  const router = useRouter();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const { control, handleSubmit, formState: { errors }, watch } = useForm<SignUpFormData>({
    defaultValues: {
      username: '',
      fullName: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  });

  const password = watch('password');

  const handleSignUp = async (data: SignUpFormData) => {
    setLoading(true);
    setMessage(null);
    
    try {
      const userData = {
        ...data,
        role: 'student' as const // Ép kiểu string sang literal type nếu cần
      };
      
      // Giả sử hàm register trả về kết quả
      await register(userData);
      setMessage('Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.');
      
      // Tự động chuyển đến login sau 2 giây
      setTimeout(() => {
        // --- THAY ĐỔI 5: Dùng router.replace để chuyển sang login ---
        router.replace('/(auth)/login');
      }, 2000);
      
    } catch (error: any) {
      setMessage(error.message || 'Đã xảy ra lỗi khi đăng ký');
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => {
    // --- THAY ĐỔI 6: Điều hướng sang trang Login ---
    // Sử dụng replace nếu bạn không muốn người dùng back lại trang đăng ký
    router.replace('/(auth)/login');
  };

  const goToTeacherSignUp = () => {
    // --- THAY ĐỔI 7: Điều hướng sang trang đăng ký giáo viên ---
    // Giả sử bạn đặt tên file là app/(auth)/teacher-signup.tsx
    router.push('/(auth)/teacher-signup');
  };

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Background Gradient */}
      <View style={styles.backgroundGradient} />
      
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            Đăng Ký Học Viên
          </Text>
          <Text style={styles.subtitle}>
            Bắt đầu hành trình học tiếng Hàn cùng <Text style={styles.brand}>K-Wave</Text>
          </Text>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          {message && (
            <View style={[styles.messageBox, message.includes('thành công') ? styles.successMessage : styles.errorMessage]}>
              <Text style={styles.messageText}>{message}</Text>
            </View>
          )}
          
          <View style={styles.form}>
            {/* Username */}
            <Controller
              control={control}
              rules={{
                required: 'Tên đăng nhập không được để trống',
                minLength: {
                  value: 3,
                  message: 'Tên đăng nhập phải có ít nhất 3 ký tự'
                }
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Tên đăng nhập</Text>
                  <TextInput
                    placeholder="Nhập tên đăng nhập"
                    placeholderTextColor={colors.light.textSecondary}
                    style={[
                      styles.input,
                      errors.username && styles.inputError
                    ]}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    autoCapitalize="none"
                  />
                </View>
              )}
              name="username"
            />
            {errors.username && (
              <Text style={styles.errorText}>{errors.username.message}</Text>
            )}

            {/* Full Name */}
            <Controller
              control={control}
              rules={{
                required: 'Họ và tên không được để trống',
                minLength: {
                  value: 2,
                  message: 'Họ và tên phải có ít nhất 2 ký tự'
                }
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Họ và tên đầy đủ</Text>
                  <TextInput
                    placeholder="Nhập họ và tên của bạn"
                    placeholderTextColor={colors.light.textSecondary}
                    style={[
                      styles.input,
                      errors.fullName && styles.inputError
                    ]}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                  />
                </View>
              )}
              name="fullName"
            />
            {errors.fullName && (
              <Text style={styles.errorText}>{errors.fullName.message}</Text>
            )}

            {/* Email */}
            <Controller
              control={control}
              rules={{
                required: 'Email không được để trống',
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: 'Email không hợp lệ'
                }
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    placeholder="Nhập email của bạn"
                    placeholderTextColor={colors.light.textSecondary}
                    style={[
                      styles.input,
                      errors.email && styles.inputError
                    ]}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              )}
              name="email"
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email.message}</Text>
            )}

            {/* Password */}
            <Controller
              control={control}
              rules={{
                required: 'Mật khẩu không được để trống',
                minLength: {
                  value: 6,
                  message: 'Mật khẩu phải có ít nhất 6 ký tự'
                }
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Mật khẩu</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      placeholder="Nhập mật khẩu"
                      placeholderTextColor={colors.light.textSecondary}
                      secureTextEntry={!showPassword}
                      style={[
                        styles.input,
                        styles.passwordInput,
                        errors.password && styles.inputError
                      ]}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
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
                </View>
              )}
              name="password"
            />
            {errors.password && (
              <Text style={styles.errorText}>{errors.password.message}</Text>
            )}

            {/* Confirm Password */}
            <Controller
              control={control}
              rules={{
                required: 'Xác nhận mật khẩu không được để trống',
                validate: value => value === password || 'Mật khẩu không khớp'
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Xác nhận mật khẩu</Text>
                  <View style={styles.passwordContainer}>
                    <TextInput
                      placeholder="Nhập lại mật khẩu"
                      placeholderTextColor={colors.light.textSecondary}
                      secureTextEntry={!showConfirmPassword}
                      style={[
                        styles.input,
                        styles.passwordInput,
                        errors.confirmPassword && styles.inputError
                      ]}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                    <TouchableOpacity 
                      style={styles.eyeIcon}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      <HugeiconsIcon 
                        icon={showConfirmPassword ? ViewOffIcon : EyeIcon} 
                        size={20} 
                        color={colors.light.textSecondary}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              name="confirmPassword"
            />
            {errors.confirmPassword && (
              <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>
            )}

            {/* Sign Up Button */}
            <Button
              title={loading ? 'Đang tạo tài khoản...' : 'Đăng ký ngay'}
              onPress={handleSubmit(handleSignUp)}
              loading={loading}
              size="small"
            />

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Hoặc tiếp tục với</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialButtons}>
              <TouchableOpacity style={styles.socialButton}>
                <HugeiconsIcon
                  icon={GoogleIcon}
                  size={28}
                  color="#DB4437"
                  strokeWidth={1.8}
                />
              </TouchableOpacity>

              <TouchableOpacity style={styles.socialButton}>
                <HugeiconsIcon
                  icon={Facebook02Icon}
                  size={28}
                  color="#1877F2"
                  strokeWidth={1.8}
                />
              </TouchableOpacity>
            </View>

            {/* Login Link */}
            <View style={styles.loginLink}>
              <Text style={styles.loginText}>Đã có tài khoản? </Text>
              <TouchableOpacity onPress={goToLogin}>
                <Text style={styles.loginLinkText}>Đăng nhập ngay</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Teacher Registration Section */}
        <View style={styles.teacherSection}>
          <View style={styles.teacherCard}>
            <View style={styles.teacherHeader}>
              <Text style={styles.teacherIcon}>👨‍🏫</Text>
              <View style={styles.teacherTextContainer}>
                <Text style={styles.teacherTitle}>Bạn là giáo viên?</Text>
                <Text style={styles.teacherSubtitle}>Đăng ký tài khoản giáo viên để bắt đầu giảng dạy</Text>
              </View>
            </View>
            <Button
              title="Đăng ký giáo viên"
              onPress={goToTeacherSignUp}
              variant="outline"
              size="small"
            />
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
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    backgroundColor: palette.primary,
    opacity: 0.05,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontFamily: typography.fonts.bold,
    color: palette.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: typography.fonts.regular,
    color: colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  brand: {
    fontFamily: typography.fonts.koreanBold,
    color: palette.primary,
  },
  formCard: {
    backgroundColor: palette.white,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  messageBox: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  successMessage: {
    backgroundColor: palette.success + '20',
    borderLeftWidth: 4,
    borderLeftColor: palette.success,
  },
  errorMessage: {
    backgroundColor: palette.error + '20',
    borderLeftWidth: 4,
    borderLeftColor: palette.error,
  },
  messageText: {
    color: colors.light.text,
    fontSize: 14,
    lineHeight: 20,
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: colors.light.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: palette.gray100,
    borderRadius: 12,
    padding: 16,
    fontFamily: typography.fonts.regular,
    fontSize: 16,
    color: colors.light.text,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: palette.error,
  },
  errorText: {
    color: palette.error,
    fontSize: 12,
    fontFamily: typography.fonts.regular,
    marginTop: 4,
    marginLeft: 4,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 16,
    zIndex: 1,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
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
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: colors.light.border,
    borderRadius: 12,
    padding: 12,
  },
  loginLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontFamily: typography.fonts.regular,
    fontSize: 14,
    color: colors.light.textSecondary,
  },
  loginLinkText: {
    fontFamily: typography.fonts.semiBold,
    fontSize: 14,
    color: palette.primary,
  },
  teacherSection: {
    marginBottom: 30,
  },
  teacherCard: {
    backgroundColor: palette.white,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: palette.primary + '20',
  },
  teacherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  teacherIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  teacherTextContainer: {
    flex: 1,
  },
  teacherTitle: {
    fontFamily: typography.fonts.bold,
    fontSize: 18,
    color: palette.primary,
    marginBottom: 4,
  },
  teacherSubtitle: {
    fontFamily: typography.fonts.regular,
    fontSize: 14,
    color: colors.light.textSecondary,
    lineHeight: 18,
  },
});

export default SignUpScreen;