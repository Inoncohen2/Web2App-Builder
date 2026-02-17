
// ============================================================
// FULL AppConfig - All features from competitive research
// ============================================================

export interface NativeTab {
  id: string;
  label: string;
  icon: 'home' | 'search' | 'cart' | 'profile' | 'settings' | 'bell' | 'heart' | 'star' | 'menu' | 'chat';
  url: string;
  badgeCount?: number;
}

export interface LinkRule {
  pattern: string; // URL pattern / regex
  action: 'open_internal' | 'open_browser' | 'block';
}

export interface AppConfig {
  // ---- IDENTITY ----
  appName: string;
  websiteUrl: string;
  appIcon: string | null;
  packageName: string;     // com.company.app
  versionName: string;     // 1.0.0
  versionCode: number;     // 1

  // ---- BRANDING & DESIGN ----
  primaryColor: string;
  secondaryColor: string;
  themeMode: 'system' | 'light' | 'dark';
  statusBarStyle: 'auto' | 'light' | 'dark';
  statusBarColor: string; // 'transparent' or hex
  showNavBar: boolean;

  // ---- SPLASH SCREEN ----
  showSplashScreen: boolean;
  splashColor: string;
  splashLogoUrl: string;
  splashAnimation: 'none' | 'fade' | 'slide' | 'zoom';

  // ---- WEBVIEW SETTINGS ----
  userAgent: string;
  enableZoom: boolean;
  enablePullToRefresh: boolean;
  keepAwake: boolean;
  openExternalLinks: boolean;
  orientation: 'auto' | 'portrait' | 'landscape';
  loadingIndicator: boolean;
  loadingColor: string;

  // ---- OFFLINE MODE ----
  offlineMode: boolean;
  offlinePage: string;       // URL to custom offline page
  cacheStrategy: 'none' | 'basic' | 'aggressive'; // none / cache on first load / aggressive prefetch

  // ---- NATIVE NAVIGATION (TAB BAR) ----
  enableNativeNav: boolean;
  nativeTabs: NativeTab[];
  tabBarPosition: 'bottom' | 'top';
  tabBarStyle: 'standard' | 'floating' | 'labeled';

  // ---- LINK RULES ----
  linkRules: LinkRule[];

  // ---- PUSH NOTIFICATIONS ----
  enablePushNotifications: boolean;
  pushProvider: 'firebase' | 'onesignal' | 'none';
  firebaseProjectId: string;
  oneSignalAppId: string;
  notificationIcon: string;
  notificationColor: string;
  notificationSound: boolean;
  notificationBadge: boolean;

  // ---- ANALYTICS ----
  enableAnalytics: boolean;
  analyticsProvider: 'firebase' | 'none';
  firebaseAnalyticsId: string;
  enableCrashReporting: boolean;
  crashReportingProvider: 'firebase' | 'sentry' | 'none';
  sentryDsn: string;

  // ---- AUTHENTICATION ----
  enableBiometric: boolean;
  biometricPromptTitle: string;
  enableGoogleLogin: boolean;
  googleClientId: string;
  enableAppleLogin: boolean;  // Mandatory if any social login enabled
  enableFacebookLogin: boolean;
  facebookAppId: string;

  // ---- CAMERA & SCANNER ----
  enableCamera: boolean;
  enableQRScanner: boolean;
  enableFilePicker: boolean;

  // ---- NATIVE FEATURES ----
  enableHaptics: boolean;
  hapticStyle: 'light' | 'medium' | 'heavy';
  enableDeepLinks: boolean;
  deepLinkScheme: string;   // myapp://
  enableUniversalLinks: boolean;
  universalLinkDomain: string;

  // ---- APP RATING ----
  enableAppRating: boolean;
  appRatingDaysBeforePrompt: number;
  appRatingMinSessions: number;
  appRatingPromptText: string;

  // ---- IN-APP PURCHASES ----
  enableIAP: boolean;
  iapProvider: 'revenuecat' | 'native' | 'none';
  revenueCatApiKey: string;

  // ---- SECURITY ----
  enableCertPinning: boolean;
  pinnedCertHosts: string;  // comma-separated domains
  enableRootDetection: boolean;
  enableScreenshotProtection: boolean;

  // ---- ASO (APP STORE OPTIMIZATION) ----
  shortDescription: string;    // 80 chars max
  fullDescription: string;     // 4000 chars max
  keywords: string;            // comma-separated
  appCategory: string;
  contentRating: 'everyone' | 'teen' | 'mature';
  appSubtitle: string;         // iOS subtitle, 30 chars

  // ---- LEGAL ----
  privacyPolicyUrl: string;
  termsOfServiceUrl: string;
  enableGDPR: boolean;
  enableATT: boolean;          // Apple Tracking Transparency
  dataCollectionPurpose: string;

  // ---- ADVANCED ----
  customCSS: string;
  customJS: string;
  customHeaders: string;       // JSON: { "X-Custom": "value" }
  enableJSBridge: boolean;
  debugMode: boolean;
}

export const DEFAULT_CONFIG: AppConfig = {
  // Identity
  appName: 'My Awesome App',
  websiteUrl: 'https://www.example.com',
  appIcon: null,
  packageName: '',
  versionName: '1.0.0',
  versionCode: 1,

  // Branding
  primaryColor: '#000000',
  secondaryColor: '#6b7280',
  themeMode: 'system',
  statusBarStyle: 'auto',
  statusBarColor: 'transparent',
  showNavBar: true,

  // Splash
  showSplashScreen: true,
  splashColor: '#ffffff',
  splashLogoUrl: '',
  splashAnimation: 'fade',

  // WebView
  userAgent: 'Web2App/1.0',
  enableZoom: false,
  enablePullToRefresh: true,
  keepAwake: false,
  openExternalLinks: true,
  orientation: 'auto',
  loadingIndicator: true,
  loadingColor: '#000000',

  // Offline
  offlineMode: false,
  offlinePage: '',
  cacheStrategy: 'basic',

  // Navigation
  enableNativeNav: false,
  nativeTabs: [],
  tabBarPosition: 'bottom',
  tabBarStyle: 'labeled',

  // Link Rules
  linkRules: [],

  // Push
  enablePushNotifications: false,
  pushProvider: 'none',
  firebaseProjectId: '',
  oneSignalAppId: '',
  notificationIcon: '',
  notificationColor: '#000000',
  notificationSound: true,
  notificationBadge: true,

  // Analytics
  enableAnalytics: false,
  analyticsProvider: 'none',
  firebaseAnalyticsId: '',
  enableCrashReporting: false,
  crashReportingProvider: 'none',
  sentryDsn: '',

  // Auth
  enableBiometric: false,
  biometricPromptTitle: 'Authenticate',
  enableGoogleLogin: false,
  googleClientId: '',
  enableAppleLogin: false,
  enableFacebookLogin: false,
  facebookAppId: '',

  // Camera
  enableCamera: false,
  enableQRScanner: false,
  enableFilePicker: false,

  // Native
  enableHaptics: false,
  hapticStyle: 'medium',
  enableDeepLinks: false,
  deepLinkScheme: '',
  enableUniversalLinks: false,
  universalLinkDomain: '',

  // Rating
  enableAppRating: false,
  appRatingDaysBeforePrompt: 7,
  appRatingMinSessions: 5,
  appRatingPromptText: 'Enjoying the app? Rate us!',

  // IAP
  enableIAP: false,
  iapProvider: 'none',
  revenueCatApiKey: '',

  // Security
  enableCertPinning: false,
  pinnedCertHosts: '',
  enableRootDetection: false,
  enableScreenshotProtection: false,

  // ASO
  shortDescription: '',
  fullDescription: '',
  keywords: '',
  appCategory: 'utilities',
  contentRating: 'everyone',
  appSubtitle: '',

  // Legal
  privacyPolicyUrl: '',
  termsOfServiceUrl: '',
  enableGDPR: false,
  enableATT: false,
  dataCollectionPurpose: '',

  // Advanced
  customCSS: '',
  customJS: '',
  customHeaders: '',
  enableJSBridge: true,
  debugMode: false,
};
