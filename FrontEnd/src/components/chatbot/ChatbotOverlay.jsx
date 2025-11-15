import { useEffect, useRef, useState } from "react";
import { useChatbot } from "../../context/ChatbotContext";
import { sendChatMessage } from "../../services/apiClient";
import Icon from "../common/Icon";
import ReactMarkdown from "react-markdown";

const ChatbotOverlay = () => {
  const { isOpen, closeChatbot } = useChatbot();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [conversationId, setConversationId] = useState(null);
  const scrollAnchorRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setMessage("");
      setErrorMessage("");
      setIsLoading(false);
      return;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeChatbot();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeChatbot]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollAnchorRef.current) {
      scrollAnchorRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || isLoading) {
      return;
    }

    const timestamp = Date.now();
    const userEntry = {
      id: `${timestamp}-user`,
      role: "user",
      content: trimmed,
    };

    setMessages((prev) => prev.concat(userEntry));
    setMessage("");
    setErrorMessage("");
    setIsLoading(true);

    try {
      const payload = await sendChatMessage({
        message: trimmed,
        conversationId,
      });

      if (payload && payload.conversation_id) {
        setConversationId(payload.conversation_id);
      }

      const assistantText = payload?.assistant_message || "";

      const assistantEntry = {
        id: `${timestamp}-assistant`,
        role: "assistant",
        content: assistantText || "I'm here whenever you're ready to continue.",
      };

      setMessages((prev) => prev.concat(assistantEntry));
    } catch (error) {
      const fallbackMessage =
        error?.message || "I couldn't send that message. Please try again.";
      const assistantEntry = {
        id: `${Date.now()}-error`,
        role: "assistant",
        content: fallbackMessage,
      };
      setMessages((prev) => prev.concat(assistantEntry));
      setErrorMessage(fallbackMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      closeChatbot();
    }
  };

  return (
    <div
      className="chatbot-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Emotion assistant"
      onClick={handleOverlayClick}
    >
      <div className="chatbot-overlay__backdrop" />
      <div className="chatbot-overlay__panel">
        <header className="chatbot-overlay__header">
          <div className="chatbot-overlay__title">
            <span className="chatbot-overlay__avatar" aria-hidden="true">
              <Icon type="chat" />
            </span>
            <div>
              <h2>EMOBOT</h2>
              <p>
                Ask anything and keep the conversation going as long as you
                like.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="chatbot-overlay__close"
            onClick={closeChatbot}
          >
            Close
          </button>
        </header>
        <div className="chatbot-overlay__body">
          <div
            className="chatbot-overlay__messages"
            role="log"
            aria-live="polite"
          >
            {messages.length === 0 ? (
              <div className="chatbot-overlay__placeholder">
                <h3>How can I help today?</h3>
                <p>
                  Share a thought, worry, or win and I will respond right away.
                </p>
              </div>
            ) : null}
            {messages.map((item) => {
              return (
                <div
                  key={item.id}
                  className={`chatbot-overlay__message chatbot-overlay__message--${item.role}`}
                >
                  <div className="markdown-content">
                    <ReactMarkdown>{item.content}</ReactMarkdown>
                  </div>
                </div>
              );
            })}
            {isLoading ? (
              <div className="chatbot-overlay__loading">
                <span className="analysis-status__spinner" aria-hidden="true" />
                Thinking through your message...
              </div>
            ) : null}
            <div ref={scrollAnchorRef} />
          </div>
          {errorMessage ? (
            <div className="chatbot-overlay__error">{errorMessage}</div>
          ) : null}
        </div>
        <form className="chatbot-overlay__form" onSubmit={handleSubmit}>
          <textarea
            id="chatbot-message"
            ref={inputRef}
            rows="3"
            placeholder="Send a message..."
            aria-label="Message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
          <div className="chatbot-overlay__actions">
            <button
              type="submit"
              className="btn btn--primary"
              disabled={isLoading}
            >
              Send
            </button>
            <button
              type="button"
              className="btn btn--outline"
              onClick={closeChatbot}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatbotOverlay;
