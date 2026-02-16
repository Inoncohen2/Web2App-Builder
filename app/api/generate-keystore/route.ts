
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const { appId, packageName, appName } = await req.json();

    if (!appId || !packageName) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN!;
    const GITHUB_REPO = process.env.GITHUB_REPO!;

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_KEY);

    // Trigger GitHub Workflow
    const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/dispatches`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        event_type: 'generate-keystore',
        client_payload: {
          app_id: appId,
          package_name: packageName,
          name: appName || 'App'
        }
      })
    });

    if (!response.ok) {
      throw new Error(`GitHub API Error: ${await response.text()}`);
    }

    return NextResponse.json({ success: true, message: 'Keystore generation started' });

  } catch (error: any) {
    console.error('Generate Keystore Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
