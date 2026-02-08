
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '../../../supabaseClient';
import { triggerAppBuild } from '../../actions/build';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Label } from '../../../components/ui/Label';
import { 
  Download, Loader2, Rocket, Mail, 
  CheckCircle2, Box, AlertCircle, Settings2, 
  ChevronDown, ChevronUp, RefreshCw, Smartphone, 
  Settings, Zap, Terminal, Code2, Globe, Clock
} from 'lucide-react';
import { UserMenu } from '../../../components/UserMenu';

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
  const [lastBuilt, setLastBuilt] = useState<string | null>(null);
  
  // UI State
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isPackageNameEdited, setIsPackageNameEdited] = useState(false);
  
  // Build Flow State
  const [buildStatus, setBuildStatus] = useState<'idle' | 'building' | 'ready'>('idle');
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
          setLastBuilt(data.updated_at);
          
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

  // Polling Effect
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
            if (data.status === 'ready' || data.apk_url) {
              if (data.apk_url) setApkUrl(data.apk_url);
              setBuildStatus('ready');
              clearInterval(intervalId);
            }
          }
        } catch (err) {
          console.error('Polling failed:', err);
        }
      }, 10000);
    }
    return () => { if (intervalId) clearInterval(intervalId); };
  }, [buildStatus, appId]);

  const generateSlug = (text: string) => {
    const englishOnly = text.replace(/[^a-zA-Z0-9\s]/g, '');
    const words = englishOnly.trim().split(/\s+/).filter(w => w.length > 0);
    return words.slice(0, 3).join('_').toLowerCase();
  };

  const handleStartBuild = async () => {
    const finalEmail = user ? user.email : email;

    if (!packageName || packageName.length < 2) {
      alert("Please provide a valid Package ID.");
      setShowAdvanced(true);
      return;
    }

    setBuildStatus('building');
    
    await supabase.from('apps').update({ 
      status: 'building',
      package_name: packageName,
      name: appName,
      notification_email: finalEmail
    }).eq('id', appId);

    const response = await triggerAppBuild(appName, packageName, appId, websiteUrl, appIcon);
    
    if (!response.success) {
      alert('Build failed to start: ' + response.error);
      setBuildStatus('idle');
      await supabase.from('apps').update({ status: 'idle' }).eq('id', appId);
    }
  };

  const handleDownload = () => {
    if (!apkUrl) return;
    const downloadLink = `/api/download?id=${appId}`;
    window.open(downloadLink, '_blank');
  };

  if (loading) {
     return (
       <div className="flex h-screen w-full items-center justify-center bg-black text-white bg-dot-pattern">
          <div className="flex flex-col items-center gap-4">
             <Loader2 className="animate-spin text-white" size={32} />
             <p className="text-sm font-mono text-gray-500">Initializing...</p>
          </div>
       </div>
     );
  }

  if (notFound) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-black text-white bg-dot-pattern">
        <h1 className="text-2xl font-bold mb-4">App Not Found</h1>
        <Button onClick={() => router.push('/')} className="bg-white text-black hover:bg-gray-200">
           Back Home
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-black text-white font-sans flex flex-col relative overflow-hidden bg-dot-pattern">
       
      {/* Header */}
      <header className="relative z-50 bg-black/50 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
           <div className="flex items-center gap-4 cursor-pointer" onClick={() => router.push('/builder?id=' + appId)}>
              <div className="relative h-10 w-10 shadow-lg rounded-xl overflow-hidden border border-white/10 group">
                {appIcon ? (
                    <img src={appIcon} alt="App Icon" className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                ) : (
                    <div className="h-full w-full bg-white/10 flex items-center justify-center">
                       <Smartphone size={20} className="text-gray-400" />
                    </div>
                )}
              </div>
              <div>
                <h1 className="text-lg font-bold text-white leading-none tracking-tight flex items-center gap-2">
                   {appName} 
                   <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-gray-400 font-mono">v1.0.0</span>
                </h1>
                <span className="text-[11px] text-gray-500 font-medium uppercase tracking-wider flex items-center gap-1">
                   <Globe size={10} /> {new URL(websiteUrl).hostname}
                </span>
              </div>
           </div>
           
           <div className="flex items-center gap-3">
              <Button 
                 onClick={() => router.push(`/builder?id=${appId}`)}
                 variant="ghost" 
                 size="sm" 
                 className="hidden sm:flex text-gray-400 hover:text-white hover:bg-white/10 gap-2 border border-white/5"
              >
                 <Settings size={14} /> Configure
              </Button>
              <div className="h-6 w-px bg-white/10 hidden sm:block"></div>
              {user && <UserMenu />}
           </div>
        </div>
      </header>

      <main className="relative z-10 py-12 px-6 flex-1 flex flex-col items-center">
        <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Build Status */}
            <div className="lg:col-span-2 space-y-6">
               
               {/* Terminal / Status Card */}
               <div className="rounded-2xl border border-white/10 bg-[#0A0A0A] overflow-hidden shadow-2xl relative">
                  <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                  
                  {/* Status Header */}
                  <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-black/50">
                     <div className="flex items-center gap-2">
                        <Terminal size={16} className="text-gray-400" />
                        <span className="text-sm font-mono text-gray-400">Build Console</span>
                     </div>
                     <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500/20 border border-green-500/50"></div>
                     </div>
                  </div>

                  {/* Status Body */}
                  <div className="p-8 min-h-[300px] flex flex-col items-center justify-center text-center relative">
                     {/* Scanline effect */}
                     <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-0 bg-[length:100%_4px,3px_100%] pointer-events-none opacity-20"></div>

                     {buildStatus === 'idle' && (
                        <div className="relative z-10 space-y-6 animate-in fade-in zoom-in duration-500">
                           <div className="mx-auto w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shadow-inner">
                              <Rocket size={32} className="text-white" />
                           </div>
                           <div>
                              <h2 className="text-2xl font-bold text-white mb-2">Ready to Compile</h2>
                              <p className="text-gray-500 max-w-sm mx-auto text-sm">
                                 Generate a native Android package (APK) directly from your current configuration.
                              </p>
                           </div>
                           <Button 
                              onClick={handleStartBuild}
                              className="h-12 px-8 bg-white text-black hover:bg-gray-200 hover:scale-105 transition-all font-bold rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                           >
                              Start Cloud Build
                           </Button>
                        </div>
                     )}

                     {buildStatus === 'building' && (
                        <div className="relative z-10 space-y-6 w-full max-w-md">
                           <div className="flex flex-col items-center gap-4">
                              <div className="relative">
                                 <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 animate-pulse"></div>
                                 <Loader2 size={48} className="animate-spin text-blue-400 relative z-10" />
                              </div>
                              <div className="text-center space-y-1">
                                 <h2 className="text-xl font-bold text-white">Compiling Assets...</h2>
                                 <p className="text-xs font-mono text-gray-500">Estimated time: ~2 minutes</p>
                              </div>
                           </div>
                           
                           {/* Fake Log Output */}
                           <div className="w-full bg-black/50 rounded-lg p-4 font-mono text-xs text-left space-y-1 border border-white/5 h-32 overflow-hidden flex flex-col justify-end">
                              <span className="text-gray-500">→ Initializing build environment...</span>
                              <span className="text-gray-500">→ Fetching assets from {new URL(websiteUrl).hostname}...</span>
                              <span className="text-gray-500">→ Validating configuration...</span>
                              <span className="text-blue-400 animate-pulse">→ Running gradle build task...</span>
                           </div>
                        </div>
                     )}

                     {buildStatus === 'ready' && (
                        <div className="relative z-10 space-y-6 animate-in fade-in zoom-in duration-500">
                           <div className="mx-auto w-24 h-24 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                              <CheckCircle2 size={40} className="text-green-500" />
                           </div>
                           <div>
                              <h2 className="text-3xl font-bold text-white mb-2">Build Complete</h2>
                              <p className="text-gray-400 max-w-xs mx-auto text-sm">
                                 Your APK is signed and ready for installation.
                              </p>
                           </div>
                           <div className="flex flex-col gap-3 w-full max-w-xs mx-auto">
                              <Button 
                                 onClick={handleDownload}
                                 className="h-12 w-full bg-white text-black hover:bg-gray-200 font-bold rounded-full flex items-center justify-center gap-2"
                              >
                                 <Download size={18} /> Download APK
                              </Button>
                              <Button 
                                 onClick={() => setBuildStatus('idle')}
                                 variant="ghost"
                                 className="h-10 w-full text-gray-500 hover:text-white"
                              >
                                 <RefreshCw size={14} className="mr-2" /> Rebuild
                              </Button>
                           </div>
                        </div>
                     )}
                  </div>
               </div>

               {/* Advanced Settings Dropdown */}
               <div className="rounded-xl border border-white/10 bg-[#0A0A0A] p-4">
                  <button 
                     onClick={() => setShowAdvanced(!showAdvanced)}
                     className="flex items-center justify-between w-full text-sm font-medium text-gray-400 hover:text-white transition-colors"
                  >
                     <div className="flex items-center gap-2">
                        <Settings2 size={16} /> Advanced Build Options
                     </div>
                     {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  
                  {showAdvanced && (
                     <div className="mt-4 pt-4 border-t border-white/5 space-y-4 animate-in fade-in slide-in-from-top-2">
                        <div className="space-y-2">
                           <Label className="text-xs text-gray-500">Package Name (ID)</Label>
                           <div className="flex items-center gap-2 bg-black/30 border border-white/10 rounded-lg px-3">
                              <span className="text-gray-500 text-sm font-mono">com.app.</span>
                              <input 
                                 className="bg-transparent border-none text-white text-sm font-mono focus:ring-0 flex-1 h-10 px-0 placeholder:text-gray-700"
                                 placeholder="my_app"
                                 value={packageName}
                                 onChange={(e) => {
                                    setPackageName(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''));
                                    setIsPackageNameEdited(true);
                                 }}
                              />
                           </div>
                        </div>
                        <div className="space-y-2">
                           <Label className="text-xs text-gray-500">Notification Email</Label>
                           <Input 
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="bg-black/30 border-white/10 text-white"
                              placeholder="you@example.com"
                           />
                        </div>
                     </div>
                  )}
               </div>
            </div>

            {/* Right Column: Info & Tips */}
            <div className="space-y-6">
               <div className="rounded-2xl border border-white/10 bg-[#0A0A0A] p-6 space-y-6">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                     <Box size={18} className="text-gray-400" /> App Manifest
                  </h3>
                  
                  <div className="space-y-4">
                     <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-sm text-gray-500">Target URL</span>
                        <div className="flex items-center gap-2 max-w-[150px]">
                           <span className="text-sm text-white truncate" title={websiteUrl}>{new URL(websiteUrl).hostname}</span>
                        </div>
                     </div>
                     <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-sm text-gray-500">Last Build</span>
                        <span className="text-sm text-white font-mono">
                           {lastBuilt ? new Date(lastBuilt).toLocaleDateString() : 'Never'}
                        </span>
                     </div>
                     <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-sm text-gray-500">Architecture</span>
                        <span className="text-sm text-white font-mono">Universal / x86</span>
                     </div>
                     <div className="flex justify-between items-center py-2 border-b border-white/5">
                        <span className="text-sm text-gray-500">Platform</span>
                        <span className="text-sm text-white flex items-center gap-1">
                           <span className="w-2 h-2 rounded-full bg-green-500"></span> Android
                        </span>
                     </div>
                  </div>
               </div>

               <div className="rounded-2xl border border-blue-900/30 bg-blue-900/10 p-5">
                  <div className="flex items-start gap-3">
                     <Zap className="text-blue-400 shrink-0 mt-1" size={18} />
                     <div>
                        <h4 className="text-sm font-bold text-blue-100">Pro Tip</h4>
                        <p className="text-xs text-blue-200/70 mt-1 leading-relaxed">
                           You can keep editing your app design while the build is running. The changes will be applied to the next build.
                        </p>
                     </div>
                  </div>
               </div>
            </div>

        </div>
      </main>
    </div>
  );
}
