import axios from 'axios';
import { environment } from '@/config';
import { getSessionItem, removeSessionItem } from '@/lib/helperFunction';
import toast from 'react-hot-toast';
import logger from '@/lib/logger';

// Utility function for getting the token
const getAccessToken = () => getSessionItem('token');

// Creating Axios instance
const axiosInstance = axios.create({
  baseURL: environment.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = getAccessToken();
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    config.headers['DeviceType'] = 'web';
    return config;
  },
  (error) => {
    logger.error(error);
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ERR_NETWORK') {
      toast.error('Your session has expired. Please log in again.');
      removeSessionItem('token');
      setTimeout(() => {
        window.location.href = environment.logoutUrl;
      }, 500);
    }

    // Make sure error.response exists before accessing its status
    if (error.response && error.response.status === 401) {
      toast.error('Authorization failed. Your session has expired. Redirecting to login...');
      removeSessionItem('token');
      setTimeout(() => {
        window.location.href = environment.logoutUrl;
      }, 500);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
