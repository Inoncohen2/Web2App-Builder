
'use server'

import { createClient } from '@supabase/supabase-js'
import { Buffer } from 'buffer'

// Full BuildConfig - mirrors AppConfig from types.ts
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
  splashAnimation?: string
  userAgent?: string
  appIcon?: string | null
  privacyPolicyUrl?: string
  termsOfServiceUrl?: string
  // All new fields
  secondaryColor?: string
  statusBarStyle?: string
  statusBarColor?: string
  loadingIndicator?: boolean
  loadingColor?: string
  offlineMode?: boolean
  offlinePage?: string
  cacheStrategy?: string
  enablePushNotifications?: boolean
  pushProvider?: string
  firebaseProjectId?: string
  oneSignalAppId?: string
  notificationSound?: boolean
  notificationBadge?: boolean
  enableAnalytics?: boolean
  analyticsProvider?: string
  enableCrashReporting?: boolean
  crashReportingProvider?: string
  sentryDsn?: string
  enableBiometric?: boolean
  biometricPromptTitle?: string
  enableGoogleLogin?: boolean
  googleClientId?: string
  enableAppleLogin?: boolean
  enableFacebookLogin?: boolean
  facebookAppId?: string
  enableCamera?: boolean
  enableQRScanner?: boolean
  enableFilePicker?: boolean
  enableHaptics?: boolean
  hapticStyle?: string
  enableDeepLinks?: boolean
  deepLinkScheme?: string
  enableUniversalLinks?: boolean
  universalLinkDomain?: string
  enableAppRating?: boolean
  appRatingDaysBeforePrompt?: number
  appRatingMinSessions?: number
  enableIAP?: boolean
  iapProvider?: string
  revenueCatApiKey?: string
  enableCertPinning?: boolean
  pinnedCertHosts?: string
  enableRootDetection?: boolean
  enableScreenshotProtection?: boolean
  enableNativeNav?: boolean
  nativeTabs?: any[]
  tabBarPosition?: string
  tabBarStyle?: string
  linkRules?: any[]
  enableGDPR?: boolean
  enableATT?: boolean
  dataCollectionPurpose?: string
  customCSS?: string
  customJS?: string
  customHeaders?: string
  enableJSBridge?: boolean
  debugMode?: boolean
  versionName?: string
  versionCode?: number
  packageName?: string
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

    // Payload for GitHub Actions
    const buildPayload = {
      app_id: appId,
      name: appName,
      package_name: packageName,
      website_url: websiteUrl.replace(/__/g, '').trim(),
      icon_url: iconUrl,
      build_format: buildType,
      notification_email: notificationEmail,
      version_name: config.versionName || '1.0.0',
      version_code: config.versionCode || 1,
      
      config: {
        navigation: config.showNavBar ?? true,
        pull_to_refresh: config.enablePullToRefresh ?? true,
        enable_zoom: config.enableZoom ?? false,
        keep_awake: config.keepAwake ?? false,
        open_external_links: config.openExternalLinks ?? false,
        primary_color: config.primaryColor ?? '#2196F3',
        secondary_color: config.secondaryColor || '#6b7280',
        theme_mode: config.themeMode ?? 'system',
        status_bar_style: config.statusBarStyle || 'auto',
        status_bar_color: config.statusBarColor || 'transparent',
        orientation: config.orientation ?? 'auto',
        splash_screen: config.showSplashScreen ?? false,
        splash_color: config.splashColor ?? '#FFFFFF',
        splash_animation: config.splashAnimation || 'fade',
        user_agent: config.userAgent || 'Web2App/1.0',
        loading_indicator: config.loadingIndicator ?? true,
        loading_color: config.loadingColor || '#000000',
        offline_mode: config.offlineMode ?? false,
        offline_page: config.offlinePage || '',
        cache_strategy: config.cacheStrategy || 'basic',
        enable_push_notifications: config.enablePushNotifications ?? false,
        push_provider: config.pushProvider || 'none',
        firebase_project_id: config.firebaseProjectId || '',
        onesignal_app_id: config.oneSignalAppId || '',
        notification_sound: config.notificationSound ?? true,
        notification_badge: config.notificationBadge ?? true,
        enable_analytics: config.enableAnalytics ?? false,
        analytics_provider: config.analyticsProvider || 'none',
        enable_crash_reporting: config.enableCrashReporting ?? false,
        crash_reporting_provider: config.crashReportingProvider || 'none',
        sentry_dsn: config.sentryDsn || '',
        enable_biometric: config.enableBiometric ?? false,
        biometric_prompt_title: config.biometricPromptTitle || 'Authenticate',
        enable_google_login: config.enableGoogleLogin ?? false,
        google_client_id: config.googleClientId || '',
        enable_apple_login: config.enableAppleLogin ?? false,
        enable_facebook_login: config.enableFacebookLogin ?? false,
        facebook_app_id: config.facebookAppId || '',
        enable_camera: config.enableCamera ?? false,
        enable_qr_scanner: config.enableQRScanner ?? false,
        enable_file_picker: config.enableFilePicker ?? false,
        enable_haptics: config.enableHaptics ?? false,
        haptic_style: config.hapticStyle || 'medium',
        enable_deep_links: config.enableDeepLinks ?? false,
        deep_link_scheme: config.deepLinkScheme || '',
        enable_universal_links: config.enableUniversalLinks ?? false,
        universal_link_domain: config.universalLinkDomain || '',
        enable_app_rating: config.enableAppRating ?? false,
        app_rating_days: config.appRatingDaysBeforePrompt || 7,
        app_rating_min_sessions: config.appRatingMinSessions || 5,
        enable_iap: config.enableIAP ?? false,
        iap_provider: config.iapProvider || 'none',
        revenuecat_api_key: config.revenueCatApiKey || '',
        enable_cert_pinning: config.enableCertPinning ?? false,
        pinned_cert_hosts: config.pinnedCertHosts || '',
        enable_root_detection: config.enableRootDetection ?? false,
        enable_screenshot_protection: config.enableScreenshotProtection ?? false,
        enable_native_nav: config.enableNativeNav ?? false,
        native_tabs: config.nativeTabs || [],
        tab_bar_position: config.tabBarPosition || 'bottom',
        tab_bar_style: config.tabBarStyle || 'labeled',
        link_rules: config.linkRules || [],
        privacy_policy_url: config.privacyPolicyUrl || '',
        terms_of_service_url: config.termsOfServiceUrl || '',
        enable_gdpr: config.enableGDPR ?? false,
        enable_att: config.enableATT ?? false,
        data_collection_purpose: config.dataCollectionPurpose || '',
        custom_css: config.customCSS || '',
        custom_js: config.customJS || '',
        custom_headers: config.customHeaders || '',
        enable_js_bridge: config.enableJSBridge ?? true,
        debug_mode: config.debugMode ?? false,
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
