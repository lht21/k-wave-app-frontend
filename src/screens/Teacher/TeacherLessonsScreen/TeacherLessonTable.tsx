import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, 
    ScrollView,
    Alert,
    StyleSheet 
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

// Types
interface Lesson {
    id: number;
    code: string;
    title: string;
    description: string;
    level: string;
    order: number;
    estimatedDuration: number;
    isPremium: boolean;
    viewCount: number;
    completionCount: number;
}

interface TeacherLessonTableProps {
    selectedLevel: string;
}

type RootStackParamList = {
    LessonDetail: { lessonId: number };
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

const TeacherLessonTable: React.FC<TeacherLessonTableProps> = ({ selectedLevel = 'Sơ cấp 1' }) => {
    const navigation = useNavigation<NavigationProp>();

    // Mock data
    const allLessons: Lesson[] = [
        {
            id: 1,
            code: 'BÀI 1',
            title: '0 - 알파벳 Bảng chữ cái',
            description: 'Tiếng Hàn sơ cấp 1',
            level: 'Sơ cấp 1',
            order: 1,
            estimatedDuration: 60,
            isPremium: false,
            viewCount: 150,
            completionCount: 120
        },
        {
            id: 2,
            code: 'BÀI 2',
            title: '1 - 인사 Chào hỏi',
            description: 'Tiếng Hàn sơ cấp 1',
            level: 'Sơ cấp 1',
            order: 2,
            estimatedDuration: 75,
            isPremium: false,
            viewCount: 89,
            completionCount: 67
        },
        {
            id: 3,
            code: 'BÀI 1',
            title: '0 - 문법 기초 Ngữ pháp cơ bản',
            description: 'Tiếng Hàn sơ cấp 2',
            level: 'Sơ cấp 2',
            order: 1,
            estimatedDuration: 70,
            isPremium: false,
            viewCount: 134,
            completionCount: 98
        },
        {
            id: 4,
            code: 'BÀI 2',
            title: '1 - 일상 생활 Cuộc sống hàng ngày',
            description: 'Tiếng Hàn sơ cấp 2',
            level: 'Sơ cấp 2',
            order: 2,
            estimatedDuration: 80,
            isPremium: true,
            viewCount: 76,
            completionCount: 45
        },
        {
            id: 5,
            code: 'BÀI 1',
            title: '0 - 중급 문법 Ngữ pháp trung cấp',
            description: 'Tiếng Hàn trung cấp 3',
            level: 'Trung cấp 3',
            order: 1,
            estimatedDuration: 90,
            isPremium: false,
            viewCount: 65,
            completionCount: 32
        }
    ];

    const [filteredLessons, setFilteredLessons] = useState<Lesson[]>([]);
    const [selectedLessons, setSelectedLessons] = useState<Set<number>>(new Set());
    const [isSelectAll, setIsSelectAll] = useState<boolean>(false);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
    const [isAdding, setIsAdding] = useState<boolean>(false);

    // Lọc bài học theo level được chọn
    useEffect(() => {
        const filtered = allLessons.filter(lesson => lesson.level === selectedLevel);
        setFilteredLessons(filtered);
        setSelectedLessons(new Set());
        setIsSelectAll(false);
    }, [selectedLevel]);

    // Check if all lessons are selected
    useEffect(() => {
        if (filteredLessons.length > 0 && selectedLessons.size === filteredLessons.length) {
            setIsSelectAll(true);
        } else {
            setIsSelectAll(false);
        }
    }, [selectedLessons, filteredLessons]);

    const handleAddLesson = (): void => {
        // Lấy danh sách order hiện có
        const existingOrders = filteredLessons.map(l => l.order).sort((a, b) => a - b);

        // Tìm số nhỏ nhất bị thiếu
        let newOrder = 1;
        for (let i = 0; i < existingOrders.length; i++) {
            if (existingOrders[i] !== i + 1) {
                newOrder = i + 1;
                break;
            }
            newOrder = existingOrders.length + 1; // nếu không thiếu số nào
        }

        const newLesson: Lesson = {
            id: Date.now(),
            code: `BÀI ${newOrder}`,
            title: `Bài mới ${newOrder}`,
            description: 'Mô tả bài học mới',
            level: selectedLevel,
            order: newOrder,
            estimatedDuration: 60,
            isPremium: false,
            viewCount: 0,
            completionCount: 0,
        };

        setFilteredLessons(prev => [...prev, newLesson].sort((a, b) => a.order - b.order));
    };

    const handleEditLesson = (lessonId: number): void => {
        const lesson = filteredLessons.find(l => l.id === lessonId);
        setEditingLesson(lesson || null);
        setIsAdding(false);
        setIsModalOpen(true);
    };

    const handleSaveLesson = (
    formData: Omit<Lesson, 'id' | 'viewCount' | 'completionCount'>
    ): void => {
        if (isAdding) {
            const newLesson: Lesson = {
                id: Date.now(),
                ...formData,
                level: selectedLevel,
                estimatedDuration: 60,
                viewCount: 0,
                completionCount: 0
            };
            setFilteredLessons(prev => [...prev, newLesson]);
        } else if (editingLesson) {
            setFilteredLessons(prev => 
                prev.map(l => l.id === editingLesson.id ? { ...l, ...formData } : l)
            );
        }
        setIsModalOpen(false);
    };

    const handleCloseModal = (): void => {
        setIsModalOpen(false);
        setEditingLesson(null);
        setIsAdding(false);
    };

    const handleDeleteLesson = (lessonId: number): void => {
        Alert.alert(
            'Xác nhận xóa',
            'Bạn có chắc chắn muốn xóa bài học này?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    onPress: () => {
                        setFilteredLessons(prev => prev.filter(l => l.id !== lessonId));
                        setSelectedLessons(prev => {
                            const newSelected = new Set(prev);
                            newSelected.delete(lessonId);
                            return newSelected;
                        });
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

        // Nếu có bài học được chọn → hiện popup xác nhận xóa
        Alert.alert(
            'Xác nhận xóa',
            `Bạn có chắc chắn muốn xóa ${selectedLessons.size} bài học?`,
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xóa',
                    onPress: () => {
                        setFilteredLessons(prev => prev.filter(l => !selectedLessons.has(l.id)));
                        setSelectedLessons(new Set());
                        setIsSelectAll(false);
                    }
                }
            ]
        );
    };

    const handleViewDetails = (lessonId: number): void => {
        navigation.navigate('LessonDetail', { lessonId });
    };

    const handleSelectLesson = (lessonId: number): void => {
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
            const allIds = new Set(filteredLessons.map(lesson => lesson.id));
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

    interface StatCardProps {
        value: string | number;
        label: string;
        color: string;
    }

    const StatCard: React.FC<StatCardProps> = ({ value, label, color }) => (
        <View style={[styles.statCard, { backgroundColor: color }]}>
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );

    const getLevelColor = (level: string): string => {
        if (level.includes('Sơ cấp')) return palette.success;
        if (level.includes('Trung cấp')) return palette.warning;
        return palette.error;
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>BÀI HỌC - {selectedLevel}</Text>
                    <Text style={styles.subtitle}>
                        {filteredLessons.length} bài học
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

                    <Button
                        title="Xóa hàng loạt"
                        variant="danger"
                        size="small"
                        leftIcon={<HugeiconsIcon icon={Delete02Icon} size={16} color={palette.white} />}
                        onPress={handleBulkDelete}
                    />
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
                {filteredLessons.length > 0 ? (
                    filteredLessons.map((lesson) => {
                        const isSelected = selectedLessons.has(lesson.id);
                        const levelColor = getLevelColor(lesson.level);
                        
                        return (
                            <View
                                key={lesson.id}
                                style={[
                                    styles.tableRow,
                                    isSelected && styles.tableRowSelected
                                ]}
                            >
                                <Checkbox 
                                    selected={isSelected} 
                                    onPress={() => handleSelectLesson(lesson.id)} 
                                />

                                <Text style={styles.lessonCode}>{lesson.code}</Text>

                                <View style={styles.lessonInfo}>
                                    <Text style={styles.lessonTitle}>{lesson.title}</Text>
                                    <View style={styles.lessonMeta}>
                                        <View style={[styles.levelBadge, { backgroundColor: levelColor + '20' }]}>
                                            <Text style={[styles.levelText, { color: levelColor }]}>
                                                {lesson.level}
                                            </Text>
                                        </View>
                                        {lesson.isPremium && (
                                            <View style={styles.premiumBadge}>
                                                <Text style={styles.premiumText}>Premium</Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text style={styles.lessonDescription}>{lesson.description}</Text>
                                    <Text style={styles.lessonStats}>{lesson.viewCount} lượt xem</Text>
                                </View>

                                <View style={styles.columnActions}>
                                    <TouchableOpacity
                                        onPress={() => handleViewDetails(lesson.id)}
                                        style={styles.actionBtn}
                                    >
                                        <HugeiconsIcon icon={EyeIcon} size={20} color={colors.light.primary} />
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => handleEditLesson(lesson.id)}
                                        style={styles.actionBtn}
                                    >
                                        <HugeiconsIcon icon={Edit01Icon} size={20} color={palette.warning} />
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => handleDeleteLesson(lesson.id)}
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

            {/* Statistics */}
            {filteredLessons.length > 0 && (
                <View style={styles.statistics}>
                    <View style={styles.statsGrid}>
                        <StatCard 
                            value={filteredLessons.length} 
                            label="Tổng bài học" 
                            color={palette.blue + '15'} 
                        />
                        <StatCard 
                            value={filteredLessons.filter(lesson => !lesson.isPremium).length} 
                            label="Bài miễn phí" 
                            color={palette.success + '15'} 
                        />
                        <StatCard 
                            value={filteredLessons.filter(lesson => lesson.isPremium).length} 
                            label="Bài Premium" 
                            color={palette.purple + '15'} 
                        />
                        <StatCard 
                            value={`${Math.round(
                                filteredLessons.reduce((acc, lesson) => acc + lesson.completionCount, 0) / 
                                Math.max(filteredLessons.reduce((acc, lesson) => acc + lesson.viewCount, 0), 1) * 100
                            )}%`} 
                            label="Tỷ lệ hoàn thành" 
                            color={palette.orange + '15'} 
                        />
                    </View>
                </View>
            )}

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
        fontSize: typography.fontSizes.sm,
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
        flex: 3,
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
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    levelText: {
        fontSize: typography.fontSizes.xs,
        fontFamily: typography.fonts.semiBold,
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
    lessonStats: {
        fontSize: typography.fontSizes.xs,
        color: colors.light.textSecondary,
        fontFamily: typography.fonts.regular,
    },
    columnActions: {
        flexDirection: 'column',
        gap: 4,
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
    statistics: {
        marginTop: 24,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: colors.light.border,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 12,
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
    },
    statValue: {
        fontSize: typography.fontSizes.lg,
        fontFamily: typography.fonts.bold,
        color: colors.light.text,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: typography.fontSizes.xs,
        fontFamily: typography.fonts.regular,
        color: colors.light.textSecondary,
        textAlign: 'center',
    },
});

export default TeacherLessonTable;