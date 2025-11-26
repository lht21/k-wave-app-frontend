import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import CourseList from '../../../components/CourseList/CourseList';
import TeacherLessonTable from './TeacherLessonTable';
import { colors } from '../../../theme/colors';

const TeacherLessonsScreen = () => {
    const [selectedLevel, setSelectedLevel] = useState('Sơ cấp 1');

    const handleCourseSelect = (course: { level: string }) => {
        setSelectedLevel(course.level);
    };

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    <CourseList onCourseSelect={handleCourseSelect} />
                    
                    <View style={styles.lessonContainer}>
                        <TeacherLessonTable selectedLevel={selectedLevel} />
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.light.background,
        marginTop: 40,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 16,
    },
    lessonContainer: {
        backgroundColor: colors.light.card,
        borderRadius: 12,
        padding: 16,
        marginTop: 16,
        shadowColor: colors.light.black,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
});

export default TeacherLessonsScreen;