// store/useChatStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ChatMessage, PPTData } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export type ChatSession = {
  id: string;
  title: string;
  messages: ChatMessage[];
  pptData: PPTData | null;
  createdAt: Date;
  updatedAt: Date;
};

type ChatState = {
  currentSessionId: string | null;
  messages: ChatMessage[];
  pptData: PPTData | null;
  isLoading: boolean;
  error: string | null;
  sessions: ChatSession[];
};

type ChatActions = {
  addMessage: (message: ChatMessage) => void;
  updatePPT: (newPPTData: PPTData) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearChat: () => void;
  createNewSession: () => string;
  loadSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
  updateSessionTitle: (sessionId: string, title: string) => void;
};

export type ChatStore = ChatState & ChatActions;

const initialState: ChatState = {
  currentSessionId: null,
  messages: [],
  pptData: null,
  isLoading: false,
  error: null,
  sessions: [],
};

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      addMessage: (message: ChatMessage) => {
        set((state) => {
          const sessionId = state.currentSessionId;
          if (!sessionId) {
            console.warn('No active session when adding message');
            return state;
          }

          const newMessages = [...state.messages, message];

          // Auto-title only on first user message
          let title = state.sessions.find((s) => s.id === sessionId)?.title;
          if (!title && message.role === 'user' && state.messages.length === 0) {
            title = message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '');
          }

          const updatedSessions = state.sessions.map((session) =>
            session.id === sessionId
              ? {
                  ...session,
                  messages: newMessages,
                  title: title ?? session.title,
                  updatedAt: new Date(),
                }
              : session
          );

          return {
            messages: newMessages,
            sessions: updatedSessions,
          };
        });
      },

      updatePPT: (newPPTData: PPTData) => {
        set((state) => {
          const sessionId = state.currentSessionId;
          if (!sessionId) return state;

          const updatedSessions = state.sessions.map((session) =>
            session.id === sessionId
              ? { ...session, pptData: newPPTData, updatedAt: new Date() }
              : session
          );

          return { pptData: newPPTData, sessions: updatedSessions };
        });
      },

      setLoading: (isLoading: boolean) => set({ isLoading }),
      setError: (error: string | null) => set({ error }),

      clearChat: () => {
        set({
          currentSessionId: null,
          messages: [],
          pptData: null,
          error: null,
        });
      },

      /** Returns the new session id */
      createNewSession: () => {
        const newSession: ChatSession = {
          id: uuidv4(),
          title: 'New Chat',
          messages: [],
          pptData: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Use functional set to update sessions from previous state
        set((state) => ({
          currentSessionId: newSession.id,
          messages: [],
          pptData: null,
          error: null,
          sessions: [newSession, ...state.sessions],
        }));

        return newSession.id;
      },

      loadSession: (sessionId: string) => {
        const session = get().sessions.find((s) => s.id === sessionId);
        if (session) {
          set({
            currentSessionId: session.id,
            messages: session.messages,
            pptData: session.pptData,
            error: null,
          });
        }
      },

      deleteSession: (sessionId: string) => {
        set((state) => {
          const updatedSessions = state.sessions.filter((s) => s.id !== sessionId);
          if (state.currentSessionId === sessionId) {
            return {
              currentSessionId: null,
              messages: [],
              pptData: null,
              sessions: updatedSessions,
            };
          }
          return { sessions: updatedSessions };
        });
      },

      updateSessionTitle: (sessionId: string, title: string) => {
        set((state) => ({
          sessions: state.sessions.map((session) =>
            session.id === sessionId
              ? { ...session, title, updatedAt: new Date() }
              : session
          ),
        }));
      },
    }),
    {
      name: 'ai-ppt-chat-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentSessionId: state.currentSessionId,
        messages: state.messages,
        pptData: state.pptData,
        sessions: state.sessions,
      }),
    }
  )
);