
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
    // 1. Fetch the APK URL AND the App Name from the database
    const { data, error } = await supabase
      .from('apps')
      .select('apk_url, name')
      .eq('id', id)
      .single();

    if (error || !data || !data.apk_url) {
      console.error('Download Error: App not found or URL missing', error);
      return NextResponse.json({ error: 'App package not found' }, { status: 404 });
    }

    // 2. Construct the desired filename (Site Name + .aab)
    const appName = data.name || 'App';
    // Remove special characters to ensure valid filename
    const safeName = appName.replace(/[^a-zA-Z0-9\-_ ]/g, '').trim().replace(/\s+/g, '_');
    const fileName = `${safeName}.aab`;

    // 3. Prepare the Redirect URL
    // We append ?download=filename.aab to the storage URL.
    // Supabase Storage (and S3 signed URLs) often respect this parameter to set the Content-Disposition header.
    let targetUrl: URL;
    try {
      targetUrl = new URL(data.apk_url);
      targetUrl.searchParams.set('download', fileName);
    } catch (e) {
      // Fallback if url is invalid, though unlikely from DB
      return NextResponse.redirect(data.apk_url);
    }

    // 4. Direct Redirect
    return NextResponse.redirect(targetUrl.toString());

  } catch (error: any) {
    console.error('[Download API] Internal Error:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
