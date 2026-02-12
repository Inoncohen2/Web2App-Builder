
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('📦 Webhook Payload:', JSON.stringify(body, null, 2));

    const { status, artifacts, message, metadata } = body;

    if (status !== 'finished') {
      return NextResponse.json({ message: 'Ignored: Status not finished' }, { status: 200 });
    }

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

    const artifactUrl = artifacts?.buildArtifact?.url || artifacts?.buildArtifact || artifacts?.buildUrl;

    if (!saasAppId || !artifactUrl) {
      return NextResponse.json({ error: 'Missing ID or Artifact URL' }, { status: 400 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const updatePayload: any = { updated_at: new Date().toISOString() };
    const lowerUrl = artifactUrl.toLowerCase();

    // --- DETECTION LOGIC ---
    if (lowerUrl.includes('.ipa')) {
        // iOS App Build
        updatePayload.ipa_url = artifactUrl;
        updatePayload.ios_status = 'ready';
        updatePayload.ios_progress = 100;

    } else if (lowerUrl.includes('.zip') && (lowerUrl.includes('ios') || lowerUrl.includes('xcode'))) {
        // iOS Source Code (Assume zip name contains 'ios' or 'xcode')
        updatePayload.ios_source_url = artifactUrl;
        updatePayload.ios_source_status = 'ready';
        updatePayload.ios_source_progress = 100;

    } else if (lowerUrl.includes('.zip')) {
        // Android Source Code (Default zip fallback)
        updatePayload.download_url = artifactUrl;
        updatePayload.source_status = 'ready';
        updatePayload.source_progress = 100;

    } else {
        // Android APK/AAB
        updatePayload.apk_url = artifactUrl;
        updatePayload.apk_status = 'ready';
        updatePayload.apk_progress = 100;
        updatePayload.status = 'ready'; // Legacy support
    }

    console.log(`Updating DB for App ID: ${saasAppId} with payload keys:`, Object.keys(updatePayload));

    const { error } = await supabaseAdmin
      .from('apps')
      .update(updatePayload)
      .eq('id', saasAppId);

    if (error) {
      console.error('❌ Supabase Update Failed:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error: any) {
    console.error('❌ Webhook Handler Exception:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
