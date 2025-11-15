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
          <h1>Remedic Medical Center</h1>
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
            <p className="about-section__eyebrow">Trusted For Over 20 Years</p>
            <h2>
              Whole-person healthcare paired with modern digital companions.
            </h2>
            <p>
              Our clinicians, therapists, and digital care specialists
              collaborate to close the gap between appointments. The Remedic
              ecosystem keeps your wellbeing front of mind whether you reach out
              in person or through the emotion assistant.
            </p>
            <ul>
              <li>
                Integrated clinical, mental health, and wellness programmes
              </li>
              <li>
                AI-assisted triage that respects privacy and data security
              </li>
              <li>24/7 access to guided exercises, insights, and community</li>
            </ul>
          </div>
          <div className="about-section__card">
            <h3>Care Snapshot</h3>
            <p>
              120+ specialists deliver care across cardiology, paediatrics,
              oncology, physiotherapy, and mental health, supported by a digital
              experience designed for every mood and moment.
            </p>
            <div className="about-stats">
              <div>
                <span className="about-stats__value">98%</span>
                <span className="about-stats__label">Patient satisfaction</span>
              </div>
              <div>
                <span className="about-stats__value">24/7</span>
                <span className="about-stats__label">Chatbot availability</span>
              </div>
              <div>
                <span className="about-stats__value">35k</span>
                <span className="about-stats__label">Community members</span>
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
