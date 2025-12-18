import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Platform, StatusBar } from 'react-native';
import { TrophyIcon, MedalIcon, CrownIcon, StarIcon, CaretLeftIcon } from 'phosphor-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const COLORS = {
  primaryGreen: '#00C853',
  textDark: '#1A1A1A',
  textGray: '#666666',
  cardBg: '#F0F2F5',
  white: '#FFFFFF',
  gold: '#FFD700',
};

export default function AchievementsScreen() {

  const router = useRouter()
  const achievements = [
    { title: 'Chuỗi ngày vàng', desc: '7 ngày liên tiếp', icon: TrophyIcon },
    { title: 'Người kiên trì', desc: 'Hoàn thành 50 bài', icon: StarIcon },
    { title: 'Thủ khoa', desc: 'Đạt 90% điểm thi', icon: CrownIcon },
  ];

  const rankings = [
    { rank: 1, name: 'Nguyễn Thị A', exp: 1250 },
    { rank: 2, name: 'Trần Văn B', exp: 1180 },
    { rank: 3, name: 'Lê Thị C', exp: 950 },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.headerBackgroundShape} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity onPress={() => router.back()}>
              <CaretLeftIcon size={28} color={COLORS.primaryGreen} weight="bold" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Thành tích</Text>

          {/* Section: Danh hiệu */}
          <View style={styles.sectionCard}>
            <Text style={styles.cardTitleInside}>Danh hiệu đạt được</Text>
            <View style={styles.achievementGrid}>
              {achievements.map((item, idx) => (
                <View key={idx} style={styles.achievementItem}>
                  <View style={styles.iconCircle}>
                    <item.icon size={28} color={COLORS.primaryGreen} weight="fill" />
                  </View>
                  <Text style={styles.achTitle}>{item.title}</Text>
                  <Text style={styles.achDesc}>{item.desc}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Section: Bảng xếp hạng */}
          <View style={styles.sectionCard}>
            <View style={styles.rankingHeader}>
              <MedalIcon size={24} color={COLORS.primaryGreen} weight="bold" />
              <Text style={styles.cardTitleInside}>Bảng xếp hạng TOP 3</Text>
            </View>
            <View style={styles.rankingList}>
              {rankings.map((user) => (
                <View key={user.rank} style={[styles.rankItem, user.rank === 1 && styles.topRank]}>
                  <Text style={styles.rankNumber}>{user.rank}</Text>
                  <View style={styles.rankAvatar}>
                    <Text style={styles.avatarLetter}>{user.name[0]}</Text>
                  </View>
                  <Text style={styles.rankName}>{user.name}</Text>
                  <Text style={styles.rankExp}>{user.exp} exp</Text>
                </View>
              ))}
            </View>
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
  cardTitleInside: { fontSize: 16, fontWeight: '700', color: COLORS.textDark, marginBottom: 20 },
  achievementGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  achievementItem: { alignItems: 'center', width: '30%' },
  iconCircle: { width: 55, height: 55, borderRadius: 28, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', marginBottom: 10, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  achTitle: { fontSize: 11, fontWeight: '700', textAlign: 'center', color: COLORS.textDark, marginBottom: 4 },
  achDesc: { fontSize: 9, color: COLORS.textGray, textAlign: 'center' },
  rankingHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  rankingList: { gap: 10 },
  rankItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, padding: 12, borderRadius: 16 },
  topRank: { borderWidth: 1, borderColor: COLORS.primaryGreen },
  rankNumber: { width: 20, fontSize: 14, fontWeight: '800', color: COLORS.primaryGreen },
  rankAvatar: { width: 35, height: 35, borderRadius: 18, backgroundColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center', marginHorizontal: 10 },
  avatarLetter: { fontWeight: '700', color: COLORS.textDark },
  rankName: { flex: 1, fontSize: 14, fontWeight: '600', color: COLORS.textDark },
  rankExp: { fontSize: 12, fontWeight: '700', color: COLORS.textGray },
});