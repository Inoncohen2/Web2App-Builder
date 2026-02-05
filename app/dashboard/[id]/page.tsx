'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '../../../supabaseClient';
import { AppConfig, DEFAULT_CONFIG } from '../../../types';
import { PhoneMockup } from '../../../components/PhoneMockup';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Label } from '../../../components/ui/Label';
import { 
  Download, 
  Settings, 
  Save, 
  Loader2, 
  CheckCircle, 
  Smartphone, 
  ExternalLink, 
  ArrowLeft,
  Clock,
  Mail
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
          // 1. Populate Config
          setAppConfig({
            ...DEFAULT_CONFIG,
            appName: data.name,
            websiteUrl: data.website_url,
            primaryColor: data.primary_color,
            ...data.config // Merge stored JSON config
          });

          // 2. Populate APK URL
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
          // Update the config JSONB column
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
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold shadow-sm">W</div>
          <div>
            <h1 className="text-sm font-bold leading-tight text-gray-900">{appConfig.appName}</h1>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
              </span>
              <span className="text-xs font-medium text-gray-500">Live Status: Active</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
           <Button variant="ghost" size="sm" onClick={() => window.open(appConfig.websiteUrl, '_blank')}>
              <ExternalLink size={16} className="mr-2 text-gray-400" /> Open Website
           </Button>
           <div className="h-6 w-px bg-gray-200 mx-1 hidden sm:block"></div>
           <div className="hidden sm:flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
              ID: {appId.slice(0, 8)}...
           </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl p-6 lg:p-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          
          {/* Left Column: Settings */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
                <Settings className="text-gray-400" size={20} />
                <h2 className="text-lg font-semibold text-gray-900">App Settings</h2>
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
                  <Label>Primary Color</Label>
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
                    <input 
                      type="color" 
                      value={appConfig.primaryColor}
                      onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                      className="h-10 w-10 cursor-pointer overflow-hidden rounded-md border-0 p-0 opacity-0 absolute"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <Button 
                    onClick={handleUpdate} 
                    disabled={updating}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    {updating ? (
                      <><Loader2 className="animate-spin mr-2" size={16} /> Saving...</>
                    ) : (
                      <><Save className="mr-2" size={16} /> Update Settings</>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-blue-100 bg-blue-50 p-5">
              <h3 className="mb-2 flex items-center gap-2 font-semibold text-blue-900">
                <Smartphone size={18} />
                Real-time Updates
              </h3>
              <p className="text-sm text-blue-700 leading-relaxed">
                Changes you make here update your app instantly. Users simply need to restart the app to see the new configuration. No app store submission required.
              </p>
            </div>
          </div>

          {/* Right Column: Preview & Download */}
          <div className="lg:col-span-7 space-y-6">
             {/* Mockup Container */}
             <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-8 shadow-sm relative overflow-hidden">
                
                {/* Background Pattern */}
                <div className="absolute inset-0 z-0 opacity-[0.4]" 
                    style={{ 
                      backgroundImage: 'linear-gradient(#f1f5f9 1px, transparent 1px), linear-gradient(90deg, #f1f5f9 1px, transparent 1px)', 
                      backgroundSize: '20px 20px' 
                    }}>
                </div>

                <div className="z-10 w-full flex flex-col items-center">
                   <div className="mb-8 scale-90 sm:scale-100 origin-top">
                      <PhoneMockup config={appConfig} />
                   </div>

                   {/* Download Zone */}
                   <div className="w-full max-w-sm space-y-4 pt-6 border-t border-gray-100 mt-2 z-20">
                      
                      {apkUrl ? (
                        /* APK Ready State */
                        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                           <Button 
                              onClick={() => window.open(apkUrl, '_blank')}
                              className="w-full h-14 text-base font-semibold shadow-lg shadow-green-200 bg-green-600 hover:bg-green-700 text-white transition-all hover:scale-[1.02]"
                           >
                             <Download className="mr-2 h-5 w-5" /> Download APK
                           </Button>
                           <div className="flex items-center justify-center gap-2 text-xs text-green-700 bg-green-50 py-2 rounded-md border border-green-100">
                              <CheckCircle size={14} /> 
                              <span>Build ready for installation</span>
                           </div>
                        </div>
                      ) : (
                        /* Building State */
                        <div className="space-y-3">
                           <Button 
                              disabled
                              className="w-full h-14 text-base font-medium bg-gray-100 text-gray-500 border border-gray-200 cursor-not-allowed opacity-90"
                           >
                             <Loader2 className="mr-3 h-5 w-5 animate-spin text-indigo-500" /> 
                             Building App... (Est: 15 mins)
                           </Button>
                           
                           <div className="flex items-start gap-3 rounded-lg bg-indigo-50 p-3 text-xs text-indigo-700 border border-indigo-100">
                              <Mail size={16} className="mt-0.5 shrink-0" />
                              <p>
                                 Your app is currently in the build queue. We will email you the download link as soon as the APK is ready. You can close this page.
                              </p>
                           </div>
                        </div>
                      )}

                   </div>
                </div>
             </div>
          </div>
        </div>
      </main>

      {/* Success Toast */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-gray-900 px-6 py-3 text-sm font-medium text-white shadow-xl animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle size={18} className="text-green-400" />
          Settings updated successfully!
        </div>
      )}
    </div>
  );
}