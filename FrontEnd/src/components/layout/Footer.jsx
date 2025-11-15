import { Link } from "react-router-dom";
import Icon from "../common/Icon";
import { contactItems, footerLinks, infoLinks } from "../../data/supportData";
import { useChatbot } from "../../context/ChatbotContext";

const Footer = () => {
  const { openChatbot } = useChatbot();

  return (
    <footer className="site-footer" id="footer">
      <div className="container footer__grid">
        <div className="footer__column">
          <div className="brand">
            <span className="brand__icon">
              <Icon type="scope" />
            </span>
            <span className="brand__name">Remedic</span>
          </div>
          <p>
            A trusted healthcare partner delivering evidence-based medicine,
            compassionate support, and lifelong wellness programmes.
          </p>
          <div className="footer__social">
            <a href="https://twitter.com" aria-label="Twitter">
              <span>Tw</span>
            </a>
            <a href="https://facebook.com" aria-label="Facebook">
              <span>Fb</span>
            </a>
            <a href="https://instagram.com" aria-label="Instagram">
              <span>Ig</span>
            </a>
          </div>
        </div>
        <div className="footer__column">
          <h4>Information</h4>
          <ul>
            {infoLinks.map((item) => (
              <li key={item.label}>
                {item.label === "Emotion Assistant" ? (
                  <button
                    type="button"
                    className="footer__link-button"
                    onClick={openChatbot}
                  >
                    {item.label}
                  </button>
                ) : (
                  <Link to={item.to}>{item.label}</Link>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div className="footer__column">
          <h4>Site Links</h4>
          <ul>
            {footerLinks.map((item) => (
              <li key={item.label}>
                <Link to={item.to}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="footer__column">
          <h4>Have a Question?</h4>
          <ul className="footer__contact">
            {contactItems.map((item) => (
              <li key={item.label}>
                <Icon type={item.icon} />
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="footer__bottom">
        <p>
          © {new Date().getFullYear()} Remedic Medical Center. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
