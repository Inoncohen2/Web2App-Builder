
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { appName, websiteUrl, iconUrl, userId } = body;

    // 1. Validation
    if (!appName || !websiteUrl || !userId) {
      return NextResponse.json({ error: 'Missing required parameters: appName, websiteUrl, and userId are required.' }, { status: 400 });
    }

    // 2. Generate unique packageId (format: com.client.[clean_name])
    // We sanitize the app name to be alphanumeric only for Android package compatibility
    const cleanName = appName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, '') 
      .slice(0, 30);
    
    const packageId = `com.client.${cleanName || 'app'}_${Math.random().toString(36).substring(7)}`;

    // 3. Database Sync (Syncing with Supabase)
    // Using service role to bypass RLS for the automated factory process
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iehehxricvjedgzlhipi.supabase.co';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseServiceKey) {
      console.error('CRITICAL: SUPABASE_SERVICE_ROLE_KEY is missing from environment variables.');
      return NextResponse.json({ error: 'Server configuration error: Database access denied.' }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Insert the new app configuration
    const { data: appData, error: dbError } = await supabaseAdmin
      .from('apps')
      .insert([
        {
          user_id: userId,
          package_id: packageId,
          website_url: websiteUrl,
          name: appName,
          icon_url: iconUrl,
          status: 'building',
          config: {
            appIcon: iconUrl,
            showNavBar: true,
            themeMode: 'system',
            enablePullToRefresh: true,
            showSplashScreen: true
          }
        }
      ])
      .select()
      .single();

    if (dbError) {
      console.error('Supabase Insert Error:', dbError.message);
      return NextResponse.json({ error: 'Failed to synchronize with database', details: dbError.message }, { status: 500 });
    }

    // 4. Trigger GitHub Action (instant-aab.yml)
    const githubToken = process.env.GITHUB_FACTORY_TOKEN;

    if (!githubToken) {
      console.error('CRITICAL: GITHUB_FACTORY_TOKEN is not defined.');
      return NextResponse.json({ error: 'Build factory configuration error' }, { status: 500 });
    }

    const githubResponse = await fetch(
      'https://api.github.com/repos/Inoncohen2/app-factory/actions/workflows/instant-aab.yml/dispatches',
      {
        method: 'POST',
        headers: {
          'Accept': 'application/vnd.github+json',
          'Authorization': `Bearer ${githubToken}`,
          'X-GitHub-Api-Version': '2022-11-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ref: 'main',
          inputs: {
            packageId: packageId,
            appName: appName,
            iconUrl: iconUrl || ''
          },
        })
      }
    );

    if (!githubResponse.ok) {
      const githubError = await githubResponse.json().catch(() => ({}));
      console.error('GitHub API Error:', githubError);
      
      // Attempt to roll back the DB status if GitHub trigger fails
      await supabaseAdmin.from('apps').update({ status: 'failed' }).eq('id', appData.id);
      
      throw new Error(githubError.message || 'GitHub Actions dispatch failed');
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Instant AAB Factory build triggered successfully',
      appId: appData.id,
      packageId: packageId
    });

  } catch (error: any) {
    console.error('Instant Factory Route Error:', error.message);
    return NextResponse.json({ 
      error: 'Build Factory Exception', 
      details: error.message 
    }, { status: 500 });
  }
}
