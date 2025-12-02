import { useState } from 'react';

export interface WordInfo {
  korean: string;
  phonetic: string;
  meaning: string;
  topik: string;
  category: string;
}

interface UseWordPopupReturn {
  selectedWord: string;
  wordInfo: WordInfo | null;
  popupVisible: boolean;
  popupPosition: { x: number; y: number };
  handleWordPress: (word: string, position: { x: number; y: number }) => void;
  closePopup: () => void;
}

export const useWordPopup = (): UseWordPopupReturn => {
  const [selectedWord, setSelectedWord] = useState<string>('');
  const [popupVisible, setPopupVisible] = useState<boolean>(false);
  const [popupPosition, setPopupPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Mock database for Korean words
  const getWordInfo = (word: string): WordInfo | null => {
    const wordDatabase: Record<string, WordInfo> = {
      '미식': {
        korean: '미식',
        phonetic: '/misik/',
        meaning: 'Ẩm thực, món ăn ngon',
        topik: 'TOPIK II',
        category: 'danh từ'
      },
      '나라': {
        korean: '나라',
        phonetic: '/nara/',
        meaning: 'Đất nước, quốc gia',
        topik: 'TOPIK I',
        category: 'danh từ'
      },
      '프랑스': {
        korean: '프랑스',
        phonetic: '/peurangseu/',
        meaning: 'Pháp (quốc gia)',
        topik: 'TOPIK I',
        category: 'danh từ riêng'
      },
      '매력적인': {
        korean: '매력적인',
        phonetic: '/maeryeokjeogin/',
        meaning: 'Quyến rũ, hấp dẫn',
        topik: 'TOPIK II',
        category: 'tính từ'
      },
      '학생': {
        korean: '학생',
        phonetic: '/haksaeng/',
        meaning: 'Học sinh, sinh viên',
        topik: 'TOPIK I',
        category: 'danh từ'
      },
      '선생님': {
        korean: '선생님',
        phonetic: '/seonsaengnim/',
        meaning: 'Thầy giáo, cô giáo (kính ngữ)',
        topik: 'TOPIK I',
        category: 'danh từ'
      },
      '공부하다': {
        korean: '공부하다',
        phonetic: '/gongbuhada/',
        meaning: 'Học bài, học tập',
        topik: 'TOPIK I',
        category: 'động từ'
      },
      '어렵다': {
        korean: '어렵다',
        phonetic: '/eoryeopda/',
        meaning: 'Khó khăn, khó',
        topik: 'TOPIK I',
        category: 'tính từ'
      },
      '쉽다': {
        korean: '쉽다',
        phonetic: '/swipda/',
        meaning: 'Dễ dàng, dễ',
        topik: 'TOPIK I',
        category: 'tính từ'
      },
      '재미있다': {
        korean: '재미있다',
        phonetic: '/jaemiitda/',
        meaning: 'Thú vị, vui',
        topik: 'TOPIK I',
        category: 'tính từ'
      }
    };

    return wordDatabase[word] || {
      korean: word,
      phonetic: `/${word}/`,
      meaning: 'Tra cứu từ điển',
      topik: 'TOPIK',
      category: 'từ'
    };
  };

  const wordInfo = selectedWord ? getWordInfo(selectedWord) : null;

  const handleWordPress = (word: string, position: { x: number; y: number }) => {
    setSelectedWord(word);
    setPopupPosition(position);
    setPopupVisible(true);
  };

  const closePopup = () => {
    setPopupVisible(false);
    setSelectedWord('');
  };

  return {
    selectedWord,
    wordInfo,
    popupVisible,
    popupPosition,
    handleWordPress,
    closePopup,
  };
};