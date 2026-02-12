
'use client';

import React, { useState } from 'react';
import { LoaderCircle, Download, RefreshCw, X, FileCode, Settings2 } from 'lucide-react';
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

export interface BuildState {
  status: 'idle' | 'building' | 'ready' | 'cancelled' | 'failed';
  progress: number;
  message: string;
  url?: string | null;
}

interface BuildMonitorProps {
  apkState: BuildState;
  sourceState: BuildState;
  iosState: BuildState;
  
  packageName: string;
  onSavePackageName: (name: string) => Promise<boolean>;
  onStartBuild: (type: 'apk' | 'aab' | 'source' | 'ios') => void;
  onDownload: (type: 'apk' | 'source' | 'ios') => void;
  onCancel: () => void;
}

export const BuildMonitor: React.FC<BuildMonitorProps> = ({ 
  apkState,
  sourceState,
  iosState,
  packageName,
  onSavePackageName,
  onStartBuild,
  onDownload,
  onCancel
}) => {
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [tempPackageName, setTempPackageName] = useState(packageName);
  const [showFormatSelection, setShowFormatSelection] = useState(false);

  // Helper to remove percentages from message strings
  const formatMessage = (msg: string) => msg.replace(/\s*\(?\d+%\)?/g, '').trim();

  const handleSaveConfig = async () => {
    const success = await onSavePackageName(tempPackageName);
    if (success) setIsConfiguring(false);
  };

  const renderProgressBar = (progress: number, message: string, isCancelling: boolean = false) => (
    <div className="mb-4 animate-in fade-in slide-in-from-top-1">
      <div className="flex items-center gap-3">
         <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden relative">
            <div 
              className="absolute top-0 left-0 bottom-0 bg-emerald-500 transition-all duration-1000 ease-in-out rounded-full"
              style={{ 
                width: `${Math.max(5, Math.min(progress, 100))}%`, // Min 5% so it's visible
                backgroundImage: 'linear-gradient(45deg,rgba(255,255,255,.15) 25%,transparent 25%,transparent 50%,rgba(255,255,255,.15) 50%,rgba(255,255,255,.15) 75%,transparent 75%,transparent)',
                backgroundSize: '1rem 1rem'
              }}
            ></div>
         </div>
         <button 
            onClick={onCancel}
            disabled={isCancelling}
            className="p-1.5 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors shrink-0"
            title="Cancel Build"
         >
            <X size={14} />
         </button>
      </div>
      <p className="text-xs font-medium text-gray-500 mt-2 break-words whitespace-normal leading-relaxed flex items-center gap-2">
         {progress < 100 && !isCancelling && <LoaderCircle size={10} className="animate-spin text-emerald-500" />}
         {isCancelling ? 'Cancelling process...' : formatMessage(message)}
      </p>
    </div>
  );

  return (
    <div className="flex flex-col gap-4 w-full relative">
      
      {/* 1. iOS IPA (Coming Soon) */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 opacity-75">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-lg flex items-center justify-center border bg-gray-50 border-gray-100 text-gray-500">
               <AppleIcon />
             </div>
             <div>
               <h3 className="font-bold text-gray-900">iOS IPA</h3>
               <p className="text-[10px] text-gray-400 font-mono mt-0.5">App Store Binary</p>
             </div>
           </div>
           
           <div className="flex items-center gap-2">
             <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-md font-bold border border-gray-200">COMING SOON</span>
           </div>
        </div>
      </div>

      {/* 2. iOS Source Code (Coming Soon) */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 opacity-75">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-lg flex items-center justify-center border bg-gray-50 border-gray-100 text-gray-500">
               <AppleIcon />
             </div>
             <div>
               <h3 className="font-bold text-gray-900">iOS Source Code</h3>
               <p className="text-[10px] text-gray-400 font-mono mt-0.5">Xcode Project (Swift)</p>
             </div>
           </div>
           
           <div className="flex items-center gap-2">
             <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-md font-bold border border-gray-200">COMING SOON</span>
           </div>
        </div>
      </div>

      {/* 3. Android APK/AAB (Primary) */}
      <div className={`
         bg-white rounded-xl p-5 shadow-sm transition-all duration-300 border
         ${apkState.status === 'building' ? 'border-blue-500 ring-4 ring-blue-50/50' : 'border-zinc-800'}
      `}>
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
                 <>
                    {apkState.status === 'ready' ? (
                       <div className="flex items-center gap-2">
                         <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-bold">READY</span>
                         <Button onClick={() => setShowFormatSelection(true)} variant="outline" size="sm" className="h-8 w-8 p-0 border-gray-300">
                            <RefreshCw size={14} />
                         </Button>
                       </div>
                    ) : (
                        <Button onClick={() => setShowFormatSelection(true)} size="sm" className="h-8 px-5 bg-black text-white hover:bg-gray-800">
                           Build
                        </Button>
                    )}
                 </>
               )}
            </div>
         </div>

         {/* Format Selection */}
         {showFormatSelection && apkState.status !== 'building' && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-100 animate-in fade-in slide-in-from-top-2">
               <div className="flex justify-between items-center mb-3">
                  <p className="text-xs font-bold text-gray-700">Choose format:</p>
                  <button onClick={() => setShowFormatSelection(false)} className="text-gray-400 hover:text-gray-600"><X size={14}/></button>
               </div>
               <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => { setShowFormatSelection(false); onStartBuild('apk'); }}
                    className="flex flex-col items-center justify-center p-3 bg-white border-2 border-emerald-500 rounded-lg shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                  >
                     <span className="text-sm font-bold text-gray-900">APK</span>
                     <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full mt-1">Installable</span>
                  </button>
                  <button 
                    onClick={() => { setShowFormatSelection(false); onStartBuild('aab'); }}
                    className="flex flex-col items-center justify-center p-3 bg-white border border-gray-200 hover:border-gray-300 rounded-lg shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                  >
                     <span className="text-sm font-bold text-gray-900">AAB</span>
                     <span className="text-[10px] text-gray-500 font-medium mt-1">Play Store</span>
                  </button>
               </div>
            </div>
         )}

         {/* Progress */}
         {apkState.status === 'building' && renderProgressBar(apkState.progress, apkState.message)}

         {/* Download */}
         {apkState.status === 'ready' && apkState.url && !showFormatSelection && (
            <div className="mb-4">
               <Button onClick={() => onDownload('apk')} className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-2 rounded-lg">
                  <Download size={18} /> Download {apkState.url?.endsWith('.aab') ? 'AAB' : 'APK'}
               </Button>
            </div>
         )}

         {/* Config (Only shown here) */}
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
                      <input 
                        type="text" 
                        value={tempPackageName}
                        onChange={(e) => setTempPackageName(e.target.value)}
                        className="w-full text-xs font-mono border border-gray-200 rounded-md p-2 mb-3 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white"
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

      {/* 4. Android Source Code */}
      <div className={`
         bg-white rounded-xl p-5 shadow-sm transition-all duration-300 border
         ${sourceState.status === 'building' ? 'border-blue-500 ring-4 ring-blue-50/50' : 'border-zinc-800'}
      `}>
        <div className="flex items-center justify-between mb-4">
           <div className="flex items-center gap-3">
             <div className={`h-10 w-10 rounded-lg flex items-center justify-center border transition-colors ${sourceState.status === 'ready' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-gray-900 border-black text-white'}`}>
               <FileCode size={20} />
             </div>
             <div>
               <h3 className="font-bold text-gray-900">Android Source</h3>
               <p className="text-[10px] text-gray-500 font-mono mt-0.5">Gradle Project (Kotlin)</p>
             </div>
           </div>
           
           <div className="flex flex-col items-end gap-1">
             {sourceState.status !== 'building' && (
               <>
                 {sourceState.status === 'ready' ? (
                   <div className="flex items-center gap-2">
                     <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-bold">READY</span>
                     <Button onClick={() => onStartBuild('source')} variant="outline" size="sm" className="h-8 w-8 p-0 border-gray-300">
                        <RefreshCw size={14} />
                     </Button>
                   </div>
                 ) : (
                    <Button onClick={() => onStartBuild('source')} size="sm" className="h-8 px-4 bg-black text-white hover:bg-gray-800">
                        Build
                    </Button>
                 )}
               </>
             )}
           </div>
        </div>

        {sourceState.status === 'building' && renderProgressBar(sourceState.progress, sourceState.message)}

        {sourceState.status === 'ready' && sourceState.url && (
            <Button onClick={() => onDownload('source')} variant="outline" className="w-full h-10 border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold gap-2">
                <Download size={16} /> Download ZIP
            </Button>
        )}
      </div>

    </div>
  );
};
