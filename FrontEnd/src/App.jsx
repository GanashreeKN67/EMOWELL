import { useEffect, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import Home from "./pages/Home";
import TextSupport from "./pages/TextSupport";
import AudioSupport from "./pages/AudioSupport";
import ImageSupport from "./pages/ImageSupport";
import ChatbotOverlay from "./components/chatbot/ChatbotOverlay";
import "./App.css";

function App() {
  const location = useLocation();
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  useEffect(() => {
    if (location.hash) {
      const targetId = location.hash.replace("#", "");
      window.requestAnimationFrame(() => {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }
  }, [location]);

  return (
    <div className="app">
      <Header theme={theme} toggleTheme={toggleTheme} />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/text" element={<TextSupport />} />
          <Route path="/audio" element={<AudioSupport />} />
          <Route path="/image" element={<ImageSupport />} />
        </Routes>
      </main>
      <Footer />
      <ChatbotOverlay />
    </div>
  );
}

export default App;
