
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
import { useAppData } from '../../../hooks/useAppData';

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

  // React Query Fetch (Populates cache immediately if coming from Builder)
  const { data: appData, isLoading: isQueryLoading, error: queryError } = useAppData(appId);

  // App Data State
  const [appName, setAppName] = useState('');
  const [packageName, setPackageName] = useState('');
  const [apkUrl, setApkUrl] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [appIcon, setAppIcon] = useState<string | null>(null);
  const [websiteUrl, setWebsiteUrl] = useState('');
  
  const [appConfig, setAppConfig] = useState<any>(null);
  
  // Build Flow State
  const [buildStatus, setBuildStatus] = useState<'idle' | 'building' | 'ready' | 'cancelled'>('idle');
  const [activeRunId, setActiveRunId] = useState<string | number | null>(null);
  const [currentBuildType, setCurrentBuildType] = useState<'apk' | 'aab' | 'source' | null>(null);
  const [buildProgress, setBuildProgress] = useState(0);
  const [buildMessage, setBuildMessage] = useState('Initializing build environment...');

  const [email, setEmail] = useState('');
  const [user, setUser] = useState<any>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);

  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', '#F6F8FA');
    document.body.style.backgroundColor = '#F6F8FA';
  }, []);

  const generateSlug = useCallback((text: string) => {
    const englishOnly = text.replace(/[^a-zA-Z0-9\s]/g, '');
    const words = englishOnly.trim().split(/\s+/).filter(w => w.length > 0);
    return words.slice(0, 3).join('_').toLowerCase();
  }, []);

  // Sync React Query Data to State
  useEffect(() => {
    if (appData) {
        setAppName(appData.name);
        setWebsiteUrl(appData.website_url || '');
        setAppIcon(appData.icon_url || appData.config?.appIcon || null);
        
        setAppConfig({
          primaryColor: appData.primary_color || '#000000',
          themeMode: appData.config?.themeMode || 'system',
          showNavBar: appData.navigation ?? appData.config?.showNavBar ?? true,
          enablePullToRefresh: appData.pull_to_refresh ?? appData.config?.enablePullToRefresh ?? true,
          showSplashScreen: appData.config?.showSplashScreen ?? true,
          orientation: appData.orientation || appData.config?.orientation || 'auto',
          enableZoom: appData.enable_zoom ?? appData.config?.enableZoom ?? false,
          keepAwake: appData.keep_awake ?? appData.config?.keepAwake ?? false,
          openExternalLinks: appData.open_external_links ?? appData.config?.openExternalLinks ?? true,
          splashColor: appData.config?.splashColor || '#FFFFFF',
          privacyPolicyUrl: appData.config?.privacyPolicyUrl || '',
          termsOfServiceUrl: appData.config?.termsOfServiceUrl || '',
        });

        if (appData.build_format) {
          setCurrentBuildType(appData.build_format);
        }

        let initialPkg = appData.package_name;
        if (!initialPkg || initialPkg.length < 3) {
             const slug = generateSlug(appData.name);
             initialPkg = `com.app.${slug}`;
        }
        if (!initialPkg.includes('.')) initialPkg = `com.app.${initialPkg}`;
        setPackageName(initialPkg.toLowerCase());
        
        if (appData.notification_email && !email) setEmail(appData.notification_email);

        if (appData.progress !== undefined) setBuildProgress(appData.progress);
        if (appData.build_message) setBuildMessage(appData.build_message);

        if ((appData.status === 'ready' || appData.status === 'completed') && (appData.apk_url || appData.download_url)) {
          setApkUrl(appData.download_url || appData.apk_url);
          setBuildStatus('ready');
        } else if (appData.status === 'building') {
          setBuildStatus('building');
        } else if (appData.status === 'cancelled') {
          setBuildStatus('cancelled');
        }
    } else if (queryError) {
        setNotFound(true);
    }
  }, [appData, queryError, email, generateSlug]);

  // Realtime & Auth subscription
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
       if(data.user) {
         setUser(data.user);
         setEmail(data.user.email || '');
       }
       setIsUserLoading(false);
    });

    const channel = supabase.channel(`app-${appId}`)
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'apps', filter: `id=eq.${appId}` },
      (payload) => {
        const newData = payload.new;
        if (newData.progress !== undefined) setBuildProgress(newData.progress);
        if (newData.build_message) setBuildMessage(newData.build_message);
        
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

    return () => { supabase.removeChannel(channel); };
  }, [appId]);

  const handleSavePackageName = async (newPackageName: string) => {
    let validName = newPackageName.toLowerCase().replace(/[^a-z0-9_.]/g, '');
    if (!validName.includes('.')) validName = `com.app.${validName}`;
    if (validName.startsWith('.')) validName = validName.substring(1);
    if (validName.endsWith('.')) validName = validName.slice(0, -1);

    if (!validatePackageName(validName)) {
      alert("Invalid Package ID. Must be format: com.company.app");
      return false;
    }
    setPackageName(validName);
    const { error } = await supabase.from('apps').update({ package_name: validName }).eq('id', appId);
    if (error) {
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
        appName, packageName, appId, websiteUrl, appIcon || '', 
        appConfig || {
          primaryColor: '#2196F3', themeMode: 'system', showNavBar: true, enablePullToRefresh: true,
          showSplashScreen: true, splashColor: '#FFFFFF', enableZoom: false, keepAwake: false,
          openExternalLinks: false, orientation: 'auto', privacyPolicyUrl: '', termsOfServiceUrl: ''
        },
        buildType, finalEmail
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
       await fetch('/api/build/cancel', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ appId })
       });
       setBuildStatus('cancelled');
       setBuildMessage('Build cancelled by user');
     } catch (e) {
       console.error("Cancel exception", e);
     }
  };

  const handleDownload = () => {
    if (!apkUrl) return;
    window.location.href = `/api/download?id=${appId}`;
  };

  if (isQueryLoading) {
     return (
       <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-[#F6F8FA] text-slate-900 animate-page-enter">
          <LoaderCircle className="animate-spin text-emerald-600" size={32} />
       </div>
     );
  }

  if (notFound || queryError) {
    return (
      <div className="fixed inset-0 w-full h-full flex flex-col items-center justify-center bg-[#F6F8FA] text-slate-900 animate-page-enter">
        <h1 className="text-2xl font-bold mb-4">App Not Found</h1>
        <Button onClick={() => router.push('/')} variant="outline" className="border-gray-300">Back Home</Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-full bg-[#F6F8FA] text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900 overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}></div>
      <div className="flex flex-col h-full w-full animate-page-enter relative z-10">
        <header className="relative z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shrink-0">
          <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
             <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 shadow-md rounded-xl overflow-hidden bg-white border border-gray-100">
                  {appIcon ? (<img src={appIcon} alt="App Icon" className="h-full w-full object-cover" />) : (<img src="https://res.cloudinary.com/ddsogd7hv/image/upload/v1770576910/Icon_oigxxc.png" alt="Logo" className="h-full w-full p-1" />)}
                </div>
                <div><h1 className="text-lg font-bold text-slate-900 leading-none tracking-tight">{appName || 'My App'}</h1></div>
             </div>
             <div className="flex items-center gap-3">
                {isUserLoading ? (
                   <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
                ) : user ? (
                   <UserMenu initialUser={user} />
                ) : null}
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
              onBuildComplete={() => {}}
              apkUrl={apkUrl}
              packageName={packageName}
              onSavePackageName={handleSavePackageName}
              currentBuildType={currentBuildType}
              buildProgress={buildProgress}
              buildMessage={buildMessage}
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
