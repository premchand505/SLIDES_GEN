// app/api/gemini/route.ts 
import {
  GoogleGenerativeAI,
  GenerationConfig,
  SafetySetting,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import { PPTData, GeminiResponse } from "@/types";

import { selectTemplateFromTopic, DESIGN_TEMPLATES, getImageQuery, type DesignTemplate } from '@/lib/designSystem';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not defined in environment variables.");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-pro-preview-05-06",
});
const generationConfig: GenerationConfig = {
  temperature: 0.8,
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

// === PROMPT 1: FOR CREATING NEW PRESENTATIONS ===
const getCreatePrompt = (topic: string, templateName: DesignTemplate): string => {
  const templateDesign = DESIGN_TEMPLATES[templateName];
  const globalImageQuery = getImageQuery(topic);

  return `You are an EXPERT AI Presentation Designer.
Your goal is to create a complete presentation from scratch based on the user's topic.

SELECTED DESIGN TEMPLATE: "${templateName}"

🎨 COLOR PALETTE:
Primary: #${templateDesign.palette.primary}
Secondary: #${templateDesign.palette.secondary}
Accent: #${templateDesign.palette.accent}
Background: #${templateDesign.palette.background}
Text: #${templateDesign.palette.text}
Text Light: #${templateDesign.palette.textLight}

📝 TYPOGRAPHY:
Title Font: ${templateDesign.fonts.title}
Body Font: ${templateDesign.fonts.body}

Global Image Keywords: "${globalImageQuery}"

📊 REQUIRED THINKING PROCESS (Phase 1-5):
PHASE 1 - RESEARCH INITIATION:
"Begin Researching [Topic]: Ive initiated the research phase for the [topic] presentation.
Im starting with broad web searches using carefully selected keywords related to [topic’s key aspects].
The goal is to build a comprehensive understanding of the subject before structuring the presentation content.
I’ll analyze the search results for relevance and accuracy to form a solid foundation for the next steps."
PHASE 2 - STRATEGY DEFINITION:
"Defining Presentation Structure: Ive established my approach to the '[topic]' presentation.
My plan is to extract information from credible online sources and synthesize it into clear, concise slide material with proper citations.
The objective is to ensure every slide reflects a logical flow — introducing the topic, explaining its importance, and highlighting the core insights."
PHASE 3 - RESEARCH & ANALYSIS:
"Unveiling [Topics Key Aspect]: Ive begun researching '[topic]' to gather detailed insights.
Initial searches into '[specific query]' have yielded valuable findings, helping me understand [key discoveries].
Now, I’m focusing on deeper details like [specific aspects]. This phase aims to uncover factual information that strengthens the presentation narrative."
type:action tool:webSearch - Searching for: '[specific search query]'
PHASE 4 - CONTENT EXTRACTION:
"Ive gathered preliminary knowledge about [topic] and will now examine relevant websites to extract finer details for the slides.
type:action tool:readWebsite - Reading website: [https://example.com] for [specific purpose]
Examining Website Content: Ive successfully extracted core details such as [specific findings].
These insights will serve as the backbone for slide development."
PHASE 5 - SYNTHESIS & FINAL REFINEMENT:
"Refining Information: After completing comprehensive research, Ive consolidated all major insights about [topic], including [key summarized points].
This material provides a strong foundation for creating impactful, well-structured slides.
I’ll now transform the refined data into engaging presentation content that clearly conveys understanding and depth."


📐 LAYOUT REQUIREMENTS:
You MUST use varied layouts: "title", "section", "content", "twocolumn".
Distribute layouts: ~10% title, ~20% section, ~40% content, ~30% twocolumn

📋 JSON RESPONSE STRUCTURE:
Return EXACTLY this structure:
{
  "thinking": [ ... (all 5 phases) ... ],
  "presentation": {
    "title": "${topic}",
    "action": "create",
    "template": "${templateName}",
    "globalTheme": {
      "backgroundColor": "#${templateDesign.palette.background}",
      "textColor": "#${templateDesign.palette.text}",
      "titleFont": "${templateDesign.fonts.title}",
      "bodyFont": "${templateDesign.fonts.body}",
      "accentColor": "#${templateDesign.palette.accent}",
      "imageQuery": "${globalImageQuery}"
    },
    "slides": [
      {
        "layout": "title" | "content" | "section" | "twocolumn",
        "title": "Specific, descriptive title",
        "subtitle": "Only for title layout",
        "content": [
          "Detailed bullet point with specific information"
        ],
        "imageQuery": "Specific query for this slide's content",
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

🎯 CRITICAL RULES:
1. Generate 6-10 slides.
2. Each content slide needs 3-5 DETAILED bullet points.
3. You MUST generate a specific, relevant \`imageQuery\` for **every single slide**.

User Topic: ${topic}
User Request: `;
};

// === PROMPT 2: FOR EDITING EXISTING PRESENTATIONS ===
const getEditPrompt = (currentPPT: PPTData): string => {
  return `You are a JSON editing assistant. Your **only job** is to apply the user's requested edit to the provided 'Current Presentation' JSON.

**CRITICAL EDITING RULES:**
1.  **PRESERVE ALL DATA:** You MUST return the *entire*, complete JSON structure. Do not omit any fields, slides, or properties.
2.  **DO NOT BE LAZY:** If the user edits slide 2, you MUST still return slides 1, 3, 4, etc., *exactly as they were*.
3.  **PRESERVE FIELDS:** If you change the \`content\` of a slide, you MUST preserve its \`layout\`, \`title\`, and \`imageQuery\`. Only change what the user explicitly asks to change.
4.  **DO NOT RE-RESEARCH:** Do NOT use your "Phase 1-5" creation steps. This is a simple edit.
5.  **HANDLE 'CHANGE TEMPLATE':** If the user asks to "change template to 'executive'", your *only* change should be to update the top-level \`template\` field to "executive". Do not change content.
6.  **HANDLE 'ADD IMAGES':** If a slide is missing an \`imageQuery\` and the user asks to "add images", you must *only* add a new, relevant \`imageQuery\` field to that slide.
7.  **NEVER OMIT \`imageQuery\`:** If a slide already has an \`imageQuery\`, you must return it.

Return **ONLY** the full \`presentation\` JSON object, with the \`thinking\` array showing a single step of what you did.

EXAMPLE RESPONSE:
{
  "thinking": ["User asked to change the title of slide 1. I have updated the 'title' field for that slide and am returning the full JSON."],
  "presentation": { ... (the entire, updated PPTData object) ... }
}

---
HERE IS THE CURRENT PRESENTATION JSON:
${JSON.stringify(currentPPT, null, 2)}
---

User Request: `;
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

    const isEditing = !!currentPPT;
    let systemInstruction: string;
    let topic: string;

    if (isEditing) {
      // === EDITING LOGIC ===
      topic = currentPPT.title || prompt; // Get the original topic
      systemInstruction = getEditPrompt(currentPPT);
      console.log('🤖 Starting EDIT generation...');

    } else {
      // === CREATION LOGIC ===
      topic = prompt; // The first prompt *is* the topic
      const templateName = selectTemplateFromTopic(topic);
      systemInstruction = getCreatePrompt(topic, templateName);
      console.log(`🎨 Starting CREATE generation with template: ${templateName}`);
    }
    
    const fullPrompt = `${systemInstruction}${prompt}`;

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
            if (text) 
            {
              fullResponseText += text;
              if (!thinkingStepsSent) {
                try {
                  const partial = JSON.parse(fullResponseText);
                  if (partial.thinking && Array.isArray(partial.thinking)) {
        
                    for (const thought of partial.thinking) {
                      let stepType: 'thought' | 'action' = 'thought';
                      let tool: 'webSearch' | 'readWebsite' | undefined;
                      const thoughtLower = thought.toLowerCase();
  
                      if (thoughtLower.includes('type:action') && thoughtLower.includes('tool:websearch')) {
                        stepType = 'action';
                        tool = 'webSearch';
                      } else if (thoughtLower.includes('type:action') && thoughtLower.includes('tool:readwebsite')) {
                        stepType = 'action';
                        tool = 'readWebsite';
                      }
                      const thinkingMsg = `<thought type="${stepType}"${tool ?
 ` tool="${tool}"` : ''}>${thought}</thought>\n`;
                      controller.enqueue(encoder.encode(thinkingMsg));
                    }
                    thinkingStepsSent = true;
                  }
                } catch {}
              }
            }
          }

          const responseData = JSON.parse(fullResponseText);
          if (!responseData.presentation) throw new Error('Invalid response - missing presentation object');
          
          const presentation: GeminiResponse = responseData.presentation;
          
          // --- Title & Template Safety Checks ---
          if (!presentation.title) {
            presentation.title = topic;
          }
          if (!presentation.template) {
            presentation.template = currentPPT?.template || selectTemplateFromTopic(topic);
          }
          if (!presentation.globalTheme) {
             const templateDesign = DESIGN_TEMPLATES[presentation.template as DesignTemplate] || DESIGN_TEMPLATES['minimalist'];
             presentation.globalTheme = {
                backgroundColor: `#${templateDesign.palette.background}`,
                textColor: `#${templateDesign.palette.text}`,
                titleFont: templateDesign.fonts.title,
                bodyFont: templateDesign.fonts.body,
                accentColor: `#${templateDesign.palette.accent}`,
                imageQuery: getImageQuery(topic)
             }
          }
          // --- End Safety Checks ---

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
              content: Array.isArray(slide.content) ? slide.content : [],
            }));
          }

          const validSlides = presentation.slides.filter(slide =>
            slide.title &&
            slide.layout &&
            slide.design &&
            ['title', 'content', 'section', 'twocolumn'].includes(slide.layout)
          );
          if (validSlides.length === 0) throw new Error('No valid slides generated');
          presentation.slides = validSlides;
          
          const successMsg = { type: "done", data: presentation };
          controller.enqueue(encoder.encode(`\n<<<JSON_START>>>\n${JSON.stringify(successMsg)}`));
        } catch (error) {
          const errorMsg = {
            type: "error",
            error: error instanceof Error ?
 error.message : "Processing failed"
          };
          console.error("--- Stream Error ---", error, fullResponseText);
          controller.enqueue(encoder.encode(`\n<<<JSON_START>>>\n${JSON.stringify(errorMsg)}`));
        }

        controller.close();
      },
    });
    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("--- 500 ERROR IN /api/gemini ---", error);
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}