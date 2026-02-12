
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '../../../supabaseClient';
import { triggerAppBuild } from '../../actions/build';
import { Button } from '../../../components/ui/Button';
import { LoaderCircle, Settings } from 'lucide-react';
import Link from 'next/link';
import { UserMenu } from '../../../components/UserMenu';
import { BuildMonitor } from '../../../components/BuildMonitor';

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
  const [appName, setAppName] = useState('');
  const [packageName, setPackageName] = useState('');
  const [appIcon, setAppIcon] = useState<string | null>(null);
  const [websiteUrl, setWebsiteUrl] = useState('');
  
  // Android States
  const [apkStatus, setApkStatus] = useState('idle');
  const [apkProgress, setApkProgress] = useState(0);
  const [apkUrl, setApkUrl] = useState<string | null>(null);
  const [sourceStatus, setSourceStatus] = useState('idle');
  const [sourceProgress, setSourceProgress] = useState(0);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);

  // iOS States
  const [iosStatus, setIosStatus] = useState('idle');
  const [iosProgress, setIosProgress] = useState(0);
  const [ipaUrl, setIpaUrl] = useState<string | null>(null);
  const [iosSourceStatus, setIosSourceStatus] = useState('idle');
  const [iosSourceProgress, setIosSourceProgress] = useState(0);
  const [iosSourceUrl, setIosSourceUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  
  const [appConfig, setAppConfig] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', '#F6F8FA');
    document.body.style.backgroundColor = '#F6F8FA';
  }, []);

  const generateSlug = useCallback((text: string) => {
    const englishOnly = text.replace(/[^a-zA-Z0-9\s]/g, '');
    const words = englishOnly.trim().split(/\s+/).filter(w => w.length > 0);
    return words.slice(0, 3).join('_').toLowerCase();
  }, []);

  const fetchApp = useCallback(async () => {
    if (!appId) return;
    try {
      const { data, error } = await supabase.from('apps').select('*').eq('id', appId).single();

      if (error || !data) {
        setNotFound(prev => prev || loading); 
      } else {
        setAppName(data.name);
        setWebsiteUrl(data.website_url || '');
        setAppIcon(data.icon_url || data.config?.appIcon || null);
        
        setAppConfig({
          primaryColor: data.primary_color || '#000000',
          themeMode: data.config?.themeMode || 'system',
          showNavBar: data.navigation ?? data.config?.showNavBar ?? true,
          enablePullToRefresh: data.pull_to_refresh ?? data.config?.enablePullToRefresh ?? true,
          showSplashScreen: data.config?.showSplashScreen ?? true,
          orientation: data.orientation || data.config?.orientation || 'auto',
          enableZoom: data.enable_zoom ?? data.config?.enableZoom ?? false,
          keepAwake: data.keep_awake ?? data.config?.keepAwake ?? false,
          openExternalLinks: data.open_external_links ?? data.config?.openExternalLinks ?? true,
          splashColor: data.config?.splashColor || '#FFFFFF',
          privacyPolicyUrl: data.config?.privacyPolicyUrl || '',
          termsOfServiceUrl: data.config?.termsOfServiceUrl || '',
        });

        const slug = generateSlug(data.name);
        let initialPkg = data.package_name || `com.app.${slug}`;
        if (!initialPkg.includes('.')) initialPkg = `com.app.${initialPkg}`;
        setPackageName(initialPkg.toLowerCase());
        
        if (data.notification_email && !email) setEmail(data.notification_email);

        // Map States
        setApkStatus(data.apk_status || data.status || 'idle');
        setApkProgress(data.apk_progress || 0);
        setApkUrl(data.apk_url || null);

        setSourceStatus(data.source_status || 'idle');
        setSourceProgress(data.source_progress || 0);
        setSourceUrl(data.download_url || null);

        setIosStatus(data.ios_status || 'idle');
        setIosProgress(data.ios_progress || 0);
        setIpaUrl(data.ipa_url || null);

        setIosSourceStatus(data.ios_source_status || 'idle');
        setIosSourceProgress(data.ios_source_progress || 0);
        setIosSourceUrl(data.ios_source_url || null);
      }
    } catch (e) {
      if(loading) setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [appId, generateSlug, email, loading]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
       if(data.user) {
         setUser(data.user);
         setEmail(data.user.email || '');
       }
    });

    fetchApp();

    const channel = supabase.channel(`app-${appId}`)
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'apps', filter: `id=eq.${appId}` },
      (payload) => {
        const newData = payload.new;
        if (newData.apk_status) setApkStatus(newData.apk_status);
        if (newData.apk_progress !== undefined) setApkProgress(newData.apk_progress);
        if (newData.apk_url) setApkUrl(newData.apk_url);

        if (newData.source_status) setSourceStatus(newData.source_status);
        if (newData.source_progress !== undefined) setSourceProgress(newData.source_progress);
        if (newData.download_url) setSourceUrl(newData.download_url);

        if (newData.ios_status) setIosStatus(newData.ios_status);
        if (newData.ios_progress !== undefined) setIosProgress(newData.ios_progress);
        if (newData.ipa_url) setIpaUrl(newData.ipa_url);

        if (newData.ios_source_status) setIosSourceStatus(newData.ios_source_status);
        if (newData.ios_source_progress !== undefined) setIosSourceProgress(newData.ios_source_progress);
        if (newData.ios_source_url) setIosSourceUrl(newData.ios_source_url);
      }
    )
    .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [appId, fetchApp]);

  useEffect(() => {
    const handleVisibilityChange = () => { if (document.visibilityState === 'visible') fetchApp(); };
    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);
    return () => { window.removeEventListener('visibilitychange', handleVisibilityChange); window.removeEventListener('focus', handleVisibilityChange); };
  }, [fetchApp]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (apkStatus === 'building' || sourceStatus === 'building' || iosStatus === 'building' || iosSourceStatus === 'building') {
       interval = setInterval(() => { fetchApp(); }, 3000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [apkStatus, sourceStatus, iosStatus, iosSourceStatus, fetchApp]);

  const handleSavePackageName = async (newPackageName: string) => {
    let validName = newPackageName.toLowerCase().replace(/[^a-z0-9_.]/g, '');
    if (!validName.includes('.')) validName = `com.app.${validName}`;
    if (validName.startsWith('.')) validName = validName.substring(1);
    if (validName.endsWith('.')) validName = validName.slice(0, -1);
    if (!validatePackageName(validName)) { alert("Invalid Package ID. Must be format: com.company.app"); return false; }
    setPackageName(validName);
    const { error } = await supabase.from('apps').update({ package_name: validName }).eq('id', appId);
    return !error;
  };

  const handleStartBuild = async (buildType: 'apk' | 'aab' | 'source' | 'ios-ipa' | 'ios-source') => {
    const finalEmail = user ? user.email : email;
    // Optimistic Update
    if (buildType === 'source') { setSourceStatus('building'); setSourceProgress(0); }
    else if (buildType === 'ios-ipa') { setIosStatus('building'); setIosProgress(0); }
    else if (buildType === 'ios-source') { setIosSourceStatus('building'); setIosSourceProgress(0); }
    else { setApkStatus('building'); setApkProgress(0); }
    
    const response = await triggerAppBuild(appName, packageName, appId, websiteUrl, appIcon || '', appConfig, buildType, finalEmail);
    if (!response.success) {
      alert('Build failed to start: ' + (response.error || 'Unknown error'));
      // Revert Optimistic
      if (buildType === 'source') setSourceStatus('idle');
      else if (buildType === 'ios-ipa') setIosStatus('idle');
      else if (buildType === 'ios-source') setIosSourceStatus('idle');
      else setApkStatus('idle');
    }
  };

  const handleCancelBuild = async (type: 'apk' | 'source' | 'ios-ipa' | 'ios-source') => {
     try {
       const res = await fetch('/api/build/cancel', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ appId }) });
       if (res.ok) {
         if (type === 'source') setSourceStatus('cancelled');
         else if (type === 'ios-ipa') setIosStatus('cancelled');
         else if (type === 'ios-source') setIosSourceStatus('cancelled');
         else setApkStatus('cancelled');
       }
     } catch (e) { console.error("Cancel exception", e); }
  };

  const handleDownload = (url: string) => { if (url) window.location.href = url; };

  if (loading) return <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-[#F6F8FA] text-slate-900 animate-page-enter"><LoaderCircle className="animate-spin text-emerald-600" size={32} /></div>;
  if (notFound) return <div className="fixed inset-0 w-full h-full flex flex-col items-center justify-center bg-[#F6F8FA] text-slate-900 animate-page-enter"><h1 className="text-2xl font-bold mb-4">App Not Found</h1><Button onClick={() => router.push('/')} variant="outline" className="border-gray-300">Back Home</Button></div>;

  return (
    <div className="fixed inset-0 w-full bg-[#F6F8FA] text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900 overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}></div>
      <div className="flex flex-col h-full w-full animate-page-enter relative z-10">
        <header className="relative z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shrink-0">
          <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
             <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 shadow-md rounded-xl overflow-hidden bg-white border border-gray-100">
                  <img src={appIcon || "https://res.cloudinary.com/ddsogd7hv/image/upload/v1770576910/Icon_oigxxc.png"} alt="Logo" className="h-full w-full object-cover" />
                </div>
                <div><h1 className="text-lg font-bold text-slate-900 leading-none tracking-tight">{appName || 'My App'}</h1></div>
             </div>
             <div className="flex items-center gap-3">{user && <UserMenu />}</div>
          </div>
        </header>

        <main className="relative z-10 flex-1 w-full overflow-y-auto px-6 py-8 flex flex-col items-center custom-scrollbar">
          <div className="max-w-3xl w-full space-y-6 pb-32">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Release Management</h2>
              <p className="text-slate-500">Manage your builds and deployments.</p>
            </div>

            <BuildMonitor 
              onStartBuild={handleStartBuild}
              onDownload={handleDownload}
              onCancel={handleCancelBuild}
              packageName={packageName}
              onSavePackageName={handleSavePackageName}
              
              apkStatus={apkStatus} apkProgress={apkProgress} apkUrl={apkUrl}
              sourceStatus={sourceStatus} sourceProgress={sourceProgress} sourceUrl={sourceUrl}
              iosStatus={iosStatus} iosProgress={iosProgress} ipaUrl={ipaUrl}
              iosSourceStatus={iosSourceStatus} iosSourceProgress={iosSourceProgress} iosSourceUrl={iosSourceUrl}
            />
          </div>
        </main>
      </div>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-10 fade-in duration-700">
         <Link href={`/builder?id=${appId}`} prefetch={true} className="h-14 px-8 bg-black hover:bg-black text-white rounded-full shadow-2xl shadow-black/20 flex items-center gap-3 transition-transform hover:scale-105 active:scale-95 group border border-gray-800">
            <Settings size={20} className="group-hover:rotate-90 transition-transform duration-500" />
            <span className="font-bold text-sm">Edit Design</span>
         </Link>
      </div>
    </div>
  );
}
