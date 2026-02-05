import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    // 1. Parse incoming request body
    const body = await req.json();
    console.log('📦 Expo Webhook Payload:', JSON.stringify(body, null, 2));

    const { status, metadata, artifacts } = body;

    // 2. Filter events - We only care if the build is finished
    if (status !== 'finished') {
      console.log(`Build status is '${status}'. Ignoring webhook.`);
      return NextResponse.json({ message: 'Ignored: Status not finished' }, { status: 200 });
    }

    // 3. Extract critical data
    const saasAppId = metadata?.saasAppId;
    
    // Note: Expo often sends 'buildUrl' in artifacts, but we check 'buildArtifact' as requested
    // and fallback to 'buildUrl' just in case.
    const apkUrl = artifacts?.buildArtifact || artifacts?.buildUrl;

    // 4. Validation
    if (!saasAppId) {
      console.error('❌ Error: Missing saasAppId in metadata.');
      return NextResponse.json({ error: 'Missing saasAppId' }, { status: 400 });
    }

    if (!apkUrl) {
      console.error('❌ Error: Missing APK URL in artifacts.');
      return NextResponse.json({ error: 'Missing APK URL' }, { status: 400 });
    }

    // 5. Initialize Supabase Admin Client
    // We use SERVICE_ROLE_KEY to bypass Row Level Security (RLS) for backend updates
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Error: Missing Server Environment Variables (SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY).');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // 6. Update the Database
    console.log(`Updating App ID: ${saasAppId} with URL: ${apkUrl}`);

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