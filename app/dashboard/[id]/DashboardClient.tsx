
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

  // 1. Fetch Basic App Data
  const { data: appData, isLoading: isQueryLoading, error: queryError } = useAppData(appId, initialData);

  // 2. Build States (Monitor)
  const [androidBuild, setAndroidBuild] = useState<BuildState>({
      id: null, status: 'idle', progress: 0, downloadUrl: null, format: null, runId: null
  });
  const [iosBuild, setIosBuild] = useState<BuildState>({
      id: null, status: 'idle', progress: 0, downloadUrl: null, format: null, runId: null
  });
  
  // 3. All Builds (History)
  const [allBuilds, setAllBuilds] = useState<any[]>([]);

  // App Config State
  const [packageName, setPackageName] = useState('');
  const [user, setUser] = useState<any>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);

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

  // 4. Initialize App Data
  useEffect(() => {
    if (appData) {
        // Set Package Name
        let initialPkg = appData.package_name;
        if (!initialPkg || initialPkg.length < 3) {
             const slug = generateSlug(appData.name, appData.website_url);
             initialPkg = `com.app.${slug}`;
        }
        setPackageName(initialPkg.toLowerCase());
    }
  }, [appData, generateSlug]);

  // 5. Fetch & Subscribe to Builds (app_builds table)
  useEffect(() => {
      // Fetch Latest Builds
      const fetchBuilds = async () => {
          const { data } = await supabase
            .from('app_builds')
            .select('*')
            .eq('app_id', appId)
            .order('created_at', { ascending: false });
          
          if (data) {
             setAllBuilds(data);

             // Find latest Android active/last
             const latestAndroid = data.find((b: any) => b.platform === 'android');
             if (latestAndroid) {
                 setAndroidBuild({
                     id: latestAndroid.id,
                     status: latestAndroid.status,
                     progress: latestAndroid.progress || 0,
                     downloadUrl: latestAndroid.download_url,
                     format: latestAndroid.build_format,
                     runId: latestAndroid.github_run_id
                 });
             }

             // Find latest iOS active/last
             const latestIos = data.find((b: any) => b.platform === 'ios');
             if (latestIos) {
                 setIosBuild({
                     id: latestIos.id,
                     status: latestIos.status,
                     progress: latestIos.progress || 0,
                     downloadUrl: latestIos.download_url,
                     format: latestIos.build_format,
                     runId: latestIos.github_run_id
                 });
             }
          }
      };
      
      fetchBuilds();

      // Realtime Subscription
      const channel = supabase.channel(`builds-${appId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'app_builds', filter: `app_id=eq.${appId}` },
        (payload) => handleRealtimeUpdate(payload.new, 'INSERT')
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'app_builds', filter: `app_id=eq.${appId}` },
        (payload) => handleRealtimeUpdate(payload.new, 'UPDATE')
      )
      .subscribe();

      return () => { supabase.removeChannel(channel); };

  }, [appId]);

  const handleRealtimeUpdate = (record: any, eventType: string) => {
     // Update All Builds List
     setAllBuilds(prev => {
         if (eventType === 'INSERT') return [record, ...prev];
         return prev.map(b => b.id === record.id ? record : b);
     });

     // Update Monitor State if it matches active record
     const newState: BuildState = {
         id: record.id,
         status: record.status,
         progress: record.progress,
         downloadUrl: record.download_url,
         format: record.build_format,
         runId: record.github_run_id
     };

     if (record.platform === 'android') {
         setAndroidBuild(newState);
     } else if (record.platform === 'ios') {
         setIosBuild(newState);
     }
  };

  // 6. Auth
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
       if(data.user) setUser(data.user);
       setIsUserLoading(false);
    });
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
            if (isAndroid) setAndroidBuild({ ...androidBuild, status: 'failed' });
            else setIosBuild({ ...iosBuild, status: 'failed' });
        }
    } catch (e) {
        console.error(e);
        alert("Network error");
    }
  };

  const handleCancelBuild = async (buildId: string) => {
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
      // Optimistic update
      setAllBuilds(prev => prev.filter(b => b.id !== buildId));
      
      const { error } = await supabase
        .from('app_builds')
        .delete()
        .eq('id', buildId);
        
      if (error) {
          console.error("Delete failed", error);
          // Revert optimistic update (could refetch, but simple alert is ok for now)
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
                {isUserLoading ? <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div> : user ? <UserMenu initialUser={user} /> : null}
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
            <BuildHistory 
               builds={allBuilds}
               onDownload={handleDownload}
               onDelete={handleDeleteBuild}
            />

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
