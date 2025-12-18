// app/(teacher)/(tabs)/_layout.tsx
import React from 'react';
import { Tabs } from 'expo-router';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  Home01Icon,
  BookBookmark01Icon,
  Mortarboard02Icon,
  GlobalIcon,
  News01Icon,
  Settings02Icon,
} from '@hugeicons/core-free-icons';
import { palette } from '../../../theme/colors';

export default function TeacherTabsLayout() {
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
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: 'Roboto-Regular', // Font của bạn
        },
      })}
    >
      <Tabs.Screen 
        name="index" // Home
        options={{ 
          tabBarLabel: 'Trang chủ',
          tabBarIcon: ({ focused, color, size }) => (
            <HugeiconsIcon icon={Home01Icon} size={size} color={color} strokeWidth={focused ? 2.5 : 2} />
          )
        }} 
      />
      <Tabs.Screen 
        name="lessons" 
        options={{ 
          tabBarLabel: 'Bài học',
          tabBarIcon: ({ focused, color, size }) => (
             <HugeiconsIcon icon={BookBookmark01Icon} size={size} color={color} strokeWidth={focused ? 2.5 : 2} />
          )
        }} 
      />
      <Tabs.Screen 
        name="exams" 
        options={{ 
          tabBarLabel: 'Đề thi',
          tabBarIcon: ({ focused, color, size }) => (
            <HugeiconsIcon icon={Mortarboard02Icon} size={size} color={color} strokeWidth={focused ? 2.5 : 2} />
          )
        }} 
      />
      <Tabs.Screen 
        name="culture" 
        options={{ 
          tabBarLabel: 'Văn hóa',
          tabBarIcon: ({ focused, color, size }) => (
            <HugeiconsIcon icon={GlobalIcon} size={size} color={color} strokeWidth={focused ? 2.5 : 2} />
          )
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
            <HugeiconsIcon icon={Settings02Icon} size={size} color={color} strokeWidth={focused ? 2.5 : 2} />
          )
        }} 
      />
    </Tabs>
  );
}