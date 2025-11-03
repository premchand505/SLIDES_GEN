// lib/designSystem.ts - ENHANCED WITH COMPLEMENTARY COLORS

export type DesignTemplate = 
  | 'executive-minimal'      // Gold + Navy (Luxury & Trust)
  | 'tech-gradient'          // Indigo + Cyan (Tech & Innovation)
  | 'creative-bold'          // Coral + Teal (Energy & Balance)
  | 'elegant-luxury'         // Burgundy + Champagne (Elegance & Warmth)
  | 'modern-geometric';      // Emerald + Orange (Growth & Energy)

export type ColorPalette = {
  primary: string;     // Main brand color
  secondary: string;   // Complementary color
  accent: string;      // Highlight color (derived from primary/secondary)
  background: string;  // Background color
  text: string;        // Primary text color
  textLight: string;   // Secondary text color
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

// 🎨 5 STUNNING TEMPLATES WITH COMPLEMENTARY COLOR PAIRS
export const DESIGN_TEMPLATES: Record<DesignTemplate, {
  palette: ColorPalette;
  titleLayout: LayoutPattern;
  contentLayout: LayoutPattern;
  fonts: { title: string; body: string };
  imageStyle: 'full' | 'side' | 'overlay' | 'none';
  description: string;
}> = {
  'executive-minimal': {
    description: 'Professional elegance with Gold (#D4AF37) and Navy (#1A2332) - perfect for corporate presentations',
    palette: {
      primary: '1A2332',      // Deep Navy
      secondary: 'D4AF37',    // Luxe Gold
      accent: 'C9A962',       // Softer Gold
      background: 'FFFFFF',   // Pure White
      text: '1A2332',         // Navy Text
      textLight: '5A6370',    // Muted Gray
    },
    fonts: { title: 'Helvetica', body: 'Helvetica' },
    imageStyle: 'side',
    titleLayout: {
      headerHeight: 0,
      contentPadding: 80,
      accentPosition: 'left',
      decorativeElements: [
        // Gold accent bar
        { type: 'rectangle', x: 50, y: 950, width: 400, height: 12, color: 'D4AF37', opacity: 100, rotation: 0 },
        // Navy geometric shape
        { type: 'rectangle', x: 1700, y: 100, width: 200, height: 200, color: '1A2332', opacity: 8, rotation: 45 },
        // Gold circle
        { type: 'circle', x: 100, y: 100, width: 150, height: 150, color: 'D4AF37', opacity: 12, rotation: 0 },
      ],
    },
    contentLayout: {
      headerHeight: 120,
      contentPadding: 60,
      accentPosition: 'top',
      decorativeElements: [
        // Gold top accent
        { type: 'rectangle', x: 0, y: 115, width: 1920, height: 5, color: 'D4AF37', opacity: 100, rotation: 0 },
        // Navy sidebar accent
        { type: 'rectangle', x: 0, y: 0, width: 8, height: 1080, color: '1A2332', opacity: 30, rotation: 0 },
      ],
    },
  },

  'tech-gradient': {
    description: 'Futuristic design with Indigo (#6366F1) and Cyan (#06B6D4) - ideal for technology and innovation',
    palette: {
      primary: '6366F1',      // Vibrant Indigo
      secondary: '06B6D4',    // Electric Cyan
      accent: '8B5CF6',       // Purple blend
      background: '0F172A',   // Dark Slate
      text: 'F1F5F9',         // Light text
      textLight: 'CBD5E1',    // Muted light
    },
    fonts: { title: 'Arial', body: 'Arial' },
    imageStyle: 'overlay',
    titleLayout: {
      headerHeight: 0,
      contentPadding: 100,
      accentPosition: 'right',
      decorativeElements: [
        // Large indigo glow
        { type: 'circle', x: 1300, y: -150, width: 900, height: 900, color: '6366F1', opacity: 18, rotation: 0 },
        // Cyan accent circle
        { type: 'circle', x: 100, y: 700, width: 600, height: 600, color: '06B6D4', opacity: 22, rotation: 0 },
        // Purple blend
        { type: 'circle', x: 800, y: 300, width: 400, height: 400, color: '8B5CF6', opacity: 15, rotation: 0 },
        // Gradient overlay effect
        { type: 'gradient', x: 0, y: 0, width: 1920, height: 1080, color: '0F172A', opacity: 85, rotation: 0 },
      ],
    },
    contentLayout: {
      headerHeight: 150,
      contentPadding: 70,
      accentPosition: 'top',
      decorativeElements: [
        // Cyan header accent
        { type: 'rectangle', x: 0, y: 140, width: 1920, height: 10, color: '06B6D4', opacity: 100, rotation: 0 },
        // Indigo corner element
        { type: 'circle', x: 1750, y: 50, width: 120, height: 120, color: '6366F1', opacity: 35, rotation: 0 },
        // Small cyan dot
        { type: 'circle', x: 80, y: 80, width: 40, height: 40, color: '06B6D4', opacity: 50, rotation: 0 },
      ],
    },
  },

  'creative-bold': {
    description: 'Energetic creativity with Coral (#FF6B6B) and Teal (#20B2AA) - perfect for creative portfolios',
    palette: {
      primary: 'FF6B6B',      // Vibrant Coral
      secondary: '20B2AA',    // Cool Teal
      accent: 'FFD93D',       // Bright Yellow
      background: 'FEF5E7',   // Warm Cream
      text: '2D3436',         // Charcoal
      textLight: '636E72',    // Medium Gray
    },
    fonts: { title: 'Arial', body: 'Calibri' },
    imageStyle: 'full',
    titleLayout: {
      headerHeight: 0,
      contentPadding: 100,
      accentPosition: 'bottom',
      decorativeElements: [
        // Large coral circle
        { type: 'circle', x: 150, y: 150, width: 350, height: 350, color: 'FF6B6B', opacity: 25, rotation: 0 },
        // Teal triangle
        { type: 'triangle', x: 1400, y: 650, width: 450, height: 450, color: '20B2AA', opacity: 20, rotation: 30 },
        // Yellow accent bar
        { type: 'rectangle', x: 700, y: 880, width: 520, height: 45, color: 'FFD93D', opacity: 85, rotation: -3 },
        // Small coral dots
        { type: 'circle', x: 1700, y: 200, width: 80, height: 80, color: 'FF6B6B', opacity: 40, rotation: 0 },
      ],
    },
    contentLayout: {
      headerHeight: 180,
      contentPadding: 80,
      accentPosition: 'left',
      decorativeElements: [
        // Teal sidebar
        { type: 'rectangle', x: 0, y: 0, width: 45, height: 1080, color: '20B2AA', opacity: 100, rotation: 0 },
        // Coral accent circle
        { type: 'circle', x: 22, y: 120, width: 90, height: 90, color: 'FF6B6B', opacity: 100, rotation: 0 },
        // Yellow corner accent
        { type: 'rectangle', x: 1820, y: 950, width: 100, height: 130, color: 'FFD93D', opacity: 60, rotation: 0 },
      ],
    },
  },

  'elegant-luxury': {
    description: 'Sophisticated style with Burgundy (#6B2C3E) and Champagne (#C9A962) - ideal for luxury brands',
    palette: {
      primary: '6B2C3E',      // Deep Burgundy
      secondary: 'C9A962',    // Champagne Gold
      accent: '8B4A5F',       // Rose blend
      background: 'FAF8F6',   // Soft Ivory
      text: '2C1810',         // Dark Brown
      textLight: '7A6A5A',    // Warm Gray
    },
    fonts: { title: 'Georgia', body: 'Georgia' },
    imageStyle: 'side',
    titleLayout: {
      headerHeight: 0,
      contentPadding: 120,
      accentPosition: 'top',
      decorativeElements: [
        // Burgundy top panel
        { type: 'rectangle', x: 0, y: 0, width: 1920, height: 420, color: '6B2C3E', opacity: 100, rotation: 0 },
        // Champagne divider line
        { type: 'line', x: 200, y: 440, width: 1520, height: 4, color: 'C9A962', opacity: 100, rotation: 0 },
        // Champagne accent box
        { type: 'rectangle', x: 800, y: 425, width: 320, height: 30, color: 'C9A962', opacity: 100, rotation: 0 },
      ],
    },
    contentLayout: {
      headerHeight: 140,
      contentPadding: 90,
      accentPosition: 'right',
      decorativeElements: [
        // Champagne side accent
        { type: 'rectangle', x: 1870, y: 0, width: 50, height: 1080, color: 'C9A962', opacity: 100, rotation: 0 },
        // Burgundy header underline
        { type: 'rectangle', x: 100, y: 130, width: 450, height: 10, color: '6B2C3E', opacity: 100, rotation: 0 },
        // Rose blend circle
        { type: 'circle', x: 1750, y: 900, width: 150, height: 150, color: '8B4A5F', opacity: 25, rotation: 0 },
      ],
    },
  },

  'modern-geometric': {
    description: 'Fresh and dynamic with Emerald (#2ECC71) and Orange (#F39C12) - great for modern businesses',
    palette: {
      primary: '2ECC71',      // Vibrant Emerald
      secondary: 'F39C12',    // Energetic Orange
      accent: '27AE60',       // Deep Green
      background: 'FFFFFF',   // Pure White
      text: '2C3E50',         // Dark Slate
      textLight: '7F8C8D',    // Cool Gray
    },
    fonts: { title: 'Arial', body: 'Calibri' },
    imageStyle: 'overlay',
    titleLayout: {
      headerHeight: 0,
      contentPadding: 100,
      accentPosition: 'left',
      decorativeElements: [
        // Large emerald triangle
        { type: 'triangle', x: 0, y: 0, width: 650, height: 1080, color: '2ECC71', opacity: 12, rotation: 0 },
        // Orange square (rotated)
        { type: 'rectangle', x: 550, y: 450, width: 130, height: 130, color: 'F39C12', opacity: 100, rotation: 45 },
        // Emerald circle
        { type: 'circle', x: 1450, y: 250, width: 250, height: 250, color: '27AE60', opacity: 22, rotation: 0 },
        // Orange bottom accent
        { type: 'line', x: 0, y: 1060, width: 1920, height: 20, color: 'F39C12', opacity: 100, rotation: 0 },
      ],
    },
    contentLayout: {
      headerHeight: 160,
      contentPadding: 70,
      accentPosition: 'bottom',
      decorativeElements: [
        // Emerald header line
        { type: 'rectangle', x: 0, y: 150, width: 1920, height: 10, color: '2ECC71', opacity: 100, rotation: 0 },
        // Orange side bar
        { type: 'rectangle', x: 60, y: 40, width: 12, height: 90, color: 'F39C12', opacity: 100, rotation: 0 },
        // Emerald circle accent
        { type: 'circle', x: 1750, y: 920, width: 140, height: 140, color: '27AE60', opacity: 35, rotation: 0 },
      ],
    },
  },
};

// Enhanced image categories with better keywords
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

export function selectTemplateFromTopic(topic: string): DesignTemplate {
  const lower = topic.toLowerCase();
  
  // Executive/Business
  if (lower.includes('business') || lower.includes('corporate') || 
      lower.includes('executive') || lower.includes('finance') ||
      lower.includes('banking') || lower.includes('professional')) {
    return 'executive-minimal';
  }
  
  // Technology/Innovation
  if (lower.includes('tech') || lower.includes('ai') || 
      lower.includes('software') || lower.includes('digital') ||
      lower.includes('innovation') || lower.includes('future') ||
      lower.includes('data') || lower.includes('cyber')) {
    return 'tech-gradient';
  }
  
  // Creative/Marketing
  if (lower.includes('creative') || lower.includes('art') || 
      lower.includes('design') || lower.includes('marketing') ||
      lower.includes('brand') || lower.includes('campaign') ||
      lower.includes('advertising')) {
    return 'creative-bold';
  }
  
  // Luxury/Premium
  if (lower.includes('luxury') || lower.includes('premium') || 
      lower.includes('elegant') || lower.includes('fashion') ||
      lower.includes('exclusive') || lower.includes('high-end')) {
    return 'elegant-luxury';
  }
  
  // Default: Modern & Versatile
  return 'modern-geometric';
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
  // Use Unsplash Source API with specific quality and fit parameters
  return `https://source.unsplash.com/${width}x${height}/?${encodeURIComponent(query)}&fit=crop&quality=80`;
}

// Helper to get template description
export function getTemplateDescription(template: DesignTemplate): string {
  return DESIGN_TEMPLATES[template].description;
}