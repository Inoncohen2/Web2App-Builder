
import React, { useState, useEffect } from 'react';
import { AppConfig } from '../types';
import { 
  Wifi, Battery, Signal, RefreshCw, Menu, X, LoaderCircle, 
  Home, Search, ShoppingCart, User, Settings, Bell, Heart, Star, MessageCircle, Menu as MenuIcon,
  Fingerprint, FaceId, Smartphone, WifiOff, ThumbsUp, Send
} from 'lucide-react';

interface PhoneMockupProps {
  config: AppConfig;
  isMobilePreview?: boolean;
  refreshKey?: number;
  isLoading?: boolean;
}

// --- Icons Mapping for Tab Bar ---
const TAB_ICONS: Record<string, any> = {
  home: Home,
  search: Search,
  cart: ShoppingCart,
  profile: User,
  settings: Settings,
  bell: Bell,
  heart: Heart,
  star: Star,
  chat: MessageCircle,
  menu: MenuIcon,
};

// --- Helper Components ---

const SimulationButton = ({ onClick, icon: Icon, label, active = false }: any) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1.5 p-2 rounded-lg transition-all text-[10px] font-medium w-16
      ${active ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-white hover:bg-gray-50 text-gray-500 border border-gray-100'}
    `}
  >
    <Icon size={16} />
    <span className="text-center leading-tight">{label}</span>
  </button>
);

const PushNotification = ({ appName, icon, message, onClose }: any) => (
  <div className="absolute top-2 left-2 right-2 bg-white/90 backdrop-blur-md rounded-xl shadow-lg p-3 z-50 animate-in slide-in-from-top-2 border border-gray-200/50 cursor-pointer" onClick={onClose}>
    <div className="flex items-start gap-3">
       <div className="h-9 w-9 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
          {icon ? <img src={icon} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-black" />}
       </div>
       <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center mb-0.5">
             <span className="font-bold text-xs text-gray-900 truncate">{appName}</span>
             <span className="text-[10px] text-gray-500">now</span>
          </div>
          <p className="text-xs text-gray-600 leading-tight">{message}</p>
       </div>
    </div>
  </div>
);

const BiometricOverlay = ({ type, appName, color, onClose }: any) => (
  <div className="absolute inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center animate-in fade-in">
     <div className="bg-white rounded-[2rem] p-8 w-[80%] flex flex-col items-center text-center shadow-2xl animate-in zoom-in-95">
        <div className="mb-4 text-emerald-500 animate-pulse">
           {type === 'face' ? <FaceId size={48} /> : <Fingerprint size={48} />}
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">{type === 'face' ? 'Face ID' : 'Touch ID'}</h3>
        <p className="text-xs text-gray-500 mb-6">Login to {appName}</p>
        <button onClick={onClose} className="text-emerald-600 font-medium text-sm hover:underline">Cancel</button>
     </div>
  </div>
);

const RateDialog = ({ appName, color, onClose }: any) => (
  <div className="absolute inset-0 z-50 bg-black/20 flex items-center justify-center animate-in fade-in">
     <div className="bg-white rounded-xl w-[75%] overflow-hidden shadow-2xl animate-in zoom-in-95">
        <div className="p-5 text-center">
           <h3 className="font-bold text-gray-900 text-sm mb-1">Enjoying {appName}?</h3>
           <p className="text-xs text-gray-500">Tap a star to rate it on the App Store.</p>
           <div className="flex justify-center gap-1 my-4">
              {[1,2,3,4,5].map(i => <Star key={i} size={24} className="text-blue-500 fill-blue-500" />)}
           </div>
        </div>
        <div className="border-t border-gray-100 flex divide-x divide-gray-100">
           <button onClick={onClose} className="flex-1 py-3 text-sm font-medium text-blue-600 active:bg-blue-50">Not Now</button>
           <button onClick={onClose} className="flex-1 py-3 text-sm font-bold text-blue-600 active:bg-blue-50">Submit</button>
        </div>
     </div>
  </div>
);

const OfflineScreen = ({ onRetry }: any) => (
  <div className="absolute inset-0 z-10 bg-white flex flex-col items-center justify-center p-6 text-center">
      <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
         <WifiOff size={32} className="text-gray-400" />
      </div>
      <h3 className="font-bold text-gray-900 mb-2">No Internet Connection</h3>
      <p className="text-sm text-gray-500 mb-6">Please check your connection and try again.</p>
      <button onClick={onRetry} className="px-6 py-2 bg-black text-white rounded-full text-sm font-medium active:scale-95 transition-transform">
         Try Again
      </button>
  </div>
);

// --- Main Component ---

const PhoneMockup: React.FC<PhoneMockupProps> = ({ config, isMobilePreview = false, refreshKey = 0, isLoading = false }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [internalKey, setInternalKey] = useState(0); 
  const [iframeLoading, setIframeLoading] = useState(false);
  const [simulatedProgress, setSimulatedProgress] = useState(0);

  // Simulation States
  const [simPush, setSimPush] = useState(false);
  const [simBio, setSimBio] = useState(false);
  const [simRate, setSimRate] = useState(false);
  const [simOffline, setSimOffline] = useState(false);
  const [simToast, setSimToast] = useState<string | null>(null);

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Reload Logic
  useEffect(() => {
    if (!config?.websiteUrl) return;
    triggerLoad();
  }, [config.websiteUrl, refreshKey, internalKey]);

  // Loading Bar Logic
  useEffect(() => {
    if (iframeLoading && config.loadingIndicator) {
        setSimulatedProgress(10);
        const interval = setInterval(() => {
            setSimulatedProgress(prev => prev >= 90 ? 90 : prev + Math.random() * 15);
        }, 300);
        return () => clearInterval(interval);
    } else {
        setSimulatedProgress(100);
        const t = setTimeout(() => setSimulatedProgress(0), 500);
        return () => clearTimeout(t);
    }
  }, [iframeLoading, config.loadingIndicator]);

  const triggerLoad = () => {
    setIframeLoading(true);
    const timeout = setTimeout(() => setIframeLoading(false), 2000); 
    return () => clearTimeout(timeout);
  };

  const handleInternalRefresh = () => {
    setInternalKey(prev => prev + 1);
  };

  const getThemeBackground = () => {
    if (config.themeMode === 'dark') return 'bg-neutral-900 text-white';
    if (config.themeMode === 'light') return 'bg-white text-black';
    return 'bg-white text-black';
  };

  const isUrlValid = isValidUrl(config.websiteUrl);

  return (
    <div className={`flex flex-col items-center justify-center transition-all duration-300 ${isMobilePreview ? '' : 'p-4'}`}>
      <div className="relative">
          {/* Phone Frame */}
          <div 
            className={`relative flex-shrink-0 origin-center bg-neutral-900 transition-all duration-300 overflow-hidden border-neutral-900 shadow-2xl
              ${isMobilePreview ? 'border-[12px] rounded-[3rem]' : 'w-[320px] sm:w-[350px] md:w-[360px] border-[14px] rounded-[3rem]'}`}
            style={{ 
              aspectRatio: '9/19.5',
              width: isMobilePreview ? '100%' : undefined,
              height: isMobilePreview ? '100%' : undefined,
            }}
          >
            {/* Dynamic Island / Notch */}
            <div className={`absolute left-1/2 top-0 z-50 -translate-x-1/2 rounded-b-[1rem] bg-black ${isMobilePreview ? 'h-[28px] w-[100px]' : 'h-[25px] w-[100px]'}`}></div>

            {/* Screen */}
            <div className={`relative flex h-full w-full flex-col overflow-hidden ${isMobilePreview ? 'rounded-[2.2rem]' : 'rounded-[2.2rem]'} ${getThemeBackground()}`}>
              
              {/* --- 1. OVERLAYS (Highest Z-Index) --- */}
              {simPush && <PushNotification appName={config.appName} icon={config.appIcon} message="🎉 Your order has been shipped!" onClose={() => setSimPush(false)} />}
              {simBio && config.enableBiometric && <BiometricOverlay type="face" appName={config.appName} onClose={() => setSimBio(false)} />}
              {simRate && config.enableAppRating && <RateDialog appName={config.appName} onClose={() => setSimRate(false)} />}
              {simToast && (
                  <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-neutral-800/90 text-white px-4 py-2 rounded-full text-xs font-medium shadow-lg backdrop-blur-sm z-50 animate-in fade-in zoom-in-95">
                      {simToast}
                  </div>
              )}

              {/* --- 2. STATUS BAR --- */}
              <div 
                className="flex h-11 w-full flex-shrink-0 items-center justify-between px-6 pt-3 text-[10px] font-medium transition-colors duration-300 z-40 relative"
                style={{ backgroundColor: config.primaryColor, color: isLightColor(config.primaryColor) ? 'black' : 'white' }}
              >
                <span className="ml-1">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                <div className="flex items-center space-x-1.5"><Signal size={12} /><Wifi size={12} /><Battery size={12} /></div>
              </div>

              {/* --- 3. NAVIGATION BAR (Top) --- */}
              {config.showNavBar && (
                <div className="flex h-12 w-full flex-shrink-0 items-center justify-between border-b px-4 shadow-sm z-30 relative transition-colors duration-300" 
                     style={{ 
                       backgroundColor: config.primaryColor, 
                       color: isLightColor(config.primaryColor) ? 'black' : 'white',
                       borderColor: isLightColor(config.primaryColor) ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)' 
                     }}>
                  <div className="flex items-center gap-2 overflow-hidden">
                    {config.appIcon && !config.showSplashScreen ? (
                      <img src={config.appIcon} alt="Icon" className="h-7 w-7 rounded-md object-cover flex-shrink-0 bg-white" />
                    ) : null}
                    <span className="font-semibold truncate text-sm">{config.appName}</span>
                  </div>
                  <Menu size={18} className="cursor-pointer opacity-80" />
                </div>
              )}

              {/* --- 4. LOADING INDICATOR --- */}
              {config.loadingIndicator && iframeLoading && (
                  <div className="h-0.5 w-full bg-gray-100 z-30 absolute top-[calc(44px+48px)] left-0">
                      <div 
                        className="h-full transition-all duration-300 ease-out" 
                        style={{ width: `${simulatedProgress}%`, backgroundColor: config.loadingColor || config.primaryColor }}
                      ></div>
                  </div>
              )}

              {/* --- 5. CONTENT AREA --- */}
              <div className="relative flex-1 w-full h-full bg-white overflow-hidden isolate overscroll-contain">
                
                {simOffline ? (
                    <OfflineScreen onRetry={() => { setSimOffline(false); triggerLoad(); }} />
                ) : (
                    <>
                        {/* Pull To Refresh Simulation */}
                        {config.enablePullToRefresh && (
                        <div className="absolute left-0 right-0 top-0 z-10 flex justify-center py-2 opacity-0 hover:opacity-100 transition-opacity">
                            <RefreshCw size={16} className="text-gray-400 animate-spin" />
                        </div>
                        )}
                        
                        {/* Splash Screen Simulation */}
                        {(iframeLoading || config.showSplashScreen) && iframeLoading && (
                        <div 
                            className="absolute inset-0 z-20 flex flex-col items-center justify-center transition-opacity duration-500"
                            style={{ backgroundColor: config.splashColor || '#ffffff' }}
                        >
                            {config.appIcon ? (
                            <img src={config.appIcon} alt="Logo" className={`mb-4 h-24 w-24 shadow-2xl rounded-3xl ${config.splashAnimation === 'zoom' ? 'animate-[ping_1s_ease-in-out_infinite]' : 'animate-pulse'}`} />
                            ) : (
                            <div className="mb-4 flex h-24 w-24 animate-pulse items-center justify-center rounded-3xl bg-gray-100 shadow-xl">
                                <span className="text-3xl font-bold text-gray-300">App</span>
                            </div>
                            )}
                            <div className="mt-8 flex flex-col items-center gap-3">
                                <LoaderCircle className="animate-spin text-gray-400" size={24} />
                                <span className="text-xs font-medium text-gray-400 tracking-widest uppercase">Loading...</span>
                            </div>
                        </div>
                        )}

                        {/* The Actual Site */}
                        {isUrlValid ? (
                            <iframe
                                key={`${refreshKey}-${internalKey}`}
                                src={config.websiteUrl}
                                className="h-full w-full border-none bg-white"
                                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                                title="App Preview"
                                loading="lazy" 
                            />
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gray-50 z-0">
                                <X size={32} className="text-red-500 mb-4" />
                                <h3 className="text-lg font-bold text-gray-900">Website Not Found</h3>
                            </div>
                        )}
                    </>
                )}
              </div>

              {/* --- 6. NATIVE NAVIGATION (Bottom Tabs) --- */}
              {config.enableNativeNav && config.nativeTabs && config.nativeTabs.length > 0 && (
                  <div className="flex-shrink-0 bg-white border-t border-gray-100 flex items-center justify-around h-[60px] pb-3 z-30 px-2 transition-all">
                      {config.nativeTabs.slice(0, 5).map((tab, idx) => {
                          const Icon = TAB_ICONS[tab.icon] || Home;
                          const isActive = idx === 0; // Simulate first tab active
                          const color = isActive ? (config.primaryColor || 'black') : '#9ca3af';
                          
                          return (
                              <div key={tab.id} className="flex-1 flex flex-col items-center justify-center gap-1 h-full cursor-pointer active:scale-95 transition-transform" onClick={() => setSimToast(`Navigated to ${tab.label}`)}>
                                  <div className="relative">
                                      <Icon size={22} style={{ color }} strokeWidth={isActive ? 2.5 : 2} />
                                      {/* Badge Simulation */}
                                      {tab.label === 'Cart' && (
                                          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] h-3.5 w-3.5 flex items-center justify-center rounded-full font-bold">2</div>
                                      )}
                                  </div>
                                  {config.tabBarStyle !== 'standard' && (
                                      <span className="text-[10px] font-medium truncate w-full text-center" style={{ color }}>{tab.label}</span>
                                  )}
                              </div>
                          );
                      })}
                  </div>
              )}

               {/* Home Indicator */}
              <div className="absolute bottom-1.5 left-1/2 h-1 w-1/3 -translate-x-1/2 rounded-full bg-black/20 dark:bg-white/20 pointer-events-none z-50"></div>
            </div>

            {/* Side Buttons (Volume/Power) */}
            {!isMobilePreview && (
              <>
                <div className="absolute -left-[14px] top-[100px] h-[30px] w-[4px] rounded-l-md bg-neutral-800"></div> 
                <div className="absolute -left-[14px] top-[150px] h-[60px] w-[4px] rounded-l-md bg-neutral-800"></div> 
                <div className="absolute -left-[14px] top-[225px] h-[60px] w-[4px] rounded-l-md bg-neutral-800"></div> 
                <div className="absolute -right-[14px] top-[170px] h-[90px] w-[4px] rounded-r-md bg-neutral-800"></div> 
              </>
            )}
          </div>

          {/* Refresh Floating Button */}
          {!isMobilePreview && (
            <button 
              onClick={handleInternalRefresh}
              className="absolute -right-16 top-[10%] flex items-center justify-center h-10 w-10 rounded-full bg-white text-gray-600 shadow-xl border border-gray-200 hover:bg-gray-50 hover:text-emerald-600 hover:border-emerald-200 transition-all active:scale-95 group z-50"
              title="Refresh Website"
            >
              <RefreshCw size={18} className={iframeLoading ? 'animate-spin text-emerald-600' : 'group-hover:rotate-180 transition-transform duration-500'} /> 
            </button>
          )}
      </div>

      {/* --- SIMULATION CONTROLS (Desktop Only) --- */}
      {!isMobilePreview && (
          <div className="mt-8 grid grid-cols-4 gap-3 bg-white p-3 rounded-2xl shadow-sm border border-gray-100 max-w-[360px] w-full animate-in slide-in-from-bottom-4">
              <SimulationButton 
                onClick={() => setSimPush(true)} 
                icon={Bell} 
                label="Test Push" 
                active={simPush} 
              />
              <SimulationButton 
                onClick={() => {
                    if (!config.enableBiometric) { alert("Enable Biometrics in settings first!"); return; }
                    setSimBio(true);
                }} 
                icon={Fingerprint} 
                label="Biometrics" 
                active={simBio} 
              />
              <SimulationButton 
                onClick={() => setSimOffline(!simOffline)} 
                icon={simOffline ? Wifi : WifiOff} 
                label={simOffline ? "Go Online" : "Go Offline"} 
                active={simOffline} 
              />
              <SimulationButton 
                onClick={() => setSimRate(true)} 
                icon={ThumbsUp} 
                label="Rate App" 
                active={simRate} 
              />
          </div>
      )}
    </div>
  );
};

function isLightColor(color: string) {
  if (!color) return true;
  const hex = color.replace('#', '');
  if (hex.length !== 6) return true;
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return yiq >= 128;
}

function isValidUrl(string: string) {
  try {
    if (!string) return false;
    if (!string.includes('.') || string.length < 4) return false;
    new URL(string);
    return true;
  } catch (_) {
    return false;  
  }
}

export { PhoneMockup };
