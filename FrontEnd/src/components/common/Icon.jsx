const Icon = ({ type }) => {
  const common = {
    className: "icon",
    role: "img",
    "aria-hidden": true,
    focusable: false,
  };

  switch (type) {
    case "chat":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path d="M4 3h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-4.6l-3.6 3.6a1 1 0 0 1-1.4 0L7.8 16H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm2 5v2h12V8H6zm0-3v2h12V5H6z" />
        </svg>
      );
    case "microphone":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm5-3a1 1 0 0 1 2 0 7 7 0 0 1-6 6.92V21h3a1 1 0 0 1 0 2H8a1 1 0 0 1 0-2h3v-3.08A7 7 0 0 1 5 11a1 1 0 0 1 2 0 5 5 0 0 0 10 0z" />
        </svg>
      );
    case "camera":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path d="M9.2 4 7.7 6H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-3.7L14.8 4H9.2zM12 18a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm0-2.5A1.5 1.5 0 1 0 12 13a1.5 1.5 0 0 0 0 3z" />
        </svg>
      );
    case "location":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path d="M12 2a7 7 0 0 0-7 7c0 4.4 7 13 7 13s7-8.6 7-13a7 7 0 0 0-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
        </svg>
      );
    case "phone":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path d="M16.5 21a8.2 8.2 0 0 1-7.2-4.1c-1.4-2.3-2-3.5-3.6-6.6C4.1 7.3 5 5 6.3 3.6l2.2.6 1 4.5-1.8 1.3c.6 1.3 1 2.1 1.7 3.3.9 1.6 1.9 3 3.4 4l1.7-1.8 4.5 1-1.1 2.3A4.7 4.7 0 0 1 16.5 21z" />
        </svg>
      );
    case "mail":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm8 7L4 6v12h16V6l-8 5z" />
        </svg>
      );
    case "scope":
      return (
        <svg {...common} viewBox="0 0 24 24">
          <path d="M9 2v2h2v10.1a4 4 0 1 0 2 0V4h2V2H9zm3 16a2 2 0 1 1 .001 4.001A2 2 0 0 1 12 18zm7-9a3 3 0 0 1-2.6-1.5l-1.7.9A5 5 0 0 0 19 11h2a3 3 0 0 1-2 2.8V16h-2v-2.2A3 3 0 0 1 19 9z" />
        </svg>
      );
    default:
      return null;
  }
};

export default Icon;
