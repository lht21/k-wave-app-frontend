// Dynamic API base URL with fallback
const getAPIBaseURL = () => {
  if (__DEV__) {
    // Try localhost first, then fallback to IP
    // return 'http://localhost:5000/api';
    return 'http://192.168.1.14:5000/api';
  }
  return 'http://192.168.1.14:5000/api';
};

const API_BASE_URL = getAPIBaseURL();

// Fallback URLs for different environments
export const API_ENDPOINTS = {
  LOCALHOST: 'http://localhost:5000/api',
  LOCAL_IP: 'http://192.168.1.14:5000/api',
  ANDROID_EMULATOR: 'http://10.0.2.2:5000/api'
};

// Function to get working endpoint
export const getWorkingEndpoint = async (): Promise<string> => {
  const endpoints = [
    API_ENDPOINTS.LOCALHOST,
    API_ENDPOINTS.LOCAL_IP,
    API_ENDPOINTS.ANDROID_EMULATOR
  ];

  for (const endpoint of endpoints) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(endpoint.replace('/api', '') + '/', {
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        console.log(`✅ Working endpoint found: ${endpoint}`);
        return endpoint;
      }
    } catch (error) {
      console.log(`❌ Endpoint failed: ${endpoint}`);
    }
  }
  
  // Return default if all fail
  return API_ENDPOINTS.LOCALHOST;
};

export default API_BASE_URL;

export const getAuthHeaders = () => {
  return {
    'Content-Type': 'application/json',
  };
};

export const getAuthHeadersWithToken = (token: string) => {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};