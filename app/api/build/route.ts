import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      appName, websiteUrl, iconUrl, userId,
      // Optional config overrides
      navigation, pullToRefresh, splashScreen, splashColor,
      enableZoom, keepAwake, openExternalLinks,
      primaryColor, themeMode, orientation,
      buildFormat, privacyPolicyUrl
    } = body;

    // 1. Validate Request Input
    if (!appName || !websiteUrl || !userId) {
      return NextResponse.json({ error: 'Missing required parameters: appName, websiteUrl, and userId are required.' }, { status: 400 });
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
      const errorMsg = `Missing environment variable: ${missingVars.join(', ')}`;
      console.error(`CRITICAL: ${errorMsg}`);
      return NextResponse.json({ error: errorMsg }, { status: 500 });
    }

    // Extract validated env vars
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN!;
    const GITHUB_REPO = process.env.GITHUB_REPO!; // Expected format: USERNAME/REPO
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    // 3. Generate unique packageId (format: com.client.[clean_name]_[random])
    const cleanName = appName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, '') 
      .slice(0, 30);
    
    const packageId = `com.client.${cleanName || 'app'}_${Math.random().toString(36).substring(7)}`;

    // 4. Database Sync (Supabase Admin)
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_KEY);

    // Prepare config values with defaults
    const configValues = {
      primaryColor: primaryColor || '#000000',
      navigation: navigation ?? true,
      pullToRefresh: pullToRefresh ?? true,
      orientation: orientation || 'auto',
      enableZoom: enableZoom ?? false,
      keepAwake: keepAwake ?? false,
      openExternalLinks: openExternalLinks ?? true,
      themeMode: themeMode || 'system',
      splashScreen: splashScreen ?? true,
      splashColor: splashColor || '#FFFFFF',
      appIcon: iconUrl,
      privacyPolicyUrl: privacyPolicyUrl || ''
    };

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
          build_format: buildFormat || 'apk',
          
          // Mirror top-level columns
          primary_color: configValues.primaryColor,
          navigation: configValues.navigation,
          pull_to_refresh: configValues.pullToRefresh,
          orientation: configValues.orientation,
          enable_zoom: configValues.enableZoom,
          keep_awake: configValues.keepAwake,
          open_external_links: configValues.openExternalLinks,
          
          config: {
            appIcon: iconUrl,
            showNavBar: configValues.navigation,
            themeMode: configValues.themeMode,
            enablePullToRefresh: configValues.pullToRefresh,
            showSplashScreen: configValues.splashScreen,
            splashColor: configValues.splashColor,
            primaryColor: configValues.primaryColor,
            orientation: configValues.orientation,
            enableZoom: configValues.enableZoom,
            keepAwake: configValues.keepAwake,
            openExternalLinks: configValues.openExternalLinks,
            privacyPolicyUrl: configValues.privacyPolicyUrl,
          }
        }
      ])
      .select()
      .single();

    if (dbError) {
      console.error('Supabase Insert Error:', dbError.message);
      return NextResponse.json({ error: 'Failed to synchronize with database', details: dbError.message }, { status: 500 });
    }

    const buildPayload = {
        app_id: appData.id,
        name: appName,
        package_name: packageId,
        website_url: websiteUrl,
        icon_url: iconUrl || '',
        build_format: buildFormat || 'apk',
        notification_email: '', // Not provided in API route
        
        config: {
          // Navigation & Behavior
          navigation: configValues.navigation,
          pull_to_refresh: configValues.pullToRefresh,
          enable_zoom: configValues.enableZoom,
          keep_awake: configValues.keepAwake,
          open_external_links: configValues.openExternalLinks,
          
          // Appearance
          primary_color: configValues.primaryColor,
          theme_mode: configValues.themeMode,
          orientation: configValues.orientation,
          
          // Splash
          splash_screen: configValues.splashScreen,
          splash_color: configValues.splashColor,

          // Legal
          privacy_policy_url: configValues.privacyPolicyUrl
        }
    };
    
    console.log('📦 API Factory Payload:', JSON.stringify(buildPayload, null, 2));

    // 5. Trigger GitHub Action (instant-aab.yml)
    const githubUrl = `https://api.github.com/repos/${GITHUB_REPO}/dispatches`;
    
    const githubResponse = await fetch(githubUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event_type: 'build-app',
        client_payload: buildPayload
      })
    });

    if (!githubResponse.ok) {
      const githubError = await githubResponse.json().catch(() => ({}));
      console.error('GitHub API Error:', githubError);
      
      // Attempt rollback status
      await supabaseAdmin.from('apps').update({ status: 'failed' }).eq('id', appData.id);
      
      throw new Error(`GitHub Dispatch failed: ${githubResponse.statusText}`);
    }

    // 6. Fetch the triggered Run ID
    // We wait 3 seconds to ensure GitHub has queued the run, then fetch the latest run.
    await new Promise(resolve => setTimeout(resolve, 3000));

    let runId = null;
    try {
      const runsResponse = await fetch(
        `https://api.github.com/repos/${GITHUB_REPO}/actions/runs?per_page=1&event=workflow_dispatch`, 
        {
          headers: {
            'Authorization': `Bearer ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github+json',
          }
        }
      );
      
      if (runsResponse.ok) {
        const runsData = await runsResponse.json();
        if (runsData.workflow_runs && runsData.workflow_runs.length > 0) {
           runId = runsData.workflow_runs[0].id;
        }
      }
    } catch (e) {
      console.warn("Failed to fetch Run ID:", e);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'App build triggered successfully',
      appId: appData.id,
      packageId: packageId,
      runId: runId // Return the GitHub Run ID
    });

  } catch (error: any) {
    console.error('API Route Error:', error.message);
    return NextResponse.json({ 
      error: 'Build Exception', 
      details: error.message 
    }, { status: 500 });
  }
}