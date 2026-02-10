
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
  Download, LoaderCircle, Mail, 
  Settings, ChevronDown, ChevronUp, RefreshCw, 
  SlidersHorizontal, CircleCheck, Box, Smartphone
} from 'lucide-react';
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
  } | null>(null);
  
  // UI State
  const [showConfig, setShowConfig] = useState(false); // New state to toggle settings visibility
  const [isPackageNameEdited, setIsPackageNameEdited] = useState(false);
  
  // Build Flow State
  const [buildStatus, setBuildStatus] = useState<'idle' | 'building' | 'ready'>('idle');
  const [activeRunId, setActiveRunId] = useState<string | number | null>(null);
  
  const [email, setEmail] = useState('');
  const [user, setUser] = useState<any>(null);

  // Set Theme Color to Light for Dashboard Page
  // Also enforce body background color to ensure safe area blending on iOS
  useEffect(() => {
    // 1. Meta Theme Color
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', '#F6F8FA');
    else {
      const newMeta = document.createElement('meta');
      newMeta.name = 'theme-color';
      newMeta.content = '#F6F8FA';
      document.head.appendChild(newMeta);
    }

    // 2. Body Background
    document.body.style.backgroundColor = '#F6F8FA';

    return () => {
       // Cleanup happens in the destination page effects
    };
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
          
          // Ensure we display a full package name format, even if DB is partial
          let initialPkg = data.package_name || `com.app.${slug}`;
          if (!initialPkg.includes('.')) {
             initialPkg = `com.app.${initialPkg}`;
          }
          // Force lowercase initialization
          setPackageName(initialPkg.toLowerCase());
          
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
    // Allow letters, numbers, underscores AND DOTS.
    const sanitized = val.toLowerCase().replace(/[^a-z0-9_.]/g, '');
    setPackageName(sanitized);
  };

  const handleStartBuild = async (buildType: 'apk' | 'aab') => {
    const finalEmail = user ? user.email : email;

    // --- Validation & Auto-Correction ---
    let validPackageName = packageName;
    
    // 1. Basic cleanup
    validPackageName = validPackageName.toLowerCase().replace(/[^a-z0-9_.]/g, '');

    // 2. Fix missing dots (Auto-prefix)
    if (!validPackageName.includes('.')) {
        validPackageName = `com.app.${validPackageName}`;
    }

    // 3. Remove leading/trailing dots
    if (validPackageName.startsWith('.')) validPackageName = validPackageName.substring(1);
    if (validPackageName.endsWith('.')) validPackageName = validPackageName.slice(0, -1);

    // 4. Validate Final Result
    if (!validatePackageName(validPackageName)) {
        alert("Package Name is invalid. Format must be: com.company.app (e.g., com.app.myshop)");
        setPackageName(validPackageName); // Update UI to show the sanitized attempt
        setShowConfig(true);
        return;
    }

    // Update state with the valid name
    setPackageName(validPackageName);
    // ------------------------------------

    setBuildStatus('building');
    setShowConfig(false); // Auto close settings on build start
    
    // Update DB to show building status
    await supabase.from('apps').update({ 
      status: 'building',
      package_name: validPackageName,
      name: appName,
      notification_email: finalEmail
    }).eq('id', appId);

    const response = await triggerAppBuild(
        appName, 
        validPackageName, 
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
    // Changed min-h-screen to h-screen to fix height to viewport
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
                {/* UPDATED HEADER TEXT */}
                <h1 className="text-lg font-bold text-slate-900 leading-none tracking-tight">{appName || 'My App'}</h1>
                <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">{packageName}</span>
              </div>
           </div>
           
           <div className="flex items-center gap-3">
              {user && <UserMenu />}
           </div>
        </div>
      </header>

      {/* 
         Main Content Area:
         - flex-1 to fill remaining height
         - overflow-y-auto to allow internal scrolling ONLY when content exceeds viewport
         - custom-scrollbar for aesthetics
      */}
      <main className="relative z-10 flex-1 w-full overflow-y-auto px-6 py-12 flex flex-col items-center custom-scrollbar">
        {/* pb-32 adds padding at bottom so floating button doesn't overlap content */}
        <div className="max-w-xl w-full space-y-8 pb-32">
          
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
                              <input
                                 value={packageName}
                                 onChange={(e) => handlePackageNameChange(e.target.value)}
                                 className="flex-1 font-mono text-xs bg-transparent border-none focus:ring-0 p-0"
                                 placeholder="com.company.app"
                              />
                           </div>
                           <p className="text-[10px] text-gray-400">Unique identifier (e.g. com.mycompany.myapp)</p>
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
