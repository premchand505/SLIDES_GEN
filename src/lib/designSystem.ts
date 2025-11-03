// lib/designSystem.ts
export type DesignTemplate = 
  | 'executive-minimal'
  | 'tech-gradient' 
  | 'creative-bold'
  | 'elegant-luxury'
  | 'modern-geometric';

export type ColorPalette = {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  textLight: string;
};

export type LayoutPattern = {
  headerHeight: number;
  contentPadding: number;
  accentPosition: 'left' | 'right' | 'top' | 'bottom';
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

// 5 STUNNING DESIGN TEMPLATES
export const DESIGN_TEMPLATES: Record<DesignTemplate, {
  palette: ColorPalette;
  titleLayout: LayoutPattern;
  contentLayout: LayoutPattern;
  fonts: { title: string; body: string };
  imageStyle: 'full' | 'side' | 'overlay' | 'none';
}> = {
  'executive-minimal': {
    palette: {
      primary: '1A1A1A',
      secondary: '4A4A4A',
      accent: 'D4AF37', // Gold
      background: 'FFFFFF',
      text: '1A1A1A',
      textLight: '666666',
    },
    fonts: { title: 'Helvetica', body: 'Helvetica' },
    imageStyle: 'side',
    titleLayout: {
      headerHeight: 0,
      contentPadding: 80,
      accentPosition: 'left',
      decorativeElements: [
        { type: 'rectangle', x: 0, y: 4, width: 200, height: 10, color: 'D4AF37', opacity: 100, rotation: 0 },
        { type: 'line', x: 0, y: 0, width: 30, height: 600, color: '1A1A1A', opacity: 5, rotation: 0 },
      ],
    },
    contentLayout: {
      headerHeight: 100,
      contentPadding: 60,
      accentPosition: 'top',
      decorativeElements: [
        { type: 'rectangle', x: 0, y: 0, width: 1920, height: 4, color: 'D4AF37', opacity: 100, rotation: 0 },
      ],
    },
  },

  'tech-gradient': {
    palette: {
      primary: '6366F1', // Indigo
      secondary: '8B5CF6', // Purple
      accent: '06B6D4', // Cyan
      background: '0F172A',
      text: 'F1F5F9',
      textLight: 'CBD5E1',
    },
    fonts: { title: 'Arial', body: 'Arial' },
    imageStyle: 'overlay',
    titleLayout: {
      headerHeight: 0,
      contentPadding: 100,
      accentPosition: 'right',
      decorativeElements: [
        { type: 'circle', x: 1400, y: -200, width: 800, height: 800, color: '6366F1', opacity: 15, rotation: 0 },
        { type: 'circle', x: -100, y: 700, width: 500, height: 500, color: '8B5CF6', opacity: 20, rotation: 0 },
        { type: 'gradient', x: 0, y: 0, width: 1920, height: 1080, color: '0F172A', opacity: 90, rotation: 0 },
      ],
    },
    contentLayout: {
      headerHeight: 150,
      contentPadding: 70,
      accentPosition: 'top',
      decorativeElements: [
        { type: 'rectangle', x: 0, y: 140, width: 1920, height: 10, color: '06B6D4', opacity: 100, rotation: 0 },
        { type: 'circle', x: 1700, y: 50, width: 100, height: 100, color: '8B5CF6', opacity: 30, rotation: 0 },
      ],
    },
  },

  'creative-bold': {
    palette: {
      primary: 'FF6B6B', // Coral Red
      secondary: 'FFA500', // Orange
      accent: 'FFD93D', // Yellow
      background: 'FEF3E2',
      text: '2D3436',
      textLight: '636E72',
    },
    fonts: { title: 'Arial', body: 'Calibri' },
    imageStyle: 'full',
    titleLayout: {
      headerHeight: 0,
      contentPadding: 100,
      accentPosition: 'bottom',
      decorativeElements: [
        { type: 'circle', x: 100, y: 100, width: 300, height: 300, color: 'FF6B6B', opacity: 20, rotation: 0 },
        { type: 'triangle', x: 1500, y: 700, width: 400, height: 400, color: 'FFA500', opacity: 15, rotation: 45 },
        { type: 'rectangle', x: 800, y: 900, width: 600, height: 40, color: 'FFD93D', opacity: 80, rotation: -5 },
      ],
    },
    contentLayout: {
      headerHeight: 180,
      contentPadding: 80,
      accentPosition: 'left',
      decorativeElements: [
        { type: 'rectangle', x: 0, y: 0, width: 40, height: 1080, color: 'FF6B6B', opacity: 100, rotation: 0 },
        { type: 'circle', x: 20, y: 100, width: 80, height: 80, color: 'FFD93D', opacity: 100, rotation: 0 },
      ],
    },
  },

  'elegant-luxury': {
    palette: {
      primary: '1E3A5F', // Navy
      secondary: '2C5F8D',
      accent: 'C9A962', // Champagne Gold
      background: 'F8F6F4',
      text: '1E3A5F',
      textLight: '5A7A9B',
    },
    fonts: { title: 'Georgia', body: 'Georgia' },
    imageStyle: 'side',
    titleLayout: {
      headerHeight: 0,
      contentPadding: 120,
      accentPosition: 'top',
      decorativeElements: [
        { type: 'rectangle', x: 0, y: 0, width: 1920, height: 400, color: '1E3A5F', opacity: 100, rotation: 0 },
        { type: 'line', x: 200, y: 420, width: 1520, height: 3, color: 'C9A962', opacity: 100, rotation: 0 },
        { type: 'rectangle', x: 800, y: 410, width: 320, height: 20, color: 'C9A962', opacity: 100, rotation: 0 },
      ],
    },
    contentLayout: {
      headerHeight: 140,
      contentPadding: 90,
      accentPosition: 'right',
      decorativeElements: [
        { type: 'rectangle', x: 1880, y: 0, width: 40, height: 1080, color: '1E3A5F', opacity: 100, rotation: 0 },
        { type: 'rectangle', x: 100, y: 130, width: 400, height: 8, color: 'C9A962', opacity: 100, rotation: 0 },
      ],
    },
  },

  'modern-geometric': {
    palette: {
      primary: '2ECC71', // Emerald
      secondary: '27AE60',
      accent: 'F39C12', // Orange
      background: 'FFFFFF',
      text: '2C3E50',
      textLight: '7F8C8D',
    },
    fonts: { title: 'Arial', body: 'Calibri' },
    imageStyle: 'overlay',
    titleLayout: {
      headerHeight: 0,
      contentPadding: 100,
      accentPosition: 'left',
      decorativeElements: [
        { type: 'triangle', x: 0, y: 0, width: 600, height: 1080, color: '2ECC71', opacity: 10, rotation: 0 },
        { type: 'rectangle', x: 500, y: 400, width: 100, height: 100, color: 'F39C12', opacity: 100, rotation: 45 },
        { type: 'circle', x: 1500, y: 200, width: 200, height: 200, color: '27AE60', opacity: 20, rotation: 0 },
        { type: 'line', x: 0, y: 1070, width: 1920, height: 10, color: '2ECC71', opacity: 100, rotation: 0 },
      ],
    },
    contentLayout: {
      headerHeight: 160,
      contentPadding: 70,
      accentPosition: 'bottom',
      decorativeElements: [
        { type: 'rectangle', x: 0, y: 150, width: 1920, height: 10, color: '2ECC71', opacity: 100, rotation: 0 },
        { type: 'rectangle', x: 60, y: 40, width: 10, height: 80, color: 'F39C12', opacity: 100, rotation: 0 },
        { type: 'circle', x: 1800, y: 950, width: 120, height: 120, color: '27AE60', opacity: 30, rotation: 0 },
      ],
    },
  },
};

// Unsplash image categories for different topics
export const IMAGE_CATEGORIES: Record<string, string> = {
  technology: 'technology,computer,digital',
  business: 'business,office,meeting',
  finance: 'finance,money,banking',
  education: 'education,learning,books',
  health: 'health,medical,wellness',
  nature: 'nature,landscape,environment',
  science: 'science,laboratory,research',
  art: 'art,creative,design',
  sports: 'sports,fitness,athlete',
  food: 'food,cuisine,cooking',
  travel: 'travel,destination,adventure',
  default: 'abstract,modern,minimal',
};

export function selectTemplateFromTopic(topic: string): DesignTemplate {
  const lower = topic.toLowerCase();
  
  if (lower.includes('business') || lower.includes('corporate') || lower.includes('executive')) {
    return 'executive-minimal';
  }
  if (lower.includes('tech') || lower.includes('ai') || lower.includes('software') || lower.includes('digital')) {
    return 'tech-gradient';
  }
  if (lower.includes('creative') || lower.includes('art') || lower.includes('design') || lower.includes('marketing')) {
    return 'creative-bold';
  }
  if (lower.includes('luxury') || lower.includes('premium') || lower.includes('elegant') || lower.includes('fashion')) {
    return 'elegant-luxury';
  }
  
  return 'modern-geometric'; // Default
}

export function getImageQuery(topic: string): string {
  const lower = topic.toLowerCase();
  
  for (const [key, value] of Object.entries(IMAGE_CATEGORIES)) {
    if (lower.includes(key)) {
      return value;
    }
  }
  
  return IMAGE_CATEGORIES.default;
}

export function getUnsplashUrl(query: string, width = 1920, height = 1080): string {
  return `https://source.unsplash.com/${width}x${height}/?${encodeURIComponent(query)}`;
}