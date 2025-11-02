'use client';

import { ChatMessage } from '@/types';
import { cn } from '@/lib/utils';
import { User, Sparkles, CheckCircle2 } from 'lucide-react';

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const { role, content, thinkingStep } = message;
  const isUser = role === 'user';

  // Thinking step messages (from permanent storage)
  if (thinkingStep && !isUser) {
    return (
      <div className="flex gap-3 items-start mb-4">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 bg-gradient-to-br from-muted/40 to-muted/20 rounded-2xl p-5 border border-border/50 max-w-[85%] shadow-sm">
          <div className="text-xs font-semibold text-primary/80 mb-3 uppercase tracking-wider">
            Thinking
          </div>
          <div className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
            {content}
          </div>
        </div>
      </div>
    );
  }

  // Regular messages
  const iconContainerStyles = 'shrink-0 w-8 h-8 rounded-full flex items-center justify-center';
  const bubbleStyles = 'p-4 rounded-2xl max-w-[85%] shadow-sm';

  // Check if it's a success message
  const isSuccessMessage = content.includes('✓') || content.toLowerCase().includes('generated');

  return (
    <div
      className={cn(
        'flex items-start gap-3 mb-4',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      {/* Icon for AI */}
      {!isUser && (
        <div className={cn(iconContainerStyles, 'bg-primary/10')}>
          {isSuccessMessage ? (
            <CheckCircle2 className="w-4 h-4 text-green-600" />
          ) : (
            <Sparkles className="w-4 h-4 text-primary" />
          )}
        </div>
      )}

      {/* Message Content */}
      <div
        className={cn(
          bubbleStyles,
          isUser
            ? 'bg-primary text-primary-foreground' 
            : isSuccessMessage
            ? 'bg-green-50 dark:bg-green-950/30 text-green-900 dark:text-green-100 border border-green-200 dark:border-green-800'
            : 'bg-muted/50 text-foreground border border-border'
        )}
      >
        <div className={cn(
          "text-sm whitespace-pre-wrap",
          isSuccessMessage ? "font-semibold" : "font-normal"
        )}>
          {content}
        </div>
      </div>

      {/* Icon for User */}
      {isUser && (
        <div className={cn(iconContainerStyles, 'bg-muted border border-border')}>
          <User className="w-4 h-4 text-foreground" />
        </div>
      )}
    </div>
  );
}