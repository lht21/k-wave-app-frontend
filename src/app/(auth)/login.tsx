import React, { useState } from 'react';
import { 
  View, 
  ScrollView, 
  TextInput, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ViewOffIcon, EyeIcon } from '@hugeicons/core-free-icons';
import { colors, palette } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { useAuth } from '../../hooks/useAuth';

const { height } = Dimensions.get('window');

interface LoginFormData {
  email: string;
  password: string;
}

const LoginScreen = () => {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    defaultValues: { email: '', password: '' }
  });

  const handleLogin = async (data: LoginFormData) => {
    setLoading(true);
    setMessage(null);
    try {
      await login(data);
      setMessage('Đăng nhập thành công!');
    } catch (error: any) {
      setMessage(error.message || 'Đã xảy ra lỗi khi đăng nhập');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#042d23', '#063b2a', '#40d8bd']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
        >
          {/* 1. Header Section - Nằm ở trên cùng */}
          <View style={styles.header}>
            <Text style={styles.brandText}>K-WAVE</Text>
            <Text style={styles.welcomeText}>XIN CHÀO!</Text>
          </View>

          {/* 2. Spacer - View này sẽ giãn ra để đẩy mọi thứ bên dưới xuống đáy */}
          <View style={styles.spacer} />

          {/* 3. Form Card - Phần trung tâm (đã bị đẩy xuống) */}
          <View style={styles.card}>
            <View style={styles.form}>
              {message && (
                <Text style={[styles.messageText, { color: message.includes('thành công') ? '#00e676' : '#ff5252' }]}>
                  {message}
                </Text>
              )}

              <Controller
                control={control}
                name="email"
                rules={{ required: 'Email không được để trống' }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    placeholder="Email"
                    placeholderTextColor="rgba(255,255,255,0.6)"
                    style={[styles.input, errors.email && styles.inputError]}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    autoCapitalize="none"
                  />
                )}
              />

              <View style={styles.passwordWrapper}>
                <Controller
                  control={control}
                  name="password"
                  rules={{ required: 'Mật khẩu không được để trống' }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      placeholder="Mật khẩu"
                      placeholderTextColor="rgba(255,255,255,0.6)"
                      secureTextEntry={!showPassword}
                      style={[styles.input, styles.passwordInput, errors.password && styles.inputError]}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                    />
                  )}
                />
                <TouchableOpacity 
                  style={styles.eyeIcon} 
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <HugeiconsIcon 
                    icon={showPassword ? ViewOffIcon : EyeIcon} 
                    size={20} 
                    color="rgba(255,255,255,0.6)" 
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={[styles.mainButton, loading && { opacity: 0.7 }]} 
                onPress={handleSubmit(handleLogin)}
                disabled={loading}
              >
                <Text style={styles.buttonText}>{loading ? 'Đang xử lý...' : 'Đăng nhập'}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
                <Text style={styles.forgotText}>Quên mật khẩu?</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 4. Bottom Action - Nằm ở cuối cùng */}
          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={() => router.push('/(auth)/signup')}
          >
            <Text style={styles.buttonText}>Đăng ký tài khoản mới</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60, // Khoảng cách từ đỉnh màn hình cho Header
    paddingBottom: 40, // Khoảng cách an toàn ở đáy màn hình
  },
  spacer: {
    flex: 1, // Chiếm toàn bộ không gian trống ở giữa Header và Card
    minHeight: 70, // Đảm bảo luôn có một khoảng cách tối thiểu
  },
  header: {
    alignItems: 'flex-start',
    paddingLeft: 10,
  },
  brandText: {
    fontSize: 30,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 2,
    fontFamily: typography.fonts.bold, // Sử dụng font từ theme của bạn
  },
  welcomeText: {
    fontSize: 18,
    color: '#fff',
    opacity: 0.8,
    marginTop: 4,
  },
  card: {
    // Giảm độ đặc để nhìn thấy mờ mờ nền phía sau
    backgroundColor: 'rgba(255, 255, 255, 0.08)', 
    borderRadius: 40,
    padding: 24,
    paddingVertical: 40,
    width: '100%',
    
    // Tạo viền sáng mảnh ở cạnh Card để giả lập hiệu ứng phản chiếu ánh sáng của kính
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',

    // Đổ bóng sâu hơn để tạo độ nổi
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 15,
  },
  form: {
    width: '100%',
  },
  input: {
    // Input cũng nên có độ trong suốt nhẹ để đồng bộ
    backgroundColor: 'rgba(148, 163, 168, 0.8)', 
    borderRadius: 20, // Bo tròn hơn một chút cho hiện đại
    padding: 18,
    fontSize: 16,
    color: '#fff',
    marginBottom: 16,
    // Thêm viền nhẹ cho input khi chưa focus
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  passwordWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: 18,
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#ff5252',
  },
  mainButton: {
    backgroundColor: '#40d8bd', 
    borderRadius: 30,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
    // Thêm đổ bóng cho nút bấm để nó trông "nổi" hẳn lên khỏi mặt kính
    shadowColor: '#40d8bd',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 30,
    borderColor: '#40d8bd',
    borderWidth: 1,
    padding: 10,
    alignItems: 'center',
    marginTop: 30, // Khoảng cách giữa Card và nút Đăng ký
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  forgotText: {
    color: '#fff',
    textAlign: 'right',
    marginTop: 15,
    opacity: 0.9,
    fontSize: 14,
  },
  messageText: {
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: '600',
  }
});

export default LoginScreen;