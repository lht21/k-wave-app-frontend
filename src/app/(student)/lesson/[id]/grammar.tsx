import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,

  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import { XIcon } from 'phosphor-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const COLORS = {
  primaryGreen: '#00C853',
  textDark: '#1A1A1A',
  textGray: '#666666',
  white: '#FFFFFF',
  cardBg: '#FFFFFF',
  borderGray: '#F0F0F0',
};

export default function GrammarDetailScreen() {
  const router = useRouter();
  // Giả định bạn truyền dữ liệu qua params, nếu không có sẽ dùng dữ liệu mặc định
  const params = useLocalSearchParams();
  const { grammarData } = useLocalSearchParams();

  const grammar = useMemo(() => {
    if (grammarData && typeof grammarData === 'string') {
      try {
        return JSON.parse(grammarData);
      } catch (e) {
        console.error("Lỗi parse grammar data:", e);
        Alert.alert("Lỗi", "Không thể đọc dữ liệu ngữ pháp");
        return null;
      }
    }
    return null;
  }, [grammarData]);

  if (!grammar) {
    return (
       <SafeAreaView style={styles.safeArea}>
         <View style={styles.headerNav}>
             <TouchableOpacity onPress={() => router.back()}><XIcon size={28} /></TouchableOpacity>
         </View>
         <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
             <Text>Không tìm thấy dữ liệu ngữ pháp.</Text>
         </View>
       </SafeAreaView>
    )
  }

  // const grammarData = {
  //   title: params.title || '-습니다/-습니까?',
  //   meaning: params.meaning || 'Là...',
  //   explanation: params.explanation || 'Đuôi câu kính ngữ dùng để định nghĩa hoặc giới thiệu chủ ngữ.',
  //   usage: params.usage || 'Dùng trong các tình huống trang trọng.',
  //   examples: [
  //     { id: '1', kr: '저는 학생입니다.', vi: 'Tôi là học sinh.' },
  //     { id: '2', kr: '이것은 책입니다.', vi: 'Đây là quyển sách.' },
  //   ],
  //   similar: params.similar || 'Không có'
  // };

  const displayData = {
    title: grammar.structure || 'Tiêu đề ngữ pháp',
    meaning: grammar.meaning || 'Nghĩa tiếng Việt',
    explanation: grammar.explanation || 'Chưa có giải thích chi tiết.',
    usage: grammar.usage || 'Chưa có thông tin cách dùng.',
    examples: grammar.exampleSentences || [], // Giả định backend trả về mảng examples
    similar: grammar.similarGrammar || []
  };

  return (
    <View style={styles.container}>
      {/* Wavy Header Background đồng bộ với hệ thống */}
      <View style={styles.headerBackgroundShape} />

      <SafeAreaView style={styles.safeArea}>
        {/* Nút đóng (X) */}
        <View style={styles.headerNav}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <XIcon size={28} color={COLORS.primaryGreen} weight="bold" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Card hiển thị cấu trúc ngữ pháp chính */}
          <View style={styles.mainCard}>
            <Text style={styles.mainGrammarTitle}>{displayData.title}</Text>
          </View>

          {/* Chi tiết nội dung */}
          <View style={styles.detailsSection}>
            
            <View style={styles.infoBlock}>
              <Text style={styles.label}>Nghĩa</Text>
              <Text style={styles.valueBold}>{displayData.meaning}</Text>
            </View>

            <View style={styles.infoBlock}>
              <Text style={styles.label}>Diễn giải</Text>
              <Text style={styles.valueNormal}>{displayData.explanation}</Text>
            </View>

            <View style={styles.infoBlock}>
              <Text style={styles.label}>Cách dùng</Text>
              <Text style={styles.valueNormal}>{displayData.usage}</Text>
            </View>

            <View style={styles.infoBlock}>
              <Text style={styles.label}>Ví dụ</Text>
              {displayData.examples.map((ex) => (
                <Text key={ex._id} style={styles.exampleText}>
                  • <Text style={styles.exampleKr}>{ex.korean}</Text> / {ex.vietnamese}
                </Text>
              ))}
            </View>

            <View style={styles.similarSection}>
              <Text style={styles.similarLabel}>Ngữ pháp tương tự:</Text>
              {displayData.similar.map((si) => (
                <Text key={si._id} style={styles.exampleText}>
                  • <Text style={styles.exampleKr}>{si.korean}</Text> / {si.vietnamese}
                </Text>
              ))}
            </View>

          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  headerBackgroundShape: {
    position: 'absolute',
    top: -width * 0.6,
    left: -width * 0.1,
    right: -width * 0.1,
    height: width * 0.8,
    backgroundColor: '#F7F9FC',
    borderBottomLeftRadius: width,
    borderBottomRightRadius: width,
    transform: [{ scaleX: 1.2 }],
  },
  safeArea: {
    flex: 1,
   
  },
  headerNav: {
    paddingHorizontal: 20,
    height: 50,
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 25,
    paddingBottom: 40,
  },
  
  // Card chính
  mainCard: {
    width: '100%',
    height: 200,
    backgroundColor: COLORS.white,
    borderRadius: 30,
    marginTop: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderGray,
  },
  mainGrammarTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.textDark,
  },

  // Sections
  detailsSection: {
    marginTop: 30,
  },
  infoBlock: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: COLORS.textGray,
    fontWeight: '600',
    marginBottom: 6,
  },
  valueBold: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  valueNormal: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
    lineHeight: 22,
  },

  // Ví dụ
  exampleText: {
    fontSize: 15,
    color: COLORS.textDark,
    marginBottom: 6,
    lineHeight: 22,
    fontWeight: '500',
  },
  exampleKr: {
    fontWeight: '800',
  },

  // Ngữ pháp tương tự
  similarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  similarLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primaryGreen,
  },
  similarValue: {
    fontSize: 15,
    color: COLORS.textGray,
    fontWeight: '600',
  },
});