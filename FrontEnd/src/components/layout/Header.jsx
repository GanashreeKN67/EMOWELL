import { Link, useLocation } from "react-router-dom";
import Icon from "../common/Icon";
import { useChatbot } from "../../context/ChatbotContext";
import { useAuth } from "../../context/AuthContext";

const baseNavLinks = [
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
    label: "Data",
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

const privateNavLinks = [
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
    label: "Dashboard",
    to: "/dashboard",
    type: "route",
  },
];

const Header = ({ theme, toggleTheme }) => {
  const location = useLocation();
  const { openChatbot } = useChatbot();
  const { isAuthenticated, logout } = useAuth();

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

  const linksToRender = isAuthenticated
    ? baseNavLinks.concat(privateNavLinks)
    : baseNavLinks;

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
            {linksToRender.map((link) => (
              <li key={link.label}>
                <Link to={link.to} className={resolveClassName(link)}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="header__actions">
          <button
            type="button"
            className="btn btn--theme"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
          {isAuthenticated ? (
            <>
              <button type="button" className="btn btn--ghost" onClick={logout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link className="btn btn--outline" to="/login">
                Log in
              </Link>
              <Link className="btn btn--ghost" to="/register">
                Join now
              </Link>
            </>
          )}
          <button
            type="button"
            className="btn btn--pill"
            onClick={openChatbot}
            disabled={!isAuthenticated}
            title={
              isAuthenticated
                ? "Open EMOBOT assistant"
                : "Log in to start a conversation"
            }
          >
            {isAuthenticated ? "EMOBOT" : "EMOBOT (locked)"}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
