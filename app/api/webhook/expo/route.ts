import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { createHmac, timingSafeEqual } from 'crypto';

function verifyWebhookSignature(payload: string, signature: string | null, secret: string): boolean {
  if (!signature) return false;
  const expectedSignature = createHmac('sha256', secret).update(payload).digest('hex');
  const sigToCompare = signature.startsWith('sha256=') ? signature.slice(7) : signature;
  try {
    return timingSafeEqual(Buffer.from(sigToCompare), Buffer.from(expectedSignature));
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    // 0. Verify Webhook Authenticity
    const webhookSecret = process.env.EXPO_WEBHOOK_SECRET;
    const rawBody = await req.text();

    if (webhookSecret) {
      const signature = req.headers.get('expo-signature') || req.headers.get('x-expo-signature');
      if (!verifyWebhookSignature(rawBody, signature, webhookSecret)) {
        console.error('Webhook signature verification failed');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    // 1. Parse incoming request body
    const body = JSON.parse(rawBody);
    console.log('Expo Webhook Payload:', JSON.stringify(body, null, 2));

    const { status, artifacts, message, metadata } = body;

    // 2. Filter events - We only care if the build is finished
    if (status !== 'finished') {
      console.log(`Build status is '${status}'. Ignoring webhook.`);
      return NextResponse.json({ message: 'Ignored: Status not finished' }, { status: 200 });
    }

    // 3. Extract ID from message or metadata
    let saasAppId: string | null = null;
    
    // Strategy A: Check Message string (Handle both body.message and body.metadata.message)
    const msgToCheck = message || (metadata && metadata.message);
    if (msgToCheck && typeof msgToCheck === 'string' && msgToCheck.includes('SAAS_BUILD_ID:')) {
        const parts = msgToCheck.split('SAAS_BUILD_ID:');
        if (parts.length > 1) {
            saasAppId = parts[1].trim().split(' ')[0]; 
        }
    }

    // Strategy B: Check Metadata object directly (Fallback keys)
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
    const supabaseAdmin = getSupabaseAdmin();

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

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Webhook Handler Exception:', message);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}