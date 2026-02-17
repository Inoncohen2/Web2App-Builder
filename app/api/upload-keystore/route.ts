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
    const password = formData.get('password') as string;
    const keyPassword = formData.get('keyPassword') as string;
    const teamId = formData.get('teamId') as string;

    if (!file || !appId || !type) {
      return NextResponse.json({ error: 'Missing file or required fields' }, { status: 400 });
    }

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_KEY);

    // 1. Convert file to base64
    const fileBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(fileBuffer).toString('base64');

    // 2. Prepare update data
    const updateData: any = {};
    
    if (type === 'android_keystore') {
        updateData.keystore_base64 = base64;  // ✅ FIXED
        if (alias) updateData.keystore_alias = alias;
        // TODO: Encrypt passwords in production
        if (password) updateData.keystore_password_encrypted = Buffer.from(password).toString('base64');
        if (keyPassword) updateData.key_password_encrypted = Buffer.from(keyPassword).toString('base64');
    } else if (type === 'ios_cert') {
        updateData.ios_certificate_base64 = base64;  // ✅ FIXED
        if (password) updateData.ios_cert_password_encrypted = Buffer.from(password).toString('base64');
    } else if (type === 'ios_profile') {
        updateData.ios_provisioning_base64 = base64;  // ✅ FIXED
        if (teamId) updateData.ios_team_id = teamId;
    }

    // 3. Update database
    const { error: dbError } = await supabaseAdmin
      .from('app_signing')
      .upsert({ 
        app_id: appId,
        ...updateData,
        updated_at: new Date().toISOString()
      }, { onConflict: 'app_id' });

    if (dbError) throw new Error(`DB Update failed: ${dbError.message}`);

    return NextResponse.json({ success: true, message: 'File uploaded successfully' });

  } catch (error: any) {
    console.error('Upload Keystore Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
