
import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { error: "This endpoint is deprecated. Logic moved to Supabase Edge Function 'scrape-site'." },
    { status: 410 }
  );
}
