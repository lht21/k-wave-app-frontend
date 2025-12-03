import { API_ENDPOINTS } from '../api/api';

/**
 * Test API connectivity to find the best endpoint
 */
export const testAPIConnectivity = async (): Promise<string> => {
  const endpoints = [
    API_ENDPOINTS.LOCAL_IP,
    API_ENDPOINTS.LOCALHOST, 
    API_ENDPOINTS.ANDROID_EMULATOR
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`🔍 Testing endpoint: ${endpoint}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(`${endpoint}/test`, {
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        console.log(`✅ Endpoint working: ${endpoint}`);
        return endpoint;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.log(`❌ Endpoint failed: ${endpoint}`, errorMessage);
    }
  }
  
  // Return default if all fail
  console.log('⚠️ All endpoints failed, using default');
  return API_ENDPOINTS.LOCAL_IP;
};

/**
 * Test simple network connectivity
 */
export const testNetworkConnectivity = async (): Promise<boolean> => {
  try {
    const response = await fetch('https://www.google.com', {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000)
    });
    return response.ok;
  } catch (error) {
    console.error('Network connectivity test failed:', error);
    return false;
  }
};