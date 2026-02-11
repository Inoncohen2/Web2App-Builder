
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '../../../supabaseClient';
import { triggerAppBuild } from '../../actions/build';
import { Button } from '../../../components/ui/Button';
import { LoaderCircle, Settings } from 'lucide-react';
import Link from 'next/link';
import { UserMenu } from '../../../components/UserMenu';
import { BuildMonitor } from '../../../components/BuildMonitor';

// Helper for strict validation
const validatePackageName = (name: string): boolean => {
  // חייב להכיל לפחות נקודה אחת
  if (!name.includes('.')) return false;
  
  // פורמט תקין: com.company.app (אותיות קטנות, מספרים, קו תחתון, מופרדים בנקודות)
  const regex = /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/;
  if (!regex.test(name)) return false;
  
  // לא מתחיל או נגמר בנקודה
  if (name.startsWith('.') || name.endsWith('.')) return false;
  
  return true;
};

export default function DashboardPage() {
  const params = useParams();
  const router = useRouter();
  const appId = params.id as string;

  // App Data State
  const [appName, setAppName] = useState('');
  const [packageName, setPackageName] = useState('');
  const [apkUrl, setApkUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [appIcon, setAppIcon] = useState<string | null>(null);
  const [websiteUrl, setWebsiteUrl] = useState('');
  
  const [appConfig, setAppConfig] = useState<{
    primaryColor: string;
    themeMode: string;
    showNavBar: boolean;
    enablePullToRefresh: boolean;
    showSplashScreen: boolean;
    orientation: string;
    enableZoom: boolean;
    keepAwake: boolean;
    openExternalLinks: boolean;
    splashColor: string;
    privacyPolicyUrl: string;
    termsOfServiceUrl: string;
  } | null>(null);
  
  // Build Flow State
  const [buildStatus, setBuildStatus] = useState<'idle' | 'building' | 'ready' | 'cancelled'>('idle');
  const [activeRunId, setActiveRunId] = useState<string | number | null>(null);
  const [currentBuildType, setCurrentBuildType] = useState<'apk' | 'aab' | 'source' | null>(null);
  
  // Realtime Build State
  const [buildProgress, setBuildProgress] = useState(0);
  const [buildMessage, setBuildMessage] = useState('Initializing build environment...');

  const [email, setEmail] = useState('');
  const [user, setUser] = useState<any>(null);

  // Set Theme Color to Light for Dashboard Page
  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', '#F6F8FA');
    else {
      const newMeta = document.createElement('meta');
      newMeta.name = 'theme-color';
      newMeta.content = '#F6F8FA';
      document.head.appendChild(newMeta);
    }
    document.body.style.backgroundColor = '#F6F8FA';
  }, []);

  const generateSlug = useCallback((text: string) => {
    const englishOnly = text.replace(/[^a-zA-Z0-9\s]/g, '');
    const words = englishOnly.trim().split(/\s+/).filter(w => w.length > 0);
    return words.slice(0, 3).join('_').toLowerCase();
  }, []);

  // Defined as useCallback to be used in multiple effects
  const fetchApp = useCallback(async () => {
    if (!appId) return;
    try {
      const { data, error } = await supabase
        .from('apps')
        .select('*')
        .eq('id', appId)
        .single();

      if (error || !data) {
        // Only set notFound if we are in the initial loading phase
        // to prevent flashing error screens during intermittent network issues on re-focus
        setNotFound(prev => prev || loading); 
      } else {
        setAppName(data.name);
        setWebsiteUrl(data.website_url || '');
        
        // Prioritize the top-level column for icon, fall back to config
        setAppIcon(data.icon_url || data.config?.appIcon || null);
        
        setAppConfig({
          primaryColor: data.primary_color || '#000000',
          themeMode: data.config?.themeMode || 'system',
          showNavBar: data.navigation ?? data.config?.showNavBar ?? true,
          enablePullToRefresh: data.pull_to_refresh ?? data.config?.enablePullToRefresh ?? true,
          showSplashScreen: data.config?.showSplashScreen ?? true,
          orientation: data.orientation || data.config?.orientation || 'auto',
          enableZoom: data.enable_zoom ?? data.config?.enableZoom ?? false,
          keepAwake: data.keep_awake ?? data.config?.keepAwake ?? false,
          openExternalLinks: data.open_external_links ?? data.config?.openExternalLinks ?? true,
          splashColor: data.config?.splashColor || '#FFFFFF',
          privacyPolicyUrl: data.config?.privacyPolicyUrl || '',
          termsOfServiceUrl: data.config?.termsOfServiceUrl || '',
        });

        if (data.build_format) {
          setCurrentBuildType(data.build_format);
        }

        const slug = generateSlug(data.name);
        let initialPkg = data.package_name || `com.app.${slug}`;
        if (!initialPkg.includes('.')) {
             initialPkg = `com.app.${initialPkg}`;
        }
        setPackageName(initialPkg.toLowerCase());
        
        if (data.notification_email && !email) setEmail(data.notification_email);

        // Update State
        if (data.progress !== undefined) setBuildProgress(data.progress);
        if (data.build_message) setBuildMessage(data.build_message);

        if ((data.status === 'ready' || data.status === 'completed') && (data.apk_url || data.download_url)) {
          setApkUrl(data.download_url || data.apk_url);
          setBuildStatus('ready');
        } else if (data.status === 'building') {
          setBuildStatus('building');
        } else if (data.status === 'cancelled') {
          setBuildStatus('cancelled');
        }
      }
    } catch (e) {
      if(loading) setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [appId, generateSlug, email, loading]);

  // Initial Fetch & Realtime Subscription
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
       if(data.user) {
         setUser(data.user);
         setEmail(data.user.email || '');
       }
    });

    fetchApp();

    // Setup Realtime Subscription
    const channel = supabase.channel(`app-${appId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'apps',
        filter: `id=eq.${appId}`,
      },
      (payload) => {
        const newData = payload.new;
        
        // Update Progress & Message
        if (newData.progress !== undefined) setBuildProgress(newData.progress);
        if (newData.build_message) setBuildMessage(newData.build_message);
        
        // Update Status
        if (newData.status === 'completed' || newData.status === 'ready') {
            setBuildStatus('ready');
            if (newData.download_url) setApkUrl(newData.download_url);
            else if (newData.apk_url) setApkUrl(newData.apk_url);
        } else if (newData.status === 'cancelled') {
            setBuildStatus('cancelled');
        } else if (newData.status === 'building') {
            setBuildStatus('building');
        }
      }
    )
    .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };

  }, [appId, fetchApp]);

  // Re-fetch data when the user returns to the tab/app
  // This ensures that if the OS suspended the browser or socket, we get the latest state immediately
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchApp();
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [fetchApp]);

  const handleSavePackageName = async (newPackageName: string) => {
    // 1. Basic cleanup
    let validName = newPackageName.toLowerCase().replace(/[^a-z0-9_.]/g, '');
    if (!validName.includes('.')) validName = `com.app.${validName}`;
    if (validName.startsWith('.')) validName = validName.substring(1);
    if (validName.endsWith('.')) validName = validName.slice(0, -1);

    if (!validatePackageName(validName)) {
      alert("Invalid Package ID. Must be format: com.company.app");
      return false;
    }

    setPackageName(validName);
    
    // Save to DB
    const { error } = await supabase
      .from('apps')
      .update({ package_name: validName })
      .eq('id', appId);
      
    if (error) {
      console.error('Failed to save package name', error);
      alert('Failed to save package name.');
      return false;
    }
    return true;
  };

  const handleStartBuild = async (buildType: 'apk' | 'aab' | 'source') => {
    const finalEmail = user ? user.email : email;

    setBuildStatus('building');
    setBuildProgress(0);
    setBuildMessage('Initializing build sequence...');
    setCurrentBuildType(buildType);
    
    // Update DB to show building status immediately
    await supabase.from('apps').update({ 
      status: 'building',
      package_name: packageName,
      name: appName,
      notification_email: finalEmail,
      build_format: buildType,
      progress: 0,
      build_message: 'Queued for build...'
    }).eq('id', appId);

    const response = await triggerAppBuild(
        appName, 
        packageName, 
        appId, 
        websiteUrl, 
        appIcon || '', 
        (appConfig as any) || {
          primaryColor: '#2196F3',
          themeMode: 'system',
          showNavBar: true,
          enablePullToRefresh: true,
          showSplashScreen: true,
          splashColor: '#FFFFFF',
          enableZoom: false,
          keepAwake: false,
          openExternalLinks: false,
          orientation: 'auto',
          privacyPolicyUrl: '',
          termsOfServiceUrl: ''
        },
        buildType,
        finalEmail
    );
    
    if (response.success && response.runId) {
      setActiveRunId(response.runId);
    } else {
      alert('Build failed to start: ' + (response.error || 'Unknown error'));
      setBuildStatus('idle');
      await supabase.from('apps').update({ status: 'idle' }).eq('id', appId);
    }
  };

  const handleCancelBuild = async () => {
     try {
       const res = await fetch('/api/build/cancel', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ appId })
       });
       
       if (res.ok) {
         setBuildStatus('cancelled');
         setBuildMessage('Build cancelled by user');
         setBuildProgress(0);
       } else {
         console.error("Failed to cancel build");
       }
     } catch (e) {
       console.error("Cancel exception", e);
     }
  };

  const handleBuildComplete = (success: boolean) => {
      if (success) {
          setBuildStatus('ready');
      } else {
          // If GitHub finishes with failure, we might get this. 
          // However, realtime subscription should handle 'failed' status as well.
          setBuildStatus('idle'); 
      }
  };

  const handleDownload = () => {
    if (!apkUrl) return;
    const downloadLink = `/api/download?id=${appId}`;
    window.location.href = downloadLink;
  };

  if (loading) {
     return (
       <div className="flex h-screen w-full items-center justify-center bg-[#F6F8FA] text-slate-900 animate-page-enter">
          <LoaderCircle className="animate-spin text-emerald-600" size={32} />
       </div>
     );
  }

  if (notFound) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-[#F6F8FA] text-slate-900 animate-page-enter">
        <h1 className="text-2xl font-bold mb-4">App Not Found</h1>
        <Button onClick={() => router.push('/')} variant="outline" className="border-gray-300">
           Back Home
        </Button>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-[#F6F8FA] text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900 flex flex-col relative overflow-hidden animate-page-enter">
       
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40" 
           style={{ 
             backgroundImage: 'radial-gradient(#cbd5e1 1.5px, transparent 1.5px)', 
             backgroundSize: '24px 24px' 
           }}>
      </div>

      <header className="relative z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shrink-0">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 shadow-md rounded-xl overflow-hidden bg-white border border-gray-100">
                {appIcon ? (
                    <img src={appIcon} alt="App Icon" className="h-full w-full object-cover" />
                ) : (
                    <img src="https://res.cloudinary.com/ddsogd7hv/image/upload/v1770576910/Icon_oigxxc.png" alt="Logo" className="h-full w-full p-1" />
                )}
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 leading-none tracking-tight">{appName || 'My App'}</h1>
                <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">{packageName}</span>
              </div>
           </div>
           
           <div className="flex items-center gap-3">
              {user && <UserMenu />}
           </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 w-full overflow-y-auto px-6 py-8 flex flex-col items-center custom-scrollbar">
        <div className="max-w-3xl w-full space-y-6 pb-32">
          
          <div className="text-center mb-6">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Release Management</h2>
            <p className="text-slate-500">Manage your builds and deployments.</p>
          </div>

          <BuildMonitor 
            buildStatus={buildStatus}
            runId={activeRunId}
            onStartBuild={handleStartBuild}
            onDownload={handleDownload}
            onCancel={handleCancelBuild}
            onBuildComplete={handleBuildComplete}
            apkUrl={apkUrl}
            packageName={packageName}
            onSavePackageName={handleSavePackageName}
            currentBuildType={currentBuildType}
            buildProgress={buildProgress}
            buildMessage={buildMessage}
          />

        </div>
      </main>

      {/* Floating Edit Design Button */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-bottom-10 fade-in duration-700">
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
