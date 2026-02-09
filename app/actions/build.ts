'use server'

import { createClient } from '@supabase/supabase-js'
import { Buffer } from 'buffer'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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
}

export async function triggerAppBuild(
  appName: string,
  packageName: string,
  appId: string,
  websiteUrl: string,
  appIcon: string,
  config: BuildConfig,
  buildType: 'apk' | 'aab',
  notificationEmail?: string
) {
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
              upsert: true
            })

          if (uploadError) {
            console.error('Icon upload error:', uploadError)
            throw new Error('Failed to upload icon')
          }

          const { data: urlData } = supabase.storage
            .from('app-icons')
            .getPublicUrl(fileName)

          iconUrl = urlData.publicUrl
        } 
        // Case 2: Icon is already a URL (e.g. Cloudinary)
        else if (appIcon.startsWith('http://') || appIcon.startsWith('https://')) {
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

    const { error: dbError } = await supabase
      .from('apps')
      .update({
        app_id: appId,
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
        build_format: buildType,
        status: 'building',
        config: {
          theme_mode: config.themeMode,
          show_splash_screen: config.showSplashScreen,
          primary_color: config.primaryColor,
          navigation: config.showNavBar,
          pull_to_refresh: config.enablePullToRefresh,
          orientation: config.orientation,
          enable_zoom: config.enableZoom,
          keep_awake: config.keepAwake,
          open_external_links: config.openExternalLinks
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
          client_payload: {
            app_id: appId,
            name: appName,
            website_url: websiteUrl,
            package_name: packageName,
            icon_url: iconUrl,
            notification_email: notificationEmail,
            build_format: buildType,
            config: {
              primary_color: config.primaryColor,
              theme_mode: config.themeMode,
              navigation: config.showNavBar,
              pull_to_refresh: config.enablePullToRefresh,
              orientation: config.orientation,
              enable_zoom: config.enableZoom,
              keep_awake: config.keepAwake,
              open_external_links: config.openExternalLinks
            }
          }
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