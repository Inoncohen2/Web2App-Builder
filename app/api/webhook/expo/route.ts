import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    // 1. Parse incoming request body
    const body = await req.json();
    console.log('📦 Expo Webhook Payload:', JSON.stringify(body, null, 2));

    const { status, artifacts, message, metadata } = body;

    // 2. Filter events - We only care if the build is finished
    if (status !== 'finished') {
      console.log(`Build status is '${status}'. Ignoring webhook.`);
      return NextResponse.json({ message: 'Ignored: Status not finished' }, { status: 200 });
    }

    // 3. Extract ID from message or metadata
    let saasAppId: string | null = null;
    
    // Strategy A: Check Message string
    if (message && typeof message === 'string' && message.includes('SAAS_BUILD_ID:')) {
        const parts = message.split('SAAS_BUILD_ID:');
        if (parts.length > 1) {
            saasAppId = parts[1].trim().split(' ')[0]; 
        }
    }

    // Strategy B: Check Metadata object (Try multiple common keys)
    if (!saasAppId && metadata) {
        saasAppId = metadata.saasAppId || metadata.supabase_id || metadata.saas_build_id || metadata.SAAS_BUILD_ID;
    }

    // 4. Extract APK URL
    const apkUrl = artifacts?.buildArtifact?.url || artifacts?.buildArtifact || artifacts?.buildUrl;

    console.log(`Processing build for App ID: ${saasAppId}`);

    // 5. Validation
    if (!saasAppId) {
      console.error('❌ Error: Could not extract SAAS_BUILD_ID from message or metadata.');
      console.error('Metadata received:', JSON.stringify(metadata));
      console.error('Message received:', message);
      return NextResponse.json({ error: 'Missing SAAS_BUILD_ID' }, { status: 400 });
    }

    if (!apkUrl) {
      console.error('❌ Error: Missing APK URL in artifacts.');
      return NextResponse.json({ error: 'Missing APK URL' }, { status: 400 });
    }

    // 6. Initialize Supabase Admin Client
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Error: Missing Server Environment Variables.');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // 7. Update the Database
    console.log(`Updating DB for App ID: ${saasAppId} -> URL: ${apkUrl}`);

    const { error } = await supabaseAdmin
      .from('apps')
      .update({
        apk_url: apkUrl,
        status: 'ready',
        updated_at: new Date().toISOString()
      })
      .eq('id', saasAppId);

    if (error) {
      console.error('❌ Supabase Update Failed:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('✅ Database updated successfully.');
    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error: any) {
    console.error('❌ Webhook Handler Exception:', error.message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}