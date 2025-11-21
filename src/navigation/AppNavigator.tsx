import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  Home01Icon,
  NewsIcon,
  Image01Icon,
  BookIcon,
  Settings02Icon,
  CircleIcon
} from '@hugeicons/core-free-icons';

import NewsScreen from '../screens/News/NewsScreen';
import LearnImageScreen from '../screens/LearnImage/LearnImageScreen';
import RoadmapScreen from '../screens/Roadmap/RoadmapScreen';
import SettingScreen from '../screens/Setting/SettingScreen';
import HomeScreen from '../screens/Home/HomeScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
import SignUpScreen from '../screens/Auth/SignUpScreen';
import TeacherSignUpScreen from '../screens/Auth/TeacherSignUpScreen';
import ForgotPasswordScreen from '../screens/Auth/ForgotPasswordScreen';
import { palette } from '../theme/colors';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Navigator cho main app
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const icon = (() => {
            switch (route.name) {
              case 'Home':
                return focused ? Home01Icon : Home01Icon;
              case 'News':
                return focused ? NewsIcon : NewsIcon;
              case 'LearnImage':
                return focused ? Image01Icon : Image01Icon;
              case 'Roadmap':
                return focused ? BookIcon : BookIcon;
              case 'Setting':
                return focused ? Settings02Icon : Settings02Icon;
              default:
                return CircleIcon;
            }
          })();

          return <HugeiconsIcon icon={icon} size={size} color={color} strokeWidth={2} />;
        },
        headerShown: false,
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: palette.gray900,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Trang chủ' }} />
      <Tab.Screen name="News" component={NewsScreen} options={{ tabBarLabel: 'Tin tức' }} />
      <Tab.Screen name="LearnImage" component={LearnImageScreen} options={{ tabBarLabel: 'Học ảnh' }}/>
      <Tab.Screen name="Roadmap" component={RoadmapScreen} options={{ tabBarLabel: 'Lộ trình' }} />
      <Tab.Screen name="Setting" component={SettingScreen} options={{ tabBarLabel: 'Cài đặt' }} />
    </Tab.Navigator>
  );
};

// Stack Navigator chính
// Stack Navigator chính
const AppNavigator = () => {
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
        name="Main" 
        component={MainTabs}
        options={{ headerShown: false }}
      />

      {/* Thêm vào AppNavigator */}
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

export default AppNavigator;