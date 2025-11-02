'use client';

import { useState, FormEvent } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

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

  return (
    <motion.div
      className="w-full h-full flex items-center justify-center"
      // Framer Motion animation properties
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
    >
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-2xl p-4"
      >
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Start with a topic, and we'll turn it into slides! (e.g., 'A 5-slide presentation on the future of AI')"
          className="min-h-[150px] p-4 text-base bg-secondary"
          disabled={isLoading}
        />
        <Button
          type="submit"
          size="icon"
          className="absolute bottom-8 right-8"
          disabled={isLoading || input.trim().length === 0}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          <span className="sr-only">Generate presentation</span>
        </Button>
      </form>
    </motion.div>
  );
}