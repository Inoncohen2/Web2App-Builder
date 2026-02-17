'use client';

import React, { useRef, useState, useEffect } from 'react';
import { AppConfig, NativeTab, LinkRule } from '../types';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Switch } from './ui/Switch';
import { Button } from './ui/Button';
import { SigningPanel } from './SigningPanel';
import {
  Upload, Smartphone, Palette, Zap, Navigation, 
  BarChart2, Search, Code, Key, Layout, CheckCircle,
  Maximize, Chrome, Bell, Fingerprint, Camera, Link,
  WifiOff, Shield, ChevronUp, ChevronDown, FileText,
  Info, ShoppingCart, Lock, ShieldCheck, Eye, RefreshCw,
  Plus, Moon, Sun, Monitor, BatteryCharging, X, AlertTriangle, Settings
} from 'lucide-react';

interface ConfigPanelProps {
  config: AppConfig;
  onChange: (key: keyof AppConfig, value: any) => void;
  onUrlBlur?: () => void;
  isLoading?: boolean;
  // Props required for Signing Panel integration
  appId: string;
  packageName: string;
}

const PRESET_COLORS = ['#000000','#2563eb','#dc2626','#ea580c','#16a34a','#7c3aed','#db2777','#0891b2'];

const TAB_ICONS = {
  home: '🏠', search: '🔍', cart: '🛒', profile: '👤',
  settings: '⚙️', bell: '🔔', heart: '❤️', star: '⭐',
  menu: '☰', chat: '💬',
};

// ─────────────────────────────────────────────────────────────────
// UI Helpers
// ─────────────────────────────────────────────────────────────────

const SectionHeader = ({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle?: string }) => (
  <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-100">
    <div className="h-9 w-9 rounded-lg bg-gray-900 flex items-center justify-center flex-shrink-0 shadow-sm">
      <Icon size={16} className="text-white" />
    </div>
    <div>
      <h3 className="text-base font-bold text-gray-900">{title}</h3>
      {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
    </div>
  </div>
);

const FeatureRow = ({
  icon: Icon, label, description, value, onChange, children, badge
}: {
  icon: any; label: string; description?: string; value: boolean;
  onChange: (v: boolean) => void; children?: React.ReactNode; badge?: string;
}) => (
  <div className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${value ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
          <Icon size={16} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-900">{label}</span>
            {badge && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-600">{badge}</span>}
          </div>
          {description && <p className="text-xs text-gray-500 truncate">{description}</p>}
        </div>
      </div>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
    {value && children && (
      <div className="mt-4 pt-4 border-t border-gray-100 space-y-4 animate-in fade-in slide-in-from-top-1">
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
    {label && <Label className="text-xs font-semibold text-gray-700">{label}</Label>}
    <div className="relative">
        <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2.5 bg-white text-gray-800 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 appearance-none"
        >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
            <ChevronDown size={14} />
        </div>
    </div>
  </div>
);

const TextArea = ({ label, value, onChange, placeholder, rows = 3, maxLength }: {
  label?: string; value: string; onChange: (v: string) => void;
  placeholder?: string; rows?: number; maxLength?: number;
}) => (
  <div className="space-y-1.5">
    {label && (
      <div className="flex justify-between">
        <Label className="text-xs font-semibold text-gray-700">{label}</Label>
        {maxLength && <span className="text-[10px] text-gray-400">{value?.length || 0}/{maxLength}</span>}
      </div>
    )}
    <textarea
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      maxLength={maxLength}
      className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2.5 bg-white text-gray-800 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 resize-none font-mono"
    />
  </div>
);

const InfoBox = ({ children, type = 'info' }: { children?: React.ReactNode; type?: 'info' | 'warning' | 'success' }) => {
  if (!children) return null;
  const styles = {
    info: 'bg-blue-50 border-blue-100 text-blue-700',
    warning: 'bg-amber-50 border-amber-100 text-amber-700',
    success: 'bg-emerald-50 border-emerald-100 text-emerald-700',
  };
  return (
    <div className={`text-xs p-3 rounded-lg border flex items-start gap-2 ${styles[type]}`}>
      <Info size={14} className="mt-0.5 flex-shrink-0" />
      <span className="leading-relaxed">{children}</span>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
export const ConfigPanel: React.FC<ConfigPanelProps> = ({ config, onChange, onUrlBlur, isLoading = false, appId, packageName }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState('identity');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (key: string) => setExpandedSections(p => ({ ...p, [key]: !p[key] }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => onChange('appIcon', ev.target?.result as string);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // --- Tab Logic ---
  const addNativeTab = () => {
    const tabs = [...(config.nativeTabs || [])];
    tabs.push({ id: Date.now().toString(), label: 'Tab', icon: 'home', url: config.websiteUrl });
    onChange('nativeTabs', tabs);
  };
  const removeNativeTab = (id: string) => onChange('nativeTabs', (config.nativeTabs || []).filter((t: NativeTab) => t.id !== id));
  const updateNativeTab = (id: string, field: string, value: string) => onChange('nativeTabs', (config.nativeTabs || []).map((t: NativeTab) => t.id === id ? { ...t, [field]: value } : t));

  // --- Link Rule Logic ---
  const addLinkRule = () => {
    const rules = [...(config.linkRules || [])];
    rules.push({ pattern: '', action: 'open_internal' });
    onChange('linkRules', rules);
  };
  const removeLinkRule = (idx: number) => onChange('linkRules', (config.linkRules || []).filter((_: any, i: number) => i !== idx));
  const updateLinkRule = (idx: number, field: string, value: string) => onChange('linkRules', (config.linkRules || []).map((r: LinkRule, i: number) => i === idx ? { ...r, [field]: value } : r));

  const isCustomColor = !PRESET_COLORS.includes(config.primaryColor);

  const TABS = [
    { id: 'identity', label: 'Identity', icon: Smartphone, desc: 'Name, Icon & URL' },
    { id: 'design', label: 'Design', icon: Palette, desc: 'Colors & Splash' },
    { id: 'native', label: 'Features', icon: Zap, desc: 'Push, Biometrics' },
    { id: 'navigation', label: 'Navigation', icon: Navigation, desc: 'Tabs & Menus' },
    { id: 'analytics', label: 'Analytics', icon: BarChart2, desc: 'Track Usage' },
    { id: 'aso', label: 'Store', icon: Search, desc: 'SEO & Metadata' },
    { id: 'advanced', label: 'Advanced', icon: Code, desc: 'Custom JS/CSS' },
    { id: 'signing', label: 'Signing', icon: Key, desc: 'Keystore & Certs' }, // Unified here
  ];

  return (
    <div className="flex h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      
      {/* ─── VERTICAL SIDEBAR ─── */}
      <div className="w-20 lg:w-64 bg-gray-50/50 border-r border-gray-100 flex flex-col shrink-0">
        <div className="p-3 space-y-1 overflow-y-auto custom-scrollbar flex-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group
                ${activeTab === tab.id 
                  ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200' 
                  : 'text-gray-500 hover:bg-gray-100/80 hover:text-gray-900'}
              `}
            >
              <div className={`
                h-8 w-8 rounded-lg flex items-center justify-center transition-colors shrink-0
                ${activeTab === tab.id ? 'bg-gray-900 text-white' : 'bg-gray-200/50 group-hover:bg-white'}
              `}>
                <tab.icon size={16} />
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-xs font-bold leading-tight">{tab.label}</p>
                <p className="text-[10px] text-gray-400 font-medium leading-tight mt-0.5">{tab.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ─── CONTENT AREA ─── */}
      <div className="flex-1 overflow-y-auto bg-white p-6 lg:p-8 custom-scrollbar relative">
        
        {/* TAB 1: IDENTITY */}
        {activeTab === 'identity' && (
          <div className="max-w-2xl space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* App Icon */}
            <section className="space-y-4">
              <SectionHeader icon={Smartphone} title="App Identity" subtitle="Basic information about your application" />
              
              <div className="flex flex-col sm:flex-row gap-6 p-4 rounded-xl border border-gray-100 bg-gray-50/30">
                <div className="flex flex-col items-center gap-3">
                    <div
                    onClick={() => fileInputRef.current?.click()}
                    className="h-24 w-24 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-gray-900 hover:bg-white transition-all overflow-hidden bg-white shadow-sm relative group"
                    >
                    {config.appIcon ? (
                        <>
                            <img src={config.appIcon} alt="Icon" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Upload size={20} className="text-white" />
                            </div>
                        </>
                    ) : (
                        <div className="text-center p-2">
                        <Upload size={20} className="text-gray-400 mx-auto mb-1" />
                        <span className="text-[10px] text-gray-400 font-medium">1024px PNG</span>
                        </div>
                    )}
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </div>
                
                <div className="flex-1 space-y-4">
                    <Input
                        label="App Name"
                        value={config.appName}
                        onChange={e => onChange('appName', e.target.value)}
                        placeholder="My Awesome App"
                        className="bg-white"
                    />
                    <Input
                        label="Website URL"
                        value={config.websiteUrl}
                        onChange={e => onChange('websiteUrl', e.target.value)}
                        onBlur={onUrlBlur}
                        placeholder="https://yourwebsite.com"
                        className="bg-white font-mono"
                    />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Package Name"
                  value={config.packageName || ''}
                  onChange={e => onChange('packageName', e.target.value)}
                  placeholder="com.company.app"
                  className="text-xs font-mono"
                />
                <Input
                  label="Version"
                  value={config.versionName || '1.0.0'}
                  onChange={e => onChange('versionName', e.target.value)}
                  placeholder="1.0.0"
                  className="text-xs font-mono"
                />
              </div>
            </section>

            {/* ASO Quick */}
            <section className="space-y-4">
              <SectionHeader icon={Search} title="Quick ASO" subtitle="App Store Optimization" />
              <Input
                label={`iOS Subtitle (max 30 chars)`}
                value={config.appSubtitle || ''}
                onChange={e => { if (e.target.value.length <= 30) onChange('appSubtitle', e.target.value); }}
                placeholder="Turn websites into apps"
              />
              <Input
                label={`Short Description (max 80 chars)`}
                value={config.shortDescription || ''}
                onChange={e => { if (e.target.value.length <= 80) onChange('shortDescription', e.target.value); }}
                placeholder="Convert any website to a native mobile app"
              />
            </section>

            {/* Legal */}
            <section className="space-y-4">
              <button
                onClick={() => toggleSection('legal')}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                  <FileText size={16} />
                  Legal & Compliance
                  {(config.privacyPolicyUrl || config.termsOfServiceUrl) && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full">Configured</span>
                  )}
                </div>
                {expandedSections.legal ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
              </button>
              {expandedSections.legal && (
                <div className="space-y-4 p-4 rounded-lg border border-gray-100 animate-in fade-in">
                  <Input label="Privacy Policy URL" value={config.privacyPolicyUrl || ''} onChange={e => onChange('privacyPolicyUrl', e.target.value)} placeholder="https://yoursite.com/privacy" className="font-mono text-xs" />
                  <Input label="Terms of Service URL" value={config.termsOfServiceUrl || ''} onChange={e => onChange('termsOfServiceUrl', e.target.value)} placeholder="https://yoursite.com/terms" className="font-mono text-xs" />
                </div>
              )}
            </section>
          </div>
        )}

        {/* TAB 2: DESIGN */}
        {activeTab === 'design' && (
          <div className="max-w-2xl space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Color */}
            <section className="space-y-4">
              <SectionHeader icon={Palette} title="Brand Colors" subtitle="Define your app's visual theme" />
              
              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-6">
                <div>
                    <Label className="text-xs font-semibold text-gray-700 mb-3 block">Primary Color</Label>
                    <div className="flex items-center gap-3 flex-wrap">
                    {PRESET_COLORS.map(c => (
                        <button key={c} onClick={() => onChange('primaryColor', c)}
                        className={`h-10 w-10 rounded-full shadow-sm border-2 transition-all hover:scale-110 ${config.primaryColor === c ? 'border-gray-900 scale-110 ring-2 ring-gray-200' : 'border-transparent'}`}
                        style={{ backgroundColor: c }} />
                    ))}
                    <div className="w-px h-10 bg-gray-200 mx-2"></div>
                    <label className={`h-10 w-10 rounded-full border-2 cursor-pointer relative overflow-hidden shadow-sm flex items-center justify-center bg-white ${isCustomColor ? 'border-gray-900 ring-2 ring-gray-200' : 'border-gray-200 hover:border-gray-400'}`}>
                        <div className="absolute inset-0 bg-gradient-to-br from-red-500 via-green-500 to-blue-500 opacity-20"></div>
                        <Plus size={16} className="text-gray-500 relative z-10" />
                        <input type="color" value={config.primaryColor} onChange={e => onChange('primaryColor', e.target.value)} className="opacity-0 absolute inset-0 w-full h-full cursor-pointer" />
                    </label>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                        <div className="h-4 w-4 rounded-full border border-gray-200" style={{ backgroundColor: config.primaryColor }} />
                        <code className="text-xs font-mono text-gray-500 uppercase">{config.primaryColor}</code>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                    <Label className="text-xs font-semibold text-gray-700 mb-3 block">Loading Indicator</Label>
                    <div className="flex items-center gap-4">
                        <input type="color" value={config.loadingColor || '#000000'} onChange={e => onChange('loadingColor', e.target.value)}
                            className="h-10 w-16 rounded-lg border border-gray-200 cursor-pointer p-1 bg-white" />
                        <span className="text-xs text-gray-500">Color of the spinner shown while loading pages</span>
                    </div>
                </div>
              </div>
            </section>

            {/* Theme */}
            <section className="space-y-4">
              <SectionHeader icon={Moon} title="System Theme" />
              <div className="grid grid-cols-3 gap-3">
                  {[{ v: 'light', l: 'Light', i: Sun }, { v: 'dark', l: 'Dark', i: Moon }, { v: 'system', l: 'System', i: Monitor }].map(({ v, l, i: Icon }) => (
                    <button key={v} onClick={() => onChange('themeMode', v)}
                      className={`flex flex-col items-center py-4 px-2 rounded-xl border text-sm font-semibold gap-2 transition-all ${config.themeMode === v ? 'border-gray-900 bg-gray-50 text-gray-900 shadow-sm' : 'border-gray-100 text-gray-500 hover:border-gray-300 hover:bg-white'}`}>
                      <Icon size={20} /> {l}
                    </button>
                  ))}
              </div>
              <Select label="Status Bar Style" value={config.statusBarStyle || 'auto'} onChange={v => onChange('statusBarStyle', v)}
                options={[{ value: 'auto', label: 'Auto (follows theme)' }, { value: 'light', label: 'Light content (white text)' }, { value: 'dark', label: 'Dark content (black text)' }]} />
            </section>

            {/* Splash */}
            <section className="space-y-4">
              <SectionHeader icon={Maximize} title="Splash Screen" />
              <FeatureRow icon={Maximize} label="Enable Splash Screen" value={config.showSplashScreen} onChange={v => onChange('showSplashScreen', v)}>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <Label className="text-xs font-semibold text-gray-700 mb-2 block">Background Color</Label>
                        <div className="flex items-center gap-2">
                            <input type="color" value={config.splashColor || '#ffffff'} onChange={e => onChange('splashColor', e.target.value)} className="h-9 w-full rounded-lg border border-gray-200 cursor-pointer" />
                        </div>
                     </div>
                     <Select label="Animation" value={config.splashAnimation || 'fade'} onChange={v => onChange('splashAnimation', v)}
                        options={[{ value: 'none', label: 'None' }, { value: 'fade', label: 'Fade In' }, { value: 'slide', label: 'Slide Up' }, { value: 'zoom', label: 'Zoom In' }]} />
                  </div>
              </FeatureRow>
            </section>

            {/* Browser UI */}
            <section className="space-y-4">
              <SectionHeader icon={Chrome} title="Browser Interface" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                 {[
                  { key: 'showNavBar', icon: Layout, label: 'Nav Bar', desc: 'Back/Forward buttons' },
                  { key: 'enablePullToRefresh', icon: RefreshCw, label: 'Pull to Refresh', desc: 'Swipe down gesture' },
                  { key: 'enableZoom', icon: Maximize, label: 'Pinch Zoom', desc: 'Allow user zooming' },
                  { key: 'keepAwake', icon: BatteryCharging, label: 'Keep Awake', desc: 'Prevent sleep' },
                 ].map(item => (
                    <div key={item.key} className="p-3 rounded-lg border border-gray-100 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                            <item.icon size={16} className="text-gray-400" />
                            <div>
                                <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                                <p className="text-[10px] text-gray-400">{item.desc}</p>
                            </div>
                        </div>
                        <Switch checked={!!config[item.key as keyof AppConfig]} onCheckedChange={v => onChange(item.key as keyof AppConfig, v)} />
                    </div>
                 ))}
              </div>
            </section>
          </div>
        )}

        {/* TAB 3: FEATURES (Native) */}
        {activeTab === 'native' && (
          <div className="max-w-2xl space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
             <SectionHeader icon={Zap} title="Native Features" subtitle="Bridge the gap between web and mobile" />
             
             <div className="space-y-4">
                <FeatureRow icon={Bell} label="Push Notifications" description="Send targeted alerts via Firebase/OneSignal" value={config.enablePushNotifications || false} onChange={v => onChange('enablePushNotifications', v)} badge="Popular">
                    <Select label="Provider" value={config.pushProvider || 'firebase'} onChange={v => onChange('pushProvider', v)}
                        options={[{ value: 'firebase', label: 'Firebase FCM' }, { value: 'onesignal', label: 'OneSignal' }]} />
                    {config.pushProvider === 'firebase' && <Input label="Firebase Project ID" value={config.firebaseProjectId || ''} onChange={e => onChange('firebaseProjectId', e.target.value)} />}
                    {config.pushProvider === 'onesignal' && <Input label="OneSignal App ID" value={config.oneSignalAppId || ''} onChange={e => onChange('oneSignalAppId', e.target.value)} />}
                </FeatureRow>

                <FeatureRow icon={Fingerprint} label="Biometric Auth" description="FaceID & TouchID Integration" value={config.enableBiometric || false} onChange={v => onChange('enableBiometric', v)}>
                    <Input label="Prompt Title" value={config.biometricPromptTitle || ''} onChange={e => onChange('biometricPromptTitle', e.target.value)} />
                </FeatureRow>

                <FeatureRow icon={Link} label="Deep Linking" description="Open app from custom URL schemes" value={config.enableDeepLinks || false} onChange={v => onChange('enableDeepLinks', v)}>
                    <Input label="URL Scheme (e.g. myapp://)" value={config.deepLinkScheme || ''} onChange={e => onChange('deepLinkScheme', e.target.value)} className="font-mono" />
                </FeatureRow>

                <FeatureRow icon={WifiOff} label="Offline Mode" description="Cache pages for offline access" value={config.offlineMode || false} onChange={v => onChange('offlineMode', v)}>
                    <Input label="Offline Page URL" value={config.offlinePage || ''} onChange={e => onChange('offlinePage', e.target.value)} placeholder="/offline.html" />
                </FeatureRow>
             </div>
          </div>
        )}

        {/* TAB 4: NAVIGATION */}
        {activeTab === 'navigation' && (
          <div className="max-w-2xl space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
             <SectionHeader icon={Navigation} title="Native Navigation" subtitle="Add a native bottom tab bar" />
             
             <FeatureRow icon={Navigation} label="Tab Bar" description="Persistent bottom menu like Instagram/Airbnb" value={config.enableNativeNav || false} onChange={v => onChange('enableNativeNav', v)}>
                <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Select label="Position" value={config.tabBarPosition || 'bottom'} onChange={v => onChange('tabBarPosition', v)}
                            options={[{ value: 'bottom', label: 'Bottom' }, { value: 'top', label: 'Top' }]} />
                        <Select label="Style" value={config.tabBarStyle || 'labeled'} onChange={v => onChange('tabBarStyle', v)}
                            options={[{ value: 'labeled', label: 'Icon + Label' }, { value: 'standard', label: 'Icon Only' }]} />
                    </div>
                    
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold text-gray-700">Tabs ({config.nativeTabs?.length || 0}/5)</Label>
                        {config.nativeTabs?.map((tab) => (
                            <div key={tab.id} className="flex gap-2 items-start bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
                                <select value={tab.icon} onChange={e => updateNativeTab(tab.id, 'icon', e.target.value)} className="h-9 w-12 bg-gray-50 border border-gray-200 rounded text-lg text-center">
                                    {Object.entries(TAB_ICONS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                </select>
                                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <input value={tab.label} onChange={e => updateNativeTab(tab.id, 'label', e.target.value)} className="h-9 px-2 text-sm border border-gray-200 rounded bg-gray-50" placeholder="Label" />
                                    <input value={tab.url} onChange={e => updateNativeTab(tab.id, 'url', e.target.value)} className="h-9 px-2 text-xs border border-gray-200 rounded bg-gray-50 font-mono" placeholder="https://" />
                                </div>
                                <button onClick={() => removeNativeTab(tab.id)} className="h-9 w-9 flex items-center justify-center text-red-400 hover:bg-red-50 rounded"><X size={16} /></button>
                            </div>
                        ))}
                        {(config.nativeTabs?.length || 0) < 5 && (
                            <Button variant="outline" size="sm" onClick={addNativeTab} className="w-full border-dashed"><Plus size={14} className="mr-1" /> Add Tab</Button>
                        )}
                    </div>
                </div>
             </FeatureRow>

             <SectionHeader icon={Link} title="Link Rules" subtitle="Control which URLs open inside or outside" />
             <div className="space-y-2">
                {config.linkRules?.map((rule, i) => (
                    <div key={i} className="flex gap-2">
                        <input value={rule.pattern} onChange={e => updateLinkRule(i, 'pattern', e.target.value)} className="flex-1 h-9 px-3 text-xs border border-gray-200 rounded-lg font-mono" placeholder="*.google.com" />
                        <select value={rule.action} onChange={e => updateLinkRule(i, 'action', e.target.value)} className="h-9 px-2 text-xs border border-gray-200 rounded-lg bg-white">
                            <option value="open_internal">Internal</option>
                            <option value="open_browser">Browser</option>
                        </select>
                        <button onClick={() => removeLinkRule(i)} className="text-red-400 hover:text-red-600 p-2"><X size={16}/></button>
                    </div>
                ))}
                <Button variant="outline" size="sm" onClick={addLinkRule} className="w-full border-dashed"><Plus size={14} className="mr-1" /> Add Rule</Button>
             </div>
          </div>
        )}

        {/* TAB 5: ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="max-w-2xl space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
             <SectionHeader icon={BarChart2} title="Analytics & Crash Reporting" />
             <FeatureRow icon={BarChart2} label="Firebase Analytics" description="Track user behavior" value={config.enableAnalytics || false} onChange={v => onChange('enableAnalytics', v)}>
                <Input label="Firebase App ID" value={config.firebaseAnalyticsId || ''} onChange={e => onChange('firebaseAnalyticsId', e.target.value)} />
             </FeatureRow>
             <FeatureRow icon={AlertTriangle} label="Crashlytics" description="Report app crashes" value={config.enableCrashReporting || false} onChange={v => onChange('enableCrashReporting', v)} />
          </div>
        )}

        {/* TAB 6: ASO */}
        {activeTab === 'aso' && (
          <div className="max-w-2xl space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
             <SectionHeader icon={Search} title="App Store Optimization" subtitle="Improve visibility in stores" />
             <Select label="Category" value={config.appCategory || 'utilities'} onChange={v => onChange('appCategory', v)}
                options={[{ value: 'utilities', label: 'Utilities' }, { value: 'shopping', label: 'Shopping' }, { value: 'social', label: 'Social' }]} />
             <TextArea label="Full Description" value={config.fullDescription || ''} onChange={v => onChange('fullDescription', v)} rows={6} maxLength={4000} />
             <Input label="Keywords" value={config.keywords || ''} onChange={e => onChange('keywords', e.target.value)} />
          </div>
        )}

        {/* TAB 7: ADVANCED */}
        {activeTab === 'advanced' && (
          <div className="max-w-2xl space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
             <SectionHeader icon={Code} title="Advanced Configuration" />
             <TextArea label="Inject CSS" value={config.customCSS || ''} onChange={v => onChange('customCSS', v)} rows={4} placeholder="body { background: red; }" />
             <TextArea label="Inject JavaScript" value={config.customJS || ''} onChange={v => onChange('customJS', v)} rows={4} placeholder="console.log('Hello');" />
             <FeatureRow icon={Settings} label="Debug Mode" description="Enable Webview Inspection" value={config.debugMode || false} onChange={v => onChange('debugMode', v)} />
          </div>
        )}

        {/* TAB 8: SIGNING (UNIFIED) */}
        {activeTab === 'signing' && (
          <div className="max-w-2xl animate-in fade-in slide-in-from-right-4 duration-300">
             <SigningPanel appId={appId} packageName={packageName} appName={config.appName} />
          </div>
        )}

      </div>
    </div>
  );
};
