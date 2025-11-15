import Icon from "../common/Icon";
import { contactItems } from "../../data/supportData";
import { useChatbot } from "../../context/ChatbotContext";

const ContactSection = () => {
  const { openChatbot } = useChatbot();

  return (
    <section className="contact-section" id="contact">
      <div className="container contact-section__grid">
        <div className="contact-section__info">
          <h2>Need a Human Touch?</h2>
          <p>
            Our care desk is ready to connect you with clinicians, counsellors,
            or community programmes. If you prefer to start with the emotion
            assistant, you can still reach out to our team anytime.
          </p>
          <ul>
            {contactItems.map((item) => (
              <li key={item.label}>
                <Icon type={item.icon} />
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="btn btn--primary"
            onClick={openChatbot}
          >
            Open Emotion Assistant
          </button>
        </div>
        <form className="contact-section__form">
          <div className="form-row">
            <label htmlFor="contact-name">Full name</label>
            <input
              id="contact-name"
              name="contact-name"
              type="text"
              placeholder="Alex Taylor"
            />
          </div>
          <div className="form-row">
            <label htmlFor="contact-email">Email</label>
            <input
              id="contact-email"
              name="contact-email"
              type="email"
              placeholder="alex@email.com"
            />
          </div>
          <div className="form-row">
            <label htmlFor="contact-message">How can we help?</label>
            <textarea
              id="contact-message"
              name="contact-message"
              rows="4"
              placeholder="Share a prompt, worry, or goal for today."
            />
          </div>
          <button type="submit" className="btn btn--primary">
            Send message
          </button>
        </form>
      </div>
    </section>
  );
};

export default ContactSection;
