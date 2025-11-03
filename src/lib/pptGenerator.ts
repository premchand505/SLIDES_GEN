// lib/pptGenerator.ts - FINAL VERSION (Canva-Style Layouts + Error Fixes)
import PptxGenJS from 'pptxgenjs';
import { PPTData, SlideDesign, SlideLayout } from '@/types';
import { DESIGN_TEMPLATES, getImageUrl, type DesignTemplate, SlideLayoutConfig } from '@/lib/designSystem'; // Use getImageUrl

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
  if (!Array.isArray(arr)) return [];
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

// === FIX: Removed unused lightenColor function ===
// === FIX: Removed unused darkenColor function ===

function isColorDark(hexColor: string): boolean {
  const { r, g, b } = hexToRgb(hexColor);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 128;
}

// addImageToSlide (Unchanged)
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
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText} (URL: ${imageUrl})`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.startsWith('image/')) {
      throw new Error(`Response was not an image. Content-Type: ${contentType}`);
    }

    const imageBuffer = await response.arrayBuffer();
    const base64String = Buffer.from(imageBuffer).toString('base64');
    
    slide.addImage({
      data: `data:${contentType};base64,${base64String}`,
      x, y, w: width, h: height,
      sizing: { type: 'cover', w: width, h: height },
      transparency: 100 - opacity,
    });
  } catch (error) {
    console.warn(`Failed to add image from ${imageUrl}:`, error);
  }
}

// === HELPER FUNCTION to add text based on layout config ===
// === FIX: Use the correct 'TextPropsOptions' type ===
function addTextToSlide(slide: PptxGenJS.Slide, box: SlideLayoutConfig['titleBox'], text: string, defaultOptions: PptxGenJS.TextPropsOptions) {
  if (!text || !box) return;
  slide.addText(text, {
    ...defaultOptions,
    ...box,
  });
}

// === HELPER FUNCTION to add elements based on layout config ===
function addDecorativeElements(slide: PptxGenJS.Slide, pres: PptxGenJS, elements: SlideLayoutConfig['decorativeElements']) {
  // === FIX: Removed unused 'pxToInch' variable ===
  elements.forEach(elem => {
    switch (elem.type) {
      case 'circle':
        slide.addShape(pres.ShapeType.ellipse, {
          x: elem.x, y: elem.y, w: elem.width, h: elem.height,
          fill: { color: elem.color, transparency: 100 - elem.opacity },
          line: { type: 'none' },
        });
        break;
      case 'rectangle':
      case 'line': // Treat line as a thin rectangle
        slide.addShape(pres.ShapeType.rect, {
          x: elem.x, y: elem.y, w: elem.width, h: elem.height,
          fill: { color: elem.color, transparency: 100 - elem.opacity },
          line: { type: 'none' },
          rotate: elem.rotation || 0,
        });
        break;
      case 'triangle':
        slide.addShape(pres.ShapeType.rtTriangle, {
          x: elem.x, y: elem.y, w: elem.width, h: elem.height,
          fill: { color: elem.color, transparency: 100 - elem.opacity },
          line: { type: 'none' },
          rotate: elem.rotation || 0,
        });
        break;
    }
  });
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
  const templateName = (pptData.template || 'modern-geometric') as DesignTemplate;
  const templateConfig = DESIGN_TEMPLATES[templateName];

  console.log(`🎨 Using template: ${templateName}`);
  for (let i = 0; i < pptData.slides.length; i++) {
    const slideData = pptData.slides[i];
    
    const design: SlideDesign = {
      backgroundColor: globalTheme?.backgroundColor || templateConfig.palette.background,
      textColor: globalTheme?.textColor || templateConfig.palette.text,
      titleFont: globalTheme?.titleFont || templateConfig.fonts.title,
      bodyFont: globalTheme?.bodyFont || templateConfig.fonts.body,
      accentColor: globalTheme?.accentColor || templateConfig.palette.accent,
    };
    const cleanedDesign = {
      backgroundColor: design.backgroundColor.replace('#', ''),
      textColor: design.textColor.replace('#', ''),
      titleFont: design.titleFont,
      bodyFont: design.bodyFont,
      accentColor: design.accentColor.replace('#', ''),
      titleColor: isColorDark(design.backgroundColor) ? templateConfig.palette.textLight : templateConfig.palette.text,
      bodyColor: isColorDark(design.backgroundColor) ? templateConfig.palette.textLight : templateConfig.palette.text,
    };
    
    const titleSlideTextColor = templateConfig.palette.textLight;

    const layoutKey = normalizeLayout(slideData.layout);
    const slide = pres.addSlide();
    slide.background = { fill: cleanedDesign.backgroundColor };

    try {
      let layout: SlideLayoutConfig;
      
      switch (layoutKey) {
        case 'title':
          layout = templateConfig.titleLayout;
          slide.background = { fill: cleanedDesign.accentColor };
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

      // 1. Add Decorative Elements
      if (layout.decorativeElements) {
        addDecorativeElements(slide, pres, layout.decorativeElements);
      }

      // 2. Add Image
      const slideImageQuery = slideData.imageQuery || globalTheme?.imageQuery || 'abstract';
      
      if (layout.imageBox) {
        const imageUrl = await getImageUrl(slideImageQuery, 1920, 1080);
        const sizing = (layout.imageBox.w === 10 || layout.imageBox.h === 5.625) ? 'cover' : 'contain';
        const opacity = (sizing === 'cover') ? 25 : 100;
        
        await addImageToSlide(
          slide, 
          imageUrl, 
          layout.imageBox.x, 
          layout.imageBox.y, 
          layout.imageBox.w, 
          layout.imageBox.h,
          opacity
        );
        if (sizing === 'cover') {
          cleanedDesign.titleColor = templateConfig.palette.textLight;
          cleanedDesign.bodyColor = templateConfig.palette.textLight;
        }
      }

      // 3. Add Text
      // === FIX: Use 'TextPropsOptions' type ===
      const titleOptions: PptxGenJS.TextPropsOptions = {
        fontFace: cleanedDesign.titleFont,
        color: layoutKey === 'title' ? titleSlideTextColor : cleanedDesign.titleColor,
        margin: 0,
      };
      // === FIX: Use 'TextPropsOptions' type ===
      const bodyOptions: PptxGenJS.TextPropsOptions = {
        fontFace: cleanedDesign.bodyFont,
        color: cleanedDesign.bodyColor,
        margin: 0,
      };
      
      addTextToSlide(slide, layout.titleBox, cleanText(slideData.title) ?? 'Slide Title', titleOptions);
      
      if (layout.subtitleBox) {
        // === FIX: 'fontSize' is valid on TextPropsOptions ===
        addTextToSlide(slide, layout.subtitleBox, cleanText(slideData.subtitle), { ...bodyOptions, fontSize: 24, color: titleSlideTextColor });
      }

      if (layout.contentBox && slideData.content && slideData.content.length > 0) {
        // Handle two-column split
        let content = slideData.content;
        if (layout.contentBoxTwo) {
          const mid = Math.ceil(slideData.content.length / 2);
          content = slideData.content.slice(0, mid);
        }

        slide.addText(cleanTextArray(content), {
          ...bodyOptions,
          ...layout.contentBox,
          bullet: { type: 'number' },
          fontSize: 16,
          lineSpacing: 24,
        });
      }
      
      // 4. Add Second Column Text
      if (layout.contentBoxTwo && slideData.content && slideData.content.length > 1) {
        const mid = Math.ceil(slideData.content.length / 2);
        const rightColContent = slideData.content.slice(mid);
        
        slide.addText(cleanTextArray(rightColContent), {
          ...bodyOptions,
          ...layout.contentBoxTwo,
          bullet: { type: 'number' },
          fontSize: 16,
          lineSpacing: 24,
        });
      }

      slide.addText(`${i + 1}`, {
        x: 9.2, y: 5.2, w: 0.6, h: 0.3,
        fontSize: 10,
        color: cleanedDesign.accentColor,
        align: 'right',
        bold: true,
      });
    } catch (err) {
      console.error(`Error processing slide ${i + 1}:`, err);
    }
  }

  console.log('✅ Generating PPTX...');
  const result = await pres.write({ outputType: 'base64' });
  if (typeof result !== 'string') {
    throw new Error('Failed to generate base64 string');
  }
  return result;
};