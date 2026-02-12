
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
  buildType: 'apk' | 'aab' | 'source',
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
          const base64Data = appIcon.split(',')[1]
          const buffer = Buffer.from(base64Data, 'base64')
          const fileName = `${appId}/icon.png`
          
          await supabase.storage
            .from('app-icons')
            .upload(fileName, buffer, {
              contentType: 'image/png',
              upsert: true,
              cacheControl: '3600'
            })

          const { data: urlData } = supabase.storage
            .from('app-icons')
            .getPublicUrl(fileName)

          iconUrl = urlData.publicUrl
        } else if (appIcon.startsWith('http')) {
          iconUrl = appIcon
        }
      } catch (error) {
        console.error('Icon processing error:', error)
      }
    }

    // Prepare JSON Config Payload
    const configPayload = {
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
    };

    // Determine event type and update specific DB columns
    let eventType = 'build-app'; // Default
    
    // DB Update Payload (Must match Schema exactly)
    const updatePayload: any = {
      // REMOVED: app_id (This column does not exist in 'apps' table, 'id' is the PK)
      name: appName,
      website_url: websiteUrl,
      package_name: packageName,
      notification_email: notificationEmail,
      icon_url: iconUrl,
      
      // Legacy primary_color: kept for easy listing query, but main source is config
      primary_color: config.primaryColor,
      
      // All UI/UX flags are now here
      config: configPayload
    };

    // Specific Status Updates based on Build Type
    if (buildType === 'apk' || buildType === 'aab') {
      eventType = 'build-app'; // GitHub Event
      updatePayload.apk_status = 'building';
      updatePayload.apk_progress = 0;
      updatePayload.apk_message = 'Initializing Android Build...';
    } else if (buildType === 'source') {
      eventType = 'package-source'; // GitHub Event
      updatePayload.android_source_status = 'building';
      updatePayload.android_source_progress = 0;
      updatePayload.android_source_message = 'Generating Source Code...';
    }

    // Update Supabase
    const { error: dbError } = await supabase
      .from('apps')
      .update(updatePayload)
      .eq('id', appId)

    if (dbError) throw new Error('Failed to save build data: ' + dbError.message)

    // GitHub Payload (Needs app_id for the external script)
    const githubPayload = {
      app_id: appId,
      name: appName,
      package_name: packageName,
      website_url: websiteUrl,
      icon_url: iconUrl,
      build_format: buildType, 
      notification_email: notificationEmail,
      config: configPayload
    };

    // Trigger GitHub Action
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
          client_payload: githubPayload
        })
      }
    )

    if (!githubResponse.ok) {
      throw new Error('Failed to trigger GitHub build')
    }

    return {
      success: true,
      runId: appId,
      message: 'Build started successfully!'
    }

  } catch (error) {
    console.error('Build trigger error:', error)
    
    // Attempt to reset status on failure
    if (buildType === 'apk' || buildType === 'aab') {
       await supabase.from('apps').update({ apk_status: 'failed' }).eq('id', appId)
    } else if (buildType === 'source') {
       await supabase.from('apps').update({ android_source_status: 'failed' }).eq('id', appId)
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
