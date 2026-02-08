import React, { useRef } from 'react';
import { AppConfig } from '../types';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Switch } from './ui/Switch';
import { 
  Upload, Globe, Layout, 
  Sun, Moon, Monitor, Check, Plus, RefreshCw, Image as ImageIcon
} from 'lucide-react';

interface ConfigPanelProps {
  config: AppConfig;
  onChange: (key: keyof AppConfig, value: any) => void;
}

const PRESET_COLORS = [
  '#000000', // Black
  '#ffffff', // White
  '#4f46e5', // Indigo
  '#dc2626', // Red
  '#ea580c', // Orange
  '#16a34a', // Green
  '#2563eb', // Blue
];

export const ConfigPanel: React.FC<ConfigPanelProps> = ({ config, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    <div className="flex h-full flex-col bg-black text-white">
      <div className="px-6 py-6 pb-4 border-b border-zinc-800">
        <h2 className="text-xl font-bold tracking-tight text-white">App Design</h2>
        <p className="text-xs text-zinc-500">Configure your app appearance.</p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 no-scrollbar">
        
        {/* Section: Identity (Icon & Name) */}
        <section className="space-y-6">
          <div className="flex flex-col items-center justify-center gap-4">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative group cursor-pointer"
            >
              <div className={`h-28 w-28 rounded-2xl shadow-2xl transition-all duration-300 overflow-hidden border border-zinc-800 bg-zinc-900`}>
                {config.appIcon ? (
                  <img src={config.appIcon} alt="App Icon" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center text-zinc-600">
                    <Upload size={24} className="mb-2" />
                    <span className="text-[10px] font-medium uppercase tracking-wider">Upload</span>
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <span className="text-xs font-bold text-white border border-white/20 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md">Edit</span>
                </div>
              </div>
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileChange}
              />
            </div>
            
            <div className="w-full">
              <Input
                label="App Name"
                value={config.appName}
                onChange={(e) => onChange('appName', e.target.value)}
                placeholder="My App"
                className="h-12 text-lg font-semibold bg-zinc-900/50 border-zinc-800 focus:border-white"
              />
            </div>
          </div>
        </section>

        {/* Section: Branding (Color) */}
        <section className="space-y-3">
          <Label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Brand Color</Label>
          <div className="flex flex-wrap gap-3">
            {PRESET_COLORS.map(color => (
              <button
                key={color}
                onClick={() => onChange('primaryColor', color)}
                className={`h-9 w-9 rounded-full border transition-all flex items-center justify-center ${config.primaryColor === color ? 'border-white scale-110' : 'border-transparent hover:scale-105'}`}
                style={{ backgroundColor: color }}
              >
                {config.primaryColor === color && <Check size={14} className={color === '#ffffff' ? 'text-black' : 'text-white'} />}
              </button>
            ))}
            <div className="relative h-9 w-9 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center cursor-pointer hover:bg-zinc-800 overflow-hidden group">
               <input 
                 type="color" 
                 value={config.primaryColor}
                 onChange={(e) => onChange('primaryColor', e.target.value)}
                 className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
               />
               <Plus size={14} className="text-zinc-500 group-hover:text-white" />
            </div>
          </div>
        </section>

        {/* Section: Appearance (Theme) */}
        <section className="space-y-3">
           <Label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Appearance</Label>
           <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'light', label: 'Light', icon: Sun },
                { id: 'dark', label: 'Dark', icon: Moon },
                { id: 'system', label: 'Auto', icon: Monitor },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => onChange('themeMode', item.id)}
                  className={`
                    flex flex-col items-center gap-2 rounded-lg border p-3 transition-all duration-200
                    ${config.themeMode === item.id 
                      ? 'border-white bg-white text-black' 
                      : 'border-zinc-800 bg-zinc-900 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
                    }
                  `}
                >
                  <item.icon size={18} strokeWidth={2.5} />
                  <span className="text-[10px] font-bold uppercase">{item.label}</span>
                </button>
              ))}
           </div>
        </section>

        {/* Section: Content Source */}
        <section className="space-y-3">
          <div className="relative">
            <Globe className="absolute left-3 top-3.5 text-zinc-600" size={16} />
            <Input
              label="Website URL"
              value={config.websiteUrl}
              onChange={(e) => onChange('websiteUrl', e.target.value)}
              placeholder="https://example.com"
              className="pl-10 h-11"
            />
          </div>
        </section>

        {/* Section: Interface Settings */}
        <section className="space-y-3">
          <Label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Interface</Label>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 overflow-hidden divide-y divide-zinc-800">
             
             <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                   <Layout size={16} className="text-zinc-400" />
                   <span className="text-sm font-medium text-white">Native Nav Bar</span>
                </div>
                <Switch checked={config.showNavBar} onCheckedChange={(v) => onChange('showNavBar', v)} />
             </div>

             <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                   <RefreshCw size={16} className="text-zinc-400" />
                   <span className="text-sm font-medium text-white">Pull to Refresh</span>
                </div>
                <Switch checked={config.enablePullToRefresh} onCheckedChange={(v) => onChange('enablePullToRefresh', v)} />
             </div>

             <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                   <ImageIcon size={16} className="text-zinc-400" />
                   <span className="text-sm font-medium text-white">Splash Screen</span>
                </div>
                <Switch checked={config.showSplashScreen} onCheckedChange={(v) => onChange('showSplashScreen', v)} />
             </div>

          </div>
        </section>

      </div>
    </div>
  );
};