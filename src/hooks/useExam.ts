import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { examService, ExamType, Exam, CreateExamData, AddQuestionData, UpdateQuestionData } from '../services/examService';

export const useExam = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lấy danh sách đề thi
  const fetchExams = useCallback(async (type: ExamType): Promise<Exam[]> => {
    setLoading(true);
    setError(null);
    try {
      const exams = await examService.getExamsByType(type);
      return exams;
    } catch (err: any) {
      const errorMsg = err.message || 'Lỗi khi tải danh sách đề thi';
      setError(errorMsg);
      console.error('Error fetching exams:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Lấy chi tiết đề thi
  const fetchExamDetail = useCallback(async (id: string): Promise<Exam> => {
    setLoading(true);
    setError(null);
    try {
      const exam = await examService.getExamById(id);
      return exam;
    } catch (err: any) {
      const errorMsg = err.message || 'Lỗi khi tải chi tiết đề thi';
      setError(errorMsg);
      console.error('Error fetching exam detail:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Tạo đề thi mới
  const createExam = useCallback(async (examData: CreateExamData): Promise<Exam> => {
    setLoading(true);
    setError(null);
    try {
      const exam = await examService.createExam(examData);
      Alert.alert('Thành công', 'Đã tạo đề thi mới');
      return exam;
    } catch (err: any) {
      const errorMsg = err.message || 'Lỗi khi tạo đề thi';
      setError(errorMsg);
      Alert.alert('Lỗi', errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Tạo đề thi mặc định
  const createDefaultExam = useCallback(async (type: ExamType, currentExams: Exam[]): Promise<Exam> => {
    setLoading(true);
    setError(null);
    try {
      const nextNumber = examService.findNextExamNumber(currentExams);
      const examData = examService.createDefaultExam(type, nextNumber);
      const exam = await examService.createExam(examData);
      Alert.alert('Thành công', `Đã tạo đề số ${nextNumber} cho ${type}`);
      return exam;
    } catch (err: any) {
      const errorMsg = err.message || 'Lỗi khi tạo đề thi';
      setError(errorMsg);
      Alert.alert('Lỗi', errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Xóa đề thi
  const deleteExam = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await examService.deleteExam(id);
      Alert.alert('Thành công', 'Đã xóa đề thi');
    } catch (err: any) {
      const errorMsg = err.message || 'Lỗi khi xóa đề thi';
      setError(errorMsg);
      Alert.alert('Lỗi', errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Toggle premium
  const togglePremium = useCallback(async (id: string): Promise<Exam> => {
    setLoading(true);
    setError(null);
    try {
      const exam = await examService.togglePremium(id);
      Alert.alert('Thành công', 'Đã cập nhật trạng thái premium');
      return exam;
    } catch (err: any) {
      const errorMsg = err.message || 'Lỗi khi cập nhật premium';
      setError(errorMsg);
      Alert.alert('Lỗi', errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Thêm câu hỏi
  const addQuestion = useCallback(async (
    examId: string,
    questionData: AddQuestionData
  ): Promise<Exam> => {
    setLoading(true);
    setError(null);
    try {
      const exam = await examService.addQuestion(examId, questionData);
      Alert.alert('Thành công', 'Đã thêm câu hỏi');
      return exam;
    } catch (err: any) {
      const errorMsg = err.message || 'Lỗi khi thêm câu hỏi';
      setError(errorMsg);
      Alert.alert('Lỗi', errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cập nhật câu hỏi
  const updateQuestion = useCallback(async (
    examId: string,
    questionId: number,
    questionData: UpdateQuestionData
  ): Promise<Exam> => {
    setLoading(true);
    setError(null);
    try {
      const exam = await examService.updateQuestion(examId, questionId, questionData);
      Alert.alert('Thành công', 'Đã cập nhật câu hỏi');
      return exam;
    } catch (err: any) {
      const errorMsg = err.message || 'Lỗi khi cập nhật câu hỏi';
      setError(errorMsg);
      Alert.alert('Lỗi', errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Xóa câu hỏi
  const deleteQuestion = useCallback(async (
    examId: string,
    questionId: number
  ): Promise<Exam> => {
    setLoading(true);
    setError(null);
    try {
      const exam = await examService.deleteQuestion(examId, questionId);
      Alert.alert('Thành công', 'Đã xóa câu hỏi');
      return exam;
    } catch (err: any) {
      const errorMsg = err.message || 'Lỗi khi xóa câu hỏi';
      setError(errorMsg);
      Alert.alert('Lỗi', errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Upload audio
  const uploadAudio = useCallback(async (formData: FormData): Promise<string> => {
    setLoading(true);
    setError(null);
    try {
      const result = await examService.uploadAudio(formData);
      return result.url;
    } catch (err: any) {
      const errorMsg = err.message || 'Lỗi khi upload audio';
      setError(errorMsg);
      Alert.alert('Lỗi', errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    fetchExams,
    fetchExamDetail,
    createExam,
    createDefaultExam,
    deleteExam,
    togglePremium,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    uploadAudio,
  };
};