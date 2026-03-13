const requiredEnvVars = ['VITE_API_URL', 'VITE_GOOGLE_CLIENT_ID', 'VITE_SOCKET_URL'];
const missingVars = requiredEnvVars.filter(key => !import.meta.env[key]);

if (missingVars.length > 0 && import.meta.env.DEV) {
  console.error(`🚨 [ENV WARNING] Thiếu biến môi trường: ${missingVars.join(', ')}`);
}

export const env = {
  API_URL: import.meta.env.VITE_API_URL,
  API_TIMEOUT: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  SOCKET_URL: import.meta.env.VITE_SOCKET_URL,
  ENABLE_LOGGING: import.meta.env.VITE_ENABLE_LOGGING === 'true',
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
};