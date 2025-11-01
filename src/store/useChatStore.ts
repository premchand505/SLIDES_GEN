import { create } from 'zustand';
// Import ALL types from our new single source of truth
import type { ChatStore, ChatMessage, PPTData } from '@/types';

/* ---------- initial state ---------- */
const initialState = {
  messages: [] as ChatMessage[],
  pptData: null as PPTData | null,
  isLoading: false,
  error: null as string | null,
};

/* ---------- store ---------- */
export const useChatStore = create<ChatStore>((set) => ({
  ...initialState,

  addMessage: (message: ChatMessage) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  updatePPT: (newPPTData: PPTData) => set({ pptData: newPPTData }),

  setLoading: (isLoading: boolean) => set({ isLoading }),

  setError: (error: string | null) => set({ error }),

  clearChat: () => set(initialState),
}));

// --- ALL TYPE DEFINITIONS REMOVED FROM THE BOTTOM OF THIS FILE ---