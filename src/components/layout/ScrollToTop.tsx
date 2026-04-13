import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Double-RAF ensures the new page DOM is rendered before scrolling
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo(0, 0);
        // Fallback: also scroll documentElement and body directly
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      });
    });
  }, [pathname]);

  return null;
}
