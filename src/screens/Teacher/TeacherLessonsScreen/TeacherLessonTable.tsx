import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    ScrollView,
    Alert,
    StyleSheet,
    ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { 
    EyeIcon,
    Edit01Icon,
    Delete02Icon,
    PlusSignIcon 
} from '@hugeicons/core-free-icons';

import Button from '../../../components/Button/Button';
import ModalLesson from '../../../components/Modal/ModalLesson';
import { colors, palette } from '../../../theme/colors';
import { typography } from '../../../theme/typography';
import { lessonService, Lesson } from '../../../services/lessonService';

// Types
interface TeacherLessonTableProps {
    selectedLevel: string;
}

type RootStackParamList = {
    LessonDetail: { lessonId: string };
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

const TeacherLessonTable: React.FC<TeacherLessonTableProps> = ({ selectedLevel = 'Sơ cấp 1' }) => {
    const navigation = useNavigation<NavigationProp>();

    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [selectedLessons, setSelectedLessons] = useState<Set<string>>(new Set());
    const [isSelectAll, setIsSelectAll] = useState<boolean>(false);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
    const [isAdding, setIsAdding] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Load bài học từ API
    const loadLessons = async () => {
        try {
            setIsLoading(true);
            const response = await lessonService.getLessons({ level: selectedLevel });
            setLessons(response.lessons);
        } catch (error: any) {
            console.error('Error loading lessons:', error);
            Alert.alert('Lỗi', error.message || 'Không thể tải danh sách bài học');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadLessons();
    }, [selectedLevel]);

    // Check if all lessons are selected
    useEffect(() => {
        if (lessons.length > 0 && selectedLessons.size === lessons.length) {
            setIsSelectAll(true);
        } else {
            setIsSelectAll(false);
        }
    }, [selectedLessons, lessons]);

    const handleAddLesson = (): void => {
        setIsAdding(true);
        setEditingLesson(null);
        setIsModalOpen(true);
    };

    const handleEditLesson = (lessonId: string): void => {
        const lesson = lessons.find(l => l._id === lessonId);
        setEditingLesson(lesson || null);
        setIsAdding(false);
        setIsModalOpen(true);
    };

    const handleSaveLesson = async (
        formData: Omit<Lesson, '_id' | 'viewCount' | 'completionCount' | 'author'>
    ): Promise<void> => {
        try {
            if (isAdding) {
                // Tạo mới bài học
                const newLessonData = {
                    ...formData,
                    level: selectedLevel,
                };
                
                const savedLesson = await lessonService.createLesson(newLessonData);
                setLessons(prev => [...prev, savedLesson]);
                Alert.alert('Thành công', 'Đã tạo bài học mới');
            } else if (editingLesson && editingLesson._id) {
                // Cập nhật bài học
                const updatedLesson = await lessonService.updateLesson(
                    editingLesson._id, 
                    formData
                );
                setLessons(prev => 
                    prev.map(l => l._id === editingLesson._id ? updatedLesson : l)
                );
                Alert.alert('Thành công', 'Đã cập nhật bài học');
            }
            setIsModalOpen(false);
        } catch (error: any) {
            console.error('Error saving lesson:', error);
            Alert.alert('Lỗi', error.message || 'Không thể lưu bài học');
        }
    };

    const handleCloseModal = (): void => {
        setIsModalOpen(false);
        setEditingLesson(null);
        setIsAdding(false);
    };

    const handleDeleteLesson = (lessonId: string): void => {
        Alert.alert(
            'Xác nhận xóa',
            'Bạn có chắc chắn muốn xóa bài học này vĩnh viễn?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await lessonService.deleteLesson(lessonId);
                            setLessons(prev => prev.filter(l => l._id !== lessonId));
                            setSelectedLessons(prev => {
                                const newSelected = new Set(prev);
                                newSelected.delete(lessonId);
                                return newSelected;
                            });
                            Alert.alert('Thành công', 'Đã xóa bài học');
                        } catch (error: any) {
                            Alert.alert('Lỗi', error.message || 'Không thể xóa bài học');
                        }
                    }
                }
            ]
        );
    };

    const handleBulkDelete = (): void => {
        if (selectedLessons.size === 0) {
            Alert.alert('Thông báo', 'Vui lòng chọn ít nhất một bài học để xóa');
            return;
        }

        Alert.alert(
            'Xác nhận xóa',
            `Bạn có chắc chắn muốn xóa ${selectedLessons.size} bài học vĩnh viễn?`,
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const ids = Array.from(selectedLessons);
                            const result = await lessonService.deleteMultipleLessons(ids);
                            
                            setLessons(prev => prev.filter(l => !selectedLessons.has(l._id!)));
                            setSelectedLessons(new Set());
                            setIsSelectAll(false);
                            
                            Alert.alert('Thành công', `Đã xóa ${result.deletedCount} bài học`);
                        } catch (error: any) {
                            Alert.alert('Lỗi', error.message || 'Không thể xóa bài học');
                        }
                    }
                }
            ]
        );
    };

    const handleViewDetails = (lessonId: string): void => {
        navigation.navigate('LessonDetail', { lessonId });
    };

    const handleSelectLesson = (lessonId: string): void => {
        setSelectedLessons(prev => {
            const newSelected = new Set(prev);
            if (newSelected.has(lessonId)) {
                newSelected.delete(lessonId);
            } else {
                newSelected.add(lessonId);
            }
            return newSelected;
        });
    };

    const handleSelectAll = (): void => {
        if (isSelectAll) {
            setSelectedLessons(new Set());
        } else {
            const allIds = new Set(lessons.map(lesson => lesson._id!));
            setSelectedLessons(allIds);
        }
        setIsSelectAll(!isSelectAll);
    };

    // Component helpers
    interface CheckboxProps {
        selected: boolean;
        onPress: () => void;
    }

    const Checkbox: React.FC<CheckboxProps> = ({ selected, onPress }) => (
        <TouchableOpacity onPress={onPress} style={styles.checkbox}>
            <View style={[styles.checkboxBox, selected && styles.checkboxSelected]}>
                {selected && <View style={styles.checkboxInner} />}
            </View>
        </TouchableOpacity>
    );

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.light.primary} />
                <Text style={styles.loadingText}>Đang tải bài học...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>BÀI HỌC - {selectedLevel}</Text>
                    <Text style={styles.subtitle}>
                        {lessons.length} bài học
                        {selectedLessons.size > 0 && ` • ${selectedLessons.size} đã chọn`}
                    </Text>
                </View>
                
                <View style={styles.actions}>
                    <Button
                        title="Thêm bài học"
                        variant="primary"
                        size="small"
                        leftIcon={<HugeiconsIcon icon={PlusSignIcon} size={16} color={palette.white} />}
                        onPress={handleAddLesson}
                    />

                    {selectedLessons.size > 0 && (
                        <Button
                            title={`Xóa (${selectedLessons.size})`}
                            variant="danger"
                            size="small"
                            leftIcon={<HugeiconsIcon icon={Delete02Icon} size={16} color={palette.white} />}
                            onPress={handleBulkDelete}
                        />
                    )}
                </View>
            </View>

            {/* Table Header */}
            <View style={styles.tableHeader}>
                <Checkbox selected={isSelectAll} onPress={handleSelectAll} />
                <Text style={styles.columnHeader}>MÃ BÀI</Text>
                <Text style={styles.columnHeader}>TÊN BÀI HỌC</Text>
                <Text style={styles.columnHeader}>HÀNH ĐỘNG</Text>
            </View>

            {/* Table Body */}
            <ScrollView style={styles.tableBody}>
                {lessons.length > 0 ? (
                    lessons.map((lesson) => {
                        const isSelected = selectedLessons.has(lesson._id!);
                        
                        return (
                            <View
                                key={lesson._id}
                                style={[
                                    styles.tableRow,
                                    isSelected && styles.tableRowSelected
                                ]}
                            >
                                <Checkbox 
                                    selected={isSelected} 
                                    onPress={() => handleSelectLesson(lesson._id!)} 
                                />

                                <Text style={styles.lessonCode}>{lesson.code}</Text>

                                <View style={styles.lessonInfo}>
                                    <Text style={styles.lessonTitle}>{lesson.title}</Text>
                                    <View style={styles.lessonMeta}>
                                        <View style={styles.levelBadge}>
                                            <Text style={styles.levelText}>{lesson.level}</Text>
                                        </View>
                                        {lesson.isPremium && (
                                            <View style={styles.premiumBadge}>
                                                <Text style={styles.premiumText}>Premium</Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text style={styles.lessonDescription}>{lesson.description}</Text>
                                </View>

                                <View style={styles.columnActions}>
                                    <TouchableOpacity
                                        onPress={() => handleViewDetails(lesson._id!)}
                                        style={styles.actionBtn}
                                    >
                                        <HugeiconsIcon icon={EyeIcon} size={20} color={colors.light.primary} />
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => handleEditLesson(lesson._id!)}
                                        style={styles.actionBtn}
                                    >
                                        <HugeiconsIcon icon={Edit01Icon} size={20} color={palette.warning} />
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => handleDeleteLesson(lesson._id!)}
                                        style={styles.actionBtn}
                                    >
                                        <HugeiconsIcon icon={Delete02Icon} size={20} color={palette.error} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    })
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>
                            Không có bài học nào cho level {selectedLevel}
                        </Text>
                        <Button 
                            title="Thêm bài học đầu tiên"
                            variant="primary"
                            leftIcon={<HugeiconsIcon icon={PlusSignIcon} size={16} color={palette.white} />}
                            onPress={handleAddLesson}
                        />
                    </View>
                )}
            </ScrollView>

            {/* Modal */}
            <ModalLesson
                isVisible={isModalOpen}
                onClose={handleCloseModal}
                lesson={editingLesson}
                onSave={handleSaveLesson}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: colors.light.textSecondary,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
        marginBottom: 24,
    },
    title: {
        fontSize: typography.fontSizes.lg,
        fontFamily: typography.fonts.bold,
        color: colors.light.text,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: typography.fontSizes.sm,
        color: colors.light.textSecondary,
        fontFamily: typography.fonts.regular,
    },
    actions: {
        flexDirection: 'row',
        gap: 8,
    },
    tableHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: colors.light.background,
        borderRadius: 8,
        marginBottom: 8,
    },
    columnHeader: {
        flexGrow: 1,
        flexShrink: 3,
        flexBasis: '1%',
        fontSize: typography.fontSizes.xs,
        fontFamily: typography.fonts.semiBold,
        color: colors.light.text,
    },
    tableBody: {
        flex: 1,
    },
    tableRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: colors.light.card,
        borderRadius: 8,
        marginBottom: 8,
    },
    tableRowSelected: {
        backgroundColor: colors.light.primary + '08',
        borderLeftWidth: 3,
        borderLeftColor: colors.light.primary,
    },
    checkbox: {
        marginRight: 12,
    },
    checkboxBox: {
        width: 20,
        height: 20,
        borderWidth: 2,
        borderColor: colors.light.border,
        backgroundColor: colors.light.gray500,
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxSelected: {
        backgroundColor: colors.light.gray900,
    },
    checkboxInner: {
        width: 10,
        height: 10,
        backgroundColor: palette.white,
        borderRadius: 2,
    },
    lessonCode: {
        flex: 1,
        fontSize: typography.fontSizes.sm,
        fontFamily: typography.fonts.semiBold,
        color: colors.light.primary,
    },
    lessonInfo: {
        flex: 15,
        marginHorizontal: 12,

    },
    lessonTitle: {
        fontSize: typography.fontSizes.sm,
        fontFamily: typography.fonts.semiBold,
        color: colors.light.text,
        marginBottom: 6,
    },
    lessonMeta: {
        flexDirection: 'row',
        gap: 6,
        marginBottom: 6,
    },
    levelBadge: {
        backgroundColor: palette.success + '20',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    levelText: {
        fontSize: typography.fontSizes.xs,
        fontFamily: typography.fonts.semiBold,
        color: palette.success,
    },
    premiumBadge: {
        backgroundColor: palette.purple + '20',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
    },
    premiumText: {
        fontSize: typography.fontSizes.xs,
        fontFamily: typography.fonts.semiBold,
        color: palette.purple,
    },
    lessonDescription: {
        fontSize: typography.fontSizes.xs,
        color: colors.light.textSecondary,
        marginBottom: 4,
        fontFamily: typography.fonts.regular,
    },
    columnActions: {
        flexDirection: 'column',
        gap: 4,
        flex: 1
    },
    actionBtn: {
        padding: 8,
    },
    emptyState: {
        alignItems: 'center',
        padding: 40,
    },
    emptyText: {
        fontSize: typography.fontSizes.md,
        color: colors.light.textSecondary,
        marginBottom: 16,
        textAlign: 'center',
        fontFamily: typography.fonts.regular,
    },
});

export default TeacherLessonTable;