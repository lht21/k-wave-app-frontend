const API_BASE_URL = 'http://10.0.2.2:5000/api';

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