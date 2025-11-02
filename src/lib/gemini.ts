import {
  GoogleGenerativeAI,
  GenerationConfig,
  SafetySetting,
  HarmCategory,
  HarmBlockThreshold,
} from '@google/generative-ai';
import { GeminiResponse, PPTData, SlideDesign } from '@/types';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not defined in environment variables.');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// --- FIX: These variables MUST be defined at the top level ---
const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-pro-preview-05-06',
});

const generationConfig: GenerationConfig = {
  temperature: 0.7,
  topK: 1,
  topP: 1,
  maxOutputTokens: 8192,
  responseMimeType: 'application/json',
};

const safetySettings: SafetySetting[] = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];
// --- END FIX ---


const getSystemInstruction = (currentPPT: PPTData | null): string => {
  // ... (This function is correct)
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
    design: SlideDesign; // <-- AI MUST GENERATE THIS
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
    contextInstruction = `
    The user wants to edit an existing presentation.
    Here is the CURRENT presentation data (in JSON format):
    ${JSON.stringify(currentPPT)}

    You MUST analyze this current data and the user's prompt.
    Your response MUST be the *complete, new* presentation data,
    with the user's requested edits applied.
    `;
  } else {
    contextInstruction = `
    The user wants to create a new presentation from scratch.
    You MUST generate a complete set of slides based on their prompt.
    `;
  }

  return `
    You are an expert AI presentation designer.
    Your goal is to generate both the CONTENT and the DESIGN for a presentation.
    ${contextInstruction}
    **CRITICAL DESIGN REQUIREMENTS:**
    1.  You MUST generate a 'design' object for *every single slide*.
    2.  Choose professional and visually appealing color palettes. 
    3.  'backgroundColor' and 'textColor' must have good contrast.
    4.  'accentColor' should be used for titles or key elements.
    5.  'titleFont' and 'bodyFont' should be standard, web-safe fonts.
    6.  You can optionally provide a 'globalTheme' object.
    The JSON object you return MUST follow this TypeScript type:
    ${jsonSchema}
    ALWAYS return a valid JSON object matching this structure.
    Do not return any other text or markdown.
  `;
};


export async function generateSlides(
  userInput: string,
  currentPPT: PPTData | null
): Promise<GeminiResponse> {
  try {
    const systemInstruction = getSystemInstruction(currentPPT);

    const chat = model.startChat({
      // --- FIX: These are now correctly in scope ---
      generationConfig,
      safetySettings,
      systemInstruction: {
        role: 'system',
        parts: [{ text: systemInstruction }],
      },
      history: [],
    });
    // --- END FIX ---

    const result = await chat.sendMessage(userInput);
    const response = result.response;
    const jsonText = response.text();
    const parsedResponse: GeminiResponse = JSON.parse(jsonText);
    
    if (parsedResponse.globalTheme) {
      const globalTheme = parsedResponse.globalTheme;
      parsedResponse.slides = parsedResponse.slides.map(slide => ({
        ...slide,
        design: slide.design || globalTheme 
      }));
    }
    
    return parsedResponse;

  } catch (error) {
    console.error('Error generating slides from Gemini:', error);
    
    const errorDesign: SlideDesign = {
      backgroundColor: "FFFFFF",
      textColor: "FF0000",
      titleFont: "Arial",
      bodyFont: "Arial",
      accentColor: "FF0000"
    };

    if (currentPPT && currentPPT.slides.length > 0) {
      return {
        action: 'edit',
        slides: currentPPT.slides,
        reasoning: `Error: Could not modify presentation. ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      };
    }
    
    return {
      action: 'create',
      slides: [{
        layout: 'content',
        title: 'Error Generating Presentation',
        content: [error instanceof Error ? error.message : 'Unknown error'],
        design: errorDesign
      }],
      reasoning: `Error: Could not create presentation. ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    };
  }
}