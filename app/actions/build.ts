
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
        // Case 1: Icon is Base64
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

          if (uploadError) {
            console.error('Icon upload error:', uploadError)
            throw new Error(`Failed to upload icon: ${uploadError.message}`)
          }

          const { data: urlData } = supabase.storage
            .from('app-icons')
            .getPublicUrl(fileName)

          iconUrl = urlData.publicUrl
          console.log('Icon uploaded, URL:', iconUrl)
        } 
        // Case 2: Icon is already a URL (e.g. Cloudinary or Supabase)
        else if (appIcon.startsWith('http://') || appIcon.startsWith('https://')) {
          console.log('Using external icon URL:', appIcon)
          iconUrl = appIcon
        }
        else {
          console.warn('Unknown icon format, skipping')
        }

      } catch (error) {
        console.error('Icon processing error:', error)
        iconUrl = null
      }
    }

    console.log('Final icon URL:', iconUrl)

    // Payload for GitHub Actions (Snake Case conventions for scripts)
    const buildPayload = {
      app_id: appId,
      name: appName,
      package_name: packageName,
      website_url: websiteUrl.replace(/__/g, '').trim(),
      icon_url: iconUrl,
      build_format: buildType, // 'apk' or 'aab'
      notification_email: notificationEmail,
      
      config: {
        // Navigation & Behavior
        navigation: config.showNavBar ?? true,
        pull_to_refresh: config.enablePullToRefresh ?? true,
        enable_zoom: config.enableZoom ?? false,
        keep_awake: config.keepAwake ?? false,
        open_external_links: config.openExternalLinks ?? false,
        
        // Appearance
        primary_color: config.primaryColor ?? '#2196F3',
        theme_mode: config.themeMode ?? 'auto',
        orientation: config.orientation ?? 'auto',
        
        // Splash (if enabled)
        splash_screen: config.showSplashScreen ?? false,
        splash_color: config.splashColor ?? '#FFFFFF',
        
        // Legal
        privacy_policy_url: config.privacyPolicyUrl || '',
        terms_of_service_url: config.termsOfServiceUrl || '',
      }
    };

    console.log('📦 Sending payload:', JSON.stringify(buildPayload, null, 2));

    // Update Supabase (Using Camel Case for JSON config to match Frontend Types)
    const { error: dbError } = await supabase
      .from('apps')
      .update({
        app_id: appId,
        name: appName,
        website_url: websiteUrl,
        package_name: packageName,
        notification_email: notificationEmail,
        icon_url: iconUrl, // Top level column update
        
        // Mirror top-level columns
        primary_color: config.primaryColor,
        navigation: config.showNavBar,
        pull_to_refresh: config.enablePullToRefresh,
        orientation: config.orientation,
        enable_zoom: config.enableZoom,
        keep_awake: config.keepAwake,
        open_external_links: config.openExternalLinks,
        
        build_format: buildType,
        status: 'building',
        
        // JSON Config for detailed settings (camelCase)
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

    if (dbError) {
      console.error('Database error:', dbError)
      throw new Error('Failed to save build data')
    }

    // Using GITHUB_REPO directly (format: USERNAME/REPO)
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
      console.error('GitHub trigger failed:', errorText)
      
      await supabase
        .from('apps')
        .update({ status: 'failed' })
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
    
    await supabase
      .from('apps')
      .update({ status: 'failed' })
      .eq('id', appId)
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
