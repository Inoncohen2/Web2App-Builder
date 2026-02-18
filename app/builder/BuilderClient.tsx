
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ConfigPanel } from '../../components/ConfigPanel';
import { PhoneMockup } from '../../components/PhoneMockup';
import { AppConfig, DEFAULT_CONFIG } from '../../types';
import { Button } from '../../components/ui/Button';
import { UserMenu } from '../../components/UserMenu';
import { ArrowRight, ArrowLeft, LoaderCircle, CircleCheck, Settings, Smartphone, RefreshCw, Save, Key } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import dynamic from 'next/dynamic';
import { useAppData, useInvalidateApp } from '../../hooks/useAppData';
import { useQueryClient } from '@tanstack/react-query';

const AuthModal = dynamic(() => import('../../components/AuthModal').then(mod => mod.AuthModal), {
  ssr: false
});

// --- CLIENT SIDE INFERENCE LOGIC (Shared) ---
const inferMetadataFromUrl = (url: string) => {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    const hostname = urlObj.hostname;
    
    // 1. Name Inference
    const parts = hostname.replace(/^www\./, '').split('.');
    let name = parts[0];
    if (name.length < 3 && parts.length > 1) name = parts[1]; 
    name = name.charAt(0).toUpperCase() + name.slice(1); 

    // 2. Icon Inference (Google Fallback)
    const icon = `https://www.google.com/s2/favicons?domain=${hostname}&sz=192`;

    // 3. Legal Inference
    const privacy = `${urlObj.origin}/privacy`;
    const terms = `${urlObj.origin}/terms`;

    return {
      title: name,
      icon: icon,
      themeColor: '#000000', 
      privacy,
      terms
    };
  } catch (e) {
    return { title: 'My App', icon: '', themeColor: '#000000', privacy: '', terms: '' };
  }
};

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
  const queryClient = useQueryClient();
  
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
            body: { url: urlToCheck, t: Date.now() }
        });

        const inferred = inferMetadataFromUrl(urlToCheck);
        
        // Merge Server + Client Data
        const finalTitle = (data?.title && data.title !== 'My App') ? data.title : inferred.title;
        const finalIcon = (data?.icon) ? data.icon : inferred.icon;
        const finalColor = (data?.themeColor) ? data.themeColor : inferred.themeColor;
        const finalPrivacy = (data?.privacyPolicyUrl) ? data.privacyPolicyUrl : inferred.privacy;
        const finalTerms = (data?.termsOfServiceUrl) ? data.termsOfServiceUrl : inferred.terms;

        setConfig(prev => prev ? ({
            ...prev,
            appName: finalTitle || prev.appName,
            appIcon: finalIcon || prev.appIcon,
            primaryColor: finalColor || prev.primaryColor,
            websiteUrl: data?.url || prev.websiteUrl,
            privacyPolicyUrl: finalPrivacy || prev.privacyPolicyUrl,
            termsOfServiceUrl: finalTerms || prev.termsOfServiceUrl
        }) : null);

    } catch (err) {
        console.warn('Scraping failed, fallback to client inference', err);
        const inferred = inferMetadataFromUrl(urlToCheck);
        setConfig(prev => prev ? ({
            ...prev,
            appName: inferred.title,
            appIcon: inferred.icon,
            websiteUrl: urlToCheck
        }) : null);
    } finally {
        setIsFetchingMetadata(false);
    }
  };

  const handleFullReset = async () => {
    if (!config?.websiteUrl) return;
    
    if (!window.confirm("This will overwrite all settings with fresh data from the website. Continue?")) {
      return;
    }

    setIsFetchingMetadata(true);
    try {
        let urlToCheck = config.websiteUrl;
        if (!urlToCheck.startsWith('http')) urlToCheck = 'https://' + urlToCheck;

        const { data } = await supabase.functions.invoke('scrape-site', {
            body: { url: urlToCheck, t: Date.now() }
        });

        const scrapedData = data || {};
        const inferred = inferMetadataFromUrl(urlToCheck);

        const finalTitle = scrapedData.title && scrapedData.title !== 'My App' ? scrapedData.title : inferred.title;
        const finalIcon = scrapedData.icon || inferred.icon;
        const finalColor = scrapedData.themeColor || inferred.themeColor;

        const freshConfig: AppConfig = {
            ...DEFAULT_CONFIG,
            appName: finalTitle,
            websiteUrl: scrapedData.url || config.websiteUrl,
            appIcon: finalIcon,
            primaryColor: finalColor || DEFAULT_CONFIG.primaryColor,
            privacyPolicyUrl: scrapedData.privacyPolicyUrl || inferred.privacy,
            termsOfServiceUrl: scrapedData.termsOfServiceUrl || inferred.terms,
            packageName: config.packageName || generatePackageName(finalTitle, scrapedData.url || config.websiteUrl),
            versionName: '1.0.0', 
            versionCode: 1
        };

        setConfig(freshConfig);
        setRefreshTrigger(prev => prev + 1);

        if (editAppId) {
            queryClient.setQueryData(['app', editAppId], (oldData: any) => {
                if (!oldData) return oldData;
                return {
                    ...oldData,
                    name: freshConfig.appName,
                    website_url: freshConfig.websiteUrl,
                    icon_url: freshConfig.appIcon,
                    primary_color: freshConfig.primaryColor,
                    config: freshConfig
                };
            });
        }
        
        await performSave(freshConfig, true);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);

    } catch (err) {
        console.error('Reset error:', err);
        // Fallback on full crash
        const inferred = inferMetadataFromUrl(config.websiteUrl);
        setConfig(prev => prev ? ({ ...prev, appName: inferred.title, appIcon: inferred.icon }) : null);
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

  const performSave = async (configOverride?: AppConfig, skipRedirect: boolean = false) => {
    // Allows saving a specific config object (for resets) or current state
    const cfg = configOverride || config;
    if (!cfg) return;

    setIsSaving(true);
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      const finalUser = currentUser || user;
      const userId = finalUser?.id;
      const userEmail = finalUser?.email;

      let pkgName = cfg.packageName;
      if (!pkgName) {
        pkgName = generatePackageName(cfg.appName, cfg.websiteUrl);
      }

      const payload = {
        name: cfg.appName,
        website_url: cfg.websiteUrl,
        user_id: userId, 
        notification_email: userEmail,
        package_name: pkgName,
        primary_color: cfg.primaryColor,
        navigation: cfg.showNavBar,
        pull_to_refresh: cfg.enablePullToRefresh,
        orientation: cfg.orientation,
        enable_zoom: cfg.enableZoom,
        keep_awake: cfg.keepAwake,
        open_external_links: cfg.openExternalLinks,
        icon_url: cfg.appIcon,
        // ── Top-level columns that mirror config fields ──
        version_name: cfg.versionName || '1.0.0',
        version_code: cfg.versionCode || 1,
        short_description: cfg.shortDescription || '',
        full_description: cfg.fullDescription || '',
        keywords: cfg.keywords || '',
        app_category: cfg.appCategory || 'utilities',
        content_rating: cfg.contentRating || 'everyone',
        config: {
          ...cfg, // Save all config fields
          package_name: pkgName // Ensure consistency
        }
      };

      if (editAppId) {
        await supabase.from('apps').update(payload).eq('id', editAppId);
        invalidateApp(editAppId);
        
        if (!skipRedirect) {
            setIsRedirecting(true);
            router.push(`/dashboard/${editAppId}`);
        } else {
            setIsSaving(false); // Stop spinner if we are just staying here
        }
      } else {
        if (userId) {
            const { data: existingApps } = await supabase
                .from('apps')
                .select('id')
                .eq('user_id', userId)
                .ilike('website_url', cfg.websiteUrl);

            if (existingApps && existingApps.length > 0) {
                const existingId = existingApps[0].id;
                await supabase.from('apps').update(payload).eq('id', existingId);
                
                if (!skipRedirect) {
                    setIsRedirecting(true);
                    invalidateApp(existingId);
                    router.push(`/dashboard/${existingId}`);
                } else {
                    setEditAppId(existingId);
                    setIsSaving(false);
                }
                return;
            }
        }

        const { data, error } = await supabase.from('apps').insert([payload]).select();
        if (error) throw error;
        if (data && data.length > 0) {
           if (!skipRedirect) {
               setIsRedirecting(true);
               router.push(`/dashboard/${data[0].id}`);
           } else {
               setEditAppId(data[0].id);
               setIsSaving(false);
           }
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
         isActive={isSaving && !config} // Only show full overlay if saving initial state or redirecting
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
                 // FIXED SKELETON: Matches UserMenu dimensions perfectly (h-8 w-8 avatar + padding)
                 <div className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-white border border-gray-200 h-[46px] box-border">
                    <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse shrink-0"></div>
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse hidden md:block"></div>
                    <div className="h-3 w-3 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ) : user ? (
                 <UserMenu initialUser={user} />
              ) : null}
           </div>
        </div>
        
        {/* ONE CONFIG PANEL - UNIFIED */}
        <div className="flex-1 overflow-hidden relative">
            <div className="absolute inset-0 overflow-y-auto custom-scrollbar touch-auto">
               <div className="max-w-3xl mx-auto w-full">
                  <ConfigPanel 
                    config={config} 
                    onChange={handleConfigChange} 
                    onUrlBlur={handleUrlBlur}
                    onReset={handleFullReset}
                    isLoading={isFetchingMetadata}
                    appId={editAppId}
                    packageName={dbApp?.package_name || generatePackageName(config.appName, config.websiteUrl)}
                  />
               </div>
            </div>
        </div>
        
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
             
             <div className="flex-1 overflow-y-auto custom-scrollbar rounded-b-3xl relative z-10">
                <ConfigPanel 
                    config={config} 
                    onChange={handleConfigChange} 
                    onUrlBlur={handleUrlBlur}
                    onReset={handleFullReset}
                    isLoading={isFetchingMetadata}
                    appId={editAppId}
                    packageName={dbApp?.package_name || generatePackageName(config.appName, config.websiteUrl)}
                />
             </div>
         </div>

         {/* Preview Container */}
         <div ref={previewContainerRef} className={`transition-all duration-300 ${activeMobileTab === 'preview' ? 'sm:hidden fixed inset-0 bottom-[80px] z-40 flex items-center justify-center pointer-events-none overflow-hidden' : 'hidden sm:flex w-full h-full items-center justify-center relative z-10 py-10 lg:py-20'}`}>
             <div className={`transition-all duration-500 ease-out flex items-center justify-center pointer-events-auto origin-center will-change-transform ${activeMobileTab === 'preview' ? '' : 'scale-[0.55] md:scale-[0.60] lg:scale-[0.70] xl:scale-[0.75] 2xl:scale-[0.80]'}`} style={activeMobileTab === 'preview' ? { transform: `scale(${previewScale})` } : {}}>
                {/* ALWAYS render phone frame on builder, even on mobile */}
                {/* hideSideTools={true} on mobile preview to prevent double buttons */}
                <PhoneMockup config={config} isMobilePreview={false} refreshKey={refreshTrigger} hideSideTools={activeMobileTab === 'preview'} />
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
