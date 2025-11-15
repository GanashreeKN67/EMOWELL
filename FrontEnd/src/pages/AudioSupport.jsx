import { Link } from "react-router-dom";
import SupportHero from "../components/support/SupportHero";
import AudioSupportPanel from "../components/support/AudioSupportPanel";

const AudioSupport = () => (
  <div className="support-page">
    <SupportHero
      icon="microphone"
      eyebrow="Audio Support"
      title="Speak your truth without filters"
      description="Record or upload a voice note. The audio model identifies the leading emotions directly and returns the prediction."
    />
    <section className="support-page__content">
      <div className="container support-page__grid">
        <AudioSupportPanel />
        <aside className="support-page__aside">
          <h3>Need to switch it up?</h3>
          <p>
            When words become pictures or paragraphs, hop over to the other
            channels and let the corresponding models run their analysis.
          </p>
          <div className="support-page__links">
            <Link className="text-link" to="/text">
              Explore Text Support
            </Link>
            <Link className="text-link" to="/image">
              Explore Image Support
            </Link>
          </div>
        </aside>
      </div>
    </section>
  </div>
);

export default AudioSupport;
