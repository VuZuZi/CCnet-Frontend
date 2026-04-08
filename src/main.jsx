import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google'; 
import App from './app/App';
import { env } from './config/env'; 
import './i18n';

import './styles/main.css';
import 'leaflet/dist/leaflet.css';

if (!env.GOOGLE_CLIENT_ID) {
  console.error('Google Client ID is missing in .env file!');
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={env.GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
);