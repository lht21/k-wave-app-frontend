// app/(student)/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';

export default function StudentLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* 1. Màn hình chính chứa Bottom Tabs */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      {/* 2. Các màn hình Learning */}
      
      {/* Roadmap - Nested trong folder roadmap/ */}
      <Stack.Screen name="roadmap/roadmap" options={{ headerShown: false }} />
      
      {/* StdLesson: Sử dụng dynamic route [id].tsx sẽ hay hơn, nhưng nếu giữ tên cũ: */}
      {/* // src/app/(student)/_layout.tsx */}
      <Stack.Screen name="lesson/[id]/index" options={{ headerShown: false }} />
      <Stack.Screen name="lesson/[id]/flashcard" options={{ headerShown: false }} />
      
      {/* Skill Practice */}
      <Stack.Screen name="skill-practice" options={{ headerShown: false }} />
      
      {/* Nhóm Exam - Nested trong folder exam/ */}
      <Stack.Screen name="exam/practice" options={{ headerShown: false }} />
      <Stack.Screen name="exam/real" options={{ headerShown: false }} />
      <Stack.Screen name="exam/taking" options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen name="exam-selector" options={{ headerShown: false }} />

      {/* Nhóm Culture */}
      <Stack.Screen name="culture" options={{ headerShown: false }} />
      <Stack.Screen name="culture/[id]" options={{ headerShown: false }} />

      {/* Nhóm News & Video */}
      <Stack.Screen name="news/news" options={{ headerShown: false }} />
      <Stack.Screen name="news-detail" options={{ headerShown: false }} />
      <Stack.Screen name="video-learning" options={{ headerShown: false }} />
      <Stack.Screen name="video-category" options={{ headerShown: false }} />
      <Stack.Screen name="video-detail" options={{ headerShown: false }} />

      {/* Premium */}
      <Stack.Screen name="premium/update" options={{ headerShown: false }} />
      
      {/* Learning History */}
      <Stack.Screen name="learning-history/progress" options={{ headerShown: false }} />
      <Stack.Screen name="learning-history/achievements" options={{ headerShown: false }} />
    </Stack>
  );
}