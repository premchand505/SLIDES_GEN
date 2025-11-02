import { NextResponse } from 'next/server';
import { generateSlides } from '@/lib/gemini';
import { PPTData } from '@/types'; // Import PPTData

/**
 * POST handler for the /api/gemini route.
 * Receives user input and (optionally) the current presentation
 * to generate or edit slides.
 */
export async function POST(request: Request) {
  try {
    // 1. Parse the new body structure
    const body = await request.json();
    const { prompt, currentPPT } = body as { 
      prompt: string; 
      currentPPT: PPTData | null; // <-- Get the current presentation
    };

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // 2. Pass both prompt and currentPPT to the helper
    const geminiResponse = await generateSlides(prompt, currentPPT);

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