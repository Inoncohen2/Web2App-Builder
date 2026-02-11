
import React, { useRef, useState, useEffect } from 'react';
import { AppConfig } from '../types';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Switch } from './ui/Switch';
import { 
  Upload, Globe, Sun, Moon, Monitor, Check, Plus, RefreshCw, 
  Layout, Image as ImageIcon, Maximize, ExternalLink, BatteryCharging, Move, X,
  ShieldCheck, ChevronDown, ChevronUp, FileText, AlertCircle
} from 'lucide-react';

interface ConfigPanelProps {
  config: AppConfig;
  onChange: (key: keyof AppConfig, value: any) => void;
  onUrlBlur?: () => void; // New prop for triggering scrape
}

// Expanded list that adapts to screen width
const PRESET_COLORS = [
  '#000000', // Black
  '#2563eb', // Blue
  '#dc2626', // Red
  '#ea580c', // Orange
  '#16a34a', // Green
  '#7c3aed', // Purple (Hidden on small/medium)
  '#db2777', // Pink (Hidden on small/medium)
  '#0891b2', // Cyan (Hidden on medium)
];

export const ConfigPanel: React.FC<ConfigPanelProps> = ({ config, onChange, onUrlBlur }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Initialize expanded state based on whether data exists
  const [isLegalExpanded, setIsLegalExpanded] = useState(
    !!config.privacyPolicyUrl || !!config.termsOfServiceUrl
  );
  
  // Validation State
  const [errors, setErrors] = useState({
    privacy: '',
    terms: ''
  });

  // Update expansion state if external config changes (e.g. loading from DB)
  useEffect(() => {
    if (config.privacyPolicyUrl || config.termsOfServiceUrl) {
      setIsLegalExpanded(true);
    }
  }, [config.privacyPolicyUrl, config.termsOfServiceUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onChange('appIcon', event.target?.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const validateUrl = (key: 'privacy' | 'terms', value: string) => {
    if (!value) {
      setErrors(prev => ({ ...prev, [key]: '' }));
      return;
    }
    try {
      new URL(value);
      setErrors(prev => ({ ...prev, [key]: '' }));
    } catch (e) {
      setErrors(prev => ({ ...prev, [key]: 'Invalid URL (must start with http:// or https://)' }));
    }
  };

  // Logic to determine if current color is custom
  const isCustomColor = !PRESET_COLORS.includes(config.primaryColor);

  return (
    <div className="flex h-full flex-col bg-white/50 backdrop-blur-sm">
      <div className="px-6 py-6 pb-2 text-center">
        <h2 className="text-2xl font-bold tracking-tight text-gray-900">App Design</h2>
        <p className="text-sm text-gray-500">Craft the look and feel of your app.</p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 no-scrollbar">
        
        {/* Section: Identity (Icon & Name) */}
        <section className="space-y-6">
          <div className="flex flex-col items-center justify-center gap-4">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative group cursor-pointer"
            >
              <div className={`h-32 w-32 rounded-[2rem] shadow-xl transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl overflow-hidden ${config.appIcon ? '' : 'border-4 border-dashed border-gray-300 bg-gray-50'}`}>
                {config.appIcon ? (
                  <img src={config.appIcon} alt="App Icon" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center text-gray-400">
                    <Upload size={32} className="mb-2 opacity-50" />
                    <span className="text-[10px] font-medium uppercase tracking-wider">Upload</span>
                  </div>
                )}
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                   {config.appIcon && <span className="opacity-0 group-hover:opacity-100 bg-white/90 text-black text-xs font-bold px-3 py-1 rounded-full shadow-sm">Edit</span>}
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
            
            <div className="w-full relative">
              <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1 mb-1.5 block">App Name</Label>
              <div className="relative">
                <Input
                  value={config.appName}
                  onChange={(e) => onChange('appName', e.target.value)}
                  placeholder="My App"
                  className="h-12 text-lg font-semibold bg-white shadow-sm border-gray-200 focus:ring-emerald-500/20 pr-10"
                />
                {config.appName && (
                  <button 
                    onClick={() => onChange('appName', '')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Section: Branding (Color) */}
        <section className="space-y-3">
          <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Brand Color</Label>
          
          {/* Flex container that doesn't wrap, but items hide based on breakpoints */}
          <div className="flex items-center gap-3 pb-2 justify-between lg:justify-start">
            
            {/* Custom Color Indicator (appears at start if selected and not preset) */}
            {isCustomColor && (
              <button
                className="h-10 w-10 shrink-0 rounded-full border-2 border-gray-900 scale-110 transition-all flex items-center justify-center shadow-sm"
                style={{ backgroundColor: config.primaryColor }}
              >
                <Check size={16} className="text-white drop-shadow-md" />
              </button>
            )}

            {PRESET_COLORS.map((color, index) => {
              // Updated visibility logic for 40% width sidebar:
              // Index 0-3: Always Visible (4 colors)
              // Index 4-5: Visible on XL+ (1280px+) - Hidden on LG
              // Index 6+: Visible on 2XL+ (1536px+)
              
              let visibilityClass = '';
              if (index >= 4) visibilityClass = 'hidden xl:block'; 
              if (index >= 6) visibilityClass = 'hidden 2xl:block'; 
              
              return (
                <button
                  key={color}
                  onClick={() => onChange('primaryColor', color)}
                  className={`h-10 w-10 shrink-0 rounded-full border-2 transition-all flex items-center justify-center shadow-sm hover:scale-110 ${visibilityClass} ${config.primaryColor === color ? 'border-gray-900 scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: color }}
                >
                  {config.primaryColor === color && <Check size={16} className="text-white drop-shadow-md" />}
                </button>
              );
            })}
            
            {/* Custom Color Picker Trigger (Always at the end, margin auto to push right if space) */}
            <div className="relative h-10 w-10 shrink-0 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm cursor-pointer hover:bg-gray-50 overflow-hidden group ml-auto sm:ml-0">
               <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500 via-green-500 to-teal-500 opacity-20 group-hover:opacity-30"></div>
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
           <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Appearance</Label>
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
                      ? 'border-emerald-600 bg-emerald-50/50 text-emerald-700 ring-1 ring-emerald-600 ring-offset-0' 
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
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
          <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Content Source</Label>
          <div className="relative group">
            <Globe className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
            <Input
              value={config.websiteUrl}
              onChange={(e) => onChange('websiteUrl', e.target.value.toLowerCase())} // Enforce lowercase
              onBlur={onUrlBlur} // Trigger scrape on blur
              placeholder="https://example.com"
              className="pl-10 pr-10 h-12 bg-white border-gray-200 focus:ring-emerald-500/20"
            />
            {config.websiteUrl && (
              <button 
                onClick={() => {
                   onChange('websiteUrl', '');
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </section>
        
        {/* Section: Interface Settings */}
        <section className="space-y-3">
          <Label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Interface & Behavior</Label>
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden divide-y divide-gray-100">
             
             {/* Navigation Bar Toggle - BLUE */}
             <div className="flex items-center justify-between p-4 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-3">
                   <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                      <Layout size={18} />
                   </div>
                   <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">Native Navigation</span>
                      <span className="text-[10px] text-gray-500">Top bar with title</span>
                   </div>
                </div>
                <Switch 
                  checked={config.showNavBar} 
                  onCheckedChange={(v) => onChange('showNavBar', v)} 
                  checkedColor="bg-blue-600"
                />
             </div>

             {/* Pull to Refresh - EMERALD */}
             <div className="flex items-center justify-between p-4 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-3">
                   <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                      <RefreshCw size={18} />
                   </div>
                   <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">Pull to Refresh</span>
                      <span className="text-[10px] text-gray-500">Swipe down to reload</span>
                   </div>
                </div>
                <Switch 
                  checked={config.enablePullToRefresh} 
                  onCheckedChange={(v) => onChange('enablePullToRefresh', v)} 
                  checkedColor="bg-emerald-500"
                />
             </div>

             {/* Splash Screen - PURPLE */}
             <div className="flex flex-col p-4 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                   <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                         <ImageIcon size={18} />
                      </div>
                      <div className="flex flex-col">
                         <span className="text-sm font-medium text-gray-900">Splash Screen</span>
                         <span className="text-[10px] text-gray-500">Loading screen</span>
                      </div>
                   </div>
                   <Switch 
                     checked={config.showSplashScreen} 
                     onCheckedChange={(v) => onChange('showSplashScreen', v)} 
                     checkedColor="bg-purple-600"
                   />
                </div>
                
                {/* Splash Color Picker */}
                {config.showSplashScreen && (
                   <div className="ml-11 pl-1 flex items-center gap-3 animate-in fade-in slide-in-from-top-1">
                      <span className="text-[10px] text-gray-400 font-medium">Background:</span>
                      <div className="relative h-6 w-full max-w-[120px] rounded-md border border-gray-200 overflow-hidden cursor-pointer group">
                        <div className="absolute inset-0" style={{ backgroundColor: (config as any).splashColor || '#ffffff' }}></div>
                        <input 
                           type="color" 
                           value={(config as any).splashColor || '#ffffff'}
                           onChange={(e) => onChange('splashColor' as keyof AppConfig, e.target.value)}
                           className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                        />
                      </div>
                   </div>
                )}
             </div>

             {/* Pinch to Zoom - ORANGE */}
             <div className="flex items-center justify-between p-4 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-3">
                   <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                      <Maximize size={18} />
                   </div>
                   <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">Pinch to Zoom</span>
                      <span className="text-[10px] text-gray-500">Enable zooming gestures</span>
                   </div>
                </div>
                <Switch 
                  checked={(config as any).enableZoom ?? false} 
                  onCheckedChange={(v) => onChange('enableZoom' as keyof AppConfig, v)} 
                  checkedColor="bg-orange-500"
                />
             </div>

             {/* Keep Awake - AMBER */}
             <div className="flex items-center justify-between p-4 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-3">
                   <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                      <BatteryCharging size={18} />
                   </div>
                   <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">Keep Awake</span>
                      <span className="text-[10px] text-gray-500">Prevent sleep mode</span>
                   </div>
                </div>
                <Switch 
                  checked={(config as any).keepAwake ?? false} 
                  onCheckedChange={(v) => onChange('keepAwake' as keyof AppConfig, v)} 
                  checkedColor="bg-amber-500"
                />
             </div>

             {/* Open External Links - ROSE */}
             <div className="flex items-center justify-between p-4 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-3">
                   <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
                      <ExternalLink size={18} />
                   </div>
                   <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">External Links</span>
                      <span className="text-[10px] text-gray-500">Open outside app</span>
                   </div>
                </div>
                <Switch 
                   checked={(config as any).openExternalLinks ?? true} 
                   onCheckedChange={(v) => onChange('openExternalLinks' as keyof AppConfig, v)} 
                   checkedColor="bg-rose-500"
                />
             </div>

             {/* Orientation - SLATE (Select) */}
             <div className="flex items-center justify-between p-4 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-3">
                   <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                      <Move size={18} />
                   </div>
                   <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">Orientation</span>
                      <span className="text-[10px] text-gray-500">Screen rotation</span>
                   </div>
                </div>
                <select 
                  value={(config as any).orientation || 'auto'}
                  onChange={(e) => onChange('orientation' as keyof AppConfig, e.target.value)}
                  className="bg-gray-50 border border-gray-200 text-gray-900 text-xs rounded-lg p-2 focus:ring-emerald-500 focus:border-emerald-500 block"
                >
                  <option value="auto">Auto</option>
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
             </div>

          </div>
        </section>

        {/* Section: Legal & Compliance (Redesigned) */}
        <section className="space-y-3 pt-2 border-t border-gray-100">
          {!isLegalExpanded ? (
            <button 
              onClick={() => setIsLegalExpanded(true)}
              className="flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors w-full py-2 px-1 hover:bg-gray-50 rounded-lg group"
            >
              <ShieldCheck size={14} className="text-gray-400 group-hover:text-emerald-500 transition-colors" />
              <span>Configure Legal URLs</span>
              {(config.privacyPolicyUrl || config.termsOfServiceUrl) && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
              )}
            </button>
          ) : (
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 animate-in fade-in slide-in-from-top-1 relative">
               <button 
                 onClick={() => setIsLegalExpanded(false)}
                 className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-colors"
               >
                 <X size={14} />
               </button>
               
               <div className="mb-4">
                 <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-emerald-600" /> Legal Compliance
                 </span>
                 <p className="text-[10px] text-gray-500 mt-1 leading-tight">Links required for app store publishing.</p>
               </div>

               <div className="space-y-4">
                 {/* Privacy Policy */}
                 <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Privacy Policy</Label>
                      <a href="https://app-privacy-policy-generator.firebaseapp.com/" target="_blank" rel="noopener noreferrer" className="text-[9px] text-emerald-600 hover:underline flex items-center gap-0.5">
                        Generate <ExternalLink size={8} />
                      </a>
                    </div>
                    <Input
                      value={config.privacyPolicyUrl || ''}
                      onChange={(e) => {
                         onChange('privacyPolicyUrl', e.target.value);
                         validateUrl('privacy', e.target.value);
                      }}
                      onBlur={() => validateUrl('privacy', config.privacyPolicyUrl)}
                      placeholder="https://site.com/privacy"
                      className={`h-9 text-xs bg-white ${errors.privacy ? 'border-red-300' : 'border-gray-200'}`}
                    />
                    {errors.privacy && <p className="text-[10px] text-red-500">{errors.privacy}</p>}
                 </div>

                 {/* Terms */}
                 <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Terms of Service</Label>
                    <Input
                      value={config.termsOfServiceUrl || ''}
                      onChange={(e) => {
                        onChange('termsOfServiceUrl', e.target.value);
                        validateUrl('terms', e.target.value);
                      }}
                      onBlur={() => validateUrl('terms', config.termsOfServiceUrl)}
                      placeholder="https://site.com/terms"
                      className={`h-9 text-xs bg-white ${errors.terms ? 'border-red-300' : 'border-gray-200'}`}
                    />
                    {errors.terms && <p className="text-[10px] text-red-500">{errors.terms}</p>}
                 </div>
               </div>
            </div>
          )}
        </section>

      </div>
    </div>
  );
};
