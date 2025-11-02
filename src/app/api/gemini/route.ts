import {
  GoogleGenerativeAI,
  GenerationConfig,
  SafetySetting,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import { PPTData, GeminiResponse } from "@/types";

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
  responseMimeType: "application/json", // Force JSON mode
};

const safetySettings: SafetySetting[] = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

const getSystemInstruction = (currentPPT: PPTData | null): string => {
  let contextInstruction: string;
  if (currentPPT) {
    contextInstruction = `Edit this existing presentation:
${JSON.stringify(currentPPT, null, 2)}

Return the COMPLETE updated presentation with ALL slides.`;
  } else {
    contextInstruction = `Create a NEW presentation from scratch.`;
  }

  return `You are an expert AI presentation designer.

${contextInstruction}

You must return a JSON object with this EXACT structure:

{
  "thinking": [
    "First major planning step: explain what you're planning and why",
    "Second thinking step: what content structure makes sense",
    "Third step: design decisions and color choices",
    "Fourth step: how you'll organize the information",
    "Fifth step: final synthesis and approach"
  ],
  "presentation": {
    "action": "create",
    "globalTheme": {
      "backgroundColor": "#FFFFFF",
      "textColor": "#1A1A1A",
      "titleFont": "Arial",
      "bodyFont": "Calibri",
      "accentColor": "#3B82F6"
    },
    "slides": [
      {
        "layout": "title",
        "title": "Main Title",
        "subtitle": "Subtitle text",
        "content": [],
        "design": {
          "backgroundColor": "#FFFFFF",
          "textColor": "#1A1A1A",
          "titleFont": "Arial",
          "bodyFont": "Calibri",
          "accentColor": "#3B82F6"
        }
      },
      {
        "layout": "content",
        "title": "Slide Title",
        "content": [
          "First point with detailed information",
          "Second point explaining key concepts",
          "Third point with supporting details"
        ],
        "design": {
          "backgroundColor": "#FFFFFF",
          "textColor": "#1A1A1A",
          "titleFont": "Arial",
          "bodyFont": "Calibri",
          "accentColor": "#3B82F6"
        }
      }
    ]
  }
}

CRITICAL RULES:
- thinking array must have 4-8 strings showing your planning process
- Each thinking string should be 2-4 sentences explaining your approach
- Valid layouts: "title", "content", "section", "twocolumn"
- Each slide MUST have: layout, title, content (array), design (object)
- content must be an array of strings (can be empty for title slides)
- Choose professional color schemes with good contrast
- Create 4-6 slides minimum for comprehensive coverage

EXAMPLE for "Artificial Intelligence" topic:

{
  "thinking": [
    "Planning Structure: I'll create a 6-slide presentation about AI covering fundamentals, applications, benefits, challenges, ethics, and future outlook. This provides a comprehensive overview suitable for general audiences.",
    "Content Strategy: Each slide will focus on one key aspect. The title slide introduces the topic, followed by definition slides with clear explanations, practical applications to show real-world impact, and concluding with forward-looking perspectives.",
    "Design Approach: I'll use a modern tech aesthetic with blue accent color to convey trust and innovation. White backgrounds ensure readability with dark gray text for strong contrast. Arial for titles provides clarity while Calibri ensures comfortable reading.",
    "Information Flow: The presentation will progress logically from concepts to applications to implications, making it both educational and engaging for viewers unfamiliar with the subject."
  ],
  "presentation": {
    "action": "create",
    "globalTheme": {
      "backgroundColor": "#FFFFFF",
      "textColor": "#2C3E50",
      "titleFont": "Arial",
      "bodyFont": "Calibri",
      "accentColor": "#3498DB"
    },
    "slides": [
      {
        "layout": "title",
        "title": "Artificial Intelligence",
        "subtitle": "Transforming How We Live and Work",
        "content": [],
        "design": {
          "backgroundColor": "#FFFFFF",
          "textColor": "#2C3E50",
          "titleFont": "Arial",
          "bodyFont": "Calibri",
          "accentColor": "#3498DB"
        }
      },
      {
        "layout": "content",
        "title": "What is AI?",
        "content": [
          "Computer systems that can perform tasks requiring human intelligence",
          "Includes machine learning, deep learning, and neural networks",
          "Enables computers to learn from data and improve over time",
          "Powers applications from voice assistants to autonomous vehicles"
        ],
        "design": {
          "backgroundColor": "#FFFFFF",
          "textColor": "#2C3E50",
          "titleFont": "Arial",
          "bodyFont": "Calibri",
          "accentColor": "#3498DB"
        }
      }
    ]
  }
}

Return ONLY valid JSON matching this structure.`;
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

    const systemInstruction = getSystemInstruction(currentPPT);
    const fullPrompt = `${systemInstruction}\n\nUser Request: ${prompt}\n\nGenerate the presentation about: ${prompt}`;

    console.log('🚀 Starting generation in JSON mode...');

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
          // Collect all chunks
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              fullResponseText += text;
              
              // Try to parse incrementally for thinking steps
              if (!thinkingStepsSent) {
                try {
                  const partial = JSON.parse(fullResponseText);
                  if (partial.thinking && Array.isArray(partial.thinking)) {
                    // Send thinking steps as they come
                    for (const thought of partial.thinking) {
                      const thinkingMsg = `<thought>${thought}</thought>\n`;
                      controller.enqueue(encoder.encode(thinkingMsg));
                    }
                    thinkingStepsSent = true;
                  }
                } catch {
                  // Not complete yet, continue
                }
              }
            }
          }

          console.log('✅ Stream complete, length:', fullResponseText.length);

          // Parse the complete response
          const responseData = JSON.parse(fullResponseText);
          
          if (!responseData.presentation) {
            throw new Error('Invalid response structure - missing presentation');
          }

          const presentation: GeminiResponse = responseData.presentation;

          console.log('✅ JSON parsed, slides:', presentation.slides?.length || 0);

          // Apply global theme
          if (presentation.globalTheme) {
            presentation.slides = presentation.slides.map(slide => ({
              ...slide,
              design: slide.design || presentation.globalTheme!,
              content: slide.content || [],
            }));
          }

          // Validate slides
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

          console.log('✅ Valid slides:', validSlides.length);

          // Send success response with separator
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