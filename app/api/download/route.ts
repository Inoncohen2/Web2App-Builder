
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const type = searchParams.get('type') || 'apk'; // 'apk', 'source', 'ios'

  if (!id) {
    return NextResponse.json({ error: 'Missing App ID parameter' }, { status: 400 });
  }

  // Initialize Supabase Admin Client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // 1. Fetch data based on type
    const { data, error } = await supabase
      .from('apps')
      .select('apk_url, download_url, source_url, ios_url, name')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'App not found' }, { status: 404 });
    }

    let originalUrl = null;
    let extension = 'zip';

    // Determine which URL to use
    if (type === 'source') {
        originalUrl = data.source_url;
        extension = 'zip';
    } else if (type === 'ios') {
        originalUrl = data.ios_url;
        extension = 'zip';
    } else {
        // Default to APK/AAB
        originalUrl = data.download_url || data.apk_url;
        if (originalUrl) {
            if (originalUrl.includes('.aab')) extension = 'aab';
            else extension = 'apk';
        }
    }

    if (!originalUrl) {
      return NextResponse.json({ error: 'File not ready or not found' }, { status: 404 });
    }

    // 2. Prepare Filename (Sanitized)
    const appName = data.name || 'App';
    // Remove special chars, spaces to underscores
    const safeName = appName.replace(/[^a-zA-Z0-9\-_ ]/g, '').trim().replace(/\s+/g, '_');
    
    // Suffix for clarity
    const suffix = type === 'source' ? '-android-source' : type === 'ios' ? '-ios-source' : '';
    const fileName = `${safeName}${suffix}.${extension}`;
    
    let finalRedirectUrl = originalUrl;

    // 3. Strategy A: Supabase Storage Logic (Signed URL)
    const sbMarker = '.supabase.co/storage/v1/object/public/';
    if (originalUrl.includes(sbMarker)) {
       try {
          const splitParts = originalUrl.split(sbMarker);
          if (splitParts.length > 1) {
             const pathParts = splitParts[1].split('/');
             const bucketName = pathParts[0];
             const filePath = pathParts.slice(1).join('/');

             const { data: signedData } = await supabase
               .storage
               .from(bucketName)
               .createSignedUrl(filePath, 60, {
                 download: fileName
               });

             if (signedData?.signedUrl) {
                return NextResponse.redirect(signedData.signedUrl);
             }
          }
       } catch (err) {
          console.warn('Failed to sign Supabase URL', err);
       }
    }

    // 4. Strategy B: Generic Query Params
    try {
      const targetUrl = new URL(originalUrl);
      targetUrl.searchParams.set('response-content-disposition', `attachment; filename="${fileName}"`);
      targetUrl.searchParams.set('download', fileName);
      finalRedirectUrl = targetUrl.toString();
    } catch (e) {
      // Ignore URL parsing errors
    }

    // 5. Execute Redirect
    return NextResponse.redirect(finalRedirectUrl);

  } catch (error: any) {
    console.error('[Download API] Internal Error:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
