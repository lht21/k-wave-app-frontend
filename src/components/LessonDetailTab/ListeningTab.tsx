// src/components/LessonDetailTab/ListeningTab.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { Audio, AVPlaybackStatus } from 'expo-av'; 
import Slider from '@react-native-community/slider'; 
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  Add01Icon,
  Edit01Icon,
  Delete02Icon,
  HeadphonesIcon,
  HelpCircleIcon,
  Clock01Icon,
  PlayCircle02Icon,
  PauseCircleIcon,
  LicenseDraftIcon,
  Search01Icon
} from '@hugeicons/core-free-icons';

import Button from '../../components/Button/Button';
import ModalListening from '../Modal/ModalListening';
import { colors, palette } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { listeningService, Listening } from '../../services/listeningService'; 

interface ListeningTabProps {
  lessonId: string; 
}

const ListeningTab: React.FC<ListeningTabProps> = ({ lessonId }) => {
  const [data, setData] = useState<Listening[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingListening, setEditingListening] = useState<Listening | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Audio State
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // --- LOGIC GỌI API ---
  const loadListenings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await listeningService.getListeningsByLesson(lessonId, {
        search: searchTerm,
        limit: 50
      });
      setData(response.listenings);
    } catch (error: any) {
      Alert.alert('Lỗi', 'Không thể tải danh sách bài nghe');
    } finally {
      setLoading(false);
    }
  }, [lessonId, searchTerm]);

  useEffect(() => {
    loadListenings();
  }, [loadListenings]);

  // Giải phóng Audio khi unmount
  useEffect(() => {
    return () => {
      if (sound) sound.unloadAsync();
    };
  }, [sound]);

  // --- AUDIO HANDLERS ---
  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis || 0);
      setIsPlaying(status.isPlaying);
      if (status.didJustFinish) {
        setPlayingId(null);
        setIsPlaying(false);
        setPosition(0);
      }
    }
  };

const handlePlayAudio = async (item: Listening) => {
  if (!item.audioUrl) return Alert.alert('Thông báo', 'Không có file âm thanh');

  try {
    // 1. Cấu hình Audio Mode
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      playThroughEarpieceAndroid: false,
    });

    // 2. Nếu đang phát chính bài này -> Toggle Play/Pause
    if (playingId === item._id && sound) {
      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        if (status.isPlaying) {
          await sound.pauseAsync();
        } else {
          await sound.playAsync();
        }
      }
      return;
    }

    // 3. Nếu chuyển sang bài khác hoặc khởi tạo lần đầu
    if (sound) {
      await sound.unloadAsync();
    }

    const { sound: newSound } = await Audio.Sound.createAsync(
      { uri: item.audioUrl },
      { shouldPlay: true },
      onPlaybackStatusUpdate
    );

    setSound(newSound);
    setPlayingId(item._id || null);

  } catch (e) { 
    console.error(e);
    Alert.alert('Lỗi', 'Không thể phát âm thanh'); 
  }
};
  const handleSeek = async (value: number) => {
    if (sound) await sound.setPositionAsync(value);
  };

  // --- CRUD HANDLERS ---
  const handleAdd = () => {
    setEditingListening(null);
    setIsAdding(true);
    setIsModalOpen(true);
  };

  const handleEdit = (item: Listening) => {
    setEditingListening(item);
    setIsAdding(false);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Xác nhận', 'Xóa bài nghe này?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Xóa', style: 'destructive', onPress: async () => {
          await listeningService.deleteListening(id);
          loadListenings();
      }}
    ]);
  };

  const handleSave = async (listeningData: Listening) => {
    try {
      if (isAdding) {
        await listeningService.createListeningForLesson(lessonId, listeningData);
      } else if (editingListening?._id) {
        await listeningService.updateListening(editingListening._id, listeningData);
      }
      loadListenings();
      setIsModalOpen(false);
    } catch (e) { Alert.alert('Lỗi', 'Không thể lưu bài nghe'); }
  };

  // --- RENDER HELPERS ---
  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const renderCard = (item: Listening) => {
    const isActive = playingId === item._id;
    return (
      <View key={item._id} style={styles.listeningCard}>
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <Text style={styles.listeningTitle}>{item.title}</Text>
            <View style={styles.levelBadge}><Text style={styles.levelText}>{item.level}</Text></View>
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity onPress={() => handleEdit(item)} style={[styles.actionButton, styles.editButton]}>
              <HugeiconsIcon icon={Edit01Icon} size={18} color={palette.warning} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => item._id && handleDelete(item._id)} style={[styles.actionButton, styles.deleteButton]}>
              <HugeiconsIcon icon={Delete02Icon} size={18} color={palette.error} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.metaInfo}>
          <View style={styles.metaItem}><HugeiconsIcon icon={HeadphonesIcon} size={14} color={colors.light.textSecondary} /><Text style={styles.metaText}>Audio</Text></View>
          <View style={styles.metaItem}><HugeiconsIcon icon={HelpCircleIcon} size={14} color={colors.light.textSecondary} /><Text style={styles.metaText}>{item.questions?.length || 0} câu</Text></View>
        </View>

        <View style={[styles.audioPlayer, isActive && styles.audioPlayerActive]}>
          <TouchableOpacity onPress={() => handlePlayAudio(item)}>
            <HugeiconsIcon icon={(isActive && isPlaying) ? PauseCircleIcon : PlayCircle02Icon} size={32} color={isActive ? colors.light.primary : palette.primary} />
          </TouchableOpacity>
          {isActive ? (
            <View style={styles.sliderContainer}>
              <Slider style={styles.slider} minimumValue={0} maximumValue={duration} value={position} onSlidingComplete={handleSeek} minimumTrackTintColor={colors.light.primary} />
              <View style={styles.timeRow}><Text style={styles.timeText}>{formatTime(position)}</Text><Text style={styles.timeText}>{formatTime(duration)}</Text></View>
            </View>
          ) : <Text style={styles.audioPlaceholder}>Nhấn để nghe bài khóa</Text>}
        </View>

        <View style={styles.scriptBox}>
          <View style={styles.scriptHeader}><HugeiconsIcon icon={LicenseDraftIcon} size={14} color={colors.light.text} /><Text style={styles.scriptTitle}>Script:</Text></View>
          <Text style={styles.scriptText}>{item.transcript}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <HugeiconsIcon icon={Search01Icon} size={20} color={colors.light.textSecondary} />
          <TextInput style={styles.searchInput} placeholder="Tìm kiếm bài nghe..." value={searchTerm} onChangeText={setSearchTerm} />
        </View>
        <Button title="Thêm" variant="primary" size="small" onPress={handleAdd} leftIcon={<HugeiconsIcon icon={Add01Icon} size={16} color="white" />} />
      </View>

      {loading ? <ActivityIndicator style={{marginTop: 20}} color={colors.light.primary} /> : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {data.length > 0 ? data.map(renderCard) : <View style={styles.emptyState}><Text>Chưa có bài nghe nào</Text></View>}
        </ScrollView>
      )}

      <ModalListening isVisible={isModalOpen} onClose={() => setIsModalOpen(false)} listening={editingListening} onSave={handleSave} isAdding={isAdding} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.light.background },
  header: { flexDirection: 'row', padding: 16, gap: 12, alignItems: 'center' },
  searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.light.card, borderRadius: 24, paddingHorizontal: 12, height: 40, borderWidth: 1, borderColor: colors.light.border },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: colors.light.text },
  scrollContent: { padding: 16, gap: 16 },
  listeningCard: { backgroundColor: 'white', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.light.border, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  titleContainer: { flex: 1 },
  listeningTitle: { fontSize: 16, fontWeight: 'bold', color: colors.light.text },
  levelBadge: { backgroundColor: colors.light.primary + '20', paddingHorizontal: 6, borderRadius: 4, alignSelf: 'flex-start', marginTop: 4 },
  levelText: { fontSize: 10, color: colors.light.primary, fontWeight: 'bold' },
  actionButtons: { flexDirection: 'row', gap: 8 },
  actionButton: { padding: 6, borderRadius: 6 },
  editButton: { backgroundColor: palette.warning + '15' },
  deleteButton: { backgroundColor: palette.error + '15' },
  metaInfo: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: colors.light.textSecondary },
  audioPlayer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.light.primary + '08', padding: 8, borderRadius: 8, gap: 12 },
  audioPlayerActive: { borderWidth: 1, borderColor: colors.light.primary, backgroundColor: 'white' },
  audioPlaceholder: { color: colors.light.textSecondary, fontSize: 12 },
  sliderContainer: { flex: 1 },
  slider: { width: '100%', height: 30 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: -5 },
  timeText: { fontSize: 10, color: colors.light.textSecondary },
  scriptBox: { marginTop: 12, padding: 12, backgroundColor: colors.light.background, borderRadius: 8 },
  scriptHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  scriptTitle: { fontSize: 12, fontWeight: 'bold' },
  scriptText: { fontSize: 13, color: colors.light.text, lineHeight: 20 },
  emptyState: { alignItems: 'center', marginTop: 40 }
});

export default ListeningTab;