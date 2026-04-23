import { useEffect, useState, useRef } from 'react';
import { env } from '@/config/env';
import { tokenManager } from '@/shared/lib/tokenManager';
import { devConfig } from '@/config/app.config';

export function useDisbursementStatusStream(disbursementId, onStatusChange) {
    const [connectionStatus, setConnectionStatus] = useState('closed');
    
    const savedCallback = useRef(onStatusChange);

    useEffect(() => {
        savedCallback.current = onStatusChange;
    }, [onStatusChange]);

    useEffect(() => {
        if (!disbursementId || connectionStatus === 'completed') return;

        const abortController = new AbortController();
        const token = tokenManager.getAccessToken();
        
        const streamUrl = `${env.API_URL}/disbursement/${disbursementId}/stream`;

        const connectStream = async () => {
            try {
                setConnectionStatus('connecting');

                const response = await fetch(streamUrl, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'text/event-stream',
                    },
                    signal: abortController.signal
                });

                if (!response.ok) {
                    throw new Error(`Lỗi kết nối luồng HTTP: ${response.status}`);
                }

                setConnectionStatus('open');

                const reader = response.body.getReader();
                const decoder = new TextDecoder('utf-8');
                let buffer = '';

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');

                    buffer = lines.pop() || '';

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const dataStr = line.replace('data: ', '').trim();

                            if (!dataStr || dataStr === '{}') continue;

                            try {
                                const data = JSON.parse(dataStr);
                                if (data.status) {
                                    savedCallback.current?.(data);

                                    if (['COMPLETED', 'HOLD', 'REJECTED'].includes(data.status)) {
                                        setConnectionStatus('completed');
                                        abortController.abort();
                                        return;
                                    }
                                }
                            } catch (parseError) {
                            }
                        }
                    }
                }
            } catch (error) {
                if (error.name !== 'AbortError') {
                    devConfig.error('[SSE Connection Error]', error);
                    setConnectionStatus('error');
                }
            }
        };

        connectStream();
        return () => {
            abortController.abort();
            setConnectionStatus('closed');
        };

    }, [disbursementId]);

    return { connectionStatus };
}
