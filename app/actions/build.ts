
'use server'

import { createClient } from '@supabase/supabase-js'
import { Buffer } from 'buffer'

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
  buildType: 'apk' | 'aab' | 'source' | 'ios_ipa' | 'ios_source',
  notificationEmail?: string
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    let iconUrl = null
    
    // 1. Handle Icon Upload (Same as before)
    if (appIcon) {
      try {
        if (appIcon.startsWith('data:image')) {
          const base64Data = appIcon.split(',')[1]
          const buffer = Buffer.from(base64Data, 'base64')
          const fileName = `${appId}/icon.png`
          const { error: uploadError } = await supabase.storage
            .from('app-icons')
            .upload(fileName, buffer, { contentType: 'image/png', upsert: true, cacheControl: '3600' })

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

    // 2. Update App Configuration (Legacy table update)
    // We still update the main 'apps' table for the configuration source of truth
    const { error: appUpdateError } = await supabase
      .from('apps')
      .update({
        name: appName,
        website_url: websiteUrl,
        package_name: packageName,
        notification_email: notificationEmail,
        icon_url: iconUrl,
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
      })
      .eq('id', appId)

    if (appUpdateError) throw new Error('Failed to update app configuration')

    // 3. Insert new Build Record (New Parallel Architecture)
    const { data: buildRecord, error: buildInsertError } = await supabase
      .from('app_builds')
      .insert({
        app_id: appId,
        build_type: buildType,
        status: 'queued',
        progress: 0,
        build_message: 'Initializing build environment...'
      })
      .select('id')
      .single()

    if (buildInsertError || !buildRecord) {
        console.error('Build insert error', buildInsertError)
        throw new Error('Failed to queue build record')
    }

    console.log(`🚀 Queued build ${buildRecord.id} for app ${appId} type ${buildType}`);

    // 4. Construct Payload
    // Note: We send BOTH app_id and build_id. 
    // Legacy workers might use app_id, new workers use build_id.
    const buildPayload = {
      app_id: appId,
      build_id: buildRecord.id, // NEW: The specific build row ID
      name: appName,
      package_name: packageName,
      website_url: websiteUrl.replace(/__/g, '').trim(),
      icon_url: iconUrl,
      build_format: buildType, 
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

    // 5. Trigger GitHub Action
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
      const errorText = await githubResponse.text()
      // Rollback status to failed
      await supabase.from('app_builds').update({ status: 'failed', build_message: 'GitHub Dispatch Failed' }).eq('id', buildRecord.id);
      throw new Error(`GitHub trigger failed: ${errorText}`)
    }

    // 6. Async Run ID Fetching (Optional optimization)
    // We don't block the UI for this anymore, but the webhook will update the run ID later if needed.
    // Ideally, a separate worker or the GH action itself reports the run ID back.

    return {
      success: true,
      buildId: buildRecord.id,
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
