
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../supabaseClient';
import { Button } from '../../../components/ui/Button';
import { LoaderCircle, Settings, BarChart2, FileText, Palette, ChevronLeft, History } from 'lucide-react';
import Link from 'next/link';
import { UserMenu } from '../../../components/UserMenu';
import { BuildMonitor, BuildState } from '../../../components/BuildMonitor';
import { BuildHistory } from '../../../components/BuildHistory';
import { useAppData } from '../../../hooks/useAppData';
import { useBuilds } from '../../../hooks/useBuilds';
import { useQueryClient } from '@tanstack/react-query';
import { BuildsAnalyticsModal } from '../../../components/BuildsAnalyticsModal';

// --- Loading Component (Only for first ever load) ---
const DashboardLoader = () => (
  <div className="fixed inset-0 w-full h-[100dvh] bg-[#F6F8FA] flex flex-col items-center justify-center z-[9999]">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
         <div className="absolute -top-[20%] -left-[10%] w-[50vw] h-[50vw] bg-emerald-500/5 rounded-full blur-[100px]"></div>
         <div className="absolute -bottom-[20%] -right-[10%] w-[50vw] h-[50vw] bg-blue-500/5 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative flex flex-col items-center animate-in fade-in zoom-in duration-300">
         <div className="relative h-24 w-24 mb-8">
            <div className="absolute inset-0 bg-white rounded-3xl shadow-2xl shadow-emerald-500/20 flex items-center justify-center z-10 border border-white/50 backdrop-blur-xl">
               <img 
                 src="https://res.cloudinary.com/ddsogd7hv/image/upload/v1770576910/Icon2_dvenip.png" 
                 alt="Logo" 
                 className="h-14 w-14 object-contain"
               />
            </div>
            <div className="absolute inset-0 rounded-3xl bg-emerald-500/20 animate-ping duration-[2000ms]"></div>
            <div className="absolute -inset-4 rounded-[2rem] bg-emerald-500/10 animate-pulse duration-[3000ms]"></div>
         </div>

         <div className="text-center space-y-3 relative z-10">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
               Web2App
            </h2>
            <div className="flex items-center gap-2 px-4 py-1.5 bg-white/60 border border-gray-200/60 rounded-full shadow-sm">
               <LoaderCircle className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
               <span className="text-xs font-medium text-gray-500 tracking-wide uppercase">Syncing Dashboard...</span>
            </div>
         </div>
      </div>
    </div>
);

const validatePackageName = (name: string): boolean => {
  if (!name.includes('.')) return false;
  const regex = /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/;
  if (!regex.test(name)) return false;
  if (name.startsWith('.') || name.endsWith('.')) return false;
  return true;
};

interface DashboardClientProps {
  appId: string;
  initialData: any;
}

export default function DashboardClient({ appId, initialData }: DashboardClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // 1. Fetch App Data (Now Aggressively Cached)
  // Even if isQueryLoading is true, if we have 'data' from cache, we render it!
  const { data: appData, isLoading: isQueryLoading } = useAppData(appId, initialData);

  // 2. Fetch Build Data (Cached + Realtime)
  const { data: allBuilds = [], isLoading: isBuildsLoading } = useBuilds(appId);

  // Local Monitor States
  const [androidBuild, setAndroidBuild] = useState<BuildState>({
      id: null, status: 'idle', progress: 0, downloadUrl: null, format: null, runId: null
  });
  const [iosBuild, setIosBuild] = useState<BuildState>({
      id: null, status: 'idle', progress: 0, downloadUrl: null, format: null, runId: null
  });

  const [packageName, setPackageName] = useState('');
  const [user, setUser] = useState<any>(null);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);

  // Helper: Slug Generation
  const generateSlug = useCallback((name: string, url: string = '') => {
    const englishOnly = name.replace(/[^a-zA-Z0-9\s]/g, '');
    const words = englishOnly.trim().split(/\s+/).filter(w => w.length > 0);
    if (words.length > 0) return words.slice(0, 3).join('_').toLowerCase();
    if (url) {
      try {
        const hostname = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
        return hostname.replace(/^www\./, '').split('.')[0].replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
      } catch (e) { return 'app'; }
    }
    return 'app';
  }, []);

  // 3. Initialize Package Name
  useEffect(() => {
    if (appData) {
        let initialPkg = appData.package_name;
        if (!initialPkg || initialPkg.length < 3) {
             const slug = generateSlug(appData.name, appData.website_url);
             initialPkg = `com.app.${slug}`;
        }
        setPackageName(initialPkg.toLowerCase());
    }
  }, [appData, generateSlug]);

  // 4. Sync Builds to Monitor State with Stale Check
  useEffect(() => {
      const STALE_TIMEOUT = 2 * 60 * 60 * 1000; // 2 hours
      const now = Date.now();

      if (allBuilds && allBuilds.length > 0) {
         // Find latest Android active/last
         const latestAndroid = allBuilds.find((b: any) => b.platform === 'android');
         if (latestAndroid) {
             let status = latestAndroid.status;
             let progress = latestAndroid.progress || 0;

             // Check for stale builds (older than 2h and still running)
             if ((status === 'building' || status === 'queued') && latestAndroid.created_at) {
                 const createdTime = new Date(latestAndroid.created_at).getTime();
                 if (now - createdTime > STALE_TIMEOUT) {
                     status = 'failed'; // Force failed visually
                     progress = 0;
                 }
             }

             setAndroidBuild(prev => ({
                 ...prev,
                 id: latestAndroid.id,
                 status: status,
                 progress: progress,
                 downloadUrl: latestAndroid.download_url,
                 format: latestAndroid.build_format,
                 runId: latestAndroid.github_run_id
             }));
         }

         // Find latest iOS active/last
         const latestIos = allBuilds.find((b: any) => b.platform === 'ios');
         if (latestIos) {
             let status = latestIos.status;
             let progress = latestIos.progress || 0;

             // Check for stale builds (older than 2h and still running)
             if ((status === 'building' || status === 'queued') && latestIos.created_at) {
                 const createdTime = new Date(latestIos.created_at).getTime();
                 if (now - createdTime > STALE_TIMEOUT) {
                     status = 'failed'; // Force failed visually
                     progress = 0;
                 }
             }

             setIosBuild(prev => ({
                 ...prev,
                 id: latestIos.id,
                 status: status,
                 progress: progress,
                 downloadUrl: latestIos.download_url,
                 format: latestIos.build_format,
                 runId: latestIos.github_run_id
             }));
         }
      }
  }, [allBuilds]);

  // 5. Auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
       if (data.session?.user) setUser(data.session.user);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // --- ACTIONS ---

  const handleStartBuild = async (format: 'apk' | 'aab' | 'ipa' | 'ios_source' | 'source') => {
    if (!user || !appData) return;

    // Optimistic Update
    const isAndroid = format === 'apk' || format === 'aab' || format === 'source';
    const optimisticState: BuildState = { 
        id: null, status: 'queued', progress: 0, downloadUrl: null, format, runId: null 
    };
    if (isAndroid) setAndroidBuild(optimisticState);
    else setIosBuild(optimisticState);

    try {
        const cfg = appData.config || {};
        const res = await fetch('/api/build', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                appId,
                userId: user.id,
                appName: appData.name,
                websiteUrl: appData.website_url,
                iconUrl: appData.icon_url,
                buildFormat: format,
                notificationEmail: appData.notification_email,
                packageName: appData.package_name,
                versionName: appData.version_name || cfg.versionName || '1.0.0',
                versionCode: appData.version_code || cfg.versionCode || 1,
                // ... (Passing extensive config as in original) ...
                primaryColor: appData.primary_color || cfg.primaryColor || '#000000',
                secondaryColor: cfg.secondaryColor || '#6b7280',
                themeMode: cfg.themeMode || 'system',
                statusBarStyle: cfg.statusBarStyle || 'auto',
                statusBarColor: cfg.statusBarColor || 'transparent',
                orientation: appData.orientation || cfg.orientation || 'auto',
                splashScreen: cfg.showSplashScreen ?? false,
                splashColor: cfg.splashColor || '#FFFFFF',
                splashAnimation: cfg.splashAnimation || 'fade',
                navigation: appData.navigation ?? cfg.showNavBar ?? true,
                pullToRefresh: appData.pull_to_refresh ?? cfg.enablePullToRefresh ?? true,
                enableZoom: appData.enable_zoom ?? cfg.enableZoom ?? false,
                keepAwake: appData.keep_awake ?? cfg.keepAwake ?? false,
                openExternalLinks: appData.open_external_links ?? cfg.openExternalLinks ?? true,
                loadingIndicator: cfg.loadingIndicator ?? true,
                loadingColor: cfg.loadingColor || '',
                userAgent: cfg.userAgent || '',
                offlineMode: cfg.offlineMode ?? false,
                offlinePage: cfg.offlinePage || '',
                cacheStrategy: cfg.cacheStrategy || 'basic',
                enablePushNotifications: cfg.enablePushNotifications ?? false,
                pushProvider: cfg.pushProvider || 'firebase',
                firebaseProjectId: cfg.firebaseProjectId || '',
                oneSignalAppId: cfg.oneSignalAppId || '',
                notificationSound: cfg.notificationSound ?? true,
                notificationBadge: cfg.notificationBadge ?? true,
                enableAnalytics: cfg.enableAnalytics ?? false,
                analyticsProvider: cfg.analyticsProvider || 'firebase',
                firebaseAnalyticsId: cfg.firebaseAnalyticsId || '',
                enableCrashReporting: cfg.enableCrashReporting ?? false,
                crashReportingProvider: cfg.crashReportingProvider || 'firebase',
                sentryDsn: cfg.sentryDsn || '',
                enableBiometric: cfg.enableBiometric ?? false,
                biometricPromptTitle: cfg.biometricPromptTitle || '',
                enableGoogleLogin: cfg.enableGoogleLogin ?? false,
                googleClientId: cfg.googleClientId || '',
                enableAppleLogin: cfg.enableAppleLogin ?? false,
                enableFacebookLogin: cfg.enableFacebookLogin ?? false,
                facebookAppId: cfg.facebookAppId || '',
                enableCamera: cfg.enableCamera ?? false,
                enableQRScanner: cfg.enableQRScanner ?? false,
                enableFilePicker: cfg.enableFilePicker ?? false,
                enableHaptics: cfg.enableHaptics ?? false,
                hapticStyle: cfg.hapticStyle || 'medium',
                enableDeepLinks: cfg.enableDeepLinks ?? false,
                deepLinkScheme: cfg.deepLinkScheme || '',
                enableUniversalLinks: cfg.enableUniversalLinks ?? false,
                universalLinkDomain: cfg.universalLinkDomain || '',
                enableAppRating: cfg.enableAppRating ?? false,
                appRatingDaysBeforePrompt: cfg.appRatingDaysBeforePrompt || 7,
                appRatingMinSessions: cfg.appRatingMinSessions || 5,
                enableIAP: cfg.enableIAP ?? false,
                iapProvider: cfg.iapProvider || 'revenuecat',
                revenueCatApiKey: cfg.revenueCatApiKey || '',
                enableCertPinning: cfg.enableCertPinning ?? false,
                pinnedCertHosts: cfg.pinnedCertHosts || '',
                enableRootDetection: cfg.enableRootDetection ?? false,
                enableScreenshotProtection: cfg.enableScreenshotProtection ?? false,
                enableNativeNav: cfg.enableNativeNav ?? false,
                nativeTabs: cfg.nativeTabs || [],
                tabBarPosition: cfg.tabBarPosition || 'bottom',
                tabBarStyle: cfg.tabBarStyle || 'labeled',
                linkRules: cfg.linkRules || [],
                privacyPolicyUrl: cfg.privacyPolicyUrl || '',
                termsOfServiceUrl: cfg.termsOfServiceUrl || '',
                enableGDPR: cfg.enableGDPR ?? false,
                enableATT: cfg.enableATT ?? false,
                dataCollectionPurpose: cfg.dataCollectionPurpose || '',
                shortDescription: appData.short_description || cfg.shortDescription || '',
                fullDescription: appData.full_description || cfg.fullDescription || '',
                keywords: appData.keywords || cfg.keywords || '',
                appCategory: appData.app_category || cfg.appCategory || 'utilities',
                contentRating: appData.content_rating || cfg.contentRating || 'everyone',
                appSubtitle: appData.app_subtitle || cfg.appSubtitle || '',
                customCSS: cfg.customCSS || '',
                customJS: cfg.customJS || '',
                customHeaders: cfg.customHeaders || '',
                enableJSBridge: cfg.enableJSBridge ?? true,
                debugMode: cfg.debugMode ?? false,
            })
        });
        
        const json = await res.json();
        
        if (!res.ok) {
            alert(json.error || 'Build failed to start');
            if (isAndroid) setAndroidBuild(prev => ({ ...prev, status: 'failed' }));
            else setIosBuild(prev => ({ ...prev, status: 'failed' }));
        } else if (json.buildId) {
            const realState: BuildState = { 
                id: json.buildId, status: 'queued', progress: 0, downloadUrl: null, format, runId: null 
            };
            if (isAndroid) setAndroidBuild(realState);
            else setIosBuild(realState);
            
            // Invalidate query to trigger immediate polling
            queryClient.invalidateQueries({ queryKey: ['builds', appId] });
        }
    } catch (e) {
        console.error(e);
        alert("Network error");
    }
  };

  const handleCancelBuild = async (buildId: string) => {
      const targetIsAndroid = androidBuild.id === buildId;
      if (targetIsAndroid) setAndroidBuild(prev => ({ ...prev, status: 'cancelled' }));
      else setIosBuild(prev => ({ ...prev, status: 'cancelled' }));

      await fetch('/api/build/cancel', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ buildId })
      });
  };

  const handleDownload = (buildId: string) => {
      window.location.href = `/api/download?id=${buildId}&type=build`;
  };

  const handleDeleteBuild = async (buildId: string) => {
      const { error } = await supabase
        .from('app_builds')
        .delete()
        .eq('id', buildId);
        
      if (error) {
          console.error("Delete failed", error);
          alert("Failed to delete build.");
      }
  };

  const handleSavePackageName = async (newName: string) => {
    let valid = newName.toLowerCase().replace(/[^a-z0-9_.]/g, '');
    if (!valid.includes('.')) valid = `com.app.${valid}`;
    
    if (!validatePackageName(valid)) {
        alert("Invalid Package ID. Format: com.company.app");
        return false;
    }
    setPackageName(valid);
    await supabase.from('apps').update({ package_name: valid }).eq('id', appId);
    return true;
  };

  // Only show the full screen loader if we have NO data at all (first load on new device)
  if (isQueryLoading && !appData) {
     return <DashboardLoader />;
  }

  // If query errored and we have no cache
  if (!appData && !isQueryLoading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#F6F8FA]">
        <h1 className="text-2xl font-bold mb-4">App Not Found</h1>
        <Button onClick={() => router.push('/')} variant="outline">Back Home</Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-full bg-[#F6F8FA] text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900 overflow-hidden">
      <div className="flex flex-col h-full w-full animate-page-enter relative z-10">
        
        {/* Header */}
        <header className="relative z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shrink-0">
          <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
             <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 shadow-md rounded-xl overflow-hidden bg-white border border-gray-100">
                  {appData?.icon_url ? (<img src={appData.icon_url} alt="Icon" className="h-full w-full object-cover" />) : (<img src="https://res.cloudinary.com/ddsogd7hv/image/upload/v1770576910/Icon_oigxxc.png" alt="Logo" className="h-full w-full p-1" />)}
                </div>
                <div><h1 className="text-lg font-bold text-slate-900 leading-none tracking-tight">{appData?.name || 'My App'}</h1></div>
             </div>
             
             {/* RIGHT SIDE HEADER CONTROLS */}
             <div className="flex items-center gap-3">
                {user ? <UserMenu initialUser={user} /> : (
                    <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
                )}
             </div>
          </div>
        </header>

        {/* Content */}
        <main className="relative z-10 flex-1 w-full overflow-y-auto px-6 py-8 flex flex-col items-center custom-scrollbar">
          <div className="max-w-3xl w-full space-y-6 pb-32">
            
            <div className="text-center mb-6">
              <h2 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Release Management</h2>
              <p className="text-slate-500">Manage your Android & iOS builds independently.</p>
            </div>

            {/* Top Monitor (Cards) */}
            <BuildMonitor 
              androidState={androidBuild}
              iosState={iosBuild}
              onStartBuild={handleStartBuild}
              onCancelBuild={handleCancelBuild}
              packageName={packageName}
              onSavePackageName={handleSavePackageName}
            />

            {/* Bottom History */}
            {isBuildsLoading && allBuilds.length === 0 ? (
                // Only show skeletons if no cached history exists
                <div className="space-y-3 mt-8">
                    <div className="h-6 w-40 bg-gray-200 rounded mb-4 animate-pulse"></div>
                    <div className="h-20 w-full bg-white rounded-xl border border-gray-100 animate-pulse"></div>
                    <div className="h-20 w-full bg-white rounded-xl border border-gray-100 animate-pulse"></div>
                </div>
            ) : (
                <BuildHistory
                   builds={allBuilds}
                   onDownload={handleDownload}
                   onDelete={handleDeleteBuild}
                   packageName={packageName}
                />
            )}

          </div>
        </main>
      </div>

      {/* Floating Dock (Dynamic Island Style) */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 fade-in duration-700">
         <div className="flex items-center p-1.5 gap-2 bg-[#0B0F17]/90 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl shadow-black/40">
            
            {/* Edit Design Button (Primary) */}
            <Link 
              href={`/builder?id=${appId}`}
              prefetch={true} // Ensure Next.js prefetches the builder page
              className="h-11 px-6 bg-white hover:bg-emerald-400 text-black rounded-full flex items-center gap-2 transition-all hover:scale-105 active:scale-95 group font-bold text-xs"
            >
               <ChevronLeft size={14} className="opacity-50" />
               <span className="whitespace-nowrap">Edit Design</span>
               <Palette size={16} className="group-hover:rotate-12 transition-transform duration-300" />
            </Link>

            <div className="h-5 w-px bg-white/10"></div>

            {/* History & Logs Button */}
            <button 
               onClick={() => setIsAnalyticsOpen(true)}
               className="h-11 px-5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2 text-xs font-bold"
            >
               <BarChart2 size={16} className="text-slate-400" />
               History
            </button>

         </div>
      </div>

      <BuildsAnalyticsModal 
        isOpen={isAnalyticsOpen} 
        onClose={() => setIsAnalyticsOpen(false)} 
        appId={appId} 
      />
    </div>
  );
}
