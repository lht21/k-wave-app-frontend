// app/(teacher)/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';

export default function TeacherLayout() {
  return (
    <Stack screenOptions={{ 
      headerShown: false,
      headerBackTitle: 'Quay lại', // Cấu hình mặc định cho nút back
      headerTintColor: '#000' // Màu nút back
    }}>
      {/* 1. Màn hình chính chứa Bottom Tabs */}
      <Stack.Screen 
        name="(tabs)" 
        options={{ headerShown: false }} 
      />

      {/* 2. Các màn hình chi tiết (Nằm đè lên Tabs) */}
      
      {/* Chi tiết bài học */}
      <Stack.Screen 
        name="lesson/[id]" 
        options={{ 
          headerShown: true, 
          title: 'Chi tiết Bài học' 
        }} 
      />

      {/* Chi tiết đề thi */}
      <Stack.Screen 
        name="exam" 
        options={{ 
          headerShown: true, 
          title: 'Chi tiết đề thi' 
        }} 
      />

      {/* Chi tiết văn hóa */}
      <Stack.Screen 
        name="culture" 
        options={{ 
          headerShown: true, 
          title: 'Chi tiết văn hóa' 
        }} 
      />

      {/* Hồ sơ cá nhân */}
      <Stack.Screen 
        name="profile" 
        options={{ 
          headerShown: true, 
          title: 'Hồ sơ cá nhân' 
        }} 
      />
    </Stack>
  );
}