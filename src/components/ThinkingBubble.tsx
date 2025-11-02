'use client';

import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { ThinkingStep } from '@/types';

interface ThinkingBubbleProps {
  step: ThinkingStep;
}

export function ThinkingBubble({ step }: ThinkingBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      transition={{ duration: 0.2 }}
      className="flex gap-3 items-start mb-4"
    >
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        <Sparkles className="w-4 h-4 text-primary animate-pulse" />
      </div>
      <div className="flex-1 bg-gradient-to-br from-muted/40 to-muted/20 rounded-2xl p-5 border border-border/50 max-w-[85%] shadow-sm">
        <div className="text-xs font-semibold text-primary/80 mb-3 uppercase tracking-wider flex items-center gap-2">
          Thinking
          {step.isStreaming && (
            <span className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </span>
          )}
        </div>
        <div className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
          {step.content}
        </div>
      </div>
    </motion.div>
  );
}