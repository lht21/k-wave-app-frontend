import { Text, View } from "react-native";
import { StyleSheet } from "react-native";
import { palette } from "../../theme/colors";

export default function ProcessBar({ percent = 0 }: { percent: number }) {
  return (
    <View style={styles.progressContainer}>
        <View style={styles.progressLabelRow}>
            <Text style={styles.progressLabel}>Tiến độ học từ vựng của bài này</Text>
            <Text style={styles.progressPercent}>{percent}%</Text>
        </View>
        <View style={styles.progressBarBackground}>
        <View 
            style={[
            styles.progressBarFill, 
            { width: `${percent}%` } // Chiều rộng động dựa trên %
            ]} 
        />
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  progressContainer: {
    marginBottom: 20, // Cách các phần khác một chút
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.black,
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '700',
    color: palette.primary,
  },
  progressBarBackground: {
    height: 10, // Độ dày thanh
    backgroundColor: '#E0E0E0', // Màu nền xám (track)
    borderRadius: 5,
    overflow: 'hidden', // Để bo tròn cả thanh màu bên trong
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: palette.primary, // Màu xanh (fill)
    borderRadius: 5,
  },
})