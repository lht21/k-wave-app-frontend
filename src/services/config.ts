// API Configuration
// Check if we're in development mode (React Native)
const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV === 'development';

export const API_BASE_URL = isDev 
  ? 'http://10.0.2.2:5000/api'  // Android emulator (test server port)
  : 'https://your-production-api.com/api';

// For iOS simulator, use: http://localhost:5000/api
// For physical device, use your computer's IP: http://192.168.1.XXX:5000/api

export const API_ENDPOINTS = {
  // Auth
  AUTH: '/auth',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  REFRESH: '/auth/refresh',
  
  // User
  USER: '/user',
  USER_PROFILE: '/user/profile',
  
  // News
  NEWS: '/news',
  NEWS_RECENT: '/news/recent',
  NEWS_SEARCH: '/news/search',
  NEWS_STATS: '/news/stats',
  NEWS_CATEGORY: '/news/category',
  NEWS_SOURCE: '/news/source',
  NEWS_CRAWL: '/news/crawl',
  
  // Content
  CONTENT: '/content',
  AUDIT_LOGS: '/audit-logs'
};

// Request timeout in milliseconds
export const REQUEST_TIMEOUT = 10000;

// Default pagination limits
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

export default {
  API_BASE_URL,
  API_ENDPOINTS,
  REQUEST_TIMEOUT,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE
};