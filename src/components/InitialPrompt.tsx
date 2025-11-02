'use client';

import { useState, FormEvent } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
// --- MODIFICATION: Added Paperclip icon ---
import { Send, Loader2, Paperclip } from 'lucide-react';
import { motion } from 'framer-motion';
import { useChatStore } from '@/store/useChatStore';
import { v4 as uuidv4 } from 'uuid';
// Define props for the component
interface InitialPromptProps {
  /**
   * Function to call when the first prompt is submitted.
*/
  onSubmit: (input: string) => void;
  /**
   * Loading state for the first-ever submission.
*/
  isLoading: boolean;
}

// --- MODIFICATION: Added dummy topics ---
const dummyTopics = [
  'The Future of Renewable Energy',
  'A Brief History of the Internet',
  'Introduction to Machine Learning',
];
/**
 * A centered text area component for the initial user prompt.
*/
export function InitialPrompt({ onSubmit, isLoading }: InitialPromptProps) {
  const [input, setInput] = useState('');
const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedInput = input.trim();
if (isLoading || !trimmedInput) {
      return;
    }
    onSubmit(trimmedInput);
  };
const handleTopicClick = (topic: string) => {
  if (isLoading) return;

  const store = useChatStore.getState();
  let sessionId = store.currentSessionId;
if (!sessionId) {
    sessionId = store.createNewSession();
  }

  const userMsg = {
    id: uuidv4(),
    role: 'user' as const,
    content: topic,
    timestamp: new Date(),
  };
store.addMessage(userMsg);
};
  return (
    <motion.div
      // --- MODIFICATION: Changed to flex-col to stack items vertically ---
      className="w-full h-full flex flex-col items-center justify-center p-4"
      // Framer Motion animation properties
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
    >
      {/* --- MODIFICATION: 
Added Welcome text --- */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold mb-2">Welcome!</h2>
        <p className="text-lg text-muted-foreground">
          Generate your slides in seconds.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-2xl"
      >
        <Textarea
 
         value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Start with a topic, and we'll turn it into slides! (e.g., 'A 5-slide presentation on the future of AI')"
          // --- MODIFICATION: Increased right-padding from p-4 to pr-30 to fit both buttons ---
          className="min-h-[150px] p-4 pr-30 text-base bg-secondary"
          disabled={isLoading}
    
    />
        
        {/* --- MODIFICATION: Added dummy attachment (clip) button --- */}
        <Button
          type="button" // Set to "button" so it doesn't submit the form
          variant="ghost"
          size="icon"
          className="absolute bottom-8 right-20" // Positioned left of the send button
    
      disabled={isLoading}
        >
          <Paperclip className="h-4 w-4" />
          <span className="sr-only">Attach file (dummy)</span>
        </Button>
        
        <Button
          type="submit"
          size="icon"
          className="absolute bottom-8 right-8" // Original position
 
         disabled={isLoading ||
input.trim().length === 0}
        >
          {isLoading ?
(
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          <span className="sr-only">Generate presentation</span>
        </Button>
      </form>
      
      {/* --- MODIFICATION: Added dummy topic buttons --- */}
 
     <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground mb-3">
          Or try one of these topics:
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {dummyTopics.map((topic) => (
            <Button
              key={topic}
         
     variant="outline"
              onClick={() => handleTopicClick(topic)}
              disabled={isLoading}
            >
              {topic}
            </Button>
          ))}
        </div>
      </div>

   
 </motion.div>
  );
}