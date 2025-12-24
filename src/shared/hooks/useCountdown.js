import { useState, useEffect, useCallback } from 'react';

export function useCountdown(initialSeconds = 0) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (seconds <= 0) return;

    const timer = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds]);

  const startCountdown = useCallback((secs) => {
    setSeconds(secs);
  }, []);

  return { seconds, startCountdown, isRunning: seconds > 0 };
}