
'use client';

import React, { useRef, useState, useEffect } from 'react';
import { AppConfig, NativeTab, LinkRule } from '../types';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Switch } from './ui/Switch';
import { Button } from './ui/Button';
import { SigningPanel } from './SigningPanel';
import {
  Upload, Globe, Sun, Moon, Monitor, Check, Plus, RefreshCw,
  Layout, Image as ImageIcon, Maximize, ExternalLink, BatteryCharging,
  Move, X, ShieldCheck, ChevronDown, ChevronUp, FileText, AlertCircle,
  Palette, Key, Bell, BarChart2, Fingerprint, Smartphone, QrCode,
  Zap, Link, Star, ShoppingCart, Lock, Search, Code, Wifi, WifiOff,
  Navigation, Chrome, Info, Trash2, GripVertical, Settings, Eye,
  Camera, LogIn, Shield, Package, Sparkles, Radio, Globe2,
  Hash, AlignLeft, Tag, Layers, ChevronRight, ToggleLeft,
  MessageSquare, Activity, AlertTriangle, RotateCcw,
  Home, User, Heart, Menu, MenuSquare, ArrowLeft
} from 'lucide-react';

interface ConfigPanelProps {
  config: AppConfig;
  onChange: (key: keyof AppConfig, value: any) => void;
  onUrlBlur?: () => void;
  onReset?: () => void; // New prop for reset action
  isLoading?: boolean;
  appId?: string | null;
  packageName?: string;
}

const PRESET_COLORS = ['#000000','#2563eb','#dc2626','#ea580c','#16a34a','#7c3aed','#db2777','#0891b2'];

// Mapping for Icon Picker
const TAB_ICON_MAP: Record<string, any> = {
  home: Home,
  search: Search,
  cart: ShoppingCart,
  profile: User,
  settings: Settings,
  bell: Bell,
  heart: Heart,
  star: Star,
  chat: MessageSquare,
  menu: Menu,
};

// Security: Sanitization Helper
const sanitizeString = (str: string) => str.replace(/[<>]/g, '').trim();

// ─────────────────────────────────────────────────────────────────
// Shared Components
// ─────────────────────────────────────────────────────────────────

// Accordion Section
const Accordion = ({ 
  title, 
  icon: Icon, 
  defaultOpen = false, 
  children 
}: { 
  title: string; 
  icon: any; 
  defaultOpen?: boolean; 
  children?: React.ReactNode 
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm transition-all duration-300">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-3.5 bg-white hover:bg-gray-50 transition-colors ${isOpen ? 'border-b border-gray-100' : ''}`}
      >
        <div className="flex items-center gap-3">
           <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${isOpen ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'}`}>
              <Icon size={16} />
           </div>
           <span className="text-sm font-bold text-gray-900">{title}</span>
        </div>
        {isOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>
      
      {isOpen && (
        <div className="p-4 space-y-5 animate-in fade-in slide-in-from-top-2">
           {children}
        </div>
      )}
    </div>
  );
};

// Feature row with toggle
const FeatureRow = ({
  icon: Icon, label, description, value, onChange, children, badge
}: {
  icon: any; label: string; description?: string; value: boolean;
  onChange: (v: boolean) => void; children?: React.ReactNode; badge?: string;
}) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 border ${value ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-white border-gray-200 text-gray-400'}`}>
          <Icon size={14} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-800">{label}</span>
            {badge && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-600 border border-blue-200">{badge}</span>}
          </div>
          {description && <p className="text-xs text-gray-400 truncate">{description}</p>}
        </div>
      </div>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
    {value && children && (
      <div className="ml-11 pl-4 border-l-2 border-gray-100 space-y-3 animate-in fade-in slide-in-from-top-1">
        {children}
      </div>
    )}
  </div>
);

const Select = ({ label, value, onChange, options }: {
  label?: string; value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) => (
  <div className="space-y-1.5">
    {label && <Label className="text-xs font-medium text-gray-600">{label}</Label>}
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full text-xs border border-gray-200 rounded-md px-3 py-2 bg-white text-gray-800 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-shadow"
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

const TextArea = ({ label, value, onChange, placeholder, rows = 3, maxLength, className }: {
  label?: string; value: string; onChange: (v: string) => void;
  placeholder?: string; rows?: number; maxLength?: number; className?: string;
}) => (
  <div className={`space-y-1.5 ${className || ''}`}>
    {label && (
      <div className="flex justify-between">
        <Label className="text-xs font-medium text-gray-600">{label}</Label>
        {maxLength && <span className="text-[10px] text-gray-400">{value?.length || 0}/{maxLength}</span>}
      </div>
    )}
    <textarea
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      maxLength={maxLength}
      className="w-full text-xs border border-gray-200 rounded-md px-3 py-2 bg-white text-gray-800 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 resize-none font-mono"
    />
  </div>
);

const InfoBox = ({ children, type = 'info' }: { children?: React.ReactNode; type?: 'info' | 'warning' | 'success' }) => {
  if (!children) return null;
  const styles = {
    info: 'bg-blue-50 border-blue-200 text-blue-700',
    warning: 'bg-amber-50 border-amber-200 text-amber-700',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  };
  return (
    <div className={`text-xs p-3 rounded-lg border flex items-start gap-2 ${styles[type]}`}>
      <Info size={14} className="mt-0.5 flex-shrink-0" />
      <span className="leading-relaxed">{children}</span>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
export const ConfigPanel: React.FC<ConfigPanelProps> = ({ config, onChange, onUrlBlur, onReset, isLoading = false, appId, packageName }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState('branding');
  const [activeIconPickerId, setActiveIconPickerId] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => onChange('appIcon', ev.target?.result as string);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const addNativeTab = () => {
    const tabs = [...(config.nativeTabs || [])];
    tabs.push({ id: Date.now().toString(), label: 'Tab', icon: 'home', url: config.websiteUrl });
    onChange('nativeTabs', tabs);
  };

  const removeNativeTab = (id: string) => {
    onChange('nativeTabs', (config.nativeTabs || []).filter((t: NativeTab) => t.id !== id));
  };

  const updateNativeTab = (id: string, field: string, value: string) => {
    const safeValue = sanitizeString(value); // Sanitize tabs input
    onChange('nativeTabs', (config.nativeTabs || []).map((t: NativeTab) => t.id === id ? { ...t, [field]: safeValue } : t));
  };

  const addLinkRule = () => {
    const rules = [...(config.linkRules || [])];
    rules.push({ pattern: '', action: 'open_internal' });
    onChange('linkRules', rules);
  };

  const removeLinkRule = (idx: number) => {
    onChange('linkRules', (config.linkRules || []).filter((_: any, i: number) => i !== idx));
  };

  const updateLinkRule = (idx: number, field: string, value: string) => {
    const safeValue = sanitizeString(value);
    onChange('linkRules', (config.linkRules || []).map((r: LinkRule, i: number) => i === idx ? { ...r, [field]: safeValue } : r));
  };

  const isCustomColor = !PRESET_COLORS.includes(config.primaryColor);

  // THE NEW 5 CATEGORIES
  const TABS = [
    { id: 'branding', label: 'Branding', icon: Palette },
    { id: 'interface', label: 'Interface', icon: Layout },
    { id: 'features', label: 'Features', icon: Zap },
    { id: 'publish', label: 'Publish', icon: Upload }, 
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex flex-col h-full bg-[#F6F8FA]">
      {/* Tabs Header */}
      <div className="px-3 pt-3 pb-0 bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="flex overflow-x-auto gap-6 pb-0 scrollbar-hide px-2">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 pb-3 pt-1 text-xs font-bold transition-all whitespace-nowrap relative
                  ${isActive ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}
                `}
              >
                <Icon size={16} className={isActive ? 'text-emerald-600' : 'text-gray-400'} />
                {tab.label}
                {isActive && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-t-full"></div>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">

        {/* ═══════════════════════════════════════════
            TAB 1: BRANDING (Identity, Visuals, Splash)
        ═══════════════════════════════════════════ */}
        {activeTab === 'branding' && (
          <>
            {/* Identity Accordion */}
            <Accordion title="App Identity" icon={Smartphone} defaultOpen={true}>
              <div className="space-y-4">
                <Input
                  label="App Name"
                  value={config.appName}
                  onChange={e => onChange('appName', sanitizeString(e.target.value))}
                  placeholder="My Awesome App"
                  className="text-sm font-semibold"
                  maxLength={30} // Hard limit to prevent DB overflows
                />
                <div>
                  <Input
                    label="Website URL"
                    value={config.websiteUrl}
                    onChange={e => onChange('websiteUrl', sanitizeString(e.target.value))}
                    onBlur={onUrlBlur}
                    placeholder="https://yourwebsite.com"
                    className="text-sm"
                    maxLength={255}
                  />
                  {onReset && (
                    <div className="flex justify-end mt-2">
                      <button
                        onClick={onReset}
                        disabled={isLoading}
                        className="text-[10px] flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 font-medium transition-colors disabled:opacity-50"
                        title="Rescans the website and resets name, icon and color"
                      >
                        <RotateCcw size={10} className={isLoading ? "animate-spin" : ""} />
                        {isLoading ? 'Fetching Data...' : 'Reset from Website'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </Accordion>

            {/* Visuals Accordion */}
            <Accordion title="Visuals & Theme" icon={Palette} defaultOpen={true}>
              {/* App Icon */}
              <div className="flex items-start gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100 mb-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="h-16 w-16 rounded-xl border border-gray-200 bg-white flex items-center justify-center cursor-pointer hover:border-gray-400 overflow-hidden shadow-sm flex-shrink-0"
                >
                  {config.appIcon ? (
                    <img src={config.appIcon} alt="Icon" className="w-full h-full object-cover" />
                  ) : (
                    <Upload size={20} className="text-gray-300" />
                  )}
                </div>
                <div className="flex-1">
                  <Label className="text-xs font-bold text-gray-900">App Icon</Label>
                  <p className="text-[10px] text-gray-500 mb-2">High-res PNG (1024x1024)</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="h-7 text-[10px]">Change</Button>
                    {config.appIcon && <Button variant="ghost" size="sm" onClick={() => onChange('appIcon', null)} className="h-7 text-[10px] text-red-500">Remove</Button>}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </div>
              </div>

              {/* Colors */}
              <div className="space-y-3">
                <Label className="text-xs font-medium text-gray-600">Primary Brand Color</Label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map(c => (
                    <button key={c} onClick={() => onChange('primaryColor', c)}
                      className={`h-7 w-7 rounded-full border-2 transition-all ${config.primaryColor === c ? 'border-gray-900 scale-110' : 'border-transparent hover:scale-105'}`}
                      style={{ backgroundColor: c }} />
                  ))}
                  <label className={`h-7 w-7 rounded-full border-2 cursor-pointer relative overflow-hidden ${isCustomColor ? 'border-gray-900 scale-110' : 'border-gray-200'}`}
                    style={{ background: isCustomColor ? config.primaryColor : 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)' }}>
                    <input type="color" value={config.primaryColor} onChange={e => onChange('primaryColor', e.target.value)} className="opacity-0 absolute inset-0 w-full h-full cursor-pointer" />
                  </label>
                </div>
              </div>

              {/* Theme Mode */}
              <div className="pt-2">
                <Label className="text-xs font-medium text-gray-600 mb-2 block">Appearance</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[{ v: 'light', l: 'Light', i: Sun }, { v: 'dark', l: 'Dark', i: Moon }, { v: 'system', l: 'Auto', i: Monitor }].map(({ v, l, i: Icon }) => (
                    <button key={v} onClick={() => onChange('themeMode', v)}
                      className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium border transition-all ${config.themeMode === v ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}>
                      <Icon size={12} /> {l}
                    </button>
                  ))}
                </div>
              </div>
            </Accordion>

            {/* Splash Accordion */}
            <Accordion title="Splash Screen" icon={Maximize}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium">Enable Splash</span>
                  <Switch checked={config.showSplashScreen} onCheckedChange={v => onChange('showSplashScreen', v)} />
                </div>
                {config.showSplashScreen && (
                  <div className="space-y-4">
                     <div className="flex items-center gap-3">
                        <Label className="text-xs text-gray-600 w-24">Background</Label>
                        <input type="color" value={config.splashColor || '#ffffff'} onChange={e => onChange('splashColor', e.target.value)} className="h-8 w-12 rounded border cursor-pointer" />
                     </div>
                     <Select label="Animation" value={config.splashAnimation || 'fade'} onChange={v => onChange('splashAnimation', v)}
                      options={[{ value: 'none', label: 'None' }, { value: 'fade', label: 'Fade In' }, { value: 'zoom', label: 'Zoom In' }]} />
                  </div>
                )}
            </Accordion>
          </>
        )}

        {/* ═══════════════════════════════════════════
            TAB 2: INTERFACE (Nav, WebView, Links)
        ═══════════════════════════════════════════ */}
        {activeTab === 'interface' && (
          <>
            {/* Navigation Accordion */}
            <Accordion title="Navigation" icon={Navigation} defaultOpen={true}>
               <FeatureRow icon={Layout} label="Navigation Bar" description="Top browser bar with title & controls" value={config.showNavBar} onChange={v => onChange('showNavBar', v)} />
               
               <div className="mt-4 pt-4 border-t border-gray-100">
                 <FeatureRow icon={Navigation} label="Native Tab Bar" description="Bottom tabs menu (App-like)" value={config.enableNativeNav || false} onChange={v => onChange('enableNativeNav', v)} badge="Pro">
                    <div className="space-y-3">
                      <Select label="Tab Style" value={config.tabBarStyle || 'labeled'} onChange={v => onChange('tabBarStyle', v)}
                        options={[{ value: 'labeled', label: 'Icons + Labels' }, { value: 'standard', label: 'Icons only' }, { value: 'floating', label: 'Floating' }]} />
                      
                      <div className="space-y-2">
                        {(config.nativeTabs || []).map((tab: NativeTab) => {
                          const IconComponent = TAB_ICON_MAP[tab.icon] || Home;
                          return (
                            <div key={tab.id} className="relative flex gap-2 items-center bg-gray-50 rounded-lg p-2 border border-gray-200">
                              
                              {/* Icon Button / Picker Trigger */}
                              <div className="relative">
                                <button 
                                  onClick={() => setActiveIconPickerId(activeIconPickerId === tab.id ? null : tab.id)}
                                  className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-md text-gray-600 hover:border-gray-400 hover:text-gray-900 transition-colors"
                                >
                                  <IconComponent size={16} />
                                </button>

                                {/* Icon Picker Popover */}
                                {activeIconPickerId === tab.id && (
                                  <>
                                    <div className="fixed inset-0 z-10" onClick={() => setActiveIconPickerId(null)}></div>
                                    <div className="absolute top-10 left-0 z-20 bg-white border border-gray-200 rounded-lg shadow-xl p-2 w-48 grid grid-cols-5 gap-1 animate-in fade-in zoom-in-95">
                                      {Object.entries(TAB_ICON_MAP).map(([key, Icon]) => (
                                        <button 
                                          key={key}
                                          onClick={() => {
                                            updateNativeTab(tab.id, 'icon', key);
                                            setActiveIconPickerId(null);
                                          }}
                                          className={`p-2 rounded hover:bg-gray-100 flex items-center justify-center ${tab.icon === key ? 'bg-emerald-50 text-emerald-600' : 'text-gray-600'}`}
                                          title={key}
                                        >
                                          <Icon size={16} />
                                        </button>
                                      ))}
                                    </div>
                                  </>
                                )}
                              </div>

                              <div className="flex-1 grid grid-cols-2 gap-2">
                                 <input value={tab.label} onChange={e => updateNativeTab(tab.id, 'label', e.target.value)} className="text-xs border rounded px-1.5 py-1" placeholder="Label" maxLength={15} />
                                 <input value={tab.url} onChange={e => updateNativeTab(tab.id, 'url', e.target.value)} className="text-[10px] border rounded px-1.5 py-1 font-mono" placeholder="https://..." />
                              </div>
                              <button onClick={() => removeNativeTab(tab.id)} className="text-gray-400 hover:text-red-500"><X size={14} /></button>
                            </div>
                          );
                        })}
                        {(config.nativeTabs || []).length < 5 && (
                          <Button variant="outline" size="sm" onClick={addNativeTab} className="w-full text-xs h-8"><Plus size={12} className="mr-1" /> Add Tab</Button>
                        )}
                      </div>
                    </div>
                 </FeatureRow>
               </div>
            </Accordion>

            {/* WebView Accordion */}
            <Accordion title="WebView Behaviors" icon={Chrome}>
               <div className="space-y-4">
                  <FeatureRow icon={RefreshCw} label="Pull to Refresh" description="Swipe down to reload" value={config.enablePullToRefresh} onChange={v => onChange('enablePullToRefresh', v)} />
                  <FeatureRow icon={Maximize} label="Pinch to Zoom" description="Allow zooming content" value={config.enableZoom} onChange={v => onChange('enableZoom', v)} />
                  <FeatureRow icon={Activity} label="Loading Indicator" description="Show bar when page loads" value={config.loadingIndicator} onChange={v => onChange('loadingIndicator', v)} />
                  <FeatureRow icon={BatteryCharging} label="Keep Screen Awake" description="Prevent sleep" value={config.keepAwake} onChange={v => onChange('keepAwake', v)} />
               </div>
            </Accordion>

            {/* Links Accordion */}
            <Accordion title="Link Handling" icon={Link}>
               <FeatureRow icon={ExternalLink} label="Open External Links" description="Open unknown domains in system browser" value={config.openExternalLinks} onChange={v => onChange('openExternalLinks', v)} />
               <div className="pt-4 space-y-2">
                  <Label className="text-xs font-bold text-gray-700">Custom Rules</Label>
                  {(config.linkRules || []).map((rule: LinkRule, idx: number) => (
                    <div key={idx} className="flex gap-2 text-xs">
                       <input value={rule.pattern} onChange={e => updateLinkRule(idx, 'pattern', e.target.value)} placeholder="*.google.com" className="flex-1 border rounded px-2 py-1" />
                       <select value={rule.action} onChange={e => updateLinkRule(idx, 'action', e.target.value)} className="border rounded px-1 py-1 w-24">
                          <option value="open_browser">Browser</option>
                          <option value="open_internal">In-App</option>
                       </select>
                       <button onClick={() => removeLinkRule(idx)} className="text-red-400"><X size={14}/></button>
                    </div>
                  ))}
                  <Button variant="ghost" size="sm" onClick={addLinkRule} className="text-xs h-7">+ Add Rule</Button>
               </div>
            </Accordion>
          </>
        )}

        {/* ═══════════════════════════════════════════
            TAB 3: FEATURES (Push, Bio, Offline)
        ═══════════════════════════════════════════ */}
        {activeTab === 'features' && (
          <>
            <Accordion title="Engagement" icon={Bell} defaultOpen={true}>
               <FeatureRow icon={Bell} label="Push Notifications" description="Firebase or OneSignal" value={config.enablePushNotifications || false} onChange={v => onChange('enablePushNotifications', v)}>
                  <Select label="Provider" value={config.pushProvider || 'firebase'} onChange={v => onChange('pushProvider', v)}
                    options={[{ value: 'firebase', label: 'Firebase (FCM)' }, { value: 'onesignal', label: 'OneSignal' }]} />
                  {config.pushProvider === 'firebase' ? (
                    <Input label="Firebase Project ID" value={config.firebaseProjectId || ''} onChange={e => onChange('firebaseProjectId', sanitizeString(e.target.value))} placeholder="my-app-id" className="text-xs" />
                  ) : (
                    <Input label="OneSignal App ID" value={config.oneSignalAppId || ''} onChange={e => onChange('oneSignalAppId', sanitizeString(e.target.value))} placeholder="uuid" className="text-xs" />
                  )}
               </FeatureRow>
               <div className="pt-4 border-t border-gray-100">
                  <FeatureRow icon={Zap} label="Haptic Feedback" description="Vibrate on tap" value={config.enableHaptics || false} onChange={v => onChange('enableHaptics', v)} />
               </div>
            </Accordion>

            <Accordion title="Device Hardware" icon={Smartphone}>
               <FeatureRow icon={Fingerprint} label="Biometric Auth" description="FaceID / TouchID" value={config.enableBiometric || false} onChange={v => onChange('enableBiometric', v)} />
               <div className="pt-3"><FeatureRow icon={Camera} label="Camera Access" description="Allow photos/video" value={config.enableCamera || false} onChange={v => onChange('enableCamera', v)} /></div>
               <div className="pt-3"><FeatureRow icon={QrCode} label="QR Scanner" description="Native scanner API" value={config.enableQRScanner || false} onChange={v => onChange('enableQRScanner', v)} /></div>
            </Accordion>

            <Accordion title="Offline & Data" icon={WifiOff}>
               <FeatureRow icon={WifiOff} label="Offline Mode" description="Cache pages for offline use" value={config.offlineMode || false} onChange={v => onChange('offlineMode', v)}>
                  <Input label="Offline Page URL" value={config.offlinePage || ''} onChange={e => onChange('offlinePage', sanitizeString(e.target.value))} placeholder="/offline.html" className="text-xs" />
               </FeatureRow>
            </Accordion>
          </>
        )}

        {/* ═══════════════════════════════════════════
            TAB 4: PUBLISH (Signing, Versioning, ASO)
        ═══════════════════════════════════════════ */}
        {activeTab === 'publish' && (
          <>
            {/* Versioning Accordion */}
            <Accordion title="Version & Identity" icon={Tag} defaultOpen={true}>
               <div className="grid grid-cols-2 gap-3">
                  <Input label="Version Name" value={config.versionName || '1.0.0'} onChange={e => onChange('versionName', sanitizeString(e.target.value))} placeholder="1.0.0" className="text-xs" />
                  <Input label="Version Code" type="number" value={config.versionCode?.toString() || '1'} onChange={e => onChange('versionCode', parseInt(e.target.value))} placeholder="1" className="text-xs" />
               </div>
               <Input label="Package Name" value={config.packageName || packageName || ''} onChange={e => onChange('packageName', sanitizeString(e.target.value))} placeholder="com.company.app" className="text-xs font-mono mt-3" />
            </Accordion>

            {/* Signing Accordion (The Merged Panel) */}
            <Accordion title="App Signing (Keys)" icon={Key} defaultOpen={false}>
               {appId ? (
                  <SigningPanel appId={appId} packageName={config.packageName || packageName || ''} appName={config.appName} embedded={true} />
               ) : (
                  <div className="p-4 bg-amber-50 text-amber-800 text-xs rounded-lg flex items-center gap-2">
                     <AlertTriangle size={16} />
                     Please save your app first to configure signing keys.
                  </div>
               )}
            </Accordion>

            {/* ASO Accordion */}
            <Accordion title="Store Listing (ASO)" icon={Search}>
               <Input label="Short Description" value={config.shortDescription || ''} onChange={e => onChange('shortDescription', sanitizeString(e.target.value))} placeholder="Best app for..." className="text-xs" maxLength={80} />
               <TextArea label="Full Description" value={config.fullDescription || ''} onChange={v => onChange('fullDescription', sanitizeString(v))} placeholder="Full details..." className="mt-3" maxLength={4000} />
               <div className="mt-3">
                  <Label className="text-xs text-gray-600">Keywords</Label>
                  <input value={config.keywords || ''} onChange={e => onChange('keywords', sanitizeString(e.target.value))} className="w-full border rounded px-2 py-1.5 text-xs mt-1" placeholder="shopping, fashion, sale" maxLength={100} />
               </div>
            </Accordion>
          </>
        )}

        {/* ═══════════════════════════════════════════
            TAB 5: SETTINGS (Analytics, Legal, Adv)
        ═══════════════════════════════════════════ */}
        {activeTab === 'settings' && (
          <>
            <Accordion title="Analytics & Crash" icon={BarChart2}>
               <FeatureRow icon={BarChart2} label="Firebase Analytics" description="Track user events" value={config.enableAnalytics || false} onChange={v => onChange('enableAnalytics', v)} />
               <div className="pt-3"><FeatureRow icon={AlertTriangle} label="Crash Reporting" description="Track app crashes" value={config.enableCrashReporting || false} onChange={v => onChange('enableCrashReporting', v)} /></div>
            </Accordion>

            <Accordion title="Legal & Privacy" icon={ShieldCheck}>
               <Input label="Privacy Policy URL" value={config.privacyPolicyUrl || ''} onChange={e => onChange('privacyPolicyUrl', sanitizeString(e.target.value))} className="text-xs" />
               <Input label="Terms URL" value={config.termsOfServiceUrl || ''} onChange={e => onChange('termsOfServiceUrl', sanitizeString(e.target.value))} className="text-xs mt-3" />
               <div className="pt-3 mt-3 border-t border-gray-100">
                  <FeatureRow icon={Eye} label="App Tracking Transparency" description="iOS Requirement" value={config.enableATT || false} onChange={v => onChange('enableATT', v)}>
                     <Input label="Usage Description" value={config.dataCollectionPurpose || ''} onChange={e => onChange('dataCollectionPurpose', sanitizeString(e.target.value))} placeholder="We use data to..." className="text-xs" />
                  </FeatureRow>
               </div>
            </Accordion>

            <Accordion title="Advanced Code" icon={Code}>
               <FeatureRow icon={Code} label="JS Bridge" description="Inject native bridge" value={config.enableJSBridge !== false} onChange={v => onChange('enableJSBridge', v)} />
               <div className="space-y-3 mt-3">
                  <TextArea label="Custom CSS" value={config.customCSS || ''} onChange={v => onChange('customCSS', v)} placeholder="body { ... }" />
                  <TextArea label="Custom JS" value={config.customJS || ''} onChange={v => onChange('customJS', v)} placeholder="console.log('loaded')" />
               </div>
            </Accordion>
          </>
        )}

      </div>
    </div>
  );
};
