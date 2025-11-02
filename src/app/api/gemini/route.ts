import {
  GoogleGenerativeAI,
  GenerationConfig,
  SafetySetting,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import { PPTData, GeminiResponse } from "@/types";

// Initialize the Google SDK
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not defined in environment variables.");
}
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-pro-preview-05-06',
});

// Config
const generationConfig: GenerationConfig = {
  temperature: 0.7,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 8192,
};

const safetySettings: SafetySetting[] = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

// System Prompt
const getSystemInstruction = (currentPPT: PPTData | null): string => {
  const jsonSchema = `
  type SlideDesign = {
    backgroundColor: string; // e.g., "#FFFFFF"
    textColor: string;       // e.g., "#333333"
    titleFont: string;       // e.g., "Arial", "Helvetica"
    bodyFont: string;        // e.g., "Calibri", "Lato"
    accentColor: string;     // e.g., "#0078D4" (for titles or highlights)
  };

  type SlideContent = {
    layout: 'title' | 'content' | 'section' | 'twocolumn';
    title: string;
    subtitle?: string;
    content: string[];
    design?: SlideDesign; 
  };

  type GeminiResponse = {
    action: 'create' | 'edit' | 'add' | 'delete' | 'reorder';
    globalTheme?: SlideDesign; 
    slides: SlideContent[];
    reasoning?: string;
  };
  `;
  
  let contextInstruction: string;
  if (currentPPT) {
    contextInstruction = `The user wants to edit this presentation:
${JSON.stringify(currentPPT, null, 2)}
You MUST return the *complete, updated* presentation JSON.`;
  } else {
    contextInstruction = `The user wants a new presentation.`;
  }
  
  return `You are an expert AI presentation designer.
Your task is to generate both the CONTENT and the DESIGN for a presentation.

${contextInstruction}

**CRITICAL RESPONSE FORMAT:**
1. **REASONING:** First, provide your "thought process" as plain text (2-3 sentences explaining your design choices).
2. **JSON DATA:** After your reasoning, you MUST output a SINGLE valid JSON code block using this EXACT format:

\`\`\`json
{
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
      "title": "Your Title",
      "subtitle": "Optional Subtitle",
      "content": []
    }
  ],
  "reasoning": "Brief explanation of design choices"
}
\`\`\`

**IMPORTANT RULES:**
- The JSON block MUST be wrapped in \`\`\`json ... \`\`\`
- Do NOT include the reasoning text inside the JSON
- Always provide a globalTheme with ALL five properties
- Each slide should have: layout, title, content array
- Content array contains bullet points as strings
- Choose professional color schemes that work well together
- Use appropriate fonts (Arial, Helvetica, Calibri, Lato, etc.)

Schema: ${jsonSchema}`;
};

// Unique separator
const STREAM_SEPARATOR = "\n[__DATA_SEPARATOR__]\n";

// POST Handler
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt, currentPPT } = body as { 
      prompt: string; 
      currentPPT: PPTData | null; 
    };

    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), { status: 400 });
    }

    const systemInstruction = getSystemInstruction(currentPPT);
    const promptWithHistory = `${systemInstruction}\n\nUser: ${prompt}`;

    // Get the streaming result from the Google SDK
    const result = await model.generateContentStream({
      contents: [{ role: 'user', parts: [{ text: promptWithHistory }] }],
      generationConfig,
      safetySettings,
    });

    // Create our own ReadableStream
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        let fullResponseText = "";

        // Iterate over the stream from Google
        for await (const chunk of result.stream) {
          try {
            const text = chunk.text();
            if (text) {
              fullResponseText += text;
              // Send the raw text chunk to the client
              controller.enqueue(encoder.encode(text));
            }
          } catch (e) {
            console.error("Error processing stream chunk:", e);
          }
        }

        // Once the stream is done, parse the JSON
        // Look for JSON block with flexible regex
        const jsonBlock = fullResponseText.match(/```json\s*([\s\S]*?)\s*```/);
        
        if (jsonBlock && jsonBlock[1]) {
          try {
            const parsedJson: GeminiResponse = JSON.parse(jsonBlock[1].trim());
            
            // Apply globalTheme to slides that don't have their own design
            if (parsedJson.globalTheme) {
              parsedJson.slides = parsedJson.slides.map(slide => ({
                ...slide,
                design: slide.design || parsedJson.globalTheme!,
              }));
            }
            
            // Send a special "DONE" message with the final JSON payload
            const doneMessage = {
              type: 'done',
              data: parsedJson,
            };
            controller.enqueue(encoder.encode(`${STREAM_SEPARATOR}${JSON.stringify(doneMessage)}`));

          } catch (e) {
            console.error('Failed to parse final JSON:', e);
            console.error('JSON string was:', jsonBlock[1]);
            controller.enqueue(encoder.encode(`${STREAM_SEPARATOR}${JSON.stringify({ 
              type: 'error',
              error: "Failed to parse AI response. Please try again." 
            })}`));
          }
        } else {
          console.error('No JSON block found in final response.');
          console.error('Full response was:', fullResponseText);
          controller.enqueue(encoder.encode(`${STREAM_SEPARATOR}${JSON.stringify({ 
            type: 'error',
            error: "No valid JSON data found in AI response. Please try again." 
          })}`));
        }

        // Close the stream
        controller.close();
      },
    });

    // Return the stream
    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });

  } catch (error) {
    console.error('Error in /api/gemini route:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}