
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    // 1. Parse incoming request body
    const body = await req.json();
    console.log('📦 Webhook Payload:', JSON.stringify(body, null, 2));

    const { status, artifacts, message, metadata } = body;

    // 2. Filter events
    if (status !== 'finished') {
      return NextResponse.json({ message: 'Ignored: Status not finished' }, { status: 200 });
    }

    // 3. Extract ID
    let saasAppId: string | null = null;
    const msgToCheck = message || (metadata && metadata.message);
    if (msgToCheck && typeof msgToCheck === 'string' && msgToCheck.includes('SAAS_BUILD_ID:')) {
        const parts = msgToCheck.split('SAAS_BUILD_ID:');
        if (parts.length > 1) {
            saasAppId = parts[1].trim().split(' ')[0]; 
        }
    }
    if (!saasAppId && metadata) {
        saasAppId = metadata.saasAppId || metadata.supabase_id || metadata.saas_build_id || metadata.SAAS_BUILD_ID;
    }

    // 4. Extract Artifact URL
    const artifactUrl = artifacts?.buildArtifact?.url || artifacts?.buildArtifact || artifacts?.buildUrl;

    if (!saasAppId) {
      console.error('❌ Error: Missing SAAS_BUILD_ID');
      return NextResponse.json({ error: 'Missing SAAS_BUILD_ID' }, { status: 400 });
    }

    if (!artifactUrl) {
      console.error('❌ Error: Missing Artifact URL');
      return NextResponse.json({ error: 'Missing Artifact URL' }, { status: 400 });
    }

    // 5. Initialize Supabase
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // 6. Determine Build Type
    // Fetch 'config' instead of 'build_format' (which doesn't exist)
    const { data: appData, error: fetchError } = await supabaseAdmin
      .from('apps')
      .select('config') 
      .eq('id', saasAppId)
      .single();
      
    if (fetchError) {
      console.error('❌ Failed to fetch app context:', fetchError.message);
      return NextResponse.json({ error: 'App not found' }, { status: 404 });
    }

    // Logic: Try to get format from config, otherwise infer from extension
    let buildFormat = appData?.config?.buildFormat;
    
    if (!buildFormat) {
       if (artifactUrl.includes('.zip')) buildFormat = 'source';
       else if (artifactUrl.includes('.aab')) buildFormat = 'aab';
       else buildFormat = 'apk';
    }

    const updatePayload: any = {
      status: 'ready',
      updated_at: new Date().toISOString()
    };

    // Parallel Updates based on format
    if (buildFormat === 'apk' || buildFormat === 'aab') {
       updatePayload.apk_status = 'ready';
       updatePayload.apk_progress = 100;
       updatePayload.apk_message = 'Build completed successfully';
       updatePayload.download_url = artifactUrl; 
    } else if (buildFormat === 'source') {
       updatePayload.android_source_status = 'ready';
       updatePayload.android_source_progress = 100;
       updatePayload.android_source_message = 'Source code generated';
       updatePayload.android_source_url = artifactUrl;
    }

    // 7. Execute Update
    const { error } = await supabaseAdmin
      .from('apps')
      .update(updatePayload)
      .eq('id', saasAppId);

    if (error) {
      console.error('❌ Supabase Update Failed:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`✅ DB Updated for ${saasAppId} (${buildFormat})`);
    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error: any) {
    console.error('❌ Webhook Exception:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
