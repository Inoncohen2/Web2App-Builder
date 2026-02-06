'use client';

import React, { useEffect, useState, useRef } from 'react';
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
  Zap,
  Check,
  Plus,
  Box,
  Rocket
} from 'lucide-react';

const PRESET_COLORS = [
  '#000000', // Black
  '#4f46e5', // Indigo
  '#7c3aed', // Violet
  '#db2777', // Pink
  '#dc2626', // Red
  '#ea580c', // Orange
  '#16a34a', // Green
  '#2563eb', // Blue
];

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
            primary_color: data.primary_color,
            primaryColor: data.primary_color, // Mapping DB snake_case to camelCase
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
      <div className="flex h-screen w-full items-center justify-center bg-[#F6F8FA]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
             <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 rounded-full"></div>
             <Loader2 className="h-10 w-10 animate-spin text-indigo-600 relative z-10" />
          </div>
          <p className="text-sm font-medium text-gray-500 animate-pulse">Accessing Mission Control...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-[#F6F8FA] p-4 text-center">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">App Not Found</h1>
        <p className="mb-6 text-gray-500">The app you are looking for does not exist or has been deleted.</p>
        <Button onClick={() => router.push('/')} variant="outline" className="bg-white">
          <ArrowLeft size={16} className="mr-2" /> Return to Base
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#F6F8FA] text-slate-900 font-sans relative overflow-x-hidden">
      {/* Background Dot Pattern */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40 fixed" 
           style={{ 
             backgroundImage: 'radial-gradient(#cbd5e1 1.5px, transparent 1.5px)', 
             backgroundSize: '24px 24px' 
           }}>
      </div>

      {/* Floating Header */}
      <header className="sticky top-4 z-50 px-4 sm:px-6 mb-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex h-16 w-full items-center justify-between rounded-2xl border border-white/40 bg-white/80 px-6 shadow-xl shadow-indigo-500/5 backdrop-blur-xl transition-all hover:bg-white/90">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => router.push('/')}
                className="group flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
              >
                <ArrowLeft size={18} className="transition-transform group-hover:-translate-x-0.5" />
              </button>
              
              <div className="h-6 w-px bg-gray-200"></div>

              <div className="flex items-center gap-3">
                {appConfig.appIcon && (
                  <img src={appConfig.appIcon} className="h-8 w-8 rounded-lg border border-gray-100 shadow-sm" alt="App Icon" />
                )}
                <div>
                  <h1 className="text-sm font-bold leading-tight text-gray-900">{appConfig.appName}</h1>
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Live</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
               <Button 
                 variant="ghost" 
                 size="sm" 
                 onClick={() => window.open(appConfig.websiteUrl, '_blank')}
                 className="hidden sm:flex text-gray-500 hover:text-indigo-600 hover:bg-indigo-50"
               >
                  <ExternalLink size={16} className="mr-2" /> Open Website
               </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 pb-20 relative z-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
          
          {/* LEFT COLUMN: Settings & Config */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Mission Control Card */}
            <div className="rounded-3xl border border-white/40 bg-white/80 p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden group">
               {/* Decorative Gradient */}
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl transition-all group-hover:bg-indigo-500/15"></div>

              <div className="mb-6 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2.5">
                   <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                     <Settings size={20} />
                   </div>
                   <h2 className="text-lg font-bold text-gray-900">Configuration</h2>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100 uppercase shadow-sm">
                   <Zap size={10} className="fill-indigo-600" /> Auto-Sync
                </div>
              </div>

              <div className="space-y-6 relative z-10">
                <div className="space-y-3">
                  <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">App Name</Label>
                  <Input 
                    value={appConfig.appName}
                    onChange={(e) => handleInputChange('appName', e.target.value)}
                    placeholder="My Awesome App"
                    className="h-11 bg-white/50 border-gray-200 focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Website URL</Label>
                  <div className="relative group/input">
                    <Input 
                      value={appConfig.websiteUrl}
                      onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
                      className="pl-10 h-11 bg-white/50 border-gray-200 focus:bg-white transition-all"
                      placeholder="https://example.com"
                    />
                    <Smartphone className="absolute left-3 top-3.5 h-4 w-4 text-gray-400 group-focus-within/input:text-indigo-500 transition-colors" />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Brand Identity</Label>
                  <div className="flex flex-wrap gap-3">
                    {PRESET_COLORS.map(color => (
                      <button
                        key={color}
                        onClick={() => handleInputChange('primaryColor', color)}
                        className={`h-9 w-9 rounded-full border-2 transition-all flex items-center justify-center shadow-sm hover:scale-110 ${appConfig.primaryColor === color ? 'border-gray-900 scale-110 ring-2 ring-gray-100' : 'border-transparent'}`}
                        style={{ backgroundColor: color }}
                      >
                        {appConfig.primaryColor === color && <Check size={14} className="text-white drop-shadow-md" />}
                      </button>
                    ))}
                    {/* Custom Picker */}
                    <div className="relative h-9 w-9 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm cursor-pointer hover:bg-gray-50 overflow-hidden group/color">
                       <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 opacity-20 group-hover/color:opacity-30"></div>
                       <input 
                         type="color" 
                         value={appConfig.primaryColor}
                         onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                         className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                       />
                       <Plus size={14} className="text-gray-500" />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Button 
                    onClick={handleUpdate} 
                    disabled={updating}
                    className="w-full h-12 rounded-xl bg-gray-900 hover:bg-gray-800 text-white shadow-lg shadow-gray-900/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {updating ? (
                      <><Loader2 className="animate-spin mr-2" size={18} /> Syncing Changes...</>
                    ) : (
                      <><Save className="mr-2" size={18} /> Push Updates Live</>
                    )}
                  </Button>
                  <p className="text-[10px] text-center text-gray-400 mt-3 flex items-center justify-center gap-1.5">
                     <History size={10} /> Changes reflect immediately for all users
                  </p>
                </div>
              </div>
            </div>

            {/* Build Section */}
             <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-xl rounded-3xl p-1">
                 <BuildTrigger initialAppName={appConfig.appName} supabaseId={appId} />
             </div>
          </div>

          {/* RIGHT COLUMN: Simulator & Distribution */}
          <div className="lg:col-span-7 flex flex-col items-center">
             
             {/* Phone Container */}
             <div className="relative group perspective-1000 mb-8 w-full flex justify-center">
                {/* Glow behind phone */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[350px] bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-[80px] rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
                
                <div className="transform transition-all duration-500 ease-out scale-95 hover:scale-100 hover:-translate-y-2">
                   <PhoneMockup config={appConfig} />
                </div>
             </div>

             {/* Distribution Card */}
             <div className="w-full max-w-md rounded-2xl border border-white/40 bg-white/60 p-6 shadow-xl backdrop-blur-md relative overflow-hidden">
                <div className="flex items-center gap-3 mb-4">
                   <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
                      <Box size={18} />
                   </div>
                   <div>
                      <h3 className="font-bold text-gray-900 text-sm">App Package (APK)</h3>
                      <p className="text-[11px] text-gray-500">Android Build Artifact</p>
                   </div>
                </div>

                {apkUrl ? (
                  <div className="animate-in fade-in slide-in-from-bottom-2">
                     <Button 
                        onClick={() => window.open(apkUrl, '_blank')}
                        className="w-full h-12 rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700 text-white transition-all hover:scale-[1.02] border-none"
                     >
                       <Download className="mr-2 h-5 w-5" /> Download .APK File
                     </Button>
                     <p className="text-[10px] text-gray-400 text-center mt-3">
                       Upload this file to the Google Play Console
                     </p>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50/50 p-4 flex flex-col items-center text-center">
                     <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                        <Rocket size={18} className="text-gray-400" />
                     </div>
                     <p className="text-xs font-semibold text-gray-600">No Build Available</p>
                     <p className="text-[10px] text-gray-400 mt-1 max-w-[200px]">
                       Start a new build from the Release Management panel to generate your APK.
                     </p>
                  </div>
                )}
             </div>

          </div>
        </div>
      </main>

      {/* Floating Toast */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full bg-gray-900/90 backdrop-blur-md px-6 py-3 text-sm font-medium text-white shadow-2xl animate-in fade-in slide-in-from-bottom-5 border border-white/10">
          <div className="h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center">
             <Check size={12} className="text-white stroke-[3px]" />
          </div>
          Updates pushed to all devices
        </div>
      )}
    </div>
  );
}