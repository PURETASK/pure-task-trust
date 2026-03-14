import * as Sentry from "@sentry/react";
import React from "react";
import {
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType,
} from "react-router-dom";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN ?? "https://39435cb7a9ceeb3f098bb72113340868@o4510793901998080.ingest.us.sentry.io/4511042522972160",
  environment: import.meta.env.MODE,
  release: import.meta.env.VITE_APP_VERSION,

  sendDefaultPii: true,

  integrations: [
    Sentry.consoleLoggingIntegration({ levels: ["log", "warn", "error"] }),
    Sentry.reactRouterV6BrowserTracingIntegration({
      useEffect: React.useEffect,
      useLocation,
      useNavigationType,
      createRoutesFromChildren,
      matchRoutes,
    }),
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],

  // Tracing — 100% in dev/staging; lower in prod via VITE_TRACES_SAMPLE_RATE
  tracesSampleRate: Number(import.meta.env.VITE_TRACES_SAMPLE_RATE ?? 1.0),
  tracePropagationTargets: [
    "localhost",
    /^https:\/\/pure-task-trust\.lovable\.app/,
    /^https:\/\/id-preview--2c7cb9ac-b84e-45d3-8081-07c5cb818b12\.lovable\.app/,
  ],

  // Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Structured logs forwarded to Sentry
  enableLogs: true,

  // Attach stack traces to captureMessage calls
  attachStacktrace: true,
});
