import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Image
} from 'react-native';
import CultureApiService from '../services/cultureApiService';

interface CultureCategory {
  _id: string;
  id: string;
  title: string;
  description: string;
  icon?: string;
  isActive: boolean;
}

interface CultureItem {
  _id: string;
  title: string;
  subtitle?: string;
  description: string;
  coverImage?: string;
  category: {
    id: string;
    title: string;
  };
  status: string;
  isPublished: boolean;
  viewCount: number;
  author: {
    fullName: string;
  };
  createdAt: string;
}

const CultureTestDemo: React.FC = () => {
  const [categories, setCategories] = useState<CultureCategory[]>([]);
  const [cultureItems, setCultureItems] = useState<CultureItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');

      // Test API categories
      console.log('🔍 Testing Categories API...');
      const categoriesData = await CultureApiService.getCategories();
      console.log('✅ Categories loaded:', categoriesData);
      setCategories(categoriesData);

      // Test API culture items
      console.log('🔍 Testing Culture Items API...');
      const itemsResponse = await CultureApiService.getCultureItems({
        limit: 10
      });
      console.log('✅ Culture Items loaded:', itemsResponse);
      setCultureItems(itemsResponse.items || []);

    } catch (error: any) {
      console.error('❌ API Error:', error);
      const errorMessage = error?.message || error?.toString() || 'Không xác định';
      setError(`Lỗi kết nối: ${errorMessage}`);
      Alert.alert('Lỗi API', `Không thể kết nối API:\n${errorMessage}\n\nAPI URL: ${process.env.EXPO_PUBLIC_API_URL}`);
    } finally {
      setLoading(false);
    }
  };

  const testSpecificCategory = async (categoryId: string) => {
    try {
      setLoading(true);
      console.log(`🔍 Testing category: ${categoryId}`);
      
      const itemsResponse = await CultureApiService.getCultureItems({
        categoryId: categoryId,
        limit: 5
      });
      
      console.log(`✅ Items for ${categoryId}:`, itemsResponse);
      setCultureItems(itemsResponse.items || []);
    } catch (error: any) {
      console.error('❌ Category test error:', error);
      Alert.alert('Lỗi', `Không thể load category ${categoryId}: ${error?.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#269a56ff" />
          <Text style={styles.loadingText}>Đang test API...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>🧪 Culture API Test Demo</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={loadData}>
            <Text style={styles.refreshButtonText}>🔄 Refresh</Text>
          </TouchableOpacity>
        </View>

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>❌ {error}</Text>
          </View>
        ) : null}

        {/* Categories Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Categories ({categories.length})</Text>
          {categories.map((category) => (
            <TouchableOpacity
              key={category._id}
              style={styles.categoryCard}
              onPress={() => testSpecificCategory(category.id)}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryTitle}>{category.title}</Text>
                <Text style={styles.categoryDesc}>{category.description}</Text>
                <Text style={styles.categoryId}>ID: {category.id}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Culture Items Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📚 Culture Items ({cultureItems.length})</Text>
          {cultureItems.map((item) => (
            <View key={item._id} style={styles.itemCard}>
              {item.coverImage && (
                <Image 
                  source={{ uri: item.coverImage }}
                  style={styles.itemImage}
                  resizeMode="cover"
                />
              )}
              <View style={styles.itemCardContent}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                {item.subtitle ? <Text style={styles.itemSubtitle}>{item.subtitle}</Text> : null}
                <Text style={styles.itemDescription}>{item.description}</Text>
              <View style={styles.itemMeta}>
                <Text style={styles.metaText}>👁️ {item.viewCount} views</Text>
                <Text style={styles.metaText}>📂 {item.category.title}</Text>
                <Text style={styles.metaText}>✍️ {item.author.fullName}</Text>
                <Text style={styles.metaText}>📅 {new Date(item.createdAt).toLocaleDateString()}</Text>
              </View>
              <View style={styles.statusContainer}>
                <Text style={[styles.statusText, 
                  item.status === 'approved' ? styles.statusApproved : styles.statusPending
                ]}>
                  {item.status === 'approved' ? '✅ Đã duyệt' : '⏳ Chờ duyệt'}
                </Text>
                <Text style={[styles.publishedText,
                  item.isPublished ? styles.published : styles.unpublished
                ]}>
                  {item.isPublished ? '🌐 Đã xuất bản' : '📝 Nháp'}
                </Text>
              </View>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            🔗 API: {process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api'}
          </Text>
          <Text style={styles.footerText}>
            📱 Kết nối thành công với MongoDB!
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshButton: {
    backgroundColor: '#269a56ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    backgroundColor: '#ffe6e6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ff4444',
  },
  errorText: {
    color: '#cc0000',
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  categoryCard: {
    backgroundColor: 'white',
    flexDirection: 'row',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  categoryIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  categoryDesc: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  categoryId: {
    fontSize: 12,
    color: '#999',
  },
  itemCard: {
    backgroundColor: 'white',
    marginBottom: 12,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    overflow: 'hidden',
  },
  itemImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#f5f5f5',
  },
  itemCardContent: {
    padding: 16,
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  itemDescription: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
    marginBottom: 12,
  },
  itemMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  metaText: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusApproved: {
    backgroundColor: '#e8f5e8',
    color: '#2d5a2d',
  },
  statusPending: {
    backgroundColor: '#fff3cd',
    color: '#856404',
  },
  publishedText: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  published: {
    backgroundColor: '#d1ecf1',
    color: '#0c5460',
  },
  unpublished: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
  },
  footer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
  },
});

export default CultureTestDemo;