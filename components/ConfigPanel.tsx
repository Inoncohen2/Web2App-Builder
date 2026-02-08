
import React, { useRef } from 'react';
import { AppConfig } from '../types';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Switch } from './ui/Switch';
import { 
  Upload, Smartphone, Globe, Palette, Layout, Info, 
  Sun, Moon, Monitor, Check, Plus, RefreshCw, Image as ImageIcon
} from 'lucide-react';

interface ConfigPanelProps {
  config: AppConfig;
  onChange: (key: keyof AppConfig, value: any) => void;
}

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
    <div className="flex h-full flex-col bg-[#050505] text-white">
      <div className="px-6 py-6 pb-2 border-b border-white/5">
        <h2 className="text-xl font-bold tracking-tight text-white">App Design</h2>
        <p className="text-xs text-gray-500">Craft the look and feel of your app.</p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 no-scrollbar">
        
        {/* Section: Identity (Icon & Name) */}
        <section className="space-y-6">
          <div className="flex flex-col items-center justify-center gap-4">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative group cursor-pointer"
            >
              <div className={`h-32 w-32 rounded-[2rem] shadow-2xl transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl overflow-hidden border-4 ${config.appIcon ? 'border-transparent' : 'border-dashed border-white/10 bg-white/5'}`}>
                {config.appIcon ? (
                  <img src={config.appIcon} alt="App Icon" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center text-gray-500">
                    <Upload size={32} className="mb-2 opacity-50" />
                    <span className="text-[10px] font-medium uppercase tracking-wider">Upload</span>
                  </div>
                )}
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                   {config.appIcon && <span className="opacity-0 group-hover:opacity-100 bg-white text-black text-xs font-bold px-3 py-1 rounded-full shadow-sm">Edit</span>}
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
              <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1 mb-1.5 block">App Name</Label>
              <Input
                value={config.appName}
                onChange={(e) => onChange('appName', e.target.value)}
                placeholder="My App"
                className="h-12 text-lg font-semibold bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-white/30 rounded-xl"
              />
            </div>
          </div>
        </section>

        {/* Section: Branding (Color) */}
        <section className="space-y-3">
          <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Brand Color</Label>
          <div className="flex flex-wrap gap-3">
            {PRESET_COLORS.map(color => (
              <button
                key={color}
                onClick={() => onChange('primaryColor', color)}
                className={`h-10 w-10 rounded-full border-2 transition-all flex items-center justify-center shadow-sm hover:scale-110 ${config.primaryColor === color ? 'border-white scale-110' : 'border-transparent'}`}
                style={{ backgroundColor: color }}
              >
                {config.primaryColor === color && <Check size={16} className="text-white drop-shadow-md" />}
              </button>
            ))}
            {/* Custom Color Picker Trigger */}
            <div className="relative h-10 w-10 rounded-full bg-[#111] border border-white/10 flex items-center justify-center shadow-sm cursor-pointer hover:bg-white/5 overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 opacity-20 group-hover:opacity-30"></div>
               <input 
                 type="color" 
                 value={config.primaryColor}
                 onChange={(e) => onChange('primaryColor', e.target.value)}
                 className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
               />
               <Plus size={16} className="text-gray-500" />
            </div>
          </div>
        </section>

        {/* Section: Appearance (Theme) */}
        <section className="space-y-3">
           <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Appearance</Label>
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
                    relative flex flex-col items-center gap-2 rounded-xl border p-3 transition-all duration-200
                    ${config.themeMode === item.id 
                      ? 'border-white bg-white/10 text-white' 
                      : 'border-white/5 bg-[#0A0A0A] text-gray-500 hover:border-white/20 hover:text-gray-300'
                    }
                  `}
                >
                  <item.icon size={20} strokeWidth={2.5} />
                  <span className="text-xs font-medium">{item.label}</span>
                </button>
              ))}
           </div>
        </section>

        {/* Section: Content Source */}
        <section className="space-y-3">
          <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Content Source</Label>
          <div className="relative group">
            <Globe className="absolute left-3 top-3.5 text-gray-500 group-focus-within:text-white transition-colors" size={18} />
            <Input
              value={config.websiteUrl}
              onChange={(e) => onChange('websiteUrl', e.target.value)}
              placeholder="https://example.com"
              className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-white/30 rounded-xl"
            />
          </div>
        </section>

        {/* Section: Interface Settings (iOS Style Tiles) */}
        <section className="space-y-3">
          <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider ml-1">Interface</Label>
          <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden divide-y divide-white/5">
             
             {/* Navigation Bar Toggle */}
             <div className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                   <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                      <Layout size={18} />
                   </div>
                   <div className="flex flex-col">
                      <span className="text-sm font-medium text-white">Native Navigation</span>
                      <span className="text-[10px] text-gray-500">Top bar with title</span>
                   </div>
                </div>
                <Switch checked={config.showNavBar} onCheckedChange={(v) => onChange('showNavBar', v)} />
             </div>

             {/* Pull to Refresh */}
             <div className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                   <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                      <RefreshCw size={18} />
                   </div>
                   <div className="flex flex-col">
                      <span className="text-sm font-medium text-white">Pull to Refresh</span>
                      <span className="text-[10px] text-gray-500">Swipe down to reload</span>
                   </div>
                </div>
                <Switch checked={config.enablePullToRefresh} onCheckedChange={(v) => onChange('enablePullToRefresh', v)} />
             </div>

             {/* Splash Screen */}
             <div className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                   <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
                      <ImageIcon size={18} />
                   </div>
                   <div className="flex flex-col">
                      <span className="text-sm font-medium text-white">Splash Screen</span>
                      <span className="text-[10px] text-gray-500">Loading screen</span>
                   </div>
                </div>
                <Switch checked={config.showSplashScreen} onCheckedChange={(v) => onChange('showSplashScreen', v)} />
             </div>

          </div>
        </section>

      </div>
    </div>
  );
};
