
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      appName, websiteUrl, iconUrl, userId,
      navigation, pullToRefresh, splashScreen, splashColor,
      enableZoom, keepAwake, openExternalLinks,
      primaryColor, themeMode, orientation,
      buildFormat, privacyPolicyUrl, termsOfServiceUrl
    } = body;

    if (!appName || !websiteUrl || !userId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN!;
    const GITHUB_REPO = process.env.GITHUB_REPO!;

    if (!SUPABASE_URL || !SUPABASE_KEY || !GITHUB_TOKEN || !GITHUB_REPO) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Generate Package ID
    const cleanName = appName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 30);
    const packageId = `com.client.${cleanName || 'app'}_${Math.random().toString(36).substring(7)}`;

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_KEY);

    const targetFormat = buildFormat || 'apk';

    // 1. Config for DB (CamelCase + buildFormat)
    const dbConfigValues = {
      buildFormat: targetFormat, // Stored here because column doesn't exist
      primaryColor: primaryColor || '#000000',
      themeMode: themeMode || 'system',
      splashColor: splashColor || '#FFFFFF',
      showNavBar: navigation ?? true,
      enablePullToRefresh: pullToRefresh ?? true,
      showSplashScreen: splashScreen ?? true,
      orientation: orientation || 'auto',
      enableZoom: enableZoom ?? false,
      keepAwake: keepAwake ?? false,
      openExternalLinks: openExternalLinks ?? true,
      appIcon: iconUrl,
      privacyPolicyUrl: privacyPolicyUrl || '',
      termsOfServiceUrl: termsOfServiceUrl || ''
    };

    // 2. Config for GitHub (SnakeCase)
    const githubConfigValues = {
      primary_color: primaryColor || '#000000',
      theme_mode: themeMode || 'system',
      orientation: orientation || 'auto',
      navigation: navigation ?? true,
      pull_to_refresh: pullToRefresh ?? true,
      splash_screen: splashScreen ?? true,
      enable_zoom: enableZoom ?? false,
      keep_awake: keepAwake ?? false,
      open_external_links: openExternalLinks ?? true,
      privacy_policy_url: privacyPolicyUrl || '',
      terms_url: termsOfServiceUrl || ''
    };

    // Insert App
    const { data: appData, error: dbError } = await supabaseAdmin
      .from('apps')
      .insert([
        {
          user_id: userId,
          package_name: packageId, 
          website_url: websiteUrl,
          name: appName,
          icon_url: iconUrl,
          status: 'building', 
          
          // Parallel Statuses
          apk_status: (targetFormat === 'apk' || targetFormat === 'aab') ? 'building' : 'idle',
          android_source_status: (targetFormat === 'source') ? 'building' : 'idle',
          
          primary_color: dbConfigValues.primaryColor,
          config: dbConfigValues
        }
      ])
      .select()
      .single();

    if (dbError) {
      return NextResponse.json({ error: 'Database insert failed', details: dbError.message }, { status: 500 });
    }

    // Trigger GitHub Action
    const githubPayload = {
      app_id: appData.id,
      name: appName,
      package_name: packageId,
      website_url: websiteUrl,
      icon_url: iconUrl,
      build_format: targetFormat, 
      notification_email: '',
      config: githubConfigValues
    };

    const eventType = targetFormat === 'source' ? 'package-source' : 'build-app';

    const githubResponse = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/dispatches`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        event_type: eventType,
        client_payload: githubPayload
      })
    });

    if (!githubResponse.ok) {
       await supabaseAdmin.from('apps').update({ status: 'failed', apk_status: 'failed' }).eq('id', appData.id);
       throw new Error(`GitHub Dispatch failed: ${githubResponse.statusText}`);
    }

    // Retrieve Run ID (Best Effort)
    await new Promise(resolve => setTimeout(resolve, 3000));
    let runId = null;
    try {
      const runs = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/actions/runs?per_page=1&event=workflow_dispatch`, {
         headers: { 'Authorization': `Bearer ${GITHUB_TOKEN}` }
      });
      const runsData = await runs.json();
      if (runsData.workflow_runs?.[0]) {
         runId = runsData.workflow_runs[0].id;
         await supabaseAdmin.from('apps').update({ github_run_id: runId }).eq('id', appData.id);
      }
    } catch (e) { console.warn('Failed to fetch run ID', e); }

    return NextResponse.json({ 
      success: true, 
      appId: appData.id,
      packageId,
      runId
    });

  } catch (error: any) {
    console.error('API Error:', error.message);
    return NextResponse.json({ error: 'Build Exception', details: error.message }, { status: 500 });
  }
}
