import { SlideContent, SlideDesign } from '@/types';
import { cn } from '@/lib/utils';

// --------------------------
// Helper function to clean AI text
// --------------------------
function cleanText(text: string | undefined): string {
  if (!text) return '';
  return text.replace(/\*\*/g, '').replace(/\*/g, '');
}

// --------------------------
// Layout mapping (type-safe)
// --------------------------
const VALID_LAYOUT_KEYS = new Set(['title', 'content', 'section', 'twocolumn']);
type LayoutKey = 'title' | 'content' | 'section' | 'twocolumn';

function normalizeLayout(rawLayout: string | undefined): LayoutKey {
  const normalized = (rawLayout ?? 'content').toLowerCase().trim();
  if (VALID_LAYOUT_KEYS.has(normalized)) {
    return normalized as LayoutKey;
  }
  return 'content';
}

// --------------------------
// High-Fidelity Slide Card Component
// --------------------------
interface SlideCardProps {
  slide: SlideContent;
  slideNumber: number;
  globalTheme?: SlideDesign;
}

export function SlideCard({ slide, slideNumber, globalTheme }: SlideCardProps) {
  // 1. Set up the design palette
  const design: SlideDesign = {
    backgroundColor: slide.design?.backgroundColor || globalTheme?.backgroundColor || '#FFFFFF',
    textColor: slide.design?.textColor || globalTheme?.textColor || '#2C3E50',
    titleFont: slide.design?.titleFont || globalTheme?.titleFont || 'Arial',
    bodyFont: slide.design?.bodyFont || globalTheme?.bodyFont || 'Calibri',
    accentColor: slide.design?.accentColor || globalTheme?.accentColor || '#3498DB',
  };

  // 2. Normalize layout and clean text
  const layoutKey = normalizeLayout(slide.layout);
  const title = cleanText(slide.title);
  const subtitle = cleanText(slide.subtitle);
  const content = (slide.content || []).map(cleanText);

  // 3. Helper to determine text color


  // 4. Render the correct layout
  // We use a 16:9 aspect ratio container to match the PPTX
  return (
    <div 
      className="w-full h-full aspect-video rounded-lg shadow-lg overflow-hidden relative border"
      style={{ backgroundColor: design.backgroundColor }}
    >
      {/* Render layout based on key */}
      {layoutKey === 'title' && (
        <TitleSlide design={design} title={title} subtitle={subtitle} />
      )}
      {layoutKey === 'section' && (
        <SectionSlide design={design} title={title} />
      )}
      {(layoutKey === 'content' || layoutKey === 'twocolumn') && (
        <ContentSlide 
          design={design} 
          title={title} 
          content={content} 
          isTwoColumn={layoutKey === 'twocolumn'} 
        />
      )}

      {/* Slide Number */}
      <div 
        className="absolute bottom-2 right-4 text-xs font-sans"
        style={{ color: isColorDark(design.backgroundColor) ? '#FFFFFF' : '#000000', opacity: 0.5 }}
      >
        {slideNumber}
      </div>
    </div>
  );
}

// --------------------------
// Sub-components for each slide type
// --------------------------

interface SlideProps {
  design: SlideDesign;
  title: string;
}

interface TitleSlideProps extends SlideProps {
  subtitle?: string;
}

function TitleSlide({ design, title, subtitle }: TitleSlideProps) {
  // This mimics the gradient/shape design from your generator
  const lightAccent = lightenColor(design.accentColor.replace('#', ''), 0.2);
  const darkAccent = darkenColor(design.accentColor.replace('#', ''), 0.2);
  
  return (
    <div 
      className="w-full h-full relative flex flex-col items-center justify-center p-8"
      style={{ backgroundColor: design.accentColor }}
    >
      {/* Decorative Shapes (mimicking generator) */}
      <div 
        className="absolute w-[30%] h-[50%] rounded-full"
        style={{ backgroundColor: `#${lightAccent}`, opacity: 0.4, top: '-10%', right: '-10%' }}
      />
      <div 
        className="absolute w-[20%] h-[35%] rounded-full"
        style={{ backgroundColor: `#${darkAccent}`, opacity: 0.3, bottom: '-10%', left: '-5%' }}
      />
      
      {/* Title */}
      <h2 
        className="text-4xl font-bold text-center z-10"
        style={{ 
          color: '#FFFFFF', 
          fontFamily: design.titleFont,
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
        }}
      >
        {title || 'Untitled'}
      </h2>
      
      {/* Subtitle */}
      {subtitle && (
        <p 
          className="text-xl text-center mt-4 z-10"
          style={{ 
            color: '#FFFFFF', 
            fontFamily: design.bodyFont, 
            opacity: 0.9 
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

function SectionSlide({ design, title }: SlideProps) {
  // This mimics the "split" design
  return (
    <div className="w-full h-full flex" style={{ backgroundColor: design.backgroundColor }}>
      {/* Left Color Panel */}
      <div 
        className="w-1/2 h-full flex flex-col justify-center p-8"
        style={{ backgroundColor: design.accentColor }}
      >
        <h2 
          className="text-3xl font-bold"
          style={{ color: '#FFFFFF', fontFamily: design.titleFont }}
        >
          {title || 'Section'}
        </h2>
        {/* Decorative line */}
        <div 
          className="h-1 w-1/4 mt-2"
          style={{ backgroundColor: '#FFFFFF' }}
        />
      </div>
      {/* Right side is just the slide background */}
    </div>
  );
}

interface ContentSlideProps extends SlideProps {
  content: string[];
  isTwoColumn: boolean;
}

function ContentSlide({ design, title, content, isTwoColumn }: ContentSlideProps) {
  // This mimics the "header bar" design
  const darkAccent = darkenColor(design.accentColor.replace('#', ''), 0.2);

  return (
    <div className="w-full h-full" style={{ backgroundColor: design.backgroundColor }}>
      {/* Header Bar */}
      <div 
        className="w-full h-[18%] flex items-center p-6 relative"
        style={{ backgroundColor: design.accentColor }}
      >
        <h2 
          className="text-3xl font-bold"
          style={{ color: '#FFFFFF', fontFamily: design.titleFont }}
        >
          {title || 'Slide Title'}
        </h2>
        {/* Accent Stripe */}
        <div 
          className="absolute bottom-0 left-0 h-1.5 w-full"
          style={{ backgroundColor: `#${darkAccent}` }}
        />
      </div>

      {/* Content Area */}
      <div 
        className={cn(
          "w-full p-6",
          isTwoColumn ? "flex flex-row gap-6" : ""
        )}
        style={{ fontFamily: design.bodyFont, color: design.textColor }}
      >
        {isTwoColumn ? (
          <>
            <ContentColumn content={content.slice(0, Math.ceil(content.length / 2))} />
            <ContentColumn content={content.slice(Math.ceil(content.length / 2))} />
          </>
        ) : (
          <ContentColumn content={content} />
        )}
      </div>
    </div>
  );
}

function ContentColumn({ content }: { content: string[] }) {
  return (
    <ul className="w-full space-y-2 list-disc list-outside pl-5">
      {content.map((item, index) => (
        <li key={index} className="text-base">
          {item}
        </li>
      ))}
    </ul>
  );
}

// --------------------------
// Color helper functions (from your generator)
// --------------------------
function lightenColor(hexColor: string, percent: number): string {
  const num = parseInt(hexColor, 16);
  const r = Math.min(255, Math.floor(((num >> 16) & 0xFF) + (255 - ((num >> 16) & 0xFF)) * percent));
  const g = Math.min(255, Math.floor(((num >> 8) & 0xFF) + (255 - ((num >> 8) & 0xFF)) * percent));
  const b = Math.min(255, Math.floor((num & 0xFF) + (255 - (num & 0xFF)) * percent));
  return ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

function darkenColor(hexColor: string, percent: number): string {
  const num = parseInt(hexColor, 16);
  const r = Math.floor(((num >> 16) & 0xFF) * (1 - percent));
  const g = Math.floor(((num >> 8) & 0xFF) * (1 - percent));
  const b = Math.floor((num & 0xFF) * (1 - percent));
  return ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

function isColorDark(hexColor: string): boolean {
  const num = parseInt(hexColor, 16);
  const r = (num >> 16) & 0xFF;
  const g = (num >> 8) & 0xFF;
  const b = num & 0xFF;
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 128;
}