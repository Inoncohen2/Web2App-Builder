
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '../../../supabaseClient';
import { triggerAppBuild } from '../../actions/build';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Label } from '../../../components/ui/Label';
import { Switch } from '../../../components/ui/Switch';
import { 
  Download, Loader2, Mail, 
  Settings, ChevronDown, ChevronUp, RefreshCw, 
  SlidersHorizontal, CheckCircle2, Box, Smartphone
} from 'lucide-react';
import Link from 'next/link';
import { UserMenu } from '../../../components/UserMenu';
import { BuildMonitor } from '../../../components/BuildMonitor';

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
  } | null>(null);
  
  // UI State
  const [showConfig, setShowConfig] = useState(false); // New state to toggle settings visibility
  const [isPackageNameEdited, setIsPackageNameEdited] = useState(false);
  
  // Build Flow State
  const [buildStatus, setBuildStatus] = useState<'idle' | 'building' | 'ready'>('idle');
  const [activeRunId, setActiveRunId] = useState<string | number | null>(null);
  
  const [email, setEmail] = useState('');
  const [user, setUser] = useState<any>(null);

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
          
          setAppConfig({
            primaryColor: data.primary_color || '#000000',
            themeMode: data.config?.themeMode || 'system',
            
            // Prefer new columns, fallback to config blob or default
            showNavBar: data.navigation ?? data.config?.showNavBar ?? true,
            enablePullToRefresh: data.pull_to_refresh ?? data.config?.enablePullToRefresh ?? true,
            showSplashScreen: data.config?.showSplashScreen ?? true,
            orientation: data.orientation || data.config?.orientation || 'auto',
            enableZoom: data.enable_zoom ?? data.config?.enableZoom ?? false,
            keepAwake: data.keep_awake ?? data.config?.keepAwake ?? false,
            openExternalLinks: data.open_external_links ?? data.config?.openExternalLinks ?? true,
          });

          const slug = generateSlug(data.name);
          setPackageName(data.package_name || slug);
          if (data.package_name) setIsPackageNameEdited(true);

          if (data.notification_email && !email) setEmail(data.notification_email);

          if (data.apk_url) {
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

  // Fallback Polling Effect (for apk_url when build finishes)
  useEffect(() => {
    let intervalId: any;
    if (buildStatus === 'building') {
      intervalId = setInterval(async () => {
        try {
          const { data, error } = await supabase
            .from('apps')
            .select('status, apk_url')
            .eq('id', appId)
            .single();

          if (!error && data) {
            if (data.status === 'ready' && data.apk_url) {
              setApkUrl(data.apk_url);
              setBuildStatus('ready');
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

  const handlePackageNameChange = (val: string) => {
    setIsPackageNameEdited(true);
    const sanitized = val.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setPackageName(sanitized);
  };

  const handleStartBuild = async (buildType: 'apk' | 'aab') => {
    const finalEmail = user ? user.email : email;

    if (!packageName || packageName.length < 2) {
      alert("Please check your Package Settings. A valid ID is required.");
      setShowConfig(true);
      return;
    }

    setBuildStatus('building');
    setShowConfig(false); // Auto close settings on build start
    
    // Update DB to show building status
    await supabase.from('apps').update({ 
      status: 'building',
      package_name: packageName,
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
          setBuildStatus('idle');
          alert("Build failed via GitHub Actions.");
      }
  };

  const handleDownload = () => {
    if (!apkUrl) return;
    const downloadLink = `/api/download?id=${appId}`;
    window.location.href = downloadLink;
  };

  if (loading) {
     return (
       <div className="flex h-screen w-full items-center justify-center bg-[#F6F8FA] text-slate-900">
          <Loader2 className="animate-spin text-indigo-600" size={32} />
       </div>
     );
  }

  if (notFound) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-[#F6F8FA] text-slate-900">
        <h1 className="text-2xl font-bold mb-4">App Not Found</h1>
        <Button onClick={() => router.push('/')} variant="outline" className="border-gray-300">
           Back Home
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#F6F8FA] text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900 flex flex-col relative overflow-hidden">
       
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40" 
           style={{ 
             backgroundImage: 'radial-gradient(#cbd5e1 1.5px, transparent 1.5px)', 
             backgroundSize: '24px 24px' 
           }}>
      </div>

      <header className="relative z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
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
                <h1 className="text-lg font-bold text-slate-900 leading-none tracking-tight">Dashboard</h1>
                <span className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">{appName}</span>
              </div>
           </div>
           
           <div className="flex items-center gap-3">
              {user && <UserMenu />}
           </div>
        </div>
      </header>

      <main className="relative z-10 py-12 px-6 flex-1 flex flex-col items-center">
        <div className="max-w-xl w-full space-y-8">
          
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Release Management</h2>
            <p className="text-slate-500">Manage your builds and deployments.</p>
          </div>

          {/* New Build Monitor Component */}
          <BuildMonitor 
            buildStatus={buildStatus}
            runId={activeRunId}
            onStartBuild={handleStartBuild}
            onDownload={handleDownload}
            onConfigure={() => setShowConfig(!showConfig)}
            onBuildComplete={handleBuildComplete}
            apkUrl={apkUrl}
          />

          {/* Collapsible Configuration Panel */}
          {showConfig && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-300">
               <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 relative">
                  <div className="flex items-center justify-between mb-4">
                     <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                        <SlidersHorizontal size={14} /> Configuration
                     </h3>
                     <button onClick={() => setShowConfig(false)} className="text-gray-400 hover:text-gray-600">
                        <ChevronUp size={18} />
                     </button>
                  </div>

                  <div className="space-y-4">
                     <div className="grid grid-cols-1 gap-4">
                        
                        {/* Only Package ID */}
                        <div className="space-y-2">
                           <Label className="text-xs font-bold text-gray-500">Package ID</Label>
                           <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2 border border-gray-200">
                              <span className="text-xs font-mono text-gray-400 select-none">com.app.</span>
                              <input
                                 value={packageName}
                                 onChange={(e) => handlePackageNameChange(e.target.value)}
                                 className="flex-1 font-mono text-xs bg-transparent border-none focus:ring-0 p-0"
                              />
                           </div>
                        </div>

                        {/* Email for guests */}
                        {!user && (
                           <div className="space-y-2">
                              <Label className="text-xs font-bold text-gray-500">Notification Email</Label>
                              <Input 
                                 value={email} 
                                 onChange={e => setEmail(e.target.value)}
                                 className="bg-gray-50"
                              />
                           </div>
                        )}
                     </div>
                  </div>
               </div>
            </div>
          )}

        </div>
      </main>

      {/* Fixed Centered Edit Design Button - Now using Link for Speed */}
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
