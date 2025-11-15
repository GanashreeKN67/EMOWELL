import { StrictMode } from "react";
import { BrowserRouter } from "react-router-dom";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ChatbotProvider } from "./context/ChatbotContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ChatbotProvider>
        <App />
      </ChatbotProvider>
    </BrowserRouter>
  </StrictMode>
);
