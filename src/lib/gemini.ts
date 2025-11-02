import {
  GoogleGenerativeAI,
  GenerationConfig,
  SafetySetting,
  HarmCategory,
  HarmBlockThreshold,
} from '@google/generative-ai';
import { GeminiResponse, PPTData } from '@/types'; // <-- Import PPTData

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not defined in environment variables.');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Switch back to the 'gemini-pro' model (as '2.5-pro-preview' had quota issues)
const model = genAI.getGenerativeModel({
  //model: 'gemini-pro',
  model: 'gemini-2.5-pro-preview-05-06',
});

const generationConfig: GenerationConfig = {
  temperature: 0.7,
  topK: 1,
  topP: 1,
  maxOutputTokens: 8192,
  responseMimeType: 'application/json',
};

// Safety settings remain the same
const safetySettings: SafetySetting[] = [
  // ... (safety settings are unchanged)
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


// --- 1. THIS IS THE MAJOR UPDATE ---
// We make the system instruction dynamic based on whether 'currentPPT' exists.
const getSystemInstruction = (currentPPT: PPTData | null): string => {
  
  const jsonSchema = `
  type GeminiResponse = {
    action: 'create' | 'edit' | 'add' | 'delete' | 'reorder';
    slides: {
      layout: 'title' | 'content' | 'section' | 'twocolumn';
      title: string;
      subtitle?: string; // Optional subtitle for 'title' layout
      content: string[]; // Array of bullet points or paragraphs
    }[];
    reasoning?: string; // Explain your thought process
  };
  `;

  let contextInstruction: string;

  if (currentPPT) {
    // EDIT INSTRUCTION
    contextInstruction = `
    The user wants to edit an existing presentation.
    Here is the CURRENT presentation data (in JSON format):
    ${JSON.stringify(currentPPT)}

    You MUST analyze this current data and the user's prompt.
    Your response MUST be the *complete, new* presentation data,
    with the user's requested edits applied.
    For example, if the user says "change title of slide 2",
    you will return the *entire* slide deck with only that change.
    Do not just send the changed slide.
    `;
  } else {
    // CREATE INSTRUCTION
    contextInstruction = `
    The user wants to create a new presentation from scratch.
    You MUST generate a complete set of slides based on their prompt.
    `;
  }

  // Combine instructions
  return `
    You are an AI assistant specialized in creating PowerPoint presentations.
    Your goal is to take a user's prompt and generate a structured JSON output
    that can be used to create a presentation.

    The user may ask to create a new presentation or edit an existing one.
    
    ${contextInstruction}

    The JSON object you return MUST follow this TypeScript type:
    ${jsonSchema}

    - 'layout' must be one of the specified types.
    - 'title' is a concise heading.
    - 'content' is an array of strings (bullet points).
    
    ALWAYS return a valid JSON object matching this structure.
    Do not return any other text or markdown.
  `;
};

/**
 * Generates or edits presentation slides based on user input and current context.
 *
 * @param userInput - The prompt from the user.
 *m @param currentPPT - The current presentation data (null if new).
 * @returns A parsed GeminiResponse object.
 */
export async function generateSlides(
  userInput: string,
  currentPPT: PPTData | null // <-- 2. Accept the currentPPT
): Promise<GeminiResponse> {
  try {
    // 3. Get the dynamic system instruction
    const systemInstruction = getSystemInstruction(currentPPT);

    const chat = model.startChat({
      generationConfig,
      safetySettings,
      systemInstruction: {
        role: 'system',
        parts: [{ text: systemInstruction }],
      },
      history: [], // We clear history; all context is in the system prompt
    });

    const result = await chat.sendMessage(userInput);
    const response = result.response;
    const jsonText = response.text();

    const parsedResponse: GeminiResponse = JSON.parse(jsonText);
    
    return parsedResponse;

  } catch (error) {
    console.error('Error generating slides from Gemini:', error);
    const errorResponse: GeminiResponse = {
      action: currentPPT ? 'edit' : 'create',
      slides: currentPPT ? currentPPT.slides : [], // Return old slides on error
      reasoning: `Error: Could not modify presentation. ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    };
    return errorResponse;
  }
}