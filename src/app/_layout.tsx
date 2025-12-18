// src/app/_layout.tsx
import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
// Đảm bảo đường dẫn import đúng tới AuthProvider và useAuth của bạn
import { AuthProvider } from '../contexts/AuthContext'; 
import { FavoriteNewsProvider } from '../contexts/FavoriteNewsContext';
import { useAuth } from '../hooks/useAuth';


// 1. Tạo một component con để xử lý logic điều hướng (Nơi này đã có thể dùng useAuth)
function AuthCheckLayout() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    
    if (!user && !inAuthGroup) {
      // Chưa đăng nhập -> về trang login
      router.replace('/(auth)/login');
    } else if (user) {
      // Đã đăng nhập -> điều hướng theo role
      if (user.role === 'teacher') {
         if (inAuthGroup || segments[0] === '(student)') {
           router.replace('/(teacher)/(tabs)'); 
         }
      } else {
         // Student
         if (inAuthGroup || segments[0] === '(teacher)') {
           router.replace('/(student)/(tabs)');
         }
      }
    }
  }, [user, isLoading, segments]);

  if (isLoading) {
    return (
      <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Slot />;
}

// 2. Component chính chỉ đóng vai trò Bọc Provider (Wrapper)
export default function RootLayout() {
  return (
    <AuthProvider>
        {/* AuthCheckLayout nằm TRONG AuthProvider nên mới dùng được useAuth */}
        <FavoriteNewsProvider>
          <AuthCheckLayout />
        </FavoriteNewsProvider>
    </AuthProvider>
  );
}