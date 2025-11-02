'use client'; 

// 1. Remove 'useState' - we won't use it for layout state anymore
import { ChatInterface } from '@/components/ChatInterface';
import { PPTPreview } from '@/components/PPTPreview';
import { InitialPrompt } from '@/components/InitialPrompt';
import { useChatStore } from '@/store/useChatStore';
import { AnimatePresence, motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { GeminiResponse, ChatMessage } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button'; // <-- Import Button
import { Plus } from 'lucide-react'; // <-- Import 'Plus' icon

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
    addMessage,
    setLoading, 
    setError, 
    updatePPT, 
    pptData,
    clearChat // <-- 2. Get the 'clearChat' action
  } = useChatStore();
  
  // 3. REMOVE 'useState'. We derive the UI state directly from the store.
  // The layout will now react automatically when 'clearChat' is called.
  const hasData = pptData && pptData.slides && pptData.slides.length > 0;

  const handleInitialSubmit = async (input: string) => {
    setLoading(true);
    setError(null);

    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };
    addMessage(userMessage);

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

      const data: GeminiResponse = await response.json();
      
      updatePPT({ 
        slides: data.slides, 
        globalTheme: data.globalTheme 
      });

      const aiContent = data.reasoning || `Successfully created ${data.slides.length} slides.`;
      const aiMessage: ChatMessage = {
        id: uuidv4(),
        role: 'model',
        content: aiContent,
        timestamp: new Date(),
      };
      addMessage(aiMessage);
      
      // We no longer call 'setUiState'. The UI will react
      // to 'updatePPT' changing 'hasData'.
      
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
        {/* 4. Use the reactive 'hasData' boolean here */}
        {!hasData ? (
          // STATE 1: Initial Prompt
          <InitialPrompt 
            key="initial"
            onSubmit={handleInitialSubmit} 
            isLoading={isLoading} 
          />
        ) : (
          // STATE 2: Two-Column Chat Layout
          <motion.div 
            key="chat-layout"
            className="flex w-full h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Column 1: Chat Interface */}
            <div className="flex flex-col h-full w-full flex-1 border-r max-w-2xl">
              <header className="flex items-center justify-between p-4 border-b">
                <h1 className="text-xl font-semibold">AI PPT Chat</h1>
                {/* 5. ADD THE "NEW CHAT" BUTTON */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => clearChat()}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Chat
                </Button>
              </header>
              <ChatInterface />
            </div>

            {/* Column 2: PPT Preview */}
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