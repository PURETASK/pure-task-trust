// instrument.ts MUST be the very first import — initialises Sentry before React
import "./instrument";

import { createRoot } from "react-dom/client";
import { reactErrorHandler } from "@sentry/react";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!, {
  // React 18: capture all uncaught / caught / recoverable errors in Sentry
  onUncaughtError: reactErrorHandler({ logErrors: true }),
  onCaughtError: reactErrorHandler({ logErrors: true }),
  onRecoverableError: reactErrorHandler(),
}).render(<App />);
