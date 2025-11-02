import { create } from 'zustand';
// --- FIX: 'partialize' is not imported. ---
import { persist, createJSONStorage } from 'zustand/middleware'; 
import type { ChatStore, ChatMessage, PPTData } from '@/types';

/* ---------- initial state ---------- */
const initialState = {
  messages: [] as ChatMessage[],
  pptData: null as PPTData | null,
  isLoading: false,
  error: null as string | null,
};

/* ---------- store ---------- */
export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      ...initialState,

      addMessage: (message: ChatMessage) =>
        set((state) => ({
          messages: [...state.messages, message],
        })),

      updatePPT: (newPPTData: PPTData) => set({ pptData: newPPTData }),

      setLoading: (isLoading: boolean) => set({ isLoading }),

      setError: (error: string | null) => set({ error }),

      clearChat: () => set(initialState),
    }),
    {
      name: 'ai-ppt-chat-storage', 
      storage: createJSONStorage(() => localStorage),

      // --- FIX: 'partialize' is a property here. ---
      partialize: (state) => ({
        messages: state.messages,
        pptData: state.pptData,
      }),
    }
  )
);