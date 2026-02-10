
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ConfigPanel } from '../../components/ConfigPanel';
import { PhoneMockup } from '../../components/PhoneMockup';
import { AppConfig, DEFAULT_CONFIG } from '../../types';
import { Button } from '../../components/ui/Button';
import { UserMenu } from '../../components/UserMenu';
import { ArrowRight, Share2, Loader2, CheckCircle, Settings, Smartphone, RefreshCw, Save } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import dynamic from 'next/dynamic';

const AuthModal = dynamic(() => import('../../components/AuthModal').then(mod => mod.AuthModal), {
  ssr: false
});

function BuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [editAppId, setEditAppId] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [activeMobileTab, setActiveMobileTab] = useState<'settings' | 'preview'>('settings');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (editAppId) {
      router.prefetch(`/dashboard/${editAppId}`);
    }
  }, [editAppId, router]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (hasInitialized) return;
    const paramId = searchParams.get('id');
    
    if (paramId) {
      setEditAppId(paramId);
      fetchExistingApp(paramId);
    } else {
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
    }
    setHasInitialized(true);
  }, [searchParams, hasInitialized]);

  const fetchExistingApp = async (id: string) => {
    try {
      const { data, error } = await supabase.from('apps').select('*').eq('id', id).single();
      if (data) {
        setConfig({
          ...DEFAULT_CONFIG,
          appName: data.name,
          websiteUrl: data.website_url,
          primaryColor: data.primary_color || '#000000',
          showNavBar: data.navigation ?? data.config?.showNavBar ?? true,
          enablePullToRefresh: data.pull_to_refresh ?? data.config?.enablePullToRefresh ?? true,
          orientation: data.orientation || data.config?.orientation || 'auto',
          enableZoom: data.enable_zoom ?? data.config?.enableZoom ?? false,
          keepAwake: data.keep_awake ?? data.config?.keepAwake ?? false,
          openExternalLinks: data.open_external_links ?? data.config?.openExternalLinks ?? true,
          appIcon: data.config?.appIcon || null,
          themeMode: data.config?.themeMode || 'system',
          showSplashScreen: data.config?.showSplashScreen ?? true,
          userAgent: data.config?.userAgent || DEFAULT_CONFIG.userAgent,
        });
      }
    } catch (e) {
      console.error('Error fetching app', e);
    }
  };

  const handleConfigChange = (key: keyof AppConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleSaveClick = () => {
    if (user) {
      performSave();
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const performSave = async () => {
    setIsSaving(true);
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      const payload = {
        name: config.appName,
        website_url: config.websiteUrl,
        user_id: currentUser ? currentUser.id : null, 
        primary_color: config.primaryColor,
        navigation: config.showNavBar,
        pull_to_refresh: config.enablePullToRefresh,
        orientation: config.orientation,
        enable_zoom: config.enableZoom,
        keep_awake: config.keepAwake,
        open_external_links: config.openExternalLinks,
        config: {
          themeMode: config.themeMode,
          userAgent: config.userAgent,
          showSplashScreen: config.showSplashScreen,
          appIcon: config.appIcon,
          showNavBar: config.showNavBar,
          enablePullToRefresh: config.enablePullToRefresh,
        }
      };

      let resultId = editAppId;

      if (editAppId) {
        await supabase.from('apps').update(payload).eq('id', editAppId);
      } else {
        const { data, error } = await supabase.from('apps').insert([payload]).select();
        if (error) throw error;
        if (data && data.length > 0) resultId = data[0].id;
      }

      if (resultId) router.push(`/dashboard/${resultId}`);
    } catch (err) {
      console.error('Unexpected error:', err);
      alert('An error occurred while saving.');
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#F6F8FA] overflow-hidden relative font-sans text-slate-900 flex-col sm:flex-row">
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => performSave()}
        onGuest={() => { setIsAuthModalOpen(false); performSave(); }}
        initialView="signup"
      />

      {/* --- DESKTOP SIDEBAR (Left) --- */}
      {/* 
         On Desktop, we use a Sidebar layout instead of a Top Header.
         This gives the Preview area full vertical height (100vh) to avoid cutting off the phone.
      */}
      <aside className="hidden sm:flex flex-col w-[400px] lg:w-[450px] h-full bg-white/80 backdrop-blur-2xl border-r border-white/50 shadow-2xl z-30 shrink-0">
        
        {/* Sidebar Header: Logo */}
        <div className="h-20 shrink-0 flex items-center px-8 border-b border-gray-100/50">
           <div className="flex items-center gap-3 cursor-pointer group" onClick={() => router.push('/')}>
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity rounded-full"></div>
                <img src="https://res.cloudinary.com/ddsogd7hv/image/upload/v1770576910/Icon2_dvenip.png" alt="Logo" className="h-10 w-10 rounded-xl shadow-lg relative z-10 object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-tight text-gray-900 group-hover:text-indigo-600 transition-colors">Web2App</span>
                <span className="text-[10px] font-medium text-gray-500">Builder Studio</span>
              </div>
           </div>
        </div>

        {/* Config Panel (Scrollable) */}
        <div className="flex-1 overflow-hidden relative">
            <div className="absolute inset-0 overflow-y-auto custom-scrollbar">
               <ConfigPanel config={config} onChange={handleConfigChange} />
            </div>
        </div>

        {/* Sidebar Footer: Save Action */}
        <div className="p-6 border-t border-gray-100/50 bg-white/50 backdrop-blur-sm">
             <Button 
               variant="primary" 
               className="w-full h-12 rounded-xl shadow-lg shadow-indigo-500/20 bg-gray-900 hover:bg-gray-800 transition-all hover:scale-105 border-none text-white flex items-center justify-center gap-2"
               onClick={handleSaveClick}
               disabled={isSaving}
             >
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                <span>{isSaving ? 'Saving...' : 'Save & Continue'}</span>
                {!isSaving && <ArrowRight size={18} className="opacity-70" />}
             </Button>
        </div>
      </aside>

      {/* --- MOBILE HEADER (Top) --- */}
      {/* Only visible on Mobile */}
      <header className="sm:hidden h-16 shrink-0 flex items-center justify-between px-4 bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
         <div className="flex items-center gap-2" onClick={() => router.push('/')}>
            <img src="https://res.cloudinary.com/ddsogd7hv/image/upload/v1770576910/Icon2_dvenip.png" alt="Logo" className="h-8 w-8 rounded-lg" />
            <span className="font-bold text-sm">Web2App</span>
         </div>
         {user && <UserMenu />}
      </header>

      {/* --- MAIN PREVIEW AREA (Right / Main) --- */}
      <main className="flex-1 relative h-full overflow-hidden flex flex-col bg-[#F6F8FA]">
         
         {/* Desktop Top Right Controls (Floating) */}
         <div className="hidden sm:flex absolute top-6 right-6 z-50 items-center gap-3">
             <Button variant="ghost" size="sm" className="gap-2 text-gray-600 hover:bg-white/50 bg-white/30 backdrop-blur-md rounded-full px-4 border border-white/20">
                <Share2 size={16} /> <span className="text-xs font-medium">Share</span>
             </Button>
             {user && <UserMenu />}
         </div>

         {/* Background Dots */}
         <div className="absolute inset-0 z-0 pointer-events-none opacity-60" 
              style={{ backgroundImage: 'radial-gradient(#cbd5e1 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}>
         </div>

         {/* Content Wrapper */}
         <div className="relative w-full h-full flex items-center justify-center z-10">
            
            {/* Mobile Settings View Overlay (Takes over screen on mobile if tab is settings) */}
            <div className={`sm:hidden absolute inset-0 z-30 bg-[#F6F8FA] overflow-y-auto ${activeMobileTab === 'settings' ? 'block' : 'hidden'}`}>
                <ConfigPanel config={config} onChange={handleConfigChange} />
                <div className="h-24"></div> {/* Spacer for bottom bar */}
            </div>

            {/* Phone Mockup Container */}
            <div className={`
                relative w-full h-full flex items-center justify-center transition-all duration-500
                ${activeMobileTab === 'settings' && 'sm:flex hidden'} // Hide on mobile if settings open
            `}>
                {/* 
                   Scaling Logic:
                   - Mobile Preview: scale-[0.85]
                   - Desktop MD (Laptop): scale-90 (Fits nicely in 768px height)
                   - Desktop LG/XL: scale-100 (Full size)
                */}
                <div className={`
                    relative transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                    ${activeMobileTab === 'preview' ? 'scale-[0.85]' : 'scale-[0.85] md:scale-90 lg:scale-100'}
                `}>
                   <PhoneMockup config={config} isMobilePreview={activeMobileTab === 'preview'} refreshKey={refreshTrigger} />
                </div>
            </div>
         </div>
      </main>

      {/* --- MOBILE BOTTOM BAR --- */}
      <div className="sm:hidden fixed bottom-6 left-0 right-0 z-50 px-4 pointer-events-none">
        <div className="relative flex items-center justify-between w-full max-w-md mx-auto h-14">
          
          {/* Left: Refresh (White) - Only visible in Preview */}
          {activeMobileTab === 'preview' ? (
            <button 
               onClick={handleRefresh}
               className="h-14 w-14 rounded-full bg-white text-black shadow-xl shadow-gray-200/50 flex items-center justify-center pointer-events-auto active:scale-90 transition-transform border border-gray-100"
            >
               <RefreshCw size={20} />
            </button>
          ) : (
            <div className="h-14 w-14" />
          )}

          {/* Center: Navigation Pills */}
          <div className="absolute left-1/2 -translate-x-1/2 flex h-14 items-center rounded-full bg-gray-900/95 backdrop-blur-md p-1.5 shadow-2xl pointer-events-auto border border-white/10">
            <button 
              onClick={() => setActiveMobileTab('settings')}
              className={`flex items-center justify-center gap-1.5 rounded-full px-5 text-[10px] font-bold transition-all duration-300 h-full ${
                activeMobileTab === 'settings' ? 'bg-white text-black shadow-lg' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Settings size={16} /> Edit
            </button>
            
            <button 
              onClick={() => setActiveMobileTab('preview')}
              className={`flex items-center justify-center gap-1.5 rounded-full px-5 text-[10px] font-bold transition-all duration-300 h-full ${
                activeMobileTab === 'preview' ? 'bg-white text-black shadow-lg' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Smartphone size={16} /> Preview
            </button>
          </div>

          {/* Right: Save (Black) */}
          <button 
            onClick={handleSaveClick}
            disabled={isSaving}
            className="h-14 w-14 rounded-full bg-black text-white shadow-xl shadow-black/20 flex items-center justify-center pointer-events-auto active:scale-90 transition-all border border-gray-800"
          >
            {isSaving ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />} 
          </button>
        </div>
      </div>

      {showToast && (
        <div className="absolute bottom-20 sm:bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-medium text-white shadow-lg animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle size={18} className="text-green-400" />
          Settings Saved!
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
