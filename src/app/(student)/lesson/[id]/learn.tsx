// src/app/(student)/lesson/[id]/learn.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { vocabularyService } from '../../../../services/vocabularyService';

export default function LearnScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    const [allVocab, setAllVocab] = useState([]); // Toàn bộ từ chưa mastered
    const [currentQueue, setCurrentQueue] = useState([]); // Từ cần học trong vòng này
    const [currentIndex, setCurrentIndex] = useState(0);
    const [phase, setPhase] = useState<'QUIZ' | 'TYPING'>('QUIZ');
    
    const [userInput, setUserInput] = useState('');
    const [options, setOptions] = useState([]);
    
    // Tracking
    const [failedInitially, setFailedInitially] = useState(new Set()); // Sai lần đầu -> learning
    const [roundFailures, setRoundFailures] = useState(new Set()); // Sai vòng này -> lặp lại vòng sau
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        const res = await vocabularyService.getVocabForLearning(id as string);
        if (res.data) {
            setAllVocab(res.data);
            setCurrentQueue(res.data);
        }
        setLoading(false);
    };

    // Tạo 4 đáp án cho Quiz
    useEffect(() => {
        if (currentQueue.length > 0 && phase === 'QUIZ') {
            const current = currentQueue[currentIndex];
            const distractors = allVocab
                .filter(v => v._id !== current._id)
                .sort(() => 0.5 - Math.random())
                .slice(0, 3);
            const combined = [...distractors, current].sort(() => 0.5 - Math.random());
            setOptions(combined);
        }
    }, [currentIndex, currentQueue, phase]);

    const handleAnswer = async (selectedId: string | null, isTyping = false) => {
        const currentItem = currentQueue[currentIndex];
        let isCorrect = false;

        if (isTyping) {
            isCorrect = userInput.trim().toLowerCase() === currentItem.word.toLowerCase();
        } else {
            isCorrect = selectedId === currentItem._id;
        }

        if (!isCorrect) {
            // Nếu sai: 
            // 1. Đánh dấu là đã từng sai trong phiên này (để không cho lên mastered ngay)
            setFailedInitially(prev => new Set(prev).add(currentItem._id));
            // 2. Đánh dấu để lặp lại ở vòng sau
            setRoundFailures(prev => new Set(prev).add(currentItem._id));
            
            Alert.alert("Sai rồi!", `Đáp án đúng là: ${currentItem.word}`);
        }

        // Chuyển sang từ tiếp theo trong hàng đợi
        if (currentIndex < currentQueue.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setUserInput('');
        } else {
            // Đã đi hết hàng đợi của Phase hiện tại
            handlePhaseTransition();
        }
    };

    const handlePhaseTransition = async () => {
        if (phase === 'QUIZ') {
            // Hết Quiz -> Chuyển sang Typing cho CÙNG danh sách đó
            setPhase('TYPING');
            setCurrentIndex(0);
        } else {
            // Hết Typing -> Kết thúc một "Vòng" (Round)
            await processEndOfRound();
        }
    };

    const processEndOfRound = async () => {
        const completedIds = currentQueue.map(v => v._id);
        
        // Cập nhật Database cho những từ vừa hoàn thành trong vòng này
        for (const vocabId of completedIds) {
            const isFirstTimeFail = failedInitially.has(vocabId);
            const status = isFirstTimeFail ? 'learning' : 'mastered';
            await vocabularyService.updateVocabProgress(id as string, vocabId, status);
        }

        if (roundFailures.size > 0) {
            // Nếu có từ bị sai, bắt đầu vòng mới chỉ với những từ sai đó
            const nextRoundQueue = allVocab.filter(v => roundFailures.has(v._id));
            setCurrentQueue(nextRoundQueue);
            setRoundFailures(new Set()); // Reset lỗi của vòng vừa rồi
            setPhase('QUIZ');
            setCurrentIndex(0);
            Alert.alert("Tiếp tục", "Hãy ôn lại các từ bạn đã làm sai.");
        } else {
            // Hoàn thành tất cả
            Alert.alert("Chúc mừng!", "Bạn đã hoàn thành bài học này.");
            router.back();
        }
    };

    if (loading || allVocab.length === 0) return <Text>Đang tải...</Text>;

    const currentItem = currentQueue[currentIndex];

    return (
        <ScrollView contentContainerStyle={{ padding: 20 }}>
            <Text style={{ fontSize: 18, marginBottom: 20 }}>
                {phase === 'QUIZ' ? 'Chọn đáp án đúng:' : 'Gõ lại từ này:'}
            </Text>
            
            <Text style={{ fontSize: 32, fontWeight: 'bold', textAlign: 'center' }}>
                {currentItem.meaning}
            </Text>

            {phase === 'QUIZ' ? (
                <View style={{ marginTop: 30 }}>
                    {options.map((opt) => (
                        <TouchableOpacity 
                            key={opt._id} 
                            onPress={() => handleAnswer(opt._id)}
                            style={{ padding: 15, backgroundColor: '#eee', marginVertical: 5, borderRadius: 10 }}
                        >
                            <Text>{opt.word}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            ) : (
                <View style={{ marginTop: 30 }}>
                    <TextInput
                        value={userInput}
                        onChangeText={setUserInput}
                        placeholder="Nhập tiếng Hàn..."
                        style={{ borderBottomWidth: 1, fontSize: 20, padding: 10 }}
                        autoFocus
                    />
                    <TouchableOpacity 
                        onPress={() => handleAnswer(null, true)}
                        style={{ marginTop: 20, backgroundColor: 'green', padding: 15, borderRadius: 10 }}
                    >
                        <Text style={{ color: 'white', textAlign: 'center' }}>Kiểm tra</Text>
                    </TouchableOpacity>
                </View>
            )}

            <Text style={{ marginTop: 40, textAlign: 'center', color: 'gray' }}>
                Tiến độ vòng này: {currentIndex + 1} / {currentQueue.length}
            </Text>
        </ScrollView>
    );
}