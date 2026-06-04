import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { textQuery, locationBias } = body;

    if (!textQuery) {
      return NextResponse.json({ error: 'textQuery is required' }, { status: 400 });
    }

    const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': process.env.GOOGLE_MAPS_API_KEY!,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.location',
      },
      body: JSON.stringify({
        textQuery: textQuery,
        ...(locationBias && { locationBias }) 
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Google API Error:", data);
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Internal Server Error:", error);
    return NextResponse.json({ error: error || 'Unknown error' }, { status: 500 });
  }
}
