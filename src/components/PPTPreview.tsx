'use client';

import { useChatStore } from '@/store/useChatStore';
import { SlideCard } from '@/components/SlideCard';
import { Loader2, ChevronUp, ChevronDown } from 'lucide-react';
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { useEffect, useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function PPTPreview() {
  const { pptData, isLoading } = useChatStore();
  const slides = pptData?.slides || [];
  
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  
  const wheelingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSetApi = useCallback((apiInstance: CarouselApi) => {
    setApi(apiInstance);
  }, []);

  useEffect(() => {
    if (!api) return;
    
    const updateState = () => {
      setCount(api.scrollSnapList().length);
      setCurrent(api.selectedScrollSnap());
    };

    updateState();
    
    api.on("select", updateState);
    api.on("reInit", updateState);

    return () => {
      api.off("select", updateState);
      api.off("reInit", updateState);
    };
  }, [api]);

  // Keyboard navigation (desktop only)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!api || window.innerWidth < 768) return;
      
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        api.scrollPrev();
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        api.scrollNext();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [api]);

  // Mouse wheel navigation (desktop only)
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !api || window.innerWidth < 768) return;

    const handleWheel = (e: WheelEvent) => {
      if (wheelingRef.current) return;

      const delta = e.deltaY;
      
      if (Math.abs(delta) < 10) return;

      e.preventDefault();
      e.stopPropagation();
      
      wheelingRef.current = true;

      if (delta > 0) {
        api.scrollNext();
      } else {
        api.scrollPrev();
      }

      setTimeout(() => {
        wheelingRef.current = false;
      }, 600);
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [api]);

  const canScrollPrev = current > 0;
  const canScrollNext = current < count - 1;

  // Loading State
  if (isLoading && slides.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white p-4">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p className="text-sm md:text-base">Generating your presentation...</p>
      </div>
    );
  }

  // Empty State
  if (slides.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <p className="text-muted-foreground text-center text-sm md:text-base max-w-md">
          Your presentation preview will appear here once generated.
        </p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="relative h-full w-full flex items-center justify-center overflow-hidden bg-white"
    >
      
      <Carousel
        setApi={handleSetApi}
        orientation="vertical"
        className="w-full h-full"
        opts={{ 
          loop: false,
          axis: 'y',
          align: 'start',
          containScroll: false,
          dragFree: false,
          slidesToScroll: 1
        }}
      >
        <CarouselContent className="h-full">
          {slides.map((slide, index) => (
            <CarouselItem
              key={index}
              className="h-full flex items-center justify-center p-4 md:p-8"
            >
              <div className="w-full max-w-4xl">
                <SlideCard 
                  slide={slide} 
                  slideNumber={index + 1}
                  globalTheme={pptData?.globalTheme}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Navigation Controls */}
      <div className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2 md:gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={() => api?.scrollPrev()}
          disabled={!canScrollPrev}
          className={cn(
            "rounded-full shadow-lg bg-background h-8 w-8 md:h-10 md:w-10",
            !canScrollPrev && "opacity-30 cursor-not-allowed"
          )}
        >
          <ChevronUp className="h-4 w-4 md:h-5 md:w-5" />
        </Button>
        
        {/* Slide Counter */}
        <div className="py-1.5 md:py-2 px-2 md:px-3 text-center bg-background/90 backdrop-blur-sm rounded-full border shadow-sm text-xs md:text-sm font-medium min-w-[50px] md:min-w-[60px]">
          {current + 1} / {count}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => api?.scrollNext()}
          disabled={!canScrollNext}
          className={cn(
            "rounded-full shadow-lg bg-background h-8 w-8 md:h-10 md:w-10",
            !canScrollNext && "opacity-30 cursor-not-allowed"
          )}
        >
          <ChevronDown className="h-4 w-4 md:h-5 md:w-5" />
        </Button>
      </div>

      {/* Hint Text - Desktop only */}
      {count > 1 && (
        <div className="hidden md:block absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-10 text-xs text-white animate-pulse">
          Use arrow keys or scroll to navigate
        </div>
      )}

      {/* Mobile Swipe Hint */}
      {count > 1 && (
        <div className="md:hidden absolute bottom-4 left-1/2 -translate-x-1/2 z-10 text-xs text-white animate-pulse">
          Swipe to navigate
        </div>
      )}
    </div>
  );
}