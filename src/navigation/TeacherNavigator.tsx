// src/navigation/TeacherNavigator.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  Home01Icon,
  BookBookmark01Icon,
  GlobalIcon,
  Settings02Icon,
  Mortarboard02Icon,
  News01Icon
} from '@hugeicons/core-free-icons';

import TeacherHomeScreen from '../screens/Teacher/TeacherHomeScreen/TeacherHomeScreen';
import TeacherLessonsScreen from '../screens/Teacher/TeacherLessonsScreen/TeacherLessonsScreen';
import TeacherExamsScreen from '../screens/Teacher/TeacherExamsScreen/TeacherExamsScreen';
import TeacherCultureScreen from '../screens/Teacher/TeacherCultureScreen/TeacherCultureScreen';
import TeacherNewsScreen from '../screens/Teacher/TeacherNewsScreen/TeacherNewsScreen';
import SettingScreen from '../screens/Setting/SettingScreen';
import { palette } from '../theme/colors';

import LessonDetailScreen from '../screens/Teacher/TeacherLessonsScreen/LessonDetailScreen';
import TeacherExamsDetail from '../screens/Teacher/TeacherExamsScreen/TeacherExamsDetail';
import TeacherCultureDetail from '../screens/Teacher/TeacherCultureScreen/TeacherCultureDetail';

import TeacherProfileScreen from '../screens/Teacher/TeacherProfileScreen/TeacherProfileScreen'; 

type TeacherStackParamList = {
  TeacherMain: undefined;
  LessonDetail: { lessonId: number };
  ExamDetail: { examId: string };
  CultureDetail: { cultureId: string };
  TeacherProfile: undefined; 
};


const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Navigator cho teacher
const TeacherTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const icon = (() => {
            switch (route.name) {
              case 'TeacherHome':
                return focused ? Home01Icon : Home01Icon;
              case 'TeacherLessons':
                return focused ? BookBookmark01Icon : BookBookmark01Icon;
              case 'TeacherExams':
                return focused ? Mortarboard02Icon : Mortarboard02Icon;
              case 'TeacherCulture':
                return focused ? GlobalIcon : GlobalIcon;
              case 'TeacherNews':
                return focused ? News01Icon : News01Icon;
              case 'TeacherSetting':
                return focused ? Settings02Icon : Settings02Icon;
              default:
                return Home01Icon;
            }
          })();

          return <HugeiconsIcon icon={icon} size={size} color={color} strokeWidth={2} />;
        },
        headerShown: false,
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: palette.gray900,
        tabBarStyle: {
          backgroundColor: palette.white,
          borderTopWidth: 1,
          borderTopColor: palette.gray100,
        },
      })}
    >
      <Tab.Screen 
        name="TeacherHome" 
        component={TeacherHomeScreen} 
        options={{ tabBarLabel: 'Trang chủ' }} 
      />
      <Tab.Screen 
        name="TeacherLessons" 
        component={TeacherLessonsScreen} 
        options={{ tabBarLabel: 'Bài học' }} 
      />
      <Tab.Screen 
        name="TeacherExams" 
        component={TeacherExamsScreen} 
        options={{ tabBarLabel: 'Đề thi' }} 
      />
      <Tab.Screen 
        name="TeacherCulture" 
        component={TeacherCultureScreen} 
        options={{ tabBarLabel: 'Văn hóa' }} 
      />
      {/* <Tab.Screen 
        name="TeacherNews" 
        component={TeacherNewsScreen} 
        options={{ tabBarLabel: 'Tin tức' }} 
      /> */}
      <Tab.Screen 
        name="TeacherSetting" 
        component={SettingScreen} 
        options={{ tabBarLabel: 'Cài đặt' }} 
      />
    </Tab.Navigator>
  );
};

// Stack Navigator cho teacher
const TeacherNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="TeacherMain" 
        component={TeacherTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="LessonDetail" 
        component={LessonDetailScreen}
        options={{ 
          title: 'Chi tiết Bài học',
          headerBackTitle: 'Quay lại'
        }}
      />
      <Stack.Screen 
        name="ExamDetail" 
        component={TeacherExamsDetail}
        options={{ 
          title: 'Chi tiết đề thi',
          headerBackTitle: 'Quay lại'
        }}
      />
      <Stack.Screen 
        name="CultureDetail" 
        component={TeacherCultureDetail}
        options={{ 
          title: 'Chi tiết văn hóa',
          headerBackTitle: 'Quay lại'
        }}
      />
      <Stack.Screen 
        name="TeacherProfile" 
        component={TeacherProfileScreen}
        options={{ 
          title: 'Hồ sơ cá nhân',
          headerBackTitle: 'Quay lại'
        }}
      />

    </Stack.Navigator>
  );
};

export default TeacherNavigator;