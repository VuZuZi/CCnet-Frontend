export function getNavbarFloatingPanelMetrics(
  anchorRect,
  {
    width = 408,
    gap = 12,
    fallbackTop = 88,
    desktopInset = 16,
    mobileInset = 12,
    bottomInset = 16,
  } = {}
) {
  if (typeof window === 'undefined') {
    return {
      top: fallbackTop,
      right: desktopInset,
      width,
      maxWidth: `calc(100vw - ${desktopInset * 2}px)`,
      availableHeight: 640,
      isMobile: false,
    };
  }

  const isMobile = window.innerWidth < 640;
  const inset = isMobile ? mobileInset : desktopInset;
  const safeTop = Math.max(
    fallbackTop,
    Math.round((anchorRect?.bottom || fallbackTop - gap) + gap)
  );
  const maxPanelWidth = Math.max(280, window.innerWidth - inset * 2);

  return {
    top: safeTop,
    right: inset,
    width: Math.min(width, maxPanelWidth),
    maxWidth: `calc(100vw - ${inset * 2}px)`,
    availableHeight: Math.max(320, window.innerHeight - safeTop - bottomInset),
    isMobile,
  };
}

