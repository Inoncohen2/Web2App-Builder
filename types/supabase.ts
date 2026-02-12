
export interface App {
  id: string;
  user_id: string;
  name: string;
  package_name: string;
  website_url: string;
  icon_url?: string | null;
  primary_color?: string; // Kept for listing, but source of truth is config
  
  // Parallel Build States
  // Android APK
  apk_status?: 'idle' | 'building' | 'ready' | 'failed' | 'cancelled';
  apk_progress?: number;
  apk_message?: string;
  download_url?: string;

  // Android Source
  android_source_status?: 'idle' | 'building' | 'ready' | 'failed' | 'cancelled';
  android_source_progress?: number;
  android_source_message?: string;
  android_source_url?: string;

  // iOS IPA
  ios_ipa_status?: 'idle' | 'building' | 'ready' | 'failed' | 'cancelled';
  ios_ipa_progress?: number;
  ios_ipa_message?: string;
  ios_ipa_url?: string;

  // iOS Source
  ios_source_status?: 'idle' | 'building' | 'ready' | 'failed' | 'cancelled';
  ios_source_progress?: number;
  ios_source_message?: string;
  ios_source_url?: string;

  // Config & Metadata (Contains all UI/UX flags)
  config?: any;
  created_at?: string;
  updated_at?: string;
  notification_email?: string;
}
