'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '../../../supabaseClient';
import { triggerAppBuild } from '../../actions/build';
import { Button } from '../../../components/ui/Button';
import { LoaderCircle, Settings } from 'lucide-react';
import Link from 'next/link';
import { UserMenu } from '../../../components/UserMenu';
import { BuildMonitor, BuildState } from '../../../components/BuildMonitor';

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

  // App Data
  const [appName, setAppName] = useState('');
  const [packageName, setPackageName] = useState('');
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [appIcon, setAppIcon] = useState<string | null>(null);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState('');

  // Independent Build States
  const [apkState, setApkState] = useState<BuildState>({ status: 'idle', progress: 0, url: null, message: '' });
  const [androidSourceState, setAndroidSourceState] = useState<BuildState>({ status: 'idle', progress: 0, url: null, message: '' });
  const [iosSourceState, setIosSourceState] = useState<BuildState>({ status: 'idle', progress: 0, url: null, message: '' });
  
  // Configuration
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
  
  // Theme Color
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

  const fetchApp = useCallback(async () => {
    if (!appId) return;
    try {
      const { data, error } = await supabase
        .from('apps')
        .select('*')
        .eq('id', appId)
        .single();

      if (error || !data) {
        setNotFound(prev => prev || loading); 
      } else {
        setAppName(data.name);
        setWebsiteUrl(data.website_url || '');
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

        const slug = generateSlug(data.name);
        let initialPkg = data.package_name || `com.app.${slug}`;
        if (!initialPkg.includes('.')) {
             initialPkg = `com.app.${initialPkg}`;
        }
        setPackageName(initialPkg.toLowerCase());
        
        if (data.notification_email && !email) setEmail(data.notification_email);

        // Map Database Columns to Separate States
        
        // 1. APK State
        // Legacy support: check generic 'status' if 'apk_status' is null
        const rawApkStatus = data.apk_status || (['building', 'ready', 'failed'].includes(data.status) ? data.status : 'idle');
        setApkState({
            status: rawApkStatus,
            progress: data.apk_progress || (rawApkStatus === 'ready' ? 100 : 0),
            url: data.apk_url || data.download_url || null,
            message: data.build_message || ''
        });

        // 2. Android Source State
        setAndroidSourceState({
            status: data.source_status || 'idle',
            progress: data.source_progress || 0,
            url: data.source_url || null,
            message: data.build_message || ''
        });

        // 3. iOS Source State
        setIosSourceState({
            status: data.ios_source_status || 'idle',
            progress: data.ios_source_progress || 0,
            url: data.ios_source_url || null,
            message: data.build_message || ''
        });
      }
    } catch (e) {
      if(loading) setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [appId, generateSlug, email, loading]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
       if(data.user) {
         setUser(data.user);
         setEmail(data.user.email || '');
       }
    });

    fetchApp();

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
        
        // Update states independently based on changed columns
        
        if (newData.apk_status || newData.apk_progress || newData.apk_url) {
            setApkState(prev => ({
                ...prev,
                status: newData.apk_status || prev.status,
                progress: newData.apk_progress ?? prev.progress,
                url: newData.apk_url || prev.url,
                message: newData.build_message || prev.message
            }));
        }

        if (newData.source_status || newData.source_progress || newData.source_url) {
            setAndroidSourceState(prev => ({
                ...prev,
                status: newData.source_status || prev.status,
                progress: newData.source_progress ?? prev.progress,
                url: newData.source_url || prev.url,
                message: newData.build_message || prev.message
            }));
        }

        if (newData.ios_source_status || newData.ios_source_progress || newData.ios_source_url) {
            setIosSourceState(prev => ({
                ...prev,
                status: newData.ios_source_status || prev.status,
                progress: newData.ios_source_progress ?? prev.progress,
                url: newData.ios_source_url || prev.url,
                message: newData.build_message || prev.message
            }));
        }
        
        // Keep message synced generally
        if (newData.build_message) {
            const msg = newData.build_message;
            setApkState(p => ({...p, message: msg}));
            setAndroidSourceState(p => ({...p, message: msg}));
            setIosSourceState(p => ({...p, message: msg}));
        }
      }
    )
    .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };

  }, [appId, fetchApp]);

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
    let validName = newPackageName.toLowerCase().replace(/[^a-z0-9_.]/g, '');
    if (!validName.includes('.')) validName = `com.app.${validName}`;
    if (validName.startsWith('.')) validName = validName.substring(1);
    if (validName.endsWith('.')) validName = validName.slice(0, -1);

    if (!validatePackageName(validName)) {
      alert("Invalid Package ID. Must be format: com.company.app");
      return false;
    }

    setPackageName(validName);
    
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

  const handleStartBuild = async (buildType: 'apk' | 'aab' | 'source' | 'ios_source') => {
    const finalEmail = user ? user.email : email;

    // Optimistic Update
    if (buildType === 'apk' || buildType === 'aab') {
        setApkState(prev => ({ ...prev, status: 'building', progress: 0, message: 'Starting...' }));
    } else if (buildType === 'source') {
        setAndroidSourceState(prev => ({ ...prev, status: 'building', progress: 0, message: 'Starting...' }));
    } else if (buildType === 'ios_source') {
        setIosSourceState(prev => ({ ...prev, status: 'building', progress: 0, message: 'Starting...' }));
    }

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
    
    if (!response.success) {
      alert('Build failed to start: ' + (response.error || 'Unknown error'));
      // Revert status
      if (buildType === 'apk' || buildType === 'aab') setApkState(prev => ({ ...prev, status: 'idle' }));
      else if (buildType === 'source') setAndroidSourceState(prev => ({ ...prev, status: 'idle' }));
      else if (buildType === 'ios_source') setIosSourceState(prev => ({ ...prev, status: 'idle' }));
    }
  };

  const handleCancelBuild = async () => {
      // NOTE: Cancellation API currently cancels the *active* run ID. 
      // It might need updates to handle concurrent runs in future, but for now it attempts to cancel active GH action.
     try {
       await fetch('/api/build/cancel', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ appId })
       });
     } catch (e) {
       console.error("Cancel exception", e);
     }
  };

  if (loading) {
     return (
       <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-[#F6F8FA] text-slate-900 animate-page-enter">
          <LoaderCircle className="animate-spin text-emerald-600" size={32} />
       </div>
     );
  }

  if (notFound) {
    return (
      <div className="fixed inset-0 w-full h-full flex flex-col items-center justify-center bg-[#F6F8FA] text-slate-900 animate-page-enter">
        <h1 className="text-2xl font-bold mb-4">App Not Found</h1>
        <Button onClick={() => router.push('/')} variant="outline" className="border-gray-300">
           Back Home
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-full bg-[#F6F8FA] text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900 overflow-hidden">
       
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40" 
           style={{ 
             backgroundImage: 'radial-gradient(#cbd5e1 1.5px, transparent 1.5px)', 
             backgroundSize: '24px 24px' 
           }}>
      </div>

      <div className="flex flex-col h-full w-full animate-page-enter relative z-10">
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
              apkState={apkState}
              androidSourceState={androidSourceState}
              iosSourceState={iosSourceState}
              onStartBuild={handleStartBuild}
              onCancel={handleCancelBuild}
              packageName={packageName}
              onSavePackageName={handleSavePackageName}
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