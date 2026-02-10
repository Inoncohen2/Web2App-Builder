
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin, getAuthenticatedUser } from '@/lib/supabase-admin';

export async function POST(req: NextRequest) {
  try {
    // 0. Authentication Check
    const user = await getAuthenticatedUser(req);

    const body = await req.json();
    const { appName, websiteUrl, iconUrl, userId } = body;

    // 1. Validate Request Input
    if (!appName || !websiteUrl || !userId) {
      return NextResponse.json({ error: 'Missing required parameters: appName, websiteUrl, and userId are required.' }, { status: 400 });
    }

    // Verify the userId matches the authenticated user (if authenticated)
    if (user && user.id !== userId) {
      return NextResponse.json({ error: 'Unauthorized: userId mismatch' }, { status: 403 });
    }

    // 2. Validate Environment Variables
    const requiredEnvVars = [
      'GITHUB_TOKEN',
      'GITHUB_REPO',
      'NEXT_PUBLIC_SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY'
    ];

    const missingVars = requiredEnvVars.filter(key => !process.env[key]);

    if (missingVars.length > 0) {
      console.error(`CRITICAL: Missing environment variables: ${missingVars.join(', ')}`);
      return NextResponse.json({ error: 'Server configuration error. Please contact support.' }, { status: 500 });
    }

    // Extract validated env vars
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN!;
    const GITHUB_REPO = process.env.GITHUB_REPO!; // Expected format: USERNAME/REPO

    // 3. Generate unique packageId (format: com.client.[clean_name]_[random])
    const cleanName = appName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 30);

    const packageId = `com.client.${cleanName || 'app'}_${Math.random().toString(36).substring(7)}`;

    // 4. Database Sync (Supabase Admin)
    const supabaseAdmin = getSupabaseAdmin();

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
          primary_color: '#000000',
          navigation: true,
          pull_to_refresh: true,
          orientation: 'auto',
          enable_zoom: false,
          keep_awake: false,
          open_external_links: true,

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
      return NextResponse.json({ error: 'Failed to synchronize with database' }, { status: 500 });
    }

    // 5. Trigger GitHub Action (instant-aab.yml)
    const githubUrl = `https://api.github.com/repos/${GITHUB_REPO}/actions/workflows/instant-aab.yml/dispatches`;

    const githubResponse = await fetch(githubUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ref: 'main',
        inputs: {
            appUrl: websiteUrl,
            packageId: packageId,
            appName: appName,
            iconUrl: iconUrl || '',
            saasAppId: appData.id,
            primaryColor: '#000000',
            darkMode: 'auto',
            navigation: 'true',
            pullToRefresh: 'true',
            orientation: 'auto',
            enableZoom: 'false',
            keepAwake: 'false',
            openExternalLinks: 'true'
        },
      })
    });

    if (!githubResponse.ok) {
      const githubError = await githubResponse.json().catch(() => ({}));
      console.error('GitHub API Error:', githubError);

      // Attempt rollback status
      await supabaseAdmin.from('apps').update({ status: 'failed' }).eq('id', appData.id);

      throw new Error(`GitHub Dispatch failed: ${githubResponse.statusText}`);
    }

    // 6. Use appData.id as the runId instead of polling GitHub for run ID
    // This avoids the race condition of fetching the wrong run when concurrent builds happen
    return NextResponse.json({
      success: true,
      message: 'Instant AAB Factory build triggered successfully',
      appId: appData.id,
      packageId: packageId,
      runId: appData.id
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Instant Factory Route Error:', message);
    return NextResponse.json({
      error: 'Build failed. Please try again.',
    }, { status: 500 });
  }
}
