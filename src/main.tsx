import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { validateEnv } from "@/lib/env";
import { analytics } from "./analytics";

validateEnv();

analytics.init(import.meta.env.VITE_POSTHOG_KEY, import.meta.env.VITE_POSTHOG_HOST || undefined);
analytics.trackEntry();

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);