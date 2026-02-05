import React, { useState } from 'react';
import { AppConfig } from '../types';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Switch } from './ui/Switch';
import { Tabs } from './ui/Tabs';
import { Upload, Smartphone, Globe, Palette, Layout, Info } from 'lucide-react';

interface ConfigPanelProps {
  config: AppConfig;
  onChange: (key: keyof AppConfig, value: any) => void;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({ config, onChange }) => {
  const [activeTab, setActiveTab] = useState('general');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onChange('appIcon', event.target?.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  return (
    <div className="flex h-full flex-col bg-white border-r border-gray-200">
      <div className="border-b border-gray-200 px-6 py-4">
        <h2 className="text-xl font-bold tracking-tight text-gray-900">App Configuration</h2>
        <p className="text-sm text-gray-500">Customize how your app looks and behaves.</p>
      </div>

      <div className="px-6 py-4">
        <Tabs
          tabs={[
            { id: 'general', label: 'General' },
            { id: 'branding', label: 'Branding' },
            { id: 'interface', label: 'Interface' },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
          className="w-full bg-gray-100/50"
        />
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-12">
        {activeTab === 'general' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <Globe size={18} />
                <h3>App Information</h3>
              </div>
              
              <Input
                label="App Name"
                value={config.appName}
                onChange={(e) => onChange('appName', e.target.value)}
                placeholder="My Awesome App"
              />

              <Input
                label="Website URL"
                value={config.websiteUrl}
                onChange={(e) => onChange('websiteUrl', e.target.value)}
                placeholder="https://example.com"
                type="url"
              />

              <div className="space-y-2">
                 <Label>User Agent (Optional)</Label>
                 <Input
                  value={config.userAgent}
                  onChange={(e) => onChange('userAgent', e.target.value)}
                  placeholder="Custom User Agent String"
                />
                 <p className="text-xs text-gray-400">Identify your app traffic to your server.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'branding' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
             <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <Palette size={18} />
                <h3>Visual Identity</h3>
              </div>

              <div className="space-y-2">
                <Label>App Icon</Label>
                <div className="flex items-center gap-4">
                   <div className="relative flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-gray-300 bg-gray-50">
                      {config.appIcon ? (
                        <img src={config.appIcon} alt="Preview" className="h-full w-full object-cover" />
                      ) : (
                        <Smartphone className="h-8 w-8 text-gray-300" />
                      )}
                   </div>
                   <div className="flex-1">
                      <label 
                        htmlFor="icon-upload" 
                        className="inline-flex cursor-pointer items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Icon
                      </label>
                      <input 
                        id="icon-upload" 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleFileChange}
                      />
                      <p className="mt-2 text-xs text-gray-500">Recommended: 512x512px PNG</p>
                   </div>
                </div>
              </div>

              <div className="space-y-2">
                 <Label>Primary Color</Label>
                 <div className="flex items-center gap-3">
                    <input 
                      type="color" 
                      value={config.primaryColor}
                      onChange={(e) => onChange('primaryColor', e.target.value)}
                      className="h-10 w-20 cursor-pointer overflow-hidden rounded-md border border-gray-200 p-1"
                    />
                    <Input 
                      value={config.primaryColor} 
                      onChange={(e) => onChange('primaryColor', e.target.value)}
                      className="font-mono uppercase"
                      maxLength={7}
                    />
                 </div>
              </div>

              <div className="space-y-2">
                <Label>Theme Mode</Label>
                <div className="grid grid-cols-3 gap-3">
                  {['system', 'light', 'dark'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => onChange('themeMode', mode)}
                      className={`
                        flex items-center justify-center rounded-md border py-2 text-sm font-medium capitalize transition-all
                        ${config.themeMode === mode 
                          ? 'border-black bg-black text-white shadow-sm' 
                          : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                        }
                      `}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'interface' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
             <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                <Layout size={18} />
                <h3>Navigation & Features</h3>
              </div>
              
              <div className="rounded-lg border border-gray-200 p-4">
                 <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                       <Label className="text-base">Show Navigation Bar</Label>
                       <p className="text-xs text-gray-500">Display the top native navigation header.</p>
                    </div>
                    <Switch 
                      checked={config.showNavBar}
                      onCheckedChange={(val) => onChange('showNavBar', val)}
                    />
                 </div>
              </div>

              <div className="rounded-lg border border-gray-200 p-4">
                 <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                       <Label className="text-base">Pull-to-Refresh</Label>
                       <p className="text-xs text-gray-500">Allow users to pull down to reload the page.</p>
                    </div>
                    <Switch 
                      checked={config.enablePullToRefresh}
                      onCheckedChange={(val) => onChange('enablePullToRefresh', val)}
                    />
                 </div>
              </div>

              <div className="rounded-lg border border-gray-200 p-4">
                 <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                       <Label className="text-base">Splash Screen</Label>
                       <p className="text-xs text-gray-500">Show app icon while website loads.</p>
                    </div>
                    <Switch 
                      checked={config.showSplashScreen}
                      onCheckedChange={(val) => onChange('showSplashScreen', val)}
                    />
                 </div>
              </div>
             </div>
          </div>
        )}
      </div>
      
      {/* Footer / Info */}
      <div className="border-t border-gray-200 bg-gray-50 p-4">
        <div className="flex items-start gap-3 rounded-md bg-blue-50 p-3 text-sm text-blue-700">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Changes are previewed instantly. Click "Build App" on the top right when you are ready to export.
          </p>
        </div>
      </div>
    </div>
  );
};