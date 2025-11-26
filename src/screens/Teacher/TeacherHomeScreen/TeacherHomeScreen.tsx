import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { LineChart, ProgressChart } from 'react-native-chart-kit';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  UserIcon,
  BookOpen01Icon,
  StarIcon,
  DollarCircleIcon,
  CheckmarkBadge02Icon,
  CalendarIcon,
  ArrowRightIcon,
  EarthIcon,
  NoteIcon,
  Target02Icon,
  FavouriteIcon,
} from '@hugeicons/core-free-icons';

import { colors, palette } from '../../../theme/colors';
import { typography } from '../../../theme/typography';

const { width: screenWidth } = Dimensions.get('window');

// --- TYPES ---
interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  change?: number;
  color?: string;
}

interface ProgressBarProps {
  percentage: number;
  color?: string;
  height?: number;
}

interface PopularItemProps {
  rank: number;
  title: string;
  metric: string;
  value: number;
  type: 'lesson' | 'culture' | 'exam';
}

// --- MOCK DATA ---
const dashboardData = {
  overview: {
    totalStudents: 1247,
    activeStudents: 892,
    totalLessons: 45,
    totalExams: 27,
    totalCultures: 36,
    completionRate: 68,
    revenue: 12450000
  },
  studentStats: {
    byLevel: [
      { level: 'Sơ cấp 1', count: 456, color: palette.success },
      { level: 'Sơ cấp 2', count: 321, color: palette.info },
      { level: 'Trung cấp 3', count: 258, color: palette.warning },
      { level: 'Trung cấp 4', count: 158, color: palette.orange },
      { level: 'Cao cấp 5', count: 133, color: palette.error },
      { level: 'Cao cấp 6', count: 56, color: palette.error }
    ],
    growth: 23,
    newThisMonth: 89
  },
  popularContent: {
    lessons: [
      { id: 1, title: 'Bảng chữ cái Hangeul', views: 1250, completion: 89 },
      { id: 2, title: 'Chào hỏi cơ bản', views: 980, completion: 78 },
      { id: 3, title: 'Ngữ pháp thì hiện tại', views: 765, completion: 65 }
    ],
    cultures: [
      { id: 1, title: 'Văn hóa Sunbae-Hoobae', views: 2100, likes: 156 },
      { id: 2, title: 'Nghệ thuật Kimchi', views: 1890, likes: 143 },
      { id: 3, title: 'Lễ hội Chuseok', views: 1670, likes: 128 }
    ],
    exams: [
      { id: 1, name: 'TOPIK I - Đề 1', attempts: 345, avgScore: 72 },
      { id: 2, name: 'TOPIK I - Đề 2', attempts: 298, avgScore: 68 },
      { id: 3, name: 'TOPIK II - Đề 1', attempts: 187, avgScore: 65 }
    ]
  },
  recentActivity: [
    { type: 'lesson', user: 'Nguyễn Văn A', action: 'hoàn thành', target: 'Bảng chữ cái', time: '2 phút trước' },
    { type: 'exam', user: 'Trần Thị B', action: 'làm bài', target: 'TOPIK I - Đề 1', score: 85, time: '5 phút trước' },
    { type: 'culture', user: 'Lê Văn C', action: 'thích', target: 'Văn hóa Sunbae-Hoobae', time: '10 phút trước' },
    { type: 'lesson', user: 'Phạm Thị D', action: 'bắt đầu', target: 'Chào hỏi cơ bản', time: '15 phút trước' }
  ],
  performanceMetrics: {
    lessonCompletion: [65, 72, 68, 75, 70, 78, 82],
    studentSatisfaction: 4.5,
    avgExamScore: 71,
    cultureEngagement: 1560
  }
};

const TeacherHomeScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1500);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.light.primary} />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  // --- COMPONENTS ---
  const StatCard: React.FC<StatCardProps> = ({ icon, title, value, change, color = 'primary' }) => (
    <View style={styles.statCard}>
      <View style={styles.statHeader}>
        <View style={[styles.statIcon, { backgroundColor: colors.light.background + '20' }]}>
          {icon}
        </View>
        {change !== undefined && (
          <View style={[
            styles.changeBadge,
            change > 0 ? styles.positiveChange : styles.negativeChange
          ]}>
            <HugeiconsIcon 
              icon={CheckmarkBadge02Icon} 
              size={12} 
              color={change > 0 ? palette.success : palette.error} 
            />
            <Text style={[
              styles.changeText,
              { color: change > 0 ? palette.success : palette.error }
            ]}>
              {Math.abs(change)}%
            </Text>
          </View>
        )}
      </View>
      <Text style={styles.statValue}>{typeof value === 'number' ? value.toLocaleString() : value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  );

  const ProgressBar: React.FC<ProgressBarProps> = ({ percentage, color = colors.light.primary, height = 8 }) => (
    <View style={[styles.progressBar, { height }]}>
      <View 
        style={[
          styles.progressFill, 
          { 
            width: `${percentage}%`,
            backgroundColor: color
          }
        ]} 
      />
    </View>
  );

  const PopularItem: React.FC<PopularItemProps> = ({ rank, title, metric, value, type }) => {
    const getIcon = () => {
      switch (type) {
        case 'lesson': return BookOpen01Icon;
        case 'culture': return EarthIcon;
        case 'exam': return NoteIcon;
        default: return BookOpen01Icon;
      }
    };

    return (
      <View style={styles.popularItem}>
        <View style={styles.popularLeft}>
          <View style={styles.rankBadge}>
            <Text style={styles.rankText}>{rank}</Text>
          </View>
          <HugeiconsIcon 
            icon={getIcon()} 
            size={20} 
            color={colors.light.primary} 
            style={styles.popularIcon}
          />
          <View style={styles.popularInfo}>
            <Text style={styles.popularTitle} numberOfLines={1}>{title}</Text>
            <Text style={styles.popularMetric}>{metric}</Text>
          </View>
        </View>
        <View style={styles.popularRight}>
          <Text style={styles.popularValue}>{value.toLocaleString()}</Text>
          <Text style={styles.popularValueLabel}>
            {type === 'exam' ? 'lần làm' : 'lượt xem'}
          </Text>
        </View>
      </View>
    );
  };

  // Chart data
  const lineChartData = {
    labels: ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'],
    datasets: [
      {
        data: dashboardData.performanceMetrics.lessonCompletion,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: colors.light.background,
    backgroundGradientFrom: colors.light.background,
    backgroundGradientTo: colors.light.background,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: colors.light.primary,
    },
  };

  const progressChartData = {
    labels: ["Bài học", "Văn hóa", "Bài thi"],
    data: [0.6, 0.3, 0.1]
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh}
          colors={[colors.light.primary]}
          tintColor={colors.light.primary}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Xin chào, Giáo viên!</Text>
          <Text style={styles.subtitle}>Tổng quan hoạt động giảng dạy</Text>
        </View>
        <TouchableOpacity style={styles.dateButton}>
          <HugeiconsIcon icon={CalendarIcon} size={20} color={colors.light.text} />
          <Text style={styles.dateText}>Hôm nay</Text>
        </TouchableOpacity>
      </View>

      {/* Overview Stats */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.statsScroll}
        contentContainerStyle={styles.statsContent}
      >
        <StatCard
          icon={<HugeiconsIcon icon={UserIcon} size={24} color={colors.light.primary} />}
          title="Tổng học viên"
          value={dashboardData.overview.totalStudents}
          change={12}
          color="primary"
        />
        <StatCard
          icon={<HugeiconsIcon icon={BookOpen01Icon} size={24} color={palette.success} />}
          title="Bài học đang học"
          value={dashboardData.overview.activeStudents}
          change={8}
          color="success"
        />
        <StatCard
          icon={<HugeiconsIcon icon={StarIcon} size={24} color={palette.warning} />}
          title="Tỷ lệ hoàn thành"
          value={`${dashboardData.overview.completionRate}%`}
          change={5}
          color="warning"
        />
        <StatCard
          icon={<HugeiconsIcon icon={DollarCircleIcon} size={24} color={palette.orange} />}
          title="Doanh thu"
          value={`${(dashboardData.overview.revenue / 1000000).toFixed(1)}M`}
          change={15}
          color="orange"
        />
      </ScrollView>

      {/* Student Distribution */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Phân bổ học viên</Text>
          <TouchableOpacity style={styles.seeAllButton}>
            <Text style={styles.seeAllText}>Xem tất cả</Text>
            <HugeiconsIcon icon={ArrowRightIcon} size={16} color={colors.light.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.distributionCard}>
          {dashboardData.studentStats.byLevel.map((item, index) => {
            const percentage = (item.count / dashboardData.overview.totalStudents) * 100;
            return (
              <View key={item.level} style={styles.distributionItem}>
                <View style={styles.distributionHeader}>
                  <Text style={styles.distributionLevel}>{item.level}</Text>
                  <Text style={styles.distributionCount}>{item.count} HV</Text>
                </View>
                <ProgressBar percentage={percentage} color={item.color} />
                <Text style={styles.distributionPercentage}>{percentage.toFixed(1)}%</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Popular Content */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nội dung phổ biến</Text>
          <TouchableOpacity style={styles.seeAllButton}>
            <Text style={styles.seeAllText}>Xem tất cả</Text>
            <HugeiconsIcon icon={ArrowRightIcon} size={16} color={colors.light.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.popularScroll}
          contentContainerStyle={styles.popularContent}
        >
          {/* Popular Lessons */}
          <View style={styles.popularCard}>
            <View style={styles.popularCardHeader}>
              <HugeiconsIcon icon={BookOpen01Icon} size={20} color={colors.light.primary} />
              <Text style={styles.popularCardTitle}>Bài học phổ biến</Text>
            </View>
            <View style={styles.popularList}>
              {dashboardData.popularContent.lessons.map((item, index) => (
                <PopularItem
                  key={item.id}
                  rank={index + 1}
                  title={item.title}
                  metric={`Hoàn thành: ${item.completion}%`}
                  value={item.views}
                  type="lesson"
                />
              ))}
            </View>
          </View>

          {/* Popular Cultures */}
          <View style={styles.popularCard}>
            <View style={styles.popularCardHeader}>
              <HugeiconsIcon icon={EarthIcon} size={20} color={palette.success} />
              <Text style={styles.popularCardTitle}>Văn hóa phổ biến</Text>
            </View>
            <View style={styles.popularList}>
              {dashboardData.popularContent.cultures.map((item, index) => (
                <PopularItem
                  key={item.id}
                  rank={index + 1}
                  title={item.title}
                  metric={`${item.likes} lượt thích`}
                  value={item.views}
                  type="culture"
                />
              ))}
            </View>
          </View>

          {/* Popular Exams */}
          <View style={styles.popularCard}>
            <View style={styles.popularCardHeader}>
              <HugeiconsIcon icon={NoteIcon} size={20} color={palette.warning} />
              <Text style={styles.popularCardTitle}>Bài thi phổ biến</Text>
            </View>
            <View style={styles.popularList}>
              {dashboardData.popularContent.exams.map((item, index) => (
                <PopularItem
                  key={item.id}
                  rank={index + 1}
                  title={item.name}
                  metric={`Điểm TB: ${item.avgScore}`}
                  value={item.attempts}
                  type="exam"
                />
              ))}
            </View>
          </View>
        </ScrollView>
      </View>

      {/* Charts Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Biểu đồ hiệu suất</Text>
        
        {/* Line Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Tỷ lệ hoàn thành bài học theo tuần</Text>
          <LineChart
            data={lineChartData}
            width={screenWidth - 75}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withVerticalLines={false}
            withHorizontalLines={false}
          />
        </View>

        {/* Performance Metrics */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <HugeiconsIcon icon={Target02Icon} size={24} color={colors.light.primary} />
            <Text style={styles.metricValue}>{dashboardData.performanceMetrics.avgExamScore}</Text>
            <Text style={styles.metricLabel}>Điểm TB bài thi</Text>
          </View>
          <View style={styles.metricCard}>
            <HugeiconsIcon icon={StarIcon} size={24} color={palette.warning} />
            <Text style={styles.metricValue}>{dashboardData.performanceMetrics.studentSatisfaction}</Text>
            <Text style={styles.metricLabel}>Mức độ hài lòng</Text>
          </View>
          <View style={styles.metricCard}>
            <HugeiconsIcon icon={FavouriteIcon} size={24} color={palette.error} />
            <Text style={styles.metricValue}>
              {(dashboardData.performanceMetrics.cultureEngagement / 1000).toFixed(1)}K
            </Text>
            <Text style={styles.metricLabel}>Engagement</Text>
          </View>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Hoạt động gần đây</Text>
          <TouchableOpacity style={styles.seeAllButton}>
            <Text style={styles.seeAllText}>Xem tất cả</Text>
            <HugeiconsIcon icon={ArrowRightIcon} size={16} color={colors.light.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.activityCard}>
          {dashboardData.recentActivity.map((activity, index) => (
            <View key={index} style={styles.activityItem}>
              <View style={[
                styles.activityIcon,
                { 
                  backgroundColor: 
                    activity.type === 'lesson' ? colors.light.primary + '20' :
                    activity.type === 'exam' ? palette.warning + '20' :
                    palette.error + '20'
                }
              ]}>
                {activity.type === 'lesson' && (
                  <HugeiconsIcon icon={BookOpen01Icon} size={16} color={colors.light.primary} />
                )}
                {activity.type === 'exam' && (
                  <HugeiconsIcon icon={NoteIcon} size={16} color={palette.warning} />
                )}
                {activity.type === 'culture' && (
                  <HugeiconsIcon icon={FavouriteIcon} size={16} color={palette.error} />
                )}
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>
                  <Text style={styles.activityUser}>{activity.user}</Text> đã {activity.action}{' '}
                  <Text style={styles.activityTarget}>"{activity.target}"</Text>
                  {activity.score && ` với ${activity.score} điểm`}
                </Text>
                <Text style={styles.activityTime}>{activity.time}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Bottom Spacer */}
      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
    marginTop: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.light.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: typography.fontSizes.sm,
    color: colors.light.textSecondary,
    fontFamily: typography.fonts.regular,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  greeting: {
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fonts.bold,
    color: colors.light.text,
  },
  subtitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.light.textSecondary,
    fontFamily: typography.fonts.regular,
    marginTop: 4,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.light.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  dateText: {
    fontSize: typography.fontSizes.sm,
    color: colors.light.text,
    fontFamily: typography.fonts.regular,
  },
  statsScroll: {
    marginBottom: 8,
  },
  statsContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  statCard: {
    width: 160,
    backgroundColor: colors.light.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.light.border,
    shadowColor: colors.light.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  positiveChange: {
    backgroundColor: palette.success + '20',
  },
  negativeChange: {
    backgroundColor: palette.error + '20',
  },
  changeText: {
    fontSize: 10,
    fontFamily: typography.fonts.bold,
  },
  statValue: {
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fonts.bold,
    color: colors.light.text,
    marginBottom: 4,
  },
  statTitle: {
    fontSize: typography.fontSizes.sm,
    color: colors.light.textSecondary,
    fontFamily: typography.fonts.regular,
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontFamily: typography.fonts.bold,
    color: colors.light.text,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllText: {
    fontSize: typography.fontSizes.sm,
    color: colors.light.primary,
    fontFamily: typography.fonts.regular,
  },
  distributionCard: {
    backgroundColor: colors.light.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  distributionItem: {
    marginBottom: 16,
  },
  distributionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  distributionLevel: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fonts.regular,
    color: colors.light.text,
  },
  distributionCount: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fonts.regular,
    color: colors.light.textSecondary,
  },
  distributionPercentage: {
    fontSize: typography.fontSizes.xs,
    color: colors.light.textSecondary,
    fontFamily: typography.fonts.regular,
    marginTop: 4,
    textAlign: 'right',
  },
  progressBar: {
    backgroundColor: colors.light.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  popularScroll: {
    marginHorizontal: -20,
  },
  popularContent: {
    paddingHorizontal: 20,
    gap: 16,
  },
  popularCard: {
    width: 280,
    backgroundColor: colors.light.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  popularCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  popularCardTitle: {
    fontSize: typography.fontSizes.md,
    fontFamily: typography.fonts.semiBold,
    color: colors.light.text,
  },
  popularList: {
    gap: 12,
  },
  popularItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  popularLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  rankBadge: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: colors.light.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    fontSize: 12,
    color: colors.light.white,
    fontFamily: typography.fonts.bold,
  },
  popularIcon: {
    marginHorizontal: 4,
  },
  popularInfo: {
    flex: 1,
  },
  popularTitle: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fonts.regular,
    color: colors.light.text,
    marginBottom: 2,
  },
  popularMetric: {
    fontSize: typography.fontSizes.xs,
    color: colors.light.textSecondary,
    fontFamily: typography.fonts.regular,
  },
  popularRight: {
    alignItems: 'flex-end',
  },
  popularValue: {
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fonts.bold,
    color: colors.light.primary,
  },
  popularValueLabel: {
    fontSize: 10,
    color: colors.light.textSecondary,
    fontFamily: typography.fonts.regular,
  },
  chartCard: {
    backgroundColor: colors.light.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.light.border,
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: typography.fontSizes.md,
    fontFamily: typography.fonts.semiBold,
    color: colors.light.text,
    marginBottom: 16,
  },
  chart: {
    borderRadius: 12,
    marginVertical: 8,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: colors.light.card,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  metricValue: {
    fontSize: typography.fontSizes.xl,
    fontFamily: typography.fonts.bold,
    color: colors.light.text,
    marginVertical: 8,
  },
  metricLabel: {
    fontSize: typography.fontSizes.xs,
    color: colors.light.textSecondary,
    fontFamily: typography.fonts.regular,
    textAlign: 'center',
  },
  activityCard: {
    backgroundColor: colors.light.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 8,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: typography.fontSizes.sm,
    color: colors.light.text,
    fontFamily: typography.fonts.regular,
    lineHeight: 20,
  },
  activityUser: {
    fontFamily: typography.fonts.semiBold,
    color: colors.light.text,
  },
  activityTarget: {
    fontFamily: typography.fonts.regular,
    color: colors.light.primary,
  },
  activityTime: {
    fontSize: typography.fontSizes.xs,
    color: colors.light.textSecondary,
    fontFamily: typography.fonts.regular,
    marginTop: 2,
  },
  bottomSpacer: {
    height: 20,
  },
});

export default TeacherHomeScreen;