// app/(student)/(tabs)/_layout.tsx
import React from 'react';
import { Tabs } from 'expo-router';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { HouseSimpleIcon, ExamIcon, LightningIcon, GearSixIcon } from 'phosphor-react-native';
import { palette } from '../../../theme/colors'; // Sửa lại đường dẫn import
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function StudentTabsLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: palette.primary,
        tabBarInactiveTintColor: palette.gray900,
        tabBarStyle: {
          backgroundColor: palette.white,
          borderTopWidth: 1,
          borderTopColor: palette.gray100,
          height: 60 + (insets.bottom > 0 ? insets.bottom - 10 : 10), 
          paddingBottom: insets.bottom > 0 ? insets.bottom : 20,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: 'Roboto-Regular', // Hoặc font bạn đang dùng
        },
      })}
    >
      <Tabs.Screen
        name="index" // Tương ứng file app/(student)/(tabs)/index.tsx (HomeStd)
        options={{
          tabBarLabel: 'Trang chủ',
          tabBarIcon: ({ focused, color, size }) => (
            <HouseSimpleIcon 
            size={size} 
            color={color} 
            weight={focused ? 'fill' : 'regular'} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="learn" // Tương ứng file app/(student)/(tabs)/learn.tsx (StdLearn)
        options={{
          tabBarLabel: 'Học',
          tabBarIcon: ({ focused, color, size }) => (
            <LightningIcon
              size={size} 
              color={color} 
              weight={focused ? 'fill' : 'regular'} 
            />
          ),
        }}
      />
      
      <Tabs.Screen
        name="exams" // Tương ứng file app/(student)/(tabs)/exams.tsx (StdExams)
        options={{
          tabBarLabel: 'Luyện thi',
          tabBarIcon: ({ focused, color, size }) => (
            <ExamIcon
              size={size} 
              color={color} 
              weight={focused ? 'fill' : 'regular'} 
            />
          ),
        }}
      />
      
      {/* LƯU Ý: Trong code cũ bạn comment phần LearnImage, 
         nếu muốn dùng lại thì uncomment và tạo file image.tsx
      */}
      {/* <Tabs.Screen
        name="image"
        options={{
          tabBarLabel: 'Học ảnh',
          tabBarIcon: ({ focused, color, size }) => (
            <HugeiconsIcon icon={Image01Icon} size={size} color={color} />
          ),
        }}
      /> 
      */}


      <Tabs.Screen
        name="settings" // Tương ứng file app/(student)/(tabs)/dashboard.tsx (StdDashboard)
        options={{
          tabBarLabel: 'Cá nhân',
          tabBarIcon: ({ focused, color, size }) => (
            <GearSixIcon 
              size={size} 
              color={color} 
              weight={focused ? 'fill' : 'regular'} 
            />
          ),
        }}
      />
    </Tabs>
  );
}