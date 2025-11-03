// components/SlideCard.tsx
import { SlideContent, SlideDesign, SlideLayout } from '@/types';
import { cn } from '@/lib/utils';

function cleanText(text: string | undefined | unknown): string {
  if (!text) return '';
  if (typeof text !== 'string') return String(text);
  return text.replace(/\*\*/g, '').replace(/\*/g, '');
}

function normalizeLayout(rawLayout: SlideLayout | undefined): SlideLayout {
  if (!rawLayout) return 'content';
  const validLayouts: SlideLayout[] = ['title', 'content', 'section', 'twocolumn'];
  return validLayouts.includes(rawLayout) ? rawLayout : 'content';
}

interface SlideCardProps {
  slide: SlideContent;
  slideNumber: number;
  globalTheme?: SlideDesign;
}

export function SlideCard({ slide, slideNumber, globalTheme }: SlideCardProps) {
  // ✅ FIXED: Always use globalTheme for consistency
  const design: SlideDesign = {
    backgroundColor: globalTheme?.backgroundColor || slide.design?.backgroundColor || '#FFFFFF',
    textColor: globalTheme?.textColor || slide.design?.textColor || '#2C3E50',
    titleFont: globalTheme?.titleFont || slide.design?.titleFont || 'Arial',
    bodyFont: globalTheme?.bodyFont || slide.design?.bodyFont || 'Calibri',
    accentColor: globalTheme?.accentColor || slide.design?.accentColor || '#3498DB',
  };

  const layoutKey = normalizeLayout(slide.layout);
  const title = cleanText(slide.title);
  const subtitle = cleanText(slide.subtitle);
  // ✅ FIXED: Ensure content array items are strings
  const content = Array.isArray(slide.content) 
    ? slide.content.filter(item => item != null).map(item => cleanText(item))
    : [];

  return (
    <div 
      className="w-full h-full aspect-video rounded-lg shadow-2xl overflow-hidden relative border-2"
      style={{ 
        backgroundColor: design.backgroundColor,
        borderColor: design.accentColor,
      }}
    >
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

      <div 
        className="absolute bottom-3 right-5 text-xs font-sans font-medium px-2 py-1 rounded"
        style={{ 
          color: isColorDark(design.backgroundColor) ? '#FFFFFF' : design.textColor, 
          backgroundColor: isColorDark(design.backgroundColor) 
            ? 'rgba(255,255,255,0.1)' 
            : 'rgba(0,0,0,0.05)',
        }}
      >
        {slideNumber}
      </div>
    </div>
  );
}

interface SlideProps {
  design: SlideDesign;
  title: string;
}

interface TitleSlideProps extends SlideProps {
  subtitle?: string;
}

function TitleSlide({ design, title, subtitle }: TitleSlideProps) {
  const lightAccent = lightenColor(design.accentColor.replace('#', ''), 0.3);
  const darkAccent = darkenColor(design.accentColor.replace('#', ''), 0.25);
  
  return (
    <div 
      className="w-full h-full relative flex flex-col items-center justify-center p-8 overflow-hidden"
      style={{ backgroundColor: design.accentColor }}
    >
      {/* Decorative circles */}
      <div 
        className="absolute rounded-full blur-3xl"
        style={{ 
          backgroundColor: `#${lightAccent}`, 
          opacity: 0.3,
          width: '35%',
          height: '50%',
          top: '-10%', 
          right: '-8%',
        }}
      />
      <div 
        className="absolute rounded-full blur-2xl"
        style={{ 
          backgroundColor: `#${darkAccent}`, 
          opacity: 0.25,
          width: '25%',
          height: '40%',
          bottom: '-8%', 
          left: '-5%',
        }}
      />
      
      <h2 
        className="text-4xl md:text-5xl font-bold text-center z-10 leading-tight"
        style={{ 
          color: '#FFFFFF', 
          fontFamily: design.titleFont,
          textShadow: '3px 3px 6px rgba(0,0,0,0.3)',
        }}
      >
        {title || 'Untitled'}
      </h2>
      
      {subtitle && (
        <p 
          className="text-lg md:text-xl text-center mt-5 z-10 max-w-2xl"
          style={{ 
            color: '#FFFFFF', 
            fontFamily: design.bodyFont, 
            opacity: 0.92,
            textShadow: '1px 1px 3px rgba(0,0,0,0.2)',
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

function SectionSlide({ design, title }: SlideProps) {
  const darkAccent = darkenColor(design.accentColor.replace('#', ''), 0.15);
  
  return (
    <div className="w-full h-full flex" style={{ backgroundColor: design.backgroundColor }}>
      <div 
        className="w-1/2 h-full flex flex-col justify-center p-10 relative overflow-hidden"
        style={{ backgroundColor: design.accentColor }}
      >
        {/* Decorative elements */}
        <div 
          className="absolute top-10 right-10 w-24 h-24 rounded-full"
          style={{ 
            backgroundColor: `#${darkAccent}`,
            opacity: 0.3,
          }}
        />
        
        <h2 
          className="text-3xl md:text-4xl font-bold relative z-10"
          style={{ color: '#FFFFFF', fontFamily: design.titleFont }}
        >
          {title || 'Section'}
        </h2>
        <div 
          className="h-1.5 w-1/3 mt-4 rounded relative z-10"
          style={{ backgroundColor: '#FFFFFF' }}
        />
      </div>
      
      <div className="w-1/2 h-full flex items-center justify-center p-10">
        <div 
          className="text-6xl opacity-10"
          style={{ color: design.accentColor }}
        >
          •
        </div>
      </div>
    </div>
  );
}

interface ContentSlideProps extends SlideProps {
  content: string[];
  isTwoColumn: boolean;
}

function ContentSlide({ design, title, content, isTwoColumn }: ContentSlideProps) {
  const darkAccent = darkenColor(design.accentColor.replace('#', ''), 0.2);
  const lightAccent = lightenColor(design.accentColor.replace('#', ''), 0.4);

  return (
    <div className="w-full h-full flex flex-col" style={{ backgroundColor: design.backgroundColor }}>
      {/* Header with gradient */}
      <div 
        className="w-full flex items-center p-6 relative"
        style={{ 
          background: `linear-gradient(135deg, ${design.accentColor} 0%, #${darkAccent} 100%)`,
          minHeight: '20%',
        }}
      >
        {/* Decorative circle */}
        <div 
          className="absolute -left-5 -top-5 w-20 h-20 rounded-full"
          style={{ 
            backgroundColor: `#${lightAccent}`,
            opacity: 0.3,
          }}
        />
        
        <h2 
          className="text-2xl md:text-3xl font-bold relative z-10"
          style={{ color: '#FFFFFF', fontFamily: design.titleFont }}
        >
          {title || 'Slide Title'}
        </h2>
      </div>

      {/* Content */}
      <div 
        className={cn(
          "flex-1 p-6 overflow-auto",
          isTwoColumn ? "flex flex-row gap-6" : ""
        )}
        style={{ fontFamily: design.bodyFont, color: design.textColor }}
      >
        {isTwoColumn ? (
          <>
            <ContentColumn 
              content={content.slice(0, Math.ceil(content.length / 2))} 
              accentColor={design.accentColor}
            />
            <div 
              className="w-px self-stretch"
              style={{ backgroundColor: design.accentColor, opacity: 0.3 }}
            />
            <ContentColumn 
              content={content.slice(Math.ceil(content.length / 2))} 
              accentColor={design.accentColor}
            />
          </>
        ) : (
          <ContentColumn content={content} accentColor={design.accentColor} />
        )}
      </div>
    </div>
  );
}

function ContentColumn({ content, accentColor }: { content: string[]; accentColor: string }) {
  if (content.length === 0) {
    return <div className="flex-1" />;
  }

  return (
    <ul className="flex-1 space-y-3 list-none">
      {content.map((item, index) => (
        <li key={index} className="flex items-start gap-3 text-sm md:text-base leading-relaxed">
          <span 
            className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5"
            style={{ backgroundColor: accentColor }}
          >
            {index + 1}
          </span>
          <span className="flex-1">{item}</span>
        </li>
      ))}
    </ul>
  );
}

// Helper functions
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
  const num = parseInt(hexColor.replace('#', ''), 16);
  const r = (num >> 16) & 0xFF;
  const g = (num >> 8) & 0xFF;
  const b = num & 0xFF;
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 128;
}