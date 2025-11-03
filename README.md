# 🎨 SLIDES GEN - AI PowerPoint Generator

> **Transform ideas into professional presentations in seconds with AI-powered slide generation**

A modern, full-stack Next.js application that generates and edits PowerPoint presentations through natural language using Google's Gemini 2.5 Pro AI. Built with TypeScript, Tailwind CSS, and pptxgenjs.

![Next.js](https://img.shields.io/badge/Next.js-16+-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=flat-square&logo=typescript)
![Gemini AI](https://img.shields.io/badge/Gemini-2.5_Pro-orange?style=flat-square)

## ✨ Features

### 🎯 Core Functionality
- **AI-Powered Generation** - Create presentations from simple text prompts
- **Interactive Chat Interface** - Natural conversation flow with the AI
- **Real-Time Thinking Display** - Watch the AI's 5-phase planning process
- **Dynamic Editing** - Modify presentations through follow-up messages
- **PPTX Export** - Download fully-editable PowerPoint files

### 🚀 Advanced Features
- **Streaming Architecture** - Custom protocol for real-time AI responses
- **Persistent Chat History** - All sessions saved to localStorage
- **Mobile Responsive** - Optimized for desktop, tablet, and mobile
- **User Profiles** - Personalized experience with name/organization
- **Session Management** - Create, load, and delete multiple conversations

### 🎨 Design Templates
1. **Executive** - Clean corporate design with sidebar
2. **Tech** - Dark mode with vibrant neon accents
3. **Editorial** - Magazine-style with large images
4. **Minimalist** - Typography-focused clean design
5. **Split** - Bold split-screen layout

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- Next.js 16 (App Router)
- TypeScript 5+ (strict mode)
- Tailwind CSS v4
- shadcn/ui components
- Framer Motion (animations)
- Zustand (state management)

**Backend:**
- Next.js API Routes
- Google Gemini 2.5 Pro (AI model)
- pptxgenjs (PowerPoint generation)
- Pexels API (images)

**DevOps:**
- pnpm (package manager)
- ESLint + Prettier
- Vercel (deployment)

### Project Structure
```
my-ppt-app/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── gemini/route.ts          # AI streaming endpoint
│   │   │   ├── generate-ppt/route.ts    # PPTX generation
│   │   │   └── get-image/route.ts       # Image proxy (Pexels)
│   │   ├── layout.tsx                   # Root layout
│   │   ├── page.tsx                     # Entry point
│   │   └── globals.css                  # Tailwind + theme
│   ├── components/
│   │   ├── MainAppLayout.tsx            # 🎯 Main orchestrator
│   │   ├── AppShell.tsx                 # Layout wrapper
│   │   ├── ChatInterface.tsx            # Chat logic
│   │   ├── InitialPrompt.tsx            # Welcome screen
│   │   ├── ChatInput.tsx                # Message input
│   │   ├── MessageBubble.tsx            # Chat messages
│   │   ├── ThinkingBubble.tsx           # AI reasoning display
│   │   ├── PPTPreview.tsx               # Slide carousel
│   │   ├── SlideCard.tsx                # Slide renderer
│   │   ├── DownloadButton.tsx           # PPTX download
│   │   ├── ChatHistorySidebar.tsx       # Session management
│   │   ├── UserProfileSetup.tsx         # Profile modal
│   │   └── ui/                          # shadcn/ui components
│   ├── hooks/
│   │   └── useGeneration.ts             # 🔑 AI streaming hook
│   ├── lib/
│   │   ├── designSystem.ts              # 🎨 5 templates, layouts
│   │   ├── pptGenerator.ts              # PPTX creation logic
│   │   └── utils.ts                     # Utilities
│   ├── store/
│   │   └── useChatStore.ts              # 💾 Zustand store
│   └── types/
│       └── index.ts                     # TypeScript definitions
├── .env.local                           # API keys
├── next.config.ts                       # Next.js config
├── tailwind.config.ts                   # Tailwind setup
└── package.json                         # Dependencies
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and pnpm installed
- Google Gemini API key ([Get one here](https://aistudio.google.com/app/apikey))
- Pexels API key ([Get one here](https://www.pexels.com/api/))

### Installation

1. **Clone the repository**
```bash
   git clone https://github.com/yourusername/ai-ppt-generator.git
   cd ai-ppt-generator
```

2. **Install dependencies**
```bash
   pnpm install
```

3. **Set up environment variables**
```bash
   cp .env.example .env.local
```

   Edit `.env.local`:
```env
   GEMINI_API_KEY=your_gemini_api_key_here
   PEXELS_API_KEY=your_pexels_api_key_here
```

4. **Run the development server**
```bash
   pnpm dev
```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage Guide

### Creating Your First Presentation

1. **Enter your profile** (shown on first visit)
2. **Type a prompt** in the welcome screen:
```
   Create 5 slides about renewable energy
```
3. **Watch the AI think** through 5 phases:
   - Phase 1: Research Initiation
   - Phase 2: Strategy Definition
   - Phase 3: Research & Analysis
   - Phase 4: Content Extraction
   - Phase 5: Final Synthesis

4. **Preview slides** in the right panel (desktop) or bottom sheet (mobile)
5. **Download PPTX** when satisfied

### Editing Presentations

Continue the conversation to refine your slides:
```
Make the design more colorful
Add a slide about solar energy
Condense this to 3 slides
Change the title of slide 2 to "Innovation in Energy"
```

### Keyboard Shortcuts

- **↑ / ↓** - Navigate slides (desktop)
- **Mouse Wheel** - Scroll through slides (desktop)
- **Enter** - Send message (in input)
- **Shift + Enter** - New line (in input)

## 🎯 Key Features Explained

### 1. Streaming AI Responses

**How it works:**
```
User Prompt → /api/gemini → Gemini AI → Custom Stream Protocol

Stream Format:
<thought>Phase 1: Research Initiation...</thought>
<thought>Phase 2: Strategy Definition...</thought>
...
<<<JSON_START>>>
{"type":"done","data":{"slides":[...]}}
```

**Implementation:** `hooks/useGeneration.ts` extracts thinking steps with regex, then parses final JSON.

### 2. Design System

**Example:** Executive Template
```typescript
{
  palette: {
    primary: '1A2332',    // Dark blue
    accent: '3B82F6',     // Bright blue
    background: 'FFFFFF', // White
  },
  titleLayout: {
    titleBox: { x: 0.5, y: 2.0, w: 9, h: 1.5 },
    decorativeElements: [
      { type: 'rectangle', x: 0, y: 0, width: 3.5, height: 5.625, color: '1A2332' }
    ]
  }
}
```

### 3. Session Management

**Features:**
- All conversations saved to localStorage
- Switch between sessions instantly
- Delete unwanted conversations
- Auto-title based on first user message

**Storage Structure:**
```typescript
{
  currentSessionId: 'uuid-1234',
  sessions: [
    {
      id: 'uuid-1234',
      title: 'Renewable Energy Presentation',
      messages: [...],
      pptData: {...},
      createdAt: Date,
      updatedAt: Date
    }
  ]
}
```

### 4. Mobile Responsiveness

**Breakpoints:**
- `< 768px`: Full-width chat, bottom sheet preview, touch gestures
- `768px - 1024px`: Tablet optimizations
- `≥ 1024px`: Side-by-side layout, keyboard shortcuts

**Mobile-specific features:**
- Bottom sheet with drag handle
- Swipe navigation in carousel
- Optimized touch targets (min 44x44px)

## 🔧 API Reference

### POST `/api/gemini`

Generate or edit presentations.

**Request:**
```json
{
  "prompt": "Create 5 slides about AI",
  "currentPPT": null | PPTData
}
```

**Response:** Streaming with:
1. Thinking steps as `<thought>` tags
2. Separator: `<<<JSON_START>>>`
3. Final JSON:
```json
{
  "type": "done",
  "data": {
    "title": "Artificial Intelligence",
    "template": "tech",
    "slides": [
      {
        "layout": "title",
        "title": "The Future of AI",
        "subtitle": "Trends and Predictions",
        "design":RetryGPContinuejson        "design": {
          "backgroundColor": "#0F172A",
          "textColor": "#F1F5F9",
          "titleFont": "Arial",
          "bodyFont": "Arial",
          "accentColor": "#06B6D4"
        }
      }
    ]
  }
}
POST /api/generate-ppt
Convert JSON to PPTX file.
Request:
json{
  "title": "My Presentation",
  "template": "executive",
  "slides": [...]
}
Response:
json{
  "base64": "UEsDBBQABgAIAAAAIQD..."
}
````

### GET `/api/get-image`

Fetch images from Pexels (server-side proxy).

**Request:**
````
GET /api/get-image?query=technology
Response:
json{
  "url": "https://images.pexels.com/photos/..."
}
🎨 Design System Deep Dive
Template Selection Logic
AI automatically chooses templates based on keywords:
typescriptconst topicKeywords = {
  'executive': ['business', 'corporate', 'finance', 'banking'],
  'tech': ['technology', 'ai', 'software', 'digital'],
  'editorial': ['history', 'culture', 'philosophy'],
  'split': ['creative', 'art', 'design', 'marketing'],
  'minimalist': ['default'] // Fallback
}
Layout Types
1. Title Slide

Large centered title
Subtitle below
Full-width background or image overlay
Minimal text

2. Content Slide

Title at top
3-5 bullet points
Optional image on right
Most common layout

3. Section Slide

Large centered heading
Divider line or decorative element
Used to separate topics
No body text

4. Two-Column Slide

Title at top
Content split into left/right columns
Equal or weighted distribution
Good for comparisons

Color Contrast Algorithm
typescriptfunction isColorDark(hexColor: string): boolean {
  const { r, g, b } = hexToRgb(hexColor);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness < 128;
}

// Auto-adjust text color based on background
const textColor = isColorDark(backgroundColor) 
  ? '#FFFFFF'  // White on dark
  : '#000000'; // Black on light
🧪 Development
Available Scripts
bashpnpm dev          # Start development server (localhost:3000)
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm type-check   # TypeScript compiler check
Environment Variables
Required:
envGEMINI_API_KEY=AIza...          # Google Gemini API key
PEXELS_API_KEY=YOUR_KEY         # Pexels API key
Optional:
envNEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
Testing Locally
bash# Install dependencies
pnpm install

# Run dev server
pnpm dev

# In another terminal, test API
curl -X POST http://localhost:3000/api/gemini \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Create 3 slides about cats"}'
🚢 Deployment
Vercel (Recommended)

Push to GitHub

bash   git add .
   git commit -m "Initial commit"
   git push origin main

Import to Vercel

Go to vercel.com/new
Import your GitHub repository
Add environment variables:

GEMINI_API_KEY
PEXELS_API_KEY




Deploy

Click "Deploy"
Your app will be live at https://your-app.vercel.app



Show Image
Other Platforms
Netlify:
bashnetlify deploy --prod
Railway:
bashrailway up
Docker:
dockerfileFROM node:18-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install
COPY . .
RUN pnpm build
CMD ["pnpm", "start"]
````

## 🐛 Troubleshooting

### Common Issues

**1. API Key Not Found**
````
Error: GEMINI_API_KEY is not defined
````
**Solution:** 
- Check `.env.local` file exists in project root
- Verify key is correct (no quotes, no spaces)
- Restart dev server after adding key

**2. Build Fails with Type Errors**
````
Type error: Cannot find module '@/components/...'
Solution:

Check tsconfig.json has correct paths:

json  "paths": {
    "@/*": ["./src/*"]
  }
````
- Verify file extensions (`.tsx` for components, `.ts` for utils)

**3. Images Not Loading**
````
Failed to fetch image from Pexels
````
**Solution:**
- Verify `PEXELS_API_KEY` is set in `.env.local`
- Check Pexels API rate limits (200 requests/hour free tier)
- Fallback to LoremFlickr placeholder if Pexels fails

**4. PPTX Generation Fails**
````
Error generating PPTX: Invalid slide data
````
**Solution:**
- Ensure all slides have `design` objects with required fields
- Check `content` is an array (not string)
- Verify hex colors don't include '#' in PPTX generator

**5. Thinking Steps Not Displaying**
````
AI generates slides but no thinking bubbles appear
Solution:

Check browser console for parsing errors
Verify extractThoughtSteps regex in useGeneration.ts
Ensure Gemini prompt includes thinking instructions

API Response Times

/api/gemini (streaming): 5-15s (depends on AI)
/api/generate-ppt: 2-5s (depends on slide count)
/api/get-image: 200-500ms (Pexels API)

🔒 Security
API Key Protection

All API keys stored server-side in .env.local
Never exposed to client bundle
Image proxy prevents key leakage

Input Validation

User prompts sanitized before sending to AI
JSON schema validation for AI responses
XSS prevention via React's JSX escaping

Rate Limiting

Consider implementing rate limits for production
Use Vercel's Edge Config for IP-based throttling

🤝 Contributing
Contributions welcome! Please follow these steps:

Fork the repository
Create a feature branch

bash   git checkout -b feature/amazing-feature

Make your changes

Follow existing code style
Add comments for complex logic
Update types in /types/index.ts


Test thoroughly

bash   pnpm dev
   # Test manually in browser

Commit with clear messages

bash   git commit -m "feat: add chart support to slides"

Push and create PR

bash   git push origin feature/amazing-feature
📝 Code Style
TypeScript

Use strict mode
Avoid any types (use unknown if needed)
Export types from /types/index.ts

React

Functional components only
Use hooks (no class components)
Extract complex logic to custom hooks

Naming Conventions

Components: PascalCase (ChatInterface.tsx)
Hooks: camelCase with 'use' prefix (useGeneration.ts)
Utils: camelCase (cleanText)
Types: PascalCase (SlideContent)

File Organization
typescript// 1. Imports (external, then internal)
import { useState } from 'react';
import { useChatStore } from '@/store/useChatStore';

// 2. Types
type Props = { ... };

// 3. Component
export function MyComponent({ ... }: Props) {
  // 4. Hooks
  const [state, setState] = useState();
  
  // 5. Handlers
  const handleClick = () => { ... };
  
  // 6. Effects
  useEffect(() => { ... }, []);
  
  // 7. Render
  return <div>...</div>;
}
````

## 📚 Learning Resources

### Gemini AI
- [Gemini API Docs](https://ai.google.dev/docs)
- [Streaming Guide](https://ai.google.dev/tutorials/streaming)
- [JSON Mode](https://ai.google.dev/docs/json_mode)

### pptxgenjs
- [Official Docs](https://gitbrent.github.io/PptxGenJS/)
- [Examples](https://gitbrent.github.io/PptxGenJS/docs/examples.html)
- [API Reference](https://gitbrent.github.io/PptxGenJS/docs/api.html)

### Next.js
- [App Router Docs](https://nextjs.org/docs/app)
- [API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Streaming](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming)

## 🗺️ Roadmap

### Phase 1: Core Features ✅
- [x] AI-powered slide generation
- [x] Chat interface
- [x] PPTX export
- [x] Design system with 5 templates
- [x] Mobile responsiveness
- [x] Session management

### Phase 2: Enhancement (In Progress)
- [ ] Chart generation (bar, line, pie)
- [ ] Custom template creator
- [ ] Collaboration features (share presentations)
- [ ] PDF export
- [ ] Animation presets for slides

### Phase 3: Advanced Features
- [ ] Voice input for prompts
- [ ] Multi-language support
- [ ] Brand kit integration (logos, colors)
- [ ] Slide version history
- [ ] AI presentation coach (suggestions)

### Phase 4: Enterprise
- [ ] Team workspaces
- [ ] SSO authentication
- [ ] Custom AI model fine-tuning
- [ ] Analytics dashboard
- [ ] API for developers

🎯 Extra Features (Beyond Requirements)

User profile system
5 professional design templates
Mobile-responsive interface
Real-time AI thinking visualization
Advanced layout system (20+ unique layouts)
Image integration (Pexels API)
Keyboard shortcuts and gestures
Error handling and user feedback


Built with ❤️ for the Full-Stack Developer Assignment
Demo Video: 
Live App: https://slides-genai.vercel.app
Source Code: https://github.com/premchand505/SLIDES_GEN
