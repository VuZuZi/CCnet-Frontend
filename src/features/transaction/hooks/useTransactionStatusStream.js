import { useEffect, useState, useRef } from 'react';
import { env } from '@/config/env';
import { tokenManager } from '@/shared/lib/tokenManager';

export function useTransactionStatusStream(transactionId, onStatusChange) {
    const [connectionStatus, setConnectionStatus] = useState('closed');
    const savedCallback = useRef(onStatusChange);

    useEffect(() => {
        savedCallback.current = onStatusChange;
    }, [onStatusChange]);

    useEffect(() => {
        if (!transactionId || connectionStatus === 'completed') return;

        const abortController = new AbortController();
        const token = tokenManager.getAccessToken();
        const streamUrl = `${env.API_URL}/transactions/${transactionId}/stream`;

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
                    throw new Error(`Stream HTTP Error: ${response.status}`);
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

                                    if (['COMPLETED', 'FAILED', 'EXPIRED'].includes(data.status)) {
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
                    if (env.ENABLE_LOGGING) console.warn('[SSE Connection Error]', error);
                    setConnectionStatus('error');
                }
            }
        };

        connectStream();

        return () => {
            abortController.abort();
            setConnectionStatus('closed');
        };

    }, [transactionId]);

    return { connectionStatus };
}