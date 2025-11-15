import { Link } from "react-router-dom";
import SupportHero from "../components/support/SupportHero";
import ImageSupportPanel from "../components/support/ImageSupportPanel";

const ImageSupport = () => (
  <div className="support-page">
    <SupportHero
      icon="camera"
      eyebrow="Image Support"
      title="Let visuals tell the story"
      description="Upload images, screenshots, or mood boards. The vision model interprets the tone and reports the detected emotion automatically."
    />
    <section className="support-page__content">
      <div className="container support-page__grid">
        <ImageSupportPanel />
        <aside className="support-page__aside">
          <h3>Want to write or speak?</h3>
          <p>
            When you're ready, continue the journey in the text or audio
            channels. Each model stays independent, so you always know where the
            predictions come from.
          </p>
          <div className="support-page__links">
            <Link className="text-link" to="/text">
              Explore Text Support
            </Link>
            <Link className="text-link" to="/audio">
              Explore Audio Support
            </Link>
          </div>
        </aside>
      </div>
    </section>
  </div>
);

export default ImageSupport;
