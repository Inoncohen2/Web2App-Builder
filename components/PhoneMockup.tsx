import React, { useState, useEffect } from 'react';
import { AppConfig } from '../types';
import { Wifi, BatteryMedium, Signal, RefreshCw, ChevronLeft, Menu, X } from 'lucide-react';

interface PhoneMockupProps {
  config: AppConfig;
}

export const PhoneMockup: React.FC<PhoneMockupProps> = ({ config }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [iframeKey, setIframeKey] = useState(0); // Used to force reload iframe
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Update iframe when URL changes significantly (debounce could be added in parent)
  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 2000); // Simulate load time
    return () => clearTimeout(timeout);
  }, [config.websiteUrl]);

  const handleRefresh = () => {
    setLoading(true);
    setIframeKey(prev => prev + 1);
    setTimeout(() => setLoading(false), 1500);
  };

  const getThemeBackground = () => {
    if (config.themeMode === 'dark') return 'bg-neutral-900 text-white';
    if (config.themeMode === 'light') return 'bg-white text-black';
    return 'bg-white text-black'; // Default to system-like light for now
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-8">
      {/* iPhone Frame */}
      <div 
        className="relative mx-auto aspect-[9/19.5] w-[320px] rounded-[3rem] border-[14px] border-neutral-900 bg-neutral-900 shadow-[0_0_50px_-12px_rgba(0,0,0,0.25)] sm:w-[350px] md:w-[380px]"
        style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
      >
        {/* Dynamic Island / Notch */}
        <div className="absolute left-1/2 top-0 z-50 h-[28px] w-[120px] -translate-x-1/2 rounded-b-[1rem] bg-black"></div>

        {/* Screen Content */}
        <div className={`relative flex h-full w-full flex-col overflow-hidden rounded-[2rem] ${getThemeBackground()}`}>
          
          {/* Status Bar */}
          <div 
            className="flex h-12 w-full flex-shrink-0 items-center justify-between px-6 pt-2 text-xs font-medium transition-colors duration-300"
            style={{ backgroundColor: config.primaryColor, color: isLightColor(config.primaryColor) ? 'black' : 'white' }}
          >
            <span>
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
            </span>
            <div className="flex items-center space-x-2">
              <Signal size={14} />
              <Wifi size={14} />
              <BatteryMedium size={14} />
            </div>
          </div>

          {/* Optional Native Nav Bar */}
          {config.showNavBar && (
            <div className="flex h-14 w-full flex-shrink-0 items-center justify-between border-b px-4 shadow-sm" style={{ borderColor: isLightColor(config.primaryColor) ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)' }}>
              {config.appIcon ? (
                <img src={config.appIcon} alt="App Icon" className="h-8 w-8 rounded-md object-cover" />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-200 text-xs font-bold text-gray-500">
                  Icon
                </div>
              )}
              <span className="font-semibold">{config.appName}</span>
              <div className="flex w-8 justify-end">
                <Menu size={20} className="cursor-pointer" />
              </div>
            </div>
          )}

          {/* Main Web Content (Iframe) */}
          <div className="relative flex-1 overflow-hidden bg-white">
            {config.enablePullToRefresh && (
              <div className="absolute left-0 right-0 top-0 z-10 flex justify-center py-2 opacity-0 hover:opacity-100 transition-opacity">
                <RefreshCw size={20} className="text-gray-400 animate-spin" />
              </div>
            )}
            
            {loading && config.showSplashScreen && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white">
                {config.appIcon ? (
                  <img src={config.appIcon} alt="Logo" className="mb-4 h-24 w-24 animate-pulse rounded-2xl shadow-xl" />
                ) : (
                   <div className="mb-4 flex h-24 w-24 animate-pulse items-center justify-center rounded-2xl bg-gray-100 shadow-xl">
                      <span className="text-4xl font-bold text-gray-300">App</span>
                   </div>
                )}
                <h2 className="text-xl font-bold text-gray-800 animate-pulse">{config.appName}</h2>
              </div>
            )}

            <iframe
              key={iframeKey}
              src={isValidUrl(config.websiteUrl) ? config.websiteUrl : 'about:blank'}
              className="h-full w-full border-none"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              title="App Preview"
            />
          </div>

          {/* Bottom Nav Bar (Simulated Browser Controls or App Tab Bar) */}
          <div className="flex h-16 w-full flex-shrink-0 items-center justify-around border-t bg-white px-2 pb-4 text-gray-500 dark:bg-black dark:text-gray-400">
             <div className="flex flex-col items-center justify-center gap-1 cursor-pointer hover:text-blue-500">
                <div className="h-5 w-5 rounded bg-current opacity-20"></div>
                <span className="text-[10px]">Home</span>
             </div>
             <div className="flex flex-col items-center justify-center gap-1 cursor-pointer hover:text-blue-500">
                <div className="h-5 w-5 rounded bg-current opacity-20"></div>
                <span className="text-[10px]">Search</span>
             </div>
             <div className="flex flex-col items-center justify-center gap-1 cursor-pointer hover:text-blue-500">
                <div className="h-5 w-5 rounded bg-current opacity-20"></div>
                <span className="text-[10px]">Profile</span>
             </div>
          </div>

           {/* Home Indicator */}
          <div className="absolute bottom-2 left-1/2 h-1 w-1/3 -translate-x-1/2 rounded-full bg-black/40 dark:bg-white/40"></div>
        </div>

        {/* Hardware Buttons */}
        <div className="absolute -left-[16px] top-[100px] h-[30px] w-[4px] rounded-l-md bg-neutral-800"></div> {/* Mute */}
        <div className="absolute -left-[16px] top-[150px] h-[60px] w-[4px] rounded-l-md bg-neutral-800"></div> {/* Vol Up */}
        <div className="absolute -left-[16px] top-[225px] h-[60px] w-[4px] rounded-l-md bg-neutral-800"></div> {/* Vol Down */}
        <div className="absolute -right-[16px] top-[170px] h-[90px] w-[4px] rounded-r-md bg-neutral-800"></div> {/* Power */}
      </div>

      <div className="mt-8 flex gap-4">
        <button 
          onClick={handleRefresh}
          className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-600 shadow-sm transition hover:bg-gray-50"
        >
          <RefreshCw size={16} /> Refresh Preview
        </button>
      </div>
      
      {!isValidUrl(config.websiteUrl) && config.websiteUrl.length > 0 && (
          <p className="mt-2 text-sm text-red-500">Please enter a valid URL (including https://)</p>
      )}
    </div>
  );
};

// Helper to determine if text should be black or white based on background
function isLightColor(color: string) {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return yiq >= 128;
}

function isValidUrl(string: string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;  
  }
}
