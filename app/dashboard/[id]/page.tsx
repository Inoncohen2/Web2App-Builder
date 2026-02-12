
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '../../../supabaseClient';
import { Button } from '../../../components/ui/Button';
import { LoaderCircle, Settings } from 'lucide-react';
import Link from 'next/link';
import { UserMenu } from '../../../components/UserMenu';
import { BuildMonitor } from '../../../components/BuildMonitor';
import { App } from '../../../types/supabase';

// Helper for strict validation
const validatePackageName = (name: string): boolean => {
  if (!name.includes('.')) return false;
  const regex = /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/;
  if (!regex.test(name)) return false;
  if (name.startsWith('.') || name.endsWith('.')) return false;
  return true;
};

export default function DashboardPage() {
  const params = useParams();
  const router = useRouter();
  const appId = params.id as string;

  // App Data State
  const [app, setApp] = useState<App | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', '#F6F8FA');
    else {
      const newMeta = document.createElement('meta');
      newMeta.name = 'theme-color';
      newMeta.content = '#F6F8FA';
      document.head.appendChild(newMeta);
    }
    document.body.style.backgroundColor = '#F6F8FA';
  }, []);

  const fetchApp = useCallback(async () => {
    if (!appId) return;
    try {
      const { data, error } = await supabase
        .from('apps')
        .select('*')
        .eq('id', appId)
        .single();

      if (error || !data) {
        setNotFound(prev => prev || loading); 
      } else {
        // Ensure default config exists
        if (!data.config) data.config = {};
        setApp(data as App);
      }
    } catch (e) {
      if(loading) setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [appId, loading]);

  // Initial Fetch & User Check
  useEffect(() => {
    // Supabase v2 auth check
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if(data.user) setUser(data.user);
    };
    checkUser();

    fetchApp();
  }, [appId, fetchApp]);

  // Re-fetch data when the user returns to the tab/app
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') fetchApp();
    };
    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);
    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, [fetchApp]);

  const handleSavePackageName = async (newPackageName: string) => {
    let validName = newPackageName.toLowerCase().replace(/[^a-z0-9_.]/g, '');
    if (!validName.includes('.')) validName = `com.app.${validName}`;
    if (validName.startsWith('.')) validName = validName.substring(1);
    if (validName.endsWith('.')) validName = validName.slice(0, -1);

    if (!validatePackageName(validName)) {
      alert("Invalid Package ID. Must be format: com.company.app");
      return false;
    }
    
    // Save to DB
    const { error } = await supabase
      .from('apps')
      .update({ package_name: validName })
      .eq('id', appId);
      
    if (error) {
      console.error('Failed to save package name', error);
      alert('Failed to save package name.');
      return false;
    }
    
    // Update local state
    if (app) setApp({ ...app, package_name: validName });
    return true;
  };

  if (loading) {
     return (
       <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-[#F6F8FA] text-slate-900 animate-page-enter">
          <LoaderCircle className="animate-spin text-emerald-600" size={32} />
       </div>
     );
  }

  if (notFound || !app) {
    return (
      <div className="fixed inset-0 w-full h-full flex flex-col items-center justify-center bg-[#F6F8FA] text-slate-900 animate-page-enter">
        <h1 className="text-2xl font-bold mb-4">App Not Found</h1>
        <Button onClick={() => router.push('/')} variant="outline" className="border-gray-300">
           Back Home
        </Button>
      </div>
    );
  }

  const appIcon = app.icon_url || app.config?.appIcon || null;

  return (
    <div className="fixed inset-0 w-full bg-[#F6F8FA] text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900 overflow-hidden">
       
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40" 
           style={{ 
             backgroundImage: 'radial-gradient(#cbd5e1 1.5px, transparent 1.5px)', 
             backgroundSize: '24px 24px' 
           }}>
      </div>

      <div className="flex flex-col h-full w-full animate-page-enter relative z-10">
        <header className="relative z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shrink-0">
          <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
             <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 shadow-md rounded-xl overflow-hidden bg-white border border-gray-100">
                  {appIcon ? (
                      <img src={appIcon} alt="App Icon" className="h-full w-full object-cover" />
                  ) : (
                      <img src="https://res.cloudinary.com/ddsogd7hv/image/upload/v1770576910/Icon_oigxxc.png" alt="Logo" className="h-full w-full p-1" />
                  )}
                </div>
                <div>
                  <h1 className="text-lg font-bold text-slate-900 leading-none tracking-tight">{app.name || 'My App'}</h1>
                </div>
             </div>
             
             <div className="flex items-center gap-3">
                {user && <UserMenu />}
             </div>
          </div>
        </header>

        <main className="relative z-10 flex-1 w-full overflow-y-auto px-6 py-8 flex flex-col items-center custom-scrollbar">
          <div className="max-w-3xl w-full space-y-6 pb-32">
            
            <div className="text-center mb-6">
              <h2 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Release Management</h2>
              <p className="text-slate-500">Manage your builds and deployments.</p>
            </div>

            <BuildMonitor 
              appId={app.id}
              initialApp={app}
              onSavePackageName={handleSavePackageName}
            />

          </div>
        </main>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 fade-in duration-700">
         <Link 
           href={`/builder?id=${appId}`}
           prefetch={true}
           className="h-14 px-8 bg-black hover:bg-black text-white rounded-full shadow-2xl shadow-black/20 flex items-center gap-3 transition-transform hover:scale-105 active:scale-95 group border border-gray-800"
         >
            <Settings size={20} className="group-hover:rotate-90 transition-transform duration-500" />
            <span className="font-bold text-sm">Edit Design</span>
         </Link>
      </div>
    </div>
  );
}
