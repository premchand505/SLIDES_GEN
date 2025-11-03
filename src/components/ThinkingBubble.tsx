'use client';

import { Sparkles, Search, Globe, Brain, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';
import { ThinkingStep } from '@/types';

interface ThinkingBubbleProps {
  step: ThinkingStep;
}

// Category detector — aligned with 5-phase system
function detectCategory(content: string): {
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
} {
  const lower = content.toLowerCase();

  if (lower.startsWith('begin researching')) {
    return { category: '🔬 Research Initiation', icon: Search, color: 'blue' };
  }
  
  if (lower.startsWith('unveiling')) {
    return { category: '💡 Research & Analysis', icon: Lightbulb, color: 'cyan' };
  }
  if (lower.includes('type:action') && lower.includes('tool:websearch')) {
    return { category: '🔍 Web Search', icon: Search, color: 'blue' };
  }
  if (lower.startsWith('examining website') || lower.includes('type:action tool:readwebsite')) {
    return { category: '🌐 Website Review', icon: Globe, color: 'green' };
  }
  if (lower.startsWith('refining information')) {
    return { category: '✨ Final Synthesis', icon: Sparkles, color: 'pink' };
  }

  // Fallbacks
  if (lower.includes('website') || lower.includes('reading')) {
    return { category: '🌐 Web Resources', icon: Globe, color: 'green' };
  }
  if (lower.includes('research') || lower.includes('search')) {
    return { category: '🔍 Research', icon: Search, color: 'blue' };
  }

  return { category: '💭 Thinking', icon: Brain, color: 'primary' };
}

// Format URLs into clickable links
function formatContentWithLinks(content: string): React.ReactNode {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = content.split(urlRegex);

  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:underline font-medium break-all"
          onClick={(e) => e.stopPropagation()}
        >
          <Globe className="w-3.5 h-3.5 shrink-0" />
          {part}
        </a>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

// Extract readable text (ignore phase prefix)
function extractMainContent(content: string): string {
  const colonIndex = content.indexOf(':');
  if (colonIndex > 0 && colonIndex < 60) {
    return content.substring(colonIndex + 1).trim();
  }
  return content;
}

export function ThinkingBubble({ step }: ThinkingBubbleProps) {
  const { category, icon: Icon, color } = detectCategory(step.content);
  const mainContent = extractMainContent(step.content);
  const isAction = step.type === 'action';

  const colorSchemes = {
    purple: { bg: 'bg-purple-50/50 dark:bg-purple-950/20', border: 'border-purple-200 dark:border-purple-800', text: 'text-purple-600 dark:text-purple-400', iconBg: 'bg-purple-500/10', dot: 'bg-purple-500/60' },
    blue: { bg: 'bg-blue-50/50 dark:bg-blue-950/20', border: 'border-blue-200 dark:border-blue-800', text: 'text-blue-600 dark:text-blue-400', iconBg: 'bg-blue-500/10', dot: 'bg-blue-500/60' },
    yellow: { bg: 'bg-yellow-50/50 dark:bg-yellow-950/20', border: 'border-yellow-200 dark:border-yellow-800', text: 'text-yellow-600 dark:text-yellow-400', iconBg: 'bg-yellow-500/10', dot: 'bg-yellow-500/60' },
    green: { bg: 'bg-green-50/50 dark:bg-green-950/20', border: 'border-green-200 dark:border-green-800', text: 'text-green-600 dark:text-green-400', iconBg: 'bg-green-500/10', dot: 'bg-green-500/60' },
    pink: { bg: 'bg-pink-50/50 dark:bg-pink-950/20', border: 'border-pink-200 dark:border-pink-800', text: 'text-pink-600 dark:text-pink-400', iconBg: 'bg-pink-500/10', dot: 'bg-pink-500/60' },
    cyan: { bg: 'bg-cyan-50/50 dark:bg-cyan-950/20', border: 'border-cyan-200 dark:border-cyan-800', text: 'text-cyan-600 dark:text-cyan-400', iconBg: 'bg-cyan-500/10', dot: 'bg-cyan-500/60' },
    primary: { bg: 'bg-linear-to-br from-muted/40 to-muted/20', border: 'border-border/50', text: 'text-primary/80', iconBg: 'bg-primary/10', dot: 'bg-primary/60' },
  };

  const scheme = colorSchemes[color as keyof typeof colorSchemes] || colorSchemes.primary;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -5, scale: 0.95 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex gap-3 items-start mb-4"
    >
      {/* Icon */}
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${scheme.iconBg}`}>
        <Icon className={`w-5 h-5 ${scheme.text} ${step.isStreaming ? 'animate-pulse' : ''}`} />
      </div>

      {/* Bubble */}
      <div className={`flex-1 rounded-2xl p-5 border max-w-[85%] shadow-sm ${scheme.bg} ${scheme.border}`}>
        <div className={`text-xs font-bold mb-3 uppercase tracking-wider flex items-center gap-2 ${scheme.text}`}>
          {category}
          {step.isStreaming && (
            <span className="flex gap-1 ml-auto">
              <span className={`w-1.5 h-1.5 rounded-full animate-bounce ${scheme.dot}`} style={{ animationDelay: '0ms' }}></span>
              <span className={`w-1.5 h-1.5 rounded-full animate-bounce ${scheme.dot}`} style={{ animationDelay: '150ms' }}></span>
              <span className={`w-1.5 h-1.5 rounded-full animate-bounce ${scheme.dot}`} style={{ animationDelay: '300ms' }}></span>
            </span>
          )}
        </div>

        <div className={`text-sm leading-relaxed whitespace-pre-wrap ${isAction ? 'font-medium' : 'font-normal'} text-foreground/90`}>
          {formatContentWithLinks(mainContent)}
        </div>

        {isAction && (
          <div className="mt-3 pt-3 border-t border-current/10">
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${scheme.text}`}>
              {step.tool === 'webSearch' && (<><Search className="w-3 h-3" /> Searching Web</>)}
              {step.tool === 'readWebsite' && (<><Globe className="w-3 h-3" /> Reading Website</>)}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
