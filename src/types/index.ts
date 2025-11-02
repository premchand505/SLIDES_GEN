/**
 * Represents the structure of a single PowerPoint slide.
 * This is the master type used by the AI, the store, and the generator.
 */
export type SlideDesign = {
  backgroundColor: string; // e.g., "#FFFFFF"
  textColor: string;       // e.g., "#333333"
  titleFont: string;       // e.g., "Arial"
  bodyFont: string;        // e.g., "Calibri"
  accentColor: string;     // e.g., "#0078D4"
};

export type SlideContent = {
  // Use a strict union for AI generation, but allow string for flexibility
  layout: 'title' | 'content' | 'section' | 'twocolumn' | string;
  title: string;      // Title is required
  subtitle?: string;  // Subtitle is optional (for title slides)
  content: string[];  // Array of bullet points or paragraphs
  design: SlideDesign;
};

/**
 * Represents the entire presentation data.
 */
export type PPTData = {
  title?: string; // Optional overall presentation title
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
 * Represents the state of our chat application, managed by Zustand.
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