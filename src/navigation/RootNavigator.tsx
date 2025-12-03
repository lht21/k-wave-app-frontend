import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../hooks/useAuth';
// --- THAY ĐỔI 1: Import StdNavigator thay vì AppNavigator ---
import StdNavigator from './StdNavigator'; 
import TeacherNavigator from './TeacherNavigator';
import LoginScreen from '../screens/Auth/LoginScreen';
import SignUpScreen from '../screens/Auth/SignUpScreen';
import TeacherSignUpScreen from '../screens/Auth/TeacherSignUpScreen';
import ForgotPasswordScreen from '../screens/Auth/ForgotPasswordScreen';

const Stack = createStackNavigator();

// Navigator cho authentication (chưa đăng nhập)
const AuthNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="SignUp" 
        component={SignUpScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="TeacherSignUp" 
        component={TeacherSignUpScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="ForgotPassword" 
        component={ForgotPasswordScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

// Root Navigator chính - điều phối dựa trên authentication và role
const RootNavigator = () => {
  const { user, isLoading } = useAuth();

  // Hiển thị loading nếu đang kiểm tra auth state
  if (isLoading) {
    return null; 
  }

  return (
    <Stack.Navigator>
      {!user ? (
        // Chưa đăng nhập - hiển thị auth flow
        <Stack.Screen 
          name="Auth" 
          component={AuthNavigator}
          options={{ headerShown: false }}
        />
      ) : user.role === 'teacher' ? (
        // Đã đăng nhập và là teacher - điều hướng đến TeacherNavigator
        <Stack.Screen 
          name="TeacherApp" 
          component={TeacherNavigator}
          options={{ headerShown: false }}
        />
      ) : (
        // Đã đăng nhập và là student - điều hướng đến StdNavigator (thay vì AppNavigator cũ)
        // --- THAY ĐỔI 2: Sử dụng StdNavigator ở đây ---
        <Stack.Screen 
          name="StudentApp" 
          component={StdNavigator}
          options={{ headerShown: false }}
        />
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;