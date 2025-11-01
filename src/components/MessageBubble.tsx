import { ChatMessage } from '@/types';
import { cn } from '@/lib/utils';
import { User, Sparkles } from 'lucide-react';

// Define props for the component
interface MessageBubbleProps {
  message: ChatMessage;
}

/**
 * A component to display a single chat message.
 * It changes style based on whether the role is 'user' or 'model'.
 */
export function MessageBubble({ message }: MessageBubbleProps) {
  // FIX: Removed the extraneous 'S' from this line
  const { role, content } = message;
  const isUser = role === 'user';

  // Base styles for the icon container
  const iconContainerStyles =
    'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center';
  
  // Base styles for the message bubble
  const bubbleStyles = 'p-3 rounded-lg max-w-md';

  return (
    <div
      className={cn(
        'flex items-start gap-3',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      {/* Icon for AI */}
      {!isUser && (
        <div
          className={cn(
            iconContainerStyles,
            'bg-primary text-primary-foreground' // Black bg, white icon
          )}
        >
          <Sparkles className="w-5 h-5" />
        </div>
      )}

      {/* Message Content */}
      <div
        className={cn(
          bubbleStyles,
          isUser
            ? 'bg-primary text-primary-foreground' // User: Black bg, white text
            : 'bg-secondary text-secondary-foreground' // AI: Light gray bg, black text
        )}
      >
        {/* We can add markdown parsing here later. For now, just text. */}
        <p className="text-sm whitespace-pre-wrap">{content}</p>
      </div>

      {/* Icon for User */}
      {isUser && (
        <div
          className={cn(
            iconContainerStyles,
            'bg-secondary text-secondary-foreground' // Light gray bg, black icon
          )}
        >
          <User className="w-5 h-5" />
        </div>
      )}
    </div>
  );
}