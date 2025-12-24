
const validateEnv = () => {
  const required = ['VITE_API_URL'];
  const missing = required.filter(key => !import.meta.env[key]);
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
};

if (import.meta.env.DEV) {
  validateEnv();
}


export const apiConfig = {
  baseURL: import.meta.env.VITE_API_URL,
  
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
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