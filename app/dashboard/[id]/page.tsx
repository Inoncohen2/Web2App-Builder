'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '../../../supabaseClient';
import { triggerAppBuild } from '../../actions/build';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Label } from '../../../components/ui/Label';
import { 
  Download, Loader2, Mail, 
  CheckCircle2, Box, Settings2, 
  ChevronDown, ChevronUp, RefreshCw, Smartphone, 
  Settings, Zap, Cog
} from 'lucide-react';
import { UserMenu } from '../../../components/UserMenu';

export default function DashboardPage() {
  const params = useParams();
  const router = useRouter();
  const appId = params.id as string;

  const [appName, setAppName] = useState('');
  const [packageName, setPackageName] = useState('');
  const [apkUrl, setApkUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [appIcon, setAppIcon] = useState<string | null>(null);
  const [websiteUrl, setWebsiteUrl] = useState('');
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isPackageNameEdited, setIsPackageNameEdited] = useState(false);
  const [buildStatus, setBuildStatus] = useState<'idle' | 'building' | 'ready'>('idle');
  const [email, setEmail] = useState('');
  const [user, setUser] = useState<any>(null);

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
      }, 30000);
    }
    return () => { if (intervalId) clearInterval(intervalId); };
  }, [buildStatus, appId]);

  const generateSlug = (text: string) => {
    const englishOnly = text.replace(/[^a-zA-Z0-9\s]/g, '');
    const words = englishOnly.trim().split(/\s+/).filter(w => w.length > 0);
    return words.slice(0, 3).join('_').toLowerCase();
  };

  const handleAppNameChange = (val: string) => {
    setAppName(val);
    if (!isPackageNameEdited) {
      const slug = generateSlug(val);
      if (slug.length > 0) setPackageName(slug);
    }
  };

  const handlePackageNameChange = (val: string) => {
    setIsPackageNameEdited(true);
    const sanitized = val.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setPackageName(sanitized);
  };

  const handleStartBuild = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalEmail = user ? user.email : email;
    if (!packageName || packageName.length < 2) {
      alert("Please provide a valid Package ID.");
      setShowAdvanced(true);
      return;
    }
    if (!finalEmail || !finalEmail.includes('@')) {
       alert("Please provide a valid email.");
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
      alert('Build failed: ' + response.error);
      setBuildStatus('idle');
      await supabase.from('apps').update({ status: 'idle' }).eq('id', appId);
    }
  };

  const handleDownload = () => {
    if (!apkUrl) return;
    const downloadLink = `/api/download?id=${appId}`;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) window.open(downloadLink, '_blank');
    else window.location.href = downloadLink;
  };

  if (loading) {
     return <div className="flex h-screen w-full items-center justify-center bg-black"><Loader2 className="animate-spin text-white" size={32} /></div>;
  }

  if (notFound) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-black text-white">
        <h1 className="text-2xl font-bold mb-4">App Not Found</h1>
        <Button onClick={() => router.push('/')} variant="outline">Back Home</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-black text-white font-sans flex flex-col relative overflow-hidden">
       
      <div className="absolute inset-0 z-0 bg-grid-pattern opacity-20 pointer-events-none"></div>

      <header className="relative z-50 border-b border-zinc-800 bg-black/50 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center overflow-hidden">
                {appIcon ? (
                    <img src={appIcon} alt="App Icon" className="h-full w-full object-cover" />
                ) : (
                    <img src="https://res.cloudinary.com/ddsogd7hv/image/upload/v1770338400/Icon_w1tqnd.png" alt="Logo" className="h-6 w-6" />
                )}
              </div>
              <div>
                <h1 className="text-sm font-bold text-white">Dashboard</h1>
                <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">{appName}</span>
              </div>
           </div>
           {user && <UserMenu />}
        </div>
      </header>

      <main className="relative z-10 py-12 px-6 flex-1 flex flex-col items-center">
        <div className="max-w-md w-full">
          
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-white mb-2">Build Command Center</h2>
            <p className="text-zinc-500 text-sm">Generate your Android AAB package.</p>
          </div>

          <div className="bg-zinc-900/50 backdrop-blur-xl rounded-3xl border border-zinc-800 p-8 relative overflow-hidden">
             
             {buildStatus === 'idle' && (
                <form onSubmit={handleStartBuild} className="space-y-6 relative z-10">
                  <div className="text-center mb-6">
                      <div className="relative h-20 w-20 mx-auto mb-4 bg-zinc-800 rounded-full flex items-center justify-center border border-zinc-700">
                         <Smartphone className="text-white h-8 w-8" />
                         <div className="absolute inset-0 border border-white/20 rounded-full animate-ping opacity-20"></div>
                      </div>
                  </div>

                  <div className="space-y-4">
                    <Input 
                        label="App Name"
                        value={appName} 
                        onChange={e => handleAppNameChange(e.target.value)}
                        required
                    />
                    
                    {!user && (
                        <div className="space-y-2">
                           <Input 
                            label="Email for Notification"
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                           />
                        </div>
                    )}

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                        className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 hover:text-white transition-colors"
                      >
                        <Settings2 size={12} />
                        {showAdvanced ? 'Hide Advanced' : 'Package Settings'}
                        {showAdvanced ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                      </button>

                      {showAdvanced && (
                        <div className="mt-3 animate-in fade-in slide-in-from-top-2">
                           <div className="flex items-center gap-2 bg-black rounded-lg p-2 border border-zinc-800">
                             <span className="text-xs font-mono text-zinc-500 select-none pl-1">com.app.</span>
                             <input
                                value={packageName}
                                onChange={(e) => handlePackageNameChange(e.target.value)}
                                className="flex-1 font-mono text-xs h-8 bg-transparent border-none text-white focus:ring-0 placeholder:text-zinc-700"
                              />
                           </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button className="w-full h-12 bg-white text-black hover:bg-zinc-200 mt-4 font-bold">
                     <Zap className="mr-2" size={16} /> Start Build
                  </Button>
                </form>
             )}

             {buildStatus === 'building' && (
                <div className="text-center py-8">
                   <div className="relative mb-8">
                      <div className="h-24 w-24 rounded-full border-4 border-zinc-800 border-t-white animate-spin mx-auto"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                         <Box size={32} className="text-white animate-pulse" />
                      </div>
                   </div>
                   <h3 className="text-xl font-bold text-white mb-2">Building...</h3>
                   <p className="text-zinc-500 text-xs mb-6">Estimated time: 5-10 minutes.</p>
                   
                   {(email || user?.email) && (
                     <div className="bg-zinc-800/50 rounded-lg p-4 flex items-center gap-3 text-left">
                        <CheckCircle2 size={16} className="text-green-500" />
                        <p className="text-xs text-zinc-400">We'll email <strong>{user?.email || email}</strong> when ready.</p>
                     </div>
                   )}
                </div>
             )}

             {buildStatus === 'ready' && apkUrl && (
                <div className="text-center py-6">
                   <div className="h-20 w-20 bg-white text-black rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                      <CheckCircle2 size={40} />
                   </div>

                   <h3 className="text-2xl font-bold text-white mb-2">Build Complete</h3>
                   <p className="text-zinc-500 text-sm mb-8">Your app package is ready.</p>
                   
                   <Button 
                     onClick={handleDownload}
                     className="w-full h-12 bg-white text-black hover:bg-zinc-200 font-bold"
                   >
                      <Download className="mr-2" size={18} /> Download AAB
                   </Button>
                   
                   <button 
                     onClick={() => setBuildStatus('idle')}
                     className="mt-6 flex items-center justify-center gap-2 text-xs text-zinc-500 hover:text-white transition-colors w-full"
                   >
                      <RefreshCw size={12} /> New Build
                   </button>
                </div>
             )}
          </div>
        </div>
      </main>

      <div className="fixed bottom-8 right-8 z-40">
         <button 
           onClick={() => router.push(`/builder?id=${appId}`)}
           className="h-12 px-5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-full border border-zinc-700 shadow-xl flex items-center gap-2 transition-transform hover:scale-105 active:scale-95"
         >
            <Settings size={18} />
            <span className="font-bold text-xs">Edit Design</span>
         </button>
      </div>
    </div>
  );
}