'use client';

import { Sparkles, Search, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { ThinkingStep } from '@/types';

interface ThinkingBubbleProps {
  step: ThinkingStep;
}

export function ThinkingBubble({ step }: ThinkingBubbleProps) {
  const isAction = step.type === 'action';
  const isWebSearch = step.tool === 'webSearch';
  const isReadWebsite = step.tool === 'readWebsite';

  // Check if content has a title/heading at the start
  const lines = step.content.split('\n');
  const hasTitle = lines.length > 1 && lines[0].length < 50 && lines[0].trim().length > 0;
  const title = hasTitle ? lines[0].trim() : null;
  const mainContent = hasTitle ? lines.slice(1).join('\n').trim() : step.content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      transition={{ duration: 0.2 }}
      className="flex gap-3 items-start mb-4"
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
        isAction 
          ? 'bg-blue-500/10' 
          : 'bg-primary/10'
      }`}>
        {isWebSearch ? (
          <Search className="w-4 h-4 text-blue-600 animate-pulse" />
        ) : isReadWebsite ? (
          <Globe className="w-4 h-4 text-green-600 animate-pulse" />
        ) : (
          <Sparkles className="w-4 h-4 text-primary animate-pulse" />
        )}
      </div>
      <div className={`flex-1 rounded-2xl p-5 border max-w-[85%] shadow-sm ${
        isAction
          ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'
          : 'bg-linear-to-br from-muted/40 to-muted/20 border-border/50'
      }`}>
        <div className={`text-xs font-semibold mb-3 uppercase tracking-wider flex items-center gap-2 ${
          isAction ? 'text-blue-600 dark:text-blue-400' : 'text-primary/80'
        }`}>
          {isWebSearch && 'Searching the web'}
          {isReadWebsite && 'Reading website'}
          {!isAction && (title || 'Thinking')}
          {step.isStreaming && (
            <span className="flex gap-1">
              <span className={`w-1.5 h-1.5 rounded-full animate-bounce ${
                isAction ? 'bg-blue-500/60' : 'bg-primary/60'
              }`} style={{ animationDelay: '0ms' }}></span>
              <span className={`w-1.5 h-1.5 rounded-full animate-bounce ${
                isAction ? 'bg-blue-500/60' : 'bg-primary/60'
              }`} style={{ animationDelay: '150ms' }}></span>
              <span className={`w-1.5 h-1.5 rounded-full animate-bounce ${
                isAction ? 'bg-blue-500/60' : 'bg-primary/60'
              }`} style={{ animationDelay: '300ms' }}></span>
            </span>
          )}
        </div>
        <div className={`text-sm leading-relaxed whitespace-pre-wrap ${
          isAction 
            ? 'text-blue-900 dark:text-blue-100 font-medium' 
            : 'text-foreground/90'
        }`}>
          {isReadWebsite && mainContent.startsWith('http') ? (
            <a 
              href={mainContent} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline break-all"
            >
              {mainContent}
            </a>
          ) : (
            mainContent
          )}
        </div>
      </div>
    </motion.div>
  );
}