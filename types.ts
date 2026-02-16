
export interface AppConfig {
  appName: string;
  websiteUrl: string;
  userAgent: string;
  primaryColor: string;
  themeMode: 'system' | 'light' | 'dark';
  showNavBar: boolean;
  enablePullToRefresh: boolean;
  showSplashScreen: boolean;
  appIcon: string | null;
  // New fields
  orientation: 'auto' | 'portrait' | 'landscape';
  enableZoom: boolean;
  keepAwake: boolean;
  openExternalLinks: boolean;
  splashColor: string;
  privacyPolicyUrl: string;
  termsOfServiceUrl: string;
}

export const DEFAULT_CONFIG: AppConfig = {
  appName: "My Awesome App",
  websiteUrl: "https://www.wikipedia.org",
  userAgent: "Web2App/1.0 (iOS; iPhone)",
  primaryColor: "#000000",
  themeMode: 'system',
  showNavBar: true,
  enablePullToRefresh: true,
  showSplashScreen: true,
  appIcon: null,
  orientation: 'auto',
  enableZoom: false,
  keepAwake: false,
  openExternalLinks: true,
  splashColor: "#ffffff",
  privacyPolicyUrl: "",
  termsOfServiceUrl: "",
};

export type BuildType = 'android_app' | 'android_source' | 'ios_app' | 'ios_source';
export type BuildFormat = 'apk' | 'aab' | 'source' | 'ipa' | 'ios_source';
export type BuildStatus = 'queued' | 'building' | 'ready' | 'failed' | 'cancelled';

export interface AppBuild {
  id: string;
  app_id: string;
  build_type: BuildType;
  build_format: BuildFormat;
  status: BuildStatus;
  progress: number;
  download_url: string | null;
  build_message: string | null;
  github_run_id: string | null;
  created_at: string;
}
