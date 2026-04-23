import axios from "axios";
import { env } from "@/config/env";
import { tokenManager } from "./tokenManager";
import { apiConfig } from "@/config/api.config"; 

export const authEvents = new EventTarget();

const httpClient = axios.create(apiConfig);

httpClient.interceptors.request.use(
  (config) => {
    const token = tokenManager.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Don't set Content-Type for FormData - let browser handle it
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    if (env.ENABLE_LOGGING) {
      console.log(`[${config.method?.toUpperCase()}] ${config.url}`);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (prom.timeoutId) clearTimeout(prom.timeoutId);
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

    if (!originalRequest._retryCount) originalRequest._retryCount = 0;
    const shouldRetry = apiConfig.retry?.shouldRetry?.(error) && originalRequest._retryCount < apiConfig.retry.maxRetries;
    
    if (shouldRetry && error.response?.status !== 401) {
      originalRequest._retryCount += 1;
      return new Promise(resolve => setTimeout(resolve, apiConfig.retry.retryDelay || 1000))
        .then(() => httpClient(originalRequest));
    }

    if (error.response?.status !== 401 || originalRequest._retry) {
      const errorMessage = error.response?.data?.message || error.message;
      if (env.ENABLE_LOGGING) {
        console.error(`[API Error] ${errorMessage}`);
      }
      return Promise.reject(error);
    }

    const authUrls = ["/auth/login", "/auth/register", "/auth/refresh-token"];
    if (authUrls.some((url) => originalRequest.url?.includes(url))) {
      if (originalRequest.url?.includes("/auth/refresh-token")) {
        authEvents.dispatchEvent(new Event("logout"));
      }
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            reject(new Error("Refresh token timeout. Vui lòng kiểm tra kết nối mạng."));
        }, 10000); 
        failedQueue.push({ resolve, reject, timeoutId });
      })
        .then((token) => {
          originalRequest.headers = { ...originalRequest.headers, Authorization: `Bearer ${token}` };
          return httpClient(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post(
        "/auth/refresh-token", 
        {}, 
        { baseURL: apiConfig.baseURL, withCredentials: true }
      );
      
      const newAccessToken = data.data.accessToken;
      tokenManager.setAccessToken(newAccessToken);
      processQueue(null, newAccessToken);

      originalRequest.headers = { ...originalRequest.headers, Authorization: `Bearer ${newAccessToken}` };
      return httpClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      tokenManager.removeAccessToken();
      authEvents.dispatchEvent(new Event("logout"));
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export const getErrorMessage = (error) => {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.data?.error) return error.response.data.error;
    if (error.message === "Network Error") return "Lỗi mạng. Vui lòng kiểm tra kết nối.";
  return error.message || "An unexpected error occurred.";
};

export const isNetworkError = (error) => {
  return !error.response && error.message === "Network Error";
};

export default httpClient;
