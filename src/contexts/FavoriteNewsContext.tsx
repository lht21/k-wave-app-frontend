import * as React from 'react';
import { createContext, useContext, useState, ReactNode } from 'react';
import { NewsArticle } from '../types/news';

interface FavoriteNewsContextType {
  favoriteNews: NewsArticle[];
  addToFavorites: (article: NewsArticle) => void;
  removeFromFavorites: (articleId: string) => void;
  isFavorite: (articleId: string) => boolean;
}

const FavoriteNewsContext = createContext<FavoriteNewsContextType | undefined>(undefined);

export const useFavoriteNews = () => {
  const context = useContext(FavoriteNewsContext);
  if (!context) {
    throw new Error('useFavoriteNews must be used within a FavoriteNewsProvider');
  }
  return context;
};

interface FavoriteNewsProviderProps {
  children: ReactNode;
}

export const FavoriteNewsProvider: React.FC<FavoriteNewsProviderProps> = ({ children }) => {
  const [favoriteNews, setFavoriteNews] = useState<NewsArticle[]>([]);

  const addToFavorites = (article: NewsArticle) => {
    setFavoriteNews(prev => {
      if (!prev.find(item => item.id === article.id)) {
        return [...prev, article];
      }
      return prev;
    });
  };

  const removeFromFavorites = (articleId: string) => {
    setFavoriteNews(prev => prev.filter(item => item.id !== articleId));
  };

  const isFavorite = (articleId: string) => {
    return favoriteNews.some(item => item.id === articleId);
  };

  const value = {
    favoriteNews,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
  };

  return (
    <FavoriteNewsContext.Provider value={value}>
      {children}
    </FavoriteNewsContext.Provider>
  );
};