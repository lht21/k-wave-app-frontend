// src/components/LessonDetailTab/ListeningTab.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { colors, palette } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Listening } from '../../services/listeningService'; 

interface ListeningTabProps {
  listenings?: Listening[];
  loading?: boolean;
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  onAddListening?: () => void;
  onEditListening?: (listening: Listening) => void;
  onDeleteListening?: (listeningId: string) => void;
}

const ListeningTab: React.FC<ListeningTabProps> = ({
  listenings = [],
  loading = false,
  searchTerm = '',
  onSearchChange = () => {},
  onAddListening = () => {},
  onEditListening = () => {},
  onDeleteListening = () => {},
}) => {
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // Audio State (Giữ tại local vì nó liên quan trực tiếp đến tương tác UI của Tab này)
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playingListeningId, setPlayingListeningId] = useState<string | null>(null);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // 1. Logic lọc local (Tương tự GrammarTab)
  const filteredListenings = useMemo(() => {
    return listenings.filter(item => 
      item.title.toLowerCase().includes(localSearchTerm.toLowerCase()) ||
      item.transcript.toLowerCase().includes(localSearchTerm.toLowerCase())
    );
  }, [listenings, localSearchTerm]);

  // 2. Xử lý Debounce search
  const handleSearchChange = useCallback((text: string) => {
    setLocalSearchTerm(text);
    if (debounceTimer) clearTimeout(debounceTimer);
    
    const timer = setTimeout(() => {
      onSearchChange(text);
    }, 500);
    setDebounceTimer(timer);
  }, [debounceTimer, onSearchChange]);

  // Giải phóng bộ nhớ Audio khi unmount
  useEffect(() => {
    return () => {
      if (sound) sound.unloadAsync();
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, [sound, debounceTimer]);

  // Helper functions cho Audio (Giữ nguyên logic của bạn)
  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis || 0);
      setIsPlaying(status.isPlaying);
      if (status.didJustFinish) {
        setPlayingListeningId(null);
        setIsPlaying(false);
      }
    }
  };

  const handlePlayAudio = async (item: Listening) => {
    if (!item.audioUrl || !item._id) return Alert.alert('Thông báo', 'Không có file âm thanh');
    try {
      if (playingListeningId === item._id && sound) {
        isPlaying ? await sound.pauseAsync() : await sound.playAsync();
        return;
      }
      if (sound) await sound.unloadAsync();
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: item.audioUrl },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );
      setSound(newSound);
      setPlayingListeningId(item._id);
    } catch (e) { Alert.alert('Lỗi', 'Không thể phát âm thanh'); }
  };

  const renderListeningCard = (item: Listening) => {
    const isActive = playingListeningId === item._id;
    return (
      <View key={item._id} style={styles.listeningCard}>
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <Text style={styles.listeningTitle}>{item.title}</Text>
            <View style={styles.levelBadge}><Text style={styles.levelText}>{item.level}</Text></View>
          </View>
          <View style={styles.actionButtons}>
            <TouchableOpacity onPress={() => onEditListening(item)} style={[styles.actionButton, styles.editButton]}>
              <HugeiconsIcon icon={Edit01Icon} size={18} color={palette.warning} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => item._id && onDeleteListening(item._id)} style={[styles.actionButton, styles.deleteButton]}>
              <HugeiconsIcon icon={Delete02Icon} size={18} color={palette.error} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Audio Player Section */}
        <View style={[styles.audioPlayer, isActive && styles.audioPlayerActive]}>
          <TouchableOpacity onPress={() => handlePlayAudio(item)}>
            <HugeiconsIcon 
              icon={(isActive && isPlaying) ? PauseCircleIcon : PlayCircle02Icon} 
              size={32} 
              color={isActive ? colors.light.primary : palette.primary} 
            />
          </TouchableOpacity>
          {isActive ? (
            <View style={styles.sliderContainer}>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={duration}
                value={position}
                onSlidingComplete={async (v) => sound && await sound.setPositionAsync(v)}
                minimumTrackTintColor={colors.light.primary}
              />
              <View style={styles.timeRow}>
                <Text style={styles.timeText}>{formatTime(position)}</Text>
                <Text style={styles.timeText}>{formatTime(duration)}</Text>
              </View>
            </View>
          ) : <Text style={styles.audioPlaceholder}>Nhấn để nghe</Text>}
        </View>

        <View style={styles.scriptBox}>
          <Text style={styles.scriptTitle}>Script:</Text>
          <Text style={styles.scriptText} numberOfLines={3}>{item.transcript}</Text>
        </View>
      </View>
    );
  };

  if (loading) return <ActivityIndicator style={{marginTop: 50}} color={colors.light.primary} />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <HugeiconsIcon icon={Search01Icon} size={20} color={colors.light.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm bài nghe..."
            value={localSearchTerm}
            onChangeText={handleSearchChange}
          />
        </View>
        <Button title="" variant="primary" onPress={onAddListening} leftIcon={<HugeiconsIcon icon={Add01Icon} size={16} color="#FFF" />} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {filteredListenings.length > 0 ? (
          filteredListenings.map(renderListeningCard)
        ) : (
          <View style={styles.emptyState}><Text>Không tìm thấy bài nghe</Text></View>
        )}
      </ScrollView>
    </View>
  );
};

// ... Styles giữ nguyên từ file cũ của bạn, tinh chỉnh layout cho gọn ...
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.light.background },
    header: { flexDirection: 'row', padding: 16, gap: 12, alignItems: 'center' },
    searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.light.card, borderRadius: 8, paddingHorizontal: 12, height: 40, borderWidth: 1, borderColor: colors.light.border },
    searchInput: { flex: 1, marginLeft: 8, fontSize: 14 },
    scrollContent: { padding: 16, gap: 16 },
    listeningCard: { backgroundColor: colors.light.card, borderRadius: 12, padding: 16, borderWidth: 1, borderColor: colors.light.border, elevation: 2 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    titleContainer: { flex: 1 },
    listeningTitle: { fontSize: 16, fontWeight: 'bold', color: colors.light.text },
    levelBadge: { backgroundColor: colors.light.primary + '20', paddingHorizontal: 6, borderRadius: 4, alignSelf: 'flex-start', marginTop: 4 },
    levelText: { fontSize: 10, color: colors.light.primary, fontWeight: 'bold' },
    actionButtons: { flexDirection: 'row', gap: 8 },
    actionButton: { padding: 6, borderRadius: 6 },
    editButton: { backgroundColor: palette.warning + '15' },
    deleteButton: { backgroundColor: palette.error + '15' },
    audioPlayer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.light.background, padding: 8, borderRadius: 8, gap: 12, marginTop: 8 },
    audioPlayerActive: { borderColor: colors.light.primary, borderWidth: 1 },
    audioPlaceholder: { color: colors.light.textSecondary, fontSize: 12 },
    sliderContainer: { flex: 1 },
    slider: { width: '100%', height: 20 },
    timeRow: { flexDirection: 'row', justifyContent: 'space-between' },
    timeText: { fontSize: 10, color: colors.light.textSecondary },
    scriptBox: { marginTop: 12, padding: 8, backgroundColor: colors.light.background, borderRadius: 4 },
    scriptTitle: { fontSize: 12, fontWeight: 'bold', marginBottom: 4 },
    scriptText: { fontSize: 12, color: colors.light.text, lineHeight: 18 },
    emptyState: { alignItems: 'center', marginTop: 40 }
});

export default ListeningTab;