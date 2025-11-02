import { ChatMessage } from '@/types';
import { cn } from '@/lib/utils';
import { User, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown'; // <-- Import ReactMarkdown

// Define props for the component
interface MessageBubbleProps {
  message: ChatMessage;
}

/**
 * A component to display a single chat message.
 * It changes style based on whether the role is 'user' or 'model'.
 */
export function MessageBubble({ message }: MessageBubbleProps) {
  const { role, content } = message;
  const isUser = role === 'user';

  const iconContainerStyles =
    'shrink-0 w-8 h-8 rounded-full flex items-center justify-center';
  
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
        {/* --- THIS IS THE FIX --- */}
        {/* Use ReactMarkdown to render the content.
            We use the 'prose' class from Tailwind Typography
            to style the markdown output (like bold, lists, etc.)
        */}
        <ReactMarkdown
          components={{
            p: ({node, ...props}) => <div className="prose prose-sm dark:prose-invert" {...props} />
          }}
        >
          {content}
        </ReactMarkdown>
        {/* --- END FIX --- */}
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