import { NextResponse } from 'next/server';
// Import PPTData from the generator...
import { generatePresentationAsBase64 } from '@/lib/pptGenerator';
// ...but import the TYPE from our single source of truth
import { PPTData } from '@/types';

/* ---------- Request / Response payloads ---------- */
interface SuccessResponse {
  base64: string;
}
interface ErrorResponse {
  error: string;
}
type ApiResponse = SuccessResponse | ErrorResponse;

/* ---------- POST handler ---------- */
export async function POST(request: Request): Promise<NextResponse<ApiResponse>> {
  try {
    // 1. Parse JSON body
    const pptData: PPTData = await request.json();

    // 2. Validate payload
    if (!pptData?.slides?.length) {
      return NextResponse.json(
        { error: 'Invalid or empty presentation data' },
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 3. Generate PPTX (server side)
    const base64: string = await generatePresentationAsBase64(pptData);

    // 4. Success
    return NextResponse.json(
      { base64 },
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    // 5. Any error → 500
    const message =
      err instanceof Error ? err.message : 'Internal server error';
    console.error('[/api/generate-ppt] Error:', err);
    return NextResponse.json(
      { error: message },
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}