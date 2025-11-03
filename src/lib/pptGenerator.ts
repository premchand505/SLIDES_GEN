// lib/pptGenerator.ts
import PptxGenJS from 'pptxgenjs';
import { PPTData, SlideDesign, SlideLayout } from '@/types';
import { DESIGN_TEMPLATES, getUnsplashUrl, type DesignTemplate } from '@/lib/designSystem';

function normalizeLayout(rawLayout: SlideLayout | undefined): SlideLayout {
  if (!rawLayout) return 'content';
  const validLayouts: SlideLayout[] = ['title', 'content', 'section', 'twocolumn'];
  return validLayouts.includes(rawLayout) ? rawLayout : 'content';
}

function cleanText(text: string | undefined | unknown): string {
  if (!text) return '';
  if (typeof text !== 'string') return String(text);
  return text.replace(/\*\*/g, '').replace(/\*/g, '');
}

function cleanTextArray(arr: unknown[]): Array<{ text: string }> {
  return arr
    .filter(item => item != null)
    .map(item => ({ text: cleanText(item) }));
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const num = parseInt(hex.replace('#', ''), 16);
  return {
    r: (num >> 16) & 0xFF,
    g: (num >> 8) & 0xFF,
    b: num & 0xFF,
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  return ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

function lightenColor(hexColor: string, percent: number): string {
  const { r, g, b } = hexToRgb(hexColor);
  const newR = Math.min(255, Math.floor(r + (255 - r) * percent));
  const newG = Math.min(255, Math.floor(g + (255 - g) * percent));
  const newB = Math.min(255, Math.floor(b + (255 - b) * percent));
  return rgbToHex(newR, newG, newB);
}

function darkenColor(hexColor: string, percent: number): string {
  const { r, g, b } = hexToRgb(hexColor);
  return rgbToHex(
    Math.floor(r * (1 - percent)),
    Math.floor(g * (1 - percent)),
    Math.floor(b * (1 - percent))
  );
}

function isColorDark(hexColor: string): boolean {
  const { r, g, b } = hexToRgb(hexColor);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 128;
}

async function addImageToSlide(
  slide: PptxGenJS.Slide,
  imageUrl: string,
  x: number,
  y: number,
  width: number,
  height: number,
  opacity: number = 100
): Promise<void> {
  try {
    slide.addImage({
      path: imageUrl,
      x,
      y,
      w: width,
      h: height,
      sizing: { type: 'cover', w: width, h: height },
      transparency: 100 - opacity,
    });
  } catch (error) {
    console.warn('Failed to add image:', error);
  }
}

export const generatePresentationAsBase64 = async (
  pptData: PPTData
): Promise<string> => {
  if (!pptData?.slides?.length) {
    throw new Error('Invalid PPT data: "slides" array is required.');
  }

  const pres = new PptxGenJS();
  pres.layout = 'LAYOUT_16x9';
  pres.author = 'AI PowerPoint Generator';
  pres.title = pptData.title ?? 'AI Generated Presentation';

  const globalTheme = pptData.globalTheme;
  const template = (pptData.template || 'modern-geometric') as DesignTemplate;
  const templateConfig = DESIGN_TEMPLATES[template];
  const imageQuery = globalTheme?.imageQuery || 'abstract,modern';

  console.log(`🎨 Using template: ${template}`);

  for (let i = 0; i < pptData.slides.length; i++) {
    const slideData = pptData.slides[i];
    
    // Enforce consistent design from globalTheme
    const design: SlideDesign = {
      backgroundColor: globalTheme?.backgroundColor || 'FFFFFF',
      textColor: globalTheme?.textColor || '2C3E50',
      titleFont: globalTheme?.titleFont || 'Arial',
      bodyFont: globalTheme?.bodyFont || 'Calibri',
      accentColor: globalTheme?.accentColor || '3498DB',
    };

    const cleanedDesign = {
      backgroundColor: design.backgroundColor.replace('#', ''),
      textColor: design.textColor.replace('#', ''),
      titleFont: design.titleFont,
      bodyFont: design.bodyFont,
      accentColor: design.accentColor.replace('#', ''),
    };

    const layoutKey = normalizeLayout(slideData.layout);
    const slide = pres.addSlide();
    
    const isDarkBg = isColorDark(cleanedDesign.backgroundColor);
    const primaryTextColor = isDarkBg ? 'FFFFFF' : cleanedDesign.textColor;
    const lightAccent = lightenColor(cleanedDesign.accentColor, 0.3);
    const darkAccent = darkenColor(cleanedDesign.accentColor, 0.2);

    try {
      switch (layoutKey) {
        case 'title': {
          const titleLayout = templateConfig.titleLayout;
          
          // Background
          slide.background = { fill: cleanedDesign.accentColor };

          // Add decorative elements from template
          titleLayout.decorativeElements.forEach(elem => {
            const pxToInch = (px: number) => px / 96; // 96 DPI standard
            
            switch (elem.type) {
              case 'circle':
                slide.addShape(pres.ShapeType.ellipse, {
                  x: pxToInch(elem.x),
                  y: pxToInch(elem.y),
                  w: pxToInch(elem.width),
                  h: pxToInch(elem.height),
                  fill: { color: elem.color, transparency: 100 - elem.opacity },
                  line: { type: 'none' },
                });
                break;
              case 'rectangle':
                slide.addShape(pres.ShapeType.rect, {
                  x: pxToInch(elem.x),
                  y: pxToInch(elem.y),
                  w: pxToInch(elem.width),
                  h: pxToInch(elem.height),
                  fill: { color: elem.color, transparency: 100 - elem.opacity },
                  line: { type: 'none' },
                  rotate: elem.rotation || 0,
                });
                break;
              case 'triangle':
                slide.addShape(pres.ShapeType.rtTriangle, {
                  x: pxToInch(elem.x),
                  y: pxToInch(elem.y),
                  w: pxToInch(elem.width),
                  h: pxToInch(elem.height),
                  fill: { color: elem.color, transparency: 100 - elem.opacity },
                  line: { type: 'none' },
                  rotate: elem.rotation || 0,
                });
                break;
              case 'line':
                slide.addShape(pres.ShapeType.rect, {
                  x: pxToInch(elem.x),
                  y: pxToInch(elem.y),
                  w: pxToInch(elem.width),
                  h: pxToInch(elem.height),
                  fill: { color: elem.color, transparency: 100 - elem.opacity },
                  line: { type: 'none' },
                });
                break;
            }
          });

          // Add image if template supports it (commented out to avoid unused var warning)
           if (templateConfig.imageStyle === 'overlay') {
             const imageUrl = getUnsplashUrl(imageQuery + ',gradient', 1920, 1080);
             await addImageToSlide(slide, imageUrl, 0, 0, 10, 5.625, 20);
           }

          // Title
          slide.addText(cleanText(slideData.title) ?? 'Untitled', {
            x: 1, y: 1.8, w: 8, h: 1.5,
            fontSize: 52,
            bold: true,
            color: 'FFFFFF',
            align: 'center',
            valign: 'middle',
            fontFace: cleanedDesign.titleFont,
            shadow: {
              type: 'outer',
              blur: 10,
              offset: 5,
              angle: 45,
              color: '000000',
              opacity: 0.4,
            },
          });

          // Subtitle
          if (slideData.subtitle) {
            slide.addText(cleanText(slideData.subtitle), {
              x: 1.5, y: 3.5, w: 7, h: 0.8,
              fontSize: 24,
              color: 'FFFFFF',
              align: 'center',
              fontFace: cleanedDesign.bodyFont,
              transparency: 10,
            });
          }
          break;
        }

        case 'section': {
          slide.background = { fill: cleanedDesign.backgroundColor };

          // Left colored panel
          slide.addShape(pres.ShapeType.rect, {
            x: 0, y: 0, w: 5, h: 5.625,
            fill: { color: cleanedDesign.accentColor },
            line: { type: 'none' },
          });

          // Decorative elements from template
          const contentLayout = templateConfig.contentLayout;
          contentLayout.decorativeElements.forEach(elem => {
            const pxToInch = (px: number) => px / 96;
            
            if (elem.type === 'rectangle') {
              slide.addShape(pres.ShapeType.rect, {
                x: pxToInch(elem.x),
                y: pxToInch(elem.y),
                w: pxToInch(elem.width),
                h: pxToInch(elem.height),
                fill: { color: elem.color, transparency: 100 - elem.opacity },
                line: { type: 'none' },
              });
            }
          });

          // Section title
          slide.addText(cleanText(slideData.title) ?? 'Section', {
            x: 0.5, y: 2.3, w: 4, h: 1.2,
            fontSize: 44,
            bold: true,
            color: 'FFFFFF',
            align: 'left',
            valign: 'middle',
            fontFace: cleanedDesign.titleFont,
          });

          // Accent line
          slide.addShape(pres.ShapeType.rect, {
            x: 0.5, y: 3.6, w: 2, h: 0.08,
            fill: { color: 'FFFFFF' },
            line: { type: 'none' },
          });
          break;
        }

        case 'twocolumn':
        case 'content':
        default: {
          slide.background = { fill: cleanedDesign.backgroundColor };

          // Add background image for supported templates (commented to avoid unused warnings)
           if (templateConfig.imageStyle === 'overlay') {
             const imageUrl = getUnsplashUrl(imageQuery, 1920, 1080);
             await addImageToSlide(slide, imageUrl, 0, 0, 10, 5.625, 15);
           } else if (templateConfig.imageStyle === 'side') {
            const imageUrl = getUnsplashUrl(imageQuery, 960, 1080);
            await addImageToSlide(slide, imageUrl, 5, 1.5, 5, 4, 30);
          }

          // Header bar
          slide.addShape(pres.ShapeType.rect, {
            x: 0, y: 0, w: 10, h: 1.2,
            fill: { color: cleanedDesign.accentColor },
            line: { type: 'none' },
          });

          // Apply template decorative elements
          const contentLayout = templateConfig.contentLayout;
          contentLayout.decorativeElements.forEach(elem => {
            const pxToInch = (px: number) => px / 96;
            
            switch (elem.type) {
              case 'circle':
                slide.addShape(pres.ShapeType.ellipse, {
                  x: pxToInch(elem.x),
                  y: pxToInch(elem.y),
                  w: pxToInch(elem.width),
                  h: pxToInch(elem.height),
                  fill: { color: elem.color, transparency: 100 - elem.opacity },
                  line: { type: 'none' },
                });
                break;
              case 'rectangle':
                slide.addShape(pres.ShapeType.rect, {
                  x: pxToInch(elem.x),
                  y: pxToInch(elem.y),
                  w: pxToInch(elem.width),
                  h: pxToInch(elem.height),
                  fill: { color: elem.color, transparency: 100 - elem.opacity },
                  line: { type: 'none' },
                });
                break;
            }
          });

          // Title
          slide.addText(cleanText(slideData.title) ?? 'Slide Title', {
            x: 0.6, y: 0.3, w: 8.5, h: 0.6,
            fontSize: 36,
            bold: true,
            color: 'FFFFFF',
            valign: 'middle',
            fontFace: cleanedDesign.titleFont,
          });

          // Content
          if (slideData.content && slideData.content.length > 0) {
            if (layoutKey === 'twocolumn') {
              const mid = Math.ceil(slideData.content.length / 2);
              const left = cleanTextArray(slideData.content.slice(0, mid));
              const right = cleanTextArray(slideData.content.slice(mid));

              // Separator
              slide.addShape(pres.ShapeType.rect, {
                x: 4.95, y: 1.8, w: 0.1, h: 3.5,
                fill: { color: cleanedDesign.accentColor, transparency: 30 },
                line: { type: 'none' },
              });

              if (left.length > 0) {
                slide.addText(left, {
                  x: 0.6, y: 1.8, w: 4, h: 3.5,
                  fontSize: 16,
                  bullet: { type: 'number' },
                  color: primaryTextColor,
                  fontFace: cleanedDesign.bodyFont,
                  lineSpacing: 24,
                });
              }

              if (right.length > 0) {
                slide.addText(right, {
                  x: 5.3, y: 1.8, w: 4, h: 3.5,
                  fontSize: 16,
                  bullet: { type: 'number' },
                  color: primaryTextColor,
                  fontFace: cleanedDesign.bodyFont,
                  lineSpacing: 24,
                });
              }
            } else {
              slide.addText(cleanTextArray(slideData.content), {
                x: 0.6, y: 1.8, w: 8.8, h: 3.5,
                fontSize: 18,
                bullet: { type: 'number' },
                color: primaryTextColor,
                fontFace: cleanedDesign.bodyFont,
                lineSpacing: 26,
              });
            }
          }
          break;
        }
      }

      // Add slide number
      slide.addText(`${i + 1}`, {
        x: 9.2, y: 5.2, w: 0.6, h: 0.3,
        fontSize: 10,
        color: primaryTextColor,
        align: 'right',
        transparency: 50,
      });

    } catch (err) {
      console.error(`Error processing slide ${i + 1}:`, err);
    }
  }

  const result = await pres.write({ outputType: 'base64' });
  if (typeof result !== 'string') {
    throw new Error('Failed to generate base64 string');
  }
  return result;
};