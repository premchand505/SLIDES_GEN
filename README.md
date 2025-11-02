# 🎨 SLIDES GEN ---  AI PowerPoint Generator

> **Transform ideas into professional presentations in seconds with AI-powered slide generation**

A modern, full-stack chat application that generates and edits PowerPoint presentations through natural language prompts using Google's Gemini AI.

![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=flat-square&logo=typescript)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

## ✨ Features

### Core Functionality
- 🤖 **AI-Powered Generation** - Create presentations from simple text prompts
- 💬 **Chat Interface** - Natural conversation flow with AI thinking process visualization
- 🎨 **Dynamic Design** - AI generates professional color schemes and layouts
- 📝 **Smart Content** - Comprehensive, well-researched slide content
- 🔄 **Real-time Editing** - Modify presentations through follow-up messages
- 📥 **PPTX Download** - Export to standard PowerPoint format

### Advanced Features
- 🎯 **Live Preview** - See slides as they're generated
- 💾 **Persistent History** - Chat sessions saved to local storage
- 📱 **Fully Responsive** - Optimized for mobile, tablet, and desktop
- ⚡ **Streaming UI** - Watch AI thinking process in real-time
- 🎭 **Multiple Layouts** - Title, content, section, and two-column slides
- 🎨 **Theme Customization** - AI selects appropriate colors and fonts

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and pnpm installed
- Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

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

Edit `.env.local` and add your Gemini API key:
```env
GEMINI_API_KEY=your_api_key_here
```

4. **Run the development server**
```bash
pnpm dev
```

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage

### Creating Your First Presentation

1. **Start with a prompt**
   ```
   Create 5 slides about renewable energy
   ```

2. **Watch the AI think**
   - The AI shows its planning process
   - Research and content synthesis in real-time
   - Structured thinking steps appear as separate bubbles

3. **Preview and download**
   - View slides in the preview panel
   - Navigate with arrow keys or swipe gestures
   - Click "Download PPTX" to export

### Editing Presentations

Continue the conversation to refine your presentation:
```
Make the design more colorful
Add a slide about solar energy
Condense this to 3 slides
```

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **State Management**: Zustand with persistence
- **Icons**: Lucide React
- **Animations**: Framer Motion

### Backend
- **Runtime**: Node.js
- **API Routes**: Next.js API Routes
- **AI Model**: Google Gemini 2.5 Pro
- **PPT Generation**: pptxgenjs
- **Validation**: Zod (via Gemini JSON mode)

### Development
- **Package Manager**: pnpm
- **Type Checking**: TypeScript strict mode
- **Code Quality**: ESLint + Prettier
- **Version Control**: Git

## 📁 Project Structure

```
my-ppt-app/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── gemini/route.ts          # AI streaming endpoint
│   │   │   └── generate-ppt/route.ts    # PPTX generation endpoint
│   │   ├── layout.tsx                   # Root layout
│   │   └── page.tsx                     # Main page
│   ├── components/
│   │   ├── MainAppLayout.tsx            # Layout orchestration
│   │   ├── ChatInterface.tsx            # Chat logic & streaming
│   │   ├── InitialPrompt.tsx            # Welcome screen
│   │   ├── ChatInput.tsx                # Message input
│   │   ├── MessageBubble.tsx            # Chat messages
│   │   ├── ThinkingBubble.tsx           # AI thinking display
│   │   ├── PPTPreview.tsx               # Slide carousel
│   │   ├── SlideCard.tsx                # Slide renderer
│   │   ├── DownloadButton.tsx           # PPTX download
│   │   ├── ChatHistorySidebar.tsx       # Session history
│   │   └── AppShell.tsx                 # App container
│   ├── hooks/
│   │   └── useGeneration.tsx            # Generation hook
│   ├── lib/
│   │   ├── utils.ts                     # Utility functions
│   │   └── pptGenerator.ts              # Server-side PPT logic
│   ├── store/
│   │   └── useChatStore.ts              # Zustand store
│   └── types/
│       └── index.ts                     # TypeScript types
├── public/                              # Static assets
├── .env.local                           # Environment variables
├── next.config.mjs                      # Next.js configuration
├── tailwind.config.ts                   # Tailwind configuration
├── tsconfig.json                        # TypeScript configuration
└── package.json                         # Dependencies
```

## 🎨 Key Components

### AI Streaming Architecture

The application uses a custom streaming protocol:

1. **Thinking Phase**: AI outputs structured `<thought>` tags
2. **Separator**: `<<<JSON_START>>>` marks transition
3. **Data Phase**: JSON with presentation structure

```typescript
// Example stream output
<thought>Planning the presentation structure...</thought>
<thought>Choosing colors and design...</thought>
<<<JSON_START>>>
{"type":"done","data":{"slides":[...]}}
```

### Slide Generation

Each slide includes:
- **Layout**: title, content, section, or twocolumn
- **Content**: Title, subtitle, and bullet points
- **Design**: Colors, fonts, and styling

```typescript
type SlideContent = {
  layout: 'title' | 'content' | 'section' | 'twocolumn';
  title: string;
  subtitle?: string;
  content: string[];
  design: SlideDesign;
};
```

### State Management

Zustand store manages:
- Chat messages with timestamps
- PPT data with slides
- Session history with persistence
- Loading states

## 🎯 API Endpoints

### POST `/api/gemini`
Generates presentations via streaming

**Request:**
```json
{
  "prompt": "Create 5 slides about AI",
  "currentPPT": null | PPTData
}
```

**Response:** Stream with thinking steps + JSON data

### POST `/api/generate-ppt`
Converts presentation data to PPTX

**Request:**
```json
{
  "slides": [...],
  "globalTheme": {...}
}
```

**Response:**
```json
{
  "base64": "UEsDBBQABgAIA..."
}
```

## 📱 Responsive Design

### Mobile (< 768px)
- Full-width chat interface
- Bottom sheet for preview
- Touch-optimized controls
- Swipe navigation

### Desktop (≥ 1024px)
- Side-by-side layout
- Persistent preview panel
- Keyboard shortcuts
- Mouse wheel navigation

### Breakpoints
```css
sm: 640px   /* Small tablets */
md: 768px   /* Tablets - layout switch */
lg: 1024px  /* Desktop - dual pane */
xl: 1280px  /* Large desktop */
```

## 🔧 Configuration

### Environment Variables

```env
# Required
GEMINI_API_KEY=your_gemini_api_key

# Optional (with defaults)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Tailwind Theme

Custom monochromatic theme with shadcn/ui integration:
```typescript
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      border: "hsl(var(--border))",
      primary: "hsl(var(--primary))",
      // ... custom color system
    }
  }
}
```

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Other Platforms

Works on any Node.js hosting:
- Netlify
- Railway
- Render
- AWS Amplify

## 🧪 Development

### Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm type-check   # Run TypeScript compiler
```

### Testing Locally

```bash
# Install dependencies
pnpm install

# Run dev server
pnpm dev

# Test in browser
open http://localhost:3000
```

## 🐛 Troubleshooting

### Common Issues

**API Key Error**
```
Error: GEMINI_API_KEY is not defined
```
Solution: Check `.env.local` file exists and contains valid key

**Build Errors**
```
Module not found: Can't resolve '@/...'
```
Solution: Check `tsconfig.json` paths configuration

**PPTX Generation Fails**
```
Error generating PPTX
```
Solution: Ensure slides have valid design objects and content arrays

### Debug Mode

Enable detailed logging:
```typescript
// Add to .env.local
NEXT_PUBLIC_DEBUG=true
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Google Gemini AI](https://deepmind.google/technologies/gemini/) - AI model
- [pptxgenjs](https://gitbrent.github.io/PptxGenJS/) - PowerPoint generation
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Next.js](https://nextjs.org/) - React framework

## 📞 Support

- 📧 Email: your.email@example.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/ai-ppt-generator/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/yourusername/ai-ppt-generator/discussions)

## 🗺️ Roadmap

- [ ] Add more slide layouts (image, chart, comparison)
- [ ] Support for multiple AI models
- [ ] Collaborative editing
- [ ] Template library
- [ ] Export to PDF
- [ ] Dark mode
- [ ] i18n support

---

**Made with ❤️ using Next.js and Google Gemini AI**