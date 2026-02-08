
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing App ID parameter' }, { status: 400 });
  }

  // Initialize Supabase Admin Client
  // We use the Service Role Key to ensure we can read the record regardless of RLS policies
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('CRITICAL: Missing Supabase environment variables for download redirect.');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // 1. Fetch the APK URL from the database
    const { data, error } = await supabase
      .from('apps')
      .select('apk_url')
      .eq('id', id)
      .single();

    if (error || !data || !data.apk_url) {
      console.error('Download Error: App not found or URL missing', error);
      return NextResponse.json({ error: 'App package not found' }, { status: 404 });
    }

    // 2. Direct Redirect to the file storage
    // This offloads the bandwidth and download management to the browser/OS
    return NextResponse.redirect(data.apk_url);

  } catch (error: any) {
    console.error('[Download API] Internal Error:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
