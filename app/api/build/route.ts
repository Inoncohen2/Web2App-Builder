
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
      buildFormat, // 'apk', 'aab', 'ipa', 'source'
      privacyPolicyUrl, termsOfServiceUrl,
      appId // The existing app ID
    } = body;

    // 1. Validate Request Input
    if (!appName || !websiteUrl || !userId || !appId) {
      return NextResponse.json({ error: 'Missing required parameters.' }, { status: 400 });
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

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN!;
    const GITHUB_REPO = process.env.GITHUB_REPO!; 
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_KEY);

    // 3. Determine Platform & Format
    const format = buildFormat || 'apk';
    let platform = 'android';
    if (format === 'ipa' || format === 'ios_source') {
        platform = 'ios';
    }

    // 4. Check Concurrency: Enforce One Build Per Platform
    // "APK and AAB currently not parallel, either this or that"
    const { data: activeBuilds } = await supabaseAdmin
        .from('app_builds')
        .select('id, status')
        .eq('app_id', appId)
        .eq('platform', platform)
        .in('status', ['queued', 'building']);

    if (activeBuilds && activeBuilds.length > 0) {
        return NextResponse.json({ 
            error: `A ${platform} build is already in progress. Please wait for it to finish.` 
        }, { status: 409 });
    }

    // 5. Create Build Record
    const { data: newBuild, error: buildError } = await supabaseAdmin
        .from('app_builds')
        .insert([{
            app_id: appId,
            platform: platform,
            build_format: format,
            status: 'queued',
            progress: 0
        }])
        .select()
        .single();

    if (buildError || !newBuild) {
        throw new Error(`Failed to create build record: ${buildError?.message}`);
    }

    console.log(`🚀 Starting ${format} build (ID: ${newBuild.id}) for App ${appId}`);

    // 6. Sync latest config to `apps` table (Source of Truth for Settings)
    // We update the main app record so the "Settings" panel reflects the latest build attempt settings
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
        privacyPolicyUrl: privacyPolicyUrl || '',
        termsOfServiceUrl: termsOfServiceUrl || ''
    };

    await supabaseAdmin
      .from('apps')
      .update({
          name: appName,
          website_url: websiteUrl,
          icon_url: iconUrl,
          // Update columns
          primary_color: configValues.primaryColor,
          navigation: configValues.navigation,
          pull_to_refresh: configValues.pullToRefresh,
          orientation: configValues.orientation,
          enable_zoom: configValues.enableZoom,
          keep_awake: configValues.keepAwake,
          open_external_links: configValues.openExternalLinks,
          // JSON Config
          config: {
            ...configValues
          }
      })
      .eq('id', appId);

    // 7. Prepare GitHub Payload
    // Package ID generation (re-generate or fetch?) - Ideally passed in body, or fetch from DB. 
    // Assuming passed in or generating defaults for now.
    // In a real scenario, we should fetch the `package_name` from the `apps` table to ensure consistency.
    const { data: appRecord } = await supabaseAdmin.from('apps').select('package_name').eq('id', appId).single();
    const packageName = appRecord?.package_name || `com.app.${appName.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

    const buildPayload = {
        build_id: newBuild.id, // CRITICAL: Pass the specific build ID
        app_id: appId,
        name: appName,
        package_name: packageName,
        website_url: websiteUrl,
        icon_url: iconUrl || '',
        build_format: format,
        
        config: {
          navigation: configValues.navigation,
          pull_to_refresh: configValues.pullToRefresh,
          enable_zoom: configValues.enableZoom,
          keep_awake: configValues.keepAwake,
          open_external_links: configValues.openExternalLinks,
          primary_color: configValues.primaryColor,
          theme_mode: configValues.themeMode,
          orientation: configValues.orientation,
          splash_screen: configValues.splashScreen,
          splash_color: configValues.splashColor,
          privacy_policy_url: configValues.privacyPolicyUrl,
          terms_of_service_url: configValues.termsOfServiceUrl
        }
    };
    
    // 8. Trigger GitHub Action
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
      const githubError = await githubResponse.text();
      console.error('GitHub API Error:', githubError);
      
      // Rollback status
      await supabaseAdmin.from('app_builds').update({ status: 'failed' }).eq('id', newBuild.id);
      throw new Error(`GitHub Dispatch failed: ${githubResponse.statusText}`);
    }

    // 9. Fetch Run ID (Best Effort)
    // Wait briefly for GitHub to queue
    await new Promise(resolve => setTimeout(resolve, 2000));
    
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
           // Update build record with Run ID
           await supabaseAdmin
             .from('app_builds')
             .update({ github_run_id: runId, status: 'building' })
             .eq('id', newBuild.id);
        }
      }
    } catch (e) {
      console.warn("Failed to fetch Run ID:", e);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Build triggered',
      buildId: newBuild.id,
      runId: runId
    });

  } catch (error: any) {
    console.error('API Route Error:', error.message);
    return NextResponse.json({ 
      error: 'Build Exception', 
      details: error.message 
    }, { status: 500 });
  }
}
