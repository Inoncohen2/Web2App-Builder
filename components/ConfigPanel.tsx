'use client';

import React, { useRef, useState, useEffect } from 'react';
import { AppConfig, NativeTab, LinkRule } from '../types';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Switch } from './ui/Switch';
import { Button } from './ui/Button';
import {
  Upload, Globe, Sun, Moon, Monitor, Check, Plus, RefreshCw,
  Layout, Image as ImageIcon, Maximize, ExternalLink, BatteryCharging,
  Move, X, ShieldCheck, ChevronDown, ChevronUp, FileText, AlertCircle,
  Palette, Key, Bell, BarChart2, Fingerprint, Smartphone, QrCode,
  Zap, Link, Star, ShoppingCart, Lock, Search, Code, Wifi, WifiOff,
  Navigation, Chrome, Info, Trash2, GripVertical, Settings, Eye,
  Camera, LogIn, Shield, Package, Sparkles, Radio, Globe2,
  Hash, AlignLeft, Tag, Layers, ChevronRight, ToggleLeft,
  MessageSquare, Activity, AlertTriangle
} from 'lucide-react';

interface ConfigPanelProps {
  config: AppConfig;
  onChange: (key: keyof AppConfig, value: any) => void;
  onUrlBlur?: () => void;
  isLoading?: boolean;
}

const PRESET_COLORS = ['#000000','#2563eb','#dc2626','#ea580c','#16a34a','#7c3aed','#db2777','#0891b2'];

const TAB_ICONS = {
  home: '🏠', search: '🔍', cart: '🛒', profile: '👤',
  settings: '⚙️', bell: '🔔', heart: '❤️', star: '⭐',
  menu: '☰', chat: '💬',
};

// ─────────────────────────────────────────────────────────────────
// Section header component for consistency
const SectionHeader = ({ icon: Icon, title, subtitle }: { icon: any; title: string; subtitle?: string }) => (
  <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
    <div className="h-8 w-8 rounded-lg bg-gray-900 flex items-center justify-center flex-shrink-0">
      <Icon size={14} className="text-white" />
    </div>
    <div>
      <h3 className="text-sm font-bold text-gray-900">{title}</h3>
      {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
    </div>
  </div>
);

// Feature row with toggle
const FeatureRow = ({
  icon: Icon, label, description, value, onChange, children, badge
}: {
  icon: any; label: string; description?: string; value: boolean;
  onChange: (v: boolean) => void; children?: React.ReactNode; badge?: string;
}) => (
  <div className="space-y-3">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        <div className={`h-7 w-7 rounded-md flex items-center justify-center flex-shrink-0 ${value ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
          <Icon size={13} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-800">{label}</span>
            {badge && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-600">{badge}</span>}
          </div>
          {description && <p className="text-xs text-gray-400 truncate">{description}</p>}
        </div>
      </div>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
    {value && children && (
      <div className="ml-9 pl-3 border-l-2 border-gray-100 space-y-3 animate-in fade-in slide-in-from-top-1">
        {children}
      </div>
    )}
  </div>
);

// Select component
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
      className="w-full text-xs border border-gray-200 rounded-md px-3 py-2 bg-white text-gray-800 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

// Textarea component
const TextArea = ({ label, value, onChange, placeholder, rows = 3, maxLength }: {
  label?: string; value: string; onChange: (v: string) => void;
  placeholder?: string; rows?: number; maxLength?: number;
}) => (
  <div className="space-y-1.5">
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

// Info box
const InfoBox = ({ children, type = 'info' }: { children?: React.ReactNode; type?: 'info' | 'warning' | 'success' }) => {
  if (!children) return null;
  const styles = {
    info: 'bg-blue-50 border-blue-200 text-blue-700',
    warning: 'bg-amber-50 border-amber-200 text-amber-700',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  };
  return (
    <div className={`text-xs p-3 rounded-lg border flex items-start gap-2 ${styles[type]}`}>
      <Info size={12} className="mt-0.5 flex-shrink-0" />
      <span>{children}</span>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────
export const ConfigPanel: React.FC<ConfigPanelProps> = ({ config, onChange, onUrlBlur, isLoading = false }) => {
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

  const addNativeTab = () => {
    const tabs = [...(config.nativeTabs || [])];
    tabs.push({ id: Date.now().toString(), label: 'Tab', icon: 'home', url: config.websiteUrl });
    onChange('nativeTabs', tabs);
  };

  const removeNativeTab = (id: string) => {
    onChange('nativeTabs', (config.nativeTabs || []).filter((t: NativeTab) => t.id !== id));
  };

  const updateNativeTab = (id: string, field: string, value: string) => {
    onChange('nativeTabs', (config.nativeTabs || []).map((t: NativeTab) => t.id === id ? { ...t, [field]: value } : t));
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
    onChange('linkRules', (config.linkRules || []).map((r: LinkRule, i: number) => i === idx ? { ...r, [field]: value } : r));
  };

  const isCustomColor = !PRESET_COLORS.includes(config.primaryColor);

  const TABS = [
    { id: 'identity', label: '🎨 App', icon: Smartphone },
    { id: 'design', label: '✨ Design', icon: Palette },
    { id: 'native', label: '📱 Native', icon: Zap },
    { id: 'navigation', label: '🗺️ Nav', icon: Navigation },
    { id: 'analytics', label: '📊 Analytics', icon: BarChart2 },
    { id: 'aso', label: '🚀 Store', icon: Search },
    { id: 'advanced', label: '⚙️ Advanced', icon: Code },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="px-3 pt-3 pb-0 border-b border-gray-100">
        <div className="flex overflow-x-auto gap-1 pb-0 scrollbar-hide">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-shrink-0 px-3 py-2 text-xs font-bold rounded-t-lg border-b-2 transition-all whitespace-nowrap
                ${activeTab === tab.id
                  ? 'bg-white text-gray-900 border-gray-900 shadow-sm'
                  : 'text-gray-400 border-transparent hover:text-gray-600 hover:bg-gray-50'}
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">

        {/* ═══════════════════════════════════════════
            TAB 1: IDENTITY (App)
        ═══════════════════════════════════════════ */}
        {activeTab === 'identity' && (
          <>
            {/* App Icon */}
            <section className="space-y-3">
              <SectionHeader icon={ImageIcon} title="App Icon" subtitle="Recommended: 1024×1024px PNG" />
              <div className="flex items-center gap-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="h-20 w-20 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-gray-400 transition-all overflow-hidden bg-gray-50 flex-shrink-0 shadow-sm"
                >
                  {config.appIcon ? (
                    <img src={config.appIcon} alt="Icon" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <Upload size={18} className="text-gray-400 mx-auto mb-1" />
                      <span className="text-[10px] text-gray-400">Upload</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="w-full text-xs border-gray-200 hover:border-gray-900">
                    <Upload size={12} className="mr-2" /> Upload Icon
                  </Button>
                  {config.appIcon && (
                    <Button variant="ghost" size="sm" onClick={() => onChange('appIcon', null)} className="w-full text-xs text-red-500 hover:text-red-700">
                      <X size={12} className="mr-2" /> Remove
                    </Button>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </div>
            </section>

            {/* App Identity */}
            <section className="space-y-3">
              <SectionHeader icon={Smartphone} title="App Identity" />
              <Input
                label="App Name"
                value={config.appName}
                onChange={e => onChange('appName', e.target.value)}
                placeholder="My Awesome App"
                className="text-sm"
              />
              <Input
                label="Website URL"
                value={config.websiteUrl}
                onChange={e => onChange('websiteUrl', e.target.value)}
                onBlur={onUrlBlur}
                placeholder="https://yourwebsite.com"
                className="text-sm"
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Package Name"
                  value={config.packageName || ''}
                  onChange={e => onChange('packageName', e.target.value)}
                  placeholder="com.company.app"
                  className="text-xs"
                />
                <Input
                  label="Version"
                  value={config.versionName || '1.0.0'}
                  onChange={e => onChange('versionName', e.target.value)}
                  placeholder="1.0.0"
                  className="text-xs"
                />
              </div>
            </section>

            {/* ASO Quick - Short Description */}
            <section className="space-y-3">
              <SectionHeader icon={AlignLeft} title="App Subtitle" subtitle="Shown below app name in stores" />
              <Input
                label={`iOS Subtitle (max 30 chars) — ${(config.appSubtitle || '').length}/30`}
                value={config.appSubtitle || ''}
                onChange={e => { if (e.target.value.length <= 30) onChange('appSubtitle', e.target.value); }}
                placeholder="Turn websites into apps"
                className="text-sm"
              />
              <Input
                label={`Short Description (max 80 chars) — ${(config.shortDescription || '').length}/80`}
                value={config.shortDescription || ''}
                onChange={e => { if (e.target.value.length <= 80) onChange('shortDescription', e.target.value); }}
                placeholder="Convert any website to a native mobile app"
                className="text-sm"
              />
            </section>

            {/* Legal */}
            <section className="space-y-3">
              <button
                onClick={() => toggleSection('legal')}
                className="w-full flex items-center justify-between text-sm font-bold text-gray-600 hover:text-gray-900"
              >
                <div className="flex items-center gap-2">
                  <FileText size={14} />
                  Legal URLs
                  {(config.privacyPolicyUrl || config.termsOfServiceUrl) && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-600 px-1.5 rounded-full font-bold">Set</span>
                  )}
                </div>
                {expandedSections.legal ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              {expandedSections.legal && (
                <div className="space-y-3 animate-in fade-in">
                  <Input label="Privacy Policy URL" value={config.privacyPolicyUrl || ''} onChange={e => onChange('privacyPolicyUrl', e.target.value)} placeholder="https://yoursite.com/privacy" className="text-xs" />
                  <Input label="Terms of Service URL" value={config.termsOfServiceUrl || ''} onChange={e => onChange('termsOfServiceUrl', e.target.value)} placeholder="https://yoursite.com/terms" className="text-xs" />
                </div>
              )}
            </section>
          </>
        )}

        {/* ═══════════════════════════════════════════
            TAB 2: DESIGN
        ═══════════════════════════════════════════ */}
        {activeTab === 'design' && (
          <>
            {/* Color */}
            <section className="space-y-3">
              <SectionHeader icon={Palette} title="Brand Colors" />
              <div>
                <Label className="text-xs font-medium text-gray-600 mb-2 block">Primary Color</Label>
                <div className="flex items-center gap-2 flex-wrap">
                  {PRESET_COLORS.map(c => (
                    <button key={c} onClick={() => onChange('primaryColor', c)}
                      className={`h-8 w-8 rounded-full border-2 transition-all ${config.primaryColor === c ? 'border-gray-900 scale-110' : 'border-transparent hover:scale-105'}`}
                      style={{ backgroundColor: c }} />
                  ))}
                  <label className={`h-8 w-8 rounded-full border-2 cursor-pointer relative overflow-hidden ${isCustomColor ? 'border-gray-900 scale-110' : 'border-gray-200'}`}
                    style={{ background: isCustomColor ? config.primaryColor : 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)' }}>
                    <input type="color" value={config.primaryColor} onChange={e => onChange('primaryColor', e.target.value)} className="opacity-0 absolute inset-0 w-full h-full cursor-pointer" />
                  </label>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="h-4 w-4 rounded-full" style={{ backgroundColor: config.primaryColor }} />
                  <code className="text-xs text-gray-500">{config.primaryColor.toUpperCase()}</code>
                </div>
              </div>

              <div>
                <Label className="text-xs font-medium text-gray-600 mb-2 block">Loading Indicator Color</Label>
                <div className="flex items-center gap-3">
                  <input type="color" value={config.loadingColor || '#000000'} onChange={e => onChange('loadingColor', e.target.value)}
                    className="h-9 w-14 rounded-lg border border-gray-200 cursor-pointer" />
                  <code className="text-xs text-gray-500">{(config.loadingColor || '#000000').toUpperCase()}</code>
                </div>
              </div>
            </section>

            {/* Theme */}
            <section className="space-y-3">
              <SectionHeader icon={Moon} title="Appearance & Theme" />
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-600">Theme Mode</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[{ v: 'light', l: 'Light', i: Sun }, { v: 'dark', l: 'Dark', i: Moon }, { v: 'system', l: 'System', i: Monitor }].map(({ v, l, i: Icon }) => (
                    <button key={v} onClick={() => onChange('themeMode', v)}
                      className={`flex flex-col items-center py-2.5 px-2 rounded-lg border-2 text-xs font-medium gap-1.5 transition-all ${config.themeMode === v ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}>
                      <Icon size={14} /> {l}
                    </button>
                  ))}
                </div>
              </div>

              <Select label="Status Bar Style" value={config.statusBarStyle || 'auto'} onChange={v => onChange('statusBarStyle', v)}
                options={[{ value: 'auto', label: 'Auto (follows theme)' }, { value: 'light', label: 'Light content (dark bg)' }, { value: 'dark', label: 'Dark content (light bg)' }]} />
            </section>

            {/* Splash Screen */}
            <section className="space-y-3">
              <SectionHeader icon={Maximize} title="Splash Screen" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">Enable Splash Screen</p>
                  <p className="text-xs text-gray-400">Show branded loading screen</p>
                </div>
                <Switch checked={config.showSplashScreen} onCheckedChange={v => onChange('showSplashScreen', v)} />
              </div>
              {config.showSplashScreen && (
                <div className="ml-4 pl-3 border-l-2 border-gray-100 space-y-3">
                  <div>
                    <Label className="text-xs font-medium text-gray-600 mb-1.5 block">Background Color</Label>
                    <div className="flex items-center gap-3">
                      <input type="color" value={config.splashColor || '#ffffff'} onChange={e => onChange('splashColor', e.target.value)}
                        className="h-9 w-14 rounded-lg border border-gray-200 cursor-pointer" />
                      <code className="text-xs text-gray-500">{config.splashColor?.toUpperCase()}</code>
                    </div>
                  </div>
                  <Select label="Animation" value={config.splashAnimation || 'fade'} onChange={v => onChange('splashAnimation', v)}
                    options={[{ value: 'none', label: 'None' }, { value: 'fade', label: 'Fade In' }, { value: 'slide', label: 'Slide Up' }, { value: 'zoom', label: 'Zoom In' }]} />
                </div>
              )}
            </section>

            {/* WebView Settings */}
            <section className="space-y-3">
              <SectionHeader icon={Chrome} title="WebView Settings" />
              <div className="space-y-3 divide-y divide-gray-50">
                {[
                  { key: 'showNavBar', icon: Layout, label: 'Navigation Bar', desc: 'Show in-app browser navigation' },
                  { key: 'enablePullToRefresh', icon: RefreshCw, label: 'Pull to Refresh', desc: 'Swipe down to reload page' },
                  { key: 'enableZoom', icon: Maximize, label: 'Pinch to Zoom', desc: 'Allow zoom gestures on content' },
                  { key: 'keepAwake', icon: BatteryCharging, label: 'Keep Screen Awake', desc: 'Prevent screen from sleeping' },
                  { key: 'openExternalLinks', icon: ExternalLink, label: 'External Links in Browser', desc: 'Open other sites in system browser' },
                  { key: 'loadingIndicator', icon: Activity, label: 'Loading Indicator', desc: 'Show progress bar on page load' },
                ].map(({ key, icon: Icon, label, desc }) => (
                  <div key={key} className="flex items-center justify-between pt-3 first:pt-0">
                    <div className="flex items-center gap-2.5">
                      <Icon size={14} className="text-gray-400" />
                      <div>
                        <span className="text-sm font-medium text-gray-800">{label}</span>
                        <p className="text-xs text-gray-400">{desc}</p>
                      </div>
                    </div>
                    <Switch checked={!!config[key as keyof AppConfig]} onCheckedChange={v => onChange(key as keyof AppConfig, v)} />
                  </div>
                ))}
              </div>

              <Select label="Screen Orientation" value={config.orientation || 'auto'} onChange={v => onChange('orientation', v)}
                options={[{ value: 'auto', label: 'Auto (follows device)' }, { value: 'portrait', label: 'Portrait only' }, { value: 'landscape', label: 'Landscape only' }]} />

              <Input label="Custom User Agent" value={config.userAgent || ''} onChange={e => onChange('userAgent', e.target.value)}
                placeholder="Web2App/1.0 (custom)" className="text-xs font-mono" />
            </section>
          </>
        )}

        {/* ═══════════════════════════════════════════
            TAB 3: NATIVE FEATURES
        ═══════════════════════════════════════════ */}
        {activeTab === 'native' && (
          <>
            {/* Push Notifications */}
            <section className="space-y-4">
              <SectionHeader icon={Bell} title="Push Notifications" subtitle="Engage users with native push" />
              <FeatureRow icon={Bell} label="Enable Push Notifications" description="Send targeted push messages" value={config.enablePushNotifications || false} onChange={v => onChange('enablePushNotifications', v)} badge="Popular">
                <Select label="Provider" value={config.pushProvider || 'firebase'} onChange={v => onChange('pushProvider', v)}
                  options={[{ value: 'firebase', label: 'Firebase FCM (Recommended)' }, { value: 'onesignal', label: 'OneSignal' }]} />
                {config.pushProvider === 'firebase' && (
                  <Input label="Firebase Project ID" value={config.firebaseProjectId || ''} onChange={e => onChange('firebaseProjectId', e.target.value)} placeholder="my-firebase-project" className="text-xs" />
                )}
                {config.pushProvider === 'onesignal' && (
                  <Input label="OneSignal App ID" value={config.oneSignalAppId || ''} onChange={e => onChange('oneSignalAppId', e.target.value)} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" className="text-xs" />
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Notification Sound</span>
                  <Switch checked={config.notificationSound !== false} onCheckedChange={v => onChange('notificationSound', v)} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Badge Count</span>
                  <Switch checked={config.notificationBadge !== false} onCheckedChange={v => onChange('notificationBadge', v)} />
                </div>
                <InfoBox>Push notifications require adding google-services.json (Android) and GoogleService-Info.plist (iOS) files to your project.</InfoBox>
              </FeatureRow>
            </section>

            {/* Biometric Auth */}
            <section className="space-y-4">
              <SectionHeader icon={Fingerprint} title="Authentication" subtitle="Secure login options" />
              <FeatureRow icon={Fingerprint} label="Biometric Authentication" description="Face ID / Touch ID / Fingerprint" value={config.enableBiometric || false} onChange={v => onChange('enableBiometric', v)}>
                <Input label="Prompt Title" value={config.biometricPromptTitle || ''} onChange={e => onChange('biometricPromptTitle', e.target.value)} placeholder="Authenticate to continue" className="text-xs" />
                <InfoBox>Biometric auth uses the device's secure enclave (iOS Keychain / Android Keystore). Add gonative.auth.* JS Bridge calls to your web app.</InfoBox>
              </FeatureRow>

              <FeatureRow icon={LogIn} label="Google Sign-In" description="Native Google authentication" value={config.enableGoogleLogin || false} onChange={v => onChange('enableGoogleLogin', v)}>
                <Input label="Google Client ID" value={config.googleClientId || ''} onChange={e => onChange('googleClientId', e.target.value)} placeholder="xxx.apps.googleusercontent.com" className="text-xs" />
              </FeatureRow>

              <FeatureRow icon={LogIn} label="Apple Sign-In" description="Required if using any social login (iOS)" value={config.enableAppleLogin || false} onChange={v => onChange('enableAppleLogin', v)} badge="Required for iOS">
                <InfoBox type="warning">Apple requires Sign in with Apple if your app uses any other social login. Automatically enabled when other social logins are active.</InfoBox>
              </FeatureRow>

              <FeatureRow icon={LogIn} label="Facebook Login" description="Native Facebook authentication" value={config.enableFacebookLogin || false} onChange={v => onChange('enableFacebookLogin', v)}>
                <Input label="Facebook App ID" value={config.facebookAppId || ''} onChange={e => onChange('facebookAppId', e.target.value)} placeholder="000000000000000" className="text-xs" />
              </FeatureRow>
            </section>

            {/* Camera & Scanner */}
            <section className="space-y-4">
              <SectionHeader icon={Camera} title="Camera & Scanner" subtitle="Access device camera features" />
              <div className="space-y-3 divide-y divide-gray-50">
                <FeatureRow icon={Camera} label="Camera Access" description="Allow web app to use device camera" value={config.enableCamera || false} onChange={v => onChange('enableCamera', v)} />
                <div className="pt-3">
                  <FeatureRow icon={QrCode} label="QR / Barcode Scanner" description="Native QR code scanner via JS Bridge" value={config.enableQRScanner || false} onChange={v => onChange('enableQRScanner', v)} badge="Popular">
                    <InfoBox>Call <code className="bg-gray-100 px-1 rounded">gonative.barcode.scan()</code> from JavaScript to trigger scanner.</InfoBox>
                  </FeatureRow>
                </div>
                <div className="pt-3">
                  <FeatureRow icon={Upload} label="File Picker" description="Upload files & images from device" value={config.enableFilePicker || false} onChange={v => onChange('enableFilePicker', v)} />
                </div>
              </div>
            </section>

            {/* Native Features */}
            <section className="space-y-4">
              <SectionHeader icon={Zap} title="Native Capabilities" subtitle="Device hardware integration" />

              <FeatureRow icon={Zap} label="Haptic Feedback" description="Native vibration on user actions" value={config.enableHaptics || false} onChange={v => onChange('enableHaptics', v)}>
                <Select label="Default Haptic Style" value={config.hapticStyle || 'medium'} onChange={v => onChange('hapticStyle', v)}
                  options={[{ value: 'light', label: 'Light' }, { value: 'medium', label: 'Medium' }, { value: 'heavy', label: 'Heavy' }]} />
                <InfoBox>Call <code className="bg-gray-100 px-1 rounded">gonative.haptics.impact()</code> from JavaScript.</InfoBox>
              </FeatureRow>

              <FeatureRow icon={Link} label="Deep Linking" description="Custom URL scheme for the app" value={config.enableDeepLinks || false} onChange={v => onChange('enableDeepLinks', v)}>
                <Input label="URL Scheme" value={config.deepLinkScheme || ''} onChange={e => onChange('deepLinkScheme', e.target.value)} placeholder="myapp" className="text-xs font-mono" />
                <p className="text-[11px] text-gray-400">App will open when users tap <code className="bg-gray-100 px-1 rounded">myapp://...</code> links</p>
              </FeatureRow>

              <FeatureRow icon={Globe2} label="Universal / App Links" description="Handle your domain links natively" value={config.enableUniversalLinks || false} onChange={v => onChange('enableUniversalLinks', v)}>
                <Input label="Domain" value={config.universalLinkDomain || ''} onChange={e => onChange('universalLinkDomain', e.target.value)} placeholder="yourwebsite.com" className="text-xs" />
                <InfoBox>Requires hosting apple-app-site-association and assetlinks.json on your domain.</InfoBox>
              </FeatureRow>

              <FeatureRow icon={Star} label="App Rating Prompt" description="Ask satisfied users for a review" value={config.enableAppRating || false} onChange={v => onChange('enableAppRating', v)}>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-gray-500 mb-1 block">After X days</Label>
                    <input type="number" min="1" max="365" value={config.appRatingDaysBeforePrompt || 7}
                      onChange={e => onChange('appRatingDaysBeforePrompt', parseInt(e.target.value))}
                      className="w-full text-xs border border-gray-200 rounded px-2 py-1.5" />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500 mb-1 block">After X sessions</Label>
                    <input type="number" min="1" max="100" value={config.appRatingMinSessions || 5}
                      onChange={e => onChange('appRatingMinSessions', parseInt(e.target.value))}
                      className="w-full text-xs border border-gray-200 rounded px-2 py-1.5" />
                  </div>
                </div>
                <InfoBox type="success">Uses native SKStoreReviewController (iOS) and Play In-App Review API (Android) — limited to 3 times per year.</InfoBox>
              </FeatureRow>

              <FeatureRow icon={ShoppingCart} label="In-App Purchases" description="Sell digital products natively" value={config.enableIAP || false} onChange={v => onChange('enableIAP', v)}>
                <Select label="Provider" value={config.iapProvider || 'revenuecat'} onChange={v => onChange('iapProvider', v)}
                  options={[{ value: 'revenuecat', label: 'RevenueCat (Recommended)' }, { value: 'native', label: 'Native StoreKit / Play Billing' }]} />
                {config.iapProvider === 'revenuecat' && (
                  <Input label="RevenueCat API Key" value={config.revenueCatApiKey || ''} onChange={e => onChange('revenueCatApiKey', e.target.value)} placeholder="appl_xxxxx or goog_xxxxx" className="text-xs" />
                )}
                <InfoBox type="warning">Google Play Billing Library v7 is mandatory as of August 2025. Apple requires a 30% commission on all digital goods.</InfoBox>
              </FeatureRow>
            </section>

            {/* Offline Mode */}
            <section className="space-y-4">
              <SectionHeader icon={WifiOff} title="Offline Mode" subtitle="Work without internet connection" />
              <FeatureRow icon={WifiOff} label="Offline Mode" description="Cache content for offline access" value={config.offlineMode || false} onChange={v => onChange('offlineMode', v)}>
                <Select label="Cache Strategy" value={config.cacheStrategy || 'basic'} onChange={v => onChange('cacheStrategy', v)}
                  options={[{ value: 'basic', label: 'Basic (cache on load)' }, { value: 'aggressive', label: 'Aggressive (prefetch)' }]} />
                <Input label="Custom Offline Page URL" value={config.offlinePage || ''} onChange={e => onChange('offlinePage', e.target.value)} placeholder="https://yoursite.com/offline" className="text-xs" />
              </FeatureRow>
            </section>

            {/* Privacy & Compliance */}
            <section className="space-y-4">
              <SectionHeader icon={Shield} title="Privacy & Compliance" subtitle="GDPR, ATT & app store requirements" />
              <FeatureRow icon={Shield} label="GDPR Compliance Mode" description="Add consent banner for EU users" value={config.enableGDPR || false} onChange={v => onChange('enableGDPR', v)}>
                <InfoBox>GDPR enforcement reached €5.88B in total fines since 2018. Required for apps distributed in the EU.</InfoBox>
              </FeatureRow>
              <FeatureRow icon={Eye} label="Apple App Tracking Transparency" description="Required for iOS tracking (iOS 14.5+)" value={config.enableATT || false} onChange={v => onChange('enableATT', v)} badge="iOS Required">
                <Input label="Purpose String" value={config.dataCollectionPurpose || ''} onChange={e => onChange('dataCollectionPurpose', e.target.value)} placeholder="We use this data to personalize your experience" className="text-xs" />
              </FeatureRow>
            </section>
          </>
        )}

        {/* ═══════════════════════════════════════════
            TAB 4: NAVIGATION
        ═══════════════════════════════════════════ */}
        {activeTab === 'navigation' && (
          <>
            {/* Native Tab Bar */}
            <section className="space-y-4">
              <SectionHeader icon={Navigation} title="Native Tab Bar" subtitle="Bottom tabs like real apps" />
              <FeatureRow icon={Navigation} label="Enable Native Navigation" description="Add native bottom tab bar to your app" value={config.enableNativeNav || false} onChange={v => onChange('enableNativeNav', v)} badge="High Impact">
                <div className="space-y-3">
                  <Select label="Tab Bar Position" value={config.tabBarPosition || 'bottom'} onChange={v => onChange('tabBarPosition', v)}
                    options={[{ value: 'bottom', label: 'Bottom (iOS style)' }, { value: 'top', label: 'Top (Material style)' }]} />
                  <Select label="Tab Style" value={config.tabBarStyle || 'labeled'} onChange={v => onChange('tabBarStyle', v)}
                    options={[{ value: 'labeled', label: 'Icons + Labels' }, { value: 'standard', label: 'Icons only' }, { value: 'floating', label: 'Floating pill' }]} />

                  {/* Tab List */}
                  <div className="space-y-2">
                    {(config.nativeTabs || []).map((tab: NativeTab) => (
                      <div key={tab.id} className="flex gap-2 items-start bg-gray-50 rounded-lg p-2.5 border border-gray-100">
                        <select value={tab.icon} onChange={e => updateNativeTab(tab.id, 'icon', e.target.value)}
                          className="text-lg w-10 text-center bg-white border border-gray-200 rounded-md">
                          {Object.entries(TAB_ICONS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                        <div className="flex-1 space-y-1.5">
                          <input value={tab.label} onChange={e => updateNativeTab(tab.id, 'label', e.target.value)}
                            placeholder="Tab Label" className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 bg-white" />
                          <input value={tab.url} onChange={e => updateNativeTab(tab.id, 'url', e.target.value)}
                            placeholder="https://..." className="w-full text-[11px] border border-gray-200 rounded px-2 py-1.5 bg-white font-mono" />
                        </div>
                        <button onClick={() => removeNativeTab(tab.id)} className="text-red-400 hover:text-red-600 mt-1">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    {(config.nativeTabs || []).length < 5 && (
                      <Button variant="outline" size="sm" onClick={addNativeTab} className="w-full text-xs border-dashed border-gray-300 hover:border-gray-900">
                        <Plus size={12} className="mr-1.5" /> Add Tab (max 5)
                      </Button>
                    )}
                  </div>

                  <InfoBox type="success">Native tabs give your app a real native feel, boosting App Store approval chances and user engagement.</InfoBox>
                </div>
              </FeatureRow>
            </section>

            {/* Link Rules */}
            <section className="space-y-4">
              <SectionHeader icon={Link} title="Link Handling Rules" subtitle="Control how URLs open" />
              <div className="space-y-2">
                {(config.linkRules || []).map((rule: LinkRule, idx: number) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-3 border border-gray-100 space-y-2">
                    <div className="flex gap-2">
                      <input value={rule.pattern} onChange={e => updateLinkRule(idx, 'pattern', e.target.value)}
                        placeholder="*.example.com or regex" className="flex-1 text-xs font-mono border border-gray-200 rounded px-2 py-1.5 bg-white" />
                      <button onClick={() => removeLinkRule(idx)} className="text-red-400 hover:text-red-600">
                        <X size={14} />
                      </button>
                    </div>
                    <select value={rule.action} onChange={e => updateLinkRule(idx, 'action', e.target.value)}
                      className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 bg-white">
                      <option value="open_internal">Open in app</option>
                      <option value="open_browser">Open in browser</option>
                      <option value="block">Block</option>
                    </select>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addLinkRule} className="w-full text-xs border-dashed">
                  <Plus size={12} className="mr-1.5" /> Add Link Rule
                </Button>
              </div>
              <InfoBox>Rules are evaluated in order. Use * as wildcard. Example: *.competitor.com → block</InfoBox>
            </section>
          </>
        )}

        {/* ═══════════════════════════════════════════
            TAB 5: ANALYTICS
        ═══════════════════════════════════════════ */}
        {activeTab === 'analytics' && (
          <>
            {/* Analytics */}
            <section className="space-y-4">
              <SectionHeader icon={BarChart2} title="Analytics" subtitle="Track user behavior and events" />
              <FeatureRow icon={BarChart2} label="Enable Analytics" description="Track sessions, events, conversions" value={config.enableAnalytics || false} onChange={v => onChange('enableAnalytics', v)}>
                <Select label="Provider" value={config.analyticsProvider || 'firebase'} onChange={v => onChange('analyticsProvider', v)}
                  options={[{ value: 'firebase', label: 'Firebase Analytics (Free)' }]} />
                {config.analyticsProvider === 'firebase' && (
                  <Input label="Firebase App ID" value={config.firebaseAnalyticsId || ''} onChange={e => onChange('firebaseAnalyticsId', e.target.value)} placeholder="1:000000000:android:000000000" className="text-xs" />
                )}
                <InfoBox type="success">Firebase Analytics is free and tracks 500+ event types automatically including screen views, user properties, and funnel analysis.</InfoBox>
              </FeatureRow>
            </section>

            {/* Crash Reporting */}
            <section className="space-y-4">
              <SectionHeader icon={AlertTriangle} title="Crash Reporting" subtitle="Detect and fix crashes faster" />
              <FeatureRow icon={AlertTriangle} label="Enable Crash Reporting" description="Get notified of app crashes" value={config.enableCrashReporting || false} onChange={v => onChange('enableCrashReporting', v)}>
                <Select label="Provider" value={config.crashReportingProvider || 'firebase'} onChange={v => onChange('crashReportingProvider', v)}
                  options={[{ value: 'firebase', label: 'Firebase Crashlytics (Free)' }, { value: 'sentry', label: 'Sentry' }]} />
                {config.crashReportingProvider === 'sentry' && (
                  <Input label="Sentry DSN" value={config.sentryDsn || ''} onChange={e => onChange('sentryDsn', e.target.value)} placeholder="https://xxx@sentry.io/xxx" className="text-xs" />
                )}
              </FeatureRow>
            </section>
          </>
        )}

        {/* ═══════════════════════════════════════════
            TAB 6: APP STORE (ASO)
        ═══════════════════════════════════════════ */}
        {activeTab === 'aso' && (
          <>
            <section className="space-y-4">
              <SectionHeader icon={Search} title="App Store Optimization" subtitle="Improve discoverability & conversion" />

              <div className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
                <p className="text-xs font-bold text-blue-800 mb-1">💡 ASO Tip</p>
                <p className="text-xs text-blue-700">Apps with optimized descriptions and keywords get 2-3× more organic downloads. Fill all fields below for best results.</p>
              </div>

              <Select label="App Category" value={config.appCategory || 'utilities'} onChange={v => onChange('appCategory', v)}
                options={[
                  { value: 'utilities', label: 'Utilities' }, { value: 'business', label: 'Business' },
                  { value: 'education', label: 'Education' }, { value: 'finance', label: 'Finance' },
                  { value: 'food-drink', label: 'Food & Drink' }, { value: 'health-fitness', label: 'Health & Fitness' },
                  { value: 'lifestyle', label: 'Lifestyle' }, { value: 'news', label: 'News' },
                  { value: 'productivity', label: 'Productivity' }, { value: 'shopping', label: 'Shopping' },
                  { value: 'social', label: 'Social Networking' }, { value: 'sports', label: 'Sports' },
                  { value: 'travel', label: 'Travel' }, { value: 'entertainment', label: 'Entertainment' },
                ]} />

              <Select label="Content Rating" value={config.contentRating || 'everyone'} onChange={v => onChange('contentRating', v)}
                options={[{ value: 'everyone', label: 'Everyone (4+)' }, { value: 'teen', label: 'Teen (12+)' }, { value: 'mature', label: 'Mature (17+)' }]} />

              <TextArea label="Full Description (up to 4000 chars)" value={config.fullDescription || ''} onChange={v => onChange('fullDescription', v)}
                placeholder="Describe your app's features, benefits, and what makes it unique. Use keywords naturally throughout the description..." rows={6} maxLength={4000} />

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-600">
                  Keywords <span className="text-gray-400">(comma-separated, max 100 chars for iOS)</span>
                </Label>
                <input value={config.keywords || ''} onChange={e => onChange('keywords', e.target.value)}
                  placeholder="app, website, mobile, converter, native"
                  className="w-full text-xs border border-gray-200 rounded-md px-3 py-2 bg-white" />
                <p className="text-[11px] text-gray-400">
                  {(config.keywords || '').length}/100 chars
                  · {(config.keywords || '').split(',').filter(Boolean).length} keywords
                </p>
              </div>

              <InfoBox type="success">Tip: Use keywords in your app name and subtitle for maximum ASO impact. Avoid repeating keywords already in your title.</InfoBox>
            </section>

            {/* Security */}
            <section className="space-y-4">
              <SectionHeader icon={Lock} title="Security Settings" subtitle="Protect your app and users" />

              <FeatureRow icon={Lock} label="Certificate Pinning" description="Prevent MITM attacks" value={config.enableCertPinning || false} onChange={v => onChange('enableCertPinning', v)} badge="Enterprise">
                <TextArea label="Pinned Domains (one per line)" value={config.pinnedCertHosts || ''} onChange={v => onChange('pinnedCertHosts', v)}
                  placeholder="api.yoursite.com&#10;auth.yoursite.com" rows={3} />
                <InfoBox type="warning">Always include backup pins to avoid locking users out if your cert changes.</InfoBox>
              </FeatureRow>

              <FeatureRow icon={ShieldCheck} label="Root / Jailbreak Detection" description="Warn users on compromised devices" value={config.enableRootDetection || false} onChange={v => onChange('enableRootDetection', v)} />

              <FeatureRow icon={Eye} label="Screenshot Protection" description="Prevent screen capture of sensitive views" value={config.enableScreenshotProtection || false} onChange={v => onChange('enableScreenshotProtection', v)} badge="Enterprise">
                <InfoBox>Useful for banking, medical, and enterprise apps. Users will see a black screen when attempting screenshots.</InfoBox>
              </FeatureRow>
            </section>
          </>
        )}

        {/* ═══════════════════════════════════════════
            TAB 7: ADVANCED
        ═══════════════════════════════════════════ */}
        {activeTab === 'advanced' && (
          <>
            {/* JS Bridge */}
            <section className="space-y-4">
              <SectionHeader icon={Code} title="JavaScript Bridge" subtitle="Native ↔ Web communication" />

              <FeatureRow icon={Code} label="Enable JS Bridge" description="Allow JS ↔ Native communication" value={config.enableJSBridge !== false} onChange={v => onChange('enableJSBridge', v)}>
                <div className="bg-gray-900 rounded-lg p-3 space-y-1.5">
                  <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-2">Available APIs</p>
                  {[
                    'gonative.deviceInfo()',
                    'gonative.push.register()',
                    'gonative.barcode.scan()',
                    'gonative.haptics.impact()',
                    'gonative.auth.biometric.status()',
                    'gonative.share.share({text})',
                    'gonative.storage.get({key})',
                    'gonative.navigation.tabs.setTab({index})',
                    'gonative.appReview.requestReview()',
                  ].map(api => (
                    <code key={api} className="block text-[11px] text-emerald-400 font-mono">{api}</code>
                  ))}
                </div>
                <InfoBox type="success">Install the NPM package: <code className="bg-white px-1 rounded">npm install web2app-bridge</code> for TypeScript types and promise-based API.</InfoBox>
              </FeatureRow>
            </section>

            {/* Custom Code */}
            <section className="space-y-4">
              <SectionHeader icon={Code} title="Custom Injection" subtitle="Inject CSS and JavaScript into WebView" />

              <TextArea label="Custom CSS (injected into all pages)" value={config.customCSS || ''} onChange={v => onChange('customCSS', v)}
                placeholder="/* Custom styles */&#10;body { font-family: -apple-system !important; }" rows={4} />

              <TextArea label="Custom JavaScript (executed on page load)" value={config.customJS || ''} onChange={v => onChange('customJS', v)}
                placeholder="// Custom JS&#10;document.body.classList.add('mobile-app');" rows={4} />

              <TextArea label="Custom HTTP Headers (JSON format)" value={config.customHeaders || ''} onChange={v => onChange('customHeaders', v)}
                placeholder='{"X-App-Version": "1.0", "X-Platform": "mobile"}' rows={3} />

              <InfoBox type="warning">Custom code runs in the WebView context. Avoid storing sensitive data in JavaScript as it's accessible to the web page.</InfoBox>
            </section>

            {/* Debug */}
            <section className="space-y-3">
              <SectionHeader icon={Settings} title="Developer Options" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">Debug Mode</p>
                  <p className="text-xs text-gray-400">Enable Chrome DevTools remote debugging (Android)</p>
                </div>
                <Switch checked={config.debugMode || false} onCheckedChange={v => onChange('debugMode', v)} />
              </div>
              {config.debugMode && (
                <InfoBox type="warning">Debug mode allows USB debugging of the WebView. Disable before publishing to production!</InfoBox>
              )}
            </section>
          </>
        )}

      </div>
    </div>
  );
};