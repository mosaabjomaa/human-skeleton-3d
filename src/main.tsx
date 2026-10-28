import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/cairo";
import "./i18n";
import "./index.css";
import "./responsive.css";
import "./cursor.css";
import App from "./App";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
