'use client';

import { useState, FormEvent } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send, Loader2, Paperclip, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface InitialPromptProps {
  onSubmit: (input: string) => void;
  isLoading: boolean;
}

const dummyTopics = [
  'Renewable Energy',
  'History of the Internet',
  'Machine Learning Basics',
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

  const handleTopicClick = (topic: string) => {
    if (isLoading) return;
    onSubmit(topic);
  };

  return (
    <motion.div
      className="w-full max-w-3xl mx-auto px-4 py-6 md:py-8"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="text-center mb-6 md:mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary/10 mb-3 md:mb-4">
          <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-primary" />
        </div>
        <h2 className="text-2xl md:text-4xl font-bold mb-2">Welcome to AI PPT Chat</h2>
        <p className="text-sm md:text-lg text-muted-foreground px-4">
          Generate professional slides in seconds with AI
        </p>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="relative mb-6 md:mb-8">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe your presentation... (e.g., 'Create 5 slides about climate change')"
          className={cn(
            "min-h-[120px] md:min-h-[150px] p-4 pr-24 md:pr-28 text-sm md:text-base",
            "bg-secondary resize-none",
            "focus-visible:ring-2"
          )}
          disabled={isLoading}
        />
        
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute bottom-6 md:bottom-8 right-16 md:right-20 h-8 w-8 md:h-9 md:w-9"
          disabled={isLoading}
        >
          <Paperclip className="h-4 w-4" />
        </Button>
        
        <Button
          type="submit"
          size="icon"
          className="absolute bottom-6 md:bottom-8 right-6 md:right-8 h-8 w-8 md:h-9 md:w-9"
          disabled={isLoading || input.trim().length === 0}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
      
      {/* Example Topics */}
      <div className="text-center">
        <p className="text-xs md:text-sm text-muted-foreground mb-3">
          Or try these examples:
        </p>
        <div className="flex flex-wrap justify-center gap-2 md:gap-3">
          {dummyTopics.map((topic) => (
            <Button
              key={topic}
              variant="outline"
              size="sm"
              onClick={() => handleTopicClick(topic)}
              disabled={isLoading}
              className="text-xs md:text-sm"
            >
              {topic}
            </Button>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="mt-8 md:mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 text-center">
        <div className="p-4 rounded-lg bg-muted/50">
          <div className="text-2xl mb-2">⚡</div>
          <h3 className="font-semibold text-sm mb-1">Lightning Fast</h3>
          <p className="text-xs text-muted-foreground">Generate slides in seconds</p>
        </div>
        <div className="p-4 rounded-lg bg-muted/50">
          <div className="text-2xl mb-2">🎨</div>
          <h3 className="font-semibold text-sm mb-1">Beautiful Design</h3>
          <p className="text-xs text-muted-foreground">Professional templates</p>
        </div>
        <div className="p-4 rounded-lg bg-muted/50">
          <div className="text-2xl mb-2">✨</div>
          <h3 className="font-semibold text-sm mb-1">AI Powered</h3>
          <p className="text-xs text-muted-foreground">Smart content generation</p>
        </div>
      </div>
    </motion.div>
  );
}