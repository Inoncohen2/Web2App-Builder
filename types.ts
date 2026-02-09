
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
};
