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
  CheckCircle2, Clock, Smartphone, Edit3, Box,
  AlertCircle, Settings2, ChevronDown, ChevronUp, RefreshCw
} from 'lucide-react';

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
  
  // UI State
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isPackageNameEdited, setIsPackageNameEdited] = useState(false);
  
  // Build Flow State
  const [buildStatus, setBuildStatus] = useState<'idle' | 'building' | 'ready'>('idle');
  const [email, setEmail] = useState('');

  useEffect(() => {
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
          
          // Generate initial package name from app name if not exists
          const slug = generateSlug(data.name);
          setPackageName(data.package_name || slug);
          if (data.package_name) setIsPackageNameEdited(true);

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

  // Helper: Generate clean package name
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
    // Enforce valid format (lowercase, numbers, underscores)
    const sanitized = val.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setPackageName(sanitized);
  };

  const handleStartBuild = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!packageName || packageName.length < 2) {
      alert("Please provide a valid Package ID (at least 2 characters).");
      setShowAdvanced(true);
      return;
    }

    setBuildStatus('building');
    
    // Save the status and package name to DB
    await supabase.from('apps').update({ 
      status: 'building',
      package_name: packageName,
      name: appName // Update name in case it changed
    }).eq('id', appId);

    const response = await triggerAppBuild(appName, packageName, appId);
    
    if (!response.success) {
      alert('Build failed to start: ' + response.error);
      setBuildStatus('idle');
      await supabase.from('apps').update({ status: 'idle' }).eq('id', appId);
    } else {
      console.log('Build started, notifying:', email);
    }
  };

  const resetBuild = async () => {
    setBuildStatus('idle');
    await supabase.from('apps').update({ status: 'idle', apk_url: null }).eq('id', appId);
  };

  if (loading) {
     return (
       <div className="flex h-screen w-full items-center justify-center bg-[#0B0F17] text-white">
          <Loader2 className="animate-spin text-indigo-500" size={32} />
       </div>
     );
  }

  if (notFound) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-[#0B0F17] text-white">
        <h1 className="text-2xl font-bold mb-4">App Not Found</h1>
        <Button onClick={() => router.push('/')} variant="outline" className="border-white/20 text-white">
           Back Home
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#0B0F17] text-slate-300 font-sans selection:bg-indigo-500 selection:text-white flex flex-col">
       
      {/* Dynamic Background (Same as Landing/Builder) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-purple-600/10 blur-[100px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      </div>

      {/* Header */}
      <header className="relative z-50 border-b border-white/10 bg-[#0B0F17]/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="relative h-8 w-8">
                <div className="absolute inset-0 bg-indigo-500 blur opacity-50 rounded-lg"></div>
                <img 
                  src="https://res.cloudinary.com/ddsogd7hv/image/upload/v1770338400/Icon_w1tqnd.png" 
                  alt="Logo" 
                  className="relative h-full w-full rounded-lg"
                />
              </div>
              <div>
                <h1 className="text-lg font-bold text-white leading-none tracking-tight">Dashboard</h1>
                <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{appName}</span>
              </div>
           </div>
           
           <Button 
             variant="outline" 
             className="border-white/10 text-slate-300 hover:bg-white/5 hover:text-white gap-2 rounded-full px-4 h-9 text-xs"
             onClick={() => router.push(`/builder?id=${appId}`)}
           >
              <Edit3 size={14} /> Edit Design
           </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 py-16 px-6 flex-1 flex flex-col items-center">
        <div className="max-w-xl w-full">
          
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-2">Release Management</h2>
            <p className="text-slate-400">Generate your Android APK package ready for the Play Store.</p>
          </div>

          {/* RELEASE CARD */}
          <div className="relative bg-gradient-to-b from-white/10 to-white/5 rounded-[2rem] p-[1px] overflow-hidden shadow-2xl">
             <div className="bg-[#0F1219] rounded-[2rem] p-8 min-h-[420px] flex flex-col items-center justify-center relative">
                
                {/* Background Glow inside Card */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1/2 bg-indigo-500/5 blur-3xl pointer-events-none"></div>

                {/* State: IDLE (Form) */}
                {buildStatus === 'idle' && (
                  <form onSubmit={handleStartBuild} className="w-full space-y-6 animate-in fade-in zoom-in duration-300 relative z-10">
                    <div className="text-center mb-2">
                       <div className="h-14 w-14 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                          <Rocket size={28} />
                       </div>
                    </div>

                    <div className="space-y-5">
                      <div className="space-y-2">
                         <Label className="text-slate-300 text-xs font-bold uppercase tracking-wider ml-1">App Name</Label>
                         <Input 
                           value={appName} 
                           onChange={e => handleAppNameChange(e.target.value)}
                           className="bg-[#0B0F17] border-white/10 text-white focus:border-indigo-500 h-11"
                           placeholder="My Awesome App"
                           required
                         />
                      </div>
                      
                      <div className="space-y-2">
                         <Label className="text-slate-300 text-xs font-bold uppercase tracking-wider ml-1">Notify Email</Label>
                         <div className="relative">
                            <Mail className="absolute left-3 top-3.5 text-slate-500" size={16} />
                            <Input 
                              type="email"
                              value={email}
                              onChange={e => setEmail(e.target.value)}
                              placeholder="you@company.com"
                              className="pl-9 bg-[#0B0F17] border-white/10 text-white focus:border-indigo-500 h-11"
                              required
                            />
                         </div>
                      </div>

                      {/* Advanced Options Toggle */}
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => setShowAdvanced(!showAdvanced)}
                          className="flex items-center gap-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors ml-1"
                        >
                          <Settings2 size={12} />
                          {showAdvanced ? 'Hide Advanced Options' : 'Edit Package Name'}
                          {showAdvanced ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                        </button>

                        {showAdvanced && (
                          <div className="mt-3 animate-in fade-in slide-in-from-top-2 bg-white/5 p-3 rounded-xl border border-white/5">
                             <Label className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1 block">Internal Package ID</Label>
                             <div className="flex items-center gap-2">
                               <span className="text-xs font-mono text-slate-500 select-none">com.app.</span>
                               <Input
                                  value={packageName}
                                  onChange={(e) => handlePackageNameChange(e.target.value)}
                                  placeholder="my_app_name"
                                  className="font-mono text-xs h-8 bg-[#0B0F17] border-white/10 text-white focus:border-indigo-500"
                                />
                             </div>
                             <p className="text-[10px] text-slate-600 mt-1.5 leading-tight">
                               Unique ID for Android. Use lowercase letters, numbers, and underscores only.
                             </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <Button className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl mt-4 shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02]">
                       Start Build Process
                    </Button>
                  </form>
                )}

                {/* State: BUILDING (Progress) */}
                {buildStatus === 'building' && (
                  <div className="w-full text-center animate-in fade-in slide-in-from-right duration-500 relative z-10">
                     <div className="relative mb-8">
                        {/* Spinner Ring */}
                        <div className="h-24 w-24 rounded-full border-4 border-white/5 border-t-indigo-500 animate-spin mx-auto"></div>
                        {/* Icon in center */}
                        <div className="absolute inset-0 flex items-center justify-center">
                           <Box size={32} className="text-indigo-400 animate-pulse" />
                        </div>
                     </div>
                     
                     <h3 className="text-xl font-bold text-white mb-2">Building your App...</h3>
                     <p className="text-slate-400 mb-6 text-sm">This typically takes 5-10 minutes. <br/>You can safely close this tab.</p>
                     
                     {email && (
                       <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3 text-left max-w-xs mx-auto">
                          <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                             <CheckCircle2 size={16} className="text-emerald-400" />
                          </div>
                          <div>
                             <p className="text-sm font-bold text-emerald-400">Notification Active</p>
                             <p className="text-xs text-emerald-200/70">Email to <strong>{email}</strong> when done.</p>
                          </div>
                       </div>
                     )}
                  </div>
                )}

                {/* State: READY (Download) */}
                {buildStatus === 'ready' && apkUrl && (
                  <div className="w-full text-center animate-in fade-in zoom-in duration-500 relative z-10">
                     <div className="h-20 w-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                        <CheckCircle2 size={40} />
                     </div>

                     <h3 className="text-2xl font-bold text-white mb-2">Ready for Download!</h3>
                     <p className="text-slate-400 mb-8 max-w-xs mx-auto">Your APK has been generated successfully and is ready for installation.</p>

                     <Button 
                       onClick={() => window.open(apkUrl, '_blank')}
                       className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-lg shadow-lg shadow-emerald-900/20"
                     >
                        <Download className="mr-2" size={20} /> Download APK
                     </Button>
                     
                     <button 
                       onClick={resetBuild}
                       className="mt-6 flex items-center justify-center gap-1.5 text-xs text-slate-500 hover:text-white transition-colors w-full"
                     >
                        <RefreshCw size={12} /> Create new version
                     </button>
                  </div>
                )}
             </div>
          </div>

          {/* Footer Info */}
          <div className="mt-8 grid grid-cols-3 gap-4 opacity-40">
             <div className="flex flex-col items-center text-center gap-1">
                <Clock size={18} className="text-slate-400" />
                <span className="text-[10px] text-slate-500 uppercase tracking-wide">~10 min build</span>
             </div>
             <div className="flex flex-col items-center text-center gap-1">
                <Smartphone size={18} className="text-slate-400" />
                <span className="text-[10px] text-slate-500 uppercase tracking-wide">Android 14</span>
             </div>
             <div className="flex flex-col items-center text-center gap-1">
                <AlertCircle size={18} className="text-slate-400" />
                <span className="text-[10px] text-slate-500 uppercase tracking-wide">Play Store Ready</span>
             </div>
          </div>

        </div>
      </main>
    </div>
  );
}