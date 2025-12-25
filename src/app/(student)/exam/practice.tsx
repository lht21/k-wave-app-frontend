import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  TextInput,
} from 'react-native';
import { Audio } from 'expo-av';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Clock, CheckCircle, Play, Pause, Microphone, Stop } from 'phosphor-react-native';
import { useExam } from '../../../hooks/useExam';
import { Exam, QuestionData, ListeningQuestionData, ReadingQuestionData, WritingQuestionData } from '../../../services/examService';
import { examService } from '../../../services/examService';

const { width } = Dimensions.get('window');

const COLORS = {
  primaryGreen: '#00C853',
  textDark: '#1A1A1A',
  textGray: '#666666',
  cardBg: '#F0F2F5',
  white: '#FFFFFF',
  correctGreen: '#4CAF50',
  incorrectRed: '#F44336',
  selectedBlue: '#2196F3',
};

export default function PracticeExam() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { fetchExamDetail } = useExam();
  
  // Get sectionType from params if provided (for single skill exam)
  const selectedSectionType = params.sectionType as 'listening' | 'reading' | 'writing' | undefined;
  const sectionDuration = params.sectionDuration ? parseInt(params.sectionDuration as string) : undefined;
  const isTrialMode = params.isTrialMode === 'true'; // Trial mode = no timer
  const isSingleSkillExam = !!selectedSectionType;
  
  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSection, setCurrentSection] = useState<'listening' | 'reading' | 'writing' | 'speaking'>('listening');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: number }>({});
  const [writingAnswers, setWritingAnswers] = useState<{ [key: string]: string }>({});
  const [speakingRecordings, setSpeakingRecordings] = useState<{ [key: string]: string }>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null); // Countdown timer in seconds
  const [showResults, setShowResults] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [examResults, setExamResults] = useState<{
    correctCount: number;
    totalCount: number;
    score: number;
    timeTaken: number;
  } | null>(null);
  
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    loadExam();
  }, []);

  // Initialize timer when exam loads
  useEffect(() => {
    if (exam && !loading && sectionDuration && !isTrialMode) {
      // Set countdown timer for single skill exam (not in trial mode)
      setTimeRemaining(sectionDuration * 60); // Convert minutes to seconds
    }
  }, [exam, loading, sectionDuration, isTrialMode]);

  // Countdown Timer (only when not in trial mode)
  useEffect(() => {
    if (!loading && !showResults && timeRemaining !== null && !isTrialMode) {
      if (timeRemaining <= 0) {
        // Time's up - auto submit
        handleFinish();
        return;
      }
      
      const timer = setInterval(() => {
        setTimeRemaining(prev => (prev !== null && prev > 0) ? prev - 1 : 0);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [loading, showResults, timeRemaining, isTrialMode]);

  const loadExam = async () => {
    try {
      const examId = params.examId as string;
      console.log('🔍 Loading exam with ID:', examId);
      const data = await fetchExamDetail(examId);
      console.log('✅ Exam data loaded:', {
        title: data.title,
        listeningCount: data.questions.listening?.length || 0,
        readingCount: data.questions.reading?.length || 0,
        writingCount: data.questions.writing?.length || 0,
        totalQuestions: data.totalQuestions
      });
      setExam(data);
      
      // If sectionType is specified, use only that section
      if (isSingleSkillExam && selectedSectionType) {
        if (data.questions[selectedSectionType] && data.questions[selectedSectionType].length > 0) {
          setCurrentSection(selectedSectionType);
          console.log(`📍 Single skill exam - Starting with ${selectedSectionType} section`);
        } else {
          Alert.alert('Thông báo', 'Kỹ năng này chưa có câu hỏi');
          router.back();
        }
      } else {
        // Auto-select first available section based on what teacher created
        if (data.questions.listening && data.questions.listening.length > 0) {
          setCurrentSection('listening');
          console.log('📍 Starting with Listening section');
        } else if (data.questions.reading && data.questions.reading.length > 0) {
          setCurrentSection('reading');
          console.log('📍 Starting with Reading section');
        } else if (data.questions.writing && data.questions.writing.length > 0) {
          setCurrentSection('writing');
          console.log('📍 Starting with Writing section');
        } else {
          // No questions available
          Alert.alert('Thông báo', 'Đề thi chưa có câu hỏi');
          router.back();
        }
      }
    } catch (error) {
      console.error('❌ Error loading exam:', error);
      Alert.alert('Lỗi', 'Không thể tải đề thi. Vui lòng thử lại.');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  // Get available sections based on what teacher created
  const getAvailableSections = (): Array<'listening' | 'reading' | 'writing'> => {
    if (!exam) return [];
    
    // If single skill exam, only return that section
    if (isSingleSkillExam && selectedSectionType) {
      if (exam.questions[selectedSectionType] && exam.questions[selectedSectionType].length > 0) {
        return [selectedSectionType];
      }
      return [];
    }
    
    // Otherwise return all available sections
    const sections: Array<'listening' | 'reading' | 'writing'> = [];
    
    if (exam.questions.listening && exam.questions.listening.length > 0) {
      sections.push('listening');
    }
    if (exam.questions.reading && exam.questions.reading.length > 0) {
      sections.push('reading');
    }
    if (exam.questions.writing && exam.questions.writing.length > 0) {
      sections.push('writing');
    }
    
    return sections;
  };

  // Get next available section
  const getNextSection = (): 'listening' | 'reading' | 'writing' | null => {
    const availableSections = getAvailableSections();
    const currentIndex = availableSections.indexOf(currentSection as any);
    
    if (currentIndex < availableSections.length - 1) {
      return availableSections[currentIndex + 1];
    }
    
    return null;
  };

  // Get previous available section
  const getPreviousSection = (): 'listening' | 'reading' | 'writing' | null => {
    const availableSections = getAvailableSections();
    const currentIndex = availableSections.indexOf(currentSection as any);
    
    if (currentIndex > 0) {
      return availableSections[currentIndex - 1];
    }
    
    return null;
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentQuestions = () => {
    if (!exam) return [];
    if (currentSection === 'speaking') return []; // Speaking might not have questions array
    const questions = exam.questions[currentSection as 'listening' | 'reading' | 'writing'] || [];
    console.log(`📋 Current section: ${currentSection}, questions:`, questions.length);
    return questions;
  };

  const currentQuestion = getCurrentQuestions()[currentQuestionIndex];
  
  console.log('🎯 Current question:', {
    section: currentSection,
    index: currentQuestionIndex,
    hasQuestion: !!currentQuestion,
    questionType: currentQuestion?.type,
    questionTitle: currentQuestion?.title,
    questionData: currentQuestion
  });

  // Audio player handlers
  const handlePlayAudio = async () => {
    try {
      console.log('🎵 Playing audio...');
      
      if (!currentQuestion || currentQuestion.type !== 'listening') {
        Alert.alert('Lỗi', 'Đây không phải là câu hỏi nghe');
        return;
      }

      if (!currentQuestion.audioUrl) {
        Alert.alert('Lỗi', 'Không có file audio cho câu hỏi này');
        console.log('❌ No audio URL found for question:', currentQuestion);
        return;
      }

      console.log('📁 Audio URL:', currentQuestion.audioUrl);

      // Stop current audio if playing
      if (soundRef.current) {
        console.log('⏸️ Stopping current audio...');
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      // Set audio mode
      console.log('⚙️ Setting audio mode...');
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Xử lý URL audio - kiểm tra nếu là URL đầy đủ hoặc cần thêm base URL
      let audioUri = currentQuestion.audioUrl;
      
      // Thay thế localhost bằng IP thực vì điện thoại không thể truy cập localhost
      if (audioUri.includes('localhost')) {
        audioUri = audioUri.replace('localhost', '192.168.1.9');
        console.log('🔄 Replaced localhost with IP:', audioUri);
      }
      
      // Nếu URL không bắt đầu bằng http, thêm base URL
      if (!audioUri.startsWith('http://') && !audioUri.startsWith('https://')) {
        // Nếu là đường dẫn tương đối, thêm base URL
        const baseUrl = 'http://192.168.1.9:5000'; // Lấy từ API_BASE_URL
        audioUri = audioUri.startsWith('/') ? `${baseUrl}${audioUri}` : `${baseUrl}/${audioUri}`;
      }

      console.log('🔗 Final audio URI:', audioUri);

      // Load and play audio
      console.log('📥 Loading audio...');
      const { sound, status } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );

      if (status.isLoaded) {
        soundRef.current = sound;
        setIsPlayingAudio(true);
        console.log('✅ Audio loaded and playing');
      } else {
        console.log('❌ Audio failed to load:', status);
        Alert.alert('Lỗi', 'Không thể tải file audio');
      }

    } catch (error: any) {
      console.error('❌ Error playing audio:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack
      });
      Alert.alert(
        'Lỗi phát audio', 
        `Không thể phát audio. Lỗi: ${error.message || 'Unknown error'}`
      );
      setIsPlayingAudio(false);
    }
  };

  const handleStopAudio = async () => {
    try {
      console.log('⏸️ Stopping audio...');
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      setIsPlayingAudio(false);
    } catch (error) {
      console.error('❌ Error stopping audio:', error);
      setIsPlayingAudio(false);
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    console.log('📡 Playback status update:', {
      isLoaded: status.isLoaded,
      isPlaying: status.isPlaying,
      didJustFinish: status.didJustFinish,
      error: status.error
    });
    
    if (status.isLoaded) {
      if (status.didJustFinish) {
        console.log('✅ Audio finished playing');
        setIsPlayingAudio(false);
        if (soundRef.current) {
          soundRef.current.unloadAsync();
          soundRef.current = null;
        }
      }
    } else if (status.error) {
      console.error('❌ Audio playback error:', status.error);
      setIsPlayingAudio(false);
      Alert.alert('Lỗi', `Lỗi khi phát audio: ${status.error}`);
    }
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  // Recording handlers
  const handleStartRecording = () => {
    console.log('🎤 Starting recording...');
    setIsRecording(true);
    // TODO: Implement actual recording with expo-av
  };

  const handleStopRecording = () => {
    console.log('⏹️ Stopping recording...');
    setIsRecording(false);
    const questionKey = `speaking-${currentQuestionIndex}`;
    setSpeakingRecordings(prev => ({ ...prev, [questionKey]: 'mock-recording-uri' }));
  };

  const handleAnswer = (optionIndex: number) => {
    if (currentQuestion) {
      const questionKey = `${currentSection}-${currentQuestion.id}`;
      setAnswers(prev => ({ ...prev, [questionKey]: optionIndex }));
    }
  };

  const handleNext = () => {
    const questions = getCurrentQuestions();
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Move to next available section or finish
      const nextSection = getNextSection();
      if (nextSection) {
        setCurrentSection(nextSection);
        setCurrentQuestionIndex(0);
        console.log(`➡️ Moving to next section: ${nextSection}`);
      } else {
        handleFinish();
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    } else {
      // Move to previous available section
      const prevSection = getPreviousSection();
      if (prevSection) {
        const prevQuestions = exam?.questions[prevSection] || [];
        setCurrentSection(prevSection);
        setCurrentQuestionIndex(prevQuestions.length - 1);
        console.log(`⬅️ Moving to previous section: ${prevSection}`);
      }
    }
  };

  const handleFinish = () => {
    Alert.alert(
      'Hoàn thành bài thi',
      'Bạn có chắc muốn nộp bài?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Nộp bài',
          onPress: async () => {
            await submitExamResults();
          }
        }
      ]
    );
  };

  const submitExamResults = async () => {
    if (!exam) return;

    try {
      // Stop any playing audio
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      // Calculate time spent
      const timeSpent = timeRemaining !== null && sectionDuration
        ? (sectionDuration * 60) - timeRemaining
        : 0;

      // Kiểm tra xem bài thi có câu trắc nghiệm không
      const hasMultipleChoice = (currentSection === 'listening' || currentSection === 'reading') && 
                                 Object.keys(answers).length > 0;
      const hasWriting = currentSection === 'writing' && Object.keys(writingAnswers).length > 0;
      
      // Submit to backend
      const result = await examService.submitExamResult({
        examId: exam._id,
        answers,
        writingAnswers,
        timeSpent,
        isTrialMode,
        sectionType: selectedSectionType || currentSection
      });

      console.log('✅ Exam submitted successfully:', result);

      // Hiển thị kết quả tùy theo loại bài thi
      if (hasMultipleChoice) {
        // Bài thi Nghe/Đọc: Tính và hiển thị điểm ngay
        const results = calculateDetailedResults();
        setExamResults(results);
        setShowResults(true);
      } else if (hasWriting) {
        // Bài thi Viết: Chỉ thông báo đã gửi cho giáo viên
        Alert.alert(
          '✅ Đã nộp bài thành công',
          'Bài viết của bạn đã được gửi đến giáo viên. Vui lòng chờ giáo viên chấm điểm.',
          [
            {
              text: 'Quay lại',
              onPress: () => router.back()
            }
          ]
        );
      } else {
        // Trường hợp khác
        Alert.alert(
          '✅ Đã nộp bài thành công',
          'Bài thi của bạn đã được nộp thành công.',
          [
            {
              text: 'Quay lại',
              onPress: () => router.back()
            }
          ]
        );
      }

    } catch (error) {
      console.error('❌ Error submitting exam:', error);
      Alert.alert(
        'Lỗi',
        'Không thể nộp bài. Vui lòng thử lại.',
        [
          { text: 'Thử lại', onPress: () => submitExamResults() },
          { text: 'Hủy', style: 'cancel' }
        ]
      );
    }
  };

  const calculateDetailedResults = () => {
    if (!exam) return { correctCount: 0, totalCount: 0, score: 0, timeTaken: 0 };
    
    let correctCount = 0;
    let totalCount = 0;
    
    // Chỉ tính điểm cho section hiện tại nếu là listening hoặc reading
    const sectionsToCalculate = selectedSectionType 
      ? [selectedSectionType] 
      : (currentSection === 'listening' || currentSection === 'reading') 
        ? [currentSection] 
        : ['listening', 'reading'];
    
    sectionsToCalculate.forEach((section) => {
      if (section === 'writing') return; // Không tính điểm tự động cho writing
      
      const questions = exam.questions[section as 'listening' | 'reading'];
      if (!questions) return;
      
      questions.forEach((question) => {
        if (question.type === 'listening' || question.type === 'reading') {
          // These have sub-questions
          if ('questions' in question && question.questions) {
            question.questions.forEach((subQ, idx) => {
              totalCount++;
              const questionKey = `${section}-${question.id}-${idx}`;
              const userAnswer = answers[questionKey];
              if (userAnswer === subQ.answer) {
                correctCount++;
              }
            });
          }
        }
      });
    });
    
    const score = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
    
    // Calculate time taken
    const timeTaken = timeRemaining !== null && sectionDuration
      ? (sectionDuration * 60) - timeRemaining
      : 0;
    
    console.log('📊 Results:', {
      correctCount,
      totalCount,
      score,
      timeTaken: formatTime(timeTaken)
    });
    
    return { correctCount, totalCount, score, timeTaken };
  };

  // Render results modal
  const renderResultsModal = () => {
    if (!showResults || !examResults) return null;

    return (
      <View style={styles.resultsOverlay}>
        <View style={styles.resultsModal}>
          <Text style={styles.resultsTitle}>🎉 Hoàn thành bài thi!</Text>
          
          <View style={styles.resultsContent}>
            <View style={styles.scoreCircle}>
              <Text style={styles.scoreNumber}>{examResults.score}</Text>
              <Text style={styles.scoreLabel}>Điểm</Text>
            </View>

            <View style={styles.statsContainer}>
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>✅ Câu đúng:</Text>
                <Text style={styles.statValue}>{examResults.correctCount}/{examResults.totalCount}</Text>
              </View>
              
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>❌ Câu sai:</Text>
                <Text style={styles.statValue}>{examResults.totalCount - examResults.correctCount}/{examResults.totalCount}</Text>
              </View>
              
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>⏱️ Thời gian:</Text>
                <Text style={styles.statValue}>{formatTime(examResults.timeTaken)}</Text>
              </View>
              
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>📊 Tỷ lệ đúng:</Text>
                <Text style={styles.statValue}>
                  {examResults.totalCount > 0 
                    ? Math.round((examResults.correctCount / examResults.totalCount) * 100) 
                    : 0}%
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.resultsActions}>
            <TouchableOpacity
              style={styles.resultButton}
              onPress={() => {
                setShowResults(false);
                router.back();
              }}
            >
              <Text style={styles.resultButtonText}>Quay lại</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const getTotalAnswered = () => {
    return Object.keys(answers).length + Object.keys(writingAnswers).length;
  };

  const getTotalQuestions = () => {
    if (!exam) return 0;
    
    let total = 0;
    const availableSections = getAvailableSections();
    
    availableSections.forEach(section => {
      const questions = exam.questions[section];
      if (questions) {
        questions.forEach(q => {
          if ((q.type === 'listening' || q.type === 'reading') && 'questions' in q && q.questions) {
            total += q.questions.length;
          } else if (q.type === 'writing') {
            total += 1; // Writing questions count as 1 each
          }
        });
      }
    });
    
    return total;
  };

  // Check if we're at the first question
  const isFirstQuestion = () => {
    const availableSections = getAvailableSections();
    return currentSection === availableSections[0] && currentQuestionIndex === 0;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primaryGreen} />
        <Text style={styles.loadingText}>Đang tải đề thi...</Text>
      </View>
    );
  }

  if (!exam || !currentQuestion) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Không tìm thấy câu hỏi</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Results Modal */}
      {renderResultsModal()}
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.examTitle}>{exam.title}</Text>
          <Text style={styles.sectionTitle}>
            {isSingleSkillExam ? '📌 ' : ''}
            {currentSection === 'listening' ? '🎧 Nghe' : 
             currentSection === 'reading' ? '📖 Đọc' : 
             currentSection === 'writing' ? '✍️ Viết' : '🎤 Nói'}
            {isSingleSkillExam ? ' (Riêng lẻ)' : ''}
            {isTrialMode ? ' - Thi thử' : ''}
          </Text>
        </View>
        {!isTrialMode && timeRemaining !== null && (
          <View style={styles.timerContainer}>
            <Clock size={20} color={timeRemaining < 300 ? COLORS.incorrectRed : COLORS.primaryGreen} />
            <Text style={[
              styles.timerText,
              timeRemaining < 300 && { color: COLORS.incorrectRed }
            ]}>
              {formatTime(timeRemaining)}
            </Text>
          </View>
        )}
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${(getTotalAnswered() / getTotalQuestions()) * 100}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {getTotalAnswered()}/{getTotalQuestions()} câu
        </Text>
      </View>

      {/* Question Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.questionCard}>
          <Text style={styles.questionNumber}>
            Câu {currentQuestionIndex + 1}
          </Text>
          <Text style={styles.questionTitle}>{currentQuestion.title}</Text>
          
          {/* ========== LISTENING: Audio Player + Multiple Choice ========== */}
          {currentQuestion.type === 'listening' && (
            <>
              <View style={styles.audioContainer}>
                <Text style={styles.audioLabel}>🎧 Nghe Audio</Text>
                {currentQuestion.audioUrl ? (
                  <>
                    <View style={styles.audioControls}>
                      <TouchableOpacity 
                        style={styles.audioButton}
                        onPress={isPlayingAudio ? handleStopAudio : handlePlayAudio}
                      >
                        {isPlayingAudio ? (
                          <Pause size={32} color={COLORS.white} weight="fill" />
                        ) : (
                          <Play size={32} color={COLORS.white} weight="fill" />
                        )}
                      </TouchableOpacity>
                      <Text style={styles.audioInstruction}>
                        {isPlayingAudio ? 'Đang phát...' : 'Nhấn để nghe'}
                      </Text>
                    </View>
                    {currentQuestion.transcript && (
                      <TouchableOpacity style={styles.transcriptToggle}>
                        <Text style={styles.transcriptText}>📄 Xem transcript</Text>
                      </TouchableOpacity>
                    )}
                  </>
                ) : (
                  <View style={styles.noAudioContainer}>
                    <Text style={styles.noAudioText}>⚠️ Chưa có file audio</Text>
                  </View>
                )}
              </View>
              
              {/* Listening Sub-questions */}
              {'questions' in currentQuestion && 
               currentQuestion.questions && 
               currentQuestion.questions.length > 0 && (
                <View style={styles.subQuestionsContainer}>
                  {currentQuestion.questions.map((subQ: any, idx: number) => {
                    const questionKey = `${currentSection}-${currentQuestion.id}-${idx}`;
                    const selectedAnswer = answers[questionKey];

                    return (
                      <View key={idx} style={styles.subQuestion}>
                        <Text style={styles.subQuestionText}>{subQ.question}</Text>
                        <View style={styles.optionsContainer}>
                          {subQ.options.map((option: string, optIdx: number) => (
                            <TouchableOpacity
                              key={optIdx}
                              style={[
                                styles.optionButton,
                                selectedAnswer === optIdx && styles.selectedOption
                              ]}
                              onPress={() => {
                                setAnswers(prev => ({ ...prev, [questionKey]: optIdx }));
                              }}
                            >
                              <Text style={[
                                styles.optionText,
                                selectedAnswer === optIdx && styles.selectedOptionText
                              ]}>
                                {String.fromCharCode(65 + optIdx)}. {option}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </>
          )}

          {/* ========== READING: Passage + Multiple Choice ========== */}
          {currentQuestion.type === 'reading' && currentQuestion.content && (
            <>
              <View style={styles.readingContent}>
                <Text style={styles.contentLabel}>📖 Đoạn văn</Text>
                <ScrollView style={styles.contentScrollView} nestedScrollEnabled>
                  <Text style={styles.contentText}>{currentQuestion.content}</Text>
                </ScrollView>
                {currentQuestion.translation && (
                  <TouchableOpacity style={styles.translationToggle}>
                    <Text style={styles.translationText}>🌏 Xem bản dịch</Text>
                  </TouchableOpacity>
                )}
              </View>
              
              {/* Reading Sub-questions */}
              {'questions' in currentQuestion && 
               currentQuestion.questions && 
               currentQuestion.questions.length > 0 && (
                <View style={styles.subQuestionsContainer}>
                  {currentQuestion.questions.map((subQ: any, idx: number) => {
                    const questionKey = `${currentSection}-${currentQuestion.id}-${idx}`;
                    const selectedAnswer = answers[questionKey];

                    return (
                      <View key={idx} style={styles.subQuestion}>
                        <Text style={styles.subQuestionText}>{subQ.question}</Text>
                        <View style={styles.optionsContainer}>
                          {subQ.options.map((option: string, optIdx: number) => (
                            <TouchableOpacity
                              key={optIdx}
                              style={[
                                styles.optionButton,
                                selectedAnswer === optIdx && styles.selectedOption
                              ]}
                              onPress={() => {
                                setAnswers(prev => ({ ...prev, [questionKey]: optIdx }));
                              }}
                            >
                              <Text style={[
                                styles.optionText,
                                selectedAnswer === optIdx && styles.selectedOptionText
                              ]}>
                                {String.fromCharCode(65 + optIdx)}. {option}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </>
          )}

          {/* ========== WRITING: Essay Input ========== */}
          {currentQuestion.type === 'writing' && (
            <>
              <View style={styles.writingPrompt}>
                <Text style={styles.promptLabel}>✍️ Đề bài</Text>
                {currentQuestion.prompt && (
                  <Text style={styles.promptText}>{currentQuestion.prompt}</Text>
                )}
                {currentQuestion.instruction && (
                  <Text style={styles.instructionText}>
                    💡 Hướng dẫn: {currentQuestion.instruction}
                  </Text>
                )}
                {currentQuestion.minWords && (
                  <Text style={styles.wordCountHint}>
                    📝 Tối thiểu: {currentQuestion.minWords} từ
                  </Text>
                )}
              </View>
              
              <View style={styles.writingInputContainer}>
                <Text style={styles.inputLabel}>Câu trả lời của bạn:</Text>
                <TextInput
                  style={styles.writingInput}
                  multiline
                  numberOfLines={10}
                  placeholder="Nhập câu trả lời của bạn..."
                  placeholderTextColor={COLORS.textGray}
                  value={writingAnswers[`writing-${currentQuestion.id}`] || ''}
                  onChangeText={(text) => {
                    const questionKey = `writing-${currentQuestion.id}`;
                    setWritingAnswers(prev => ({ ...prev, [questionKey]: text }));
                  }}
                  textAlignVertical="top"
                />
                <Text style={styles.wordCount}>
                  Số từ: {(writingAnswers[`writing-${currentQuestion.id}`] || '').split(/\s+/).filter(w => w).length}
                </Text>
              </View>

              {currentQuestion.wordHint && currentQuestion.wordHint.length > 0 && (
                <View style={styles.hintsContainer}>
                  <Text style={styles.hintsLabel}>💭 Từ gợi ý:</Text>
                  <View style={styles.hintsChips}>
                    {currentQuestion.wordHint.map((word, idx) => (
                      <View key={idx} style={styles.hintChip}>
                        <Text style={styles.hintText}>{word}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* Navigation Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.navButton, isFirstQuestion() && styles.disabledButton]}
          onPress={handlePrevious}
          disabled={isFirstQuestion()}
        >
          <Text style={styles.navButtonText}>← Trước</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.finishButton]}
          onPress={handleFinish}
        >
          <CheckCircle size={20} color={COLORS.white} weight="fill" />
          <Text style={styles.finishButtonText}>Nộp bài</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={handleNext}
        >
          <Text style={styles.navButtonText}>Tiếp →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textGray,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: COLORS.textGray,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBg,
  },
  backButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    marginHorizontal: 15,
  },
  examTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  sectionTitle: {
    fontSize: 12,
    color: COLORS.textGray,
    marginTop: 2,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timerText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primaryGreen,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: COLORS.cardBg,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.white,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primaryGreen,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.textGray,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  questionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primaryGreen,
    marginBottom: 8,
  },
  questionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 20,
  },
  audioContainer: {
    backgroundColor: COLORS.cardBg,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  audioLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 16,
  },
  audioControls: {
    alignItems: 'center',
    gap: 12,
  },
  audioButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primaryGreen,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  audioInstruction: {
    fontSize: 14,
    color: COLORS.textGray,
  },
  noAudioContainer: {
    padding: 16,
    backgroundColor: COLORS.cardBg,
    borderRadius: 8,
    alignItems: 'center',
  },
  noAudioText: {
    fontSize: 14,
    color: COLORS.textGray,
    fontStyle: 'italic',
  },
  transcriptToggle: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: COLORS.white,
  },
  transcriptText: {
    fontSize: 13,
    color: COLORS.primaryGreen,
    fontWeight: '600',
  },
  readingContent: {
    backgroundColor: COLORS.cardBg,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  contentLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 12,
  },
  contentScrollView: {
    maxHeight: 300,
  },
  contentText: {
    fontSize: 15,
    lineHeight: 24,
    color: COLORS.textDark,
  },
  translationToggle: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    alignSelf: 'flex-start',
  },
  translationText: {
    fontSize: 13,
    color: COLORS.primaryGreen,
    fontWeight: '600',
  },
  writingPrompt: {
    backgroundColor: COLORS.cardBg,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  promptLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 8,
  },
  promptText: {
    fontSize: 15,
    lineHeight: 24,
    color: COLORS.textDark,
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 13,
    color: COLORS.textGray,
    fontStyle: 'italic',
    marginTop: 8,
  },
  wordCountHint: {
    fontSize: 12,
    color: COLORS.primaryGreen,
    fontWeight: '600',
    marginTop: 8,
  },
  writingInputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 8,
  },
  writingInput: {
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.cardBg,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    lineHeight: 24,
    color: COLORS.textDark,
    minHeight: 200,
  },
  wordCount: {
    fontSize: 12,
    color: COLORS.textGray,
    textAlign: 'right',
    marginTop: 8,
  },
  hintsContainer: {
    marginBottom: 20,
  },
  hintsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 8,
  },
  hintsChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  hintChip: {
    backgroundColor: COLORS.primaryGreen + '15',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.primaryGreen,
  },
  hintText: {
    fontSize: 13,
    color: COLORS.primaryGreen,
    fontWeight: '600',
  },
  subQuestionsContainer: {
    gap: 24,
  },
  subQuestion: {
    gap: 12,
  },
  subQuestionText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  optionsContainer: {
    gap: 10,
  },
  optionButton: {
    padding: 14,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.cardBg,
    backgroundColor: COLORS.white,
  },
  selectedOption: {
    borderColor: COLORS.primaryGreen,
    backgroundColor: COLORS.primaryGreen + '10',
  },
  optionText: {
    fontSize: 14,
    color: COLORS.textDark,
  },
  selectedOptionText: {
    color: COLORS.primaryGreen,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBg,
    gap: 10,
  },
  navButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: COLORS.cardBg,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  finishButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primaryGreen,
  },
  finishButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },
  resultsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: 20,
  },
  resultsModal: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 30,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textDark,
    textAlign: 'center',
    marginBottom: 24,
  },
  resultsContent: {
    alignItems: 'center',
    marginBottom: 24,
  },
  scoreCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.primaryGreen,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: COLORS.primaryGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  scoreNumber: {
    fontSize: 48,
    fontWeight: '700',
    color: COLORS.white,
  },
  scoreLabel: {
    fontSize: 16,
    color: COLORS.white,
    marginTop: 4,
  },
  statsContainer: {
    width: '100%',
    gap: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBg,
  },
  statLabel: {
    fontSize: 15,
    color: COLORS.textGray,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  resultsActions: {
    gap: 12,
  },
  resultButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primaryGreen,
    alignItems: 'center',
  },
  resultButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
  },
});