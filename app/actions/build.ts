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
  buildType: 'apk' | 'aab' | 'source' | 'ios',
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
            .upload(fileName, buffer, {
              contentType: 'image/png',
              upsert: true,
              cacheControl: '3600'
            })

          if (uploadError) throw new Error(`Failed to upload icon: ${uploadError.message}`)

          const { data: urlData } = supabase.storage
            .from('app-icons')
            .getPublicUrl(fileName)

          iconUrl = urlData.publicUrl
        } 
        else if (appIcon.startsWith('http://') || appIcon.startsWith('https://')) {
          iconUrl = appIcon
        }
      } catch (error) {
        console.error('Icon processing error:', error)
        iconUrl = null
      }
    }

    // Prepare Base Payload
    const basePayload = {
      app_id: appId,
      name: appName,
      package_name: packageName,
      website_url: websiteUrl.replace(/__/g, '').trim(),
      icon_url: iconUrl,
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

    // Determine Event Type and DB Updates based on Build Type
    let eventType = 'build-app'; // Default to Android APK/AAB
    let dbUpdateData: any = {
        name: appName,
        package_name: packageName,
        website_url: websiteUrl,
        icon_url: iconUrl,
        notification_email: notificationEmail,
        // Update general config columns
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
    };

    if (buildType === 'source') {
        eventType = 'package-source';
        dbUpdateData.source_status = 'building';
        dbUpdateData.source_progress = 0;
        dbUpdateData.source_message = 'Preparing source code...';
    } else if (buildType === 'ios') {
        eventType = 'package-ios-source';
        dbUpdateData.ios_status = 'building';
        dbUpdateData.ios_progress = 0;
        dbUpdateData.ios_message = 'Preparing iOS project...';
    } else {
        // APK or AAB
        eventType = 'build-app';
        dbUpdateData.status = 'building';
        dbUpdateData.progress = 0;
        dbUpdateData.build_message = 'Initializing build environment...';
        dbUpdateData.build_format = buildType; // 'apk' or 'aab'
        
        // Add specific format to payload for the build-app workflow
        (basePayload as any).build_format = buildType;
    }

    console.log(`📦 Triggering ${eventType} for ${buildType}`);

    // Update Supabase
    const { error: dbError } = await supabase
      .from('apps')
      .update(dbUpdateData)
      .eq('id', appId)

    if (dbError) throw new Error('Failed to save build data to database');

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
          client_payload: basePayload
        })
      }
    )

    if (!githubResponse.ok) {
      const errorText = await githubResponse.text()
      console.error('GitHub trigger failed:', errorText)
      
      // Rollback status
      const failUpdate = buildType === 'source' ? { source_status: 'failed' } :
                         buildType === 'ios' ? { ios_status: 'failed' } :
                         { status: 'failed' };
                         
      await supabase.from('apps').update(failUpdate).eq('id', appId)
      
      throw new Error('Failed to trigger GitHub build')
    }

    return {
      success: true,
      runId: appId, // Using App ID as run reference since actual Run ID is async
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