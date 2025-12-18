import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Platform, StatusBar, TouchableOpacity } from 'react-native';
import { TrendUpIcon, BookOpenIcon, ChartBarIcon, TargetIcon, CaretLeftIcon } from 'phosphor-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const COLORS = {
  primaryGreen: '#00C853',
  textDark: '#1A1A1A',
  textGray: '#666666',
  cardBg: '#F0F2F5',
  white: '#FFFFFF',
  pillInactive: '#E0E0E0',
};

// Component thanh tiến độ dọc (Weekly)
const ProgressPill = ({ percent, active }: { percent: number; active?: boolean }) => (
  <View style={styles.pillContainer}>
    <View style={styles.pillWrapper}>
      <View style={[styles.pillFill, { height: `${percent}%`, backgroundColor: active ? COLORS.primaryGreen : '#A5D6A7' }]} />
    </View>
  </View>
);

// Component thanh tiến độ ngang (Lesson stats)
const HorizontalBar = ({ percent }: { percent: number }) => (
  <View style={styles.hBarWrap}>
    <View style={[styles.hBar, { width: `${percent}%`, backgroundColor: COLORS.primaryGreen }]} />
  </View>
);

export default function ProgressScreen() {

  const router = useRouter()
  const weeklyProgress = [
    { day: 'T2', percent: 80 }, { day: 'T3', percent: 40 }, { day: 'T4', percent: 60 },
    { day: 'T5', percent: 30 }, { day: 'T6', percent: 90 }, { day: 'T7', percent: 20 }, { day: 'CN', percent: 10 }
  ];

  const lessonStats = [
    { title: 'Từ vựng', percent: 80 },
    { title: 'Ngữ pháp', percent: 60 },
    { title: 'Nghe', percent: 50 },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.headerBackgroundShape} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity onPress={() => router.back()}>
              <CaretLeftIcon size={28} color={COLORS.primaryGreen} weight="bold" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Tiến độ</Text>

          {/* Card: Luyện tập hàng tuần */}
          <View style={styles.sectionCard}>
            <View style={styles.cardHeader}>
              <TrendUpIcon size={24} color={COLORS.primaryGreen} weight="bold" />
              <Text style={styles.sectionTitle}>Luyện tập hàng tuần</Text>
            </View>
            <View style={styles.weeklyRow}>
              <View style={styles.statsSummary}>
                <Text style={styles.smallLabel}>Hôm nay</Text>
                <Text style={styles.bigValue}>120 exp</Text>
                <Text style={styles.smallLabel}>Tỷ lệ đúng</Text>
                <Text style={styles.bigValue}>85%</Text>
              </View>
              <View style={styles.weekPillsContainer}>
                {weeklyProgress.map((w, idx) => (
                  <View key={w.day} style={styles.weekItem}>
                    <ProgressPill percent={w.percent} active={idx === 4} />
                    <Text style={styles.weekLabel}>{w.day}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Card: Thống kê bài học */}
          <View style={styles.sectionCard}>
            <View style={styles.cardHeader}>
              <BookOpenIcon size={24} color={COLORS.primaryGreen} weight="bold" />
              <Text style={styles.sectionTitle}>Thống kê bài học</Text>
            </View>
            {lessonStats.map((ls) => (
              <View key={ls.title} style={styles.lessonRow}>
                <Text style={styles.lessonTitle}>{ls.title}</Text>
                <HorizontalBar percent={ls.percent} />
                <Text style={styles.percentText}>{ls.percent}%</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  headerBackgroundShape: {
    position: 'absolute', top: -width * 0.6, left: -width * 0.1, right: -width * 0.1,
    height: width * 0.8, backgroundColor: '#F7F9FC', borderBottomLeftRadius: width,
    borderBottomRightRadius: width, transform: [{ scaleX: 1.2 }],
  },
  safeArea: { flex: 1, paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 },
  scrollContent: { padding: 20 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: COLORS.primaryGreen, marginBottom: 30 },
  sectionCard: { backgroundColor: COLORS.cardBg, borderRadius: 24, padding: 20, marginBottom: 20 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.textDark, marginLeft: 10 },
  weeklyRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statsSummary: { justifyContent: 'center', width: '30%' },
  smallLabel: { fontSize: 12, color: COLORS.textGray },
  bigValue: { fontSize: 18, fontWeight: '800', color: COLORS.textDark, marginBottom: 8 },
  weekPillsContainer: { flex: 1, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end' },
  weekItem: { alignItems: 'center' },
  pillContainer: { height: 80, width: 12, backgroundColor: '#E0E0E0', borderRadius: 6, justifyContent: 'flex-end', overflow: 'hidden' },
  pillWrapper: { 
    width: 14, 
    height: 80, 
    backgroundColor: '#E0E0E0', 
    borderRadius: 7, 
    justifyContent: 'flex-end', 
    overflow: 'hidden' 
  },
  pillFill: { width: '100%', borderRadius: 6 },
  weekLabel: { fontSize: 10, color: COLORS.textGray, marginTop: 8, fontWeight: '600' },
  lessonRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  lessonTitle: { width: 80, fontSize: 14, color: COLORS.textDark, fontWeight: '600' },
  hBarWrap: { flex: 1, height: 10, backgroundColor: '#E0E0E0', borderRadius: 5, overflow: 'hidden', marginHorizontal: 10 },
  hBar: { height: '100%', borderRadius: 5 },
  percentText: { fontSize: 12, fontWeight: '700', color: COLORS.textGray, width: 35 },
});