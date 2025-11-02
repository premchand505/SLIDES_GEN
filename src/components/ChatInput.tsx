'use client';

import { useState, useRef, FormEvent } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Define props for the component
interface ChatInputProps {
  /**
   * The function to call when the form is submitted.
   * @param input The text content from the textarea.
   */
  onSubmit: (input: string) => void;
  
  /**
   * A boolean to indicate if the chat is currently waiting
   * for a response from the AI.
   */
  isLoading: boolean;
}

/**
 * A responsive chat input component with a textarea and send button.
 * Handles form submission and 'Enter' key presses.
 */
export function ChatInput({ onSubmit, isLoading }: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /**
   * Adjusts the height of the textarea based on its content.
   */
  const autoResizeTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset height
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  /**
   * Handles the key down event, specifically for 'Enter' key.
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter, but allow new line with Shift + Enter
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  /**
   * Handles the form submission.
   */
  const handleSubmit = (
    e: FormEvent<HTMLFormElement> | React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    e.preventDefault();
    const trimmedInput = input.trim();
    
    // Don't submit if loading or input is empty
    if (isLoading || !trimmedInput) {
      return;
    }

    onSubmit(trimmedInput);
    setInput(''); // Clear the input
    
    // Reset textarea height after submission
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative flex w-full items-end gap-2 p-4 border-t"
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
        // Set a max-height and make it scrollable beyond that
        className={cn(
          'min-h-[40px] max-h-[200px] resize-none overflow-y-auto pr-16',
          'bg-secondary text-secondary-foreground'
        )}
        rows={1}
        disabled={isLoading}
      />
      <Button
        type="submit"
        size="icon"
        // --- FIX: Use 'shrink-0' ---
        className="absolute bottom-6 right-6 shrink-0"
        disabled={isLoading || input.trim().length === 0}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        <span className="sr-only">Send message</span>
      </Button>
    </form>
  );
}