
'use client';

import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, CircleAlert, Settings2, Check, FileCode, Apple, X } from 'lucide-react';
import { Button } from './ui/Button';
import { supabase } from '../supabaseClient';
import { triggerAppBuild } from '../app/actions/build';
import { App } from '../types/supabase';

// Icons
const AppleIcon = () => (
  <svg viewBox="0 0 384 512" fill="currentColor" height="1.2em" width="1.2em" className="mb-0.5">
    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 52.3-11.4 69.5-34.3z" />
  </svg>
);

const AndroidIcon = () => (
  <svg viewBox="0 0 576 512" fill="currentColor" height="1.2em" width="1.2em" className="mb-0.5">
    <path d="M420.55,301.93a24,24,0,1,1,24-24,24,24,0,0,1-24,24m-265.1,0a24,24,0,1,1,24-24,24,24,0,0,1-24,24m273.7-144.48,47.94-83a10,10,0,1,0-17.32-10l-48.66,84.23c-101.7-42.11-204.63-42.11-306.31,0l-48.66-84.23a10,10,0,1,0-17.32,10l47.94,83C64.53,202.22,8.24,285.55,0,384H576c-8.24-98.45-64.54-181.78-146.85-226.55" />
  </svg>
);

interface BuildMonitorProps {
  appId: string;
  initialApp: App;
  onSavePackageName: (name: string) => Promise<boolean>;
}

export const BuildMonitor: React.FC<BuildMonitorProps> = ({ 
  appId, 
  initialApp,
  onSavePackageName,
}) => {
  
  // --- STATE MANAGEMENT ---
  
  // Android APK State
  const [apkState, setApkState] = useState({
    status: initialApp.apk_status || 'idle',
    progress: initialApp.apk_progress || 0,
    message: initialApp.apk_message || 'Ready to build',
    url: initialApp.download_url
  });

  // Android Source State
  const [sourceState, setSourceState] = useState({
    status: initialApp.android_source_status || 'idle',
    progress: initialApp.android_source_progress || 0,
    message: initialApp.android_source_message || 'Ready to generate',
    url: initialApp.android_source_url
  });

  // UI States
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [tempPackageName, setTempPackageName] = useState(initialApp.package_name);
  const [showFormatSelection, setShowFormatSelection] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [email, setEmail] = useState(initialApp.notification_email || '');

  // --- REALTIME SUBSCRIPTION ---

  useEffect(() => {
    // Determine user email if not set
    // Supabase v2 auth
    const fetchUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email && !email) setEmail(user.email);
    };
    fetchUser();

    const channel = supabase.channel(`app-build-${appId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'apps',
        filter: `id=eq.${appId}`,
      },
      (payload) => {
        const newData = payload.new as App;
        
        // Update Android APK State
        if (
          newData.apk_status !== apkState.status || 
          newData.apk_progress !== apkState.progress || 
          newData.download_url !== apkState.url
        ) {
          setApkState({
            status: newData.apk_status || 'idle',
            progress: newData.apk_progress || 0,
            message: newData.apk_message || '',
            url: newData.download_url
          });
        }

        // Update Android Source State
        if (
          newData.android_source_status !== sourceState.status || 
          newData.android_source_progress !== sourceState.progress || 
          newData.android_source_url !== sourceState.url
        ) {
          setSourceState({
            status: newData.android_source_status || 'idle',
            progress: newData.android_source_progress || 0,
            message: newData.android_source_message || '',
            url: newData.android_source_url
          });
        }
      }
    )
    .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [appId, apkState, sourceState, email]);

  // --- ACTIONS ---

  const handleStartBuild = async (type: 'apk' | 'aab' | 'source') => {
    setShowFormatSelection(false);
    
    // Optimistic Update
    if (type === 'apk' || type === 'aab') {
      setApkState(prev => ({ ...prev, status: 'building', progress: 0, message: 'Queueing build...' }));
    } else {
      setSourceState(prev => ({ ...prev, status: 'building', progress: 0, message: 'Queueing source gen...' }));
    }

    const { data: currentApp } = await supabase.from('apps').select('*').eq('id', appId).single();
    if (!currentApp) return;

    await triggerAppBuild(
      currentApp.name,
      currentApp.package_name,
      appId,
      currentApp.website_url,
      currentApp.icon_url || currentApp.config?.appIcon || '', // Fallback to config if icon_url column is empty
      currentApp.config,
      type,
      email
    );
  };

  const handleCancel = async (target: 'apk' | 'source') => {
    // Optimistic Cancel
    if (target === 'apk') {
      setApkState(prev => ({ ...prev, status: 'cancelled', message: 'Cancelled by user' }));
      await supabase.from('apps').update({ apk_status: 'cancelled' }).eq('id', appId);
    } else {
      setSourceState(prev => ({ ...prev, status: 'cancelled', message: 'Cancelled by user' }));
      await supabase.from('apps').update({ android_source_status: 'cancelled' }).eq('id', appId);
    }
    
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSaveConfig = async () => {
    const success = await onSavePackageName(tempPackageName);
    if (success) setIsConfiguring(false);
  };

  // --- RENDER HELPERS ---

  const ProgressBar = ({ progress, status, onCancel }: { progress: number, status: string, onCancel: () => void }) => (
    <div className="mb-4">
      <div className="flex items-center gap-3">
         <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden relative">
            <div 
              className="absolute top-0 left-0 bottom-0 bg-blue-600 transition-all duration-1000 ease-in-out rounded-full"
              style={{ 
                width: `${Math.min(progress, 100)}%`,
                backgroundImage: 'linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)',
                backgroundSize: '1rem 1rem'
              }}
            ></div>
         </div>
         {status === 'building' && (
            <button onClick={onCancel} className="text-black hover:text-gray-600 transition-colors" title="Cancel">
                <X size={16} />
            </button>
         )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-4 w-full relative">
      
      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-full shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-5 flex items-center gap-2 pointer-events-none">
          <CircleAlert size={18} />
          <span className="font-bold text-sm">Build cancelled</span>
        </div>
      )}

      {/* 1. iOS IPA (Visually Disabled) */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm opacity-60">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-3 text-gray-500">
             <div className="h-10 w-10 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100">
               <AppleIcon />
             </div>
             <div>
               <h3 className="font-bold text-gray-900">iOS IPA</h3>
               <p className="text-[10px] text-gray-400 font-mono mt-0.5">Distribution Package</p>
             </div>
           </div>
           <div className="flex flex-col items-end gap-1">
             <Button disabled variant="outline" size="sm" className="h-9 px-4 bg-gray-100 text-zinc-600 font-bold border-gray-300">Build Disabled</Button>
             <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider bg-gray-200 px-2 py-0.5 rounded-sm">Coming Soon</span>
           </div>
        </div>
      </div>

      {/* 2. iOS Source (Visually Disabled) */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm opacity-60">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-3 text-gray-500">
             <div className="h-10 w-10 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100">
               <FileCode size={20} />
             </div>
             <div>
               <h3 className="font-bold text-gray-900">iOS Source Code</h3>
               <p className="text-[10px] text-gray-400 font-mono mt-0.5">Xcode Project</p>
             </div>
           </div>
           <div className="flex flex-col items-end gap-1">
             <Button disabled variant="outline" size="sm" className="h-9 px-4 bg-gray-100 text-zinc-600 font-bold border-gray-300">Build Disabled</Button>
             <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider bg-gray-200 px-2 py-0.5 rounded-sm">Coming Soon</span>
           </div>
        </div>
      </div>

      {/* 3. Android APK (Active) */}
      <div className={`bg-white rounded-xl p-5 shadow-sm transition-all duration-300 border ${apkState.status === 'building' ? 'border-blue-600 ring-4 ring-blue-50' : 'border-zinc-800'}`}>
         
         {/* Header */}
         <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
               <div className={`h-10 w-10 rounded-lg flex items-center justify-center border transition-colors ${apkState.status === 'ready' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-gray-900 border-black text-white'}`}>
                  <AndroidIcon />
               </div>
               <div>
                  <h3 className="font-bold text-gray-900">Android APK/AAB</h3>
                  <p className="text-[10px] text-gray-500 font-mono mt-0.5">Production Build</p>
               </div>
            </div>

            <div>
               {apkState.status !== 'building' && !showFormatSelection && (
                 <div className="flex items-center gap-2">
                    {apkState.status === 'ready' && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold uppercase rounded mr-1">
                           <Check size={10} strokeWidth={4} /> Ready
                        </div>
                    )}
                    <Button 
                       onClick={() => setShowFormatSelection(true)} 
                       size="sm" 
                       variant={apkState.status === 'ready' ? 'outline' : 'primary'}
                       className={`h-9 px-5 font-bold shadow-sm ${apkState.status === 'ready' ? 'border-gray-300 hover:bg-gray-50 text-gray-700' : 'bg-black text-white hover:bg-gray-800'}`}
                    >
                       {apkState.status === 'ready' || apkState.status === 'cancelled' ? <><RefreshCw size={14} className="mr-1.5" /> Rebuild</> : 'Build'}
                    </Button>
                 </div>
               )}
            </div>
         </div>

         {/* Format Selection */}
         {showFormatSelection && apkState.status !== 'building' && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-100 animate-in fade-in slide-in-from-top-2">
               <p className="text-xs font-bold text-gray-700 mb-3">Choose build format:</p>
               <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => handleStartBuild('apk')} className="flex flex-col items-center justify-center p-3 bg-white border-2 border-emerald-500 rounded-lg shadow-sm hover:shadow-md transition-all active:scale-[0.98]">
                     <span className="text-sm font-bold text-gray-900">APK</span>
                     <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full mt-1">Recommended</span>
                  </button>
                  <button onClick={() => handleStartBuild('aab')} className="flex flex-col items-center justify-center p-3 bg-white border border-gray-200 hover:border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-all active:scale-[0.98]">
                     <span className="text-sm font-bold text-gray-900">AAB</span>
                     <span className="text-[10px] text-gray-500 font-medium mt-1">Play Store</span>
                  </button>
               </div>
               <div className="mt-3 text-center">
                   <button onClick={() => setShowFormatSelection(false)} className="text-xs text-gray-400 hover:text-gray-600 underline">Cancel</button>
               </div>
            </div>
         )}

         {/* Building Progress */}
         {apkState.status === 'building' && (
            <>
               <ProgressBar progress={apkState.progress} status={apkState.status} onCancel={() => handleCancel('apk')} />
               <p className="text-xs font-medium text-gray-500 mt-2">{apkState.message}</p>
            </>
         )}

         {/* Download */}
         {apkState.status === 'ready' && apkState.url && !showFormatSelection && (
            <div className="mb-4">
               <Button onClick={() => window.location.href = apkState.url || '#'} className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-100 border-none font-bold flex items-center justify-center gap-2 rounded-lg">
                  <Download size={18} /> Download Package
               </Button>
            </div>
         )}

         {/* Config */}
         {apkState.status !== 'building' && (
             <div className="border-t border-gray-100 pt-3">
                {!isConfiguring ? (
                   <button onClick={() => setIsConfiguring(true)} className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors">
                      <Settings2 size={12} /> Configure package settings
                   </button>
                ) : (
                   <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 animate-in fade-in slide-in-from-top-1">
                      <div className="flex items-center justify-between mb-2">
                         <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5"><Settings2 size={12} /> Package ID</span>
                      </div>
                      <input type="text" value={tempPackageName} onChange={(e) => setTempPackageName(e.target.value)} className="w-full text-xs font-mono border border-gray-200 rounded-md p-2 mb-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white" />
                      <div className="flex gap-2">
                         <Button onClick={handleSaveConfig} size="sm" className="h-7 text-xs bg-gray-900 text-white">Save</Button>
                         <Button onClick={() => { setIsConfiguring(false); setTempPackageName(initialApp.package_name); }} variant="ghost" size="sm" className="h-7 text-xs text-gray-500 hover:text-gray-900">Cancel</Button>
                      </div>
                   </div>
                )}
             </div>
         )}
      </div>

      {/* 4. Android Source (Active) */}
      <div className={`bg-white rounded-xl p-5 shadow-sm transition-all duration-300 border ${sourceState.status === 'building' ? 'border-blue-600 ring-4 ring-blue-50' : 'border-zinc-800'}`}>
        <div className="flex items-center justify-between mb-4">
           <div className="flex items-center gap-3">
             <div className={`h-10 w-10 rounded-lg flex items-center justify-center border transition-colors ${sourceState.status === 'ready' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>
               <FileCode size={20} />
             </div>
             <div>
               <h3 className="font-bold text-gray-900">Android Source Code</h3>
               <p className="text-[10px] text-gray-400 font-mono mt-0.5">Gradle Project</p>
             </div>
           </div>
           
           <div>
             {sourceState.status !== 'building' && (
                 <div className="flex items-center gap-2">
                    {sourceState.status === 'ready' && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold uppercase rounded mr-1">
                           <Check size={10} strokeWidth={4} /> Ready
                        </div>
                    )}
                    <Button 
                       onClick={() => handleStartBuild('source')} 
                       size="sm" 
                       variant={sourceState.status === 'ready' ? 'outline' : 'primary'}
                       className={`h-9 px-4 font-bold ${sourceState.status === 'ready' ? 'border-gray-300 hover:bg-gray-50 text-gray-700' : 'bg-gray-900 text-white hover:bg-gray-800'}`}
                    >
                       {sourceState.status === 'ready' || sourceState.status === 'cancelled' ? <><RefreshCw size={14} className="mr-1.5" /> Rebuild</> : 'Build'}
                    </Button>
                 </div>
             )}
           </div>
        </div>

        {sourceState.status === 'building' && (
            <>
               <ProgressBar progress={sourceState.progress} status={sourceState.status} onCancel={() => handleCancel('source')} />
               <p className="text-xs font-medium text-gray-500 mt-2">{sourceState.message}</p>
            </>
        )}

        {sourceState.status === 'ready' && sourceState.url && (
            <div>
               <Button onClick={() => window.location.href = sourceState.url || '#'} variant="outline" className="w-full h-12 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200 font-bold flex items-center justify-center gap-2 rounded-lg">
                  <Download size={18} /> Download ZIP
               </Button>
            </div>
        )}
      </div>

    </div>
  );
};
