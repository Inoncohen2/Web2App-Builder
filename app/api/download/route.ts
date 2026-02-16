
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id'); // Can be appId (legacy) or buildId (new)
  const type = searchParams.get('type'); // optional 'build' to specify it's a buildId

  if (!id) {
    return NextResponse.json({ error: 'Missing ID parameter' }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    let downloadUrl = null;
    let name = 'App';

    // 1. Try fetching from app_builds (New Architecture)
    // We try assuming it's a build_id first
    const { data: buildData } = await supabase
        .from('app_builds')
        .select('download_url, app_id')
        .eq('id', id)
        .single();

    if (buildData && buildData.download_url) {
        downloadUrl = buildData.download_url;
        // Fetch app name
        const { data: appData } = await supabase.from('apps').select('name').eq('id', buildData.app_id).single();
        if (appData) name = appData.name;
    } else {
        // 2. Fallback: Treat ID as app_id (Legacy or Dashboard Link)
        // Fetch latest ready build
        const { data: latestBuild } = await supabase
            .from('app_builds')
            .select('download_url')
            .eq('app_id', id)
            .eq('status', 'ready')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
            
        if (latestBuild && latestBuild.download_url) {
            downloadUrl = latestBuild.download_url;
            const { data: appData } = await supabase.from('apps').select('name').eq('id', id).single();
            if (appData) name = appData.name;
        } else {
            // 3. Fallback: Legacy `apps` table columns
            const { data: legacyData } = await supabase
                .from('apps')
                .select('apk_url, download_url, name')
                .eq('id', id)
                .single();
            
            if (legacyData) {
                downloadUrl = legacyData.download_url || legacyData.apk_url;
                name = legacyData.name;
            }
        }
    }

    if (!downloadUrl) {
      return NextResponse.json({ error: 'Download not found' }, { status: 404 });
    }

    // Prepare Filename
    const safeName = name.replace(/[^a-zA-Z0-9\-_ ]/g, '').trim().replace(/\s+/g, '_');
    let extension = 'apk';
    if (downloadUrl.includes('.aab')) extension = 'aab';
    else if (downloadUrl.includes('.zip')) extension = 'zip';
    else if (downloadUrl.includes('.ipa')) extension = 'ipa';
    
    const fileName = `${safeName}.${extension}`;
    let finalRedirectUrl = downloadUrl;

    // Handle Supabase Storage Signing
    const sbMarker = '.supabase.co/storage/v1/object/public/';
    if (downloadUrl.includes(sbMarker)) {
       try {
          const splitParts = downloadUrl.split(sbMarker);
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
          console.warn('Signing failed', err);
       }
    }

    try {
      const targetUrl = new URL(downloadUrl);
      targetUrl.searchParams.set('response-content-disposition', `attachment; filename="${fileName}"`);
      targetUrl.searchParams.set('download', fileName);
      finalRedirectUrl = targetUrl.toString();
    } catch (e) {}

    return NextResponse.redirect(finalRedirectUrl);

  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
