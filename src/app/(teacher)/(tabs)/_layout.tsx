// app/(teacher)/(tabs)/_layout.tsx
import React from 'react';
import { Tabs } from 'expo-router';

import { HouseSimpleIcon, ExamIcon, LightningIcon, GearSixIcon, GlobeHemisphereEastIcon } from 'phosphor-react-native';

import { palette } from '../../../theme/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TeacherTabsLayout() {
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
        name="index" 
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
        name="lessons" 
        options={{
          tabBarLabel: 'Bài học',
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
        name="exams" 
        options={{
          tabBarLabel: 'Đề thi',
          tabBarIcon: ({ focused, color, size }) => (
            <ExamIcon 
            size={size} 
            color={color} 
            weight={focused ? 'fill' : 'regular'} 
            />
          ),
        }}
      />
      <Tabs.Screen 
        name="culture" 
        options={{
          tabBarLabel: 'Văn hóa',
          tabBarIcon: ({ focused, color, size }) => (
            <GlobeHemisphereEastIcon 
            size={size} 
            color={color} 
            weight={focused ? 'fill' : 'regular'} 
            />
          ),
        }}
      />
      {/* Nếu muốn mở lại News thì uncomment */}
      {/* <Tabs.Screen 
        name="news" 
        options={{ 
          tabBarLabel: 'Tin tức',
          tabBarIcon: ({ focused, color, size }) => (
            <HugeiconsIcon icon={News01Icon} size={size} color={color} strokeWidth={focused ? 2.5 : 2} />
          )
        }} 
      /> 
      */}
      <Tabs.Screen 
        name="settings" 
        options={{
          tabBarLabel: 'Cài đặt',
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