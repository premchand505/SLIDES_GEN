/**
 * Represents the structure of a single PowerPoint slide.
 */
export type SlideDesign = {
  backgroundColor: string;
  textColor: string;
  titleFont: string;
  bodyFont: string;
  accentColor: string;
};

export type SlideContent = {
  layout: 'title' | 'content' | 'section' | 'twocolumn' | string;
  title: string;
  subtitle?: string;
  content?: string[];
  design: SlideDesign;
};

export type ThinkingStep = {
  type: 'thought' | 'action';
  tool?: 'webSearch' | 'readWebsite';
  content: string;
  isStreaming?: boolean; // For live streaming indicator
};

/**
 * Represents the entire presentation data.
 */
export type PPTData = {
  title?: string;
  slides: SlideContent[];
  globalTheme?: SlideDesign;
};

/**
 * Represents a single message in the chat interface.
 */
export type ChatMessage = {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
  thinkingStep?: ThinkingStep; // NEW: Store thinking step data for styling
};

/**
 * Defines the possible actions our AI can return.
 */
export type AIAction = 'create' | 'edit' | 'add' | 'delete' | 'reorder';

/**
 * The expected JSON response structure from the Gemini API.
 */
export type GeminiResponse = {
  action: AIAction;
  slides: SlideContent[];
  reasoning?: string;
  globalTheme?: SlideDesign;
};

/**
 * Represents the state of our chat application.
 */
export type ChatState = {
  messages: ChatMessage[];
  pptData: PPTData | null;
  isLoading: boolean;
  error: string | null;
};

/**
 * Represents the actions available to modify the chat state.
 */
export type ChatActions = {
  addMessage: (message: ChatMessage) => void;
  updatePPT: (newPPTData: PPTData) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearChat: () => void;
};

/**
 * Combined type for the Zustand store.
 */
export type ChatStore = ChatState & ChatActions;