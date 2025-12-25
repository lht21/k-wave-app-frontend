import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  Add01Icon,
  Mic02Icon,
  Clock01Icon,
  Search01Icon,
  ClipboardIcon,
  BookOpen01Icon,
} from '@hugeicons/core-free-icons';

import Button from '../../components/Button/Button';
import ModalSpeaking, { SpeakingLesson } from '../Modal/ModalSpeaking';
import SpeakingPractice from './SpeakingPractice';
import SpeakingEvaluation from './SpeakingEvaluation';
import { colors, palette } from '../../theme/colors';
import { typography } from '../../theme/typography';
import {
  speakingService,
  Speaking,
  SpeakingSubmission,
} from '../../services/speakingService';

interface SpeakingTabProps {
  lessonId: string;
}

const SpeakingTab: React.FC<SpeakingTabProps> = ({ lessonId }) => {
  const [activeTab, setActiveTab] = useState<'lessons' | 'evaluations'>('lessons');

  const [lessons, setLessons] = useState<Speaking[]>([]);
  const [submissions, setSubmissions] = useState<SpeakingSubmission[]>([]);

  const [loadingLessons, setLoadingLessons] = useState(false);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Speaking | null>(null);

  const [currentView, setCurrentView] = useState<'list' | 'practice' | 'evaluation'>('list');
  const [selectedLesson, setSelectedLesson] = useState<Speaking | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<SpeakingSubmission | null>(null);

  /* ================= LOAD LESSONS ================= */
  const loadLessons = useCallback(async () => {
    if (!lessonId) return;
    try {
      setLoadingLessons(true);
      const res = await speakingService.getSpeakingByLesson(lessonId);
      setLessons(Array.isArray(res) ? res : []);
    } catch (e: any) {
      Alert.alert('Lỗi', e.message || 'Không thể tải bài nói');
    } finally {
      setLoadingLessons(false);
    }
  }, [lessonId]);

  /* ================= LOAD SUBMISSIONS ================= */
  const loadSubmissions = useCallback(async () => {
    if (!lessonId) return;
    try {
      setLoadingSubmissions(true);
      const res = await speakingService.getSubmissionsByLesson(lessonId, { limit: 50 });
      setSubmissions(res?.submissions || []);
    } catch {
      Alert.alert('Lỗi', 'Không thể tải bài nộp');
    } finally {
      setLoadingSubmissions(false);
    }
  }, [lessonId]);

  /* ================= EFFECT ================= */
  useEffect(() => {
    if (activeTab === 'lessons') loadLessons();
    else loadSubmissions();
  }, [activeTab, loadLessons, loadSubmissions]);

  /* ================= FILTER ================= */
  const filteredLessons = lessons.filter(l =>
    l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.level.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /* ================= NAV ================= */
  const goBack = () => {
    setCurrentView('list');
    setSelectedLesson(null);
    setSelectedSubmission(null);
  };

  if (currentView === 'practice' && selectedLesson) {
    return (
      <SpeakingPractice
        lesson={convertToSpeakingLesson(selectedLesson)}
        onBack={goBack}
      />
    );
  }

  if (currentView === 'evaluation' && selectedSubmission) {
    return (
      <SpeakingEvaluation
        submission={selectedSubmission}
        lessonId={lessonId}
        onBack={goBack}
      />
    );
  }

  /* ================= RENDER ================= */
  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.tabContainer}>
          <TabButton
            active={activeTab === 'lessons'}
            icon={BookOpen01Icon}
            text="Bài học"
            onPress={() => setActiveTab('lessons')}
          />
          <TabButton
            active={activeTab === 'evaluations'}
            icon={ClipboardIcon}
            text="Chấm điểm"
            onPress={() => setActiveTab('evaluations')}
          />
        </View>

        {activeTab === 'lessons' && (
          <Button
            title="Thêm"
            size="small"
            onPress={() => {
              setIsAdding(true);
              setEditingLesson(null);
              setIsModalOpen(true);
            }}
          />
        )}
      </View>

      {/* SEARCH */}
      <View style={styles.searchBar}>
        <HugeiconsIcon icon={Search01Icon} size={18} color={colors.light.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm..."
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

      {/* LOADING */}
      {(loadingLessons || loadingSubmissions) && (
        <ActivityIndicator size="large" style={{ marginTop: 20 }} />
      )}

      {/* CONTENT */}
      <ScrollView style={styles.scrollContent}>
        {activeTab === 'lessons' ? (
          filteredLessons.length === 0 ? (
            <Empty text="Chưa có bài nói nào" />
          ) : (
            filteredLessons.map(lesson => (
              <LessonCard
                key={lesson._id}
                lesson={lesson}
                onPractice={() => {
                  setSelectedLesson(lesson);
                  setCurrentView('practice');
                }}
              />
            ))
          )
        ) : (
          submissions.length === 0 ? (
            <Empty text="Chưa có bài nộp" />
          ) : (
            submissions.map(sub => (
              <SubmissionCard
                key={sub._id}
                submission={sub}
                onEvaluate={() => {
                  setSelectedSubmission(sub);
                  setCurrentView('evaluation');
                }}
              />
            ))
          )
        )}
      </ScrollView>

      <ModalSpeaking
        isVisible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        speaking={editingLesson ? convertToModalSpeaking(editingLesson) : null}
        onSave={() => {}}
        isAdding={isAdding}
      />
    </View>
  );
};

/* ================= SUB COMPONENTS ================= */

const TabButton = ({ active, icon, text, onPress }: any) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.tabBtn, active && styles.activeTab]}
  >
    <HugeiconsIcon icon={icon} size={18} color={active ? colors.light.primary : colors.light.textSecondary} />
    <Text style={[styles.tabText, active && styles.activeTabText]}>{text}</Text>
  </TouchableOpacity>
);

const Empty = ({ text }: { text: string }) => (
  <View style={styles.emptyState}>
    <Text style={styles.emptyText}>{text}</Text>
  </View>
);

const StatusBadge = ({ status }: { status: SpeakingSubmission['status'] }) => {
  const map = {
    submitted: {
      text: 'Chờ chấm',
      bg: palette.orange + '20',
      color: palette.orange,
    },
    resubmitted: {
      text: 'Nộp lại',
      bg: palette.purple + '20',
      color: palette.purple,
    },
    evaluated: {
      text: 'Đã chấm',
      bg: colors.light.primary + '20',
      color: colors.light.primary,
    },
    returned: {
      text: 'Đã trả',
      bg: palette.gray500 + '20',
      color: palette.gray500,
    },
  };

  const cfg = map[status || 'submitted'];

  return (
    <View style={[styles.statusBadge, { backgroundColor: cfg.bg }]}>
      <Text style={[styles.statusText, { color: cfg.color }]}>
        {cfg.text}
      </Text>
    </View>
  );
};

const LessonCard = ({ lesson, onPractice }: { lesson: Speaking; onPractice: () => void }) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>{lesson.title}</Text>

    <View style={styles.tagRow}>
      <View style={[styles.tag, { backgroundColor: colors.light.primary + '20' }]}>
        <Text style={[styles.tagText, { color: colors.light.primary }]}>{lesson.level}</Text>
      </View>
      <View style={[styles.tag, { backgroundColor: palette.purple + '20' }]}>
        <Text style={[styles.tagText, { color: palette.purple }]}>{lesson.type}</Text>
      </View>
    </View>

    <View style={styles.infoRow}>
      <HugeiconsIcon icon={Clock01Icon} size={14} />
      <Text style={styles.infoText}>{lesson.duration || 60}s</Text>
    </View>

    <Text style={styles.prompt} numberOfLines={2}>{lesson.prompt}</Text>

    <Button
      title="Luyện nói"
      size="small"
      onPress={onPractice}
      leftIcon={<HugeiconsIcon icon={Mic02Icon} size={16} color="white" />}
    />
  </View>
);

const SubmissionCard = ({ submission, onEvaluate }: { submission: SpeakingSubmission; onEvaluate: () => void }) => {
  const status = submission.status || 'submitted';

  const getButtonText = () => {
    if (status === 'evaluated') return 'Xem / sửa điểm';
    if (status === 'returned') return 'Chấm lại';
    return 'Chấm điểm';
  };

  return (
    <View style={styles.card}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={styles.cardTitle}>
          {submission.student?.name} – {submission.speaking?.title}
        </Text>

        <StatusBadge status={status} />
      </View>

      <Text style={styles.infoText}>
        Thời lượng: {submission.recordingDuration}s
      </Text>

      <Button
        title={getButtonText()}
        size="small"
        onPress={onEvaluate}
      />
    </View>
  );
};
/* ================= HELPERS ================= */

const convertToModalSpeaking = (s: Speaking): SpeakingLesson => ({
  _id: s._id,
  title: s.title,
  type: s.type,
  prompt: s.prompt,
  instruction: s.description || '',
  targetSentence: '',
  sampleAnswer: s.sampleAnswer || '',
  sampleTranslation: '',
  level: s.level,
  duration: s.duration || 60,
  recordingLimit: s.duration || 60,
  wordHint: [],
  pronunciationHint: [],
});

const convertToSpeakingLesson = convertToModalSpeaking;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.light.background },
  header: { padding: 16, flexDirection: 'row', justifyContent: 'space-between' },
  tabContainer: { flexDirection: 'row', gap: 12 },
  tabBtn: { flexDirection: 'row', gap: 6, padding: 8, borderRadius: 16 },
  activeTab: { backgroundColor: colors.light.primary + '15' },
  tabText: { fontSize: 13, color: colors.light.textSecondary },
  activeTabText: { color: colors.light.primary, fontFamily: typography.fonts.bold },

  searchBar: { flexDirection: 'row', alignItems: 'center' ,padding: 5, margin: 6, borderRadius: 8, borderWidth: 1 , borderColor: '#fff', backgroundColor: colors.light.card},
  searchInput: { flex: 1, marginLeft: 8 },

  scrollContent: { padding: 10 },

  emptyState: { alignItems: 'center', padding: 40 },
  emptyText: { color: colors.light.textSecondary },

  card: {
    backgroundColor: colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: typography.fonts.bold,
    marginBottom: 8,
  },
  tagRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  tag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  tagText: { fontSize: 10, fontFamily: typography.fonts.bold },

  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  infoText: { fontSize: 12, color: colors.light.textSecondary },
statusBadge: {
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: 12,
},

statusText: {
  fontSize: 11,
  fontFamily: typography.fonts.bold,
},

  prompt: { fontSize: 13, marginBottom: 12 },
});

export default SpeakingTab;
