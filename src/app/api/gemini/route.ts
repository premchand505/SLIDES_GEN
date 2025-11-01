import { NextResponse } from 'next/server';
import { generateSlides } from '@/lib/gemini';
import { ChatMessage } from '@/types';

/**
 * POST handler for the /api/gemini route.
 * Receives user input and returns a structured slide presentation.
 */
export async function POST(request: Request) {
  try {
    // We'll expect a body like { prompt: string, history: ChatMessage[] }
    const body = await request.json();
    const { prompt } = body as { prompt: string; history: ChatMessage[] };

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Call our server-side helper function
    // We pass the prompt and (eventually) the history for context
    const geminiResponse = await generateSlides(prompt);

    // Return the successful JSON response from Gemini
    return NextResponse.json(geminiResponse, { status: 200 });

  } catch (error) {
    console.error('Error in /api/gemini route:', error);
    
    // Generic server error
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}