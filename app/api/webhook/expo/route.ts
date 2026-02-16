
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('📦 Expo Webhook Payload:', JSON.stringify(body, null, 2));

    const { status, artifacts, message, metadata } = body;

    // Filter events - We only care if the build is finished
    if (status !== 'finished') {
      return NextResponse.json({ message: 'Ignored: Status not finished' }, { status: 200 });
    }

    // Extract BUILD_ID
    let buildId: string | null = null;
    
    // Strategy: Check Metadata first (build_id)
    if (metadata) {
        buildId = metadata.build_id || metadata.buildId || metadata.saas_build_id;
    }

    // Strategy: Check message string if metadata missing
    if (!buildId && message && typeof message === 'string' && message.includes('BUILD_ID:')) {
        const parts = message.split('BUILD_ID:');
        if (parts.length > 1) {
            buildId = parts[1].trim().split(' ')[0]; 
        }
    }

    // Extract URL (APK or Source)
    const downloadUrl = artifacts?.buildArtifact?.url || artifacts?.buildArtifact || artifacts?.buildUrl;

    if (!buildId) {
      console.error('❌ Error: Missing BUILD_ID in metadata.');
      return NextResponse.json({ error: 'Missing BUILD_ID' }, { status: 400 });
    }

    if (!downloadUrl) {
      console.error('❌ Error: Missing Artifact URL.');
      return NextResponse.json({ error: 'Missing Artifact URL' }, { status: 400 });
    }

    // Initialize Supabase Admin
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Update the specific build record
    console.log(`Updating Build ID: ${buildId} -> URL: ${downloadUrl}`);

    const { error } = await supabaseAdmin
      .from('app_builds')
      .update({
        download_url: downloadUrl,
        status: 'ready',
        progress: 100,
        build_message: 'Build completed successfully.'
      })
      .eq('id', buildId);

    if (error) {
      console.error('❌ Supabase Update Failed:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Also update parent app status if it's the latest build (Optional but good for fallback)
    // We can skip this if we fully rely on app_builds now

    console.log('✅ Build record updated successfully.');
    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error: any) {
    console.error('❌ Webhook Handler Exception:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
