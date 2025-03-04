import axios from 'axios';

import { environment } from '@/config';
import { getSessionItem } from '@/lib/helperFunction';

// Function to get token from cookies
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

const securityGuardAxiosInstance = axios.create({
  baseURL: environment.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

securityGuardAxiosInstance.interceptors.request.use(
  (config) => {
    const securityToken = getCookie('security-auth-token'); // Get token from cookies
    if (securityToken) {
      ////console.log(securityToken, 'see here . ');
      config.headers['Authorization'] = `Bearer ${securityToken.toString()}`; // Set token in Authorization header
    }
    config.headers['DeviceType'] = `web`; // You can change this as needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default securityGuardAxiosInstance;
