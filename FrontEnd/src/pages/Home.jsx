import { useState } from "react";
import { Link } from "react-router-dom";
import SupportOverview from "../components/home/SupportOverview";
import ResourcesSlider from "../components/home/ResourcesSlider";
import ContactSection from "../components/home/ContactSection";
import { resources } from "../data/supportData";
import { useChatbot } from "../context/ChatbotContext";

const Home = () => {
  const [resourceIndex, setResourceIndex] = useState(0);
  const { openChatbot } = useChatbot();

  const handleNextResource = () => {
    setResourceIndex((prev) => (prev + 1) % resources.length);
  };

  const handlePrevResource = () => {
    setResourceIndex(
      (prev) => (prev - 1 + resources.length) % resources.length
    );
  };

  return (
    <div className="home-page">
      <section className="hero" id="home">
        <div className="hero__overlay" />
        <div className="hero__content container">
          <h1>EMOWELL Medical Center</h1>
          <p>
            Accessible medical support blended with empathic digital guidance.
            Choose text, audio, or image channels and get care the way you
            prefer.
          </p>
          <div className="cta-group">
            <button
              type="button"
              className="btn btn--primary"
              onClick={openChatbot}
            >
              Open Emotion Assistant
            </button>
            <Link className="btn btn--outline" to="/#contact">
              Contact Our Team
            </Link>
          </div>
        </div>
      </section>

      <section className="about-section" id="about">
        <div className="container about-section__grid">
          <div className="about-section__content">
            <p className="about-section__eyebrow">About EMO-WELL</p>
            <h2>AI-powered mental wellness for everyone.</h2>
            <p>
              EMO-WELL is an AI-powered mental wellness platform designed to
              help individuals understand and manage their emotions through
              advanced multimodal emotion recognition. By analyzing text, audio,
              and facial expressions, EMO-WELL provides accurate emotional
              insights and delivers supportive, CBT-based guidance tailored to
              each user's needs.
            </p>
            <p>
              Our goal is to make mental health support accessible,
              confidential, and stigma-free. EMO-WELL offers a safe space where
              users can express their feelings, receive instant emotional
              feedback, and access personalized coping strategies anytime,
              anywhere.
            </p>
            <p>
              We aim to bridge the gap between individuals and emotional
              well-being through intelligent, compassionate, and user-friendly
              technology.
            </p>
          </div>
          <div className="about-section__card">
            <h3>Care Snapshot</h3>
            <p>
              EMO-WELL is designed to understand your feelings the moment you
              express them - whether through your voice, your face or your
              words. It offers gentle, personalized guidance to promote
              emotional balance anytime, anywhere.
            </p>
            <div className="about-stats">
              <div className="about-stats__item">
                <span className="about-stats__value">Multimodal AI</span>
                <span className="about-stats__label">
                  Text - Audio - Image emotion detection
                </span>
              </div>
              <div className="about-stats__item">
                <span className="about-stats__value">24/7</span>
                <span className="about-stats__label">Chatbot availability</span>
              </div>
              <div className="about-stats__item">
                <span className="about-stats__value">2-3s</span>
                <span className="about-stats__label">
                  Average response for emotional insights
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SupportOverview />

      <ResourcesSlider
        index={resourceIndex}
        onPrev={handlePrevResource}
        onNext={handleNextResource}
      />

      <ContactSection />
    </div>
  );
};

export default Home;
