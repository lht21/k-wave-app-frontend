import React, { useState } from 'react';
import { 
  View, 
  ScrollView, 
  StyleSheet, 
  Text, 
  Dimensions,  
  Platform, 
  StatusBar,
  TouchableOpacity 
} from 'react-native';
import { useRouter } from 'expo-router';
// Giữ nguyên các component chứa logic và dữ liệu thật của bạn
import CourseList from '../../../components/CourseList/CourseList';
import TeacherLessonTable from '../../../components/Teacher/TeacherLessonTable';
import { colors, palette } from '../../../theme/colors';
import { PlusCircleIcon } from 'phosphor-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const UI_COLORS = {
  primaryGreen: '#00D95F',
  textDark: '#1A1A1A',
  white: '#FFFFFF',
  backgroundLight: '#F7F9FC',
};

const TeacherLessonsScreen = () => {
    const router = useRouter(); 
    // LOGIC GỐC: Giữ nguyên state quản lý Level
    const [selectedLevel, setSelectedLevel] = useState('Sơ cấp 1');

    // LOGIC GỐC: Giữ nguyên hàm xử lý chọn khóa học
    const handleCourseSelect = (course: { level: string }) => {
        setSelectedLevel(course.level);
    };
    const handleViewLessonDetail = (lessonId: string) => {
        router.push(`/(teacher)/lesson/${lessonId}`);
    };

    return (
        <View style={styles.container}>
            {/* UI MỚI: Header cong đặc trưng */}
            <View style={styles.headerBackgroundShape} />

            <SafeAreaView style={styles.safeArea}>
                <ScrollView 
                    style={styles.scrollView} 
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                
                    
                    {/* LOGIC GỐC: Component danh sách khóa học (Dữ liệu thật) */}
                    {/* Lưu ý: Bạn nên cập nhật style bên trong CourseList để khớp với nút Sơ cấp 1 xanh trong ảnh */}
                    <View style={styles.courseListWrapper}>
                        <CourseList onCourseSelect={handleCourseSelect} />
                    </View>
                    
                    {/* LOGIC GỐC: Component bảng/danh sách bài học (Dữ liệu thật) */}
                    <View style={styles.lessonContainer}>
                        <TeacherLessonTable selectedLevel={selectedLevel} />
                    </View>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: UI_COLORS.white,
    },
    // UI MỚI: Hiệu ứng nền Wavy Header
    headerBackgroundShape: {
        position: 'absolute',
        top: -width * 0.6,
        left: -width * 0.1,
        right: -width * 0.1,
        height: width * 0.8,
        backgroundColor: UI_COLORS.backgroundLight,
        borderBottomLeftRadius: width,
        borderBottomRightRadius: width,
        transform: [{ scaleX: 1.2 }],
    },
    safeArea: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
    },
    mainHeaderTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: UI_COLORS.primaryGreen,
        marginBottom: 20,
    },
    courseListWrapper: {
        marginBottom: 25,
    },
    lessonHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
   
    addBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: UI_COLORS.primaryGreen,
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 20,
        shadowColor: UI_COLORS.primaryGreen,
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 3,
    },
    addBtnText: {
        color: '#FFF',
        fontWeight: '700',
        marginLeft: 6,
        fontSize: 13,
    },
    lessonContainer: {
        // Chuyển container từ nền trắng sang trong suốt để TeacherLessonTable tự hiển thị card
        backgroundColor: 'transparent', 
        marginTop: 5,
    },
});

export default TeacherLessonsScreen;