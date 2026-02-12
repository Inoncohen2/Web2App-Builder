
'use client';

import React, { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ConfigPanel } from '../../components/ConfigPanel';
import { PhoneMockup } from '../../components/PhoneMockup';
import { AppConfig, DEFAULT_CONFIG } from '../../types';
import { Button } from '../../components/ui/Button';
import { UserMenu } from '../../components/UserMenu';
import { ArrowRight, ArrowLeft, LoaderCircle, CircleCheck, Settings, Smartphone, RefreshCw, Save } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import dynamic from 'next/dynamic';
import axios from 'axios';
import { useAppData, useInvalidateApp } from '../../hooks/useAppData';

const AuthModal = dynamic(() => import('../../components/AuthModal').then(mod => mod.AuthModal), {
  ssr: false
});

// Full Screen Transition Overlay Component
const TransitionOverlay = ({ isActive, message }: { isActive: boolean; message: string }) => {
  if (!isActive) return null;
  return (
    <div className="fixed inset-0 z-[100] bg-[#F6F8FA]/90 backdrop-blur-xl flex flex-col items-center justify-center animate-in fade-in duration-200">
      <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-3xl shadow-2xl border border-gray-100">
         <div className="relative">
            <div className="absolute inset-0 bg-emerald-500 blur-xl opacity-20 animate-pulse"></div>
            <div className="h-16 w-16 rounded-2xl bg-black flex items-center justify-center relative">
               <LoaderCircle size={32} className="text-emerald-500 animate-spin" />
            </div>
         </div>
         <div className="text-center">
            <h3 className="text-lg font-bold text-gray-900 mb-1">Saving Project</h3>
            <p className="text-sm text-gray-500 font-mono animate-pulse">{message}</p>
         </div>
      </div>
    </div>
  );
};

// Loading Skeleton for the Builder
const BuilderSkeleton = () => (
  <div className="flex h-[100dvh] w-full bg-[#F6F8FA] overflow-hidden">
    {/* Sidebar Skeleton */}
    <div className="hidden sm:flex flex-col w-[400px] h-full bg-white border-r border-gray-200 p-6 space-y-8">
      <div className="flex items-center gap-3">
         <div className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse"></div>
         <div className="space-y-2">
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
         </div>
      </div>
      <div className="space-y-6">
         <div className="h-32 w-full bg-gray-100 rounded-2xl animate-pulse"></div>
         <div className="h-12 w-full bg-gray-100 rounded-xl animate-pulse"></div>
         <div className="space-y-3">
            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-full bg-gray-100 rounded-lg animate-pulse"></div>
         </div>
      </div>
    </div>
    {/* Main Preview Skeleton */}
    <div className="flex-1 flex items-center justify-center p-10">
       <div className="h-[700px] w-[350px] bg-gray-200 rounded-[3rem] animate-pulse shadow-xl"></div>
    </div>
  </div>
);

function BuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramId = searchParams.get('id');
  const invalidateApp = useInvalidateApp();
  
  // React Query Fetch
  const { data: dbApp, isLoading: isQueryLoading } = useAppData(paramId);

  // Local State
  const [config, setConfig] = useState<AppConfig | null>(null); // Start null to prevent flickering
  const [isSaving, setIsSaving] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [editAppId, setEditAppId] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  
  // Mobile Tab State
  const [activeMobileTab, setActiveMobileTab] = useState<'settings' | 'preview'>('settings');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Preview Scaling State
  const [previewScale, setPreviewScale] = useState(1);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // Set Theme
  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', '#F6F8FA');
    document.body.style.backgroundColor = '#F6F8FA';
  }, []);

  // Scale Calculation
  useEffect(() => {
    if (activeMobileTab !== 'preview') return;
    const calculateScale = () => {
      if (!previewContainerRef.current) return;
      const { clientWidth, clientHeight } = previewContainerRef.current;
      const TARGET_WIDTH = 420; 
      const TARGET_HEIGHT = 870; 
      const scaleX = (clientWidth - 32) / TARGET_WIDTH; 
      const scaleY = (clientHeight - 32) / TARGET_HEIGHT; 
      setPreviewScale(Math.min(scaleX, scaleY, 1));
    };
    calculateScale();
    window.addEventListener('resize', calculateScale);
    const timeout = setTimeout(calculateScale, 100);
    return () => {
      window.removeEventListener('resize', calculateScale);
      clearTimeout(timeout);
    };
  }, [activeMobileTab]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
        setUser(data.user);
        setIsUserLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsUserLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Initialize Config from DB or Params
  useEffect(() => {
    if (paramId) {
       setEditAppId(paramId);
       if (dbApp) {
          // Map DB data to AppConfig
          const mappedConfig: AppConfig = {
            ...DEFAULT_CONFIG,
            appName: dbApp.name,
            websiteUrl: dbApp.website_url,
            primaryColor: dbApp.primary_color || '#000000',
            showNavBar: dbApp.navigation ?? dbApp.config?.showNavBar ?? true,
            enablePullToRefresh: dbApp.pull_to_refresh ?? dbApp.config?.enablePullToRefresh ?? true,
            orientation: dbApp.orientation || dbApp.config?.orientation || 'auto',
            enableZoom: dbApp.enable_zoom ?? dbApp.config?.enableZoom ?? false,
            keepAwake: dbApp.keep_awake ?? dbApp.config?.keepAwake ?? false,
            openExternalLinks: dbApp.open_external_links ?? dbApp.config?.openExternalLinks ?? true,
            appIcon: dbApp.icon_url || dbApp.config?.appIcon || null,
            themeMode: dbApp.config?.themeMode || 'system',
            showSplashScreen: dbApp.config?.showSplashScreen ?? true,
            userAgent: dbApp.config?.userAgent || DEFAULT_CONFIG.userAgent,
            privacyPolicyUrl: dbApp.config?.privacyPolicyUrl || '',
            termsOfServiceUrl: dbApp.config?.termsOfServiceUrl || '',
            splashColor: dbApp.config?.splashColor || '#FFFFFF'
          };
          setConfig(mappedConfig);
       }
    } else {
      // New App Creation - Initialize from Params immediately
      const paramUrl = searchParams.get('url');
      const paramName = searchParams.get('name');
      const paramColor = searchParams.get('color');
      const paramIcon = searchParams.get('icon');
      const paramPrivacy = searchParams.get('privacy');
      const paramTerms = searchParams.get('terms');

      setConfig({
        ...DEFAULT_CONFIG,
        websiteUrl: paramUrl || DEFAULT_CONFIG.websiteUrl,
        appName: paramName || DEFAULT_CONFIG.appName,
        primaryColor: paramColor || DEFAULT_CONFIG.primaryColor,
        appIcon: paramIcon || DEFAULT_CONFIG.appIcon,
        showSplashScreen: true,
        privacyPolicyUrl: paramPrivacy || '',
        termsOfServiceUrl: paramTerms || ''
      });
    }
  }, [paramId, dbApp, searchParams]);

  // If loading an existing app but data isn't ready yet, show skeleton
  if (paramId && (isQueryLoading || !config)) {
     return <BuilderSkeleton />;
  }

  // If config is not yet initialized (even for new apps), show skeleton
  if (!config) {
     return <BuilderSkeleton />;
  }

  const handleConfigChange = (key: keyof AppConfig, value: any) => {
    setConfig((prev) => prev ? ({ ...prev, [key]: value }) : null);
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleUrlBlur = async () => {
    if (!config.websiteUrl || config.websiteUrl.length < 4) return;
    
    let urlToCheck = config.websiteUrl;
    if (!urlToCheck.startsWith('http')) urlToCheck = 'https://' + urlToCheck;

    setIsFetchingMetadata(true);
    try {
        const { data } = await axios.post('/api/scrape', { url: urlToCheck });
        if (data.isValid) {
            setConfig(prev => prev ? ({
                ...prev,
                appName: data.title || prev.appName,
                appIcon: data.icon || prev.appIcon,
                primaryColor: data.themeColor || prev.primaryColor,
                websiteUrl: data.url || prev.websiteUrl,
                privacyPolicyUrl: data.privacyPolicyUrl || prev.privacyPolicyUrl,
                termsOfServiceUrl: data.termsOfServiceUrl || prev.termsOfServiceUrl
            }) : null);
        }
    } catch (err) {
        console.warn('Scraping failed silently', err);
    } finally {
        setIsFetchingMetadata(false);
    }
  };

  const handleSaveClick = () => {
    if (user) performSave();
    else setIsAuthModalOpen(true);
  };

  const performSave = async () => {
    setIsSaving(true);
    try {
      const userId = user?.id;
      const payload = {
        name: config.appName,
        website_url: config.websiteUrl,
        user_id: userId, 
        primary_color: config.primaryColor,
        navigation: config.showNavBar,
        pull_to_refresh: config.enablePullToRefresh,
        orientation: config.orientation,
        enable_zoom: config.enableZoom,
        keep_awake: config.keepAwake,
        open_external_links: config.openExternalLinks,
        icon_url: config.appIcon, // Ensure top level icon is saved
        config: {
          themeMode: config.themeMode,
          userAgent: config.userAgent,
          showSplashScreen: config.showSplashScreen,
          appIcon: config.appIcon,
          showNavBar: config.showNavBar,
          enablePullToRefresh: config.enablePullToRefresh,
          orientation: config.orientation,
          enableZoom: config.enableZoom,
          keepAwake: config.keepAwake,
          openExternalLinks: config.openExternalLinks,
          splashColor: config.splashColor,
          primaryColor: config.primaryColor,
          privacyPolicyUrl: config.privacyPolicyUrl,
          termsOfServiceUrl: config.termsOfServiceUrl
        }
      };

      if (editAppId) {
        setIsRedirecting(true);
        await supabase.from('apps').update(payload).eq('id', editAppId);
        invalidateApp(editAppId); // Clear cache
        router.push(`/dashboard/${editAppId}`);
      } else {
        const { data, error } = await supabase.from('apps').insert([payload]).select();
        if (error) throw error;
        if (data && data.length > 0) {
           setIsRedirecting(true);
           router.push(`/dashboard/${data[0].id}`);
        }
      }
    } catch (err) {
      console.error('Save error:', err);
      alert('An error occurred while saving.');
      setIsSaving(false);
      setIsRedirecting(false);
    }
  };

  return (
    <div className="fixed inset-0 h-[100dvh] w-full bg-[#F6F8FA] overflow-hidden font-sans text-slate-900 flex flex-col sm:flex-row overscroll-none touch-none animate-page-enter">
      
      <TransitionOverlay 
         isActive={isSaving || isRedirecting} 
         message={isRedirecting ? "Preparing Dashboard..." : "Updating Configuration..."} 
      />

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => performSave()}
        onGuest={() => { setIsAuthModalOpen(false); performSave(); }}
        initialView="signup"
      />

      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="hidden sm:flex flex-col w-[400px] lg:w-[40%] h-full bg-white/80 backdrop-blur-2xl border-r border-white/50 shadow-2xl z-30 shrink-0">
        <div className="h-20 shrink-0 flex items-center justify-between px-6 border-b border-gray-100/50">
           <div className="flex items-center gap-3 cursor-pointer group" onClick={() => router.push('/')}>
              <img src="https://res.cloudinary.com/ddsogd7hv/image/upload/v1770576910/Icon2_dvenip.png" alt="Logo" className="h-10 w-10 rounded-lg object-contain" />
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-tight text-gray-900 group-hover:text-emerald-600 transition-colors">Web2App</span>
                <span className="text-[10px] font-medium text-gray-500">Builder Studio</span>
              </div>
           </div>
           
           <div className="flex items-center gap-3">
              {isFetchingMetadata && <LoaderCircle className="animate-spin text-emerald-500" size={16}/>}
              {isUserLoading ? (
                 <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
              ) : user ? (
                 <UserMenu initialUser={user} />
              ) : null}
           </div>
        </div>
        
        <div className="flex-1 overflow-hidden relative">
            <div className="absolute inset-0 overflow-y-auto custom-scrollbar touch-auto">
               <div className="max-w-3xl mx-auto w-full">
                  <ConfigPanel config={config} onChange={handleConfigChange} onUrlBlur={handleUrlBlur} />
               </div>
            </div>
        </div>
        
        <div className="p-6 border-t border-gray-100/50 bg-white/50 backdrop-blur-sm">
             <div className="max-w-3xl mx-auto w-full space-y-3">
               <Button 
                 variant="primary" 
                 className="w-full h-12 rounded-xl shadow-lg shadow-emerald-500/20 bg-gray-900 hover:bg-gray-800 transition-all hover:scale-105 border-none text-white flex items-center justify-center gap-2"
                 onClick={handleSaveClick}
                 disabled={isSaving}
               >
                  {isSaving ? <LoaderCircle size={18} className="animate-spin" /> : <Save size={18} />}
                  <span>{isSaving ? 'Saving...' : 'Save & Continue'}</span>
                  {!isSaving && <ArrowRight size={18} className="opacity-70" />}
               </Button>
               
               <button onClick={() => router.push('/')} className="flex items-center justify-center gap-2 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors w-full py-2">
                  <ArrowLeft size={14} /> Back to Landing Page
               </button>
             </div>
        </div>
      </aside>

      {/* --- MAIN PREVIEW AREA --- */}
      <main className="flex-1 relative h-full overflow-hidden flex flex-col bg-[#F6F8FA] overscroll-none">
         <div className="absolute inset-0 z-0 pointer-events-none opacity-60 fixed sm:absolute" 
              style={{ backgroundImage: 'radial-gradient(#cbd5e1 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}>
         </div>

         {/* Mobile Settings Panel */}
         <div className={`
             sm:hidden absolute left-4 right-4 top-4 bottom-24 z-30
             bg-white/90 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl
             flex flex-col transition-all duration-300 ease-out origin-bottom
             ${activeMobileTab === 'settings' ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' : 'opacity-0 translate-y-8 scale-95 pointer-events-none'}
         `}>
             <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-gray-100/50 bg-white/50 rounded-t-3xl relative z-20">
                <div className="flex items-center gap-2" onClick={() => router.push('/')}>
                    <img src="https://res.cloudinary.com/ddsogd7hv/image/upload/v1770576910/Icon2_dvenip.png" alt="Logo" className="h-8 w-8 rounded-lg object-contain" />
                    <span className="text-sm font-bold text-gray-900">Web2App</span>
                </div>
                {isUserLoading ? (
                   <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
                ) : user ? (
                   <UserMenu initialUser={user} />
                ) : null}
             </div>
             <div className="flex-1 overflow-y-auto custom-scrollbar rounded-b-3xl relative z-10">
                <ConfigPanel config={config} onChange={handleConfigChange} onUrlBlur={handleUrlBlur} />
             </div>
         </div>

         {/* Preview Container */}
         <div ref={previewContainerRef} className={`transition-all duration-300 ${activeMobileTab === 'preview' ? 'sm:hidden fixed inset-0 bottom-[80px] z-40 flex items-center justify-center pointer-events-none overflow-hidden' : 'hidden sm:flex w-full h-full items-center justify-center relative z-10 py-10 lg:py-20'}`}>
             <div className={`transition-all duration-500 ease-out flex items-center justify-center pointer-events-auto origin-center will-change-transform ${activeMobileTab === 'preview' ? '' : 'scale-[0.55] md:scale-[0.60] lg:scale-[0.70] xl:scale-[0.75] 2xl:scale-[0.80]'}`} style={activeMobileTab === 'preview' ? { transform: `scale(${previewScale})` } : {}}>
                <PhoneMockup config={config} isMobilePreview={activeMobileTab === 'preview'} refreshKey={refreshTrigger} />
             </div>
         </div>
      </main>

      {/* --- MOBILE BOTTOM BAR --- */}
      <div className="sm:hidden fixed bottom-6 left-0 right-0 z-50 px-4 pointer-events-none">
        <div className="relative flex items-center justify-between w-full max-w-md mx-auto h-14">
          <button onClick={activeMobileTab === 'settings' ? () => router.push('/') : handleRefresh} className="h-14 w-14 rounded-full bg-white text-black shadow-xl shadow-gray-200/50 flex items-center justify-center pointer-events-auto active:scale-90 transition-transform border border-gray-100">
             {activeMobileTab === 'settings' ? <ArrowLeft size={20} /> : <RefreshCw size={20} />}
          </button>

          <div className="absolute left-1/2 -translate-x-1/2 flex h-14 items-center rounded-full bg-gray-900/95 backdrop-blur-md p-1.5 shadow-2xl pointer-events-auto border border-white/10">
            <button onClick={() => setActiveMobileTab('settings')} className={`flex items-center justify-center gap-1.5 rounded-full px-5 text-[10px] font-bold transition-all duration-300 h-full ${activeMobileTab === 'settings' ? 'bg-white text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}>
              <Settings size={16} /> Edit
            </button>
            <button onClick={() => setActiveMobileTab('preview')} className={`flex items-center justify-center gap-1.5 rounded-full px-5 text-[10px] font-bold transition-all duration-300 h-full ${activeMobileTab === 'preview' ? 'bg-white text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}>
              <Smartphone size={16} /> Preview
            </button>
          </div>

          <button onClick={handleSaveClick} disabled={isSaving} className="h-14 w-14 rounded-full bg-black text-white shadow-xl shadow-black/20 flex items-center justify-center pointer-events-auto active:scale-90 transition-all border border-gray-800">
            {isSaving ? <LoaderCircle size={24} className="animate-spin" /> : <Save size={24} />} 
          </button>
        </div>
      </div>
      {showToast && <div className="absolute bottom-20 sm:bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-medium text-white shadow-lg animate-in fade-in slide-in-from-bottom-5"><CircleCheck size={18} className="text-green-400" /> Settings Saved!</div>}
    </div>
  );
}

export default function BuilderPage() {
  return (
    <Suspense fallback={<BuilderSkeleton />}>
      <BuilderContent />
    </Suspense>
  );
}
