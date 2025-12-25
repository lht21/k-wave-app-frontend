// app/(student)/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';

export default function StudentLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* 1. Màn hình chính chứa Bottom Tabs */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      {/* 2. Các màn hình Learning (Stack cũ) */}
      {/* Đặt tên file tương ứng trong thư mục app/(student)/ */}
      
      {/* StdRoadmap - Nếu bạn muốn dùng nó như màn hình riêng ngoài Tab */}
      <Stack.Screen name="roadmap-detail" options={{ headerShown: false }} />
      
      {/* StdLesson: Sử dụng dynamic route [id].tsx sẽ hay hơn, nhưng nếu giữ tên cũ: */}
      {/* // src/app/(student)/_layout.tsx */}
      <Stack.Screen name="lesson/[id]/index" options={{ headerShown: false }} />
      <Stack.Screen name="lesson/[id]/flashcard" options={{ headerShown: false }} />
      
      <Stack.Screen name="skill-practice" options={{ headerShown: false }} />
      
      {/* Nhóm Exam */}
      <Stack.Screen name="exam-practice" options={{ headerShown: false }} />
      <Stack.Screen name="exam-real" options={{ headerShown: false }} />
      <Stack.Screen name="exam-taking" options={{ headerShown: false, gestureEnabled: false }} />

      {/* Nhóm Culture */}
      <Stack.Screen name="culture" options={{ headerShown: false }} />
      <Stack.Screen name="culture-detail" options={{ headerShown: false }} />

      {/* Nhóm News & Video */}
      <Stack.Screen name="news-detail" options={{ headerShown: false }} />
      <Stack.Screen name="video-learning" options={{ headerShown: false }} />
      <Stack.Screen name="video-category" options={{ headerShown: false }} />
      <Stack.Screen name="video-detail" options={{ headerShown: false }} />

      {/* Settings (Tách ra khỏi Tab stack cũ để đơn giản hóa) */}
      <Stack.Screen name="settings" options={{ headerShown: false }} />
    </Stack>
  );
}