'use client'; 

import { useState } from 'react';
import { ChatInterface } from '@/components/ChatInterface';
import { PPTPreview } from '@/components/PPTPreview';
import { InitialPrompt } from '@/components/InitialPrompt';
import { useChatStore } from '@/store/useChatStore';
import { AnimatePresence, motion } from 'framer-motion';
import dynamic from 'next/dynamic';
// --- FIX: Import types and uuid ---
import { GeminiResponse, ChatMessage } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
// --- END FIX ---

const DownloadButton = dynamic(
  () => import('@/components/DownloadButton').then((mod) => mod.DownloadButton),
  { 
    ssr: false, 
    loading: () => <div className="h-9 w-28 rounded-md bg-secondary animate-pulse" />
  }
);

export function MainAppLayout() {
  const { 
    isLoading, 
    addMessage, // --- FIX: This is now used ---
    setLoading, 
    setError, 
    updatePPT, 
    pptData 
  } = useChatStore();
  
  const [uiState, setUiState] = useState<'initial' | 'chat'>(
    pptData ? 'chat' : 'initial'
  );

  const handleInitialSubmit = async (input: string) => {
    setLoading(true);
    setError(null);

    // --- FIX: Add user message to store ---
    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };
    addMessage(userMessage);
    // --- END FIX ---

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input, currentPPT: null }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'An API error occurred');
      }

      // --- FIX: Use correct type ---
      const data: GeminiResponse = await response.json();
      
      updatePPT({ 
        slides: data.slides, 
        globalTheme: data.globalTheme 
      });

      // --- FIX: Add AI response message to store ---
      const aiContent = data.reasoning || `Successfully created ${data.slides.length} slides.`;
      const aiMessage: ChatMessage = {
        id: uuidv4(),
        role: 'model',
        content: aiContent,
        timestamp: new Date(),
      };
      addMessage(aiMessage);
      // --- END FIX ---

      setUiState('chat'); 
      
    } catch (error) {
      console.error('Failed to fetch from Gemini API:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(errorMessage);
      toast.error(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex h-screen w-full overflow-hidden">
      <AnimatePresence mode="wait">
        {uiState === 'initial' ? (
          <InitialPrompt 
            key="initial"
            onSubmit={handleInitialSubmit} 
            isLoading={isLoading} 
          />
        ) : (
          <motion.div 
            key="chat-layout"
            className="flex w-full h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col h-full w-full flex-1 border-r max-w-2xl">
              <header className="flex items-center justify-between p-4 border-b">
                <h1 className="text-xl font-semibold">AI PPT Chat</h1>
              </header>
              <ChatInterface />
            </div>

            <div className="flex flex-col h-full flex-1">
              <header className="flex items-center justify-between p-4 border-b">
                <h2 className="text-xl font-semibold">Preview</h2>
                <DownloadButton />
              </header>
              <PPTPreview />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}