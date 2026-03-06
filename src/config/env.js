const requiredEnvVars = [
  'VITE_API_URL',
  'VITE_GOOGLE_CLIENT_ID',
  'VITE_SOCKET_URL'
];

const missingVars = requiredEnvVars.filter(
  (key) => !import.meta.env[key]
);

if (missingVars.length > 0) {
  throw new Error(
    ` Missing required environment variables: ${missingVars.join(', ')}`
  );
}

export const env = {
  API_URL: import.meta.env.VITE_API_URL,
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID,
  ENABLE_LOGGING: import.meta.env.VITE_ENABLE_LOGGING === 'true',
  IS_DEV: import.meta.env.DEV,
  SOCKET_URL: import.meta.env.VITE_SOCKET_URL,
};