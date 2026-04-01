import { useEffect, useState } from 'react';

function getViewportMode(width) {
  if (width < 640) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

export function useChatViewport() {
  const [mode, setMode] = useState(() => {
    if (typeof window === 'undefined') return 'desktop';
    return getViewportMode(window.innerWidth);
  });

  useEffect(() => {
    const handleResize = () => {
      setMode(getViewportMode(window.innerWidth));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    mode,
    isMobile: mode === 'mobile',
    isTablet: mode === 'tablet',
    isDesktop: mode === 'desktop',
  };
}

export default useChatViewport;