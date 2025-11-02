'use client';

import { useState, FormEvent } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send, Loader2, Paperclip } from 'lucide-react';
import { motion } from 'framer-motion';

interface InitialPromptProps {
  onSubmit: (input: string) => void;
  isLoading: boolean;
}

const dummyTopics = [
  'The Future of Renewable Energy',
  'A Brief History of the Internet',
  'Introduction to Machine Learning',
];

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

  // ✅ FIXED: Now properly calls onSubmit
  const handleTopicClick = (topic: string) => {
    if (isLoading) return;
    onSubmit(topic);
  };

  return (
    <motion.div
      className="w-full h-full flex flex-col items-center justify-center p-4"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold mb-2">Welcome!</h2>
        <p className="text-lg text-muted-foreground">
          Generate your slides in seconds.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="relative w-full max-w-2xl">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Start with a topic, and we'll turn it into slides! (e.g., 'A 5-slide presentation on the future of AI')"
          className="min-h-[150px] p-4 pr-30 text-base bg-secondary"
          disabled={isLoading}
        />
        
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute bottom-8 right-20"
          disabled={isLoading}
        >
          <Paperclip className="h-4 w-4" />
          <span className="sr-only">Attach file (dummy)</span>
        </Button>
        
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