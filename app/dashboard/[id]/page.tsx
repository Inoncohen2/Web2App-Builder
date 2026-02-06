'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '../../../supabaseClient';
import { triggerAppBuild } from '../../actions/build';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Label } from '../../../components/ui/Label';
import { 
  ArrowLeft, Download, Loader2, Rocket, Mail, 
  CheckCircle2, Clock, Smartphone, Edit3, Box,
  AlertCircle
} from 'lucide-react';

export default function DashboardPage() {
  const params = useParams();
  const router = useRouter();
  const appId = params.id as string;

  // App Data State
  const [appName, setAppName] = useState('');
  const [apkUrl, setApkUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  
  // Build Flow State
  const [buildStatus, setBuildStatus] = useState<'idle' | 'building' | 'ready'>('idle');
  const [email, setEmail] = useState('');
  const [slug, setSlug] = useState(''); // Internal package ID

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
          // Generate default slug from name if not present
          setSlug(data.name.toLowerCase().replace(/[^a-z0-9]/g, '_'));
          
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

  const handleStartBuild = async (e: React.FormEvent) => {
    e.preventDefault();
    setBuildStatus('building');
    
    // Trigger the backend build
    // Note: We are just logging the email for now, but in a real app, 
    // we would save it to the DB to send the email later via webhook.
    const response = await triggerAppBuild(appName, slug, appId);
    
    if (!response.success) {
      alert('Build failed to start: ' + response.error);
      setBuildStatus('idle');
    } else {
      // Optimistic update - in reality, webhook updates DB
      console.log('Build started, notifying:', email);
    }
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
           <ArrowLeft size={16} className="mr-2" /> Back Home
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#0B0F17] text-slate-300 font-sans selection:bg-indigo-500 selection:text-white">
       {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-purple-600/10 blur-[100px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
      </div>

      {/* Header */}
      <header className="relative z-50 border-b border-white/10 bg-[#0B0F17]/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <button onClick={() => router.push('/')} className="text-slate-400 hover:text-white transition-colors">
                <ArrowLeft size={20} />
              </button>
              <div className="h-6 w-px bg-white/10"></div>
              <div>
                <h1 className="text-lg font-bold text-white leading-none">{appName}</h1>
                <span className="text-xs text-slate-500">Dashboard</span>
              </div>
           </div>
           
           <Button 
             variant="outline" 
             className="border-white/10 text-slate-300 hover:bg-white/5 hover:text-white gap-2"
             onClick={() => router.push(`/builder?id=${appId}`)}
           >
              <Edit3 size={16} /> Edit Design
           </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 py-16 px-6">
        <div className="max-w-2xl mx-auto">
          
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-2">Release Management</h2>
            <p className="text-slate-400">Generate your Android APK package ready for the Play Store.</p>
          </div>

          {/* RELEASE CARD */}
          <div className="relative bg-white/5 border border-white/10 rounded-3xl p-1 overflow-hidden backdrop-blur-xl shadow-2xl">
             <div className="bg-[#0F1219]/80 rounded-[1.4rem] p-8 min-h-[400px] flex flex-col items-center justify-center relative">
                
                {/* State: IDLE (Form) */}
                {buildStatus === 'idle' && (
                  <form onSubmit={handleStartBuild} className="w-full max-w-sm space-y-6 animate-in fade-in zoom-in duration-300">
                    <div className="text-center mb-6">
                       <div className="h-16 w-16 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-500/30">
                          <Rocket size={32} />
                       </div>
                       <h3 className="text-xl font-bold text-white">Create New Build</h3>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                         <Label className="text-slate-300">Version Name</Label>
                         <Input 
                           value={appName} 
                           onChange={e => setAppName(e.target.value)}
                           className="bg-white/5 border-white/10 text-white focus:border-indigo-500"
                         />
                      </div>
                      
                      <div className="space-y-2">
                         <Label className="text-slate-300">Notify Email</Label>
                         <div className="relative">
                            <Mail className="absolute left-3 top-3 text-slate-500" size={18} />
                            <Input 
                              type="email"
                              value={email}
                              onChange={e => setEmail(e.target.value)}
                              placeholder="you@company.com"
                              className="pl-10 bg-white/5 border-white/10 text-white focus:border-indigo-500"
                              required
                            />
                         </div>
                         <p className="text-xs text-slate-500">We'll send the download link here when ready.</p>
                      </div>
                    </div>

                    <Button className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl mt-4">
                       Generate APK
                    </Button>
                  </form>
                )}

                {/* State: BUILDING (Progress) */}
                {buildStatus === 'building' && (
                  <div className="w-full max-w-sm text-center animate-in fade-in slide-in-from-right duration-500">
                     <div className="relative mb-8">
                        {/* Spinner Ring */}
                        <div className="h-24 w-24 rounded-full border-4 border-white/5 border-t-indigo-500 animate-spin mx-auto"></div>
                        {/* Icon in center */}
                        <div className="absolute inset-0 flex items-center justify-center">
                           <Box size={32} className="text-indigo-400 animate-pulse" />
                        </div>
                     </div>
                     
                     <h3 className="text-xl font-bold text-white mb-2">Building your App...</h3>
                     <p className="text-slate-400 mb-6">This usually takes about 5-10 minutes. You can safely close this tab.</p>
                     
                     {email && (
                       <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3 text-left">
                          <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                             <CheckCircle2 size={20} className="text-emerald-400" />
                          </div>
                          <div>
                             <p className="text-sm font-bold text-emerald-400">Notification Set</p>
                             <p className="text-xs text-emerald-200/70">We will email <strong>{email}</strong> when ready.</p>
                          </div>
                       </div>
                     )}
                  </div>
                )}

                {/* State: READY (Download) */}
                {buildStatus === 'ready' && apkUrl && (
                  <div className="w-full max-w-sm text-center animate-in fade-in zoom-in duration-500">
                     <div className="h-20 w-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                        <CheckCircle2 size={40} />
                     </div>

                     <h3 className="text-2xl font-bold text-white mb-2">Build Successful!</h3>
                     <p className="text-slate-400 mb-8">Your Android package is ready for download.</p>

                     <Button 
                       onClick={() => window.open(apkUrl, '_blank')}
                       className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-lg shadow-lg shadow-emerald-900/20"
                     >
                        <Download className="mr-2" /> Download APK
                     </Button>
                     
                     <button 
                       onClick={() => setBuildStatus('idle')}
                       className="mt-6 text-sm text-slate-500 hover:text-white underline decoration-slate-700 underline-offset-4"
                     >
                        Create another build
                     </button>
                  </div>
                )}
             </div>
          </div>

          {/* Footer Info */}
          <div className="mt-8 grid grid-cols-3 gap-4 opacity-50">
             <div className="flex flex-col items-center text-center gap-2">
                <Clock size={20} className="text-slate-400" />
                <span className="text-xs text-slate-500">~10 min build time</span>
             </div>
             <div className="flex flex-col items-center text-center gap-2">
                <Smartphone size={20} className="text-slate-400" />
                <span className="text-xs text-slate-500">Android 14 Ready</span>
             </div>
             <div className="flex flex-col items-center text-center gap-2">
                <AlertCircle size={20} className="text-slate-400" />
                <span className="text-xs text-slate-500">Store Compliant</span>
             </div>
          </div>

        </div>
      </main>
    </div>
  );
}