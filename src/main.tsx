// instrument.ts MUST be the very first import — initialises Sentry before React
import "./instrument";

import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <Sentry.ErrorBoundary fallback={<p>An unexpected error occurred.</p>} showDialog>
    <App />
  </Sentry.ErrorBoundary>
);
