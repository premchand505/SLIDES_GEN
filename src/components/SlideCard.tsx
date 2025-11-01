import { SlideContent } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

// Define props for the component
interface SlideCardProps {
  slide: SlideContent;
  slideNumber: number;
}

/**
 * Renders a single slide thumbnail preview.
 */
export function SlideCard({ slide, slideNumber }: SlideCardProps) {
  return (
    <Card className="w-full max-w-sm flex-shrink-0 bg-secondary">
      <CardHeader>
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <span>{slide.layout}</span>
          <span>Slide {slideNumber}</span>
        </div>
        <CardTitle className="text-lg mt-2">{slide.title}</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Render bullet points */}
        <ul className="list-disc pl-5 space-y-1">
          {slide.content.map((point, index) => (
            <li key={index} className="text-sm">
              {point}
            </li>
          ))}
        </ul>
        {/* Handle empty content */}
        {slide.content.length === 0 && (
          <p className="text-sm text-muted-foreground italic">
            (No content for this slide)
          </p>
        )}
      </CardContent>
    </Card>
  );
}