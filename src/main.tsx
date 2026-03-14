import * as Sentry from "@sentry/react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

Sentry.init({
  dsn: "https://39435cb7a9ceeb3f098bb72113340868@o4510793901998080.ingest.us.sentry.io/4511042522972160",
  sendDefaultPii: true,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  // Tracing — capture 100% of transactions
  tracesSampleRate: 1.0,
  tracePropagationTargets: [
    "localhost",
    /^https:\/\/pure-task-trust\.lovable\.app/,
    /^https:\/\/id-preview--2c7cb9ac-b84e-45d3-8081-07c5cb818b12\.lovable\.app/,
  ],
  // Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  // Forward console logs to Sentry
  enableLogs: true,
});

const container = document.getElementById("root")!;
const root = createRoot(container);
root.render(
  <Sentry.ErrorBoundary fallback={<p>An unexpected error occurred.</p>} showDialog>
    <App />
  </Sentry.ErrorBoundary>
);
