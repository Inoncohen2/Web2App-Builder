
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ConfigPanel } from '../../components/ConfigPanel';
import { SigningPanel } from '../../components/SigningPanel'; // Import
import { PhoneMockup } from '../../components/PhoneMockup';
import { AppConfig, DEFAULT_CONFIG } from '../../types';
import { Button } from '../../components/ui/Button';
import { UserMenu } from '../../components/UserMenu';
import { ArrowRight, ArrowLeft, LoaderCircle, CircleCheck, Settings, Smartphone, RefreshCw, Save, Key } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import dynamic from 'next/dynamic';
import { useAppData, useInvalidateApp } from '../../hooks/useAppData';

const AuthModal = dynamic(() => import('../../components/AuthModal').then(mod => mod.AuthModal), {
  ssr: false
});

// Full Screen Transition Overlay Component - Updated to match Dashboard Loading
const TransitionOverlay = ({ isActive, message }: { isActive: boolean; message: string }) => {
  if (!isActive) return null;
  return (
    <div className="fixed inset-0 w-full h-[100dvh] bg-[#F6F8FA] flex flex-col items-center justify-center z-[9999]">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
         <div className="absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] bg-emerald-500/5 rounded-full blur-[100px]"></div>
         <div className="absolute -bottom-[20%] -right-[10%] w-[50vw] h-[50vw] bg-blue-500/5 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative flex flex-col items-center animate-in fade-in zoom-in duration-300">
         {/* Logo Container */}
         <div className="relative h-24 w-24 mb-8">
            <div className="absolute inset-0 bg-white rounded-3xl shadow-2xl shadow-emerald-500/20 flex items-center justify-center z-10 border border-white/50 backdrop-blur-xl">
               <img 
                 src="https://res.cloudinary.com/ddsogd7hv/image/upload/v1770576910/Icon2_dvenip.png" 
                 alt="Logo" 
                 className="h-14 w-14 object-contain"
               />
            </div>
            {/* Pulsing rings */}
            <div className="absolute inset-0 rounded-3xl bg-emerald-500/20 animate-ping duration-[2000ms]"></div>
            <div className="absolute -inset-4 rounded-[2rem] bg-emerald-500/10 animate-pulse duration-[3000ms]"></div>
         </div>

         {/* Text */}
         <div className="text-center space-y-3 relative z-10">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
               Web2App
            </h2>
            <div className="flex items-center gap-2 px-4 py-1.5 bg-white/60 border border-gray-200/60 rounded-full shadow-sm">
               <LoaderCircle className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
               <span className="text-xs font-medium text-gray-500 tracking-wide uppercase">{message}</span>
            </div>
         </div>
      </div>
    </div>
  );
};

interface BuilderClientProps {
  initialData?: any;
}

export default function BuilderClient({ initialData }: BuilderClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramId = searchParams.get('id');
  const invalidateApp = useInvalidateApp();
  
  // React Query Fetch - initialized with server data if available
  const { data: dbApp, isLoading: isQueryLoading } = useAppData(paramId, initialData);

  // Local State
  const [config, setConfig] = useState<AppConfig | null>(null); 
  const [isSaving, setIsSaving] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [editAppId, setEditAppId] = useState<string | null>(paramId);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  
  // Mobile Tab State
  const [activeMobileTab, setActiveMobileTab] = useState<'settings' | 'preview'>('settings');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // New: Config Panel Mode (Design vs Signing)
  // We manage this state here to conditionally render the correct panel
  const [panelMode, setPanelMode] = useState<'design' | 'signing'>('design');

  // Preview Scaling State
  const [previewScale, setPreviewScale] = useState(1);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // Set Theme
  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', '#F6F8FA');
    document.body.style.backgroundColor = '#F6F8FA';
  }, []);

  // Scale Calculation
  useEffect(() => {
    if (activeMobileTab !== 'preview') return;
    const calculateScale = () => {
      if (!previewContainerRef.current) return;
      const { clientWidth, clientHeight } = previewContainerRef.current;
      const TARGET_WIDTH = 420; 
      const TARGET_HEIGHT = 870; 
      const scaleX = (clientWidth - 32) / TARGET_WIDTH; 
      const scaleY = (clientHeight - 32) / TARGET_HEIGHT; 
      setPreviewScale(Math.min(scaleX, scaleY, 1));
    };
    calculateScale();
    window.addEventListener('resize', calculateScale);
    const timeout = setTimeout(calculateScale, 100);
    return () => {
      window.removeEventListener('resize', calculateScale);
      clearTimeout(timeout);
    };
  }, [activeMobileTab]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
        setUser(data.user);
        setIsUserLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsUserLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Initialize Config from DB or Params
  useEffect(() => {
    if (dbApp) {
        setEditAppId(dbApp.id);
        const c = dbApp.config || {};
        const mappedConfig: AppConfig = {
          ...DEFAULT_CONFIG,
          // Top-level columns
          appName: dbApp.name,
          websiteUrl: dbApp.website_url,
          primaryColor: dbApp.primary_color || c.primaryColor || '#000000',
          showNavBar: dbApp.navigation ?? c.showNavBar ?? true,
          enablePullToRefresh: dbApp.pull_to_refresh ?? c.enablePullToRefresh ?? true,
          orientation: dbApp.orientation || c.orientation || 'auto',
          enableZoom: dbApp.enable_zoom ?? c.enableZoom ?? false,
          keepAwake: dbApp.keep_awake ?? c.keepAwake ?? false,
          openExternalLinks: dbApp.open_external_links ?? c.openExternalLinks ?? true,
          appIcon: dbApp.icon_url || c.appIcon || null,
          packageName: dbApp.package_name || c.packageName || '',
          // From config JSON - ALL fields
          secondaryColor: c.secondaryColor || '#6b7280',
          themeMode: c.themeMode || 'system',
          statusBarStyle: c.statusBarStyle || 'auto',
          statusBarColor: c.statusBarColor || 'transparent',
          showSplashScreen: c.showSplashScreen ?? true,
          splashColor: c.splashColor || '#FFFFFF',
          splashLogoUrl: c.splashLogoUrl || '',
          splashAnimation: c.splashAnimation || 'fade',
          userAgent: c.userAgent || DEFAULT_CONFIG.userAgent,
          loadingIndicator: c.loadingIndicator ?? true,
          loadingColor: c.loadingColor || '#000000',
          offlineMode: c.offlineMode ?? false,
          offlinePage: c.offlinePage || '',
          cacheStrategy: c.cacheStrategy || 'basic',
          enableNativeNav: c.enableNativeNav ?? false,
          nativeTabs: c.nativeTabs || [],
          tabBarPosition: c.tabBarPosition || 'bottom',
          tabBarStyle: c.tabBarStyle || 'labeled',
          linkRules: c.linkRules || [],
          enablePushNotifications: c.enablePushNotifications ?? false,
          pushProvider: c.pushProvider || 'none',
          firebaseProjectId: c.firebaseProjectId || '',
          oneSignalAppId: c.oneSignalAppId || '',
          notificationSound: c.notificationSound ?? true,
          notificationBadge: c.notificationBadge ?? true,
          enableAnalytics: c.enableAnalytics ?? false,
          analyticsProvider: c.analyticsProvider || 'none',
          firebaseAnalyticsId: c.firebaseAnalyticsId || '',
          enableCrashReporting: c.enableCrashReporting ?? false,
          crashReportingProvider: c.crashReportingProvider || 'none',
          sentryDsn: c.sentryDsn || '',
          enableBiometric: c.enableBiometric ?? false,
          biometricPromptTitle: c.biometricPromptTitle || 'Authenticate',
          enableGoogleLogin: c.enableGoogleLogin ?? false,
          googleClientId: c.googleClientId || '',
          enableAppleLogin: c.enableAppleLogin ?? false,
          enableFacebookLogin: c.enableFacebookLogin ?? false,
          facebookAppId: c.facebookAppId || '',
          enableCamera: c.enableCamera ?? false,
          enableQRScanner: c.enableQRScanner ?? false,
          enableFilePicker: c.enableFilePicker ?? false,
          enableHaptics: c.enableHaptics ?? false,
          hapticStyle: c.hapticStyle || 'medium',
          enableDeepLinks: c.enableDeepLinks ?? false,
          deepLinkScheme: c.deepLinkScheme || '',
          enableUniversalLinks: c.enableUniversalLinks ?? false,
          universalLinkDomain: c.universalLinkDomain || '',
          enableAppRating: c.enableAppRating ?? false,
          appRatingDaysBeforePrompt: c.appRatingDaysBeforePrompt || 7,
          appRatingMinSessions: c.appRatingMinSessions || 5,
          appRatingPromptText: c.appRatingPromptText || 'Enjoying the app? Rate us!',
          enableIAP: c.enableIAP ?? false,
          iapProvider: c.iapProvider || 'none',
          revenueCatApiKey: c.revenueCatApiKey || '',
          enableCertPinning: c.enableCertPinning ?? false,
          pinnedCertHosts: c.pinnedCertHosts || '',
          enableRootDetection: c.enableRootDetection ?? false,
          enableScreenshotProtection: c.enableScreenshotProtection ?? false,
          shortDescription: c.shortDescription || '',
          fullDescription: c.fullDescription || '',
          keywords: c.keywords || '',
          appCategory: c.appCategory || 'utilities',
          contentRating: c.contentRating || 'everyone',
          appSubtitle: c.appSubtitle || '',
          privacyPolicyUrl: c.privacyPolicyUrl || '',
          termsOfServiceUrl: c.termsOfServiceUrl || '',
          enableGDPR: c.enableGDPR ?? false,
          enableATT: c.enableATT ?? false,
          dataCollectionPurpose: c.dataCollectionPurpose || '',
          customCSS: c.customCSS || '',
          customJS: c.customJS || '',
          customHeaders: c.customHeaders || '',
          enableJSBridge: c.enableJSBridge ?? true,
          debugMode: c.debugMode ?? false,
          versionName: c.versionName || '1.0.0',
          versionCode: c.versionCode || 1,
        };
        setConfig(mappedConfig);
    } else if (!paramId) {
      const paramUrl = searchParams.get('url');
      const paramName = searchParams.get('name');
      const paramColor = searchParams.get('color');
      const paramIcon = searchParams.get('icon');
      const paramPrivacy = searchParams.get('privacy');
      const paramTerms = searchParams.get('terms');

      setConfig({
        ...DEFAULT_CONFIG,
        websiteUrl: paramUrl || DEFAULT_CONFIG.websiteUrl,
        appName: paramName || DEFAULT_CONFIG.appName,
        primaryColor: paramColor || DEFAULT_CONFIG.primaryColor,
        appIcon: paramIcon || DEFAULT_CONFIG.appIcon,
        showSplashScreen: true,
        privacyPolicyUrl: paramPrivacy || '',
        termsOfServiceUrl: paramTerms || ''
      });
    }
  }, [dbApp, paramId, searchParams]);

  if (!config) {
     return null; 
  }

  const handleConfigChange = (key: keyof AppConfig, value: any) => {
    setConfig((prev) => prev ? ({ ...prev, [key]: value }) : null);
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleUrlBlur = async () => {
    if (!config.websiteUrl || config.websiteUrl.length < 4) return;
    let urlToCheck = config.websiteUrl;
    if (!urlToCheck.startsWith('http')) urlToCheck = 'https://' + urlToCheck;

    setIsFetchingMetadata(true);
    try {
        const { data, error } = await supabase.functions.invoke('scrape-site', {
            body: { url: urlToCheck }
        });

        if (error || (data && !data.isValid)) {
            console.warn('Scraping error:', error || data?.error);
        } else {
            setConfig(prev => prev ? ({
                ...prev,
                appName: data.title || prev.appName,
                appIcon: data.icon || prev.appIcon,
                primaryColor: data.themeColor || prev.primaryColor,
                websiteUrl: data.url || prev.websiteUrl,
                privacyPolicyUrl: data.privacyPolicyUrl || prev.privacyPolicyUrl,
                termsOfServiceUrl: data.termsOfServiceUrl || prev.termsOfServiceUrl
            }) : null);
        }
    } catch (err) {
        console.warn('Scraping failed silently', err);
    } finally {
        setIsFetchingMetadata(false);
    }
  };

  const handleSaveClick = () => {
    if (user) performSave();
    else setIsAuthModalOpen(true);
  };

  const generatePackageName = (name: string, url: string) => {
    let cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (cleanName.length < 3 && url) {
      try {
        const hostname = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
        const domain = hostname.replace(/^www\./, '').split('.')[0];
        const cleanDomain = domain.replace(/[^a-z0-9]/g, '');
        if (cleanDomain.length >= 3) cleanName = cleanDomain;
      } catch {}
    }
    if (cleanName.length < 3) cleanName = 'myapp';
    return `com.app.${cleanName}`;
  };

  const performSave = async () => {
    setIsSaving(true);
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      const finalUser = currentUser || user;
      const userId = finalUser?.id;
      const userEmail = finalUser?.email;

      let pkgName = dbApp?.package_name;
      if (!pkgName) {
        pkgName = generatePackageName(config.appName, config.websiteUrl);
      }

      const payload = {
        name: config.appName,
        website_url: config.websiteUrl,
        user_id: userId, 
        notification_email: userEmail,
        package_name: pkgName,
        primary_color: config.primaryColor,
        navigation: config.showNavBar,
        pull_to_refresh: config.enablePullToRefresh,
        orientation: config.orientation,
        enable_zoom: config.enableZoom,
        keep_awake: config.keepAwake,
        open_external_links: config.openExternalLinks,
        icon_url: config.appIcon,
        // ── Top-level columns that mirror config fields (for easy querying) ──
        version_name: config.versionName || '1.0.0',
        version_code: config.versionCode || 1,
        short_description: config.shortDescription || '',
        full_description: config.fullDescription || '',
        keywords: config.keywords || '',
        app_category: config.appCategory || 'utilities',
        content_rating: config.contentRating || 'everyone',
        config: {
          // Branding
          primaryColor: config.primaryColor,
          secondaryColor: config.secondaryColor,
          themeMode: config.themeMode,
          statusBarStyle: config.statusBarStyle,
          statusBarColor: config.statusBarColor,
          // Splash
          showSplashScreen: config.showSplashScreen,
          splashColor: config.splashColor,
          splashLogoUrl: config.splashLogoUrl,
          splashAnimation: config.splashAnimation,
          // WebView
          showNavBar: config.showNavBar,
          enablePullToRefresh: config.enablePullToRefresh,
          orientation: config.orientation,
          enableZoom: config.enableZoom,
          keepAwake: config.keepAwake,
          openExternalLinks: config.openExternalLinks,
          userAgent: config.userAgent,
          loadingIndicator: config.loadingIndicator,
          loadingColor: config.loadingColor,
          appIcon: config.appIcon,
          // Offline
          offlineMode: config.offlineMode,
          offlinePage: config.offlinePage,
          cacheStrategy: config.cacheStrategy,
          // Push
          enablePushNotifications: config.enablePushNotifications,
          pushProvider: config.pushProvider,
          firebaseProjectId: config.firebaseProjectId,
          oneSignalAppId: config.oneSignalAppId,
          notificationSound: config.notificationSound,
          notificationBadge: config.notificationBadge,
          // Analytics
          enableAnalytics: config.enableAnalytics,
          analyticsProvider: config.analyticsProvider,
          firebaseAnalyticsId: config.firebaseAnalyticsId,
          enableCrashReporting: config.enableCrashReporting,
          crashReportingProvider: config.crashReportingProvider,
          sentryDsn: config.sentryDsn,
          // Auth
          enableBiometric: config.enableBiometric,
          biometricPromptTitle: config.biometricPromptTitle,
          enableGoogleLogin: config.enableGoogleLogin,
          googleClientId: config.googleClientId,
          enableAppleLogin: config.enableAppleLogin,
          enableFacebookLogin: config.enableFacebookLogin,
          facebookAppId: config.facebookAppId,
          // Camera
          enableCamera: config.enableCamera,
          enableQRScanner: config.enableQRScanner,
          enableFilePicker: config.enableFilePicker,
          // Native
          enableHaptics: config.enableHaptics,
          hapticStyle: config.hapticStyle,
          enableDeepLinks: config.enableDeepLinks,
          deepLinkScheme: config.deepLinkScheme,
          enableUniversalLinks: config.enableUniversalLinks,
          universalLinkDomain: config.universalLinkDomain,
          // Rating
          enableAppRating: config.enableAppRating,
          appRatingDaysBeforePrompt: config.appRatingDaysBeforePrompt,
          appRatingMinSessions: config.appRatingMinSessions,
          // IAP
          enableIAP: config.enableIAP,
          iapProvider: config.iapProvider,
          revenueCatApiKey: config.revenueCatApiKey,
          // Security
          enableCertPinning: config.enableCertPinning,
          pinnedCertHosts: config.pinnedCertHosts,
          enableRootDetection: config.enableRootDetection,
          enableScreenshotProtection: config.enableScreenshotProtection,
          // Navigation
          enableNativeNav: config.enableNativeNav,
          nativeTabs: config.nativeTabs,
          tabBarPosition: config.tabBarPosition,
          tabBarStyle: config.tabBarStyle,
          linkRules: config.linkRules,
          // ASO
          shortDescription: config.shortDescription,
          fullDescription: config.fullDescription,
          keywords: config.keywords,
          appCategory: config.appCategory,
          contentRating: config.contentRating,
          appSubtitle: config.appSubtitle,
          // Legal
          privacyPolicyUrl: config.privacyPolicyUrl,
          termsOfServiceUrl: config.termsOfServiceUrl,
          enableGDPR: config.enableGDPR,
          enableATT: config.enableATT,
          dataCollectionPurpose: config.dataCollectionPurpose,
          // Advanced
          customCSS: config.customCSS,
          customJS: config.customJS,
          customHeaders: config.customHeaders,
          enableJSBridge: config.enableJSBridge,
          debugMode: config.debugMode,
          versionName: config.versionName,
          versionCode: config.versionCode,
          packageName: config.packageName,
        }
      };

      if (editAppId) {
        setIsRedirecting(true);
        await supabase.from('apps').update(payload).eq('id', editAppId);
        invalidateApp(editAppId);
        router.push(`/dashboard/${editAppId}`);
      } else {
        if (userId) {
            const { data: existingApps } = await supabase
                .from('apps')
                .select('id')
                .eq('user_id', userId)
                .ilike('website_url', config.websiteUrl);

            if (existingApps && existingApps.length > 0) {
                const existingId = existingApps[0].id;
                await supabase.from('apps').update(payload).eq('id', existingId);
                setIsRedirecting(true);
                invalidateApp(existingId);
                router.push(`/dashboard/${existingId}`);
                return;
            }
        }

        const { data, error } = await supabase.from('apps').insert([payload]).select();
        if (error) throw error;
        if (data && data.length > 0) {
           setIsRedirecting(true);
           router.push(`/dashboard/${data[0].id}`);
        }
      }
    } catch (err) {
      console.error('Save error:', err);
      alert('An error occurred while saving.');
      setIsSaving(false);
      setIsRedirecting(false);
    }
  };

  return (
    <div className="fixed inset-0 h-[100dvh] w-full bg-[#F6F8FA] overflow-hidden font-sans text-slate-900 flex flex-col sm:flex-row overscroll-none touch-none animate-page-enter">
      
      <TransitionOverlay 
         isActive={isSaving || isRedirecting} 
         message={isRedirecting ? "Preparing Dashboard..." : "Updating Configuration..."} 
      />

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => performSave()}
        onGuest={() => { setIsAuthModalOpen(false); performSave(); }}
        initialView="signup"
      />

      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="hidden sm:flex flex-col w-[400px] lg:w-[40%] h-full bg-white/80 backdrop-blur-2xl border-r border-white/50 shadow-2xl z-30 shrink-0">
        <div className="h-20 shrink-0 flex items-center justify-between px-6 border-b border-gray-100/50">
           <div className="flex items-center gap-3 cursor-pointer group" onClick={() => router.push('/')}>
              <img src="https://res.cloudinary.com/ddsogd7hv/image/upload/v1770576910/Icon2_dvenip.png" alt="Logo" className="h-10 w-10 rounded-lg object-contain" />
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-tight text-gray-900 group-hover:text-emerald-600 transition-colors">Web2App</span>
                <span className="text-[10px] font-medium text-gray-500">Builder Studio</span>
              </div>
           </div>
           
           <div className="flex items-center gap-3">
              {isFetchingMetadata && <LoaderCircle className="animate-spin text-emerald-500" size={16}/>}
              {isUserLoading ? (
                 <div className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-white border border-gray-200">
                    <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse hidden md:block"></div>
                    <div className="h-3 w-3 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ) : user ? (
                 <UserMenu initialUser={user} />
              ) : null}
           </div>
        </div>
        
        {/* TAB SWITCHER */}
        <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100/50">
           <button 
             onClick={() => setPanelMode('design')}
             className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${panelMode === 'design' ? 'bg-gray-900 text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
           >
             Design
           </button>
           <button 
             onClick={() => {
                if (!editAppId) { alert("Please save your app before configuring keys."); return; }
                setPanelMode('signing');
             }}
             className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${panelMode === 'signing' ? 'bg-gray-900 text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
           >
             <Key size={12} /> Signing
           </button>
        </div>

        <div className="flex-1 overflow-hidden relative">
            <div className="absolute inset-0 overflow-y-auto custom-scrollbar touch-auto">
               <div className="max-w-3xl mx-auto w-full">
                  {panelMode === 'design' ? (
                     <ConfigPanel config={config} onChange={handleConfigChange} onUrlBlur={handleUrlBlur} isLoading={isFetchingMetadata} />
                  ) : (
                     <SigningPanel 
                        appId={editAppId!} 
                        packageName={dbApp?.package_name || generatePackageName(config.appName, config.websiteUrl)} 
                        appName={config.appName} 
                     />
                  )}
               </div>
            </div>
        </div>
        
        {panelMode === 'design' && (
          <div className="p-6 border-t border-gray-100/50 bg-white/50 backdrop-blur-sm">
               <div className="max-w-3xl mx-auto w-full space-y-3">
                 <Button 
                   variant="primary" 
                   className="w-full h-12 rounded-xl shadow-lg shadow-emerald-500/20 bg-gray-900 hover:bg-gray-800 transition-all hover:scale-105 border-none text-white flex items-center justify-center gap-2"
                   onClick={handleSaveClick}
                   disabled={isSaving}
                 >
                    {isSaving ? <LoaderCircle size={18} className="animate-spin" /> : <Save size={18} />}
                    <span>{isSaving ? 'Saving...' : 'Save & Continue'}</span>
                    {!isSaving && <ArrowRight size={18} className="opacity-70" />}
                 </Button>
                 
                 <button onClick={() => router.push('/')} className="flex items-center justify-center gap-2 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors w-full py-2">
                    <ArrowLeft size={14} /> Back to Landing Page
                 </button>
               </div>
          </div>
        )}
      </aside>

      {/* --- MAIN PREVIEW AREA --- */}
      <main className="flex-1 relative h-full overflow-hidden flex flex-col bg-[#F6F8FA] overscroll-none">
         <div className="absolute inset-0 z-0 pointer-events-none opacity-60 fixed sm:absolute" 
              style={{ backgroundImage: 'radial-gradient(#cbd5e1 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}>
         </div>

         {/* Mobile Settings Panel */}
         <div className={`
             sm:hidden absolute left-4 right-4 top-4 bottom-24 z-30
             bg-white/90 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl
             flex flex-col transition-all duration-300 ease-out origin-bottom
             ${activeMobileTab === 'settings' ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' : 'opacity-0 translate-y-8 scale-95 pointer-events-none'}
         `}>
             <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-gray-100/50 bg-white/50 rounded-t-3xl relative z-20">
                <div className="flex items-center gap-2" onClick={() => router.push('/')}>
                    <img src="https://res.cloudinary.com/ddsogd7hv/image/upload/v1770576910/Icon2_dvenip.png" alt="Logo" className="h-8 w-8 rounded-lg object-contain" />
                    <span className="text-sm font-bold text-gray-900">Web2App</span>
                </div>
                {isUserLoading ? (
                   <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
                ) : user ? (
                   <UserMenu initialUser={user} />
                ) : null}
             </div>
             {/* Mobile Tab Switcher */}
             <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-100/50">
               <button onClick={() => setPanelMode('design')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${panelMode === 'design' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'}`}>Design</button>
               <button onClick={() => { if (!editAppId) { alert("Save first"); return; } setPanelMode('signing'); }} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${panelMode === 'signing' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'}`}><Key size={12} /> Signing</button>
             </div>
             <div className="flex-1 overflow-y-auto custom-scrollbar rounded-b-3xl relative z-10">
                {panelMode === 'design' ? (
                   <ConfigPanel config={config} onChange={handleConfigChange} onUrlBlur={handleUrlBlur} isLoading={isFetchingMetadata} />
                ) : (
                   <SigningPanel 
                        appId={editAppId!} 
                        packageName={dbApp?.package_name || generatePackageName(config.appName, config.websiteUrl)} 
                        appName={config.appName} 
                   />
                )}
             </div>
         </div>

         {/* Preview Container */}
         <div ref={previewContainerRef} className={`transition-all duration-300 ${activeMobileTab === 'preview' ? 'sm:hidden fixed inset-0 bottom-[80px] z-40 flex items-center justify-center pointer-events-none overflow-hidden' : 'hidden sm:flex w-full h-full items-center justify-center relative z-10 py-10 lg:py-20'}`}>
             <div className={`transition-all duration-500 ease-out flex items-center justify-center pointer-events-auto origin-center will-change-transform ${activeMobileTab === 'preview' ? '' : 'scale-[0.55] md:scale-[0.60] lg:scale-[0.70] xl:scale-[0.75] 2xl:scale-[0.80]'}`} style={activeMobileTab === 'preview' ? { transform: `scale(${previewScale})` } : {}}>
                <PhoneMockup config={config} isMobilePreview={activeMobileTab === 'preview'} refreshKey={refreshTrigger} />
             </div>
         </div>
      </main>

      {/* --- MOBILE BOTTOM BAR --- */}
      <div className="sm:hidden fixed bottom-6 left-0 right-0 z-50 px-4 pointer-events-none">
        <div className="relative flex items-center justify-between w-full max-w-md mx-auto h-14">
          <button onClick={activeMobileTab === 'settings' ? () => router.push('/') : handleRefresh} className="h-14 w-14 rounded-full bg-white text-black shadow-xl shadow-gray-200/50 flex items-center justify-center pointer-events-auto active:scale-90 transition-transform border border-gray-100">
             {activeMobileTab === 'settings' ? <ArrowLeft size={20} /> : <RefreshCw size={20} />}
          </button>

          <div className="absolute left-1/2 -translate-x-1/2 flex h-14 items-center rounded-full bg-gray-900/95 backdrop-blur-md p-1.5 shadow-2xl pointer-events-auto border border-white/10">
            <button onClick={() => setActiveMobileTab('settings')} className={`flex items-center justify-center gap-1.5 rounded-full px-5 text-[10px] font-bold transition-all duration-300 h-full ${activeMobileTab === 'settings' ? 'bg-white text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}>
              <Settings size={16} /> Edit
            </button>
            <button onClick={() => setActiveMobileTab('preview')} className={`flex items-center justify-center gap-1.5 rounded-full px-5 text-[10px] font-bold transition-all duration-300 h-full ${activeMobileTab === 'preview' ? 'bg-white text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}>
              <Smartphone size={16} /> Preview
            </button>
          </div>

          <button onClick={handleSaveClick} disabled={isSaving} className="h-14 w-14 rounded-full bg-black text-white shadow-xl shadow-black/20 flex items-center justify-center pointer-events-auto active:scale-90 transition-all border border-gray-800">
            {isSaving ? <LoaderCircle size={24} className="animate-spin" /> : <Save size={24} />} 
          </button>
        </div>
      </div>
      {showToast && <div className="absolute bottom-20 sm:bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-medium text-white shadow-lg animate-in fade-in slide-in-from-bottom-5"><CircleCheck size={18} className="text-green-400" /> Settings Saved!</div>}
    </div>
  );
}
