
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    // 1. Parse Payload
    const body = await req.json();
    console.log('📦 Webhook Payload:', JSON.stringify(body, null, 2));

    const { status, artifacts, message, metadata } = body;

    // 2. Identify Build ID
    // The build script should pass `build_id` in metadata
    let buildId = metadata?.build_id || metadata?.saas_build_id;

    // Fallback: Check message string for "BUILD_ID:uuid" if metadata fails
    if (!buildId && message && typeof message === 'string') {
        const match = message.match(/BUILD_ID:([a-f0-9\-]+)/);
        if (match) buildId = match[1];
    }

    // 3. Initialize Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // 4. Handle Status Updates
    if (status === 'finished') {
        const downloadUrl = artifacts?.buildArtifact?.url || artifacts?.buildArtifact || artifacts?.buildUrl;
        
        if (!buildId) {
            console.error('❌ Missing Build ID in webhook');
            return NextResponse.json({ error: 'Missing Build ID' }, { status: 400 });
        }

        console.log(`✅ Build Finished. Updating ID: ${buildId}`);

        await supabaseAdmin
            .from('app_builds')
            .update({
                status: 'ready',
                download_url: downloadUrl,
                progress: 100,
                updated_at: new Date().toISOString()
            })
            .eq('id', buildId);
            
    } else if (status === 'errored' || status === 'failed') {
        if (buildId) {
             console.log(`❌ Build Failed. Updating ID: ${buildId}`);
             await supabaseAdmin
                .from('app_builds')
                .update({
                    status: 'failed',
                    progress: 0,
                    updated_at: new Date().toISOString()
                })
                .eq('id', buildId);
        }
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error: any) {
    console.error('❌ Webhook Exception:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
