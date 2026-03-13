import { env } from './env';

export const apiConfig = {
  baseURL: env.API_URL,
  timeout: env.API_TIMEOUT,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  retry: {
    maxRetries: 3,
    retryDelay: 1000,
    shouldRetry: (error) => {
      const status = error?.response?.status;
      return !status || status >= 500;
    },
  },
};

export default apiConfig;