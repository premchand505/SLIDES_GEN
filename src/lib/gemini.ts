import {
  GoogleGenerativeAI,
  GenerationConfig,
  SafetySetting,
  HarmCategory,
  HarmBlockThreshold,
} from '@google/generative-ai';
import { GeminiResponse } from '@/types';

// Get the API key from environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not defined in environment variables.');
}

// Initialize the GoogleGenerativeAI client
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Use the specified model from the project brief 
const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-pro-preview-05-06',
  //model: 'gemini-1.5-flash-latest',
  //model: 'gemini-pro',
});

/**
 * Configuration for AI generation
 */
const generationConfig: GenerationConfig = {
  temperature: 0.7,
  topK: 1,
  topP: 1,
  maxOutputTokens: 8192,
  // Ensure the response is JSON
  responseMimeType: 'application/json',
};

/**
 * Safety settings to block harmful content
 */
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

/**
 * System instruction for the AI model.
 * This is the most crucial part of prompt engineering.
 */
const systemInstruction = `
You are an AI assistant specialized in creating PowerPoint presentations.
Your goal is to take a user's prompt and generate a structured JSON output
that can be used to create a presentation.

The user may ask to create a new presentation or edit an existing one.
Based on the user's request, you must return a JSON object.

The JSON object MUST follow this TypeScript type:
type GeminiResponse = {
  action: 'create' | 'edit' | 'add' | 'delete' | 'reorder';
  slides: {
    title: string;
    content: string[]; // Array of bullet points or paragraphs
    layout: 'title' | 'content' | 'section' | 'twocolumn';
  }[];
  reasoning?: string; // Optional: explain your thought process
};

- For 'create', generate a full set of slides.
- For 'edit', 'add', 'delete', or 'reorder', modify the 'slides' array
  based on the user's instructions.
- 'title' should be a concise heading for the slide.
- 'content' should be an array of strings (bullet points).
- 'layout' must be one of the specified types. 'title' is for a title slide,
  'section' for a section header, 'content' for a standard title + bullets slide,
  and 'twocolumn' for a slide with two content columns.

ALWAYS return a valid JSON object matching this structure.
Do not return any other text or markdown.
`;

/**
 * Generates presentation slides based on user input.
 *
 * @param userInput - The prompt from the user.
 * @param history - The previous chat messages (for context, optional).
 * @returns A parsed GeminiResponse object.
 */
export async function generateSlides(
  userInput: string,
  // We can add history here later for edit context
  // history: ChatMessage[] 
): Promise<GeminiResponse> {
  try {
    const chat = model.startChat({
      generationConfig,
      safetySettings,
      // Pass the system prompt
      systemInstruction: {
        role: 'system',
        parts: [{ text: systemInstruction }],
      },
      history: [
        // We can prime the chat here if needed
      ],
    });

    const result = await chat.sendMessage(userInput);
    const response = result.response;
    const jsonText = response.text();

    // Parse the JSON text into our defined type
    const parsedResponse: GeminiResponse = JSON.parse(jsonText);
    
    return parsedResponse;

  } catch (error) {
    console.error('Error generating slides from Gemini:', error);
    // Create a user-friendly error response
    const errorResponse: GeminiResponse = {
      action: 'create', // default action on error
      slides: [], // No slides on error
      reasoning: `Error: Could not generate presentation. ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    };
    return errorResponse;
  }
}