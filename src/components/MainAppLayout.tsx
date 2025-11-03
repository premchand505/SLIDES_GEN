// components/MainAppLayout.tsx
'use client';

import { useEffect, useState } from 'react';
import { ChatInterface } from '@/components/ChatInterface';
import { PPTPreview } from '@/components/PPTPreview';
import { InitialPrompt } from '@/components/InitialPrompt';
// ✅ REMOVED: UserProfileSetup import (not used in this component)
import { useChatStore } from '@/store/useChatStore';
import { AnimatePresence, motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Plus, Home, Presentation } from 'lucide-react';
import { AppShell } from '@/components/Appshell';
import { useGeneration } from '@/hooks/useGeneration';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

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
    isLoading,
  } = useChatStore();

  const { handleGenerate } = useGeneration();
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);

  const hasData = (pptData?.slides?.length ?? 0) > 0;
  const hasMessages = messages.length > 0;

  useEffect(() => {
    if (!currentSessionId && !isLoading) {
      createNewSession();
    }
  }, [currentSessionId, createNewSession, isLoading]);

  const handleFirstSubmit = (topic: string) => {
    const trimmed = topic.trim();
    if (!trimmed || isLoading) return;

    const store = useChatStore.getState();
    let sessionId = store.currentSessionId;
    if (!sessionId) {
      sessionId = store.createNewSession();
    }

    handleGenerate(trimmed);
  };

  const handleNewChat = () => {
    setMobilePreviewOpen(false);
    createNewSession();
  };

  return (
    <AppShell>
      <AnimatePresence mode="wait">
        {/* ===== INITIAL PROMPT (No messages) ===== */}
        {!hasMessages ? (
          <motion.div
            key="initial"
            className="h-full w-full flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <InitialPrompt onSubmit={handleFirstSubmit} isLoading={isLoading} />
          </motion.div>
        ) : /* ===== CHAT ONLY (No slides yet) ===== */
        !hasData ? (
          <motion.div
            key="chat-only"
            className="flex flex-col h-full w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <header className="shrink-0 flex items-center justify-between p-3 md:p-4 border-b bg-background">
              <h2 className="text-base md:text-lg font-medium">Chat</h2>
              <Button variant="outline" size="sm" onClick={handleNewChat}>
                <Home className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">New Chat</span>
              </Button>
            </header>
            <div className="flex-1 overflow-hidden">
              <ChatInterface />
            </div>
          </motion.div>
        ) : (
          /* ===== DESKTOP: Chat + Preview Side-by-Side ===== */
          /* ===== MOBILE: Chat with Floating Preview Button ===== */
          <motion.div
            key="chat-layout"
            className="flex h-full w-full overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* CHAT COLUMN - Full width on mobile, half on desktop */}
            <div className="flex flex-col h-full w-full lg:max-w-2xl lg:border-r overflow-hidden">
              {/* Header */}
              <header className="shrink-0 flex items-center justify-between p-3 md:p-4 border-b bg-background">
                <h2 className="text-base md:text-lg font-medium">Chat</h2>
                <div className="flex items-center gap-2">
                  {/* Mobile: Show preview button */}
                  <Sheet open={mobilePreviewOpen} onOpenChange={setMobilePreviewOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm" className="lg:hidden">
                        <Presentation className="h-4 w-4 mr-2" />
                        <span className="text-xs">Preview ({pptData?.slides?.length || 0})</span>
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="h-[85vh] p-0">
                      <div className="flex flex-col h-full">
                        <SheetHeader className="p-4 border-b shrink-0">
                          <div className="flex items-center justify-between">
                            <SheetTitle>Preview</SheetTitle>
                            <DownloadButton />
                          </div>
                        </SheetHeader>
                        <div className="flex-1 overflow-hidden">
                          <PPTPreview />
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>

                  {/* New Chat Button */}
                  <Button variant="outline" size="sm" onClick={handleNewChat}>
                    <Plus className="h-4 w-4 md:mr-2" />
                    <span className="hidden md:inline">New</span>
                  </Button>
                </div>
              </header>

              {/* Chat Content */}
              <div className="flex-1 overflow-hidden">
                <ChatInterface />
              </div>
            </div>

            {/* DESKTOP PREVIEW COLUMN - Hidden on mobile */}
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