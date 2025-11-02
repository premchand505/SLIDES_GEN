import {
  GoogleGenerativeAI,
  GenerationConfig,
  SafetySetting,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import { PPTData, GeminiResponse } from "@/types";

// --- Initialize the Google SDK ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not defined in environment variables.");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-pro-preview-05-06",
});

// --- Config ---
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

// --- THIS IS THE UNIQUE SEPARATOR (must match frontend) ---
const STREAM_SEPARATOR = "\n[__DATA_SEPARATOR__]\n";

// --- NEW SYSTEM PROMPT ---
const getSystemInstruction = (currentPPT: PPTData | null): string => {
  const jsonSchema = `
  type SlideDesign = {
    backgroundColor: string;
    textColor: string;
    titleFont: string;
    bodyFont: string;
    accentColor: string;
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

  return `
You are an expert AI presentation designer.
Your task is to generate both the CONTENT and the DESIGN for a presentation.

${contextInstruction}

**CRITICAL RESPONSE FORMAT:**
You MUST respond in two parts:
1.  **STRUCTURED REASONING LOG:** Stream your thought process as XML-like tags.
    - For thinking: <thought>Your reasoning here...</thought>
    - For actions: <action tool="webSearch">Searching for...</action>
    - For reading: <action tool="readWebsite">Reading example.com...</action>

2.  **FINAL JSON DATA:** After your *entire* reasoning log, output this separator and JSON:
${STREAM_SEPARATOR}
{ "type": "done", "data": { ...your GeminiResponse JSON... } }

**EXAMPLE RESPONSE (YOU MUST FOLLOW THIS STRUCTURE):**
<thought>
The user wants a 3-slide presentation about "Sustainable Energy".
I’ll first define the layout and style.
</thought>
<action tool="webSearch">
Searching for “latest trends in renewable energy 2025”.
</action>
<thought>
Now I’ll synthesize the data and produce slides.
</thought>
${STREAM_SEPARATOR}
{ "type": "done", "data": { ...your GeminiResponse JSON... } }

Schema:
${jsonSchema}
`;
};

// --- POST HANDLER ---
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
    const promptWithHistory = `${systemInstruction}\n\nUser: ${prompt}`;

    // 1. Generate the streaming response from Gemini
    const result = await model.generateContentStream({
      contents: [{ role: "user", parts: [{ text: promptWithHistory }] }],
      generationConfig,
      safetySettings,
    });

    // 2. Wrap Google’s stream into a custom ReadableStream
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        let fullResponseText = "";

        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (text) {
            fullResponseText += text;
            controller.enqueue(encoder.encode(text)); // stream reasoning to client
          }
        }

        // 3. Extract JSON block and stream the final payload
        const jsonMatch = fullResponseText.match(/```json\s*([\s\S]*?)\s*```/);

        if (jsonMatch && jsonMatch[1]) {
          try {
            const parsedJson: GeminiResponse = JSON.parse(jsonMatch[1].trim());

            // Apply globalTheme to slides without a design
            if (parsedJson.globalTheme) {
              parsedJson.slides = parsedJson.slides.map((slide) => ({
                ...slide,
                design: slide.design || parsedJson.globalTheme!,
              }));
            }

            const doneMessage = { type: "done", data: parsedJson };
            controller.enqueue(
              encoder.encode(`${STREAM_SEPARATOR}${JSON.stringify(doneMessage)}`)
            );
          } catch (err) {
            console.error("❌ JSON parse error:", err);
            controller.enqueue(
              encoder.encode(
                `${STREAM_SEPARATOR}${JSON.stringify({
                  type: "error",
                  error: "Failed to parse JSON output from Gemini.",
                })}`
              )
            );
          }
        } else {
          console.error("❌ No JSON block found in AI response");
          controller.enqueue(
            encoder.encode(
              `${STREAM_SEPARATOR}${JSON.stringify({
                type: "error",
                error: "No valid JSON data found in AI response.",
              })}`
            )
          );
        }

        controller.close();
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    console.error("❌ Error in /api/gemini route:", error);
    const message =
      error instanceof Error ? error.message : "Internal server error";
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}
