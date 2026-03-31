// src/main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './app/App';
import { env } from './config/env';
import './i18n';
import './styles/main.css';
import 'leaflet/dist/leaflet.css';
import { Toaster } from 'react-hot-toast';

if (!env.GOOGLE_CLIENT_ID) {
    console.error('Google Client ID is missing in .env file!');
}

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <GoogleOAuthProvider clientId={env.GOOGLE_CLIENT_ID}>
            <App />
            {/* ✅ Thêm Toaster vào đây */}
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 5000,
                    style: {
                        background: '#fff',
                        color: '#333',
                        borderRadius: '12px',
                        padding: '12px 16px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    },
                    success: {
                        iconTheme: {
                            primary: '#10b981',
                            secondary: '#fff',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#fff',
                        },
                    },
                }}
            />
        </GoogleOAuthProvider>
    </StrictMode>,
);