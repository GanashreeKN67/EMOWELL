import { StrictMode } from "react";
import { BrowserRouter } from "react-router-dom";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ChatbotProvider } from "./context/ChatbotContext";
import { AuthProvider } from "./context/AuthContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ChatbotProvider>
          <App />
        </ChatbotProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
