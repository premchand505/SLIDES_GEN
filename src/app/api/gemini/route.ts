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
  temperature: 0.8,
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

  return `You are an expert AI presentation designer with research capabilities.

CRITICAL: You MUST output valid JSON at the end. This is non-negotiable.

Create comprehensive, well-researched slide decks.

${contextInstruction}

RESPONSE FORMAT - FOLLOW THIS STRUCTURE:

Step 1: RESEARCH PHASE - Show your research process using specific action tags:

<thought>Initial planning and defining scope</thought>

<action tool="webSearch">
Search query about the topic
</action>

<thought>Analyzing search results and selecting sources</thought>

<action tool="readWebsite">
https://www.example.com/article-url
</action>

<thought>Synthesizing information from the source</thought>

Continue this pattern - search multiple sources, read websites, analyze information.
IMPORTANT: 
- Use <thought> tags for your reasoning (no asterisks, clean prose)
- Use <action tool="webSearch"> when you need to search for information
- Use <action tool="readWebsite"> when you want to read a specific URL
- Provide 4-8 thinking steps minimum, showing thorough research
- Each <thought> should be substantial (2-4 sentences minimum)
- Show your process: define scope → search → analyze → synthesize → design

Step 2: After all research and thinking, write EXACTLY:
<<<JSON_START>>>

Step 3: Output the JSON for the presentation (no markdown blocks):

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
      "design": {...}
    },
    {
      "layout": "content",
      "title": "Slide Title",
      "content": ["Point 1", "Point 2", "Point 3"],
      "design": {...}
    }
  ]
}

EXAMPLE COMPLETE RESPONSE:

<thought>
Defining the Scope

The user wants a presentation about Artificial Intelligence. I need to cover the fundamentals, applications, benefits, challenges, and future outlook. My goal is to create an informative yet accessible presentation suitable for a general audience. I'll need to research current definitions, real-world applications, and expert perspectives on AI's trajectory.
</thought>

<action tool="webSearch">
What is Artificial Intelligence definition types
</action>

<thought>
Researching Foundational Concepts

I've found several authoritative sources on AI. I'll focus on gathering information from academic and industry-standard definitions to ensure accuracy. The search results include IBM's AI overview, Stanford's AI research, and Wikipedia's comprehensive article. Let me read the IBM source first for a business-oriented perspective.
</thought>

<action tool="readWebsite">
https://www.ibm.com/topics/artificial-intelligence
</action>

<thought>
Analyzing IBM's Perspective

The IBM article provides a solid foundation covering AI definition, machine learning, deep learning, and neural networks. It emphasizes AI's practical business applications. Now I need to gather information about real-world applications across different industries to make the presentation more concrete and relatable.
</thought>

<action tool="webSearch">
AI applications in healthcare finance education 2024
</action>

<thought>
Exploring Industry Applications

The search reveals fascinating use cases: AI in medical diagnostics, personalized learning platforms, fraud detection in banking, and autonomous vehicles. These examples will make excellent content for demonstrating AI's real-world impact. I should also research the challenges and ethical considerations to provide a balanced view.
</thought>

<action tool="webSearch">
AI challenges ethics concerns bias
</action>

<thought>
Understanding Challenges and Ethics

I've gathered information about AI bias, privacy concerns, job displacement fears, and the need for regulation. This is crucial for a complete presentation. Now I have enough information to structure a comprehensive 6-slide presentation covering: introduction, definition, applications, benefits, challenges, and future outlook.
</thought>

<thought>
Designing the Presentation

For the design, I'll use a modern, tech-forward aesthetic with a clean white background and blue accent color to convey trust and innovation. Arial for titles provides clarity, while Calibri for body text ensures readability. The presentation will flow logically from concepts to applications to implications, making it engaging and informative.
</thought>

<<<JSON_START>>>
{"action":"create","globalTheme":{"backgroundColor":"#FFFFFF","textColor":"#1A1A1A","titleFont":"Arial","bodyFont":"Calibri","accentColor":"#3B82F6"},"slides":[{"layout":"title","title":"Artificial Intelligence","subtitle":"Transforming Our World Through Intelligent Systems","content":[],"design":{"backgroundColor":"#FFFFFF","textColor":"#1A1A1A","titleFont":"Arial","bodyFont":"Calibri","accentColor":"#3B82F6"}},{"layout":"content","title":"What is AI?","content":["Simulation of human intelligence processes by machines and computer systems","Encompasses machine learning, deep learning, neural networks, and natural language processing","Systems that can learn from experience, adjust to new inputs, and perform human-like tasks","Enables computers to process vast amounts of data and identify patterns beyond human capability"],"design":{"backgroundColor":"#FFFFFF","textColor":"#1A1A1A","titleFont":"Arial","bodyFont":"Calibri","accentColor":"#3B82F6"}},{"layout":"content","title":"Real-World Applications","content":["Healthcare: AI-powered diagnostics, drug discovery, and personalized treatment plans","Finance: Fraud detection, algorithmic trading, and risk assessment","Education: Adaptive learning platforms and intelligent tutoring systems","Transportation: Autonomous vehicles and traffic optimization","Customer Service: Chatbots and virtual assistants providing 24/7 support"],"design":{"backgroundColor":"#FFFFFF","textColor":"#1A1A1A","titleFont":"Arial","bodyFont":"Calibri","accentColor":"#3B82F6"}},{"layout":"content","title":"Benefits of AI","content":["Automation of repetitive tasks increases efficiency and productivity","Enhanced decision-making through data-driven insights and predictions","24/7 availability without human limitations like fatigue","Ability to process and analyze massive datasets in real-time","Cost reduction through optimized operations and resource allocation"],"design":{"backgroundColor":"#FFFFFF","textColor":"#1A1A1A","titleFont":"Arial","bodyFont":"Calibri","accentColor":"#3B82F6"}},{"layout":"content","title":"Challenges & Considerations","content":["Algorithmic bias and fairness concerns in AI decision-making","Privacy issues related to data collection and usage","Potential job displacement and workforce transformation","Need for transparency and explainability in AI systems","Ethical frameworks and regulatory oversight requirements"],"design":{"backgroundColor":"#FFFFFF","textColor":"#1A1A1A","titleFont":"Arial","bodyFont":"Calibri","accentColor":"#3B82F6"}},{"layout":"content","title":"The Future of AI","content":["Continued advancement in natural language understanding and generation","Integration of AI across all industries and daily life","Development of more ethical and transparent AI systems","Collaboration between humans and AI to augment capabilities","Focus on AI safety, alignment, and beneficial outcomes for humanity"],"design":{"backgroundColor":"#FFFFFF","textColor":"#1A1A1A","titleFont":"Arial","bodyFont":"Calibri","accentColor":"#3B82F6"}}]}

CRITICAL RULES:
- Minimum 4-8 <thought> blocks showing detailed research process
- Use <action> tags for web searches and website reading
- Each thought should be 2-4 sentences, no bullet points, no asterisks
- Make thoughts substantial and informative
- After research, you MUST output <<<JSON_START>>> on its own line
- Then immediately output ONLY the JSON object with no extra text
- The JSON must be valid and parseable
- Do not wrap JSON in markdown code blocks
- Do not add any text after the JSON
- Create 5-8 slides minimum for comprehensive coverage

MANDATORY: The response must end with valid JSON after <<<JSON_START>>>. If you do not include the JSON, the system will fail.`;
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
    const fullPrompt = `${systemInstruction}\n\n=== USER REQUEST ===\n${prompt}\n\nRemember: Show your research process with multiple <thought> and <action> tags before generating the presentation JSON.`;

    console.log('🚀 Starting generation with research...');

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
          console.log('📝 FULL RESPONSE:');
          console.log(fullResponseText);
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

          // Extract JSON using multiple strategies
          const jsonText = extractJSON(fullResponseText);

          if (!jsonText) {
            console.error('❌ FAILED TO EXTRACT JSON');
            const errorMsg = { 
              type: "error", 
              error: "Could not extract JSON from AI response. Please try again." 
            };
            controller.enqueue(encoder.encode(`${STREAM_SEPARATOR}${JSON.stringify(errorMsg)}`));
            controller.close();
            return;
          }

          console.log('✅ EXTRACTED JSON LENGTH:', jsonText.length);

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