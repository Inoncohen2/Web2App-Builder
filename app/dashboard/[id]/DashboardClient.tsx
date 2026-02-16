
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../supabaseClient';
import { Button } from '../../../components/ui/Button';
import { LoaderCircle, Settings } from 'lucide-react';
import Link from 'next/link';
import { UserMenu } from '../../../components/UserMenu';
import { BuildMonitor, BuildState } from '../../../components/BuildMonitor';
import { BuildHistory } from '../../../components/BuildHistory';
import { useAppData } from '../../../hooks/useAppData';
import { useBuilds } from '../../../hooks/useBuilds';
import { useQueryClient } from '@tanstack/react-query';

// --- Loading Component (Internal) ---
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

  // 1. Fetch App Data (Cached via React Query)
  const { data: appData, isLoading: isQueryLoading, error: queryError } = useAppData(appId, initialData);

  // 2. Fetch Build Data (Cached via React Query + Realtime)
  const { data: allBuilds = [], isLoading: isBuildsLoading } = useBuilds(appId);

  // Local Monitor States (Derived from cached data + Optimistic UI)
  const [androidBuild, setAndroidBuild] = useState<BuildState>({
      id: null, status: 'idle', progress: 0, downloadUrl: null, format: null, runId: null
  });
  const [iosBuild, setIosBuild] = useState<BuildState>({
      id: null, status: 'idle', progress: 0, downloadUrl: null, format: null, runId: null
  });

  // App Config State
  const [packageName, setPackageName] = useState('');
  const [user, setUser] = useState<any>(null);
  
  // Note: We don't block UI for user loading anymore to ensure instant render.
  // Actions that require user ID will check if user exists before executing.

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

  // 4. Sync Builds to Monitor State (Runs whenever cache updates)
  useEffect(() => {
      if (allBuilds && allBuilds.length > 0) {
         // Find latest Android active/last
         const latestAndroid = allBuilds.find((b: any) => b.platform === 'android');
         if (latestAndroid) {
             setAndroidBuild(prev => ({
                 ...prev,
                 id: latestAndroid.id,
                 status: latestAndroid.status,
                 progress: latestAndroid.progress || 0,
                 downloadUrl: latestAndroid.download_url,
                 format: latestAndroid.build_format,
                 runId: latestAndroid.github_run_id
             }));
         }

         // Find latest iOS active/last
         const latestIos = allBuilds.find((b: any) => b.platform === 'ios');
         if (latestIos) {
             setIosBuild(prev => ({
                 ...prev,
                 id: latestIos.id,
                 status: latestIos.status,
                 progress: latestIos.progress || 0,
                 downloadUrl: latestIos.download_url,
                 format: latestIos.build_format,
                 runId: latestIos.github_run_id
             }));
         }
      }
  }, [allBuilds]);

  // 5. Auth (Non-blocking)
  useEffect(() => {
    // Try to get session from local storage first for speed
    supabase.auth.getSession().then(({ data }) => {
       if (data.session?.user) setUser(data.session.user);
    });
    
    // Also listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // --- ACTIONS ---

  const handleStartBuild = async (format: 'apk' | 'aab' | 'ipa' | 'ios_source' | 'source') => {
    if (!user || !appData) return;

    // Optimistic Update (Initial Queue)
    const isAndroid = format === 'apk' || format === 'aab' || format === 'source';
    const optimisticState: BuildState = { 
        id: null, status: 'queued', progress: 0, downloadUrl: null, format, runId: null 
    };
    if (isAndroid) setAndroidBuild(optimisticState);
    else setIosBuild(optimisticState);

    try {
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
                primaryColor: appData.primary_color,
                navigation: appData.navigation,
                pullToRefresh: appData.pull_to_refresh,
                orientation: appData.orientation,
                enableZoom: appData.enable_zoom,
                keepAwake: appData.keep_awake,
                openExternalLinks: appData.open_external_links,
                splashScreen: appData.config?.showSplashScreen,
                themeMode: appData.config?.themeMode
            })
        });
        
        const json = await res.json();
        
        if (!res.ok) {
            alert(json.error || 'Build failed to start');
            // Revert on failure
            if (isAndroid) setAndroidBuild(prev => ({ ...prev, status: 'failed' }));
            else setIosBuild(prev => ({ ...prev, status: 'failed' }));
        } else if (json.buildId) {
            // CRITICAL FIX: Immediately set the real ID so polling works instantly
            const realState: BuildState = { 
                id: json.buildId, status: 'queued', progress: 0, downloadUrl: null, format, runId: null 
            };
            if (isAndroid) setAndroidBuild(realState);
            else setIosBuild(realState);
            
            // Force fetch to sync global state
            queryClient.invalidateQueries({ queryKey: ['builds', appId] });
        }
    } catch (e) {
        console.error(e);
        alert("Network error");
    }
  };

  const handleCancelBuild = async (buildId: string) => {
      // Optimistic update
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

  // Only show full-screen loader if App Data (metadata) is missing.
  // We do NOT wait for builds or user auth to render the shell.
  if (isQueryLoading) {
     return <DashboardLoader />;
  }

  if (queryError) {
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
             <div className="flex items-center gap-3">
                {user ? <UserMenu initialUser={user} /> : (
                    <div className="h-8 w-20 bg-gray-200 rounded-full animate-pulse"></div>
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

            {/* Bottom History (Downloads) */}
            {isBuildsLoading && allBuilds.length === 0 ? (
                // Local Skeleton for history if no cached data exists
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
                />
            )}

          </div>
        </main>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 fade-in duration-700">
         <Link 
           href={`/builder?id=${appId}`}
           prefetch={true}
           className="h-14 px-8 bg-black hover:bg-black text-white rounded-full shadow-2xl shadow-black/20 flex items-center gap-3 transition-transform hover:scale-105 active:scale-95 group border border-gray-800"
         >
            <Settings size={20} className="group-hover:rotate-90 transition-transform duration-500" />
            <span className="font-bold text-sm">Edit Design</span>
         </Link>
      </div>
    </div>
  );
}
