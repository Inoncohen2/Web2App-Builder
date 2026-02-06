'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '../../../supabaseClient';
import { AppConfig, DEFAULT_CONFIG } from '../../../types';
import { PhoneMockup } from '../../../components/PhoneMockup';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Label } from '../../../components/ui/Label';
import { BuildTrigger } from '../../../components/BuildTrigger';
import { 
  Download, 
  Settings, 
  Save, 
  Loader2, 
  CheckCircle, 
  Smartphone, 
  ExternalLink, 
  ArrowLeft,
  Mail,
  Activity,
  History,
  Zap
} from 'lucide-react';

export default function DashboardPage() {
  const params = useParams();
  const router = useRouter();
  const appId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [showToast, setShowToast] = useState(false);
  
  // App Config State
  const [appConfig, setAppConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  // Specific state for the APK URL from the database
  const [apkUrl, setApkUrl] = useState<string | null>(null);

  useEffect(() => {
    async function fetchApp() {
      if (!appId) return;
      
      try {
        const { data, error } = await supabase
          .from('apps')
          .select('*')
          .eq('id', appId)
          .single();

        if (error || !data) {
          console.error('Error fetching app:', error);
          setNotFound(true);
        } else {
          setAppConfig({
            ...DEFAULT_CONFIG,
            appName: data.name,
            websiteUrl: data.website_url,
            primaryColor: data.primary_color,
            ...data.config 
          });
          setApkUrl(data.apk_url || null);
        }
      } catch (e) {
        console.error('Unexpected error:', e);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    fetchApp();
  }, [appId]);

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .from('apps')
        .update({
          name: appConfig.appName,
          website_url: appConfig.websiteUrl,
          primary_color: appConfig.primaryColor,
          config: {
            showNavBar: appConfig.showNavBar,
            themeMode: appConfig.themeMode,
            userAgent: appConfig.userAgent,
            enablePullToRefresh: appConfig.enablePullToRefresh,
            showSplashScreen: appConfig.showSplashScreen,
            appIcon: appConfig.appIcon
          }
        })
        .eq('id', appId);

      if (error) {
        alert('Failed to update settings: ' + error.message);
      } else {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch (e) {
      console.error(e);
      alert('An unexpected error occurred.');
    } finally {
      setUpdating(false);
    }
  };

  const handleInputChange = (key: keyof AppConfig, value: string) => {
    setAppConfig(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-sm font-medium text-gray-500">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50 p-4 text-center">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">App Not Found</h1>
        <p className="mb-6 text-gray-500">The app you are looking for does not exist or has been deleted.</p>
        <Button onClick={() => router.push('/')} variant="outline">
          <ArrowLeft size={16} className="mr-2" /> Go Home
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gray-50 text-gray-900 font-sans">
      {/* Navbar */}
      <nav className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-white px-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold shadow-sm cursor-pointer" onClick={() => router.push('/')}>W</div>
          <div>
            <h1 className="text-sm font-bold leading-tight text-gray-900">{appConfig.appName}</h1>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
              </span>
              <span className="text-xs font-medium text-gray-500">Active</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
           <Button variant="ghost" size="sm" onClick={() => window.open(appConfig.websiteUrl, '_blank')}>
              <ExternalLink size={16} className="mr-2 text-gray-400" /> Web View
           </Button>
           {/* Removed Technical ID Display for cleaner UI */}
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl p-6 lg:p-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          
          {/* Settings Section */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-2">
                   <Settings className="text-gray-400" size={20} />
                   <h2 className="text-lg font-semibold text-gray-900">App Details</h2>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100 uppercase">
                   <Zap size={10} className="fill-green-600" /> Live Sync Active
                </div>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <Label>App Name</Label>
                  <Input 
                    value={appConfig.appName}
                    onChange={(e) => handleInputChange('appName', e.target.value)}
                    placeholder="My Awesome App"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Website URL</Label>
                  <div className="relative">
                    <Input 
                      value={appConfig.websiteUrl}
                      onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
                      className="pl-9"
                      placeholder="https://example.com"
                    />
                    <Smartphone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Brand Identity</Label>
                  <div className="flex gap-3">
                    <div 
                      className="h-10 w-12 rounded-md border border-gray-200 shadow-sm"
                      style={{ backgroundColor: appConfig.primaryColor }}
                    />
                    <div className="flex-1">
                      <Input 
                        value={appConfig.primaryColor}
                        onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                        placeholder="#000000"
                        maxLength={7}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button 
                    onClick={handleUpdate} 
                    disabled={updating}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    {updating ? (
                      <><Loader2 className="animate-spin mr-2" size={16} /> Syncing...</>
                    ) : (
                      <><Save className="mr-2" size={16} /> Save Changes</>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-5">
              <h3 className="mb-2 flex items-center gap-2 font-semibold text-amber-900">
                <History size={18} />
                Instant Updates
              </h3>
              <p className="text-sm text-amber-700 leading-relaxed">
                Settings saved here update your existing app users instantly via our Live Sync engine. No new download required for color or name changes.
              </p>
            </div>
          </div>

          {/* Build & Preview Section */}
          <div className="lg:col-span-7 space-y-6">
             {/* Build Section */}
             <BuildTrigger initialAppName={appConfig.appName} supabaseId={appId} />

             {/* Preview Container */}
             <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-8 shadow-sm relative overflow-hidden">
                <div className="absolute inset-0 z-0 opacity-[0.3]" 
                    style={{ 
                      backgroundImage: 'radial-gradient(#cbd5e1 0.5px, transparent 0.5px)', 
                      backgroundSize: '15px 15px' 
                    }}>
                </div>

                <div className="z-10 w-full flex flex-col items-center">
                   <div className="mb-8 scale-90 sm:scale-100 origin-top">
                      <PhoneMockup config={appConfig} />
                   </div>

                   {/* Artifacts/Download */}
                   <div className="w-full max-w-sm space-y-4 pt-6 border-t border-gray-100 mt-2 z-20">
                      <div className="flex items-center justify-between mb-2">
                         <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                           <Activity size={14} /> Downloads
                         </h4>
                      </div>

                      {apkUrl ? (
                        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                           <Button 
                              onClick={() => window.open(apkUrl, '_blank')}
                              className="w-full h-14 text-base font-semibold shadow-lg shadow-green-100 bg-green-600 hover:bg-green-700 text-white transition-all hover:scale-[1.02]"
                           >
                             <Download className="mr-2 h-5 w-5" /> Download App
                           </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                           <Button 
                              disabled
                              className="w-full h-14 text-base font-medium bg-gray-50 text-gray-400 border border-gray-200 cursor-not-allowed"
                           >
                             <Loader2 className="mr-3 h-5 w-5 animate-spin text-gray-300" /> 
                             Generating App...
                           </Button>
                           <div className="flex items-start gap-3 rounded-lg bg-indigo-50/50 p-3 text-xs text-indigo-700 border border-indigo-100">
                              <Mail size={16} className="mt-0.5 shrink-0" />
                              <p>Your app download will appear here automatically. You can start the process using the Release Management panel above.</p>
                           </div>
                        </div>
                      )}
                   </div>
                </div>
             </div>
          </div>
        </div>
      </main>

      {showToast && (
        <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-gray-900 px-6 py-3 text-sm font-medium text-white shadow-xl animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle size={18} className="text-green-400" />
          Live settings updated
        </div>
      )}
    </div>
  );
}