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
  ArrowLeft 
} from 'lucide-react';

export default function DashboardPage() {
  const params = useParams();
  const router = useRouter();
  const appId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [showToast, setShowToast] = useState(false);
  
  // Full config object for the Phone Preview
  const [appConfig, setAppConfig] = useState<AppConfig>(DEFAULT_CONFIG);

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
          // Reconstruct AppConfig from DB columns + config JSON
          setAppConfig({
            ...DEFAULT_CONFIG,
            appName: data.name,
            websiteUrl: data.website_url,
            primaryColor: data.primary_color,
            ...data.config // Merge stored JSON config
          });
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
          // We update the JSONB config as well to keep things consistent
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
    <div className="min-h-screen w-full bg-gray-50 text-gray-900">
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
              <span className="text-xs font-medium text-gray-500">Live Dashboard</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
           <Button variant="ghost" size="sm" onClick={() => window.open(appConfig.websiteUrl, '_blank')}>
              <ExternalLink size={16} className="mr-2 text-gray-400" /> Open Website
           </Button>
           <div className="h-6 w-px bg-gray-200 mx-1"></div>
           <div className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
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
                  />
                </div>

                <div className="space-y-2">
                  <Label>Website URL</Label>
                  <div className="relative">
                    <Input 
                      value={appConfig.websiteUrl}
                      onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
                      className="pl-9"
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

            <div className="rounded-xl border border-blue-100 bg-blue-50 p-6">
              <h3 className="mb-2 font-semibold text-blue-900">How it works</h3>
              <p className="text-sm text-blue-700 leading-relaxed">
                Changes you make here update your app instantly. Users simply need to restart the app to see the new configuration. No app store submission required.
              </p>
            </div>
          </div>

          {/* Right Column: Preview & Actions */}
          <div className="lg:col-span-7 space-y-6">
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

                   <div className="w-full max-w-sm space-y-3 pt-4 border-t border-gray-100 mt-4">
                      <Button className="w-full h-12 text-base font-semibold shadow-lg shadow-indigo-200 bg-black hover:bg-gray-800">
                        <Download className="mr-2" size={20} /> Download APK
                      </Button>
                      <p className="text-center text-xs text-gray-400">
                        Version 1.0.0 • 15.4 MB
                      </p>
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