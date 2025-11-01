import { create } from 'zustand';
import { ChatStore, ChatMessage, PPTData } from '@/types';

/**
 * The initial state for the chat store.
 */
const initialState = {
  messages: [],
  pptData: null,
  isLoading: false,
  error: null,
};

/**
 * Creates a persistent Zustand store for managing the chat state.
 */
export const useChatStore = create<ChatStore>((set, get) => ({
  ...initialState,

  /**
   * Adds a new message to the chat history.
   * @param message - The ChatMessage object to add.
   */
  addMessage: (message: ChatMessage) => {
    set((state) => ({
      messages: [...state.messages, message],
    }));
  },

  /**
   * Updates the entire PPT data structure.
   * @param newPPTData - The new PPTData object.
   */
  updatePPT: (newPPTData: PPTData) => {
    set({ pptData: newPPTData });
  },

  /**
   * Sets the global loading state (e.g., when waiting for AI).
   * @param isLoading - Boolean flag.
   */
  setLoading: (isLoading: boolean) => {
    set({ isLoading });
  },

  /**
   * Sets or clears the global error state.
   * @param error - An error message string or null.
   */
  setError: (error: string | null) => {
    set({ error });
  },

  /**
   * Resets the chat to its initial state.
   */
  clearChat: () => {
    set(initialState);
  },
}));