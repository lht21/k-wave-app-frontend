// file: ProcessBar.tsx (hoặc đường dẫn thực tế của bạn)
import React from "react";
import { Text, View, StyleSheet } from "react-native";
// Giả sử palette được import từ theme, nếu không bạn có thể dùng mã màu trực tiếp
import { palette } from "../../theme/colors"; 

interface ProcessBarProps {
  percent?: number;
  label?: string; // Thêm prop label
  color?: string; // Thêm prop color để tùy biến màu nếu muốn
}

export default function ProcessBar({ 
  percent = 0, 
  label = "Tiến độ", 
  color = palette.primary || '#00C853' 
}: ProcessBarProps) {
  // Đảm bảo percent không vượt quá 100
  const safePercent = Math.min(100, Math.max(0, percent));

  return (
    <View style={styles.progressContainer}>
        <View style={styles.progressLabelRow}>
            <Text style={styles.progressLabel}>{label}</Text>
            <Text style={[styles.progressPercent, { color: color }]}>{safePercent}%</Text>
        </View>
        <View style={styles.progressBarBackground}>
        <View 
            style={[
            styles.progressBarFill, 
            { 
              width: `${safePercent}%`,
              backgroundColor: color 
            } 
            ]} 
        />
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  progressContainer: {
    marginBottom: 12, // Giảm margin một chút để gọn hơn trong Grid
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 13, // Giảm font size một chút cho gọn
    fontWeight: '600',
    color: '#1A1A1A',
  },
  progressPercent: {
    fontSize: 13,
    fontWeight: '700',
  },
  progressBarBackground: {
    height: 8, 
    backgroundColor: '#E0E0E0', 
    borderRadius: 4,
    overflow: 'hidden', 
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
});