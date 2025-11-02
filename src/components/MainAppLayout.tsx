// components/MainAppLayout.tsx
'use client';

import { useEffect } from 'react';
import { ChatInterface } from '@/components/ChatInterface';
import { PPTPreview } from '@/components/PPTPreview';
import { InitialPrompt } from '@/components/InitialPrompt';
import { useChatStore } from '@/store/useChatStore';
import { AnimatePresence, motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Plus, Home } from 'lucide-react';
import { AppShell } from '@/components/Appshell';
import { v4 as uuidv4 } from 'uuid';

const DownloadButton = dynamic(
  () => import('@/components/DownloadButton').then(mod => mod.DownloadButton),
  { ssr: false, loading: () => <div className="h-9 w-28 rounded-md bg-secondary animate-pulse" /> }
);
export function MainAppLayout() {
  const {
    pptData,
    messages,
    currentSessionId,
    createNewSession,
    addMessage,
    isLoading,
  } = useChatStore();
// 1. Safe length check – eliminates TS error
  const hasData = (pptData?.slides?.length ?? 0) > 0;
const hasMessages = messages.length > 0;

  // Create a session on first mount if none exists
  useEffect(() => {
    if (!currentSessionId && !isLoading) {
      createNewSession();
    }
  }, [currentSessionId, createNewSession, isLoading]);
// 2. First-prompt handler – guarantees the session exists before adding the message
  const handleFirstSubmit = (topic: string) => {
  const trimmed = topic.trim();
if (!trimmed || isLoading) return;

  const store = useChatStore.getState();

  // Ensure session exists
  let sessionId = store.currentSessionId;
if (!sessionId) {
    sessionId = store.createNewSession(); // This updates state IMMEDIATELY
  }

  // Now safe to add message
  const userMsg = {
    id: uuidv4(),
    role: 'user' as const,
    content: trimmed,
    timestamp: new Date(),
  };
store.addMessage(userMsg);
};

  const handleNewChat = () => {
    createNewSession();
  };
return (
    <AppShell>
      <AnimatePresence mode="wait">
        {/* ----- Initial Prompt (no messages) ----- */}
        {!hasMessages ? (
          <motion.div
            key="initial"
            className="h-full w-full flex items-center justify-center"
            initial={{ opacity: 0 }}
          
  animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <InitialPrompt onSubmit={handleFirstSubmit} isLoading={isLoading} />
          </motion.div>
        ) : /* ----- Chat only (no PPT yet) ----- */
        !hasData ? (
          <motion.div
       
     key="chat-only"
            className="flex flex-col h-full w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <header className="shrink-0 flex items-center justify-between p-4 border-b bg-background">
      
        <h2 className="text-lg font-medium">Chat</h2>
              <Button variant="outline" size="sm" onClick={handleNewChat}>
                <Home className="h-4 w-4 mr-2 md:hidden" />
                <span className="hidden md:inline">New Chat</span>
              </Button>
            </header>
       
     <div className="flex-1 overflow-hidden">
              <ChatInterface />
            </div>
          </motion.div>
        ) : (
          /* ----- Chat + Preview ----- */
          <motion.div
            key="chat-layout"
        
    className="flex h-full w-full overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Chat column */}
            <div className="flex flex-col h-full w-full flex-1 border-r max-w-2xl overflow-hidden">
   
           <header className="shrink-0 flex items-center justify-between p-4 border-b bg-background">
                <h2 className="text-lg font-medium">Chat</h2>
                <Button variant="outline" size="sm" onClick={handleNewChat}>
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="hidden md:inline">New Chat</span>
  
              </Button>
              </header>
              <div className="flex-1 overflow-hidden">
                <ChatInterface />
              </div>
            </div>

            {/* Preview column – hidden on small screens */}
            <div className="hidden lg:flex flex-col h-full flex-1 overflow-hidden">
              <header className="shrink-0 flex items-center justify-between p-4 border-b bg-background">
                <h2 className="text-lg font-medium">Preview</h2>
                <DownloadButton />
              </header>
     
         <div className="flex-1 overflow-hidden">
                <PPTPreview />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  );
}