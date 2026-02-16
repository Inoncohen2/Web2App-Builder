
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('📦 Webhook Payload:', JSON.stringify(body, null, 2));

    const { status, artifacts, message, metadata } = body;

    // Filter events
    if (status !== 'finished' && status !== 'errored') {
      return NextResponse.json({ message: `Ignored status: ${status}` }, { status: 200 });
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

    // Extract Identifiers
    // New Logic: Check for 'build_id' in metadata (passed from build action)
    let buildId = metadata?.build_id || metadata?.buildId;
    let appId = metadata?.app_id || metadata?.saasAppId || metadata?.supabase_id;

    // Artifact URL
    const downloadUrl = artifacts?.buildArtifact?.url || artifacts?.buildArtifact || artifacts?.buildUrl;

    // CASE 1: New Architecture (app_builds table)
    if (buildId) {
       console.log(`Processing update for Build ID: ${buildId}`);
       
       const updateData: any = {
         updated_at: new Date().toISOString()
       };

       if (status === 'finished') {
         updateData.status = 'ready';
         updateData.progress = 100;
         updateData.download_url = downloadUrl;
         updateData.build_message = 'Build completed successfully.';
       } else if (status === 'errored') {
         updateData.status = 'failed';
         updateData.build_message = message || 'Build failed on server.';
       }

       const { error } = await supabaseAdmin
         .from('app_builds')
         .update(updateData)
         .eq('id', buildId);

       if (error) {
         console.error('❌ Failed to update app_builds:', error);
         return NextResponse.json({ error: error.message }, { status: 500 });
       }
       
       // Optional: Sync back to main app table for backward compatibility/dash overview if needed
       // (Updating the latest download_url on the parent app)
       if (status === 'finished' && downloadUrl && appId) {
          await supabaseAdmin.from('apps').update({ download_url: downloadUrl }).eq('id', appId);
       }

       return NextResponse.json({ success: true, target: 'app_builds' }, { status: 200 });
    }

    // CASE 2: Legacy Architecture (apps table)
    // Fallback if build_id is missing but we have app_id (old builds in flight)
    if (appId) {
        console.log(`Processing Legacy update for App ID: ${appId}`);
        const { error } = await supabaseAdmin
          .from('apps')
          .update({
            apk_url: downloadUrl, // Legacy column
            download_url: downloadUrl, // Unified column
            status: status === 'finished' ? 'ready' : 'failed',
            updated_at: new Date().toISOString()
          })
          .eq('id', appId);

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json({ success: true, target: 'apps' }, { status: 200 });
    }

    return NextResponse.json({ error: 'Missing Identifiers' }, { status: 400 });

  } catch (error: any) {
    console.error('❌ Webhook Handler Exception:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
