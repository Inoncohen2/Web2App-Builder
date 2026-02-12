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
  buildType: 'apk' | 'aab' | 'source' | 'ios_source',
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
        // Case 1: Icon is Base64
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

          if (uploadError) {
            console.error('Icon upload error:', uploadError)
            throw new Error(`Failed to upload icon: ${uploadError.message}`)
          }

          const { data: urlData } = supabase.storage
            .from('app-icons')
            .getPublicUrl(fileName)

          iconUrl = urlData.publicUrl
        } 
        // Case 2: Icon is already a URL
        else if (appIcon.startsWith('http://') || appIcon.startsWith('https://')) {
          iconUrl = appIcon
        }
      } catch (error) {
        console.error('Icon processing error:', error)
        iconUrl = null
      }
    }

    // Determine Event Type and Database Updates based on buildType
    let eventType = 'build-app'; // default for APK/AAB
    let dbUpdates: any = {
        status: 'building', // Global status (legacy support)
    };

    if (buildType === 'apk' || buildType === 'aab') {
        eventType = 'build-app';
        dbUpdates = {
            ...dbUpdates,
            apk_status: 'building',
            apk_progress: 0,
            build_message: 'Initializing APK build...',
            build_format: buildType // 'apk' or 'aab'
        };
    } else if (buildType === 'source') {
        eventType = 'package-source';
        dbUpdates = {
            ...dbUpdates,
            source_status: 'building',
            source_progress: 0,
            build_message: 'Packaging Android source code...'
        };
    } else if (buildType === 'ios_source') {
        eventType = 'package-ios-source';
        dbUpdates = {
            ...dbUpdates,
            ios_source_status: 'building',
            ios_source_progress: 0,
            build_message: 'Packaging iOS source code...'
        };
    }

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

    // Update Supabase with specific status columns
    const { error: dbError } = await supabase
      .from('apps')
      .update({
        app_id: appId,
        name: appName,
        website_url: websiteUrl,
        package_name: packageName,
        notification_email: notificationEmail,
        icon_url: iconUrl, 
        
        // Config mirrors
        primary_color: config.primaryColor,
        navigation: config.showNavBar,
        pull_to_refresh: config.enablePullToRefresh,
        orientation: config.orientation,
        enable_zoom: config.enableZoom,
        keep_awake: config.keepAwake,
        open_external_links: config.openExternalLinks,
        
        // JSON Config
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
        },

        // Apply dynamic status updates based on build type
        ...dbUpdates
      })
      .eq('id', appId)

    if (dbError) {
      console.error('Database error:', dbError)
      throw new Error('Failed to save build data')
    }

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
          client_payload: buildPayload
        })
      }
    )

    if (!githubResponse.ok) {
      const errorText = await githubResponse.text()
      console.error('GitHub trigger failed:', errorText)
      
      // Rollback status on failure
      let failUpdates: any = {};
      if (buildType === 'apk' || buildType === 'aab') failUpdates = { apk_status: 'failed' };
      if (buildType === 'source') failUpdates = { source_status: 'failed' };
      if (buildType === 'ios_source') failUpdates = { ios_source_status: 'failed' };

      await supabase
        .from('apps')
        .update(failUpdates)
        .eq('id', appId)
      
      throw new Error('Failed to trigger GitHub build')
    }

    return {
      success: true,
      runId: appId,
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