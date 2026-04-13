import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Temporarily disable smooth scroll so navigation jumps instantly to top
    const html = document.documentElement;
    const prevBehavior = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto";

    // Double-RAF ensures the new page DOM is rendered before scrolling
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.scrollTo(0, 0);
        html.scrollTop = 0;
        document.body.scrollTop = 0;

        // Restore smooth scrolling after the jump
        html.style.scrollBehavior = prevBehavior;
      });
    });
  }, [pathname]);

  return null;
}
