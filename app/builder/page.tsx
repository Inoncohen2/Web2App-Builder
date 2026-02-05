'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ConfigPanel } from '../../components/ConfigPanel';
import { PhoneMockup } from '../../components/PhoneMockup';
import { AppConfig, DEFAULT_CONFIG } from '../../types';
import { Button } from '../../components/ui/Button';
import { Download, Share2, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '../../supabaseClient';

function BuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [isBuilding, setIsBuilding] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

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
        // If we scraped successfully, let's assume we want to show splash screen
        showSplashScreen: true
      }));
    }
    setHasInitialized(true);
  }, [searchParams, hasInitialized]);

  const handleConfigChange = (key: keyof AppConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleBuildApp = async () => {
    setIsBuilding(true);

    try {
      // 1. Save to Supabase
      const { data, error } = await supabase
        .from('apps')
        .insert([
          {
            name: config.appName,
            website_url: config.websiteUrl,
            primary_color: config.primaryColor,
            // We save the full config JSON so we don't lose icon/refresh settings
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
        
        // 2. Redirect to Dashboard
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
    <div className="flex h-screen w-full flex-col bg-gray-50 overflow-hidden relative">
      {/* Top Header */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b bg-white px-6 shadow-sm z-10">
        <div className="flex items-center gap-2">
           <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white font-bold">W</div>
           <h1 className="text-lg font-bold tracking-tight text-gray-900">Web2App Builder</h1>
        </div>
        
        <div className="flex items-center gap-3">
           <Button variant="outline" size="sm" className="hidden sm:flex gap-2">
              <Share2 size={16} /> Share Preview
           </Button>
           <Button 
             variant="primary" 
             size="sm" 
             className="gap-2 min-w-[130px]"
             onClick={handleBuildApp}
             disabled={isBuilding}
           >
              {isBuilding ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Building...
                </>
              ) : (
                <>
                  <Download size={16} /> Build App
                </>
              )}
           </Button>
        </div>
      </header>

      {/* Main Split Layout */}
      <main className="flex flex-1 overflow-hidden">
        
        {/* Left Panel: Configuration */}
        <div className="w-full max-w-[400px] flex-none overflow-hidden sm:border-r z-20 shadow-xl sm:shadow-none absolute sm:relative h-full bg-white transition-transform transform -translate-x-full sm:translate-x-0">
           <ConfigPanel config={config} onChange={handleConfigChange} />
        </div>
        
        {/* Mobile Toggle for Config Panel (Only visible on small screens) */}
         <div className="sm:hidden w-full h-full flex flex-col">
            <ConfigPanel config={config} onChange={handleConfigChange} />
         </div>

        {/* Right Panel: Live Preview */}
        <div className="hidden sm:flex flex-1 flex-col items-center justify-center bg-slate-100/50 relative overflow-y-auto">
           {/* Grid Background Pattern */}
           <div className="absolute inset-0 z-0 opacity-[0.4]" 
                style={{ 
                  backgroundImage: 'linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)', 
                  backgroundSize: '40px 40px' 
                }}>
           </div>
           
           <div className="z-10 w-full h-full overflow-y-auto">
             <PhoneMockup config={config} />
           </div>
        </div>
      </main>

      {/* Success Toast */}
      {showToast && (
        <div className="absolute bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-medium text-white shadow-lg animate-in fade-in slide-in-from-bottom-5">
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