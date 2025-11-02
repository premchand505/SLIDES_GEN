'use client';

import { useEffect, useRef } from 'react';
import { useChatStore } from '@/store/useChatStore';
import { ChatInput } from '@/components/ChatInput';
import { MessageBubble } from '@/components/MessageBubble';
// --- FIX: Removed unused 'PPTData' import ---
import { ChatMessage, GeminiResponse } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

export function ChatInterface() {
  // ... (rest of the file is correct)
  // ...
  const { 
    messages, 
    isLoading, 
    addMessage, 
    setLoading, 
    setError,
    updatePPT,
    pptData
  } = useChatStore();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleChatSubmit = async (input: string) => {
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
        body: JSON.stringify({ 
          prompt: input,
          history: messages,
          currentPPT: pptData
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'An API error occurred');
      }

      const data: GeminiResponse = await response.json();

      const aiContent = data.reasoning || `Successfully edited slides.`;
      
      const aiMessage: ChatMessage = {
        id: uuidv4(),
        role: 'model',
        content: aiContent,
        timestamp: new Date(),
      };
      addMessage(aiMessage);

      updatePPT({ 
        slides: data.slides, 
        globalTheme: data.globalTheme 
      });

    } catch (error) {
      console.error('Failed to fetch from Gemini API:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setError(errorMessage);
      toast.error(`Error: ${errorMessage}`);
      
      const errorMessagePacket: ChatMessage = {
        id: uuidv4(),
        role: 'model',
        content: `Sorry, I encountered an error: ${errorMessage}`,
        timestamp: new Date(),
      };
      addMessage(errorMessagePacket);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <MessageBubble 
            message={{
              id: 'intro-msg',
              role: 'model',
              content: `Your presentation is ready! You can see the preview on the right.

Use this chat to make edits. For example:
- "Change the title of slide 3"
- "Add a slide about..."
- "Delete slide 2"`,
              timestamp: new Date()
            }}
          />
        )}
        
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <ChatInput onSubmit={handleChatSubmit} isLoading={isLoading} />
    </div>
  );
}