const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

export const appConfig = {
  name: import.meta.env.VITE_APP_NAME || 'CCNET',
  version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  environment: isDevelopment ? 'development' : 'production',
};

export const featureFlags = {
  enableDevTools: import.meta.env.VITE_ENABLE_DEVTOOLS === 'true',
  enableLogging: import.meta.env.VITE_ENABLE_LOGGING === 'true',
  enableStateDevTools: isDevelopment,
  enableMockAPI: false,
};

export const devConfig = {
  isDevelopment,
  isProduction,
  log: (...args) => {
    if (featureFlags.enableLogging) {
      console.log(...args);
    }
  },
  
  warn: (...args) => {
    if (featureFlags.enableLogging) {
      console.warn(...args);
    }
  },
  
  error: (...args) => {
    console.error(...args);
  },
};

export default appConfig;