// app/api/get-image/route.ts
import { NextResponse } from 'next/server';
import { getImageUrl } from '@/lib/designSystem'; // We re-use our existing function

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json({ error: 'Query is required' }, { status: 400 });
  }

  try {
    // getImageUrl securely uses the server-side PEXELS_API_KEY
    const imageUrl = await getImageUrl(query, 1920, 1080);
    return NextResponse.json({ url: imageUrl });
  } catch (error) {
    console.error('Error in /api/get-image:', error);
    return NextResponse.json({ error: 'Failed to fetch image' }, { status: 500 });
  }
}