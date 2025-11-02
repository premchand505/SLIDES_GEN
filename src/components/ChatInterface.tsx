'use client';

import { useEffect, useRef } from 'react';
import { useChatStore } from '@/store/useChatStore';
import { ChatInput } from '@/components/ChatInput';
import { MessageBubble } from '@/components/MessageBubble';
import { AnimatePresence, motion } from 'framer-motion';
import { useGeneration } from '@/hooks/useGeneration';

export function ChatInterface() {
  const { messages: storeMessages, isLoading } = useChatStore();
  
  // ✅ FIXED: Use store messages directly, no local state duplication
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // ✅ Use the shared generation hook
  const { handleGenerate } = useGeneration();
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [storeMessages]);

  const handleChatSubmit = async (input: string) => {
    await handleGenerate(input);
  };

  return (
    <motion.div 
      key="chat"
      className="flex flex-col h-full w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {storeMessages.map((msg) => (
          <MessageBubble 
            key={msg.id} 
            message={msg}
          />
        ))}
        
        {/* Loading indicator */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="flex gap-3 items-start mb-4"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
              <div className="flex-1 bg-muted/50 rounded-2xl p-5 border max-w-[85%]">
                <div className="text-sm text-muted-foreground">Processing...</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div ref={messagesEndRef} />
      </div>
      <ChatInput onSubmit={handleChatSubmit} isLoading={isLoading} />
    </motion.div>
  );
}