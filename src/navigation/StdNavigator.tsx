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

import { palette } from '../theme/colors';
import HomeStd from '../screens/Home/StdHome';
import LearnImageScreen from '../screens/LearnImage/LearnImageScreen';
import StdNews from '../screens/StdLearn/StdNews';
import SettingScreen from '../screens/Setting/SettingScreen'; 
import LoginScreen from '../screens/Auth/LoginScreen';
import SignUpScreen from '../screens/Auth/SignUpScreen';
import TeacherSignUpScreen from '../screens/Auth/TeacherSignUpScreen';
import ForgotPasswordScreen from '../screens/Auth/ForgotPasswordScreen';
import StdDashboard from '../screens/Setting/StdDashboard';
import StdPracticeExam from '../screens/StdLearn/StdPracticeExam';
import StdRealExam from '../screens/StdLearn/StdRealExam';
import StdExamTaking from '../screens/StdLearn/StdExamTaking';
import StdRoadmap from '../screens/StdLearn/StdRoadmap';
import StdLesson from '../screens/StdLearn/StdLesson';
import StdSkillPractice from '../screens/StdLearn/StdSkillPractice';
import StdCulture from '../screens/StdLearn/StdCulture';
import StdCultureDetail from '../screens/StdLearn/StdCultureDetail';
import NewsDetail from '../screens/StdNewsDetail';
import StdVideoLearning from '../screens/StdLearn/StdVideoLearning';
import VideoCategory from '../screens/StdLearn/VideoCategory';
import VideoDetail from '../screens/StdLearn/VideoDetail';
const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const SettingStack = createStackNavigator();

// Setting Stack Navigator
const SettingStackNavigator = () => {
  return (
    <SettingStack.Navigator screenOptions={{ headerShown: false }}>
      <SettingStack.Screen name="Dashboard" component={StdDashboard} />
      <SettingStack.Screen name="Settings" component={SettingScreen} />
    </SettingStack.Navigator>
  );
};

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
      <Tab.Screen name="Roadmap" component={StdRoadmap} options={{ tabBarLabel: 'Lộ trình' }} />
      <Tab.Screen name="LearnImage" component={StdRealExam} options={{ tabBarLabel: 'Luyện thi' }} />
      <Tab.Screen name="Home" component={HomeStd} options={{ tabBarLabel: 'Trang chủ' }} />
      <Tab.Screen name="News" component={StdNews} options={{ tabBarLabel: 'Tin tức' }} />
      <Tab.Screen name="Setting" component={SettingStackNavigator} options={{ tabBarLabel: 'Cá nhân' }} />
    </Tab.Navigator>
  );
};

// Stack Navigator chính
const StdAppNavigator = () => {
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

      {/* Auth screens */}
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

      {/* Learning screens */}
      <Stack.Screen 
        name="StdRoadmap" 
        component={StdRoadmap}
        options={{ headerShown: false }}
      />

      <Stack.Screen 
        name="StdLesson" 
        component={StdLesson}
        options={{ headerShown: false }}
      />

      <Stack.Screen 
        name="StdSkillPractice" 
        component={StdSkillPractice}
        options={{ headerShown: false }}
      />

      <Stack.Screen 
        name="StdPracticeExam" 
        component={StdPracticeExam}
        options={{ headerShown: false }}
      />
      
      <Stack.Screen 
        name="StdRealExam" 
        component={StdRealExam}
        options={{ headerShown: false }}
      />
      
      <Stack.Screen 
        name="StdExamTaking" 
        component={StdExamTaking}
        options={{ headerShown: false }}
      />

      {/* Culture screens */}
      <Stack.Screen 
        name="StdCulture" 
        component={StdCulture}
        options={{ headerShown: false }}
      />
      
      <Stack.Screen 
        name="StdCultureDetail" 
        component={StdCultureDetail}
        options={{ headerShown: false }}
      />

      {/* News screens */}
      <Stack.Screen 
        name="NewsDetail" 
        component={NewsDetail}
        options={{ headerShown: false }}
      />

      {/* Video screens */}
      <Stack.Screen 
        name="StdVideoLearning" 
        component={StdVideoLearning}
        options={{ headerShown: false }}
      />
      
      <Stack.Screen 
        name="VideoCategory" 
        component={VideoCategory}
        options={{ headerShown: false }}
      />
      
      <Stack.Screen 
        name="VideoDetail" 
        component={VideoDetail}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

export default StdAppNavigator;