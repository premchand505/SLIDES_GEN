// NO 'use client' – runs only on the server
import PptxGenJS from 'pptxgenjs';
import { PPTData, SlideDesign, SlideLayout } from '@/types';

// --------------------------
// ✅ FIXED: Type-safe layout normalization
// --------------------------
function normalizeLayout(rawLayout: SlideLayout | undefined): SlideLayout {
  if (!rawLayout) return 'content';
  
  const validLayouts: SlideLayout[] = ['title', 'content', 'section', 'twocolumn'];
  
  if (validLayouts.includes(rawLayout)) {
    return rawLayout;
  }
  
  console.warn(`[PPT Generator] Unknown layout "${rawLayout}". Using "content".`);
  return 'content';
}

// --------------------------
// Helper to clean AI text
// --------------------------
function cleanText(text: string | undefined): string {
  if (!text) return '';
  return text.replace(/\*\*/g, '').replace(/\*/g, '');
}

function cleanTextArray(arr: string[]): Array<{ text: string }> {
  return arr.map(t => ({ text: cleanText(t) }));
}

// --------------------------
// Design helper functions
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

// --------------------------
// Main generation function
// --------------------------
export const generatePresentationAsBase64 = async (
  pptData: PPTData
): Promise<string> => {
  if (!pptData?.slides?.length) {
    throw new Error('Invalid PPT data: "slides" array is required and must not be empty.');
  }
  
  const pres = new PptxGenJS();
  pres.layout = 'LAYOUT_16x9';
  pres.author = 'AI PowerPoint Generator';
  pres.title = pptData.title ?? 'AI Generated Presentation';

  const globalTheme = pptData.globalTheme;

  for (let i = 0; i < pptData.slides.length; i++) {
    const slideData = pptData.slides[i];
    
    // Set up the design palette for this slide
    const design: SlideDesign = {
      backgroundColor: slideData.design?.backgroundColor || globalTheme?.backgroundColor || 'FFFFFF',
      textColor: slideData.design?.textColor || globalTheme?.textColor || '2C3E50',
      titleFont: slideData.design?.titleFont || globalTheme?.titleFont || 'Arial',
      bodyFont: slideData.design?.bodyFont || globalTheme?.bodyFont || 'Calibri',
      accentColor: slideData.design?.accentColor || globalTheme?.accentColor || '3498DB',
    };

    // Clean hex codes
    const cleanedDesign = {
      backgroundColor: design.backgroundColor.replace('#', ''),
      textColor: design.textColor.replace('#', ''),
      titleFont: design.titleFont,
      bodyFont: design.bodyFont,
      accentColor: design.accentColor.replace('#', ''),
    };

    const layoutKey = normalizeLayout(slideData.layout);
    const slide = pres.addSlide();
    
    // Determine text colors based on background
    const isDarkBg = isColorDark(cleanedDesign.backgroundColor);
    const primaryTextColor = isDarkBg ? 'FFFFFF' : cleanedDesign.textColor;
    const lightAccent = lightenColor(cleanedDesign.accentColor, 0.2);
    const darkAccent = darkenColor(cleanedDesign.accentColor, 0.2);

    try {
      switch (layoutKey) {
        case 'title': {
          // Modern gradient background
          slide.background = { 
            fill: cleanedDesign.accentColor,
          };

          // Large decorative circle (top right)
          slide.addShape(pres.ShapeType.ellipse, {
            x: 7.5, y: -1, w: 4, h: 4,
            fill: { color: lightAccent, transparency: 40 },
            line: { type: 'none' },
          });

          // Small decorative circle (bottom left)
          slide.addShape(pres.ShapeType.ellipse, {
            x: -0.5, y: 4.5, w: 2.5, h: 2.5,
            fill: { color: darkAccent, transparency: 30 },
            line: { type: 'none' },
          });

          // Diagonal accent line
          slide.addShape(pres.ShapeType.line, {
            x: 0, y: 0, w: 10, h: 0,
            line: { color: 'FFFFFF', width: 8, transparency: 20 },
            rotate: 45,
          });

          // Main title with shadow
          slide.addText(cleanText(slideData.title) ?? 'Untitled', {
            x: 1, y: 2, w: 8, h: 1.5,
            fontSize: 48,
            bold: true,
            color: 'FFFFFF',
            align: 'center',
            valign: 'middle',
            fontFace: cleanedDesign.titleFont,
            shadow: {
              type: 'outer',
              blur: 8,
              offset: 4,
              angle: 45,
              color: '000000',
              opacity: 0.3,
            },
          });

          // Subtitle with elegant styling
          if (slideData.subtitle) {
            slide.addText(cleanText(slideData.subtitle), {
              x: 1.5, y: 3.7, w: 7, h: 0.8,
              fontSize: 22,
              color: 'FFFFFF',
              align: 'center',
              fontFace: cleanedDesign.bodyFont,
              transparency: 10,
            });
          }
          break;
        }

        case 'section': {
          // Split design: colored left, white/light right
          slide.background = { fill: cleanedDesign.backgroundColor };

          // Large colored panel on left
          slide.addShape(pres.ShapeType.rect, {
            x: 0, y: 0, w: 5, h: '100%',
            fill: { color: cleanedDesign.accentColor },
            line: { type: 'none' },
          });

          // Decorative triangle
          slide.addShape(pres.ShapeType.rtTriangle, {
            x: 4.5, y: 2, w: 1.5, h: 1.5,
            fill: { color: lightAccent, transparency: 30 },
            line: { type: 'none' },
            rotate: 180,
          });

          // Section title on colored background
          slide.addText(cleanText(slideData.title) ?? 'Section', {
            x: 0.5, y: 2.5, w: 4, h: 1.2,
            fontSize: 40,
            bold: true,
            color: 'FFFFFF',
            align: 'left',
            valign: 'middle',
            fontFace: cleanedDesign.titleFont,
          });

          // Decorative line under title
          slide.addShape(pres.ShapeType.rect, {
            x: 0.5, y: 3.8, w: 2, h: 0.08,
            fill: { color: 'FFFFFF' },
            line: { type: 'none' },
          });
          break;
        }

        case 'twocolumn':
        case 'content':
        default: {
          slide.background = { fill: cleanedDesign.backgroundColor };

          // Modern header with gradient effect
          slide.addShape(pres.ShapeType.rect, {
            x: 0, y: 0, w: '100%', h: 1.4,
            fill: { color: cleanedDesign.accentColor },
            line: { type: 'none' },
          });

          // Accent stripe
          slide.addShape(pres.ShapeType.rect, {
            x: 0, y: 1.35, w: '100%', h: 0.15,
            fill: { color: darkAccent },
            line: { type: 'none' },
          });

          // Decorative corner element
          slide.addShape(pres.ShapeType.ellipse, {
            x: -0.3, y: -0.3, w: 1, h: 1,
            fill: { color: lightAccent, transparency: 50 },
            line: { type: 'none' },
          });

          // Title with modern styling
          slide.addText(cleanText(slideData.title) ?? 'Slide Title', {
            x: 0.7, y: 0.35, w: 8.5, h: 0.7,
            fontSize: 32,
            bold: true,
            color: 'FFFFFF',
            valign: 'middle',
            fontFace: cleanedDesign.titleFont,
          });

          if (slideData.content && slideData.content.length > 0) {
            if (layoutKey === 'twocolumn') {
              // Two column with visual separator
              const mid = Math.ceil(slideData.content.length / 2);
              const left = cleanTextArray(slideData.content.slice(0, mid));
              const right = cleanTextArray(slideData.content.slice(mid));

              // Vertical separator line
              slide.addShape(pres.ShapeType.rect, {
                x: 4.95, y: 2, w: 0.1, h: 3.5,
                fill: { color: cleanedDesign.accentColor, transparency: 70 },
                line: { type: 'none' },
              });

              if (left.length > 0) {
                slide.addText(left, {
                  x: 0.6, y: 2, w: 4, h: 3.5,
                  fontSize: 16,
                  bullet: { type: 'number' },
                  color: primaryTextColor,
                  fontFace: cleanedDesign.bodyFont,
                  lineSpacing: 22,
                });
              }

              if (right.length > 0) {
                slide.addText(right, {
                  x: 5.4, y: 2, w: 4, h: 3.5,
                  fontSize: 16,
                  bullet: { type: 'number' },
                  color: primaryTextColor,
                  fontFace: cleanedDesign.bodyFont,
                  lineSpacing: 22,
                });
              }
            } else {
              // Single column content with modern bullets
              slide.addText(cleanTextArray(slideData.content), {
                x: 0.7, y: 2, w: 8.6, h: 3.8,
                fontSize: 18,
                bullet: { type: 'number' },
                color: primaryTextColor,
                fontFace: cleanedDesign.bodyFont,
                lineSpacing: 24,
              });

              // Decorative bottom accent
              slide.addShape(pres.ShapeType.rect, {
                x: 0.7, y: 5.9, w: 3, h: 0.06,
                fill: { color: cleanedDesign.accentColor },
                line: { type: 'none' },
              });
            }
          }
          break;
        }
      }
    } catch (err) {
      console.error(`[PPT Generator] Error processing slide ${i + 1}:`, err);
      slide.addText(`Error creating slide ${i + 1}`, {
        x: 1, y: 2, w: 8, fontSize: 24, color: 'FF0000', align: 'center',
      });
    }
  }
  
  const result = await pres.write({ outputType: 'base64' });
  if (typeof result !== 'string') {
    throw new Error('Failed to generate base64 string');
  }
  return result;
};