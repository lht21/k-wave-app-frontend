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
import { useRouter } from 'expo-router';
import { StackNavigationProp } from '@react-navigation/stack';



import Button from '../Button/Button';
import ModalLesson from '../Modal/ModalLesson';
import { colors, palette } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { lessonService, Lesson } from '../../services/lessonService';
import { PencilSimpleIcon, PlusCircleIcon, TrashIcon, EyeIcon, PaperPlaneTilt  } from 'phosphor-react-native';
import { blue } from 'react-native-reanimated/lib/typescript/Colors';

const UI_COLORS = {
  primaryGreen: '#08b146',
  lightMint: 'rgb(220 252 231)',
  textDark: '#1A1A1A',
  textGray: '#666666',
  cardBg: '#FFFFFF',
  borderGray: '#EEEEEE',
  danger: '#FF5252',
  warning: '#FFAB00',
  blue: '#007BFF',
};

// Types
interface TeacherLessonTableProps {
    selectedLevel: string;
}

const TeacherLessonTable: React.FC<TeacherLessonTableProps> = ({ selectedLevel = 'Sơ cấp 1' }) => {
    const router = useRouter();

    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [selectedLessons, setSelectedLessons] = useState<Set<string>>(new Set());
    const [isSelectAll, setIsSelectAll] = useState<boolean>(false);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
    const [isAdding, setIsAdding] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [selectedStatus, setSelectedStatus] = useState<
    'all' | 'draft' | 'pending' | 'approved' | 'rejected'
    >('all');

    useEffect(() => {
        loadLessons();
    }, [selectedLevel, selectedStatus]);

    // Load bài học từ API
    const loadLessons = async () => {
        try {
            setIsLoading(true);
            const params: any = {
                level: selectedLevel,
                page: 1,
                limit: 100
            };

            if (selectedStatus !== 'all') {
                params.status = selectedStatus;
            }

            const response = await lessonService.getMyLessons(params);
            setLessons(response.lessons);
        } catch (error: any) {
            console.error('Error loading lessons:', error);
            Alert.alert('Lỗi', error.message || 'Không thể tải danh sách bài học');
        } finally {
            setIsLoading(false);
        }
    };

    

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

    const getStatusLabel = (status: string) => {
    switch (status) {
        case 'draft':
            return 'Bản nháp';
        case 'pending':
            return 'Chờ duyệt';
        case 'approved':
            return 'Đã duyệt';
        case 'rejected':
            return 'Bị từ chối';
        default:
            return 'Không xác định';
    }
    };
const getStatusStyle = (status: string) => {
  switch (status) {
    case 'draft':
      return {
        backgroundColor: '#E0E0E0', // xám
        color: '#555555',
      };
    case 'pending':
      return {
        backgroundColor: '#FFF3CD', // vàng nhạt
        color: '#FF9800',
      };
    case 'approved':
      return {
        backgroundColor: '#DCFCE7', // xanh nhạt
        color: '#16A34A',
      };
    case 'rejected':
      return {
        backgroundColor: '#FEE2E2', // đỏ nhạt
        color: '#DC2626',
      };
    default:
      return {
        backgroundColor: '#E5E7EB',
        color: '#374151',
      };
  }
};

    const handleSubmitForApproval = async (lessonId: string) => {
        Alert.alert(
            'Gửi duyệt',
            'Gửi bài học này cho admin duyệt?',
            [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Gửi',
                onPress: async () => {
                try {
                    const updatedLesson = await lessonService.updateLesson(
                    lessonId,
                        { status: 'pending' }
                    );

                    setLessons(prev =>
                    prev.map(l =>
                        l._id === lessonId ? updatedLesson : l
                    )
                    );

                    Alert.alert('Thành công', 'Đã gửi bài học cho admin duyệt');
                } catch (error: any) {
                    Alert.alert('Lỗi', error.message || 'Không thể gửi duyệt');
                }
                },
            },
            ]
        );
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
        if (!lessonId) {
            Alert.alert('Lỗi', 'ID bài học không tồn tại');
            return;
        }
        router.push(`/(teacher)/lesson/${lessonId}`);
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

    // Component Thẻ bài học (Thay thế cho Table cũ)
  const LessonCard = ({ item }: { item: any }, isSelected: boolean) => (
    <View style={styles.lessonCard}>
      <View style={styles.cardTopRow}>
        <Checkbox 
            selected={isSelected} 
            onPress={() => handleSelectLesson(item._id!)} 
        />
        
        <View style={styles.cardInfo}>
          <Text style={styles.lessonTitle}>{item.title}</Text>
          <Text style={styles.lessonSub}>{item.description}</Text>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.iconBtn}  onPress={() => handleViewDetails(item._id!)}>
            <EyeIcon size={22} color={UI_COLORS.blue} />
          </TouchableOpacity>
            <TouchableOpacity
                disabled={item.status === 'approved'}
                style={[
                    styles.iconBtn,
                    item.status === 'approved' && { opacity: 0.4 }
                ]}
                onPress={() => handleEditLesson(item._id!)}
            >
                <PencilSimpleIcon size={22} color={UI_COLORS.warning} />
            </TouchableOpacity>
          
          {(item.status === 'draft' || item.status === 'rejected') && (
            <TouchableOpacity
                onPress={() => handleSubmitForApproval(item._id!)}
                style={styles.iconBtn}
            >
                <PaperPlaneTilt  size={22} color={UI_COLORS.primaryGreen} />
            </TouchableOpacity>
          )}

            <TouchableOpacity
            disabled={item.status === 'approved'}
            style={[
                styles.iconBtn,
                item.status === 'approved' && { opacity: 0.4 }
            ]}
            onPress={() => handleDeleteLesson(item._id!)}
            >
            <TrashIcon size={22} color={UI_COLORS.danger} />
            </TouchableOpacity>
        </View>
      </View>

      <View style={styles.cardBottomRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.level}</Text>
        </View>
        {item.isPremium && (
            <View style={styles.premiumBadge}>
                <Text style={styles.premiumText}>Premium</Text>
            </View>
        )}
        {(() => {
        const statusStyle = getStatusStyle(item.status);
            return (
                <View
                    style={[
                        styles.badge,
                        { backgroundColor: statusStyle.backgroundColor },
                    ]}
                >
                <Text
                    style={[
                    styles.badgeText,
                    { color: statusStyle.color },
                    ]}
                >
                    {getStatusLabel(item.status)}
                </Text>
                </View>
            );
        })()}

      </View>
    </View>
  );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>

                <View>
                    <Text style={styles.sectionTitle}>Bài học tương ứng</Text>
                    <Text style={styles.lessonCountSub}>Danh sách bài học của {selectedLevel}</Text>
                    <Text style={styles.subtitle}>
                        {lessons.length} bài học
                        {selectedLessons.size > 0 && ` • ${selectedLessons.size} đã chọn`}
                    </Text>
                </View>
                
                <View style={styles.actions}>
                    <TouchableOpacity style={styles.addBtn} activeOpacity={0.8} onPress={handleAddLesson}>
                        <PlusCircleIcon size={22} color="#FFF" weight="fill" />
                        <Text style={styles.addBtnText}>Thêm bài học</Text>
                    </TouchableOpacity>

                    {selectedLessons.size > 0 && (
                        <TouchableOpacity style={styles.deleteBtn} activeOpacity={0.8} onPress={handleBulkDelete}>
                            <TrashIcon size={22} color="#FFF" weight="fill" />
                            <Text style={styles.addBtnText}>{`Xóa (${selectedLessons.size})`}</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
            <View style={styles.tableHeader}>
                <Checkbox selected={isSelectAll} onPress={handleSelectAll} />
                <Text style={styles.subtitle}>Chọn tất cả</Text>
                
            </View>

            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
            {[
                { label: 'Tất cả', value: 'all' },
                { label: 'Nháp', value: 'draft' },
                { label: 'Chờ duyệt', value: 'pending' },
                { label: 'Đã duyệt', value: 'approved' },
                { label: 'Từ chối', value: 'rejected' },
            ].map(item => (
                <TouchableOpacity
                key={item.value}
                onPress={() => setSelectedStatus(item.value as any)}
                style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 16,
                    backgroundColor:
                    selectedStatus === item.value
                        ? UI_COLORS.primaryGreen
                        : '#EEE',
                }}
                >
                <Text
                    style={{
                    color: selectedStatus === item.value ? '#FFF' : '#333',
                    fontSize: 12,
                    fontWeight: '600',
                    }}
                >
                    {item.label}
                </Text>
                </TouchableOpacity>
            ))}
            </View>


            {/* Table Body */}
            <ScrollView style={styles.tableBody}>
                {lessons.length > 0 ? (
                    lessons.map((lesson) => {
                        const isSelected = selectedLessons.has(lesson._id!);
                        
                        return (
                            <LessonCard key={lesson._id} item={lesson} isSelected={isSelected} />
                        );
                    })
                ) : (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>
                            Không có bài học nào cho level {selectedLevel}
                        </Text>
                        <TouchableOpacity style={styles.addBtn} activeOpacity={0.8} onPress={handleAddLesson}>
                            <PlusCircleIcon size={22} color="#FFF" weight="fill" />
                            <Text style={styles.addBtnText}>Thêm bài học đầu tiên</Text>
                        </TouchableOpacity>
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
    deleteBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FF5252',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 20,
        shadowColor: '#FF5252',
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 3,
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
    // Lesson Header
  lessonHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  lessonCount: { fontSize: 12, color: UI_COLORS.textGray, fontWeight: '600', marginTop: -10 },
  
  // Lesson Cards
  listContainer: { gap: 15 },
  lessonCard: {
    backgroundColor: UI_COLORS.cardBg,
    borderRadius: 20,
    padding: 16,
    borderWidth: 2,
    borderColor: UI_COLORS.borderGray,
    
    marginBottom: 12,
  },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  placeholderImg: { width: 40, height: 40, backgroundColor: '#D9D9D9', borderRadius: 8 },
  cardInfo: { flex: 1, marginLeft: 12 },
  lessonTitle: { fontSize: 15, fontWeight: '700', color: UI_COLORS.textDark },
  lessonSub: { fontSize: 13, color: UI_COLORS.textGray, marginTop: 2 },
  
  actionButtons: { flexDirection: 'row', gap: 10 },
  iconBtn: { padding: 5 },

  cardBottomRow: { flexDirection: 'row', gap: 10 },
  badge: {
    backgroundColor: UI_COLORS.lightMint,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: UI_COLORS.primaryGreen,
    },
    lessonCountSub: {
        fontSize: 12,
        color: '#666',
        fontWeight: '600',
        marginTop: 2,
    },
  badgeText: { fontSize: 11, fontWeight: '700', color: UI_COLORS.primaryGreen },
});

export default TeacherLessonTable;