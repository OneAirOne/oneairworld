import React from "react";
import ReactDOM from "react-dom/client";
// Must run before any module-level i18n.t() call (road/interior/project configs).
import "./i18n/i18n";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
