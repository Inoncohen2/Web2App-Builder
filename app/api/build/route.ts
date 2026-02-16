
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      appName, websiteUrl, iconUrl, userId, appId,
      buildFormat, // 'apk', 'aab', 'ipa', 'source', 'ios_source'
      // Config overrides
      navigation, pullToRefresh, splashScreen, splashColor,
      enableZoom, keepAwake, openExternalLinks,
      primaryColor, themeMode, orientation,
      privacyPolicyUrl, termsOfServiceUrl
    } = body;

    if (!appName || !websiteUrl || !userId || !appId) {
      return NextResponse.json({ error: 'Missing required parameters.' }, { status: 400 });
    }

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN!;
    const GITHUB_REPO = process.env.GITHUB_REPO!;

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_KEY);

    // 1. Determine Platform & Event Type
    const format = buildFormat || 'apk';
    let platform = 'android';
    let eventType = 'build-app';

    if (format === 'ipa' || format === 'ios_source') {
        platform = 'ios';
        if (format === 'ios_source') eventType = 'package-ios-source';
        // Note: 'ipa' might use 'build-app' or specific workflow depending on setup. 
        // Assuming 'package-ios-source' generates source, 'build-app' handles binaries if unified. 
        // Based on prompt instruction: "package-ios-source for iOS source"
    } else if (format === 'source') {
        eventType = 'package-source';
    }

    // 2. Check Concurrency
    const { data: activeBuilds } = await supabaseAdmin
        .from('app_builds')
        .select('id')
        .eq('app_id', appId)
        .eq('platform', platform)
        .in('status', ['queued', 'building']);

    if (activeBuilds && activeBuilds.length > 0) {
        return NextResponse.json({ 
            error: `A ${platform} build is already in progress.` 
        }, { status: 409 });
    }

    // 3. Create Build Record FIRST
    const { data: newBuild, error: buildError } = await supabaseAdmin
        .from('app_builds')
        .insert([{
            app_id: appId,
            platform: platform,
            build_format: format,
            status: 'queued',
            progress: 0,
            // build_message is implicit null initially
        }])
        .select()
        .single();

    if (buildError || !newBuild) {
        throw new Error(`Failed to create build record: ${buildError?.message}`);
    }

    console.log(`🚀 Starting ${format} build (ID: ${newBuild.id}) for App ${appId}`);

    // 4. Update App Config (Source of Truth)
    await supabaseAdmin
      .from('apps')
      .update({
          name: appName,
          website_url: websiteUrl,
          icon_url: iconUrl,
          primary_color: primaryColor,
          navigation: navigation,
          pull_to_refresh: pullToRefresh,
          orientation: orientation,
          enable_zoom: enableZoom,
          keep_awake: keepAwake,
          open_external_links: openExternalLinks,
          config: {
            themeMode,
            userAgent: 'Web2App/1.0',
            showSplashScreen: splashScreen,
            splashColor,
            appIcon: iconUrl,
            showNavBar: navigation,
            enablePullToRefresh: pullToRefresh,
            orientation,
            enableZoom,
            keepAwake,
            openExternalLinks,
            primaryColor,
            privacyPolicyUrl,
            termsOfServiceUrl
          }
      })
      .eq('id', appId);

    // 5. Trigger GitHub Action
    const { data: appRecord } = await supabaseAdmin.from('apps').select('package_name').eq('id', appId).single();
    const packageName = appRecord?.package_name || `com.app.${appName.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

    const payload = {
        event_type: eventType,
        client_payload: {
            build_id: newBuild.id, // CRITICAL: Link back to DB
            app_id: appId,
            name: appName,
            package_name: packageName,
            website_url: websiteUrl,
            icon_url: iconUrl || '',
            build_format: format,
            notification_email: body.notificationEmail, // Optional
            config: {
                // Strict snake_case mapping for GitHub Scripts
                navigation: navigation ?? true,
                pull_to_refresh: pullToRefresh ?? true,
                primary_color: primaryColor || '#000000',
                theme_mode: themeMode || 'system',
                orientation: orientation || 'auto',
                enable_zoom: enableZoom ?? false,
                keep_awake: keepAwake ?? false,
                open_external_links: openExternalLinks ?? true,
                splash_screen: splashScreen ?? true,
                splash_color: splashColor || '#FFFFFF',
                privacy_policy_url: privacyPolicyUrl || '',
                terms_of_service_url: termsOfServiceUrl || ''
            }
        }
    };

    const githubResponse = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/dispatches`, {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!githubResponse.ok) {
      const txt = await githubResponse.text();
      console.error('GitHub Dispatch Error:', txt);
      await supabaseAdmin.from('app_builds').update({ status: 'failed' }).eq('id', newBuild.id);
      throw new Error(`GitHub refused dispatch: ${githubResponse.status}`);
    }

    return NextResponse.json({ 
      success: true, 
      buildId: newBuild.id 
    });

  } catch (error: any) {
    console.error('Build API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
