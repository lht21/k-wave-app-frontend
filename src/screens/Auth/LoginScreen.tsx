import * as React from 'react';
import { useState } from 'react';
import { View, ScrollView, TextInput, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useForm, Controller } from 'react-hook-form';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { Mail01Icon, SecurityIcon, ViewOffIcon, EyeIcon, GoogleIcon, Facebook02Icon } from '@hugeicons/core-free-icons';
import Button from '../../components/Button/Button';
import { colors, palette } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { useAuth } from '../../hooks/useAuth';

type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  TeacherSignUp: undefined;
  ForgotPassword: undefined;
  Main: {
    screen?: string;
  };
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface LoginFormData {
  email: string;
  password: string;
}

const LoginScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const handleLogin = async (data: LoginFormData) => {
    setLoading(true);
    setMessage(null);
    try {
      await login(data);
      setMessage('Đăng nhập thành công!');
      setTimeout(() => {
        navigation.navigate("Main", { screen: "Home" });
      }, 500);
    } catch (error: any) {
      setMessage(error.message || 'Đã xảy ra lỗi khi đăng nhập');
    } finally {
      setLoading(false);
    }
  };

  const goToSignUp = () => {
    navigation.navigate('SignUp');
  };

  const goToForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Background Overlay */}
      <View style={styles.backgroundOverlay} />
      
      <View style={styles.contentContainer}>
        <View style={styles.card}>
          <Text style={styles.title}>
            <Text style={styles.brandText}>K-Wave</Text> Xin chào!
          </Text>
          
          {message && (
            <View style={[styles.messageBox, message.includes('thành công') ? styles.successMessage : styles.errorMessage]}>
              <Text style={styles.messageText}>{message}</Text>
            </View>
          )}
          
          <View style={styles.form}>
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
                <View style={styles.passwordContainer}>
                  <TextInput
                    placeholder="Mật khẩu"
                    placeholderTextColor={colors.light.textSecondary}
                    secureTextEntry={!showPassword}
                    style={[
                      styles.input,
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
              )}
              name="password"
            />
            {errors.password && (
              <Text style={styles.errorText}>{errors.password.message}</Text>
            )}
            
            <Button
              title="Đăng nhập"
              onPress={handleSubmit(handleLogin)}
              loading={loading}
              size="small"
            />
            
            <TouchableOpacity onPress={goToForgotPassword} style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
            </TouchableOpacity>
            
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>hoặc</Text>
              <View style={styles.dividerLine} />
            </View>
            
            <View style={styles.socialLogin}>
              <Text style={styles.socialLoginText}>Hoặc đăng nhập bằng</Text>
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
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.signupSection}>
              <Text style={styles.signupText}>Bạn chưa có tài khoản?</Text>
              <Button
                title="Đăng ký ngay!"
                onPress={goToSignUp}
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
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 32,
    color: colors.light.text,
    fontFamily: typography.fonts.regular,
  },
  brandText: {
    fontFamily: typography.fonts.koreanBold,
    color: palette.primary,
  },
  messageBox: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
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
    textAlign: 'center',
    fontFamily: typography.fonts.semiBold,
    fontSize: 14,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 8,
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
  inputError: {
    borderColor: palette.error,
  },
  errorText: {
    color: palette.error,
    fontSize: 12,
    fontFamily: typography.fonts.regular,
    marginBottom: 16,
    marginLeft: 8,
  },
  passwordContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 16,
    zIndex: 1,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 8,
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: palette.primary,
    fontSize: 14,
    fontFamily: typography.fonts.regular,
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
  signupSection: {
    alignItems: 'center',
  },
  signupText: {
    fontFamily: typography.fonts.regular,
    fontSize: 14,
    color: colors.light.textSecondary,
    marginBottom: 16,
  },
});

export default LoginScreen;