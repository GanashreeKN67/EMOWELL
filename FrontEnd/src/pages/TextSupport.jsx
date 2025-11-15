import { Link } from "react-router-dom";
import SupportHero from "../components/support/SupportHero";
import TextSupportPanel from "../components/support/TextSupportPanel";

const TextSupport = () => (
  <div className="support-page">
    <SupportHero
      icon="chat"
      eyebrow="Text Support"
      title="Share how you feel in your own words"
      description="Type what's on your mind and let the text model surface the underlying emotion. Switch modes to self-evaluate when you want deeper insight."
    />
    <section className="support-page__content">
      <div className="container support-page__grid">
        <TextSupportPanel />
        <aside className="support-page__aside">
          <h3>Prefer another format?</h3>
          <p>
            Try recording a voice note or upload an image if that feels easier
            today. You can swap channels at any time.
          </p>
          <div className="support-page__links">
            <Link className="text-link" to="/audio">
              Explore Audio Support
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

export default TextSupport;
