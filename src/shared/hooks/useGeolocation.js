import { useCallback } from 'react';
import { devConfig } from '@/config/app.config';

export function useGeolocation() {

    const getCurrentLocation = useCallback(() => {
        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                devConfig.log("[useGeolocation] Geolocation is not supported by this browser.");
                resolve(null);
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    devConfig.log(`[useGeolocation] Error (${error.code}): ${error.message}`);
                    resolve(null);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                }
            );
        });
    }, []);

    return { getCurrentLocation };
}