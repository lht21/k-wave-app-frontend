import * as React from 'react';
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { newsApiService, NewsArticle, formatNewsDate, getDifficultyColor, getDifficultyText } from '../services/newsApiService';
import { useNews } from '../hooks/useNews';

const NewsTestScreen: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Test hook
  const { news, loading: hookLoading, error, refetch } = useNews({ limit: 5 });

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const runAPITests = async () => {
    setLoading(true);
    setTestResults([]);
    
    try {
      // Test 1: Get all news
      addTestResult('🧪 Testing GET /api/news...');
      const allNewsResponse = await newsApiService.getAllNews({ limit: 3 });
      addTestResult(`✅ GET /api/news: ${allNewsResponse.data.news.length} articles found`);
      
      // Test 2: Get recent news
      addTestResult('🧪 Testing GET /api/news/recent...');
      const recentResponse = await newsApiService.getRecentNews(3);
      addTestResult(`✅ GET /api/news/recent: ${recentResponse.data.news.length} articles found`);
      
      // Test 3: Search news
      addTestResult('🧪 Testing GET /api/news/search...');
      const searchResponse = await newsApiService.searchNews('한국', 3);
      addTestResult(`✅ GET /api/news/search: ${searchResponse.data.news.length} results for "한국"`);
      
      // Test 4: Get news stats
      addTestResult('🧪 Testing GET /api/news/stats...');
      const statsResponse = await newsApiService.getNewsStats();
      addTestResult(`✅ GET /api/news/stats: ${statsResponse.data.overview.totalArticles} total articles`);
      
      // Test 5: Get news by category
      addTestResult('🧪 Testing GET /api/news/category/entertainment...');
      const categoryResponse = await newsApiService.getNewsByCategory('entertainment', 3);
      addTestResult(`✅ GET /api/news/category/entertainment: ${categoryResponse.data.news.length} articles`);
      
      addTestResult('🎉 All API tests completed successfully!');
      
    } catch (error) {
      addTestResult(`❌ API Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const NewsItem = ({ item }: { item: NewsArticle }) => (
    <View style={styles.newsItem}>
      <Text style={styles.newsTitle} numberOfLines={2}>{item.title}</Text>
      <Text style={styles.newsSource}>📺 {item.source} | 👤 {item.author}</Text>
      <View style={styles.newsMetadata}>
        <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(item.difficulty) }]}>
          <Text style={styles.difficultyText}>{getDifficultyText(item.difficulty)}</Text>
        </View>
        <Text style={styles.readingTime}>⏱️ {item.readingTime}분</Text>
        <Text style={styles.views}>👁️ {item.views}</Text>
      </View>
      <Text style={styles.publishDate}>📅 {formatNewsDate(item.publishedDate)}</Text>
      {item.keywords && item.keywords.length > 0 && (
        <Text style={styles.keywords}>🏷️ {item.keywords.join(', ')}</Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📰 News API Test</Text>
      
      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={runAPITests}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? '⏳ Testing APIs...' : '🚀 Run API Tests'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.button, styles.refreshButton]} 
        onPress={refetch}
      >
        <Text style={styles.buttonText}>🔄 Refresh Hook Data</Text>
      </TouchableOpacity>

      {/* Test Results */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🧪 Test Results:</Text>
        {testResults.length > 0 ? (
          <FlatList
            data={testResults}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <Text style={styles.testResult}>{item}</Text>
            )}
            style={styles.testResultsList}
          />
        ) : (
          <Text style={styles.emptyText}>No tests run yet</Text>
        )}
      </View>

      {/* Hook Data */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🪝 useNews Hook Data:</Text>
        {hookLoading ? (
          <ActivityIndicator size="small" color="#269a56ff" />
        ) : error ? (
          <Text style={styles.errorText}>❌ Error: {error}</Text>
        ) : (
          <FlatList
            data={news}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <NewsItem item={item} />}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No news data from hook</Text>
            }
            style={styles.newsList}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333'
  },
  button: {
    backgroundColor: '#269a56ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center'
  },
  refreshButton: {
    backgroundColor: '#2196F3'
  },
  buttonDisabled: {
    backgroundColor: '#ccc'
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  },
  section: {
    flex: 1,
    marginTop: 20,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333'
  },
  testResultsList: {
    maxHeight: 200
  },
  testResult: {
    fontSize: 14,
    marginBottom: 5,
    paddingVertical: 2,
    color: '#666'
  },
  newsList: {
    maxHeight: 300
  },
  newsItem: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#269a56ff'
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4
  },
  newsSource: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6
  },
  newsMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 8
  },
  difficultyText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600'
  },
  readingTime: {
    fontSize: 12,
    color: '#666',
    marginRight: 8
  },
  views: {
    fontSize: 12,
    color: '#666'
  },
  publishDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4
  },
  keywords: {
    fontSize: 11,
    color: '#888',
    fontStyle: 'italic'
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    marginTop: 20
  },
  errorText: {
    color: '#f44336',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10
  }
});

export default NewsTestScreen;