// app/api/gemini/route.ts
import {
  GoogleGenerativeAI,
  GenerationConfig,
  SafetySetting,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import { PPTData, GeminiResponse } from "@/types";
import { selectTemplateFromTopic, DESIGN_TEMPLATES, getImageQuery } from '@/lib/designSystem';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not defined in environment variables.");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-pro-preview-05-06",
});

const generationConfig: GenerationConfig = {
  temperature: 0.7,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
};

const safetySettings: SafetySetting[] = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

const getSystemInstruction = (currentPPT: PPTData | null, topic: string): string => {
  const selectedTemplate = selectTemplateFromTopic(topic);
  const templateDesign = DESIGN_TEMPLATES[selectedTemplate];
  const imageQuery = getImageQuery(topic);

  let contextInstruction: string;
  if (currentPPT) {
    contextInstruction = `Edit this existing presentation, maintaining the SAME design template (${currentPPT.template || selectedTemplate}):
${JSON.stringify(currentPPT, null, 2)}

CRITICAL: Keep the EXACT SAME color palette and design template across ALL slides.`;
  } else {
    contextInstruction = `Create a NEW presentation using the "${selectedTemplate}" design template.`;
  }

  return `You are an expert AI presentation designer with a focus on visual consistency and stunning layouts.

${contextInstruction}

DESIGN TEMPLATE: ${selectedTemplate}
COLOR PALETTE (USE THESE EXACT COLORS FOR ALL SLIDES):
- Primary: #${templateDesign.palette.primary}
- Secondary: #${templateDesign.palette.secondary}
- Accent: #${templateDesign.palette.accent}
- Background: #${templateDesign.palette.background}
- Text: #${templateDesign.palette.text}
- Text Light: #${templateDesign.palette.textLight}

FONTS (USE CONSISTENTLY):
- Title Font: ${templateDesign.fonts.title}
- Body Font: ${templateDesign.fonts.body}

IMAGE SUGGESTIONS: ${imageQuery}

You must return a JSON object with this EXACT structure:

{
  "thinking": [
    "Planning: Analyzing topic and selecting appropriate design approach",
    "Structure: Determining slide sequence and content distribution",
    "Design: Applying ${selectedTemplate} template with consistent color palette",
    "Content: Creating compelling and clear information hierarchy",
    "Refinement: Ensuring visual consistency across all slides"
  ],
  "presentation": {
    "action": "create",
    "template": "${selectedTemplate}",
    "globalTheme": {
      "backgroundColor": "#${templateDesign.palette.background}",
      "textColor": "#${templateDesign.palette.text}",
      "titleFont": "${templateDesign.fonts.title}",
      "bodyFont": "${templateDesign.fonts.body}",
      "accentColor": "#${templateDesign.palette.accent}",
      "imageQuery": "${imageQuery}"
    },
    "slides": [
      {
        "layout": "title",
        "title": "Presentation Title",
        "subtitle": "Subtitle text",
        "content": [],
        "design": {
          "backgroundColor": "#${templateDesign.palette.background}",
          "textColor": "#${templateDesign.palette.text}",
          "titleFont": "${templateDesign.fonts.title}",
          "bodyFont": "${templateDesign.fonts.body}",
          "accentColor": "#${templateDesign.palette.accent}"
        }
      }
    ]
  }
}

CRITICAL CONSISTENCY RULES:
1. ALL slides MUST use the EXACT SAME color palette from the globalTheme
2. NEVER mix different color schemes within one presentation
3. backgroundColor, textColor, accentColor must be IDENTICAL across ALL slides
4. Only vary layout type, not colors
5. The template field must be "${selectedTemplate}" for all operations
6. Create 5-7 slides for comprehensive coverage
7. Each slide design object should match the globalTheme EXACTLY

Valid layouts: "title", "content", "section", "twocolumn"

Return ONLY valid JSON matching this structure with CONSISTENT colors.`;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, currentPPT } = body as {
      prompt: string;
      currentPPT: PPTData | null;
    };

    if (!prompt) {
      return new Response(JSON.stringify({ error: "Prompt is required" }), {
        status: 400,
      });
    }

    const systemInstruction = getSystemInstruction(currentPPT, prompt);
    const fullPrompt = `${systemInstruction}\n\nUser Request: ${prompt}\n\nGenerate the presentation about: ${prompt}`;

    console.log('🚀 Starting generation with template selection...');

    const result = await model.generateContentStream({
      contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
      generationConfig,
      safetySettings,
    });

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        let fullResponseText = "";
        let thinkingStepsSent = false;

        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              fullResponseText += text;
              
              if (!thinkingStepsSent) {
                try {
                  const partial = JSON.parse(fullResponseText);
                  if (partial.thinking && Array.isArray(partial.thinking)) {
                    for (const thought of partial.thinking) {
                      const thinkingMsg = `<thought>${thought}</thought>\n`;
                      controller.enqueue(encoder.encode(thinkingMsg));
                    }
                    thinkingStepsSent = true;
                  }
                } catch {
                  // Not complete yet
                }
              }
            }
          }

          console.log('✅ Stream complete, length:', fullResponseText.length);

          const responseData = JSON.parse(fullResponseText);
          
          if (!responseData.presentation) {
            throw new Error('Invalid response structure - missing presentation');
          }

          const presentation: GeminiResponse = responseData.presentation;

          // CRITICAL: Enforce design consistency
          if (presentation.globalTheme) {
            const globalTheme = presentation.globalTheme;
            presentation.slides = presentation.slides.map(slide => ({
              ...slide,
              design: {
                backgroundColor: globalTheme.backgroundColor,
                textColor: globalTheme.textColor,
                titleFont: globalTheme.titleFont,
                bodyFont: globalTheme.bodyFont,
                accentColor: globalTheme.accentColor,
              },
              content: slide.content || [],
            }));
          }

          const validSlides = presentation.slides.filter(slide => 
            slide.title && 
            slide.layout && 
            slide.design && 
            Array.isArray(slide.content)
          );

          if (validSlides.length === 0) {
            throw new Error('No valid slides in response');
          }

          presentation.slides = validSlides;

          console.log('✅ Valid slides with consistent design:', validSlides.length);

          const successMsg = { type: "done", data: presentation };
          controller.enqueue(encoder.encode(`\n<<<JSON_START>>>\n${JSON.stringify(successMsg)}`));

        } catch (error) {
          console.error('❌ Processing error:', error);
          console.error('Response text:', fullResponseText.substring(0, 500));
          
          const errorMsg = { 
            type: "error", 
            error: error instanceof Error ? error.message : "Processing failed" 
          };
          controller.enqueue(encoder.encode(`\n<<<JSON_START>>>\n${JSON.stringify(errorMsg)}`));
        }

        controller.close();
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });

  } catch (error) {
    console.error("❌ Route error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}