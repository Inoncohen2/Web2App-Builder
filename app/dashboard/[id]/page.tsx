
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
  Settings, Zap, Cog
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
  
  // UI State
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isPackageNameEdited, setIsPackageNameEdited] = useState(false);
  
  // Build Flow State
  const [buildStatus, setBuildStatus] = useState<'idle' | 'building' | 'ready'>('idle');
  const [email, setEmail] = useState('');
  const [user, setUser] = useState<any>(null);

  // Initial Fetch
  useEffect(() => {
    // Fetch User first
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
          
          // Generate initial package name from app name if not exists
          const slug = generateSlug(data.name);
          setPackageName(data.package_name || slug);
          if (data.package_name) setIsPackageNameEdited(true);

          // Restore email if previously saved AND not logged in (priority to logged in email)
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
      alert("Please provide a valid Package ID (at least 2 characters).");
      setShowAdvanced(true);
      return;
    }

    if (!finalEmail || !finalEmail.includes('@')) {
       alert("Please provide a valid email address for notifications.");
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

  const resetBuild = async () => {
    setBuildStatus('idle');
    await supabase.from('apps').update({ status: 'idle', apk_url: null }).eq('id', appId);
  };

  const handleDownload = () => {
    if (!apkUrl) return;
    
    const downloadLink = `/api/download?id=${appId}`;
    
    // Check if device is iOS (iPhone/iPad) to prevent PWA white screen issues
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    if (isIOS) {
      // iOS: Force open in new tab/browser to handle file download correctly
      window.open(downloadLink, '_blank');
    } else {
      // Android/Desktop: Navigate in same tab for seamless experience
      window.location.href = downloadLink;
    }
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
                    <img src="https://res.cloudinary.com/ddsogd7hv/image/upload/v1770338400/Icon_w1tqnd.png" alt="Logo" className="h-full w-full" />
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
        <div className="max-w-xl w-full">
          
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Release Management</h2>
            <p className="text-slate-500">Generate your Android AAB package ready for the Play Store.</p>
          </div>

          <div className="relative bg-white/60 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white/60 overflow-hidden ring-1 ring-black/5">
             <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-white/50 to-purple-50/50 pointer-events-none"></div>
             
             <div className="p-8 min-h-[480px] flex flex-col items-center justify-center relative z-10">
                
                {buildStatus === 'idle' && (
                  <form onSubmit={handleStartBuild} className="w-full space-y-6 animate-in fade-in zoom-in duration-300 relative z-10">
                    <div className="text-center mb-6">
                       {/* Factory Animation */}
                       <div className="relative h-24 w-24 mx-auto mb-4">
                          <div className="absolute inset-0 flex items-center justify-center">
                             <div className="h-16 w-16 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-2xl shadow-lg flex items-center justify-center z-10">
                                <Smartphone className="text-white h-8 w-8" />
                             </div>
                          </div>
                          {/* Orbiting Gears */}
                          <div className="absolute inset-0 animate-[spin_8s_linear_infinite]">
                             <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2">
                                <Cog className="text-slate-300 h-6 w-6 animate-[spin_4s_linear_infinite]" />
                             </div>
                             <div className="absolute bottom-0 right-1/4 translate-y-2">
                                <Cog className="text-slate-300 h-5 w-5 animate-[spin_3s_linear_infinite_reverse]" />
                             </div>
                          </div>
                          {/* Pulsing Ring */}
                          <div className="absolute inset-0 border-2 border-indigo-200 rounded-full animate-ping opacity-20"></div>
                       </div>
                       <h3 className="text-lg font-bold text-slate-800">Ready to Build</h3>
                       <p className="text-xs text-slate-500">Configure package details below</p>
                    </div>

                    <div className="space-y-5 bg-white/50 p-6 rounded-3xl border border-white/50 shadow-sm">
                      <div className="space-y-2">
                         <Label className="text-slate-500 text-[10px] font-bold uppercase tracking-wider ml-1">App Name</Label>
                         <Input 
                           value={appName} 
                           onChange={e => handleAppNameChange(e.target.value)}
                           className="bg-white border-transparent text-slate-900 focus:border-indigo-500 h-11 shadow-sm font-bold text-base"
                           placeholder="My Awesome App"
                           required
                         />
                      </div>
                      
                      {!user && (
                        <div className="space-y-2">
                           <Label className="text-slate-500 text-[10px] font-bold uppercase tracking-wider ml-1">Notify Email</Label>
                           <div className="relative">
                              <Mail className="absolute left-3 top-3.5 text-slate-400" size={18} />
                              <Input 
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="you@company.com"
                                className="pl-10 bg-white border-transparent text-slate-900 focus:border-indigo-500 h-11 shadow-sm font-medium"
                                required
                              />
                           </div>
                        </div>
                      )}

                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => setShowAdvanced(!showAdvanced)}
                          className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 hover:text-indigo-700 transition-colors ml-1 bg-indigo-50 px-3 py-1.5 rounded-full w-fit"
                        >
                          <Settings2 size={12} />
                          {showAdvanced ? 'Hide Advanced' : 'Edit Package ID'}
                          {showAdvanced ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        </button>

                        {showAdvanced && (
                          <div className="mt-3 animate-in fade-in slide-in-from-top-2">
                             <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-2">
                               <span className="text-xs font-mono text-slate-400 select-none font-medium pl-1">com.app.</span>
                               <input
                                  value={packageName}
                                  onChange={(e) => handlePackageNameChange(e.target.value)}
                                  placeholder="my_app_name"
                                  className="flex-1 font-mono text-xs h-8 bg-transparent border-none text-slate-900 focus:ring-0 placeholder:text-slate-300"
                                />
                             </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <Button className="w-full h-14 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white font-bold rounded-2xl mt-4 shadow-xl shadow-slate-900/20 transition-all hover:scale-[1.02] active:scale-[0.98] text-base group">
                       <Zap className="mr-2 group-hover:text-yellow-400 transition-colors" size={20} /> Start Build Process
                    </Button>
                  </form>
                )}

                {buildStatus === 'building' && (
                  <div className="w-full text-center animate-in fade-in slide-in-from-right duration-500 relative z-10">
                     <div className="relative mb-10">
                        <div className="h-32 w-32 rounded-full border-[6px] border-indigo-50 border-t-indigo-600 animate-spin mx-auto"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                           <Box size={40} className="text-indigo-600 animate-pulse" />
                        </div>
                     </div>
                     
                     <h3 className="text-2xl font-bold text-slate-900 mb-3">Building your App...</h3>
                     <p className="text-slate-500 mb-8 text-sm leading-relaxed max-w-xs mx-auto">
                       This process takes about 5-10 minutes. You can close this page, we'll notify you.
                     </p>
                     
                     {(email || user?.email) && (
                       <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 flex items-center gap-4 text-left max-w-sm mx-auto shadow-sm">
                          <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                             <CheckCircle2 size={20} className="text-emerald-600" />
                          </div>
                          <div>
                             <p className="text-sm font-bold text-emerald-800">We'll notify you!</p>
                             <p className="text-xs text-emerald-600 mt-0.5">Email sent to <strong>{user?.email || email}</strong> when done.</p>
                          </div>
                       </div>
                     )}
                  </div>
                )}

                {buildStatus === 'ready' && apkUrl && (
                  <div className="w-full text-center animate-in fade-in zoom-in duration-500 relative z-10">
                     <div className="h-28 w-28 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-100 shadow-xl shadow-emerald-500/10 relative">
                        <div className="absolute inset-0 rounded-full border-4 border-emerald-100 animate-ping opacity-20"></div>
                        <CheckCircle2 size={56} />
                     </div>

                     <h3 className="text-3xl font-extrabold text-slate-900 mb-3">It's Ready!</h3>
                     <p className="text-slate-500 mb-8">Your AAB package has been generated successfully.</p>
                     
                     <Button 
                       onClick={handleDownload}
                       className="w-full h-16 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-lg shadow-xl shadow-emerald-600/20 transform transition-transform hover:-translate-y-1"
                     >
                        <Download className="mr-3" size={24} /> Download AAB
                     </Button>
                     
                     <button onClick={resetBuild} className="mt-8 flex items-center justify-center gap-2 text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors w-full">
                        <RefreshCw size={14} /> Build new version
                     </button>
                  </div>
                )}
             </div>
          </div>
        </div>
      </main>

      {/* Floating Edit Button */}
      <div className="fixed bottom-8 right-8 z-40 animate-in slide-in-from-bottom-10 fade-in duration-700">
         <button 
           onClick={() => router.push(`/builder?id=${appId}`)}
           className="h-14 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-2xl shadow-slate-900/30 flex items-center gap-3 transition-transform hover:scale-105 active:scale-95 group border border-slate-700"
         >
            <Settings size={20} className="group-hover:rotate-90 transition-transform duration-500" />
            <span className="font-bold text-sm">Edit Design</span>
         </button>
      </div>
    </div>
  );
}
