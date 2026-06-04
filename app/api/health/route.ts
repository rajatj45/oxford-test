
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    env: {
      hasServerKey: Boolean(process.env.GOOGLE_MAPS_API_KEY),
      hasClientKey: Boolean(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY),
    },
    message: 'Server is up. This endpoint does not call Google — it just verifies env presence.'
  });
}
