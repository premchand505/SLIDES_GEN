'use client'; 

import { ChatInterface } from '@/components/ChatInterface';
import { PPTPreview } from '@/components/PPTPreview';
import { useChatStore } from '@/store/useChatStore';
import { AnimatePresence, motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const DownloadButton = dynamic(
  () => import('@/components/DownloadButton').then((mod) => mod.DownloadButton),
  { 
    ssr: false, 
    loading: () => <div className="h-9 w-28 rounded-md bg-secondary animate-pulse" />
  }
);

export function MainAppLayout() {
  // We only get the data we need for layout decisions
  const { pptData, clearChat } = useChatStore();
  const hasData = pptData && pptData.slides && pptData.slides.length > 0;

  const handleNewChat = () => {
    // Reloading is the cleanest way to reset both Zustand and useChat
    clearChat();
    window.location.reload();
  };

  return (
    <main className="flex h-screen w-full overflow-hidden">
      <AnimatePresence mode="wait">
        {!hasData ? (
          // STATE 1: Initial (single column)
          // We render ChatInterface directly. It will decide
          // to show InitialPrompt.
          <motion.div
            key="initial"
            className="w-full h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <ChatInterface />
          </motion.div>
        ) : (
          // STATE 2: Two-Column Chat Layout
          <motion.div 
            key="chat-layout"
            className="flex w-full h-full overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Column 1: Chat Interface */}
            <div className="flex flex-col h-full w-full flex-1 border-r max-w-2xl overflow-hidden">
              <header className="flex-shrink-0 flex items-center justify-between p-4 border-b bg-background">
                <h1 className="text-xl font-semibold">AI PPT Chat</h1>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleNewChat} // Use the new handler
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Chat
                </Button>
              </header>
              <div className="flex-1 overflow-hidden">
                <ChatInterface />
              </div>
            </div>

            {/* Column 2: PPT Preview */}
            <div className="flex flex-col h-full flex-1 overflow-hidden">
              <header className="flex-shrink-0 flex items-center justify-between p-4 border-b bg-background">
                <h2 className="text-xl font-semibold">Preview</h2>
                <DownloadButton />
              </header>
              <div className="flex-1 overflow-hidden">
                <PPTPreview />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}