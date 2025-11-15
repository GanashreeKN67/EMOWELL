import { Link, useLocation } from "react-router-dom";
import Icon from "../common/Icon";
import { useChatbot } from "../../context/ChatbotContext";

const navLinks = [
  {
    label: "Home",
    to: { pathname: "/", hash: "#home" },
    type: "hash",
    hash: "home",
  },
  {
    label: "About",
    to: { pathname: "/", hash: "#about" },
    type: "hash",
    hash: "about",
  },
  {
    label: "Text",
    to: "/text",
    type: "route",
  },
  {
    label: "Audio",
    to: "/audio",
    type: "route",
  },
  {
    label: "Image",
    to: "/image",
    type: "route",
  },
  {
    label: "Datasets",
    to: "/datasets",
    type: "route",
  },
  {
    label: "Contact",
    to: { pathname: "/", hash: "#contact" },
    type: "hash",
    hash: "contact",
  },
];

const Header = ({ theme, toggleTheme }) => {
  const location = useLocation();
  const { openChatbot } = useChatbot();

  const resolveClassName = (link) => {
    if (link.type === "route") {
      return location.pathname === link.to ? "is-active" : undefined;
    }

    const currentHash = location.hash.replace("#", "");
    if (link.hash === "home") {
      const isHome =
        location.pathname === "/" && (!currentHash || currentHash === "home");
      return isHome ? "is-active" : undefined;
    }
    const isMatch = location.pathname === "/" && currentHash === link.hash;
    return isMatch ? "is-active" : undefined;
  };

  return (
    <header className="site-header">
      <div className="container header__inner">
        <Link className="brand" to="/">
          <span className="brand__icon">
            <Icon type="scope" />
          </span>
          <span className="brand__name">EMOWELL</span>
        </Link>
        <nav className="site-nav" aria-label="Primary">
          <ul>
            {navLinks.map((link) => (
              <li key={link.label}>
                <Link to={link.to} className={resolveClassName(link)}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button
            type="button"
            className="btn btn--theme"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
          <button type="button" className="btn btn--pill" onClick={openChatbot}>
            Open Emotion Assistant
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
