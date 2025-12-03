import * as React from 'react';
import { useState } from 'react';
import { View, ScrollView, TextInput, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useForm, Controller } from 'react-hook-form';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { SecurityIcon, ViewOffIcon, EyeIcon } from '@hugeicons/core-free-icons';
import Button from '../../components/Button/Button';
import { colors, palette } from '../../theme/colors';
import { typography } from '../../theme/typography';

type RootStackParamList = {
  Login: undefined;
  ForgotPassword: undefined;
  Main: {
    screen?: string;
  };
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface ForgotPasswordFormData {
  email: string;
  otp: string;
  newPassword: string;
  newConfirmPassword: string;
}

const ForgotPasswordScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [enterOTP, setEnterOTP] = useState(false);
  const [emailReset, setEmailReset] = useState('');

  const { control, handleSubmit, formState: { errors }, watch, reset } = useForm<ForgotPasswordFormData>({
    defaultValues: {
      email: '',
      otp: '',
      newPassword: '',
      newConfirmPassword: ''
    }
  });

  const newPassword = watch('newPassword');

  // Giả lập các hàm từ useAuth
  const handleForgotPassword = async (data: ForgotPasswordFormData) => {
    setLoading(true);
    setMessage(null);
    
    try {
      // Giả lập gọi API forgot password
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setEmailReset(data.email);
      setEnterOTP(true);
      setMessage('Mã xác nhận đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.');
      
    } catch (error: any) {
      setMessage(error.message || 'Đã xảy ra lỗi khi gửi yêu cầu');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (data: ForgotPasswordFormData) => {
    setLoading(true);
    setMessage(null);
    
    try {
      // Giả lập gọi API reset password
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setMessage('Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.');
      
      // Tự động chuyển đến login sau 2 giây
      setTimeout(() => {
        navigation.navigate('Login');
      }, 2000);
      
    } catch (error: any) {
      setMessage(error.message || 'Đã xảy ra lỗi khi đặt lại mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setMessage(null);
    
    try {
      // Giả lập gọi API resend OTP
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage('Mã xác nhận mới đã được gửi đến email của bạn.');
      
    } catch (error: any) {
      setMessage(error.message || 'Đã xảy ra lỗi khi gửi lại mã');
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.backgroundOverlay} />
      
      <View style={styles.contentContainer}>
        <View style={styles.card}>
          <View style={styles.header}>
            <HugeiconsIcon 
              icon={SecurityIcon} 
              size={48} 
              color={colors.light.primary}
              strokeWidth={1.5}
            />
            <Text style={styles.title}>Cài lại mật khẩu</Text>
          </View>
          
          {message && (
            <View style={[styles.messageBox, message.includes('thành công') ? styles.successMessage : styles.errorMessage]}>
              <Text style={styles.messageText}>{message}</Text>
            </View>
          )}
          
          {!enterOTP ? (
            // Form nhập email
            <View style={styles.form}>
              <Text style={styles.instructionText}>
                Vui lòng nhập Email đăng ký
              </Text>
              
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
                  <View style={styles.inputContainer}>
                    <TextInput
                      placeholder="Email"
                      placeholderTextColor={colors.light.textSecondary}
                      style={[
                        styles.input,
                        errors.email && styles.inputError
                      ]}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                  </View>
                )}
                name="email"
              />
              {errors.email && (
                <Text style={styles.errorText}>{errors.email.message}</Text>
              )}

              <Button
                title={loading ? 'Đang gửi yêu cầu...' : 'Gửi yêu cầu'}
                onPress={handleSubmit(handleForgotPassword)}
                loading={loading}
                size="small"
              />

              <TouchableOpacity onPress={goToLogin} style={styles.backToLogin}>
                <Text style={styles.backToLoginText}>← Quay lại đăng nhập</Text>
              </TouchableOpacity>
            </View>
          ) : (
            // Form nhập OTP và mật khẩu mới
            <View style={styles.form}>
              <Text style={styles.instructionText}>
                Vui lòng nhập mã xác nhận đã được gửi đến email của bạn.{'\n'}Mã OTP gồm 6 chữ số
              </Text>
              
              <Controller
                control={control}
                rules={{
                  required: 'Mã OTP không được để trống',
                  minLength: {
                    value: 6,
                    message: 'Mã OTP phải có 6 chữ số'
                  },
                  maxLength: {
                    value: 6,
                    message: 'Mã OTP phải có 6 chữ số'
                  }
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={styles.inputContainer}>
                    <TextInput
                      placeholder="XXXXXX"
                      placeholderTextColor={colors.light.textSecondary}
                      style={[
                        styles.input,
                        errors.otp && styles.inputError
                      ]}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      keyboardType="number-pad"
                      maxLength={6}
                    />
                  </View>
                )}
                name="otp"
              />
              {errors.otp && (
                <Text style={styles.errorText}>{errors.otp.message}</Text>
              )}

              <Controller
                control={control}
                rules={{
                  required: 'Mật khẩu mới không được để trống',
                  minLength: {
                    value: 6,
                    message: 'Mật khẩu phải có ít nhất 6 ký tự'
                  }
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={styles.passwordContainer}>
                    <TextInput
                      placeholder="Đặt mật khẩu mới"
                      placeholderTextColor={colors.light.textSecondary}
                      secureTextEntry={!showPassword}
                      style={[
                        styles.input,
                        styles.passwordInput,
                        errors.newPassword && styles.inputError
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
                )}
                name="newPassword"
              />
              {errors.newPassword && (
                <Text style={styles.errorText}>{errors.newPassword.message}</Text>
              )}

              <Controller
                control={control}
                rules={{
                  required: 'Xác nhận mật khẩu không được để trống',
                  validate: value => value === newPassword || 'Mật khẩu không khớp'
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View style={styles.passwordContainer}>
                    <TextInput
                      placeholder="Xác nhận mật khẩu mới"
                      placeholderTextColor={colors.light.textSecondary}
                      secureTextEntry={!showConfirmPassword}
                      style={[
                        styles.input,
                        styles.passwordInput,
                        errors.newConfirmPassword && styles.inputError
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
                )}
                name="newConfirmPassword"
              />
              {errors.newConfirmPassword && (
                <Text style={styles.errorText}>{errors.newConfirmPassword.message}</Text>
              )}

              <Button
                title={loading ? 'Đang thay đổi...' : 'Xác nhận'}
                onPress={handleSubmit(handleResetPassword)}
                loading={loading}
                size="small"
              />

              <View style={styles.resendContainer}>
                <Text style={styles.resendText}>Chưa nhận được mã?</Text>
                <TouchableOpacity onPress={handleResendOtp}>
                  <Text style={styles.resendLink}>Gửi lại</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity onPress={goToLogin} style={styles.backToLogin}>
                <Text style={styles.backToLoginText}>← Quay lại đăng nhập</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.light.background,
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
  card: {
    backgroundColor: palette.white,
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginTop: 16,
    color: colors.light.text,
    fontFamily: typography.fonts.bold,
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
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 18,
  },
  form: {
    width: '100%',
  },
  instructionText: {
    fontSize: 14,
    color: colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: typography.fonts.regular,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 16,
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
    marginBottom: 16,
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
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  resendText: {
    fontSize: 14,
    color: colors.light.textSecondary,
    fontFamily: typography.fonts.regular,
  },
  resendLink: {
    fontSize: 14,
    color: colors.light.primary,
    fontFamily: typography.fonts.semiBold,
    marginLeft: 8,
  },
  backToLogin: {
    alignSelf: 'center',
    marginTop: 16,
  },
  backToLoginText: {
    fontSize: 14,
    color: colors.light.primary,
  },
});

export default ForgotPasswordScreen;