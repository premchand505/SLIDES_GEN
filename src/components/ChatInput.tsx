'use client';

import { useState, useRef, FormEvent } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send, Loader2, Paperclip } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSubmit: (input: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSubmit, isLoading }: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoResizeTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSubmit = (
    e: FormEvent<HTMLFormElement> | React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    
    if (isLoading || !trimmedInput) {
      return;
    }

    onSubmit(trimmedInput);
    setInput('');
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative flex w-full items-end gap-2 p-3 md:p-4 border-t bg-background"
    >
      <Textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          autoResizeTextarea();
        }}
        onKeyDown={handleKeyDown}
        placeholder="Send a message to edit your slides..."
        className={cn(
          'min-h-10 max-h-[150px] md:max-h-[200px] resize-none overflow-y-auto pr-20 md:pr-28',
          'bg-secondary text-secondary-foreground text-sm md:text-base',
          'focus-visible:ring-1'
        )}
        rows={1}
        disabled={isLoading}
      />

      {/* Attachment Button (Dummy) */}
      <Button
        type="button"
        size="icon"
        variant="ghost"
        className="absolute bottom-4 md:bottom-5 right-14 md:right-20 h-8 w-8 md:h-9 md:w-9 shrink-0"
        disabled={isLoading}
      >
        <Paperclip className="h-3.5 w-3.5 md:h-4 md:w-4" />
        <span className="sr-only">Attach file</span>
      </Button>

      {/* Send Button */}
      <Button
        type="submit"
        size="icon"
        className="absolute bottom-4 md:bottom-5 right-3 md:right-4 h-8 w-8 md:h-9 md:w-9 shrink-0"
        disabled={isLoading || input.trim().length === 0}
      >
        {isLoading ? (
          <Loader2 className="h-3.5 w-3.5 md:h-4 md:w-4 animate-spin" />
        ) : (
          <Send className="h-3.5 w-3.5 md:h-4 md:w-4" />
        )}
        <span className="sr-only">Send message</span>
      </Button>
    </form>
  );
}