'use client';

import { Loader2, Search, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import  ReactMarkdown  from 'react-markdown';

export type ThinkingStep = {
  type: 'thought' | 'action';
  tool?: 'webSearch' | 'readWebsite';
  content: string;
};

interface ThinkingBubbleProps {
  step: ThinkingStep;
}

// Helper to get the right icon
function getIcon(tool: ThinkingStep['tool']) {
  switch (tool) {
    case 'webSearch':
      return <Search className="h-4 w-4" />;
    case 'readWebsite':
      return <FileText className="h-4 w-4" />;
    default:
      return <Loader2 className="h-4 w-4 animate-spin" />;
  }
}

// Helper to get the title
function getTitle(step: ThinkingStep) {
  switch (step.type) {
    case 'action':
      if (step.tool === 'webSearch') return 'Searching the web...';
      if (step.tool === 'readWebsite') return 'Reading website...';
      return 'Performing action...';
    case 'thought':
    default:
      return 'Thinking...';
  }
}

export function ThinkingBubble({ step }: ThinkingBubbleProps) {
  const isAction = step.type === 'action';
  const title = getTitle(step);

  // Big box for thoughts, small box for actions
  if (isAction) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center"
      >
        <div className="flex items-center gap-3 p-3 rounded-lg border bg-background shadow-sm max-w-md">
          <div className="text-muted-foreground">{getIcon(step.tool)}</div>
          <p className="text-sm text-muted-foreground">{step.content}</p>
        </div>
      </motion.div>
    );
  }

  // Default: Thought bubble
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3 items-start"
    >
      <div className="w-8 h-8 rounded-full bg-primary/10  items-center justify-center flex shrink-0">
        <Sparkles className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1 bg-muted/50 rounded-2xl p-4 max-w-[85%]">
        <h3 className="font-semibold text-primary text-sm mb-2">{title}</h3>
        <ReactMarkdown components={{
          div: ({ children }) => <div className="prose prose-sm dark:prose-invert">{children}</div>
        }}>
          {step.content}
        </ReactMarkdown>
      </div>
    </motion.div>
  );
}

// Re-export Sparkles from lucide-react for use in this component
import { Sparkles } from 'lucide-react';