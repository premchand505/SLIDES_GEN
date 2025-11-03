// components/SlideCard.tsx
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { SlideContent, SlideDesign, SlideLayout } from '@/types';
import { DESIGN_TEMPLATES, DesignTemplate, SlideLayoutConfig } from '@/lib/designSystem';
import { Loader2 } from 'lucide-react';

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
  templateName: DesignTemplate;
}

const px = (val: number) => `${(val / 10) * 100}%`;
const py = (val: number) => `${(val / 5.625) * 100}%`;
const pw = (val: number) => `${(val / 10) * 100}%`;
const ph = (val: number) => `${(val / 5.625) * 100}%`;

export function SlideCard({ slide, slideNumber, globalTheme, templateName }: SlideCardProps) {
  // === ⬇️ FIX: The fallback is now 'minimalist' ===
  const templateConfig = DESIGN_TEMPLATES[templateName] || DESIGN_TEMPLATES['minimalist'];
  
  const design: SlideDesign = {
    backgroundColor: globalTheme?.backgroundColor || templateConfig.palette.background,
    textColor: globalTheme?.textColor || templateConfig.palette.text,
    titleFont: globalTheme?.titleFont || templateConfig.fonts.title,
    bodyFont: globalTheme?.bodyFont || templateConfig.fonts.body,
    accentColor: globalTheme?.accentColor || templateConfig.palette.accent,
  };

  const layoutKey = normalizeLayout(slide.layout);
  const title = cleanText(slide.title);
  const subtitle = cleanText(slide.subtitle);
  const content = Array.isArray(slide.content) 
    ? slide.content.filter(item => item != null).map(item => cleanText(item))
    : [];

  let layout: SlideLayoutConfig;
  switch (layoutKey) {
    case 'title':
      layout = templateConfig.titleLayout;
      break;
    case 'section':
      layout = templateConfig.sectionLayout;
      break;
    case 'twocolumn':
      layout = templateConfig.twoColumnLayout;
      break;
    case 'content':
    default:
      layout = templateConfig.contentLayout;
      break;
  }
  
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState(true);

  useEffect(() => {
    async function fetchImage() {
      const query = slide.imageQuery || globalTheme?.imageQuery || 'abstract';
      
      if (layout.imageBox) {
        setLoadingImage(true);
        try {
          const response = await fetch(`/api/get-image?query=${encodeURIComponent(query)}`);
          if (!response.ok) {
            throw new Error('Failed to fetch image from proxy');
          }
          const data = await response.json();
          setImageUrl(data.url);
        } catch (error) {
          console.error("Failed to fetch image:", error);
          setImageUrl(null);
        } finally {
          setLoadingImage(false);
        }
      } else {
        setLoadingImage(false);
      }
    }
    fetchImage();
  }, [slide.imageQuery, globalTheme?.imageQuery, layout.imageBox]);


  const isDarkBg = isColorDark(design.backgroundColor.replace('#', ''));
  // Note: We use the TEMPLATE NAME now for the 'split' template check
  const isOverlay = layout.imageBox && (layout.imageBox.w === 10 || (templateName === 'split' && layoutKey === 'title'));
  
  let slideBgColor = design.backgroundColor;
  if (layoutKey === 'title') {
    slideBgColor = design.accentColor;
    // Handle specific title BGs
    if (templateName === 'executive' || templateName === 'tech' || templateName === 'split') {
       slideBgColor = templateConfig.palette.primary;
    }
    if (templateName === 'editorial' || templateName === 'minimalist') {
      slideBgColor = templateConfig.palette.background;
    }
  } else if (layoutKey === 'section') {
     // Most sections have accent bg
    slideBgColor = design.accentColor;
    if (templateName === 'executive' || templateName === 'tech' || templateName === 'minimalist') {
      slideBgColor = templateConfig.palette.background;
    }
    if (templateName === 'editorial') {
      slideBgColor = templateConfig.palette.primary;
    }
  }


  const titleColor = (layoutKey === 'title' || layoutKey === 'section' || isOverlay) 
    ? templateConfig.palette.textLight 
    : (isDarkBg ? templateConfig.palette.textLight : templateConfig.palette.text);
  
  const bodyColor = (isOverlay)
    ? templateConfig.palette.textLight
    : (isDarkBg ? templateConfig.palette.textLight : templateConfig.palette.text);
  
  // Refined title color logic for specific templates
  let finalTitleColor = titleColor;
  if (layoutKey === 'section' && (templateName === 'executive' || templateName === 'minimalist')) {
    finalTitleColor = templateConfig.palette.text; // Dark text on white bg
  }
  if (layoutKey === 'title' && (templateName === 'editorial' || templateName === 'minimalist')) {
     finalTitleColor = templateConfig.palette.text; // Dark text on white bg
  }


  return (
    <div 
      className="w-full h-full aspect-video rounded-lg shadow-2xl overflow-hidden relative border-2"
      style={{ 
        backgroundColor: slideBgColor,
        borderColor: design.accentColor,
      }}
    >
      
      {/* 1. Decorative Elements */}
      {layout.decorativeElements.map((elem, idx) => (
        <div
          key={`deco-${idx}`}
          className="absolute"
          style={{
            left: px(elem.x),
            top: py(elem.y),
            width: pw(elem.width),
            height: ph(elem.height),
            backgroundColor: `#${elem.color}`,
            opacity: elem.opacity / 100,
            transform: `rotate(${elem.rotation || 0}deg)`,
            zIndex: 1, // Decorations behind text
          }}
        />
      ))}

      {/* 2. Image */}
      {layout.imageBox && (
        <div
          className="absolute overflow-hidden"
          style={{
            left: px(layout.imageBox.x),
            top: py(layout.imageBox.y),
            width: pw(layout.imageBox.w),
            height: ph(layout.imageBox.h),
            zIndex: 2, // Image behind text
          }}
        >
          {loadingImage && (
            <div className="w-full h-full flex items-center justify-center bg-muted/30">
              <Loader2 className="w-6 h-6 animate-spin" style={{ color: design.textColor }} />
            </div>
          )}
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={slide.imageQuery || title}
              fill
              className="object-cover"
              style={{
                opacity: isOverlay ? 0.25 : 1,
              }}
              unoptimized={true} 
            />
          )}
        </div>
      )}

      {/* 3. Title */}
      <div
        className="absolute p-4 box-border"
        style={{
          left: px(layout.titleBox.x),
          top: py(layout.titleBox.y),
          width: pw(layout.titleBox.w),
          height: ph(layout.titleBox.h),
          color: finalTitleColor, // Use final logic
          textAlign: layout.titleBox.align || 'left',
          fontFamily: design.titleFont,
          fontSize: `${(layout.titleBox.fontSize || 32) * 0.7}px`,
          fontWeight: layout.titleBox.bold ? 'bold' : 'normal',
          lineHeight: 1.2,
          zIndex: 10,
        }}
      >
        {title || 'Slide Title'}
      </div>

      {/* 4. Subtitle */}
      {layout.subtitleBox && subtitle && (
        <div
          className="absolute p-4 box-border"
          style={{
            left: px(layout.subtitleBox.x),
            top: py(layout.subtitleBox.y),
            width: pw(layout.subtitleBox.w),
            height: ph(layout.subtitleBox.h),
            color: finalTitleColor, // Subtitles follow title color
            textAlign: layout.subtitleBox.align || 'left',
            fontFamily: design.bodyFont,
            fontSize: `${(layout.subtitleBox.fontSize || 24) * 0.7}px`,
            zIndex: 10,
          }}
        >
          {subtitle}
        </div>
      )}

      {/* 5. Content (Column 1) */}
      {layout.contentBox && content.length > 0 && (
        <div
          className="absolute p-4 box-border"
          style={{
            left: px(layout.contentBox.x),
            top: py(layout.contentBox.y),
            width: pw(layout.contentBox.w),
            height: ph(layout.contentBox.h),
            color: bodyColor,
            fontFamily: design.bodyFont,
            zIndex: 10,
          }}
        >
          <ContentColumn 
            content={layout.contentBoxTwo ? content.slice(0, Math.ceil(content.length / 2)) : content} 
            accentColor={design.accentColor} 
          />
        </div>
      )}

      {/* 6. Content (Column 2) */}
      {layout.contentBoxTwo && content.length > 1 && (
        <div
          className="absolute p-4 box-border"
          style={{
            left: px(layout.contentBoxTwo.x),
            top: py(layout.contentBoxTwo.y),
            width: pw(layout.contentBoxTwo.w),
            height: ph(layout.contentBoxTwo.h),
            color: bodyColor,
            fontFamily: design.bodyFont,
            zIndex: 10,
          }}
        >
          <ContentColumn 
            content={content.slice(Math.ceil(content.length / 2))} 
            accentColor={design.accentColor} 
          />
        </div>
      )}

      {/* 7. Slide Number */}
      <div 
        className="absolute bottom-3 right-5 text-xs font-sans font-medium px-2 py-1 rounded z-20"
        style={{ 
          color: (isDarkBg || layoutKey === 'title' || layoutKey === 'section' || isOverlay) ? '#FFFFFF' : design.textColor, 
          backgroundColor: (isDarkBg || layoutKey === 'title' || layoutKey === 'section' || isOverlay)
            ? 'rgba(255,255,255,0.1)' 
            : 'rgba(0,0,0,0.05)',
        }}
      >
        {slideNumber}
      </div>
    </div>
  );
}

function ContentColumn({ content, accentColor }: { content: string[]; accentColor: string }) {
  if (content.length === 0) {
    return <div className="flex-1" />;
  }

  return (
    <ul className="flex-1 space-y-2 list-none">
      {content.map((item, index) => (
        <li key={index} className="flex items-start gap-2 text-xs md:text-sm leading-relaxed">
          <span 
            className="shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5"
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

function isColorDark(hexColor: string): boolean {
  try {
    const num = parseInt(hexColor.replace('#', ''), 16);
    const r = (num >> 16) & 0xFF;
    const g = (num >> 8) & 0xFF;
    const b = num & 0xFF;
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness < 128;
  } catch {
    return false;
  }
}