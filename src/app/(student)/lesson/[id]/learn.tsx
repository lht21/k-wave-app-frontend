import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    Alert, 
    ScrollView, 
    ActivityIndicator, 
    StyleSheet, 
    Dimensions, 
    Platform, 
    StatusBar 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { XIcon } from 'phosphor-react-native';
import { 
    lessonProgressService, 
    PopulatedVocabularyStatus 
} from '../../../../services/lessonProgressService'; 

const { width } = Dimensions.get('window');

// Bảng màu chuẩn theo thiết kế mới
const COLORS = {
    primaryGreen: '#00C853',
    textDark: '#1A1A1A',
    textGray: '#666666',
    borderGray: '#E0E0E0',
    white: '#FFFFFF',
    backgroundLight: '#F7F9FC',
};

interface VocabularyCore {
    _id: string;
    word: string;
    meaning: string;
    pronunciation?: string;
}

type LearningPhase = 'QUIZ_KR_VN' | 'TYPING_VN_KR' | 'QUIZ_VN_KR';

export default function LearnScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const lessonId = Array.isArray(id) ? id[0] : id;

    // --- Giữ nguyên toàn bộ State Logic ---
    const [fullVocabList, setFullVocabList] = useState<VocabularyCore[]>([]); 
    const [learningQueue, setLearningQueue] = useState<PopulatedVocabularyStatus[]>([]); 
    const [loading, setLoading] = useState(true);
    const [phase, setPhase] = useState<LearningPhase>('QUIZ_KR_VN');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [options, setOptions] = useState<VocabularyCore[]>([]);
    const [userInput, setUserInput] = useState('');
    const [failedInRound, setFailedInRound] = useState<Set<string>>(new Set());
    
    // --- Giữ nguyên Logic Init Data & Server Fetching ---
    useEffect(() => {
        fetchData();
    }, [lessonId]);

    const fetchData = async () => {
        try {
            if (!lessonId) return;
            const res = await lessonProgressService.getLessonProgressDetail(lessonId);
            if (res.success && res.data) {
                const allStatus = res.data.vocabularyStatus;
                const allVocabsCore: VocabularyCore[] = allStatus.map(item => ({
                    _id: item.vocabularyId._id,
                    word: item.vocabularyId.word,
                    meaning: item.vocabularyId.meaning,
                    pronunciation: item.vocabularyId.pronunciation
                }));
                setFullVocabList(allVocabsCore);
                const toLearn = allStatus.filter(item => 
                    item.status === 'unlearned' || item.status === 'learning'
                );
                if (toLearn.length === 0) {
                    Alert.alert("Hoàn thành", "Bạn đã thuộc hết từ vựng bài này!", [
                        { text: "OK", onPress: () => router.back() }
                    ]);
                } else {
                    setLearningQueue(toLearn);
                }
            }
        } catch (error) {
            Alert.alert("Lỗi", "Không thể tải dữ liệu bài học");
        } finally {
            setLoading(false);
        }
    };

    // --- Giữ nguyên Logic tạo câu hỏi & Chuyển vòng ---
    useEffect(() => {
        if (learningQueue.length === 0) return;
        setUserInput('');
        if (phase === 'QUIZ_KR_VN' || phase === 'QUIZ_VN_KR') {
            generateQuizOptions();
        }
    }, [currentIndex, phase, learningQueue]);

    const generateQuizOptions = () => {
        const currentItemCore = learningQueue[currentIndex].vocabularyId;
        const distractors = fullVocabList
            .filter(v => v._id !== currentItemCore._id)
            .sort(() => 0.5 - Math.random())
            .slice(0, 3);
        const combined = [...distractors, currentItemCore].sort(() => 0.5 - Math.random());
        setOptions(combined);
    };

    const handleAnswer = async (selectedOptionId: string | null, isTyping = false) => {
        const currentStatusItem = learningQueue[currentIndex];
        const currentVocab = currentStatusItem.vocabularyId;
        const vocabId = currentVocab._id;
        let isCorrect = false;

        if (isTyping) {
            isCorrect = userInput.trim().toLowerCase() === currentVocab.word.trim().toLowerCase();
        } else {
            isCorrect = selectedOptionId === vocabId;
        }

        if (!isCorrect) {
            setFailedInRound(prev => new Set(prev).add(vocabId));
            if (currentStatusItem.status === 'unlearned') {
                 lessonProgressService.updateVocabularyStatus(lessonId!, vocabId, 'learning');
                 currentStatusItem.status = 'learning';
            }
            Alert.alert("Sai rồi!", `Đáp án đúng: ${currentVocab.word}\nNghĩa: ${currentVocab.meaning}`, [
                { text: "Đã hiểu", onPress: () => nextStep() }
            ]);
        } else {
            nextStep();
        }
    };

    const nextStep = () => {
        if (currentIndex < learningQueue.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            transitionPhase();
        }
    };

    const transitionPhase = () => {
        if (phase === 'QUIZ_KR_VN') {
            setPhase('TYPING_VN_KR');
            setCurrentIndex(0);
            Alert.alert("Vòng 2", "Gõ lại từ tiếng Hàn tương ứng");
        } else if (phase === 'TYPING_VN_KR') {
            setPhase('QUIZ_VN_KR');
            setCurrentIndex(0);
            Alert.alert("Vòng 3", "Chọn từ tiếng Hàn đúng với nghĩa");
        } else {
            endOfRound();
        }
    };

    const endOfRound = async () => {
        setLoading(true);
        const masteredIds: string[] = [];
        const nextRoundQueue: PopulatedVocabularyStatus[] = [];
        for (const item of learningQueue) {
            const vocabId = item.vocabularyId._id;
            if (!failedInRound.has(vocabId)) masteredIds.push(vocabId);
            else nextRoundQueue.push(item);
        }
        if (masteredIds.length > 0) {
            await Promise.all(masteredIds.map(id => 
                lessonProgressService.updateVocabularyStatus(lessonId!, id, 'mastered')
            ));
        }
        if (nextRoundQueue.length === 0) {
            Alert.alert("Chúc mừng!", "Bạn đã thuộc hết các từ!", [{ text: "Về trang chủ", onPress: () => router.back() }]);
        } else {
            setLearningQueue(nextRoundQueue);
            setFailedInRound(new Set());
            setPhase('QUIZ_KR_VN');
            setCurrentIndex(0);
            setLoading(false);
        }
    };

    if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={COLORS.primaryGreen} /></View>;
    if (learningQueue.length === 0) return null;

    const currentItem = learningQueue[currentIndex].vocabularyId;

    // --- UI REDESIGN ---
    return (
        <View style={styles.container}>
            {/* Wavy Header Background đồng bộ hệ thống */}
            <View style={styles.headerBackgroundShape} />

            <SafeAreaView style={styles.safeArea}>
                {/* Top Nav: Close & Title */}
                <View style={styles.topNav}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <XIcon size={28} color={COLORS.primaryGreen} weight="bold" />
                    </TouchableOpacity>
                    <Text style={styles.phaseTitle}>
                        {phase === 'QUIZ_KR_VN' && "Vòng 1: Chọn nghĩa tiếng Việt"}
                        {phase === 'TYPING_VN_KR' && "Vòng 2: Gõ từ tiếng Hàn"}
                        {phase === 'QUIZ_VN_KR' && "Vòng 3: Chọn từ tiếng Hàn đúng"}
                    </Text>
                    <Text style={styles.progressCounter}>{currentIndex + 1}/{learningQueue.length}</Text>
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {/* Question Card: To, rõ, xanh lá đặc trưng */}
                    <View style={styles.questionSection}>
                        <Text style={styles.mainWord}>
                            {phase === 'QUIZ_KR_VN' ? currentItem.word : currentItem.meaning}
                        </Text>
                        {phase === 'QUIZ_KR_VN' && currentItem.pronunciation && (
                            <Text style={styles.pronunciation}>/{currentItem.pronunciation}/</Text>
                        )}
                    </View>

                    {/* Interaction Section */}
                    {phase === 'TYPING_VN_KR' ? (
                        <View style={styles.inputWrapper}>
                            <TextInput
                                value={userInput}
                                onChangeText={setUserInput}
                                placeholder="Nhập từ tiếng Hàn..."
                                placeholderTextColor={COLORS.textGray}
                                style={styles.textInput}
                                autoFocus={true}
                                autoCapitalize="none"
                            />
                            <TouchableOpacity 
                                style={styles.checkBtn}
                                onPress={() => handleAnswer(null, true)}
                            >
                                <Text style={styles.checkBtnText}>Kiểm tra</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.optionsWrapper}>
                            {options.map((opt) => (
                                <TouchableOpacity 
                                    key={opt._id} 
                                    style={styles.optionBtn}
                                    onPress={() => handleAnswer(opt._id)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.optionText}>
                                        {phase === 'QUIZ_KR_VN' ? opt.meaning : opt.word}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.white },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    // Header cong mờ nhẹ phía sau đồng bộ với các màn hình khác
    headerBackgroundShape: {
        position: 'absolute', top: -width * 0.6, left: -width * 0.1, right: -width * 0.1,
        height: width * 0.8, backgroundColor: COLORS.backgroundLight, borderBottomLeftRadius: width,
        borderBottomRightRadius: width, transform: [{ scaleX: 1.2 }],
    },
    safeArea: { flex: 1 },
    topNav: { 
        paddingHorizontal: 20, 
        height: 80, 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between' 
    },
    phaseTitle: { 
        fontSize: 16, 
        fontWeight: '700', 
        color: COLORS.textDark,
        flex: 1,
        textAlign: 'center',
        marginHorizontal: 10
    },
    progressCounter: { fontSize: 14, fontWeight: '600', color: COLORS.textGray },

    scrollContent: { paddingHorizontal: 25, paddingBottom: 40 },
    
    questionSection: { 
        alignItems: 'center', 
        marginTop: 40, 
        marginBottom: 50 
    },
    mainWord: { 
        fontSize: 64, 
        fontWeight: '900', 
        color: COLORS.primaryGreen, 
        textAlign: 'center' 
    },
    pronunciation: { 
        fontSize: 20, 
        color: COLORS.textGray, 
        marginTop: 10,
        fontWeight: '500' 
    },

    optionsWrapper: { gap: 15 },
    optionBtn: { 
        backgroundColor: COLORS.white, 
        paddingVertical: 18, 
        borderRadius: 20, 
        borderWidth: 2,
        borderColor: COLORS.borderGray,
        alignItems: 'flex-start',
        paddingHorizontal: 20,
        
    },
    optionText: { fontSize: 18, fontWeight: '700', color: COLORS.textDark },

    inputWrapper: { gap: 20 },
    textInput: {
        backgroundColor: COLORS.backgroundLight,
        borderRadius: 20,
        padding: 20,
        fontSize: 20,
        color: COLORS.textDark,
        textAlign: 'center',
        borderWidth: 1.5,
        borderColor: COLORS.primaryGreen
    },
    checkBtn: {
        backgroundColor: COLORS.primaryGreen,
        paddingVertical: 18,
        borderRadius: 30,
        alignItems: 'center',
    },
    checkBtnText: { color: COLORS.white, fontSize: 18, fontWeight: '800' }
});