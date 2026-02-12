
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
  buildType: 'apk' | 'aab' | 'source' | 'ios-ipa' | 'ios-source',
  notificationEmail?: string
) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    let iconUrl = null
    
    if (appIcon) {
      try {
        if (appIcon.startsWith('data:image')) {
          console.log('Uploading Base64 icon to Supabase Storage')
          const base64Data = appIcon.split(',')[1]
          const buffer = Buffer.from(base64Data, 'base64')
          const fileName = `${appId}/icon.png`
          const { error: uploadError } = await supabase.storage
            .from('app-icons')
            .upload(fileName, buffer, { contentType: 'image/png', upsert: true, cacheControl: '3600' })

          if (uploadError) throw new Error(`Failed to upload icon: ${uploadError.message}`)
          
          const { data: urlData } = supabase.storage.from('app-icons').getPublicUrl(fileName)
          iconUrl = urlData.publicUrl
        } else if (appIcon.startsWith('http')) {
          iconUrl = appIcon
        }
      } catch (error) {
        console.error('Icon processing error:', error)
        iconUrl = null
      }
    }

    // Determine Event Type for GitHub
    let eventType = 'build-app'; 
    if (buildType === 'source') eventType = 'package-source';
    if (buildType === 'ios-source') eventType = 'package-ios-source'; // Assuming new workflow
    if (buildType === 'ios-ipa') eventType = 'build-ios'; // Assuming new workflow

    const buildPayload = {
      app_id: appId,
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

    console.log(`📦 Sending payload to GitHub [Event: ${eventType}]:`, JSON.stringify(buildPayload, null, 2));

    // Prepare Database Update - ONLY update the specific status columns
    const dbUpdate: any = {
      app_id: appId,
      name: appName,
      website_url: websiteUrl,
      package_name: packageName,
      notification_email: notificationEmail,
      icon_url: iconUrl,
      // We still update 'build_format' for history logs, but not for state logic
      build_format: buildType,
      
      // Update config json
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
        userAgent: config.userAgent || 'Web2App/1.0',
        appIcon: iconUrl,
        privacyPolicyUrl: config.privacyPolicyUrl,
        termsOfServiceUrl: config.termsOfServiceUrl
      }
    };

    // --- INDEPENDENT STATE LOGIC ---
    if (buildType === 'source') {
      dbUpdate.source_status = 'building';
      dbUpdate.source_progress = 0;
    } else if (buildType === 'ios-source') {
      dbUpdate.ios_source_status = 'building';
      dbUpdate.ios_source_progress = 0;
    } else if (buildType === 'ios-ipa') {
      dbUpdate.ios_status = 'building';
      dbUpdate.ios_progress = 0;
    } else {
      // Android APK or AAB
      dbUpdate.apk_status = 'building';
      dbUpdate.apk_progress = 0;
    }

    const { error: dbError } = await supabase
      .from('apps')
      .update(dbUpdate)
      .eq('id', appId)

    if (dbError) throw new Error('Failed to save build data')

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
          event_type: eventType,
          client_payload: buildPayload
        })
      }
    )

    if (!githubResponse.ok) {
      // Revert status on failure
      const revertUpdate: any = {};
      if (buildType === 'source') revertUpdate.source_status = 'failed';
      else if (buildType === 'ios-source') revertUpdate.ios_source_status = 'failed';
      else if (buildType === 'ios-ipa') revertUpdate.ios_status = 'failed';
      else revertUpdate.apk_status = 'failed';

      await supabase.from('apps').update(revertUpdate).eq('id', appId)
      throw new Error('Failed to trigger GitHub build')
    }

    return { success: true, runId: appId, message: 'Build started successfully!' }

  } catch (error) {
    console.error('Build trigger error:', error)
    // Attempt final failure update (broad catch)
    const finalFailure: any = {};
    if (buildType === 'source') finalFailure.source_status = 'failed';
    else if (buildType === 'ios-source') finalFailure.ios_source_status = 'failed';
    else if (buildType === 'ios-ipa') finalFailure.ios_status = 'failed';
    else finalFailure.apk_status = 'failed';

    await supabase.from('apps').update(finalFailure).eq('id', appId)
    
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
