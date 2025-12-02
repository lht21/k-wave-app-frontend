import React from 'react';
import { Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import { colors } from '../theme/colors';

interface ClickableTextProps {
  text: string;
  onWordPress: (word: string, position: { x: number; y: number }) => void;
  style?: any;
  lineHeight?: number;
}

const ClickableText: React.FC<ClickableTextProps> = ({ 
  text, 
  onWordPress, 
  style = {},
  lineHeight = 24 
}) => {
  // Split text into words (supporting Korean, English, and punctuation)
  const words = text.match(/[\u3131-\u314e\u314f-\u3163\uac00-\ud7a3]+|\w+|[^\s\w\u3131-\u314e\u314f-\u3163\uac00-\ud7a3]/g) || [];

  const handleWordPress = (word: string, index: number) => {
    // Only process Korean words or English words (ignore punctuation)
    if (/[\u3131-\u314e\u314f-\u3163\uac00-\ud7a3]/.test(word) || /\w+/.test(word)) {
      // Calculate approximate position (this is simplified, in real app you might use onLayout)
      const position = {
        x: (index % 10) * 30 + 100, // Approximate x position
        y: Math.floor(index / 10) * lineHeight + 100, // Approximate y position
      };
      onWordPress(word.trim(), position);
    }
  };

  return (
    <Text style={[styles.text, style]}>
      {words.map((word, index) => {
        const isClickable = /[\u3131-\u314e\u314f-\u3163\uac00-\ud7a3]/.test(word) || /\w+/.test(word);
        
        if (isClickable) {
          return (
            <Text key={index}>
              <Text 
                style={[styles.clickableWord, style]}
                onPress={() => handleWordPress(word, index)}
              >
                {word}
              </Text>
              {index < words.length - 1 && words[index + 1] === ' ' ? ' ' : ''}
            </Text>
          );
        } else {
          return (
            <Text key={index} style={[styles.text, style]}>
              {word}
            </Text>
          );
        }
      })}
    </Text>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.light.text,
  },
  clickableWord: {
    color: '#269a56ff',
    textDecorationLine: 'underline',
    textDecorationColor: '#269a56ff',
    textDecorationStyle: 'solid',
  },
});

export default ClickableText;