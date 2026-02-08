
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing App ID parameter' }, { status: 400 });
  }

  // Initialize Supabase Admin Client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('CRITICAL: Missing Supabase environment variables for download redirect.');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // 1. Fetch data
    const { data, error } = await supabase
      .from('apps')
      .select('apk_url, name')
      .eq('id', id)
      .single();

    if (error || !data || !data.apk_url) {
      return NextResponse.json({ error: 'App package not found' }, { status: 404 });
    }

    // 2. Prepare Filename (Sanitized)
    const appName = data.name || 'App';
    // Remove special chars, spaces to underscores
    const safeName = appName.replace(/[^a-zA-Z0-9\-_ ]/g, '').trim().replace(/\s+/g, '_');
    const fileName = `${safeName}.aab`; // Force .aab extension

    const originalUrl = data.apk_url;
    let finalRedirectUrl = originalUrl;

    // 3. Strategy A: Supabase Storage Logic (Signed URL)
    // If the URL is from our own Supabase project, we can sign it to FORCE the filename header.
    const sbMarker = '.supabase.co/storage/v1/object/public/';
    if (originalUrl.includes(sbMarker)) {
       try {
          const splitParts = originalUrl.split(sbMarker);
          if (splitParts.length > 1) {
             // Structure: [bucket]/[folder]/[file]
             const pathParts = splitParts[1].split('/');
             const bucketName = pathParts[0];
             const filePath = pathParts.slice(1).join('/');

             // Generate Signed URL valid for 60 seconds
             const { data: signedData } = await supabase
               .storage
               .from(bucketName)
               .createSignedUrl(filePath, 60, {
                 download: fileName // This forces Content-Disposition: attachment; filename="..."
               });

             if (signedData?.signedUrl) {
                return NextResponse.redirect(signedData.signedUrl);
             }
          }
       } catch (err) {
          console.warn('Failed to sign Supabase URL, falling back to query params', err);
       }
    }

    // 4. Strategy B: Generic Query Params (Works for S3, GCS, etc.)
    // We try to append params that many storage providers respect for renaming.
    try {
      const targetUrl = new URL(originalUrl);
      
      // Standard S3/GCS param to override header
      targetUrl.searchParams.set('response-content-disposition', `attachment; filename="${fileName}"`);
      
      // Supabase public param (if not signed)
      targetUrl.searchParams.set('download', fileName);

      finalRedirectUrl = targetUrl.toString();
    } catch (e) {
      // If URL parsing fails, use original
    }

    // 5. Execute Redirect
    return NextResponse.redirect(finalRedirectUrl);

  } catch (error: any) {
    console.error('[Download API] Internal Error:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
