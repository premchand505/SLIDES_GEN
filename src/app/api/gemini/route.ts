// app/api/gemini/route.ts - FIXED VERSION (5-phase thinking)
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
  model: "gemini-2.0-flash-exp",
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

const getEnhancedSystemInstruction = (currentPPT: PPTData | null, topic: string): string => {
  const selectedTemplate: DesignTemplate = currentPPT?.template as DesignTemplate || selectTemplateFromTopic(topic);
  const templateDesign = DESIGN_TEMPLATES[selectedTemplate];
  const imageQuery = getImageQuery(topic);

  let contextInstruction: string;
  if (currentPPT) {
    contextInstruction = `EDITING EXISTING PRESENTATION
Current Template: ${currentPPT.template || selectedTemplate}
Maintain design consistency while applying user's requested changes.

Current Presentation:
${JSON.stringify(currentPPT, null, 2)}`;
  } else {
    contextInstruction = `CREATING NEW PRESENTATION from scratch`;
  }

  return `You are an EXPERT AI Presentation Designer with a focus on:
1. User-centric reasoning and educational content
2. Stunning visual design with modern templates
3. Proper image integration and layout variety
4. Consistent color application using complementary palettes

${contextInstruction}

SELECTED DESIGN TEMPLATE: "${selectedTemplate}"

🎨 COLOR PALETTE (Use EXACTLY these colors - they are complementary):
Primary: #${templateDesign.palette.primary}
Secondary: #${templateDesign.palette.secondary}
Accent: #${templateDesign.palette.accent}
Background: #${templateDesign.palette.background}
Text: #${templateDesign.palette.text}
Text Light: #${templateDesign.palette.textLight}

📝 TYPOGRAPHY:
Title Font: ${templateDesign.fonts.title}
Body Font: ${templateDesign.fonts.body}

🖼️ IMAGE STYLE: ${templateDesign.imageStyle}
Image Query Keywords: "${imageQuery}"

📊 REQUIRED THINKING PROCESS (Critical for Recruiter):

Your "thinking" array MUST follow this EXACT 5-phase format with progressive detail:

PHASE 1 - RESEARCH INITIATION:
"Begin Researching [Topic]: Ive initiated the research phase for the [topic] presentation. Im starting with broad web searches using carefully selected keywords related to [topic’s key aspects]. The goal is to build a comprehensive understanding of the subject before structuring the presentation content. I’ll analyze the search results for relevance and accuracy to form a solid foundation for the next steps."

PHASE 2 - STRATEGY DEFINITION:
"Defining Presentation Structure: Ive established my approach to the '[topic]' presentation. My plan is to extract information from credible online sources and synthesize it into clear, concise slide material with proper citations. The objective is to ensure every slide reflects a logical flow — introducing the topic, explaining its importance, and highlighting the core insights."

PHASE 3 - RESEARCH & ANALYSIS:
"Unveiling [Topics Key Aspect]: Ive begun researching '[topic]' to gather detailed insights. Initial searches into '[specific query]' have yielded valuable findings, helping me understand [key discoveries]. Now, I’m focusing on deeper details like [specific aspects]. This phase aims to uncover factual information that strengthens the presentation narrative."
type:action tool:webSearch - Searching for: '[specific search query]'

PHASE 4 - CONTENT EXTRACTION:
"Ive gathered preliminary knowledge about [topic] and will now examine relevant websites to extract finer details for the slides.
type:action tool:readWebsite - Reading website: [https://example.com] for [specific purpose]
Examining Website Content: Ive successfully extracted core details such as [specific findings]. These insights will serve as the backbone for slide development."

PHASE 5 - SYNTHESIS & FINAL REFINEMENT:
"Refining Information: After completing comprehensive research, Ive consolidated all major insights about [topic], including [key summarized points]. This material provides a strong foundation for creating impactful, well-structured slides. I’ll now transform the refined data into engaging presentation content that clearly conveys understanding and depth."

📐 LAYOUT REQUIREMENTS:
You MUST use varied layouts across slides:
- "title": Opening slide with large title, subtitle, full-screen or overlay images
- "section": Transition slide with side color panel and large text
- "content": Standard content with bullet points, can have side images
- "twocolumn": Two-column layout for comparisons or detailed lists

Distribute layouts: ~10% title, ~20% section, ~40% content, ~30% twocolumn

🖼️ IMAGE INTEGRATION RULES:
Based on imageStyle:
- "overlay": Images at 75-85% transparency behind content
- "side": Images in side panels (50% width for sections, 46% for content)
- "full": Full-screen background images at 90% transparency
- "none": Decorative patterns only

Every slide MUST have visual interest through images OR decorative elements.

📋 JSON RESPONSE STRUCTURE:
Return EXACTLY this structure:

{
  "thinking": [
    "Begin Researching [Topic]: [detailed initiation]",
    "Unveiling [Key Aspect]: [search findings]",
    "type:action tool:webSearch - Searching for: '[query]'",
    "type:action tool:readWebsite - Reading website: [URL] for [purpose]",
    "Examining Website Content: [extraction results]",
    
  ],
  "presentation": {
    "action": "create" | "edit",
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
        "layout": "title" | "content" | "section" | "twocolumn",
        "title": "Specific, descriptive title",
        "subtitle": "Only for title layout",
        "content": [
          "Detailed bullet point with specific information",
          "Another substantive point with facts or examples",
          "Educational content that adds value"
        ],
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
1. ALL slides MUST use IDENTICAL colors from globalTheme
2. Generate 6-10 slides for comprehensive coverage
3. Each content slide needs 3-5 DETAILED, SPECIFIC bullet points
4. Avoid generic statements - include facts, examples, data
5. Use varied layouts - don't repeat same layout more than 2x consecutively
6. Images referenced by imageQuery should match slide content
7. For editing: modify only requested aspects, keep rest consistent
8. thinking array MUST follow the progressive phases shown above

🚫 AVOID:
- Generic content like "Introduction to topic"
- Vague bullet points like "Important considerations"
- Color inconsistency between slides
- Overuse of same layout type
- Missing or incomplete thinking steps
- Skipping the progressive research narrative

Topic: ${topic}

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

    const systemInstruction = getEnhancedSystemInstruction(currentPPT, prompt);
    const fullPrompt = `${systemInstruction}${prompt}`;

    console.log('🎨 Starting enhanced generation...');
    console.log('Template selected:', currentPPT?.template || selectTemplateFromTopic(prompt));

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
                      const thinkingMsg = `<thought type="${stepType}"${tool ? ` tool="${tool}"` : ''}>${thought}</thought>\n`;
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
    const message = error instanceof Error ? error.message : "Internal server error";
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }
}
