
'use server'

import { createClient } from '@supabase/supabase-js'
import { Buffer } from 'buffer'
import { AppConfig, BuildType } from '../../types'

interface BuildConfig {
  primaryColor: string
  themeMode: 'light' | 'dark' | 'system'
  showNavBar: boolean
  enablePullToRefresh: boolean
  showSplashScreen: boolean
  enableZoom: boolean
  keepAwake: boolean
  openExternalLinks: boolean
  orientation: 'auto' | 'portrait' | 'landscape'
  splashColor?: string
  userAgent?: string
  appIcon?: string | null
  privacyPolicyUrl?: string
  termsOfServiceUrl?: string
}

export async function triggerAppBuild(
  appName: string,
  packageName: string,
  appId: string,
  websiteUrl: string,
  appIcon: string,
  config: BuildConfig,
  buildFormat: 'apk' | 'aab' | 'source' | 'ios_source',
  notificationEmail?: string
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    let iconUrl = null
    
    // Icon Upload Logic
    if (appIcon) {
      try {
        if (appIcon.startsWith('data:image')) {
          const base64Data = appIcon.split(',')[1]
          const buffer = Buffer.from(base64Data, 'base64')
          const fileName = `${appId}/icon.png`
          const { error: uploadError } = await supabase.storage
            .from('app-icons')
            .upload(fileName, buffer, {
              contentType: 'image/png',
              upsert: true,
              cacheControl: '3600'
            })
          if (uploadError) throw new Error(`Failed to upload icon: ${uploadError.message}`)
          const { data: urlData } = supabase.storage.from('app-icons').getPublicUrl(fileName)
          iconUrl = urlData.publicUrl
        } else if (appIcon.startsWith('http://') || appIcon.startsWith('https://')) {
          iconUrl = appIcon
        }
      } catch (error) {
        console.error('Icon processing error:', error)
        iconUrl = null
      }
    }

    // Determine Build Type Track
    let buildType: BuildType = 'android_app';
    
    if (buildFormat === 'source') {
        buildType = 'android_source';
    } else if (buildFormat === 'ios_source') {
        buildType = 'ios_source';
    } else if (buildFormat === 'apk' || buildFormat === 'aab') {
        buildType = 'android_app';
    }
    // Future: Logic for iOS IPA

    // 1. Create Build Record
    const { data: buildData, error: buildError } = await supabase
        .from('app_builds')
        .insert({
            app_id: appId,
            build_type: buildType,
            build_format: buildFormat,
            status: 'queued',
            progress: 0,
            build_message: 'Queued for build...'
        })
        .select()
        .single();

    if (buildError || !buildData) {
        throw new Error('Failed to create build record: ' + buildError?.message);
    }

    // 2. Update App Config (Parent Table) - Just to keep settings fresh
    await supabase.from('apps').update({
        name: appName,
        website_url: websiteUrl,
        package_name: packageName,
        notification_email: notificationEmail,
        icon_url: iconUrl,
        // Mirror config columns
        primary_color: config.primaryColor,
        navigation: config.showNavBar,
        pull_to_refresh: config.enablePullToRefresh,
        orientation: config.orientation,
        enable_zoom: config.enableZoom,
        keep_awake: config.keepAwake,
        open_external_links: config.openExternalLinks,
        config: {
          themeMode: config.themeMode,
          showSplashScreen: config.showSplashScreen,
          splashColor: config.splashColor,
          primaryColor: config.primaryColor,
          showNavBar: config.showNavBar,
          enablePullToRefresh: config.enablePullToRefresh,
          orientation: config.orientation,
          enableZoom: config.enableZoom,
          keepAwake: config.keepAwake,
          openExternalLinks: config.openExternalLinks,
          userAgent: config.userAgent || 'Web2App/1.0 (iOS; iPhone)',
          appIcon: iconUrl,
          privacyPolicyUrl: config.privacyPolicyUrl,
          termsOfServiceUrl: config.termsOfServiceUrl
        }
    }).eq('id', appId);

    // 3. Payload for GitHub
    const buildPayload = {
      app_id: appId,
      build_id: buildData.id, // NEW: Pass the specific build ID
      name: appName,
      package_name: packageName,
      website_url: websiteUrl.replace(/__/g, '').trim(),
      icon_url: iconUrl,
      build_format: buildFormat, 
      notification_email: notificationEmail,
      
      config: {
        navigation: config.showNavBar ?? true,
        pull_to_refresh: config.enablePullToRefresh ?? true,
        enable_zoom: config.enableZoom ?? false,
        keep_awake: config.keepAwake ?? false,
        open_external_links: config.openExternalLinks ?? false,
        primary_color: config.primaryColor ?? '#2196F3',
        theme_mode: config.themeMode ?? 'auto',
        orientation: config.orientation ?? 'auto',
        splash_screen: config.showSplashScreen ?? false,
        splash_color: config.splashColor ?? '#FFFFFF',
        privacy_policy_url: config.privacyPolicyUrl || '',
        terms_of_service_url: config.termsOfServiceUrl || '',
      }
    };

    // 4. Dispatch GitHub Action
    const githubResponse = await fetch(
      `https://api.github.com/repos/${process.env.GITHUB_REPO}/dispatches`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          event_type: 'build-app',
          client_payload: buildPayload
        })
      }
    )

    if (!githubResponse.ok) {
      await supabase.from('app_builds').update({ status: 'failed', build_message: 'GitHub Dispatch Failed' }).eq('id', buildData.id);
      throw new Error('Failed to trigger GitHub build');
    }

    // 5. Attempt to fetch Run ID (Optional optimization)
    // We update the build record with the run ID if found
    setTimeout(async () => {
        try {
            const runsResponse = await fetch(
                `https://api.github.com/repos/${process.env.GITHUB_REPO}/actions/runs?per_page=1&event=workflow_dispatch`, 
                { headers: { 'Authorization': `Bearer ${process.env.GITHUB_TOKEN}` } }
            );
            if (runsResponse.ok) {
                const runsData = await runsResponse.json();
                if (runsData.workflow_runs?.[0]) {
                     await supabase.from('app_builds').update({ github_run_id: runsData.workflow_runs[0].id }).eq('id', buildData.id);
                }
            }
        } catch(e) { console.error("Run fetch failed", e)}
    }, 4000);

    return {
      success: true,
      runId: buildData.id,
      message: 'Build started successfully!'
    }

  } catch (error) {
    console.error('Build trigger error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
