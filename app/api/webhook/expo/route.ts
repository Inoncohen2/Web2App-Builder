import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, 
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // הדפסה 1: בוא נראה את כל מה שקיבלנו
    console.log('🔍 Full Webhook Body:', JSON.stringify(body, null, 2));

    const { status, artifacts, metadata, message } = body;
    
    // הדפסה 2: בוא נראה ספציפית את ההודעה
    console.log(`📩 Received Message: "${message}"`);

    // ניסיון חילוץ
    let appId = null;
    if (message && message.includes('SAAS_BUILD_ID:')) {
      appId = message.split('SAAS_BUILD_ID:')[1].trim();
      console.log(`✅ Extracted App ID: ${appId}`);
    } else {
      console.error('❌ Error: Could not extract SAAS_BUILD_ID. Message was:', message);
      return NextResponse.json({ error: 'No App ID found in message' }, { status: 400 });
    }

    if (status === 'finished' && artifacts?.buildArtifact && appId) {
      console.log(`🚀 Updating Supabase for App ${appId}...`);
      
      const { error } = await supabase
        .from('apps')
        .update({ 
          apk_url: artifacts.buildArtifact.url,
          build_status: 'ready' 
        })
        .eq('id', appId);

      if (error) {
        console.error('Supabase Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      console.log('🎉 Success! Database updated.');
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('💥 Crash:', error);
    return NextResponse.json({ error: 'Server Error' }, { status: 500 });
  }
}
