import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      // Core
      appName, websiteUrl, iconUrl, userId, appId,
      buildFormat, notificationEmail,

      // Version
      versionName, versionCode, packageName,

      // Visual
      primaryColor, secondaryColor, themeMode, statusBarStyle, statusBarColor,
      orientation, splashColor, splashAnimation, splashLogoUrl,

      // WebView
      navigation, pullToRefresh, enableZoom, keepAwake, openExternalLinks,
      userAgent, loadingIndicator, loadingColor,

      // Offline
      offlineMode, offlinePage, cacheStrategy,

      // Push Notifications
      enablePushNotifications, pushProvider, firebaseProjectId, oneSignalAppId,
      notificationColor, notificationSound, notificationBadge,

      // Analytics
      enableAnalytics, analyticsProvider, firebaseAnalyticsId,
      enableCrashReporting, crashReportingProvider, sentryDsn,

      // Auth
      enableBiometric, biometricPromptTitle,
      enableGoogleLogin, googleClientId,
      enableAppleLogin, enableFacebookLogin, facebookAppId,

      // Camera
      enableCamera, enableQRScanner, enableFilePicker,

      // Native
      enableHaptics, hapticStyle, enableDeepLinks, deepLinkScheme,
      enableUniversalLinks, universalLinkDomain,

      // Rating
      enableAppRating, appRatingDaysBeforePrompt, appRatingMinSessions,

      // IAP
      enableIAP, iapProvider, revenueCatApiKey,

      // Security
      enableCertPinning, pinnedCertHosts, enableRootDetection, enableScreenshotProtection,

      // Navigation
      enableNativeNav, nativeTabs, tabBarPosition, tabBarStyle, linkRules,

      // ASO
      shortDescription, fullDescription, keywords, appCategory, contentRating, appSubtitle,

      // Legal
      privacyPolicyUrl, termsOfServiceUrl, enableGDPR, enableATT, dataCollectionPurpose,

      // Advanced
      customCSS, customJS, customHeaders, enableJSBridge, debugMode,

      // Splash
      splashScreen,
    } = body;

    if (!appName || !websiteUrl || !userId || !appId) {
      return NextResponse.json({ error: 'Missing required parameters.' }, { status: 400 });
    }

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN!;
    const GITHUB_REPO = process.env.GITHUB_REPO!;

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_KEY);

    // ── 1. Determine platform & event type ──────────────────────────────────
    const format = buildFormat || 'apk';
    let platform = 'android';
    let eventType = 'build-app';

    if (format === 'ipa' || format === 'ios_source') {
      platform = 'ios';
      if (format === 'ios_source') eventType = 'package-ios-source';
    } else if (format === 'source') {
      eventType = 'package-source';
    }

    // ── 2. Concurrency check ─────────────────────────────────────────────────
    const { data: activeBuilds } = await supabaseAdmin
      .from('app_builds')
      .select('id')
      .eq('app_id', appId)
      .eq('platform', platform)
      .in('status', ['queued', 'building']);

    if (activeBuilds && activeBuilds.length > 0) {
      return NextResponse.json({ error: `A ${platform} build is already in progress.` }, { status: 409 });
    }

    // ── 3. Create build record FIRST ─────────────────────────────────────────
    const { data: newBuild, error: buildError } = await supabaseAdmin
      .from('app_builds')
      .insert([{ app_id: appId, platform, build_format: format, status: 'queued', progress: 0 }])
      .select().single();

    if (buildError || !newBuild) {
      throw new Error(`Failed to create build record: ${buildError?.message}`);
    }

    // ── 4. Update app config (full record) ───────────────────────────────────
    const resolvedPackage = packageName || `com.app.${appName.toLowerCase().replace(/[^a-z0-9]/g, '')}`;

    await supabaseAdmin.from('apps').update({
      name: appName,
      website_url: websiteUrl,
      icon_url: iconUrl,
      primary_color: primaryColor,
      package_name: resolvedPackage,
      notification_email: notificationEmail,
      navigation: navigation,
      pull_to_refresh: pullToRefresh,
      orientation: orientation,
      enable_zoom: enableZoom,
      keep_awake: keepAwake,
      open_external_links: openExternalLinks,
      config: {
        // Branding
        primaryColor, secondaryColor, themeMode, statusBarStyle, statusBarColor,
        // Splash
        showSplashScreen: splashScreen ?? true, splashColor, splashAnimation, splashLogoUrl,
        // WebView
        userAgent: userAgent || 'Web2App/1.0', loadingIndicator, loadingColor,
        // Offline
        offlineMode, offlinePage, cacheStrategy,
        // Push
        enablePushNotifications, pushProvider, firebaseProjectId, oneSignalAppId,
        notificationColor, notificationSound, notificationBadge,
        // Analytics
        enableAnalytics, analyticsProvider, firebaseAnalyticsId,
        enableCrashReporting, crashReportingProvider, sentryDsn,
        // Auth
        enableBiometric, biometricPromptTitle,
        enableGoogleLogin, googleClientId, enableAppleLogin, enableFacebookLogin, facebookAppId,
        // Camera
        enableCamera, enableQRScanner, enableFilePicker,
        // Native
        enableHaptics, hapticStyle, enableDeepLinks, deepLinkScheme,
        enableUniversalLinks, universalLinkDomain,
        // Rating
        enableAppRating, appRatingDaysBeforePrompt, appRatingMinSessions,
        // IAP
        enableIAP, iapProvider, revenueCatApiKey,
        // Security
        enableCertPinning, pinnedCertHosts, enableRootDetection, enableScreenshotProtection,
        // Navigation
        enableNativeNav, nativeTabs, tabBarPosition, tabBarStyle, linkRules,
        // ASO
        shortDescription, fullDescription, keywords, appCategory, contentRating, appSubtitle,
        // Legal
        privacyPolicyUrl, termsOfServiceUrl, enableGDPR, enableATT, dataCollectionPurpose,
        // Advanced
        customCSS, customJS, customHeaders, enableJSBridge, debugMode,
      }
    }).eq('id', appId);

    // ── 5. Trigger GitHub Action ─────────────────────────────────────────────
    const payload = {
      event_type: eventType,
      client_payload: {
        build_id: newBuild.id,
        app_id: appId,
        name: appName,
        package_name: resolvedPackage,
        website_url: websiteUrl,
        icon_url: iconUrl || '',
        build_format: format,
        notification_email: notificationEmail,
        version_name: versionName || '1.0.0',
        version_code: versionCode || 1,
        config: {
          // Core visual
          navigation: navigation ?? true,
          pull_to_refresh: pullToRefresh ?? true,
          primary_color: primaryColor || '#000000',
          secondary_color: secondaryColor || '#6b7280',
          theme_mode: themeMode || 'system',
          status_bar_style: statusBarStyle || 'auto',
          status_bar_color: statusBarColor || 'transparent',
          orientation: orientation || 'auto',

          // Splash
          splash_screen: splashScreen ?? true,
          splash_color: splashColor || '#FFFFFF',
          splash_animation: splashAnimation || 'fade',

          // WebView
          enable_zoom: enableZoom ?? false,
          keep_awake: keepAwake ?? false,
          open_external_links: openExternalLinks ?? true,
          user_agent: userAgent || 'Web2App/1.0',
          loading_indicator: loadingIndicator ?? true,
          loading_color: loadingColor || primaryColor || '#000000',

          // Offline
          offline_mode: offlineMode ?? false,
          offline_page: offlinePage || '',
          cache_strategy: cacheStrategy || 'basic',

          // Push
          enable_push_notifications: enablePushNotifications ?? false,
          push_provider: pushProvider || 'none',
          firebase_project_id: firebaseProjectId || '',
          onesignal_app_id: oneSignalAppId || '',
          notification_sound: notificationSound ?? true,
          notification_badge: notificationBadge ?? true,

          // Auth
          enable_biometric: enableBiometric ?? false,
          biometric_prompt_title: biometricPromptTitle || 'Authenticate',
          enable_google_login: enableGoogleLogin ?? false,
          google_client_id: googleClientId || '',
          enable_apple_login: enableAppleLogin ?? false,
          enable_facebook_login: enableFacebookLogin ?? false,
          facebook_app_id: facebookAppId || '',

          // Camera
          enable_camera: enableCamera ?? false,
          enable_qr_scanner: enableQRScanner ?? false,
          enable_file_picker: enableFilePicker ?? false,

          // Native
          enable_haptics: enableHaptics ?? false,
          haptic_style: hapticStyle || 'medium',
          enable_deep_links: enableDeepLinks ?? false,
          deep_link_scheme: deepLinkScheme || '',
          enable_universal_links: enableUniversalLinks ?? false,
          universal_link_domain: universalLinkDomain || '',

          // Rating
          enable_app_rating: enableAppRating ?? false,
          app_rating_days: appRatingDaysBeforePrompt || 7,
          app_rating_min_sessions: appRatingMinSessions || 5,

          // IAP
          enable_iap: enableIAP ?? false,
          iap_provider: iapProvider || 'none',
          revenuecat_api_key: revenueCatApiKey || '',

          // Security
          enable_cert_pinning: enableCertPinning ?? false,
          pinned_cert_hosts: pinnedCertHosts || '',
          enable_root_detection: enableRootDetection ?? false,
          enable_screenshot_protection: enableScreenshotProtection ?? false,

          // Navigation
          enable_native_nav: enableNativeNav ?? false,
          native_tabs: nativeTabs || [],
          tab_bar_position: tabBarPosition || 'bottom',
          tab_bar_style: tabBarStyle || 'labeled',
          link_rules: linkRules || [],

          // Legal
          privacy_policy_url: privacyPolicyUrl || '',
          terms_of_service_url: termsOfServiceUrl || '',
          enable_gdpr: enableGDPR ?? false,
          enable_att: enableATT ?? false,
          data_collection_purpose: dataCollectionPurpose || '',

          // Advanced
          custom_css: customCSS || '',
          custom_js: customJS || '',
          custom_headers: customHeaders || '',
          enable_js_bridge: enableJSBridge ?? true,
          debug_mode: debugMode ?? false,
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
      await supabaseAdmin.from('app_builds').update({ status: 'failed', build_message: 'Failed to trigger build' }).eq('id', newBuild.id);
      throw new Error(`GitHub refused dispatch: ${githubResponse.status}`);
    }

    return NextResponse.json({ success: true, buildId: newBuild.id });

  } catch (error: any) {
    console.error('Build API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
