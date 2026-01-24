import * as React from "react";

const MOBILE_BREAKPOINT = 768;

/**
 * Detects if the current viewport is mobile-sized
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}

/**
 * Detects if the device has touch capability
 */
export function useIsTouchDevice() {
  const [isTouch, setIsTouch] = React.useState<boolean>(false);

  React.useEffect(() => {
    setIsTouch(
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      // @ts-ignore - for older browsers
      navigator.msMaxTouchPoints > 0
    );
  }, []);

  return isTouch;
}

/**
 * Detects the current device orientation
 */
export function useOrientation() {
  const [isPortrait, setIsPortrait] = React.useState<boolean>(true);

  React.useEffect(() => {
    const mql = window.matchMedia("(orientation: portrait)");
    const onChange = (e: MediaQueryListEvent) => {
      setIsPortrait(e.matches);
    };
    
    setIsPortrait(mql.matches);
    mql.addEventListener("change", onChange);
    
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return { isPortrait, isLandscape: !isPortrait };
}

/**
 * Detects if the mobile keyboard is visible
 * Uses visualViewport API for accurate detection
 */
export function useKeyboardVisible() {
  const [isKeyboardVisible, setIsKeyboardVisible] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) {
      return;
    }

    const viewport = window.visualViewport;
    const initialHeight = viewport.height;
    
    const handleResize = () => {
      // Keyboard is likely visible if viewport height decreased significantly
      const heightDiff = initialHeight - viewport.height;
      setIsKeyboardVisible(heightDiff > 150);
    };

    viewport.addEventListener('resize', handleResize);
    
    return () => viewport.removeEventListener('resize', handleResize);
  }, []);

  return isKeyboardVisible;
}

/**
 * Combined hook for all mobile layout states
 */
export function useMobileLayout() {
  const isMobile = useIsMobile();
  const isTouch = useIsTouchDevice();
  const { isPortrait, isLandscape } = useOrientation();
  const isKeyboardVisible = useKeyboardVisible();

  return {
    isMobile,
    isTouch,
    isPortrait,
    isLandscape,
    isKeyboardVisible,
    // Convenience: true if mobile AND portrait (most common mobile use case)
    isMobilePortrait: isMobile && isPortrait,
  };
}
