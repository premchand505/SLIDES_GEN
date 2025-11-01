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
 * Represents the structure of a single PowerPoint slide.
 * This is the format we expect from the Gemini API.
 */
export type SlideContent = {
  title: string;
  content: string[]; // Array of bullet points or paragraphs
  layout: 'title' | 'content' | 'section' | 'twocolumn';
};

/**
 * Represents the entire presentation data.
 */
export type PPTData = {
  slides: SlideContent[];
  // metadata can be expanded later (e.g., theme, author)
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
  // We can add a 'reasoning' field if we want the AI to explain its changes
  reasoning?: string; 
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