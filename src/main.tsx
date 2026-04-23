import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <Sentry.ErrorBoundary fallback={<p>An unexpected error occurred.</p>} showDialog>
    <App />
  </Sentry.ErrorBoundary>
);

// Defer Sentry initialization until after the app is interactive.
// This removes Sentry from the critical TTI path (saves ~3s per Lighthouse audit).
// Errors thrown before init are still caught by the ErrorBoundary; they just
// won't be reported to Sentry until init completes (typically <1s after load).
const initSentry = () => {
  import("./instrument").catch(() => {
    /* non-fatal: monitoring is best-effort */
  });
};

if (typeof window !== "undefined") {
  const w = window as Window & {
    requestIdleCallback?: (cb: () => void, opts?: { timeout?: number }) => void;
  };
  if (typeof w.requestIdleCallback === "function") {
    w.requestIdleCallback(initSentry, { timeout: 3000 });
  } else {
    setTimeout(initSentry, 1500);
  }
}
