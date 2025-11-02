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
import { ThinkingBubble, ThinkingStep } from '@/components/ThinkingBubble'; // Import ThinkingBubble

const STREAM_SEPARATOR = "\n[__DATA_SEPARATOR__]\n";
const tagRegex = /<(\w+)(?:\s+tool="([^"]+)")?>([\s\S]*?)<\/\1>/g;

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
  const [thinkingSteps, setThinkingSteps] = useState<ThinkingStep[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [uiMessages, thinkingSteps]);

  useEffect(() => {
    setUiMessages(storeMessages);
  }, [storeMessages]);

  /**
   * This is the new parser function.
   * It finds tags in the text and adds them to the state.
   */
  const parseAndSetSteps = (text: string, startIndex: number): number => {
    let match;
    let newLastIndex = startIndex;
    const regex = new RegExp(tagRegex.source, 'gs');
    regex.lastIndex = startIndex;
    
    const stepsToAdd: ThinkingStep[] = [];
    
    while ((match = regex.exec(text)) !== null) {
      const type = match[1] as 'thought' | 'action';
      const tool = match[2] as ThinkingStep['tool'] | undefined;
      const content = match[3];

      stepsToAdd.push({ type, tool, content });
      newLastIndex = regex.lastIndex;
    }

    if (stepsToAdd.length > 0) {
      setThinkingSteps(prev => [...prev, ...stepsToAdd]);
    }
    
    return newLastIndex;
  };

  const handleChatSubmit = async (input: string) => {
    setIsLoading(true);
    setThinkingSteps([]); // Clear old steps

    // Create and add the user message
    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };
    addMessage(userMessage);
    setUiMessages(prev => [...prev, userMessage]);

    const aiMessageId = uuidv4(); // We'll use this for the final message

    let accumulatedText = ""; // Store the full response
    let lastParsedIndex = 0; // For streaming steps

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: input,
          currentPPT: pptData,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`Server error: ${response.statusText}`);
      }
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      // --- THIS IS THE CORRECTED STREAMING LOGIC ---
      while (true) {
        const { done, value } = await reader.read();
        if (done) break; // Exit the loop when stream is finished
        
        const chunk = decoder.decode(value, { stream: true });
        accumulatedText += chunk;

        // We only update the 'thinking steps' UI, we never parse JSON here.
        // We check if the separator has NOT been found yet.
        if (!accumulatedText.includes(STREAM_SEPARATOR)) {
          lastParsedIndex = parseAndSetSteps(accumulatedText, lastParsedIndex);
        }
      }
      // --- END OF WHILE LOOP ---

      // The stream is DONE. Now, we process the complete 'accumulatedText'.
      setThinkingSteps([]); // Clear the thinking bubbles

      if (accumulatedText.includes(STREAM_SEPARATOR)) {
        const parts = accumulatedText.split(STREAM_SEPARATOR);
        const reasoningText = cleanStreamingText(parts[0]);
        const jsonDataString = parts[1];

        if (jsonDataString) {
          try {
            // This parse is now safe because the string is complete.
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
            } else {
              throw new Error(doneData.error || 'Unknown error from API');
            }
          } catch (e) {
            console.error("Failed to parse final JSON:", e);
            throw new Error("Failed to parse response from AI");
          }
        } else {
          throw new Error("No JSON data found after separator.");
        }
      } else {
        // The stream finished but never sent the separator
        throw new Error("Invalid response format from AI.");
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
      setThinkingSteps([]); // Clear steps on finish or error
    }
  };

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
            {thinkingSteps.map((step, index) => (
              <ThinkingBubble key={index} step={step} />
            ))}
            
            {/* Simple loading indicator */}
            {isLoading && thinkingSteps.length === 0 && (
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