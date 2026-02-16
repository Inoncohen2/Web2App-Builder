
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const appId = formData.get('appId') as string;
    const type = formData.get('type') as 'android_keystore' | 'ios_cert' | 'ios_profile';
    
    // Additional fields
    const alias = formData.get('alias') as string;
    const password = formData.get('password') as string; // Keystore or Cert password
    const keyPassword = formData.get('keyPassword') as string;
    const teamId = formData.get('teamId') as string;

    if (!file || !appId || !type) {
      return NextResponse.json({ error: 'Missing file or required fields' }, { status: 400 });
    }

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_KEY);

    // 1. Upload File to Private Bucket
    const fileExt = file.name.split('.').pop();
    const filePath = `${appId}/${type}_${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabaseAdmin.storage
      .from('secure-signing')
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

    // 2. Update Database Record
    const updateData: any = {};
    if (type === 'android_keystore') {
        updateData.keystore_url = filePath;
        if (alias) updateData.keystore_alias = alias;
        if (password) updateData.keystore_password = password; // Should be encrypted in prod
        if (keyPassword) updateData.key_password = keyPassword;
    } else if (type === 'ios_cert') {
        updateData.ios_certificate_url = filePath;
        if (password) updateData.ios_certificate_password = password;
    } else if (type === 'ios_profile') {
        updateData.ios_provisioning_url = filePath;
        if (teamId) updateData.ios_team_id = teamId;
    }

    const { error: dbError } = await supabaseAdmin
      .from('app_signing')
      .upsert({ 
        app_id: appId,
        ...updateData,
        updated_at: new Date().toISOString()
      }, { onConflict: 'app_id' });

    if (dbError) throw new Error(`DB Update failed: ${dbError.message}`);

    return NextResponse.json({ success: true, filePath });

  } catch (error: any) {
    console.error('Upload Keystore Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
