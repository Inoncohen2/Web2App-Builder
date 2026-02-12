
'use client';

import React, { useState, useEffect } from 'react';
import { LoaderCircle, Download, RefreshCw, CircleAlert, Settings2, Check, Smartphone, FileCode, X } from 'lucide-react';
import { Button } from './ui/Button';

// --- ICONS ---
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
  buildStatus: 'idle' | 'building' | 'ready' | 'cancelled';
  runId: number | string | null;
  onStartBuild: (type: 'apk' | 'aab' | 'source') => void;
  onDownload: () => void;
  onCancel: () => void;
  onBuildComplete: (success: boolean) => void;
  apkUrl?: string | null;
  packageName: string;
  onSavePackageName: (name: string) => Promise<boolean>;
  currentBuildType?: 'apk' | 'aab' | 'source' | null;
  buildProgress?: number;
  buildMessage?: string;
}

export const BuildMonitor: React.FC<BuildMonitorProps> = ({ 
  buildStatus, 
  runId, 
  onStartBuild, 
  onDownload, 
  onCancel,
  onBuildComplete,
  apkUrl,
  packageName,
  onSavePackageName,
  currentBuildType,
  buildProgress = 0,
  buildMessage = 'Initializing...'
}) => {
  const [isCancelling, setIsCancelling] = useState(false);
  const [showToast, setShowToast] = useState(false);
  
  // Android Specific Internal State
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [tempPackageName, setTempPackageName] = useState(packageName);
  const [showFormatSelection, setShowFormatSelection] = useState(false);

  // Sync temp package name when prop changes
  useEffect(() => {
    setTempPackageName(packageName);
  }, [packageName]);

  // Handle Toast Visibility on Cancellation
  useEffect(() => {
    if (buildStatus === 'cancelled') {
      setShowToast(true);
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [buildStatus]);

  const handleSaveConfig = async () => {
    const success = await onSavePackageName(tempPackageName);
    if (success) {
      setIsConfiguring(false);
    }
  };

  const initiateBuild = () => {
    setShowFormatSelection(true);
  };

  const startActualBuild = (format: 'apk' | 'aab') => {
    setShowFormatSelection(false);
    onStartBuild(format);
  };

  const handleCancelClick = async () => {
    if (confirm('Are you sure you want to cancel the build?')) {
        setIsCancelling(true);
        await onCancel();
        setIsCancelling(false);
    }
  }

  // Status Logic
  const isBuilding = buildStatus === 'building';
  const isReady = buildStatus === 'ready';
  const isCancelled = buildStatus === 'cancelled';

  // Determine which card is "Active" in the UI
  // Note: if buildType is null (legacy), we assume APK/AAB is the primary one
  const isApkActive = (isBuilding || isReady) && (currentBuildType === 'apk' || currentBuildType === 'aab' || !currentBuildType);
  const isSourceActive = (isBuilding || isReady) && currentBuildType === 'source';

  const showApkBuilding = isApkActive && isBuilding;
  const showApkReady = isApkActive && isReady;

  const showSourceBuilding = isSourceActive && isBuilding;
  const showSourceReady = isSourceActive && isReady;

  // Determine button labels based on cancellation context
  const apkButtonLabel = isCancelled && (currentBuildType === 'apk' || currentBuildType === 'aab' || !currentBuildType) ? 'Rebuild' : 'Build';
  const sourceButtonLabel = isCancelled && currentBuildType === 'source' ? 'Rebuild' : 'Build';

  // Dynamic Title Logic
  const androidTitle = currentBuildType === 'apk' ? 'Android APK' : 
                       currentBuildType === 'aab' ? 'Android AAB' : 
                       'Android APK/AAB';

  return (
    <div className="flex flex-col gap-4 w-full relative">
      
      {/* Floating Toast Notification for Cancellation */}
      {showToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-full shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-5 flex items-center gap-2 pointer-events-none">
          <CircleAlert size={18} />
          <span className="font-bold text-sm">Build was cancelled</span>
        </div>
      )}

      {/* 1. iOS IPA (Coming Soon) */}
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
             <Button disabled variant="outline" size="sm" className="h-9 px-4 bg-gray-100 text-zinc-600 font-bold border-gray-300">
                Build Disabled
             </Button>
             <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider bg-gray-200 px-2 py-0.5 rounded-sm">Coming Soon</span>
           </div>
        </div>
      </div>

      {/* 2. iOS Source Code (Coming Soon) */}
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
             <Button disabled variant="outline" size="sm" className="h-9 px-4 bg-gray-100 text-zinc-600 font-bold border-gray-300">
                Build Disabled
             </Button>
             <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider bg-gray-200 px-2 py-0.5 rounded-sm">Coming Soon</span>
           </div>
        </div>
      </div>

      {/* 3. Android APK/AAB (Active) */}
      <div className={`
         bg-white rounded-xl p-5 shadow-sm transition-all duration-300 border
         ${showApkBuilding 
            ? 'border-blue-600 ring-4 ring-blue-50' 
            : 'border-zinc-800' 
         }
      `}>
         
         {/* Header */}
         <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
               <div className={`h-10 w-10 rounded-lg flex items-center justify-center border transition-colors ${showApkReady ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-gray-900 border-black text-white'}`}>
                  <AndroidIcon />
               </div>
               <div>
                  <h3 className="font-bold text-gray-900">{androidTitle}</h3>
                  <p className="text-[10px] text-gray-500 font-mono mt-0.5">Production Build</p>
               </div>
            </div>

            {/* Action Buttons based on Status */}
            <div>
               {/* Show Build button if this card is NOT currently building. Allowing parallel triggers. */}
               {!isApkActive && !showFormatSelection && (
                 <Button onClick={initiateBuild} size="sm" className="h-9 px-5 bg-black text-white hover:bg-gray-800 font-bold shadow-sm">
                   {apkButtonLabel}
                 </Button>
               )}

               {showApkReady && (
                 <div className="flex items-center gap-3">
                   <div className="flex items-center gap-1 px-2 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold uppercase rounded">
                     <Check size={10} strokeWidth={4} /> Current
                   </div>
                   <Button onClick={initiateBuild} variant="outline" size="sm" className="h-9 px-4 border-gray-300 hover:bg-gray-50 text-gray-700">
                     <RefreshCw size={14} className="mr-1.5" /> Rebuild
                   </Button>
                 </div>
               )}
            </div>
         </div>

         {/* Internal State: Format Selection */}
         {showFormatSelection && !isBuilding && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-100 animate-in fade-in slide-in-from-top-2">
               <p className="text-xs font-bold text-gray-700 mb-3">Choose build format:</p>
               <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => startActualBuild('apk')}
                    className="flex flex-col items-center justify-center p-3 bg-white border-2 border-emerald-500 rounded-lg shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                  >
                     <span className="text-sm font-bold text-gray-900">APK</span>
                     <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full mt-1">Recommended</span>
                  </button>
                  <button 
                    onClick={() => startActualBuild('aab')}
                    className="flex flex-col items-center justify-center p-3 bg-white border border-gray-200 hover:border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                  >
                     <span className="text-sm font-bold text-gray-900">AAB</span>
                     <span className="text-[10px] text-gray-500 font-medium mt-1">Play Store</span>
                  </button>
               </div>
            </div>
         )}

         {/* Internal State: Building Progress */}
         {showApkBuilding && (
            <div className="mb-4">
              <div className="flex items-center gap-3">
                 <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden relative">
                    <div 
                      className="absolute top-0 left-0 bottom-0 bg-blue-600 transition-all duration-1000 ease-in-out rounded-full"
                      style={{ 
                        width: `${Math.min(buildProgress, 100)}%`,
                        backgroundImage: 'linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)',
                        backgroundSize: '1rem 1rem'
                      }}
                    ></div>
                 </div>
                 {!isCancelling && (
                    <button 
                        onClick={handleCancelClick}
                        className="text-black hover:text-gray-600 transition-colors"
                        title="Cancel Build"
                    >
                        <X size={16} />
                    </button>
                 )}
              </div>
              
              <p className="text-xs font-light text-gray-400 mt-2">
                 {isCancelling ? 'Cancelling process...' : buildMessage}
              </p>
            </div>
         )}

         {/* Internal State: Ready / Download */}
         {showApkReady && !showFormatSelection && apkUrl && (
            <div className="mb-4">
               <Button 
                  onClick={onDownload}
                  className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-100 border-none font-bold flex items-center justify-center gap-2 rounded-lg"
               >
                  <Download size={18} /> Download {apkUrl?.endsWith('.aab') ? 'AAB' : 'APK'}
               </Button>
            </div>
         )}

         {/* Configuration Section (Hidden during build) */}
         {!isBuilding && (
             <div className="border-t border-gray-100 pt-3">
                {!isConfiguring ? (
                   <button 
                     onClick={() => setIsConfiguring(true)}
                     className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
                   >
                      <Settings2 size={12} /> Configure package settings
                   </button>
                ) : (
                   <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 animate-in fade-in slide-in-from-top-1">
                      <div className="flex items-center justify-between mb-2">
                         <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                           <Settings2 size={12} /> Package ID
                         </span>
                      </div>
                      <input 
                        type="text" 
                        value={tempPackageName}
                        onChange={(e) => setTempPackageName(e.target.value)}
                        className="w-full text-xs font-mono border border-gray-200 rounded-md p-2 mb-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white"
                        placeholder="com.company.app"
                      />
                      <div className="flex gap-2">
                         <Button onClick={handleSaveConfig} size="sm" className="h-7 text-xs bg-gray-900 text-white">Save</Button>
                         <Button onClick={() => { setIsConfiguring(false); setTempPackageName(packageName); }} variant="ghost" size="sm" className="h-7 text-xs text-gray-500 hover:text-gray-900">Cancel</Button>
                      </div>
                   </div>
                )}
             </div>
         )}
      </div>

      {/* 4. Android Source Code (Enabled) */}
      <div className={`
         bg-white rounded-xl p-5 shadow-sm transition-all duration-300 border
         ${showSourceBuilding 
            ? 'border-blue-600 ring-4 ring-blue-50' 
            : 'border-zinc-800' 
         }
      `}>
        <div className="flex items-center justify-between mb-4">
           <div className="flex items-center gap-3">
             <div className={`h-10 w-10 rounded-lg flex items-center justify-center border transition-colors ${showSourceReady ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-gray-50 border-gray-100 text-gray-500'}`}>
               <FileCode size={20} />
             </div>
             <div>
               <h3 className="font-bold text-gray-900">Android Source Code</h3>
               <p className="text-[10px] text-gray-400 font-mono mt-0.5">Gradle Project</p>
             </div>
           </div>
           
           <div className="flex flex-col items-end gap-1">
             {/* Show Build button if this card is NOT currently building. Allowing parallel triggers. */}
             {!isSourceActive && (
               <Button onClick={() => onStartBuild('source')} size="sm" className="h-9 px-4 bg-gray-900 text-white hover:bg-gray-800 border-gray-900">
                {sourceButtonLabel}
               </Button>
             )}

             {showSourceReady && (
                 <div className="flex items-center gap-3">
                   <div className="flex items-center gap-1 px-2 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold uppercase rounded">
                     <Check size={10} strokeWidth={4} /> Ready
                   </div>
                   <Button onClick={() => onStartBuild('source')} variant="outline" size="sm" className="h-9 px-4 border-gray-300 hover:bg-gray-50 text-gray-700">
                     <RefreshCw size={14} className="mr-1.5" /> Rebuild
                   </Button>
                 </div>
             )}
           </div>
        </div>

        {/* Progress Bar for Source */}
        {showSourceBuilding && (
            <div className="mb-4">
              <div className="flex items-center gap-3">
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden relative">
                    <div 
                      className="absolute top-0 left-0 bottom-0 bg-blue-600 transition-all duration-1000 ease-in-out rounded-full"
                      style={{ 
                        width: `${Math.min(buildProgress, 100)}%`,
                        backgroundImage: 'linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)',
                        backgroundSize: '1rem 1rem'
                      }}
                    ></div>
                  </div>
                  {!isCancelling && (
                    <button 
                        onClick={handleCancelClick}
                        className="text-black hover:text-gray-600 transition-colors"
                        title="Cancel Build"
                    >
                        <X size={16} />
                    </button>
                  )}
              </div>
              <p className="text-xs font-light text-gray-400 mt-2">
                 {isCancelling ? 'Cancelling process...' : buildMessage}
              </p>
            </div>
        )}

        {/* Download Link for Source */}
        {showSourceReady && apkUrl && (
            <div>
               <Button 
                  onClick={onDownload}
                  variant="outline"
                  className="w-full h-12 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200 font-bold flex items-center justify-center gap-2 rounded-lg"
               >
                  <Download size={18} /> Download ZIP
               </Button>
            </div>
        )}

      </div>

    </div>
  );
};
