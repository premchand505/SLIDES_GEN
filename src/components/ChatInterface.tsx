'use client';

import { useEffect, useRef } from 'react';
import { useChatStore } from '@/store/useChatStore';
import { ChatInput } from '@/components/ChatInput';
import { MessageBubble } from '@/components/MessageBubble';
import { ChatMessage } from '@/types';
import { v4 as uuidv4 } from 'uuid'; // We'll need a UUID package

/**
 * Main chat interface component.
 * Manages message display, scrolling, and input submission.
 */
export function ChatInterface() {
  // Get state and actions from the Zustand store
  const { messages, isLoading, addMessage, setLoading, setError } = useChatStore();
  
  // Ref for the scrollable message container
  const messagesEndRef = useRef<HTMLDivElement>(null);

  /**
   * Scrolls the message container to the bottom.
   */
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Auto-scroll whenever new messages are added
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

    // --- API CALL WILL GO HERE ---
    // For now, let's simulate an AI response
    // In the next phase, we'll replace this with the actual Gemini API call
    
    // Simulate thinking time
    await new Promise(resolve => setTimeout(resolve, 1500));

    const aiMessage: ChatMessage = {
      id: uuidv4(),
      role: 'model',
      content: `This is a simulated AI response to: "${input}"
      
In the next step, this will be a real response from the Gemini API, 
and it will contain JSON data to generate slides.`,
      timestamp: new Date(),
    };
    
    addMessage(aiMessage);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* This is the scrollable message list area.
        - 'flex-1' makes it take all available vertical space.
        - 'overflow-y-auto' makes it scrollable.
      */}
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
        {/* Empty div to act as a scroll target */}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Component */}
      <ChatInput onSubmit={handleChatSubmit} isLoading={isLoading} />
    </div>
  );
}