const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const JSON_HEADERS = {
  "Content-Type": "application/json",
};

const MAX_TIMEOUT = 60000; // 60s for LLM processing
const MEDIA_TIMEOUT = 30000; // 30s for media uploads

const formatError = async (response) => {
  try {
    const payload = await response.json();
    if (payload && payload.status === "error") {
      return (
        payload.message || payload.detail || "The server reported an error."
      );
    }
    return (payload && payload.message) || response.statusText;
  } catch (error) {
    void error;
    return response.statusText || "Unable to reach the server.";
  }
};

const request = async (path, options = {}, customTimeout = MAX_TIMEOUT) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(function onTimeout() {
    controller.abort();
  }, customTimeout);

  try {
    const response = await fetch(
      `${API_BASE_URL}${path}`,
      Object.assign(
        {
          signal: controller.signal,
        },
        options
      )
    );

    if (!response.ok) {
      const message = await formatError(response);
      throw new Error(
        message || `Request failed with status ${response.status}`
      );
    }

    const contentType = response.headers.get("content-type") || "";
    if (contentType.indexOf("application/json") !== -1) {
      const payload = await response.json();
      if (payload && payload.status === "error") {
        throw new Error(payload.message || "The server reported an error.");
      }
      if (payload && payload.success === false) {
        throw new Error(
          payload.error || payload.detail || "The server reported an error."
        );
      }
      return payload;
    }

    return null;
  } catch (error) {
    if (error && error.name === "AbortError") {
      throw new Error("The request timed out. Please try again.");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const detectTextEmotion = async ({ text, userNote }) =>
  request("/emotion/text", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(
      Object.assign(
        {
          text,
        },
        userNote ? { user_note: userNote } : null
      )
    ),
  });

export const detectImageEmotion = async ({ file }) => {
  const formData = new FormData();
  formData.append("file", file);

  return request(
    "/emotion/image",
    {
      method: "POST",
      body: formData,
    },
    MEDIA_TIMEOUT
  );
};

export const detectAudioEmotion = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return request(
    "/emotion/audio",
    {
      method: "POST",
      body: formData,
    },
    MEDIA_TIMEOUT
  );
};

export const sendChatMessage = async ({ message, conversationId }) =>
  request("/assistant/chat", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(
      Object.assign(
        {
          message,
        },
        conversationId ? { conversation_id: conversationId } : null
      )
    ),
  });

export const clearChatConversation = async (conversationId) =>
  request(`/assistant/chat/clear/${conversationId}`, {
    method: "POST",
    headers: JSON_HEADERS,
  });

export const detectCombinedEmotion = async (config) => {
  const formData = new FormData();

  if (config && config.imageFile) {
    formData.append("image_file", config.imageFile);
  }
  if (config && config.audioFile) {
    formData.append("audio_file", config.audioFile);
  }
  if (config && config.textInput) {
    formData.append("text_input", config.textInput);
  }
  if (config && config.combineStrategy) {
    formData.append("combine_strategy", config.combineStrategy);
  }

  return request("/emotion/combined", {
    method: "POST",
    body: formData,
  });
};

export const getServerHealth = () => request("/health");

export const getModelStatus = () => request("/health/models");
