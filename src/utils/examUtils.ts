/**
 * Format time in seconds to MM:SS format
 * @param seconds - Time in seconds
 * @returns Formatted time string (MM:SS)
 */
export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Calculate exam grade based on score
 * @param score - Score percentage (0-100)
 * @returns Grade string
 */
export const calculateGrade = (score: number): string => {
  if (score >= 90) return 'Xuất sắc';
  if (score >= 80) return 'Giỏi';
  if (score >= 70) return 'Khá';
  if (score >= 60) return 'Trung bình';
  return 'Yếu';
};

/**
 * Get grade color based on score
 * @param score - Score percentage (0-100)
 * @returns Color hex string
 */
export const getGradeColor = (score: number): string => {
  if (score >= 90) return '#059669'; // Green
  if (score >= 80) return '#0891B2'; // Blue
  if (score >= 70) return '#D97706'; // Orange
  if (score >= 60) return '#DC6803'; // Dark orange
  return '#DC2626'; // Red
};

/**
 * Format exam duration from seconds to readable format
 * @param seconds - Duration in seconds
 * @returns Formatted duration string
 */
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${remainingSeconds}s`;
};

/**
 * Calculate time spent percentage
 * @param timeSpent - Time spent in seconds
 * @param timeLimit - Time limit in seconds
 * @returns Percentage (0-100)
 */
export const calculateTimeSpentPercentage = (timeSpent: number, timeLimit: number): number => {
  return Math.min(100, Math.round((timeSpent / timeLimit) * 100));
};

/**
 * Generate exam session ID
 * @returns Unique session ID
 */
export const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Validate exam answer format
 * @param answer - Answer string (A, B, C, D)
 * @returns Boolean indicating if answer is valid
 */
export const isValidAnswer = (answer: string): boolean => {
  return /^[ABCD]$/.test(answer);
};

/**
 * Calculate completion percentage
 * @param answeredCount - Number of answered questions
 * @param totalCount - Total number of questions
 * @returns Percentage (0-100)
 */
export const calculateCompletionPercentage = (answeredCount: number, totalCount: number): number => {
  return Math.round((answeredCount / totalCount) * 100);
};

/**
 * Get completion status text
 * @param answeredCount - Number of answered questions
 * @param totalCount - Total number of questions
 * @returns Status text
 */
export const getCompletionStatus = (answeredCount: number, totalCount: number): string => {
  const percentage = calculateCompletionPercentage(answeredCount, totalCount);
  
  if (percentage === 100) return 'Hoàn thành';
  if (percentage >= 75) return 'Gần hoàn thành';
  if (percentage >= 50) return 'Đang tiến triển';
  if (percentage >= 25) return 'Mới bắt đầu';
  return 'Chưa bắt đầu';
};

/**
 * Generate random question order for shuffle mode
 * @param questionCount - Total number of questions
 * @returns Array of shuffled indices
 */
export const generateShuffledOrder = (questionCount: number): number[] => {
  const indices = Array.from({ length: questionCount }, (_, i) => i);
  
  // Fisher-Yates shuffle
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  
  return indices;
};