
'use client';

import React, { useState } from 'react';
import { LoaderCircle, Download, RefreshCw, Settings2, FileCode, X, Play } from 'lucide-react';
import { Button } from './ui/Button';
import { useBuildStatus, BuildRecord } from '../hooks/useBuildStatus';

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

// --- Sub Component: Unified Android Card ---
interface AndroidCombinedCardProps {
  appId: string;
  onStartBuild: (type: 'apk' | 'aab') => void;
  packageName: string;
  onSavePackageName: (name: string) => Promise<boolean>;
}

const AndroidCombinedCard: React.FC<AndroidCombinedCardProps> = ({ 
  appId, onStartBuild, packageName, onSavePackageName 
}) => {
  const [activeTab, setActiveTab] = useState<'apk' | 'aab'>('apk');
  const { build: apkBuild } = useBuildStatus(appId, 'apk');
  const { build: aabBuild } = useBuildStatus(appId, 'aab');
  
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [tempPackageName, setTempPackageName] = useState(packageName || '');

  // Select current build based on active tab
  const build = activeTab === 'apk' ? apkBuild : aabBuild;

  // Derived States
  const status = build?.status || 'idle';
  const isBuilding = status === 'building' || status === 'processing' || status === 'queued';
  const isReady = status === 'ready' || status === 'completed';
  const isFailed = status === 'failed';
  const downloadUrl = build?.download_url;
  
  // Progress Logic
  const progress = build?.progress || (status === 'queued' ? 5 : status === 'building' ? 45 : status === 'processing' ? 80 : 0);
  const message = build?.build_message || (status === 'queued' ? 'In Queue...' : 'Ready');

  const handleDownload = () => {
    if (downloadUrl) window.open(downloadUrl, '_blank');
  };

  const handleSaveConfig = async () => {
    if (onSavePackageName) {
      const success = await onSavePackageName(tempPackageName);
      if (success) setIsConfiguring(false);
    }
  };

  return (
    <div className={`
       bg-white rounded-xl p-5 shadow-sm transition-all duration-300 border relative overflow-hidden
       ${isBuilding 
          ? 'border-blue-600 ring-4 ring-blue-50' 
          : isReady
            ? 'border-emerald-500 ring-4 ring-emerald-50'
            : 'border-zinc-200' 
       }
    `}>
       {/* Card Header & Tabs */}
       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
             <div className={`h-12 w-12 rounded-xl flex items-center justify-center border transition-colors ${isReady ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                <AndroidIcon />
             </div>
             <div>
                <h3 className="font-bold text-gray-900 text-lg">Android App</h3>
                <div className="flex gap-1 mt-1">
                   <button 
                     onClick={() => setActiveTab('apk')}
                     className={`text-[10px] font-bold px-2 py-0.5 rounded transition-colors ${activeTab === 'apk' ? 'bg-zinc-800 text-white' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'}`}
                   >
                     APK (Test)
                   </button>
                   <button 
                     onClick={() => setActiveTab('aab')}
                     className={`text-[10px] font-bold px-2 py-0.5 rounded transition-colors ${activeTab === 'aab' ? 'bg-zinc-800 text-white' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'}`}
                   >
                     AAB (Store)
                   </button>
                </div>
             </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
             {!isBuilding && !isReady && (
               <Button onClick={() => onStartBuild(activeTab)} size="sm" className="h-10 px-6 bg-black text-white hover:bg-gray-800 font-bold shadow-md">
                 Build {activeTab.toUpperCase()}
               </Button>
             )}
             
             {isFailed && (
               <Button onClick={() => onStartBuild(activeTab)} variant="outline" size="sm" className="h-10 px-5 border-red-200 bg-red-50 text-red-600 hover:bg-red-100 font-bold">
                 Retry Build
               </Button>
             )}

             {isReady && (
               <Button onClick={() => onStartBuild(activeTab)} variant="outline" size="sm" className="h-10 px-4 border-gray-300 hover:bg-gray-50 text-gray-700 font-medium">
                 <RefreshCw size={14} className="mr-2" /> Rebuild
               </Button>
             )}
          </div>
       </div>

       {/* Active Content Area */}
       <div className="bg-gray-50/50 rounded-xl p-1">
          {/* Progress Bar */}
          {isBuilding && (
              <div className="p-3 animate-in fade-in slide-in-from-top-1">
                <div className="flex justify-between text-xs font-bold text-gray-500 mb-2">
                   <span>Building {activeTab.toUpperCase()}...</span>
                   <span>{progress}%</span>
                </div>
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden relative">
                    <div 
                      className="absolute top-0 left-0 bottom-0 bg-blue-600 transition-all duration-500 ease-out rounded-full"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    >
                      <div className="absolute top-0 bottom-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite_linear]"></div>
                    </div>
                </div>
                <p className="text-xs text-gray-400 mt-2 font-mono truncate">{message}</p>
              </div>
          )}

          {/* Download Section */}
          {isReady && downloadUrl && (
              <div className="p-2 animate-in fade-in slide-in-from-top-1">
                <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-4 flex items-center justify-between">
                   <div>
                      <p className="text-sm font-bold text-emerald-800">Build Successful</p>
                      <p className="text-xs text-emerald-600 mt-0.5">Version {activeTab.toUpperCase()} ready for download.</p>
                   </div>
                   <Button 
                      onClick={handleDownload}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-200 border-none font-bold flex items-center gap-2 rounded-lg"
                   >
                      <Download size={18} /> Download
                   </Button>
                </div>
              </div>
          )}

          {/* Failed Section */}
          {isFailed && (
             <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600 flex items-center gap-3">
                <X size={18} />
                <span>Build failed. {message}</span>
             </div>
          )}

          {/* Idle State */}
          {!isBuilding && !isReady && !isFailed && (
             <div className="p-6 text-center border-2 border-dashed border-gray-200 rounded-lg">
                <p className="text-sm text-gray-400 font-medium">Ready to build {activeTab.toUpperCase()}</p>
             </div>
          )}
       </div>

       {/* Configuration (Package Name) - Shared */}
       <div className="mt-4 pt-3 border-t border-gray-100">
          {!isConfiguring ? (
              <button 
                onClick={() => setIsConfiguring(true)}
                className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-gray-700 transition-colors"
              >
                <Settings2 size={12} /> Configure Package ID
              </button>
          ) : (
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-1">
                <div className="relative flex-1">
                   <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-mono">ID:</span>
                   <input 
                      type="text" 
                      value={tempPackageName}
                      onChange={(e) => setTempPackageName(e.target.value)}
                      className="w-full text-xs font-mono border border-gray-200 rounded-md py-1.5 pl-8 pr-2 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white"
                      placeholder="com.company.app"
                   />
                </div>
                <Button onClick={handleSaveConfig} size="sm" className="h-7 text-xs bg-black text-white">Save</Button>
                <button onClick={() => { setIsConfiguring(false); setTempPackageName(packageName || ''); }} className="p-1 text-gray-400 hover:text-gray-600"><X size={14}/></button>
              </div>
          )}
       </div>
    </div>
  );
};

// --- Sub Component: Standard Build Card (iOS / Source) ---
interface BuildCardProps {
  appId: string;
  type: 'ios_ipa' | 'source' | 'ios_source';
  label: string;
  subLabel: string;
  icon: React.ReactNode;
  onStartBuild: (type: any) => void;
}

const BuildCard: React.FC<BuildCardProps> = ({ 
  appId, type, label, subLabel, icon, onStartBuild 
}) => {
  const { build } = useBuildStatus(appId, type);

  // Derived States
  const status = build?.status || 'idle';
  const isBuilding = status === 'building' || status === 'processing' || status === 'queued';
  const isReady = status === 'ready' || status === 'completed';
  const isFailed = status === 'failed';
  const downloadUrl = build?.download_url;
  
  // Progress Logic
  const progress = build?.progress || (status === 'queued' ? 5 : status === 'building' ? 45 : status === 'processing' ? 80 : 0);
  const message = build?.build_message || (status === 'queued' ? 'In Queue...' : 'Ready');

  return (
    <div className={`
       bg-white rounded-xl p-5 shadow-sm transition-all duration-300 border
       ${isBuilding 
          ? 'border-blue-600 ring-4 ring-blue-50' 
          : isReady
            ? 'border-emerald-500 ring-4 ring-emerald-50'
            : 'border-zinc-200' 
       }
    `}>
       <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
             <div className={`h-10 w-10 rounded-lg flex items-center justify-center border transition-colors ${isReady ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                {icon}
             </div>
             <div>
                <h3 className="font-bold text-gray-900">{label}</h3>
                <p className="text-[10px] text-gray-500 font-mono mt-0.5">{subLabel}</p>
             </div>
          </div>

          <div className="flex flex-col items-end gap-1">
             {!isBuilding && !isReady && (
               <Button onClick={() => onStartBuild(type)} size="sm" className="h-9 px-5 bg-white border border-gray-200 text-gray-900 hover:bg-gray-50 font-bold shadow-sm">
                 Build
               </Button>
             )}
             
             {isFailed && (
               <Button onClick={() => onStartBuild(type)} variant="outline" size="sm" className="h-9 px-4 border-red-200 bg-red-50 text-red-600 hover:bg-red-100">
                 Retry
               </Button>
             )}

             {isReady && (
               <Button onClick={() => onStartBuild(type)} variant="outline" size="sm" className="h-9 px-4 border-gray-300 hover:bg-gray-50 text-gray-700">
                 <RefreshCw size={14} className="mr-1.5" /> Rebuild
               </Button>
             )}
          </div>
       </div>

       {/* Progress Bar */}
       {isBuilding && (
          <div className="mb-4 animate-in fade-in slide-in-from-top-1">
            <div className="flex items-center gap-3">
               <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden relative">
                  <div 
                    className="absolute top-0 left-0 bottom-0 bg-blue-600 transition-all duration-500 ease-out rounded-full"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  >
                    <div className="absolute top-0 bottom-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite_linear]"></div>
                  </div>
               </div>
            </div>
            <p className="text-xs font-medium text-gray-500 mt-2 truncate">{message}</p>
          </div>
       )}

       {/* Download Button */}
       {isReady && downloadUrl && (
          <div className="mb-4 animate-in fade-in slide-in-from-top-1">
             <Button 
                onClick={() => window.open(downloadUrl, '_blank')}
                className="w-full h-10 bg-emerald-600 hover:bg-emerald-500 text-white shadow-md border-none font-bold flex items-center justify-center gap-2 rounded-lg"
             >
                <Download size={16} /> Download {type === 'source' || type === 'ios_source' ? 'ZIP' : 'App'}
             </Button>
          </div>
       )}

       {/* Status Message for Failed */}
       {isFailed && (
         <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600">
            Build failed. {message}
         </div>
       )}
    </div>
  );
};

// --- Main Container Component ---
interface BuildMonitorProps {
  appId: string;
  onStartBuild: (type: 'apk' | 'aab' | 'source' | 'ios_ipa' | 'ios_source') => void;
  packageName: string;
  onSavePackageName: (name: string) => Promise<boolean>;
}

export const BuildMonitor: React.FC<BuildMonitorProps> = ({ 
  appId, onStartBuild, packageName, onSavePackageName 
}) => {
  return (
    <div className="flex flex-col gap-4 w-full relative">
      <style>{`@keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }`}</style>
      
      {/* 1. Android Combined Card (APK & AAB) */}
      <AndroidCombinedCard 
        appId={appId}
        onStartBuild={onStartBuild}
        packageName={packageName}
        onSavePackageName={onSavePackageName}
      />

      {/* 2. iOS IPA */}
      <BuildCard 
        appId={appId}
        type="ios_ipa"
        label="iOS IPA"
        subLabel="Distribution / TestFlight"
        icon={<AppleIcon />}
        onStartBuild={onStartBuild}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 3. Android Source */}
        <BuildCard 
          appId={appId}
          type="source"
          label="Android Source"
          subLabel="Gradle Project (ZIP)"
          icon={<FileCode size={20} />}
          onStartBuild={onStartBuild}
        />

        {/* 4. iOS Source */}
        <BuildCard 
          appId={appId}
          type="ios_source"
          label="iOS Source"
          subLabel="Xcode Project (ZIP)"
          icon={<FileCode size={20} />}
          onStartBuild={onStartBuild}
        />
      </div>
    </div>
  );
};
