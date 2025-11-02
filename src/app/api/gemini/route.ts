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
};

const safetySettings: SafetySetting[] = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

const STREAM_SEPARATOR = "\n<<<JSON_START>>>\n";

function extractJSON(text: string): string | null {
  console.log('🔍 Attempting to extract JSON from text...');
  
  // Method 1: Look for our custom separator
  const separators = ['<<<JSON_START>>>', '<<<json_start>>>', 'JSON_START', 'json_start'];
  for (const sep of separators) {
    if (text.includes(sep)) {
      console.log('✅ Found separator:', sep);
      const parts = text.split(sep);
      let jsonPart = parts[parts.length - 1].trim();
      
      // Clean markdown if present
      jsonPart = jsonPart.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```\s*$/i, '').trim();
      
      if (jsonPart && jsonPart.startsWith('{')) {
        return jsonPart;
      }
    }
  }
  
  console.log('⚠️ No separator found, trying regex patterns...');
  
  // Method 2: Look for JSON object pattern starting with action/slides
  const patterns = [
    /\{[\s\S]*?"action"[\s\S]*?"slides"[\s\S]*?\}(?:\}(?:\})?)*/,
    /\{[\s\S]*?"slides"[\s\S]*?"action"[\s\S]*?\}(?:\}(?:\})?)*/,
    /\{[\s\S]*?"globalTheme"[\s\S]*?"slides"[\s\S]*?\}(?:\}(?:\})?)*/,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      console.log('✅ Found JSON via regex');
      let jsonStr = match[0];
      
      // Clean markdown
      jsonStr = jsonStr.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```\s*$/i, '').trim();
      
      // Balance braces
      let braceCount = 0;
      let endIdx = -1;
      for (let i = 0; i < jsonStr.length; i++) {
        if (jsonStr[i] === '{') braceCount++;
        if (jsonStr[i] === '}') {
          braceCount--;
          if (braceCount === 0) {
            endIdx = i + 1;
            break;
          }
        }
      }
      
      if (endIdx > 0) {
        return jsonStr.substring(0, endIdx);
      }
    }
  }
  
  console.log('⚠️ Regex failed, trying last resort...');
  
  // Method 3: Find last complete JSON object in text
  const lastOpenBrace = text.lastIndexOf('{');
  if (lastOpenBrace !== -1) {
    const testText = text.substring(lastOpenBrace);
    
    // Try to find complete object
    let braceCount = 0;
    let endIdx = -1;
    for (let i = 0; i < testText.length; i++) {
      if (testText[i] === '{') braceCount++;
      if (testText[i] === '}') {
        braceCount--;
        if (braceCount === 0) {
          endIdx = i + 1;
          break;
        }
      }
    }
    
    if (endIdx > 0) {
      const jsonCandidate = testText.substring(0, endIdx);
      // Check if it looks like our data structure
      if (jsonCandidate.includes('slides') || jsonCandidate.includes('action')) {
        console.log('✅ Found JSON by brace matching');
        return jsonCandidate;
      }
    }
  }
  
  console.error('❌ All extraction methods failed');
  return null;
}

const getSystemInstruction = (currentPPT: PPTData | null): string => {
  let contextInstruction: string;
  if (currentPPT) {
    contextInstruction = `EXISTING PRESENTATION TO EDIT:
${JSON.stringify(currentPPT, null, 2)}

You must return the COMPLETE updated presentation with ALL slides.`;
  } else {
    contextInstruction = `Create a NEW presentation from scratch.`;
  }

  return `You are an expert AI presentation designer. Create beautiful, professional slide decks.

${contextInstruction}

RESPONSE FORMAT (FOLLOW EXACTLY):

Step 1: Think through your approach using <thought> tags:
<thought>Your planning and reasoning here</thought>
<thought>Design decisions here</thought>

Step 2: After all thinking, write EXACTLY this line:
<<<JSON_START>>>

Step 3: Immediately output your JSON (no extra text, no markdown blocks):

REQUIRED JSON STRUCTURE:
{
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
      "title": "Your Title",
      "subtitle": "Your Subtitle",
      "content": [],
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

RULES:
- Each slide must have: layout, title, content (array), design
- Layouts: "title", "content", "section", "twocolumn"
- content is an array of strings (bullet points)
- Use double quotes for all strings
- No trailing commas
- Apply globalTheme to all slides

EXAMPLE OUTPUT:

<thought>
Creating a 3-slide presentation about AI:
1. Title slide - "Introduction to AI"
2. Content slide - "What is AI?"
3. Content slide - "Applications"
</thought>

<thought>
Design: Clean white background, blue accents for tech theme, Arial/Calibri fonts for readability.
</thought>

<<<JSON_START>>>
{"action":"create","globalTheme":{"backgroundColor":"#FFFFFF","textColor":"#1A1A1A","titleFont":"Arial","bodyFont":"Calibri","accentColor":"#3B82F6"},"slides":[{"layout":"title","title":"Introduction to AI","subtitle":"The Future of Technology","content":[],"design":{"backgroundColor":"#FFFFFF","textColor":"#1A1A1A","titleFont":"Arial","bodyFont":"Calibri","accentColor":"#3B82F6"}},{"layout":"content","title":"What is AI?","content":["Artificial intelligence simulates human intelligence","Includes machine learning and deep learning","Enables computers to learn from experience"],"design":{"backgroundColor":"#FFFFFF","textColor":"#1A1A1A","titleFont":"Arial","bodyFont":"Calibri","accentColor":"#3B82F6"}}]}`;
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
    const fullPrompt = `${systemInstruction}\n\n=== USER REQUEST ===\n${prompt}`;

    console.log('🚀 Starting generation...');

    const result = await model.generateContentStream({
      contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
      generationConfig,
      safetySettings,
    });

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        let fullResponseText = "";

        try {
          // Collect all chunks
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              fullResponseText += text;
              controller.enqueue(encoder.encode(text));
            }
          }

          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('📦 RESPONSE LENGTH:', fullResponseText.length);
          console.log('📝 LAST 500 CHARS:', fullResponseText.slice(-500));
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

          // Extract JSON using multiple strategies
          const jsonText = extractJSON(fullResponseText);

          if (!jsonText) {
            console.error('❌ FAILED TO EXTRACT JSON');
            console.error('Full response:', fullResponseText);
            const errorMsg = { 
              type: "error", 
              error: "Could not extract JSON from AI response. Please try again." 
            };
            controller.enqueue(encoder.encode(`${STREAM_SEPARATOR}${JSON.stringify(errorMsg)}`));
            controller.close();
            return;
          }

          console.log('✅ EXTRACTED JSON LENGTH:', jsonText.length);
          console.log('📄 JSON PREVIEW:', jsonText.substring(0, 300));

          // Parse the JSON
          const parsedData: GeminiResponse = JSON.parse(jsonText);
          
          console.log('✅ JSON PARSED');
          console.log('📊 SLIDES:', parsedData.slides?.length || 0);

          // Apply global theme to slides if not present
          if (parsedData.globalTheme) {
            parsedData.slides = parsedData.slides.map(slide => ({
              ...slide,
              design: slide.design || parsedData.globalTheme!,
              content: slide.content || [],
            }));
          }

          // Validate slides
          const validSlides = parsedData.slides.filter(slide => 
            slide.title && 
            slide.layout && 
            slide.design && 
            Array.isArray(slide.content)
          );

          if (validSlides.length === 0) {
            throw new Error('No valid slides in response');
          }

          parsedData.slides = validSlides;

          console.log('✅ VALID SLIDES:', validSlides.length);
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

          // Send success response
          const successMsg = { type: "done", data: parsedData };
          controller.enqueue(encoder.encode(`${STREAM_SEPARATOR}${JSON.stringify(successMsg)}`));

        } catch (error) {
          console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.error('❌ ERROR:', error);
          console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          
          const errorMsg = { 
            type: "error", 
            error: error instanceof Error ? error.message : "Processing failed" 
          };
          controller.enqueue(encoder.encode(`${STREAM_SEPARATOR}${JSON.stringify(errorMsg)}`));
        }

        controller.close();
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });

  } catch (error) {
    console.error("❌ ROUTE ERROR:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}