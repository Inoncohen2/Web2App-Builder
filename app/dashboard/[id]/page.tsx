
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '../../../supabaseClient';
import { triggerAppBuild } from '../../actions/build';
import { Button } from '../../../components/ui/Button';
import { LoaderCircle, Settings, SlidersHorizontal, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { UserMenu } from '../../../components/UserMenu';
import { BuildMonitor } from '../../../components/BuildMonitor';

// Helper for strict validation
const validatePackageName = (name: string): boolean => {
  if (!name.includes('.')) return false;
  const regex = /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/;
  if (!regex.test(name)) return false;
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
  const [lastBuildFormat, setLastBuildFormat] = useState<'apk' | 'aab'>('apk');
  
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
  } | null>(null);
  
  // Build Flow State
  const [buildStatus, setBuildStatus] = useState<'idle' | 'building' | 'ready' | 'error'>('idle');
  const [activeRunId, setActiveRunId] = useState<string | number | null>(null);
  
  const [email, setEmail] = useState('');
  const [user, setUser] = useState<any>(null);

  // Set Theme Color to Black for Dashboard Page
  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', '#000000');
    else {
      const newMeta = document.createElement('meta');
      newMeta.name = 'theme-color';
      newMeta.content = '#000000';
      document.head.appendChild(newMeta);
    }
    document.body.style.backgroundColor = '#000000';
  }, []);

  // Initial Fetch
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
       if(data.user) {
         setUser(data.user);
         setEmail(data.user.email || '');
       }
    });

    async function fetchApp() {
      if (!appId) return;
      try {
        const { data, error } = await supabase
          .from('apps')
          .select('*')
          .eq('id', appId)
          .single();

        if (error || !data) {
          setNotFound(true);
        } else {
          setAppName(data.name);
          setWebsiteUrl(data.website_url || '');
          setAppIcon(data.config?.appIcon || null);
          setLastBuildFormat(data.build_format || 'apk');
          
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
          });

          const slug = generateSlug(data.name);
          
          let initialPkg = data.package_name || `com.app.${slug}`;
          if (!initialPkg.includes('.')) {
             initialPkg = `com.app.${initialPkg}`;
          }
          setPackageName(initialPkg.toLowerCase());

          if (data.notification_email && !email) setEmail(data.notification_email);

          if (data.status === 'failed') {
             setBuildStatus('error');
          } else if (data.apk_url) {
            setApkUrl(data.apk_url);
            setBuildStatus('ready');
          } else if (data.status === 'building') {
            setBuildStatus('building');
          }
        }
      } catch (e) {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    fetchApp();
  }, [appId]);

  // Fallback Polling Effect
  useEffect(() => {
    let intervalId: any;
    if (buildStatus === 'building') {
      intervalId = setInterval(async () => {
        try {
          const { data, error } = await supabase
            .from('apps')
            .select('status, apk_url, build_format')
            .eq('id', appId)
            .single();

          if (!error && data) {
            if (data.status === 'ready' && data.apk_url) {
              setApkUrl(data.apk_url);
              setLastBuildFormat(data.build_format || 'apk');
              setBuildStatus('ready');
            } else if (data.status === 'failed') {
              setBuildStatus('error');
            }
          }
        } catch (err) {
          console.error('Polling failed:', err);
        }
      }, 5000);
    }
    return () => { if (intervalId) clearInterval(intervalId); };
  }, [buildStatus, appId]);

  const generateSlug = (text: string) => {
    const englishOnly = text.replace(/[^a-zA-Z0-9\s]/g, '');
    const words = englishOnly.trim().split(/\s+/).filter(w => w.length > 0);
    return words.slice(0, 3).join('_').toLowerCase();
  };

  // Called from BuildMonitor when user saves a new ID
  const handlePackageUpdate = async (newPackageName: string) => {
      // 1. Basic cleanup
      let validName = newPackageName.toLowerCase().replace(/[^a-z0-9_.]/g, '');
      if (!validName.includes('.')) validName = `com.app.${validName}`;
      if (validName.startsWith('.')) validName = validName.substring(1);
      if (validName.endsWith('.')) validName = validName.slice(0, -1);

      if (!validatePackageName(validName)) {
        alert("Invalid Package Name. Must be formatted like: com.company.app");
        return false;
      }

      setPackageName(validName);
      
      // Save to DB
      const { error } = await supabase
        .from('apps')
        .update({ package_name: validName })
        .eq('id', appId);
        
      if (error) {
        alert("Failed to save package name.");
        return false;
      }
      return true;
  };

  const handleStartBuild = async (buildType: 'apk' | 'aab') => {
    const finalEmail = user ? user.email : email;

    if (!validatePackageName(packageName)) {
        alert("Package Name is invalid. Please edit it before building.");
        return;
    }

    setBuildStatus('building');
    setLastBuildFormat(buildType); // Optimistic update
    
    // Update DB
    await supabase.from('apps').update({ 
      status: 'building',
      package_name: packageName,
      build_format: buildType,
      name: appName,
      notification_email: finalEmail
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
          showSplashScreen: false,
          enableZoom: false,
          keepAwake: false,
          openExternalLinks: false,
          orientation: 'auto'
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

  const handleBuildComplete = (success: boolean) => {
      if (success) {
          setBuildStatus('ready');
      } else {
          setBuildStatus('error');
      }
  };

  const handleDownload = () => {
    if (!apkUrl) return;
    const downloadLink = `/api/download?id=${appId}`;
    window.location.href = downloadLink;
  };

  if (loading) {
     return (
       <div className="flex h-screen w-full items-center justify-center bg-black text-white animate-page-enter">
          <LoaderCircle className="animate-spin text-emerald-500" size={32} />
       </div>
     );
  }

  if (notFound) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-black text-white animate-page-enter">
        <h1 className="text-2xl font-bold mb-4">App Not Found</h1>
        <Button onClick={() => router.push('/')} variant="outline" className="border-zinc-800 text-white hover:bg-zinc-900">
           Back Home
        </Button>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-black text-zinc-100 font-sans selection:bg-emerald-900 selection:text-white flex flex-col relative overflow-hidden animate-page-enter">
       
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20" 
           style={{ 
             backgroundImage: 'radial-gradient(#3f3f46 1.5px, transparent 1.5px)', 
             backgroundSize: '24px 24px' 
           }}>
      </div>

      <header className="relative z-50 bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800 shrink-0">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 shadow-md rounded-xl overflow-hidden bg-zinc-900 border border-zinc-700">
                {appIcon ? (
                    <img src={appIcon} alt="App Icon" className="h-full w-full object-cover" />
                ) : (
                    <img src="https://res.cloudinary.com/ddsogd7hv/image/upload/v1770576910/Icon_oigxxc.png" alt="Logo" className="h-full w-full p-1" />
                )}
              </div>
              <div>
                <h1 className="text-lg font-bold text-white leading-none tracking-tight">{appName || 'My App'}</h1>
                <span className="text-[11px] text-zinc-500 font-mono mt-0.5 block">{packageName}</span>
              </div>
           </div>
           
           <div className="flex items-center gap-3">
              {user && <UserMenu />}
           </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 w-full overflow-y-auto px-6 py-8 flex flex-col items-center custom-scrollbar">
        <div className="max-w-6xl w-full space-y-8 pb-32">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800 pb-6">
            <div>
                <h2 className="text-3xl font-extrabold text-white tracking-tight">Release Management</h2>
                <p className="text-zinc-500 mt-1">Manage artifacts and build configurations.</p>
            </div>
          </div>

          <BuildMonitor 
            buildStatus={buildStatus}
            runId={activeRunId}
            onStartBuild={handleStartBuild}
            onDownload={handleDownload}
            onBuildComplete={handleBuildComplete}
            apkUrl={apkUrl}
            packageName={packageName}
            onPackageUpdate={handlePackageUpdate}
            lastBuildFormat={lastBuildFormat}
          />
        </div>
      </main>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-bottom-10 fade-in duration-700">
         <Link 
           href={`/builder?id=${appId}`}
           prefetch={true}
           className="h-14 px-8 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-2xl shadow-emerald-500/20 flex items-center gap-3 transition-transform hover:scale-105 active:scale-95 group border border-emerald-500/50"
         >
            <Settings size={20} className="group-hover:rotate-90 transition-transform duration-500" />
            <span className="font-bold text-sm">Edit Design</span>
         </Link>
      </div>
    </div>
  );
}
