import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, FlatList, Platform, Alert, Dimensions, ActivityIndicator, RefreshControl } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { spacing } from '../../../theme/spacing'
import { colors, palette } from '../../../theme/colors'

import { RootStackParamList } from '../../../types/navigation'
import { useNews } from '../../../hooks/useNews'
import { NewsArticle as ApiNewsArticle, formatNewsDate, getDifficultyColor, getDifficultyText } from '../../../services/newsApiService'
import { useFavoriteNews } from '../../../contexts/FavoriteNewsContext'

type StdNewsNavigationProp = StackNavigationProp<RootStackParamList>;

const { width: screenWidth } = Dimensions.get('window');

const StdNews: React.FC = () => {
  const navigation = useNavigation<StdNewsNavigationProp>()
  const { favoriteNews } = useFavoriteNews()
  const [selectedFilter, setSelectedFilter] = useState('All')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedSource, setSelectedSource] = useState('all')
  const [selectedFavorite, setSelectedFavorite] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [displayDate, setDisplayDate] = useState(new Date().toLocaleDateString('vi-VN'))
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [showSourceDropdown, setShowSourceDropdown] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  // Pull-to-refresh handler
  const onRefresh = async () => {
    setRefreshing(true)
    try {
      await refetch()
    } catch (error) {
      console.error('Refresh failed:', error)
    } finally {
      setRefreshing(false)
    }
  }

  // Load more handler
  const onLoadMore = () => {
    if (!loading && hasMore) {
      loadMore()
    }
  }

  // Use real API data
  const { 
    news: apiNews, 
    loading, 
    error, 
    refetch,
    loadMore,
    hasMore 
  } = useNews({
    category: selectedCategory !== 'all' ? selectedCategory : undefined,
    source: selectedSource !== 'all' ? selectedSource : undefined,
    limit: 20
  })

  // Filter news articles based on selected category, source and favorite
  const filteredArticles = (() => {
    if (selectedFavorite) {
      return favoriteNews
    }
    
    // API data is already filtered by the hook based on category and source
    return apiNews
  })()

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await refetch()
    } catch (error) {
      console.error('Refresh failed:', error)
    } finally {
      setRefreshing(false)
    }
  }

  // Handle filter changes - no need to refetch as useNews hook handles params changes
  // useEffect(() => {
  //   if (!selectedFavorite) {
  //     refetch()
  //   }
  // }, [selectedCategory, selectedSource, selectedFavorite])

  // Categories with Korean names
  const categories = [
    { id: 'all', name: '전체', icon: '📰' },
    { id: 'culture', name: '문화', icon: '🎭' },
    { id: 'food', name: '음식', icon: '🍜' },
    { id: 'technology', name: '기술', icon: '💻' },
    { id: 'entertainment', name: '연예', icon: '🎵' },
    { id: 'sports', name: '스포츠', icon: '⚽' },
    { id: 'politics', name: '정치', icon: '🏛️' },
    { id: 'economy', name: '경제', icon: '💰' }
  ]

  // Korean news sources
  const sources = [
    { id: 'all', name: '전체', icon: '📰' },
    { id: '조선일보', name: '조선일보', icon: '📄' },
    { id: '중앙일보', name: '중앙일보', icon: '📰' },
    { id: '동아일보', name: '동아일보', icon: '📃' },
    { id: '한겨레', name: '한겨레', icon: '📑' },
    { id: 'KBS', name: 'KBS', icon: '📺' },
    { id: 'MBC', name: 'MBC', icon: '📻' },
    { id: 'SBS', name: 'SBS', icon: '📺' },
    { id: '연합뉴스', name: '연합뉴스', icon: '🗞️' },
    { id: 'YTN', name: 'YTN', icon: '📢' }
  ]

  // Get selected category display name
  const getSelectedCategoryName = () => {
    const selectedCat = categories.find(cat => cat.id === selectedCategory)
    return selectedCat ? `${selectedCat.icon} ${selectedCat.name}` : '📰 전체'
  }

  // Get selected source display name
  const getSelectedSourceName = () => {
    const selectedSrc = sources.find(src => src.id === selectedSource)
    return selectedSrc ? `${selectedSrc.icon} ${selectedSrc.name}` : '📰 전체'
  }

  // Filter options
  const filters = [
    { id: 'source', label: getSelectedSourceName(), active: selectedSource !== 'all', hasDropdown: true },
    { id: 'current', label: 'Hiện tại', active: selectedFilter === 'current', hasDropdown: false },
    { id: 'favorite', label: 'Yêu thích', active: selectedFavorite, hasDropdown: false },
    { id: 'category', label: getSelectedCategoryName(), active: selectedCategory !== 'all', hasDropdown: true }
  ]

  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '#4CAF50'
      case 'intermediate': return '#FF9800'
      case 'advanced': return '#F44336'
      default: return '#6B7280'
    }
  }

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '초급'
      case 'intermediate': return '중급'
      case 'advanced': return '고급'
      default: return '중급'
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    })
  }

  const formatNewsDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`
  }

  const handleDatePress = () => {
    Alert.prompt(
      'Chọn ngày',
      'Nhập ngày theo định dạng dd/mm/yyyy:',
      [
        {
          text: 'Hủy',
          style: 'cancel'
        },
        {
          text: 'OK',
          onPress: (dateString?: string) => {
            if (dateString) {
              // Parse input format dd/mm/yyyy
              const parts = dateString.trim().split('/')
              if (parts.length === 3) {
                const day = parseInt(parts[0])
                const month = parseInt(parts[1])
                const year = parseInt(parts[2])
                
                const newDate = new Date(year, month - 1, day)
                if (!isNaN(newDate.getTime()) && 
                    newDate.getDate() === day && 
                    newDate.getMonth() === month - 1 && 
                    newDate.getFullYear() === year) {
                  setSelectedDate(newDate)
                  setDisplayDate(formatDate(newDate))
                } else {
                  Alert.alert('Lỗi', 'Ngày không hợp lệ. Vui lòng nhập đúng định dạng dd/mm/yyyy')
                }
              } else {
                Alert.alert('Lỗi', 'Vui lòng nhập đúng định dạng dd/mm/yyyy')
              }
            }
          }
        }
      ],
      'plain-text',
      formatDate(selectedDate)
    )
  }

  const FilterButton = ({ item, isInGroup = false }: { item: any; isInGroup?: boolean }) => {
    const isCategoryFilter = item.id === 'category'
    const isSourceFilter = item.id === 'source'
    const isFavoriteFilter = item.id === 'favorite'
    
    // console.log(`Filter ${item.id}: active=${item.active}, selectedFavorite=${selectedFavorite}`)
    
    return (
      <View style={styles.filterButtonContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            item.active && styles.activeFilterButton,
            isInGroup && styles.groupedFilterButton,
            isInGroup && item.active && styles.activeGroupedFilterButton,
            isFavoriteFilter && item.active && styles.activeFavoriteButton,
            // Force style for favorite button when active
            isFavoriteFilter && selectedFavorite && {
              backgroundColor: '#269a56ff',
              borderColor: '#269a56ff',
            }
          ]}
          onPress={() => {
            if (isCategoryFilter) {
              setShowCategoryDropdown(!showCategoryDropdown)
              setShowSourceDropdown(false)
            } else if (isSourceFilter) {
              setShowSourceDropdown(!showSourceDropdown)
              setShowCategoryDropdown(false)
            } else if (isFavoriteFilter) {
              setSelectedFavorite(!selectedFavorite)
              setShowCategoryDropdown(false)
              setShowSourceDropdown(false)
            } else {
              setSelectedFilter(item.id)
              setShowCategoryDropdown(false)
              setShowSourceDropdown(false)
            }
          }}
        >
          <Text style={[
            styles.filterText,
            item.active && styles.activeFilterText,
            // Force white text for favorite when active
            isFavoriteFilter && selectedFavorite && { color: '#FFFFFF' }
          ]}>
            {item.label}
          </Text>
          {item.hasDropdown && (
            <Text style={[
              styles.dropdownIcon,
              item.active && styles.activeDropdownIcon
            ]}>
              {(isCategoryFilter && showCategoryDropdown) || (isSourceFilter && showSourceDropdown) ? '▲' : '▼'}
            </Text>
          )}
        </TouchableOpacity>
        
        {/* Source Dropdown */}
        {isSourceFilter && showSourceDropdown && (
          <View style={styles.categoryDropdown}>
            {sources.map((source) => (
              <TouchableOpacity
                key={source.id}
                style={[
                  styles.categoryDropdownItem,
                  selectedSource === source.id && styles.selectedCategoryDropdownItem
                ]}
                onPress={() => {
                  setSelectedSource(source.id)
                  setShowSourceDropdown(false)
                }}
              >
                <Text style={[
                  styles.categoryDropdownText,
                  selectedSource === source.id && styles.selectedCategoryDropdownText
                ]}>
                  {source.icon} {source.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        
        {/* Category Dropdown */}
        {isCategoryFilter && showCategoryDropdown && (
          <View style={styles.categoryDropdown}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryDropdownItem,
                  selectedCategory === category.id && styles.selectedCategoryDropdownItem
                ]}
                onPress={() => {
                  setSelectedCategory(category.id)
                  setShowCategoryDropdown(false)
                }}
              >
                <Text style={[
                  styles.categoryDropdownText,
                  selectedCategory === category.id && styles.selectedCategoryDropdownText
                ]}>
                  {category.icon} {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    )
  }

  const NewsItem = ({ item }: { item: ApiNewsArticle }) => (
    <TouchableOpacity 
      style={styles.newsCard}
      onPress={() => navigation.navigate('NewsDetail', { 
        newsId: item.id, 
        title: item.title 
      })}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.newsImage} />
      <View style={styles.newsContent}>
        <View style={styles.cardHeader}>
          <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(item.difficulty || 'intermediate') }]}>
            <Text style={styles.difficultyBadgeText}>{getDifficultyText(item.difficulty || 'intermediate')}</Text>
          </View>
          <Text style={styles.readingTime}>{item.readingTime}분</Text>
        </View>
        
        <Text style={styles.newsTitle} numberOfLines={2}>
          {item.title}
        </Text>
        
        <Text style={styles.newsSubtitle} numberOfLines={3}>
          {item.subtitle}
        </Text>
        
        <View style={styles.newsFooter}>
          <Text style={styles.newsAuthor}>Nguồn: {item.source || item.author}</Text>
          <Text style={styles.newsDate}>{formatNewsDate(item.publishedDate)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📰 한국 뉴스</Text>
        <TouchableOpacity 
          style={styles.viewAllButton}
          onPress={() => {
            // Reset all filters to show all articles
            setSelectedCategory('all')
            setSelectedSource('all')
            setSelectedFavorite(false)
            setShowCategoryDropdown(false)
            setShowSourceDropdown(false)
          }}
        >
          <Text style={styles.viewAllIcon}>📋</Text>
          <Text style={styles.viewAllText}>전체보기</Text>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <View style={styles.filtersRow}>
          <View style={styles.filterItem}>
            <FilterButton item={filters[0]} />
          </View>
          <View style={styles.centerFiltersGroup}>
            <FilterButton item={filters[1]} isInGroup={true} />
            <FilterButton item={filters[2]} isInGroup={true} />
          </View>
          <View style={styles.filterItem}>
            <FilterButton item={filters[3]} />
          </View>
        </View>
      </View>

      {/* Date Selector */}
      <View style={styles.dateSelector}>
        <TouchableOpacity style={styles.dateSelectorButton} onPress={handleDatePress}>
          <Text style={styles.dateSelectorText}>{displayDate}</Text>
        </TouchableOpacity>
      </View>

      {/* News List */}
      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>❌ Lỗi: {error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refetch}>
            <Text style={styles.retryButtonText}>🔄 Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredArticles as ApiNewsArticle[]}
          renderItem={({ item }: { item: ApiNewsArticle }) => <NewsItem item={item} />}
          keyExtractor={(item) => item.id}
          style={styles.newsList}
          contentContainerStyle={styles.newsListContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#269a56ff']}
              tintColor="#269a56ff"
            />
          }
          onEndReached={() => {
            if (hasMore && !loading) {
              loadMore()
            }
          }}
          onEndReachedThreshold={0.1}
          ListEmptyComponent={
            filteredArticles.length === 0 && loading && !refreshing ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#269a56ff" />
                <Text style={styles.loadingText}>Đang tải tin tức...</Text>
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {selectedFavorite ? '📚 Chưa có tin tức yêu thích' : '📰 Không có tin tức'}
                </Text>
              </View>
            )
          }
          ListFooterComponent={
            loading && filteredArticles.length > 0 ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#269a56ff" />
              </View>
            ) : null
          }
        />
      )}
    </View>
  )
}

export default StdNews

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.light.background
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    paddingTop: 60,
    backgroundColor: '#269a56ff',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: palette.white,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    gap: spacing.xs,
  },
  viewAllIcon: {
    fontSize: 14,
    color: palette.white,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.white,
  },

  // Filters
  filtersContainer: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.lg,
    paddingTop: spacing.md,
    position: 'relative',
    zIndex: 1000,
  },
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.xs
  },
  filterItem: {
    flex: 1,
    maxWidth: '30%'
  },
  filterButtonContainer: {
    position: 'relative',
  },
  centerFiltersGroup: {
    flexDirection: 'row',
    backgroundColor: palette.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.light.border,
    overflow: 'hidden'
  },
  filtersContent: {
    paddingHorizontal: spacing.xs,
    gap: spacing.sm
  },
  filterButton: {
    backgroundColor: palette.white,
    borderRadius: 20,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.light.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36
  },
  activeFilterButton: {
    backgroundColor: '#269a56ff',
    borderColor: '#269a56ff',
    borderRadius: 0
  },
  groupedFilterButton: {
    borderRadius: 0,
    borderWidth: 0,
    borderRightWidth: 1,
    borderRightColor: colors.light.border,
    minWidth: 80
  },
  activeGroupedFilterButton: {
    backgroundColor: '#269a56ff',
    borderRightColor: '#269a56ff'
  },
  activeFavoriteButton: {
    backgroundColor: '#269a56ff',
    borderColor: '#269a56ff',
  },
  filterText: {
    fontSize: 14,
    color: colors.light.text,
    fontWeight: '500'
  },
  activeFilterText: {
    color: palette.white,
    fontWeight: '600'
  },
  dropdownIcon: {
    fontSize: 10,
    color: colors.light.textSecondary,
    marginLeft: spacing.xs
  },
  activeDropdownIcon: {
    color: palette.white
  },

  // Category Dropdown
  categoryDropdown: {
    position: 'absolute',
    top: 38,
    left: 0,
    right: 0,
    backgroundColor: palette.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.light.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 1001,
  },
  categoryDropdownItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  selectedCategoryDropdownItem: {
    backgroundColor: '#E8F5E8',
  },
  categoryDropdownText: {
    fontSize: 14,
    color: colors.light.text,
    fontWeight: '500',
  },
  selectedCategoryDropdownText: {
    color: '#269a56ff',
    fontWeight: '600',
  },

  // Date Selector
  dateSelector: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginTop: -20,
  },
  dateSelectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor: palette.white,
    backgroundColor: '#CCFFCC',
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.light.border,
    alignSelf: 'flex-start'
  },
  dateSelectorText: {
    fontSize: 14,
    color: colors.light.text,
    marginRight: spacing.sm
  },

  // News List - Updated to match NewsList design
  newsList: {
    flex: 1,
    paddingHorizontal: spacing.md
  },
  newsListContent: {
    paddingBottom: spacing.xxxl
  },
  newsCard: {
    backgroundColor: palette.white,
    borderRadius: 16,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden'
  },
  newsImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    backgroundColor: palette.gray100
  },
  newsContent: {
    padding: spacing.md
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  difficultyBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyBadgeText: {
    fontSize: 12,
    color: palette.white,
    fontWeight: '600',
  },
  readingTime: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.light.text,
    marginBottom: spacing.sm,
    lineHeight: 24
  },
  newsSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: spacing.sm
  },
  newsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: spacing.sm,
    gap: spacing.xs
  },
  newsAuthor: {
    fontSize: 12,
    color: '#269a56ff',
    fontWeight: '600',
    flex: 1
  },
  newsDate: {
    fontSize: 12,
    color: '#6B7280'
  },

  // Loading and error states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: spacing.md
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    marginBottom: spacing.md
  },
  retryButton: {
    backgroundColor: '#269a56ff',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center'
  }
})
