import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
  
} from 'react-native';
import { CrownIcon, CheckCircleIcon } from 'phosphor-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const COLORS = {
  month: '#76FFB1',   // Xanh lá neon nhạt
  year: '#FFB2B2',    // Hồng nhạt
  student: '#D8B4FF', // Tím nhạt
  textDark: '#1A1A1A',
  white: '#FFFFFF',
  cardBorder: '#EEEEEE',
};

interface PremiumCardProps {
  title: string;
  benefits: string[];
  color: string;
  onPress?: () => void;
}

// Reusable Premium Card Component
const PremiumCard = ({ title, benefits, color, onPress }: PremiumCardProps) => (
  <TouchableOpacity 
    style={[styles.card, { borderColor: COLORS.cardBorder }]} 
    activeOpacity={0.9}
    onPress={onPress}
  >
    {/* Card Header với màu riêng biệt */}
    <View style={[styles.cardHeader, { backgroundColor: color }]}>
      <Text style={styles.cardHeaderText}>{title}</Text>
    </View>

    {/* Card Body */}
    <View style={styles.cardBody}>
      {benefits.map((benefit, index) => (
        <View key={index} style={styles.benefitRow}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.benefitText}>{benefit}</Text>
        </View>
      ))}
      
      {/* Mảng trang trí góc đặc trưng (Decorative Blob) */}
      <View style={[styles.decorativeBlob, { backgroundColor: color }]} />
    </View>
  </TouchableOpacity>
);

export default function UpdatePackageScreen() {
  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        
        {/* Header với Background Image họa tiết báo chí */}
        <ImageBackground 
          source={{ uri: 'https://i.pinimg.com/736x/8e/3c/6e/8e3c6e9766943a85662768d8106f368d.jpg' }} // Hình ảnh họa tiết báo chí/văn bản
          style={styles.headerImage}
        >
          {/* Lớp phủ Overlay tối để chữ trắng nổi bật */}
          <View style={styles.overlay}>
            <SafeAreaView>
              <View style={styles.headerTextContent}>
                <Text style={styles.brandText}>K-WAVE</Text>
                <Text style={styles.mainTitle}>
                  TRẢI NGHIỆM HỌC TẬP KHÔNG{'\n'}GIỚI HẠN VỚI GÓI PREMIUM
                </Text>
              </View>
            </SafeAreaView>
          </View>
          
          {/* Đường cắt răng cưa hoặc vát chéo ở đáy header (nếu cần) */}
          <View style={styles.headerBottomCurve} />
        </ImageBackground>

        <View style={styles.content}>
          {/* Card: Month Premium */}
          <PremiumCard 
            title="MONTH PREMIUM"
            color={COLORS.month}
            benefits={[
              'Một tài khoản Premium',
              'Huỷ bất cứ lúc nào',
              'Đăng ký hoặc thanh toán một lần'
            ]}
          />

          {/* Card: Year Premium */}
          <PremiumCard 
            title="YEAR PREMIUM"
            color={COLORS.year}
            benefits={[
              'Một tài khoản Premium',
              'Huỷ bất cứ lúc nào',
              'Đăng ký hoặc thanh toán một lần'
            ]}
          />

          {/* Card: Student */}
          <PremiumCard 
            title="STUDENT"
            color={COLORS.student}
            benefits={[
              'Một tài khoản Premium đã xác minh',
              'Giảm giá cho sinh viên đủ điều kiện',
              'Huỷ bất cứ lúc nào',
              'Đăng ký hoặc thanh toán một lần'
            ]}
          />

          {/* Footer Section: Lý do nên dùng */}
          <TouchableOpacity style={styles.reasonSection}>
            <Text style={styles.reasonTitle}>Lý do nên dùng gói Premium</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.white 
  },
  headerImage: {
    width: '100%',
    height: 220,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)', // Làm tối ảnh nền
    padding: 20,
    justifyContent: 'center',
  },
  headerTextContent: {
    marginTop: 20,
  },
  brandText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  mainTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 28,
  },
  headerBottomCurve: {
    height: 20,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    marginTop: -20,
  },
  content: {
    paddingHorizontal: 20,
    marginTop: 10,
  },

  // Premium Card Styles
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 25,
    borderWidth: 1,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  cardHeader: {
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  cardHeaderText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#2D3436',
  },
  cardBody: {
    padding: 25,
    position: 'relative',
    minHeight: 140,
  },
  benefitRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  bullet: {
    fontSize: 18,
    marginRight: 10,
    color: COLORS.textDark,
  },
  benefitText: {
    fontSize: 14,
    color: COLORS.textDark,
    fontWeight: '600',
    lineHeight: 20,
    flex: 1,
  },
  decorativeBlob: {
    position: 'absolute',
    bottom: -30,
    right: -20,
    width: 120,
    height: 120,
    borderRadius: 60,
    opacity: 0.7,
  },

  // Footer section
  reasonSection: {
    backgroundColor: COLORS.cardBorder,
    borderRadius: 20,
    padding: 20,
    marginTop: 10,
  },
  reasonTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textDark,
  }
});