'use client';

import { useChatStore } from '@/store/useChatStore';
import { SlideCard } from '@/components/SlideCard';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Loader2 } from 'lucide-react';

/**
 * Main component for the right-hand preview column.
 * Subscribes to the chat store and displays slide thumbnails.
 */
export function PPTPreview() {
  // Get the PPT data and loading state from the store
  const { pptData, isLoading } = useChatStore();
  const slides = pptData?.slides || [];

  // 1. Loading State (When AI is thinking)
  // This honors your request to only show content *after* generation.
  if (isLoading && slides.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p>Generating your presentation...</p>
      </div>
    );
  }

  // 2. Empty State (Before first generation)
  if (slides.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground text-center p-4">
          Your presentation preview will appear here once generated.
          </p>
        </div>
    );
  }

  // 3. Content State (Slides are available)
  return (
    <ScrollArea className="flex-1 overflow-y-auto">
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {slides.map((slide, index) => (
          <SlideCard 
            key={index} 
            slide={slide} 
            slideNumber={index + 1} 
          />
        ))}
      </div>
      <ScrollBar orientation="vertical" />
    </ScrollArea>
  );
}