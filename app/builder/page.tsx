'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ConfigPanel } from '../../components/ConfigPanel';
import { PhoneMockup } from '../../components/PhoneMockup';
import { AppConfig, DEFAULT_CONFIG } from '../../types';
import { Button } from '../../components/ui/Button';
import { Download, Share2, Loader2, CheckCircle, Settings, Smartphone, RefreshCw } from 'lucide-react';
import { supabase } from '../../supabaseClient';

function BuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [isBuilding, setIsBuilding] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  
  // Mobile Tab State: 'settings' | 'preview'
  const [activeMobileTab, setActiveMobileTab] = useState<'settings' | 'preview'>('settings');
  
  // State to trigger refresh from the floating button
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Parse query parameters on load
  useEffect(() => {
    if (hasInitialized) return;

    const paramUrl = searchParams.get('url');
    const paramName = searchParams.get('name');
    const paramColor = searchParams.get('color');
    const paramIcon = searchParams.get('icon');

    if (paramUrl || paramName || paramColor) {
      setConfig(prev => ({
        ...prev,
        websiteUrl: paramUrl || prev.websiteUrl,
        appName: paramName || prev.appName,
        primaryColor: paramColor || prev.primaryColor,
        appIcon: paramIcon || prev.appIcon,
        showSplashScreen: true
      }));
    }
    setHasInitialized(true);
  }, [searchParams, hasInitialized]);

  const handleConfigChange = (key: keyof AppConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleBuildApp = async () => {
    setIsBuilding(true);

    try {
      const { data, error } = await supabase
        .from('apps')
        .insert([
          {
            name: config.appName,
            website_url: config.websiteUrl,
            primary_color: config.primaryColor,
            config: {
              showNavBar: config.showNavBar,
              themeMode: config.themeMode,
              userAgent: config.userAgent,
              enablePullToRefresh: config.enablePullToRefresh,
              showSplashScreen: config.showSplashScreen,
              appIcon: config.appIcon
            }
          }
        ])
        .select();

      if (error) {
        console.error('Supabase Error:', error);
        alert(`Error: ${error.message}`);
        return;
      }

      if (data && data.length > 0) {
        const newAppId = data[0].id;
        router.push(`/dashboard/${newAppId}`);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      alert('An unexpected error occurred while building the app.');
    } finally {
      setIsBuilding(false);
    }
  };

  return (
    <div className="flex h-screen w-full flex-col bg-[#F6F8FA] overflow-hidden relative font-sans text-slate-900">
      {/* Background Dot Pattern */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40" 
           style={{ 
             backgroundImage: 'radial-gradient(#cbd5e1 1.5px, transparent 1.5px)', 
             backgroundSize: '24px 24px' 
           }}>
      </div>

      {/* Floating Header */}
      <header className="flex h-20 shrink-0 items-center justify-between px-6 z-50 relative bg-transparent">
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => router.push('/')}
        >
           <div className="relative">
             <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity rounded-full"></div>
             <img 
               src="https://res.cloudinary.com/ddsogd7hv/image/upload/v1770338400/Icon_w1tqnd.png" 
               alt="Logo" 
               className="h-10 w-10 rounded-xl shadow-lg relative z-10"
             />
           </div>
           <div className="flex flex-col">
             <span className="text-sm font-bold tracking-tight text-gray-900 group-hover:text-indigo-600 transition-colors">Web2App</span>
             <span className="text-[10px] font-medium text-gray-500">Builder Studio</span>
           </div>
        </div>
        
        <div className="flex items-center gap-3">
           <Button variant="ghost" size="sm" className="hidden sm:flex gap-2 text-gray-600 hover:bg-white/50">
              <Share2 size={16} /> <span className="text-xs font-medium">Share Preview</span>
           </Button>
           <Button 
             variant="primary" 
             size="sm" 
             className="gap-2 rounded-full px-6 shadow-lg shadow-indigo-500/20 bg-gray-900 hover:bg-gray-800 transition-all hover:scale-105 border-none text-white"
             onClick={handleBuildApp}
             disabled={isBuilding}
           >
              {isBuilding ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> <span>Compiling...</span>
                </>
              ) : (
                <>
                  <Download size={16} /> <span>Export App</span>
                </>
              )}
           </Button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex flex-1 overflow-hidden relative z-10 pb-4 px-4 sm:px-6 gap-6">
        
        {/* Left Floating Panel: Configuration */}
        <div className={`
          flex-col bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl z-30 
          w-full sm:w-[420px] sm:flex sm:relative overflow-hidden transition-all duration-500 ease-out
          ${activeMobileTab === 'settings' ? 'flex absolute inset-4 bottom-24 sm:inset-auto' : 'hidden'}
        `}>
           <ConfigPanel config={config} onChange={handleConfigChange} />
        </div>

        {/* Right Canvas: Live Preview */}
        <div className={`
          flex-1 flex flex-col items-center justify-center relative
          ${activeMobileTab === 'preview' ? 'flex absolute inset-0 z-20 bg-[#F6F8FA] pt-20 pb-32' : 'hidden sm:flex'}
        `}>
           
           {/* Phone Container with Glassmorphism backing (Desktop only) */}
           <div className="relative group perspective-1000">
              {/* Glow behind phone */}
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-purple-500/10 to-pink-500/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              
              <div className={`transform transition-all duration-500 ease-out ${activeMobileTab === 'preview' ? 'scale-[0.85]' : 'scale-95 hover:scale-100 hover:-translate-y-2'}`}>
                <PhoneMockup config={config} isMobilePreview={activeMobileTab === 'preview'} refreshKey={refreshTrigger} />
              </div>
           </div>
        </div>
      </main>

      {/* Modern Floating Bottom Navigation */}
      <div className="sm:hidden fixed bottom-6 left-0 right-0 z-50 flex items-center justify-center gap-3 px-4 pointer-events-none">
        {/* Refresh Action */}
        {activeMobileTab === 'preview' && (
           <button 
             onClick={handleRefresh}
             className="h-14 w-14 flex items-center justify-center rounded-full bg-white shadow-xl shadow-indigo-900/10 text-indigo-600 active:scale-90 transition-transform pointer-events-auto border border-white/50"
           >
             <RefreshCw size={24} />
           </button>
        )}

        {/* Toggle Pill */}
        <div className="flex h-14 w-full max-w-[280px] items-center rounded-full bg-gray-900/90 backdrop-blur-md p-1.5 shadow-2xl pointer-events-auto">
          <button 
            onClick={() => setActiveMobileTab('settings')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-full text-xs font-bold transition-all duration-300 h-full ${
              activeMobileTab === 'settings' 
                ? 'bg-white text-black shadow-lg' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Settings size={18} />
            Edit
          </button>
          <button 
            onClick={() => setActiveMobileTab('preview')}
            className={`flex flex-1 items-center justify-center gap-2 rounded-full text-xs font-bold transition-all duration-300 h-full ${
              activeMobileTab === 'preview' 
                ? 'bg-white text-black shadow-lg' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Smartphone size={18} />
            View
          </button>
        </div>
      </div>

      {/* Success Toast */}
      {showToast && (
        <div className="absolute bottom-20 sm:bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-medium text-white shadow-lg animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle size={18} className="text-green-400" />
          App successfully created!
        </div>
      )}
    </div>
  );
}

export default function BuilderPage() {
  return (
    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center"><Loader2 className="animate-spin" /></div>}>
      <BuilderContent />
    </Suspense>
  );
}