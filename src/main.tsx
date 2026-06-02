import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";
import { KitchenProvider } from "./context/KitchenContext";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <KitchenProvider>
      <HashRouter>
        <App />
      </HashRouter>
    </KitchenProvider>
  </StrictMode>,
);
