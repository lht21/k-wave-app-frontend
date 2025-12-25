import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  SafeAreaView
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { 
  Camera01Icon, 
  UserCircleIcon, 
  Mail01Icon, 
  Mortarboard02Icon, 
  StarIcon,
  CheckmarkCircle02Icon,
  Cancel01Icon,
  Edit02Icon
} from '@hugeicons/core-free-icons';

import { useAuth } from '../../../hooks/useAuth'; // Hook auth của bạn
import { userService } from '../../../services/userService';
import Button from '../../../components/Button/Button'; // Component Button của bạn
import { palette } from '../../../theme/colors'; // Màu sắc từ theme

// Component Modal đơn giản để chọn Level/Topik (Thay thế <select> của web)
const SelectionModal = ({ visible, title, options, onSelect, onClose }: any) => (
  <Modal visible={visible} transparent animationType="slide">
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>{title}</Text>
        <ScrollView>
          {options.map((item: any) => (
            <TouchableOpacity
              key={item.value}
              style={styles.modalOption}
              onPress={() => onSelect(item.value)}
            >
              <Text style={styles.modalOptionText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TouchableOpacity style={styles.modalCloseBtn} onPress={onClose}>
          <Text style={{ color: palette.gray500 }}>Đóng</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const TeacherProfileScreen = () => {
  const { user: contextUser, refreshUser } = useAuth(); // Lấy refreshUser
  
  // State quản lý UI
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // State dữ liệu form
  const [formData, setFormData] = useState({
    _id: '',
    username: '',
    fullName: '',
    email: '',
    role: '',
    level: '',
    avatar: '',
    topikAchievement: ''
  });

  // State quản lý Modal chọn
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [showTopikModal, setShowTopikModal] = useState(false);

  // Danh sách options
  const levelOptions = [
    { label: 'Sơ cấp 1', value: 'Sơ cấp 1' },
    { label: 'Sơ cấp 2', value: 'Sơ cấp 2' },
    { label: 'Trung cấp 3', value: 'Trung cấp 3' },
    { label: 'Trung cấp 4', value: 'Trung cấp 4' },
    { label: 'Cao cấp 5', value: 'Cao cấp 5' },
    { label: 'Cao cấp 6', value: 'Cao cấp 6' },
  ];

  const topikOptions = [
    { label: 'Chưa có', value: '' },
    { label: 'TOPIK 1', value: '1' },
    { label: 'TOPIK 2', value: '2' },
    { label: 'TOPIK 3', value: '3' },
    { label: 'TOPIK 4', value: '4' },
    { label: 'TOPIK 5', value: '5' },
    { label: 'TOPIK 6', value: '6' },
  ];

  // Load dữ liệu khi vào màn hình
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await userService.getProfile();
      
      setFormData({
        _id: response._id || '',
        username: response.username || '',
        fullName: response.fullName || '',
        email: response.email || '',
        role: response.role || '',
        level: response.level || 'Sơ cấp 1',
        avatar: response.avatar || '',
        topikAchievement: response.topikAchievement ? String(response.topikAchievement) : ''
      });
    } catch (error: any) {
      console.error('Lỗi tải profile:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin hồ sơ.');
      // Fallback dùng context nếu API lỗi
      if (contextUser) {
        setFormData(prev => ({ ...prev, ...contextUser }));
      }
    } finally {
      setLoading(false);
    }
  };

  // Xử lý chọn ảnh
  const handlePickAvatar = async () => {
    if (!isEditing) return;

    // Xin quyền truy cập thư viện ảnh
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Quyền truy cập', 'Cần quyền truy cập thư viện ảnh để thay đổi avatar.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      handleUploadAvatar(result.assets[0].uri);
    }
  };

  // Upload avatar ngay khi chọn
  const handleUploadAvatar = async (uri: string) => {
    try {
      setUploadingAvatar(true);
      const result = await userService.uploadAvatar(uri);
      
      // Cập nhật state ngay lập tức để hiển thị ảnh mới
      setFormData(prev => ({ ...prev, avatar: result.avatar }));
      await refreshUser(); 
      Alert.alert('Thành công', 'Đã cập nhật ảnh đại diện!');
    } catch (error: any) {
      Alert.alert('Lỗi Upload', error.message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Lưu thông tin profile
  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      
      // Chuẩn bị payload, convert topik về number hoặc null
      const payload = {
        username: formData.username,
        email: formData.email,
        fullName: formData.fullName,
        level: formData.level,
        topikAchievement: formData.topikAchievement ? Number(formData.topikAchievement) : null
      };

      await userService.updateUserProfile(payload);
      await refreshUser(); 
      
      Alert.alert('Thành công', 'Cập nhật hồ sơ thành công!');
      setIsEditing(false);
      fetchUserData(); // Refresh lại data chuẩn từ server
    } catch (error: any) {
      Alert.alert('Lỗi', error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    fetchUserData(); // Reset lại data cũ
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={palette.primary} />
        <Text style={{ marginTop: 10, color: palette.gray500 }}>Đang tải thông tin...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.screenTitle}>Hồ sơ giáo viên</Text>

        {/* Avatar Section */}
        <View style={styles.avatarContainer}>
          <TouchableOpacity onPress={handlePickAvatar} disabled={!isEditing}>
            <Image
              source={{ uri: formData.avatar || 'https://via.placeholder.com/150' }}
              style={styles.avatar}
            />
            {isEditing && (
              <View style={styles.editBadge}>
                {uploadingAvatar ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <HugeiconsIcon icon={Camera01Icon} size={20} color="#fff" />
                )}
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.roleText}>{formData.role === 'teacher' ? 'Giáo viên' : 'Học viên'}</Text>
        </View>

        {/* Form Section */}
        <View style={styles.formContainer}>
          
          {/* Username */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tên đăng nhập</Text>
            <View style={[styles.inputWrapper, isEditing ? styles.editableInput : styles.readOnlyInput]}>
              <HugeiconsIcon icon={UserCircleIcon} size={20} color={isEditing ? palette.primary : palette.gray500} />
              <TextInput
                style={styles.input}
                value={formData.username}
                editable={isEditing}
                onChangeText={(text) => setFormData({ ...formData, username: text })}
              />
            </View>
          </View>

          {/* Email  */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={[styles.inputWrapper, isEditing ? styles.editableInput : styles.readOnlyInput]}>
              <HugeiconsIcon icon={Mail01Icon} size={20} color={isEditing ? palette.primary : palette.gray500} />
              <TextInput
                style={styles.input}
                value={formData.email}
                editable={isEditing}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
              />
            </View>
          </View>

          {/* Fullname (Editable) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Họ và tên</Text>
            <View style={[styles.inputWrapper, isEditing ? styles.editableInput : styles.readOnlyInput]}>
              <HugeiconsIcon icon={UserCircleIcon} size={20} color={isEditing ? palette.primary : palette.gray500} />
              <TextInput
                style={styles.input}
                value={formData.fullName}
                editable={isEditing}
                onChangeText={(text) => setFormData({ ...formData, fullName: text })}
              />
            </View>
          </View>

          {/* Level (Selectable) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Trình độ</Text>
            <TouchableOpacity 
              style={[styles.inputWrapper, isEditing ? styles.editableInput : styles.readOnlyInput]}
              onPress={() => isEditing && setShowLevelModal(true)}
              disabled={!isEditing}
            >
              <HugeiconsIcon icon={Mortarboard02Icon} size={20} color={isEditing ? palette.primary : palette.gray500} />
              <Text style={styles.inputText}>
                {formData.level || 'Chọn trình độ'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* TOPIK (Selectable) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Thành tích TOPIK</Text>
            <TouchableOpacity 
              style={[styles.inputWrapper, isEditing ? styles.editableInput : styles.readOnlyInput]}
              onPress={() => isEditing && setShowTopikModal(true)}
              disabled={!isEditing}
            >
              <HugeiconsIcon icon={StarIcon} size={20} color={isEditing ? palette.primary : palette.gray500} />
              <Text style={styles.inputText}>
                {formData.topikAchievement ? `TOPIK ${formData.topikAchievement}` : 'Chưa có thành tích'}
              </Text>
            </TouchableOpacity>
          </View>

        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          {isEditing ? (
            <View style={styles.editActions}>
              <Button 
                title="Hủy bỏ" 
                onPress={handleCancel} 
                variant="secondary"
                leftIcon={<HugeiconsIcon icon={Cancel01Icon} size={20} color={palette.primary} />}
              />
              <Button 
                title={saving ? "Đang lưu..." : "Lưu thay đổi"} 
                onPress={handleSaveProfile} 
                variant="primary"
                disabled={saving || uploadingAvatar}
                leftIcon={<HugeiconsIcon icon={CheckmarkCircle02Icon} size={20} color="#fff" />}
              />
            </View>
          ) : (
            <Button 
              title="Chỉnh sửa hồ sơ" 
              onPress={() => setIsEditing(true)} 
              variant="primary"
              leftIcon={<HugeiconsIcon icon={Edit02Icon} size={20} color="#fff" />}
            />
          )}
        </View>

      </ScrollView>

      {/* Modals */}
      <SelectionModal 
        visible={showLevelModal}
        title="Chọn trình độ"
        options={levelOptions}
        onSelect={(val: string) => { setFormData({...formData, level: val}); setShowLevelModal(false); }}
        onClose={() => setShowLevelModal(false)}
      />

      <SelectionModal 
        visible={showTopikModal}
        title="Chọn cấp độ TOPIK"
        options={topikOptions}
        onSelect={(val: string) => { setFormData({...formData, topikAchievement: val}); setShowTopikModal(false); }}
        onClose={() => setShowTopikModal(false)}
      />

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.white,
    marginTop: 40
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: palette.gray900,
    marginBottom: 20,
    textAlign: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: palette.primary,
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: palette.primary,
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
  },
  roleText: {
    marginTop: 10,
    fontSize: 16,
    color: palette.gray500,
    fontWeight: '500',
    backgroundColor: palette.gray100,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden'
  },
  formContainer: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: palette.gray500,
    marginBottom: 8,
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
    borderWidth: 1,
  },
  readOnlyInput: {
    backgroundColor: palette.gray100,
    borderColor: palette.gray100,
  },
  editableInput: {
    backgroundColor: '#fff',
    borderColor: palette.primary,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: palette.gray900,
  },
  inputText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: palette.gray900,
  },
  actionContainer: {
    marginTop: 10,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: palette.gray900,
  },
  modalOption: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: palette.gray100,
  },
  modalOptionText: {
    fontSize: 16,
    color: palette.gray500,
    textAlign: 'center',
  },
  modalCloseBtn: {
    marginTop: 15,
    padding: 10,
    alignItems: 'center',
  },
});

export default TeacherProfileScreen;