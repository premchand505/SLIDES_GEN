'use client';

import { useEffect, useRef, useState } from 'react';
import { useChatStore } from '@/store/useChatStore';
import { ChatInput } from '@/components/ChatInput';
import { MessageBubble } from '@/components/MessageBubble';
import { InitialPrompt } from '@/components/InitialPrompt';
import { toast } from 'sonner';
import { ChatMessage } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const STREAM_SEPARATOR = "\n[__DATA_SEPARATOR__]\n";

// Helper function to clean markdown and code blocks from display
function cleanStreamingText(text: string): string {
  const jsonStart = text.indexOf('```json');
  if (jsonStart !== -1) {
    return text.substring(0, jsonStart).trim();
  }
  return text.replace(/```[\s\S]*?```/g, '').trim();
}

export function ChatInterface() {
  const { 
    pptData, 
    updatePPT, 
    messages: storeMessages, 
    addMessage,
  } = useChatStore();

  const [uiMessages, setUiMessages] = useState<ChatMessage[]>(storeMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [uiMessages, streamingText]);

  useEffect(() => {
    setUiMessages(storeMessages);
  }, [storeMessages]);

  const handleChatSubmit = async (input: string) => {
    setIsLoading(true);
    setStreamingText('');

    // Create and add the user message
    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };
    addMessage(userMessage);
    setUiMessages(prev => [...prev, userMessage]);

    // Create a placeholder for the AI's response
    const aiMessageId = uuidv4();

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: input,
          currentPPT: pptData, // This will be 'null' on the first request
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`Server error: ${response.statusText}`);
      }
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;

        if (accumulatedText.includes(STREAM_SEPARATOR)) {
          const parts = accumulatedText.split(STREAM_SEPARATOR);
          const reasoningText = cleanStreamingText(parts[0]);
          const jsonDataString = parts[1];
          
          if (jsonDataString) {
            try {
              const doneData = JSON.parse(jsonDataString.trim());
              if (doneData.type === 'done') {
                // Success - save final message
                const finalMessage: ChatMessage = {
                  id: aiMessageId,
                  role: 'model',
                  content: reasoningText || `Successfully created ${doneData.data.slides.length} slides.`,
                  timestamp: new Date(),
                };
                addMessage(finalMessage);
                setUiMessages(prev => [...prev, finalMessage]);
                updatePPT(doneData.data);
                setStreamingText('');
              } else {
                throw new Error(doneData.error || 'Unknown error');
              }
              break;
            } catch (e) {
              console.error("Failed to parse JSON part:", e);
              toast.error("Failed to parse final data from stream.");
              break;
            }
          }
        } else {
          // Update streaming text (clean it for display)
          setStreamingText(cleanStreamingText(accumulatedText));
        }
      }

    } catch (err) {
      const message = err instanceof Error ? err.message : "An unknown error occurred";
      toast.error(message);
      
      const errorMessage: ChatMessage = {
        id: aiMessageId,
        role: 'model',
        content: `Error: ${message}`,
        timestamp: new Date(),
      };
      addMessage(errorMessage);
      setUiMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setStreamingText('');
    }
  };

  // This is the key: this component now decides
  // whether to show the InitialPrompt or the chat list.
  return (
    <AnimatePresence mode="wait">
      {uiMessages.length === 0 ? (
        <motion.div
          key="initial"
          className="w-full h-full"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
        >
          <InitialPrompt
            onSubmit={handleChatSubmit}
            isLoading={isLoading}
          />
        </motion.div>
      ) : (
        <motion.div 
          key="chat"
          className="flex flex-col h-full w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {uiMessages.map((msg) => (
              <MessageBubble 
                key={msg.id} 
                message={msg}
              />
            ))}
            
            {/* Streaming message indicator */}
            {isLoading && streamingText && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 items-start"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                </div>
                <div className="flex-1 bg-muted/50 rounded-2xl px-4 py-3 max-w-[85%]">
                  <p className="text-sm text-foreground/90 whitespace-pre-wrap">
                    {streamingText}
                  </p>
                </div>
              </motion.div>
            )}
            
            {/* Simple loading indicator */}
            {isLoading && !streamingText && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 items-center"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                </div>
                <div className="text-sm text-muted-foreground">
                  Thinking...
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          <ChatInput onSubmit={handleChatSubmit} isLoading={isLoading} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}