import axios from 'axios';
import { env } from '@/config/env';
import { tokenManager } from './tokenManager';

export const authEvents = new EventTarget();

const httpClient = axios.create({
  baseURL: env.API_URL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

httpClient.interceptors.request.use(
  (config) => {
    const token = tokenManager.getAccessToken();  
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (env.ENABLE_LOGGING) {
      console.log(` [${config.method?.toUpperCase()}] ${config.url}`);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || originalRequest._retry) {
      const errorMessage = error.response?.data?.message || error.message;
      if (env.ENABLE_LOGGING) {
        console.error(`[API Error] ${errorMessage}`);
      }
      return Promise.reject(error);
    }

    const authUrls = ['/auth/login', '/auth/register', '/auth/refresh-token'];
    if (authUrls.some(url => originalRequest.url?.includes(url))) {
      if (originalRequest.url?.includes('/auth/refresh-token')) {
         authEvents.dispatchEvent(new Event('logout'));
      }
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return httpClient(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data } = await httpClient.post('/auth/refresh-token');
      const newAccessToken = data.data.accessToken; 

      tokenManager.setAccessToken(newAccessToken);
      
      processQueue(null, newAccessToken);
      
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
      return httpClient(originalRequest);

    } catch (refreshError) {
      processQueue(refreshError, null);
      tokenManager.removeAccessToken();
      authEvents.dispatchEvent(new Event('logout'));
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export const getErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  
  if (error.message === 'Network Error') {
    return 'Network error. Please check your connection.';
  }
  
  return error.message || 'An unexpected error occurred.';
};

export const isNetworkError = (error) => {
  return !error.response && error.message === 'Network Error';
};

export default httpClient;