'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ConfigPanel } from '../../components/ConfigPanel';
import { PhoneMockup } from '../../components/PhoneMockup';
import { AppConfig, DEFAULT_CONFIG } from '../../types';
import { Button } from '../../components/ui/Button';
import { AuthModal } from '../../components/AuthModal';
import { UserMenu } from '../../components/UserMenu';
import { ArrowRight, Share2, Loader2, CheckCircle, Smartphone, RefreshCw, Save, Settings } from 'lucide-react';
import { supabase } from '../../supabaseClient';

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
          primaryColor: data.primary_color,
          appIcon: data.config?.appIcon || null,
          ...data.config
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
        primary_color: config.primaryColor,
        user_id: currentUser ? currentUser.id : null, 
        config: {
          showNavBar: config.showNavBar,
          themeMode: config.themeMode,
          userAgent: config.userAgent,
          enablePullToRefresh: config.enablePullToRefresh,
          showSplashScreen: config.showSplashScreen,
          appIcon: config.appIcon
        }
      };

      let resultId = editAppId;

      if (editAppId) {
        const { error } = await supabase.from('apps').update(payload).eq('id', editAppId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('apps').insert([payload]).select();
        if (error) throw error;
        if (data && data.length > 0) resultId = data[0].id;
      }

      if (resultId) router.push(`/dashboard/${resultId}`);
    } catch (err) {
      console.error('Unexpected error:', err);
      alert('An error occurred while saving.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-screen w-full flex-col bg-black overflow-hidden relative font-sans text-white">
      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => performSave()}
        onGuest={() => { setIsAuthModalOpen(false); performSave(); }}
        initialView="signup"
      />

      <div className="absolute inset-0 z-0 bg-grid-pattern pointer-events-none opacity-20"></div>

      {/* Header */}
      <header className="flex h-16 shrink-0 items-center justify-between px-6 z-50 relative border-b border-zinc-800 bg-black/50 backdrop-blur-md">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => router.push('/')}>
           <div className="h-8 w-8 rounded-lg bg-white flex items-center justify-center">
             <img src="https://res.cloudinary.com/ddsogd7hv/image/upload/v1770338400/Icon_w1tqnd.png" alt="Logo" className="h-6 w-6 rounded-md" />
           </div>
           <div className="flex flex-col">
             <span className="text-sm font-bold tracking-tight text-white">Web2App</span>
             <span className="text-[10px] font-medium text-zinc-500">Builder Studio</span>
           </div>
        </div>
        
        <div className="flex items-center gap-3">
           {user && <div className="mr-2"><UserMenu /></div>}
           <Button variant="ghost" size="sm" className="hidden sm:flex gap-2 text-zinc-400">
              <Share2 size={16} /> <span className="text-xs font-medium">Share</span>
           </Button>
           <Button 
             variant="primary" 
             size="sm" 
             onClick={handleSaveClick}
             disabled={isSaving}
           >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              <span>{isSaving ? 'Saving...' : 'Save & Continue'}</span>
              {!isSaving && <ArrowRight size={16} className="opacity-50" />}
           </Button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex flex-1 overflow-hidden relative z-10">
        
        {/* Sidebar Config */}
        <div className={`
          flex-col bg-black border-r border-zinc-800 z-30 
          w-full sm:w-[400px] sm:flex sm:relative transition-all duration-300
          ${activeMobileTab === 'settings' ? 'flex absolute inset-0 bottom-20 sm:inset-auto' : 'hidden'}
        `}>
           <ConfigPanel config={config} onChange={handleConfigChange} />
        </div>

        {/* Preview Area */}
        <div className={`
          flex-1 flex flex-col items-center justify-center relative bg-zinc-950/50
          ${activeMobileTab === 'preview' ? 'flex absolute inset-0 z-20 pt-10 pb-32' : 'hidden sm:flex'}
        `}>
           <div className="relative group">
              <div className="absolute inset-0 bg-white/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className={`transform transition-all duration-500 ease-out ${activeMobileTab === 'preview' ? 'scale-[0.85]' : 'scale-95'}`}>
                <PhoneMockup config={config} isMobilePreview={activeMobileTab === 'preview'} refreshKey={refreshTrigger} />
              </div>
           </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="sm:hidden fixed bottom-6 left-0 right-0 z-50 px-4 pointer-events-none">
        {activeMobileTab === 'preview' && (
           <button 
             onClick={handleRefresh}
             className="absolute bottom-[4.5rem] left-4 h-12 w-12 flex items-center justify-center rounded-full bg-zinc-900 border border-zinc-700 text-white shadow-xl pointer-events-auto"
           >
             <RefreshCw size={20} />
           </button>
        )}

        <div className="flex items-end justify-center w-full relative h-14">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex h-14 items-center rounded-full bg-zinc-900 border border-zinc-800 p-1.5 shadow-2xl pointer-events-auto">
            <button 
              onClick={() => setActiveMobileTab('settings')}
              className={`flex items-center justify-center gap-2 rounded-full px-6 text-xs font-bold transition-all duration-300 h-full ${
                activeMobileTab === 'settings' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'
              }`}
            >
              <Settings size={16} /> Edit
            </button>
            
            <button 
              onClick={() => setActiveMobileTab('preview')}
              className={`flex items-center justify-center gap-2 rounded-full px-6 text-xs font-bold transition-all duration-300 h-full ${
                activeMobileTab === 'preview' ? 'bg-white text-black' : 'text-zinc-500 hover:text-white'
              }`}
            >
              <Smartphone size={16} /> Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BuilderPage() {
  return (
    <Suspense fallback={<div className="flex h-screen w-full items-center justify-center bg-black"><Loader2 className="animate-spin text-white" /></div>}>
      <BuilderContent />
    </Suspense>
  );
}