
'use client';

import React, { useState, useEffect } from 'react';
import { LoaderCircle, Download, RefreshCw, Settings2, FileCode, X, Play } from 'lucide-react';
import { Button } from './ui/Button';
import { AppBuild } from '../types';

// --- ICONS ---
const AndroidIcon = () => (
  <svg viewBox="0 0 576 512" fill="currentColor" height="1.2em" width="1.2em" className="mb-0.5">
    <path d="M420.55,301.93a24,24,0,1,1,24-24,24,24,0,0,1-24,24m-265.1,0a24,24,0,1,1,24-24,24,24,0,0,1-24,24m273.7-144.48,47.94-83a10,10,0,1,0-17.32-10l-48.66,84.23c-101.7-42.11-204.63-42.11-306.31,0l-48.66-84.23a10,10,0,1,0-17.32,10l47.94,83C64.53,202.22,8.24,285.55,0,384H576c-8.24-98.45-64.54-181.78-146.85-226.55" />
  </svg>
);

const AppleIcon = () => (
    <svg viewBox="0 0 384 512" fill="currentColor" height="1.2em" width="1.2em" className="mb-0.5">
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 52.3-11.4 69.5-34.3z" />
    </svg>
  );

interface BuildMonitorProps {
  androidAppBuild: AppBuild | null;
  androidSourceBuild: AppBuild | null;
  iosAppBuild: AppBuild | null;
  iosSourceBuild: AppBuild | null;
  onStartBuild: (type: 'apk' | 'aab' | 'source' | 'ios_source' | 'ipa') => void;
  packageName: string;
  onSavePackageName: (name: string) => Promise<boolean>;
  isLoading?: boolean;
}

export const BuildMonitor: React.FC<BuildMonitorProps> = ({ 
  androidAppBuild,
  androidSourceBuild,
  iosAppBuild,
  iosSourceBuild,
  onStartBuild, 
  packageName,
  onSavePackageName,
  isLoading = false
}) => {
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [tempPackageName, setTempPackageName] = useState(packageName);
  const [showFormatSelection, setShowFormatSelection] = useState(false);

  useEffect(() => {
    setTempPackageName(packageName);
  }, [packageName]);

  const handleSaveConfig = async () => {
    const success = await onSavePackageName(tempPackageName);
    if (success) {
      setIsConfiguring(false);
    }
  };

  const formatMessage = (msg: string | null) => {
    if (!msg) return 'Processing...';
    return msg.replace(/\s*\(?\d+%\)?/g, '').trim();
  };

  const getStatusColor = (status?: string) => {
      if (status === 'building' || status === 'queued') return 'border-blue-600 ring-4 ring-blue-50';
      if (status === 'ready') return 'border-emerald-500 ring-4 ring-emerald-50';
      if (status === 'failed') return 'border-red-200 ring-4 ring-red-50';
      return 'border-zinc-800';
  };

  // TRACK 1: ANDROID APP (APK/AAB)
  const isAppBuilding = androidAppBuild?.status === 'building' || androidAppBuild?.status === 'queued';
  const isAppReady = androidAppBuild?.status === 'ready';
  const appProgress = androidAppBuild?.progress || 0;
  const appFormatLabel = androidAppBuild?.build_format === 'aab' ? 'AAB' : 'APK';

  // TRACK 2: ANDROID SOURCE
  const isSourceBuilding = androidSourceBuild?.status === 'building' || androidSourceBuild?.status === 'queued';
  const isSourceReady = androidSourceBuild?.status === 'ready';
  const sourceProgress = androidSourceBuild?.progress || 0;

  // TRACK 3: iOS APP (IPA)
  const isIosAppBuilding = iosAppBuild?.status === 'building' || iosAppBuild?.status === 'queued';
  const isIosAppReady = iosAppBuild?.status === 'ready';
  const iosAppProgress = iosAppBuild?.progress || 0;

  // TRACK 4: iOS SOURCE
  const isIosSourceBuilding = iosSourceBuild?.status === 'building' || iosSourceBuild?.status === 'queued';
  const isIosSourceReady = iosSourceBuild?.status === 'ready';
  const iosSourceProgress = iosSourceBuild?.progress || 0;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 w-full relative">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm animate-pulse h-32"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full relative">
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>

      {/* --- CARD 1: ANDROID APP (APK/AAB) --- */}
      <div className={`bg-white rounded-xl p-5 shadow-sm transition-all duration-300 border ${getStatusColor(androidAppBuild?.status)}`}>
         
         <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
               <div className={`h-10 w-10 rounded-lg flex items-center justify-center border transition-colors ${isAppReady ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-gray-900 border-black text-white'}`}>
                  <AndroidIcon />
               </div>
               <div>
                  <h3 className="font-bold text-gray-900">Android App</h3>
                  <p className="text-[10px] text-gray-500 font-mono mt-0.5">
                      {isAppBuilding ? `Building ${appFormatLabel}...` : isAppReady ? `${appFormatLabel} Ready` : 'Production Build'}
                  </p>
               </div>
            </div>

            <div className="flex items-center gap-2">
               {!isAppBuilding && !showFormatSelection && (
                 <Button onClick={() => setShowFormatSelection(true)} size="sm" className={`h-9 px-5 font-bold shadow-sm ${isAppReady ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50' : 'bg-black text-white hover:bg-gray-800'}`}>
                   {isAppReady ? <><RefreshCw size={14} className="mr-2"/> Rebuild</> : <><Play size={14} className="mr-2"/> Build</>}
                 </Button>
               )}
            </div>
         </div>

         {/* Format Selector */}
         {showFormatSelection && !isAppBuilding && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-100 animate-in fade-in slide-in-from-top-2">
               <div className="flex justify-between items-center mb-3">
                    <p className="text-xs font-bold text-gray-700">Choose format:</p>
                    <button onClick={() => setShowFormatSelection(false)} className="text-gray-400 hover:text-gray-600"><X size={14}/></button>
               </div>
               <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => { setShowFormatSelection(false); onStartBuild('apk'); }} className="flex flex-col items-center justify-center p-3 bg-white border-2 border-emerald-500 rounded-lg shadow-sm hover:shadow-md transition-all active:scale-[0.98]">
                     <span className="text-sm font-bold text-gray-900">APK</span>
                     <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full mt-1">Installable</span>
                  </button>
                  <button onClick={() => { setShowFormatSelection(false); onStartBuild('aab'); }} className="flex flex-col items-center justify-center p-3 bg-white border border-gray-200 hover:border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-all active:scale-[0.98]">
                     <span className="text-sm font-bold text-gray-900">AAB</span>
                     <span className="text-[10px] text-gray-500 font-medium mt-1">Play Store</span>
                  </button>
               </div>
            </div>
         )}

         {/* Progress Bar */}
         {isAppBuilding && (
            <div className="mb-4">
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden relative">
                <div className="absolute top-0 left-0 bottom-0 bg-blue-600 transition-all duration-500 ease-out rounded-full overflow-hidden" style={{ width: `${Math.max(5, Math.min(appProgress, 100))}%` }}>
                  <div className="absolute top-0 bottom-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent" style={{ animation: 'shimmer 2s infinite linear' }}></div>
                </div>
              </div>
              <p className="text-xs font-medium text-gray-500 mt-3">{formatMessage(androidAppBuild?.build_message)}</p>
            </div>
         )}

         {/* Download Button */}
         {isAppReady && androidAppBuild?.download_url && !showFormatSelection && (
            <div className="mb-4">
               <Button onClick={() => window.open(androidAppBuild.download_url!, '_blank')} className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-100 border-none font-bold flex items-center justify-center gap-2 rounded-lg">
                  <Download size={18} /> Download {appFormatLabel}
               </Button>
            </div>
         )}

         {/* Package Config */}
         {!isAppBuilding && (
             <div className="border-t border-gray-100 pt-3">
                {!isConfiguring ? (
                   <button onClick={() => setIsConfiguring(true)} className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors">
                      <Settings2 size={12} /> Configure package settings
                   </button>
                ) : (
                   <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 animate-in fade-in slide-in-from-top-1">
                      <input type="text" value={tempPackageName} onChange={(e) => setTempPackageName(e.target.value)} className="w-full text-xs font-mono border border-gray-200 rounded-md p-2 mb-3 focus:outline-none focus:border-emerald-500 bg-white" placeholder="com.company.app" />
                      <div className="flex gap-2">
                         <Button onClick={handleSaveConfig} size="sm" className="h-7 text-xs bg-gray-900 text-white">Save</Button>
                         <Button onClick={() => { setIsConfiguring(false); setTempPackageName(packageName); }} variant="ghost" size="sm" className="h-7 text-xs text-gray-500 hover:text-gray-900">Cancel</Button>
                      </div>
                   </div>
                )}
             </div>
         )}
      </div>

      {/* --- CARD 2: ANDROID SOURCE --- */}
      <div className={`bg-white rounded-xl p-5 shadow-sm transition-all duration-300 border ${getStatusColor(androidSourceBuild?.status)}`}>
        <div className="flex items-center justify-between mb-4">
           <div className="flex items-center gap-3">
             <div className={`h-10 w-10 rounded-lg flex items-center justify-center border transition-colors ${isSourceReady ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>
               <FileCode size={20} />
             </div>
             <div>
               <h3 className="font-bold text-gray-900">Android Source</h3>
               <p className="text-[10px] text-gray-400 font-mono mt-0.5">Gradle Project (ZIP)</p>
             </div>
           </div>
           
           <div className="flex flex-col items-end gap-1">
             {!isSourceBuilding && (
               <Button onClick={() => onStartBuild('source')} size="sm" className={`h-9 px-4 font-bold ${isSourceReady ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50' : 'bg-gray-900 text-white hover:bg-gray-800'}`}>
                 {isSourceReady ? <><RefreshCw size={14} className="mr-2"/> Rebuild</> : <><Play size={14} className="mr-2"/> Build</>}
               </Button>
             )}
           </div>
        </div>

        {isSourceBuilding && (
            <div className="mb-4">
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden relative">
                <div className="absolute top-0 left-0 bottom-0 bg-blue-600 transition-all duration-500 ease-out rounded-full overflow-hidden" style={{ width: `${Math.max(5, Math.min(sourceProgress, 100))}%` }}>
                  <div className="absolute top-0 bottom-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent" style={{ animation: 'shimmer 2s infinite linear' }}></div>
                </div>
              </div>
              <p className="text-xs font-medium text-gray-500 mt-3">{formatMessage(androidSourceBuild?.build_message)}</p>
            </div>
        )}

        {isSourceReady && androidSourceBuild?.download_url && (
            <div>
               <Button onClick={() => window.open(androidSourceBuild.download_url!, '_blank')} variant="outline" className="w-full h-12 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200 font-bold flex items-center justify-center gap-2 rounded-lg">
                  <Download size={18} /> Download Code
               </Button>
            </div>
        )}
      </div>

      {/* --- CARD 3: iOS APP (IPA) --- */}
      <div className={`bg-white rounded-xl p-5 shadow-sm transition-all duration-300 border ${getStatusColor(iosAppBuild?.status)}`}>
        <div className="flex items-center justify-between mb-4">
           <div className="flex items-center gap-3">
             <div className={`h-10 w-10 rounded-lg flex items-center justify-center border transition-colors ${isIosAppReady ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>
               <AppleIcon />
             </div>
             <div>
               <h3 className="font-bold text-gray-900">iOS IPA</h3>
               <p className="text-[10px] text-gray-400 font-mono mt-0.5">Distribution Package</p>
             </div>
           </div>
           
           <div className="flex flex-col items-end gap-1">
             {!isIosAppBuilding && (
               <Button onClick={() => onStartBuild('ipa')} size="sm" className={`h-9 px-4 font-bold ${isIosAppReady ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50' : 'bg-gray-900 text-white hover:bg-gray-800'}`}>
                 {isIosAppReady ? <><RefreshCw size={14} className="mr-2"/> Rebuild</> : <><Play size={14} className="mr-2"/> Build</>}
               </Button>
             )}
           </div>
        </div>

        {isIosAppBuilding && (
            <div className="mb-4">
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden relative">
                <div className="absolute top-0 left-0 bottom-0 bg-blue-600 transition-all duration-500 ease-out rounded-full overflow-hidden" style={{ width: `${Math.max(5, Math.min(iosAppProgress, 100))}%` }}>
                  <div className="absolute top-0 bottom-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent" style={{ animation: 'shimmer 2s infinite linear' }}></div>
                </div>
              </div>
              <p className="text-xs font-medium text-gray-500 mt-3">{formatMessage(iosAppBuild?.build_message)}</p>
            </div>
        )}

        {isIosAppReady && iosAppBuild?.download_url && (
            <div>
               <Button onClick={() => window.open(iosAppBuild.download_url!, '_blank')} className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-100 border-none font-bold flex items-center justify-center gap-2 rounded-lg">
                  <Download size={18} /> Download IPA
               </Button>
            </div>
        )}
      </div>

       {/* --- CARD 4: iOS SOURCE --- */}
       <div className={`bg-white rounded-xl p-5 shadow-sm transition-all duration-300 border ${getStatusColor(iosSourceBuild?.status)}`}>
        <div className="flex items-center justify-between mb-4">
           <div className="flex items-center gap-3">
             <div className={`h-10 w-10 rounded-lg flex items-center justify-center border transition-colors ${isIosSourceReady ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>
               <FileCode size={20} />
             </div>
             <div>
               <h3 className="font-bold text-gray-900">iOS Source</h3>
               <p className="text-[10px] text-gray-400 font-mono mt-0.5">Xcode Project (ZIP)</p>
             </div>
           </div>
           
           <div className="flex flex-col items-end gap-1">
             {!isIosSourceBuilding && (
               <Button onClick={() => onStartBuild('ios_source')} size="sm" className={`h-9 px-4 font-bold ${isIosSourceReady ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50' : 'bg-gray-900 text-white hover:bg-gray-800'}`}>
                 {isIosSourceReady ? <><RefreshCw size={14} className="mr-2"/> Rebuild</> : <><Play size={14} className="mr-2"/> Build</>}
               </Button>
             )}
           </div>
        </div>

        {isIosSourceBuilding && (
            <div className="mb-4">
              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden relative">
                <div className="absolute top-0 left-0 bottom-0 bg-blue-600 transition-all duration-500 ease-out rounded-full overflow-hidden" style={{ width: `${Math.max(5, Math.min(iosSourceProgress, 100))}%` }}>
                  <div className="absolute top-0 bottom-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent" style={{ animation: 'shimmer 2s infinite linear' }}></div>
                </div>
              </div>
              <p className="text-xs font-medium text-gray-500 mt-3">{formatMessage(iosSourceBuild?.build_message)}</p>
            </div>
        )}

        {isIosSourceReady && iosSourceBuild?.download_url && (
            <div>
               <Button onClick={() => window.open(iosSourceBuild.download_url!, '_blank')} variant="outline" className="w-full h-12 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200 font-bold flex items-center justify-center gap-2 rounded-lg">
                  <Download size={18} /> Download Code
               </Button>
            </div>
        )}
      </div>

    </div>
  );
};
