import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { envValidator } from "@/lib/env";
import { analytics } from "./analytics";

// Environment validation happens automatically on import
const postHogConfig = envValidator.getPostHogConfig();
analytics.init(postHogConfig.key, postHogConfig.host);
analytics.trackEntry();

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);