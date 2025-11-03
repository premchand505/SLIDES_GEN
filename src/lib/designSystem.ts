// lib/designSystem.ts - FINAL REDESIGN (with typo fix)

export type DesignTemplate = 
  | 'executive'
  | 'tech'
  | 'editorial'
  | 'minimalist'
  | 'split';

export type ColorPalette = {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  textLight: string;
};

// This is our advanced layout system
type Box = { x: number; y: number; w: number; h: number; };
type TextOptions = {
  align?: 'left' | 'center' | 'right';
  valign?: 'top' | 'middle' | 'bottom';
  bold?: boolean;
  fontSize?: number;
};

export type SlideLayoutConfig = {
  titleBox: Box & TextOptions;
  subtitleBox?: Box & TextOptions;
  contentBox?: Box & TextOptions;
  contentBoxTwo?: Box & TextOptions;
  imageBox?: Box;
  decorativeElements: DecorativeElement[];
};

export type DecorativeElement = {
  type: 'circle' | 'rectangle' | 'triangle' | 'line' | 'gradient';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  opacity: number;
  rotation?: number;
};

export const DESIGN_TEMPLATES: Record<DesignTemplate, {
  palette: ColorPalette;
  titleLayout: SlideLayoutConfig;
  sectionLayout: SlideLayoutConfig;
  contentLayout: SlideLayoutConfig;
  twoColumnLayout: SlideLayoutConfig;
  fonts: { title: string; body: string };
  description: string;
}> = {

  'executive': {
    description: 'Clean, corporate design with a strong sidebar and neutral colors.',
    palette: {
      primary: '1A2332',
      secondary: 'E0E0E0',
      accent: '3B82F6',
      background: 'FFFFFF',
      text: '1A2332',
      textLight: 'FFFFFF',
    },
    fonts: { title: 'Helvetica', body: 'Helvetica' },
    titleLayout: {
      titleBox: { x: 0.5, y: 2.0, w: 9, h: 1.5, align: 'left', fontSize: 48, bold: true },
      subtitleBox: { x: 0.5, y: 3.5, w: 9, h: 0.8, align: 'left', fontSize: 24 },
      decorativeElements: [
        { type: 'rectangle', x: 0, y: 0, width: 3.5, height: 5.625, color: '1A2332', opacity: 100, rotation: 0 },
        { type: 'line', x: 0.5, y: 1.8, width: 2, height: 0.08, color: '3B82F6', opacity: 100, rotation: 0 },
      ],
    },
    sectionLayout: {
      titleBox: { x: 0.5, y: 2.5, w: 9, h: 0.8, align: 'center', fontSize: 40, bold: true },
      decorativeElements: [
        { type: 'rectangle', x: 0, y: 0, width: 10, height: 1.2, color: '1A2332', opacity: 100, rotation: 0 },
        { type: 'line', x: 3, y: 3.5, width: 4, height: 0.08, color: '3B82F6', opacity: 100, rotation: 0 },
      ],
    },
    contentLayout: {
      titleBox: { x: 1.2, y: 0.5, w: 8.3, h: 0.8, align: 'left', fontSize: 32, bold: true },
      contentBox: { x: 1.2, y: 1.5, w: 5.0, h: 3.7 },
      imageBox: { x: 6.5, y: 1.5, w: 3.0, h: 3.7 },
      decorativeElements: [
        { type: 'rectangle', x: 0, y: 0, width: 0.8, height: 5.625, color: '1A2332', opacity: 100, rotation: 0 },
        { type: 'line', x: 1.2, y: 1.3, width: 8.3, height: 0.02, color: 'E0E0E0', opacity: 100, rotation: 0 },
      ],
    },
    twoColumnLayout: {
      titleBox: { x: 1.2, y: 0.5, w: 8.3, h: 0.8, align: 'left', fontSize: 32, bold: true },
      contentBox: { x: 1.2, y: 1.5, w: 4.0, h: 3.7 },
      contentBoxTwo: { x: 5.5, y: 1.5, w: 4.0, h: 3.7 },
      decorativeElements: [
        { type: 'rectangle', x: 0, y: 0, width: 0.8, height: 5.625, color: '1A2332', opacity: 100, rotation: 0 },
        { type: 'line', x: 1.2, y: 1.3, width: 8.3, height: 0.02, color: 'E0E0E0', opacity: 100, rotation: 0 },
      ],
    },
  },

  'tech': {
    description: 'Sleek, modern dark mode template.',
    palette: {
      primary: '0F172A',
      secondary: '3B82F6',
      accent: '06B6D4',
      background: '0F172A',
      text: 'F1F5F9',
      textLight: '94A3B8',
    },
    fonts: { title: 'Arial', body: 'Arial' },
    titleLayout: {
      titleBox: { x: 0.5, y: 2.0, w: 9, h: 1.5, align: 'center', fontSize: 48, bold: true },
      subtitleBox: { x: 0.5, y: 3.5, w: 9, h: 0.8, align: 'center', fontSize: 24 },
      decorativeElements: [
        { type: 'circle', x: 7, y: -1, width: 4, height: 4, color: '3B82F6', opacity: 10, rotation: 0 },
        { type: 'circle', x: -1, y: 3, width: 3, height: 3, color: '06B6D4', opacity: 15, rotation: 0 },
      ],
    },
    sectionLayout: {
      titleBox: { x: 0.5, y: 2.5, w: 9, h: 0.8, align: 'left', fontSize: 40, bold: true },
      decorativeElements: [
        { type: 'line', x: 0.5, y: 3.5, width: 4, height: 0.08, color: '06B6D4', opacity: 100, rotation: 0 },
      ],
    },
    contentLayout: {
      titleBox: { x: 4.0, y: 0.5, w: 5.5, h: 0.8, align: 'left', fontSize: 32, bold: true },
      contentBox: { x: 4.0, y: 1.5, w: 5.5, h: 3.7 },
      imageBox: { x: 0.5, y: 0.5, w: 3.2, h: 4.7 },
      decorativeElements: [
        { type: 'line', x: 0, y: 0.1, width: 10, height: 0.03, color: '3B82F6', opacity: 50, rotation: 0 },
      ],
    },
    twoColumnLayout: {
      titleBox: { x: 0.5, y: 0.25, w: 9, h: 0.8, align: 'left', fontSize: 32, bold: true },
      contentBox: { x: 0.5, y: 1.2, w: 4.4, h: 4.0 },
      contentBoxTwo: { x: 5.1, y: 1.2, w: 4.4, h: 4.0 },
      decorativeElements: [
        { type: 'line', x: 4.95, y: 1.2, width: 0.03, height: 4.0, color: '06B6D4', opacity: 70, rotation: 0 },
      ],
    },
  },

  'editorial': {
    description: 'Elegant, clean, magazine-style layout with a focus on large images.',
    palette: {
      primary: '5A7D7C',
      secondary: '111111',
      accent: 'D4A373',
      background: 'FFFFFF',
      text: '111111',
      textLight: 'FFFFFF',
    },
    fonts: { title: 'Georgia', body: 'Georgia' },
    titleLayout: {
      titleBox: { x: 0.5, y: 2.0, w: 9, h: 1.5, align: 'center', fontSize: 52, bold: true },
      subtitleBox: { x: 0.5, y: 3.5, w: 9, h: 0.8, align: 'center', fontSize: 24 },
      decorativeElements: [
        { type: 'line', x: 1, y: 1.8, width: 8, height: 0.02, color: '111111', opacity: 100, rotation: 0 },
        { type: 'line', x: 1, y: 4.5, width: 8, height: 0.02, color: '111111', opacity: 100, rotation: 0 },
      ],
    },
    sectionLayout: {
      titleBox: { x: 0.5, y: 2.5, w: 9, h: 0.8, align: 'right', fontSize: 40, bold: true },
      decorativeElements: [
        { type: 'rectangle', x: 0, y: 0, width: 10, height: 5.625, color: '5A7D7C', opacity: 100, rotation: 0 },
        { type: 'line', x: 7, y: 3.5, width: 2.5, height: 0.05, color: 'FFFFFF', opacity: 100, rotation: 0 },
      ],
    },
    contentLayout: {
      titleBox: { x: 0.5, y: 0.2, w: 9, h: 0.8, align: 'left', fontSize: 32, bold: true },
      imageBox: { x: 0.5, y: 1.1, w: 9, h: 2.5 },
      contentBox: { x: 0.5, y: 3.8, w: 9, h: 1.6 },
      decorativeElements: [
        { type: 'line', x: 0.5, y: 1.0, width: 9, height: 0.02, color: 'E0E0E0', opacity: 100, rotation: 0 },
      ],
    },
    twoColumnLayout: {
      titleBox: { x: 0.5, y: 0.2, w: 9, h: 0.8, align: 'left', fontSize: 32, bold: true },
      imageBox: { x: 0.5, y: 1.1, w: 9, h: 2.5 },
      contentBox: { x: 0.5, y: 3.8, w: 4.4, h: 1.6 },
      contentBoxTwo: { x: 5.1, y: 3.8, w: 4.4, h: 1.6 },
      decorativeElements: [
        { type: 'line', x: 0.5, y: 1.0, width: 9, height: 0.02, color: 'E0E0E0', opacity: 100, rotation: 0 },
      ],
    },
  },

  'minimalist': {
    description: 'Clean, simple, and elegant, focusing on typography.',
    palette: {
      primary: 'E07A5F',
      secondary: '3D405B',
      accent: '81B29A',
      background: 'FAF8F6',
      text: '3D405B',
      textLight: 'FFFFFF',
    },
    fonts: { title: 'Calibri', body: 'Calibri' },
    titleLayout: {
      titleBox: { x: 0.5, y: 2.5, w: 9, h: 1.5, align: 'center', fontSize: 48, bold: true },
      subtitleBox: { x: 0.5, y: 3.5, w: 9, h: 0.8, align: 'center', fontSize: 24 },
      decorativeElements: [
        { type: 'line', x: 4, y: 2.3, width: 2, height: 0.05, color: 'E07A5F', opacity: 100, rotation: 0 },
      ],
    },
    sectionLayout: {
      titleBox: { x: 0.5, y: 2.5, w: 9, h: 0.8, align: 'center', fontSize: 40, bold: true },
      decorativeElements: [
        { type: 'line', x: 1, y: 3.5, width: 8, height: 0.03, color: 'E07A5F', opacity: 70, rotation: 0 },
      ],
    },
    contentLayout: {
      titleBox: { x: 0.5, y: 0.5, w: 5.8, h: 0.8, align: 'left', fontSize: 28, bold: true },
      contentBox: { x: 0.5, y: 1.5, w: 5.8, h: 3.7 },
      imageBox: { x: 6.6, y: 1.5, w: 3.1, h: 3.7 },
      decorativeElements: [
        { type: 'line', x: 0.5, y: 1.3, width: 9, height: 0.02, color: 'E0E0E0', opacity: 100, rotation: 0 },
      ],
    },
    twoColumnLayout: {
      titleBox: { x: 0.5, y: 0.5, w: 9, h: 0.8, align: 'left', fontSize: 28, bold: true },
      contentBox: { x: 0.5, y: 1.5, w: 4.4, h: 3.7 },
      contentBoxTwo: { x: 5.1, y: 1.5, w: 4.4, h: 3.7 },
      imageBox: { x: 6.6, y: 1.5, w: 3.1, h: 2.5 },
      decorativeElements: [
        { type: 'line', x: 0.5, y: 1.3, width: 9, height: 0.02, color: 'E0E0E0', opacity: 100, rotation: 0 },
      ],
    },
  },

  'split': {
    description: 'A bold, modern split-screen layout.',
    palette: {
      primary: '20B2AA',
      secondary: '111111',
      accent: 'FFD700',
      background: 'FFFFFF',
      text: '111111',
      textLight: 'FFFFFF',
    },
    fonts: { title: 'Arial', body: 'Calibri' },
    titleLayout: {
      titleBox: { x: 0.5, y: 2.0, w: 4.0, h: 1.5, align: 'left', fontSize: 48, bold: true },
      subtitleBox: { x: 0.5, y: 3.5, w: 4.0, h: 0.8, align: 'left', fontSize: 24 },
      imageBox: { x: 5, y: 0, w: 5, h: 5.625 },
      decorativeElements: [],
    },
    sectionLayout: {
      titleBox: { x: 0.5, y: 2.5, w: 9, h: 0.8, align: 'center', fontSize: 40, bold: true },
      decorativeElements: [
        { type: 'rectangle', x: 0, y: 0, width: 10, height: 5.625, color: '20B2AA', opacity: 100, rotation: 0 },
      ],
    },
    contentLayout: {
      titleBox: { x: 5.2, y: 0.5, w: 4.3, h: 1.2, align: 'left', fontSize: 32, bold: true },
      contentBox: { x: 5.2, y: 1.8, w: 4.3, h: 3.4 },
      imageBox: { x: 0, y: 0, w: 5, h: 5.625 },
      decorativeElements: [],
    },
    twoColumnLayout: {
      titleBox: { x: 0.5, y: 0.25, w: 9, h: 0.8, align: 'center', fontSize: 32, bold: true },
      contentBox: { x: 0.5, y: 1.2, w: 4.4, h: 4.0 },
      contentBoxTwo: { x: 5.1, y: 1.2, w: 4.4, h: 4.0 },
      decorativeElements: [
        { type: 'line', x: 4.95, y: 1.2, width: 0.03, height: 4.0, color: '20B2AA', opacity: 70, rotation: 0 },
      ],
    },
  },
};

// Enhanced image categories (Unchanged)
export const IMAGE_CATEGORIES: Record<string, string> = {
  technology: 'technology,digital,innovation,future',
  business: 'business,professional,corporate,office',
  finance: 'finance,banking,investment,money',
  education: 'education,learning,knowledge,study',
  health: 'health,medical,wellness,care',
  nature: 'nature,landscape,environment,natural',
  science: 'science,research,laboratory,experiment',
  art: 'art,creative,design,artistic',
  sports: 'sports,fitness,athletic,exercise',
  food: 'food,cuisine,culinary,dining',
  travel: 'travel,destination,explore,journey',
  marketing: 'marketing,advertising,campaign,brand',
  sustainability: 'sustainability,eco,green,environment',
  innovation: 'innovation,breakthrough,future,advancement',
  default: 'abstract,modern,minimal,professional',
};

// Smarter Template Selector (Unchanged)
export function selectTemplateFromTopic(topic: string): DesignTemplate {
  const lower = topic.toLowerCase();
  
  if (['business', 'corporate', 'finance', 'executive', 'banking', 'professional', 'investment'].some(k => lower.includes(k))) {
    return 'executive';
  }
  
  if (['tech', 'ai', 'software', 'digital', 'innovation', 'future', 'data', 'cyber', 'science'].some(k => lower.includes(k))) {
    return 'tech';
  }
  
  if (['history', 'ancient', 'rome', 'greece', 'war', 'culture', 'philosophy'].some(k => lower.includes(k))) {
    return 'editorial';
  }
  
  if (['creative', 'art', 'design', 'marketing', 'brand', 'mythology', 'music', 'fashion'].some(k => lower.includes(k))) {
    return 'split';
  }

  return 'minimalist';
}

// getImageQuery (Unchanged)
export function getImageQuery(topic: string): string {
  const lower = topic.toLowerCase();
  for (const [key, value] of Object.entries(IMAGE_CATEGORIES)) {
    if (lower.includes(key)) {
      return value;
    }
  }
  // === ⬇️ FIX: Typo corrected ===
  return IMAGE_CATEGORIES.default;
  // === ⬆️ END FIX ===
}

// getImageUrl (Unchanged)
export async function getImageUrl(query: string, width = 1920, height = 1080): Promise<string> {
  const PEXELS_KEY = process.env.PEXELS_API_KEY;
  if (!PEXELS_KEY) {
    console.warn('PEXELS_API_KEY is not set. Returning placeholder.');
    return `https://loremflickr.com/${width}/${height}/error`;
  }

  const orientation = width > height ? 'landscape' : 'portrait';
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=${orientation}`;

  try {
    const res = await fetch(url, {
      headers: {
        'Authorization': PEXELS_KEY
      }
    });

    if (!res.ok) {
      console.warn(`Pexels API error: ${res.statusText}`);
      return `https://loremflickr.com/${width}/${height}/server,error`;
    }

    const data = await res.json();
    const photo = data.photos?.[0];

    const imageUrl = photo?.src?.large2x; 
    
    if (imageUrl) {
      return imageUrl;
    } else {
      console.warn('No images found on Pexels for query:', query);
      return `https://loremflickr.com/${width}/${height}/not,found`;
    }

  } catch (error) {
    console.error('Error fetching from Pexels:', error);
    return `https://loremflickr.com/${width}/${height}/fetch,error`;
  }
}

// getTemplateDescription (Unchanged)
export function getTemplateDescription(template: DesignTemplate): string {
  return DESIGN_TEMPLATES[template].description;
}