export const supportChannels = [
  {
    id: "text",
    title: "Text Support",
    description:
      "Share how you feel in words and receive direct feedback from the text analysis model.",
    icon: "chat",
    to: "/text",
  },
  {
    id: "audio",
    title: "Audio Support",
    description:
      "Record or upload a voice note when speaking feels easier than typing your thoughts. The audio model returns the prediction without using the chatbot.",
    icon: "microphone",
    to: "/audio",
  },
  {
    id: "image",
    title: "Image Support",
    description:
      "Upload a mood board, meme, or screenshot so the vision model can reflect the emotion you capture.",
    icon: "camera",
    to: "/image",
  },
];

export const moodOptions = [
  { id: "angry", label: "Angry", emoji: "😡" },
  { id: "confused", label: "Confused", emoji: "😕" },
  { id: "sad", label: "Sad", emoji: "😢" },
  { id: "happy", label: "Happy", emoji: "😊" },
  { id: "anxious", label: "Anxious", emoji: "😰" },
  { id: "stressed", label: "Stressed", emoji: "😣" },
  { id: "tired", label: "Tired", emoji: "🥱" },
  { id: "sick", label: "Sick", emoji: "🤒" },
  { id: "fear", label: "Fear", emoji: "😨" },
  { id: "loved", label: "Loved", emoji: "🥰" },
  { id: "thoughtful", label: "Thoughtful", emoji: "🤔" },
  { id: "confident", label: "Confident", emoji: "😌" },
];

export const evaluationQuestions = [
  {
    id: "thoughts",
    prompt:
      "How would you describe your thoughts when facing situations or objects that trigger fear?",
    options: [
      { value: "calm", label: "Calm and rational" },
      { value: "uneasy", label: "Occasionally uneasy" },
      { value: "anxious", label: "Frequently anxious" },
      { value: "avoidance", label: "Overwhelming fear, leading to avoidance" },
    ],
  },
  {
    id: "avoidance",
    prompt:
      "How often do you find yourself avoiding situations or objects due to intense fear?",
    options: [
      { value: "rare", label: "Rarely or never" },
      { value: "occasionally", label: "Occasionally" },
      { value: "frequently", label: "Frequently" },
      { value: "always", label: "Always, as it triggers significant fear" },
    ],
  },
  {
    id: "symptoms",
    prompt:
      "Do you experience physical symptoms such as rapid heartbeat or sweating when exposed to fear-inducing situations or objects?",
    options: [
      { value: "never", label: "Never" },
      { value: "occasionally", label: "Occasionally" },
      { value: "frequently", label: "Frequently" },
      { value: "always", label: "Always during fear-inducing situations" },
    ],
  },
  {
    id: "duration",
    prompt: "How long do these episodes of intense fear typically last?",
    options: [
      { value: "minutes", label: "A few minutes" },
      { value: "several", label: "Several minutes" },
      { value: "half-hour", label: "Half an hour or more" },
      { value: "varies", label: "Varies, leading to persistent avoidance" },
    ],
  },
  {
    id: "support",
    prompt:
      "Have you sought professional help or been diagnosed with specific phobias or related issues?",
    options: [
      { value: "yes", label: "Yes" },
      { value: "considering", label: "Considering it" },
      { value: "not-yet", label: "No, not yet" },
      { value: "no-plan", label: "No, and I don't plan to" },
    ],
  },
  {
    id: "impact",
    prompt:
      "Do these fear-induced avoidance behaviors impact your daily life, relationships, or activities?",
    options: [
      { value: "low", label: "Low impact" },
      { value: "moderate", label: "Moderate impact" },
      { value: "high", label: "High impact" },
      { value: "very-high", label: "Very high impact" },
    ],
  },
  {
    id: "concern",
    prompt:
      "Have others expressed concern about your experiences of persistent avoidance due to fear?",
    options: [
      { value: "never", label: "Never" },
      { value: "rarely", label: "Rarely" },
      { value: "sometimes", label: "Sometimes" },
      { value: "frequently", label: "Frequently" },
    ],
  },
  {
    id: "importance",
    prompt:
      "Do you believe that addressing and managing fear-induced avoidance behaviors is important for overall well-being?",
    options: [
      { value: "strongly-agree", label: "Strongly agree" },
      { value: "agree", label: "Agree" },
      { value: "neutral", label: "Neutral" },
      { value: "disagree", label: "Disagree" },
    ],
  },
  {
    id: "timeline",
    prompt:
      "How long have you been experiencing persistent avoidance behaviors due to fear?",
    options: [
      { value: "short", label: "A short period" },
      { value: "months", label: "Several months" },
      { value: "years", label: "Years" },
      {
        value: "none",
        label: "I haven't experienced persistent avoidance behaviors",
      },
    ],
  },
];

export const resources = [
  {
    id: "grounding",
    title: "Grounding Exercises",
    description:
      "Guided grounding prompts you can bookmark for quick calm in anxious moments.",
  },
  {
    id: "breathing",
    title: "Breathing Sessions",
    description:
      "Five-minute audio breathwork routines designed by therapists for emotional resets.",
  },
  {
    id: "journal",
    title: "Reflective Journaling",
    description:
      "Structured journaling templates that pair perfectly with the text support tab.",
  },
  {
    id: "community",
    title: "Peer Community",
    description:
      "Small moderated groups where you can share progress and cheer others on.",
  },
  {
    id: "insights",
    title: "Weekly Insights",
    description:
      "Evidence-backed articles exploring how to build resilient emotional routines.",
  },
];

export const infoLinks = [
  { label: "About EMOWELL", to: "/#about" },
  { label: "Support Options", to: "/#support" },
  { label: "Wellness Resources", to: "/#resources" },
  { label: "Emotion Assistant", to: "/text" },
];

export const footerLinks = [
  { label: "Home", to: "/#home" },
  { label: "About", to: "/#about" },
  { label: "Text Support", to: "/text" },
  { label: "Audio Support", to: "/audio" },
  { label: "Image Support", to: "/image" },
  { label: "Contact", to: "/#contact" },
];

export const contactItems = [
  { label: "+91 8088529551", icon: "phone" },
  { label: "ganashree99045@gmail.com", icon: "mail" },
];
