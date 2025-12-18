import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { CaretLeftIcon, ArrowRightIcon, LockKeyIcon } from 'phosphor-react-native';
import Svg, { Path } from 'react-native-svg';
import { RootStackParamList } from '../../../types/navigation';

const { width } = Dimensions.get('window');

type StdRoadmapNavigationProp = StackNavigationProp<RootStackParamList>;

const StdRoadmap: React.FC = () => {
  const navigation = useNavigation<StdRoadmapNavigationProp>();

  // Giữ nguyên Logic Data
  const learningPath = [
    { id: '1', title: 'Bảng chữ cái', subtitle: '알파벳', index: '0', completed: true, locked: false },
    { id: '2', title: 'Giới thiệu', subtitle: '소개', index: '1', completed: true, locked: false },
    { id: '3', title: 'Trường học', subtitle: '학교', index: '2', completed: false, locked: true },
    { id: '4', title: 'Sinh hoạt hàng ngày', subtitle: '일상생활', index: '3', completed: false, locked: true },
    { id: '5', title: 'Ngày và thứ', subtitle: '날짜와 요일', index: '4', completed: false, locked: true },
    { id: '6', title: 'Công việc trong ngày', subtitle: '하루 일과', index: '5', completed: false, locked: true }
  ];

  const levelCategories = [
    { id: '1', title: 'Sơ cấp 1', active: true },
    { id: '2', title: 'Sơ cấp 2', active: false },
    { id: '3', title: 'Trung cấp 3', active: false },
    { id: '4', title: 'Trung cấp 4', active: false },
    { id: '5', title: 'Cao cấp 5', active: false },
    { id: '6', title: 'Cao cấp 6', active: false }
  ];

  const handleLessonPress = (item: any) => {
    if (!item.locked) {
      navigation.navigate('StdLesson', { lessonId: item.id, lessonTitle: item.title });
    }
  };

  const LevelTab = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={[styles.tabItem, item.active && styles.tabActive]}
    >
      <View style={styles.tabContent}>
        <ArrowRightIcon 
          size={18} 
          color={item.active ? '#FF8A00' : '#ADB5BD'} 
          weight="bold" 
        />
        <Text style={[styles.tabText, item.active && styles.tabTextActive]}>
          {item.title}
        </Text>
      </View>
      {/* Hiệu ứng mảng xanh phía dưới tab active */}
      {item.active && <View style={styles.activeBlob} />}
    </TouchableOpacity>
  );

  const PathNode = ({ item, index }: { item: any, index: number }) => {
    const isEven = index % 2 === 0;
    const isActive = !item.locked;

    return (
      <View style={[styles.nodeWrapper, { alignItems: isEven ? 'flex-start' : 'flex-end' }]}>
        <TouchableOpacity 
          style={[styles.pillCard, isActive ? styles.pillActive : styles.pillLocked]}
          onPress={() => handleLessonPress(item)}
          disabled={item.locked}
        >
          <View style={[styles.circleIcon, isActive ? styles.circleActive : styles.circleLocked]}>
            {item.locked ? (
              <LockKeyIcon size={20} color="#858585ff" weight="fill" />
            ) : (
              <View style={styles.dotInside} />
            )}
          </View>
          <View style={styles.nodeTextContent}>
            <Text style={styles.nodeIndex}>{item.index} - {item.subtitle}</Text>
            <Text style={styles.nodeTitle}>{item.title}</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      {/* Header Profile Style */}
      <View style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <CaretLeftIcon size={28} color="#fff" weight="bold" />
            </TouchableOpacity>
            <Text style={styles.headerTitleText}>Lộ trình</Text>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Level Grid Tabs */}
        <View style={styles.tabsGrid}>
          {levelCategories.map(level => (
            <LevelTab key={level.id} item={level} />
          ))}
        </View>

        {/* Roadmap Main Container */}
        <View style={styles.roadmapBox}>
          {/* SVG Background Lines - Giả lập đường nối cong */}
          <View style={styles.svgContainer}>
            <Svg height="100%" width="100%">
              <Path 
                d="M 80 80 Q 150 150 250 180 T 80 300 Q 150 380 250 420 T 80 550" 
                fill="none" 
                stroke="#E9ECEF" 
                strokeWidth="2" 
              />
            </Svg>
          </View>

          {learningPath.map((item, index) => (
            <PathNode key={item.id} item={item} index={index} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  header: {
    backgroundColor: '#00D95F',
    borderBottomRightRadius: 40,
    paddingBottom: 25,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  headerTitleText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  container: { padding: 20 },
  
  // Tabs Grid
  tabsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  tabItem: {
    width: '31.5%',
    height: 70,
    backgroundColor: '#F1F3F5',
    borderRadius: 20,
    marginBottom: 10,
    overflow: 'hidden',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  tabActive: {
    borderColor: '#00D95F',
    backgroundColor: '#fff',
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    zIndex: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#212529',
    marginLeft: 5,
  },
  tabTextActive: { color: '#FF8A00' },
  activeBlob: {
    position: 'absolute',
    bottom: -10,
    left: 0,
    right: 0,
    height: 30,
    backgroundColor: '#00D95F',
    borderRadius: 20,
  },

  // Roadmap Section
  roadmapBox: {
    borderWidth: 1.5,
    borderColor: '#DEE2E6',
    borderRadius: 30,
    padding: 25,
    paddingVertical: 40,
    minHeight: 600,
    position: 'relative',
  },
  svgContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  nodeWrapper: {
    width: '100%',
    marginBottom: 60,
    zIndex: 1,
  },
  pillCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingRight: 20,
    borderRadius: 25,
    width: '75%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  pillActive: { backgroundColor: '#C1F2D6' },
  pillLocked: { backgroundColor: '#E9ECEF' },
  circleIcon: {
    width: 45,
    height: 45,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  circleActive: { backgroundColor: '#00D95F' },
  circleLocked: { backgroundColor: '#ADB5BD' },
  dotInside: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  nodeTextContent: { flex: 1 },
  nodeIndex: { fontSize: 13, fontWeight: '700', color: '#000' },
  nodeTitle: { fontSize: 13, fontWeight: '600', color: '#000', opacity: 0.8 },
});

export default StdRoadmap;