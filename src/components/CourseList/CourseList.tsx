import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { typography } from '../../theme/typography';
import { colors } from '../../theme/colors';

interface Course {
    id: number;
    name: string;
    level: string;
}

interface CourseListProps {
    title?: string;
    onCourseSelect?: (course: Course) => void;
}

const CourseList: React.FC<CourseListProps> = ({ 
    title = "KHÓA HỌC",
    onCourseSelect
}) => {
    const courses: Course[] = [
        { id: 1, name: 'Sơ cấp 1', level: 'Sơ cấp 1' },
        { id: 2, name: 'Sơ cấp 2', level: 'Sơ cấp 2' },
        { id: 3, name: 'Trung cấp 3', level: 'Trung cấp 3' },
        { id: 4, name: 'Trung cấp 4', level: 'Trung cấp 4' },
        { id: 5, name: 'Cao cấp 5', level: 'Cao cấp 5' },
        { id: 6, name: 'Cao cấp 6', level: 'Cao cấp 6' },
    ];

    const [selectedCourse, setSelectedCourse] = useState<Course>(courses[0]);

    const handleCourseSelect = (course: Course): void => {
        setSelectedCourse(course);
        if (onCourseSelect) {
            onCourseSelect(course);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            
            <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {courses.map((course) => (
                    <TouchableOpacity
                        key={course.id}
                        style={[
                            styles.courseItem,
                            selectedCourse?.id === course.id 
                                ? styles.courseItemSelected 
                                : styles.courseItemNormal
                        ]}
                        onPress={() => handleCourseSelect(course)}
                    >
                        <Text style={[
                            styles.courseText,
                            selectedCourse?.id === course.id 
                                ? styles.courseTextSelected 
                                : styles.courseTextNormal
                        ]}>
                            {course.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.light.card,
        borderRadius: 12,
        padding: 16,
        shadowColor: colors.light.black,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    title: {
        fontSize: 18,
        fontFamily: typography.fonts.bold,
        color: colors.light.text,
        marginBottom: 12,
    },
    scrollContent: {
        gap: 8,
    },
    courseItem: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
    },
    courseItemSelected: {
        backgroundColor: colors.light.primary,
        borderColor: colors.light.primary,
    },
    courseItemNormal: {
        backgroundColor: colors.light.card,
        borderColor: colors.light.primary,
    },
    courseText: {
        fontSize: typography.fontSizes.sm,
        fontFamily: typography.fonts.semiBold,
    },
    courseTextSelected: {
        color: colors.light.card,
    },
    courseTextNormal: {
        color: colors.light.primary,
    },
});

export default CourseList;