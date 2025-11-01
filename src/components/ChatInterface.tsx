'use client';

import { useEffect, useRef } from 'react';
import { useChatStore } from '@/store/useChatStore';
import { ChatInput } from '@/components/ChatInput';
import { MessageBubble } from '@/components/MessageBubble';
import { ChatMessage, GeminiResponse } from '@/types'; // <-- Import GeminiResponse
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner'; // <-- Import toast for error notifications

/**
 * Main chat interface component.
 * Manages message display, scrolling, and input submission.
 */
export function ChatInterface() {
  // Get state and actions from the Zustand store
  const { 
    messages, 
    isLoading, 
    addMessage, 
    setLoading, 
    setError,
    updatePPT // <-- Get the updatePPT action
  } = useChatStore();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /**
   * Handles the submission of a new chat message.
   * @param input - The text content from the ChatInput.
   */
  const handleChatSubmit = async (input: string) => {
    setLoading(true);
    setError(null);

    // 1. Create and add the user's message
    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };
    addMessage(userMessage);

    // --- REAL API CALL ---
    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt: input,
          history: messages // Send history for context
        }),
      });

      if (!response.ok) {
        // Handle HTTP errors (e.g., 500, 400)
        const errorData = await response.json();
        throw new Error(errorData.error || 'An API error occurred');
      }

      const data: GeminiResponse = await response.json();

      // 2. Create and add the AI's response message
      // We'll use the 'reasoning' field for the chat, or a summary.
      const aiContent = data.reasoning || `Successfully generated ${data.slides.length} slides.`;
      
      const aiMessage: ChatMessage = {
        id: uuidv4(),
        role: 'model',
        content: aiContent,
        timestamp: new Date(),
      };
      addMessage(aiMessage);

      // 3. Update the global PPT state
      // This is the CRITICAL step that connects the AI to the preview.
      updatePPT({ slides: data.slides });

    } catch (error) {
      console.error('Failed to fetch from Gemini API:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      
      // Set global error state
      setError(errorMessage);
      
      // Show a user-friendly toast notification
      toast.error(`Error: ${errorMessage}`);
      
      // Add an error message to the chat
      const errorMessagePacket: ChatMessage = {
        id: uuidv4(),
        role: 'model',
        content: `Sorry, I encountered an error: ${errorMessage}`,
        timestamp: new Date(),
      };
      addMessage(errorMessagePacket);
    } finally {
      // 4. Always turn off loading state
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* Scrollable message list area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">
              No messages yet. Start a conversation!
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Component */}
      <ChatInput onSubmit={handleChatSubmit} isLoading={isLoading} />
    </div>
  );
}