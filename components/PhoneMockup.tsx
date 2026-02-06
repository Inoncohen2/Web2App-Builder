import React, { useState, useEffect } from 'react';
import { AppConfig } from '../types';
import { Wifi, BatteryMedium, Signal, RefreshCw, Menu, AlertCircle } from 'lucide-react';

interface PhoneMockupProps {
  config: AppConfig;
  isMobilePreview?: boolean;
}

export const PhoneMockup: React.FC<PhoneMockupProps> = ({ config, isMobilePreview = false }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [iframeKey, setIframeKey] = useState(0); // Used to force reload iframe
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Update iframe when URL changes significantly
  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 2000); 
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
    return 'bg-white text-black';
  };

  return (
    <div className={`flex flex-col items-center justify-center transition-all duration-300 ${isMobilePreview ? 'h-full w-full' : 'p-8'}`}>
      {/* iPhone Frame */}
      {/* Width Logic: 
          - Desktop: Fixed widths (320px -> 380px)
          - Mobile Preview: Fixed 375px base width (standard viewport). 
            The parent container scales this down to fit the screen.
      */}
      <div 
        className={`relative flex-shrink-0 origin-center bg-neutral-900 shadow-2xl transition-all duration-300
          ${isMobilePreview 
             ? 'w-[375px] border-[8px] rounded-[2.5rem]' // Wider base width, thinner border
             : 'w-[320px] sm:w-[350px] md:w-[380px] border-[14px] rounded-[3rem]'
          } border-neutral-900 aspect-[9/19.5]`}
        style={{ 
          boxShadow: isMobilePreview ? '0 10px 30px -10px rgba(0,0,0,0.3)' : '0 25px 50px -12px rgba(0, 0, 0, 0.5)' 
        }}
      >
        {/* Dynamic Island / Notch */}
        <div className="absolute left-1/2 top-0 z-50 h-[25px] w-[100px] -translate-x-1/2 rounded-b-[1rem] bg-black"></div>

        {/* Screen Content */}
        <div className={`relative flex h-full w-full flex-col overflow-hidden ${isMobilePreview ? 'rounded-[2rem]' : 'rounded-[2.2rem]'} ${getThemeBackground()}`}>
          
          {/* Status Bar */}
          <div 
            className="flex h-11 w-full flex-shrink-0 items-center justify-between px-6 pt-3 text-[10px] font-medium transition-colors duration-300"
            style={{ backgroundColor: config.primaryColor, color: isLightColor(config.primaryColor) ? 'black' : 'white' }}
          >
            <span className="ml-1">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
            </span>
            <div className="flex items-center space-x-1.5">
              <Signal size={12} />
              <Wifi size={12} />
              <BatteryMedium size={12} />
            </div>
          </div>

          {/* Optional Native Nav Bar */}
          {config.showNavBar && (
            <div className="flex h-12 w-full flex-shrink-0 items-center justify-between border-b px-4 shadow-sm z-10 relative" 
                 style={{ 
                   backgroundColor: config.primaryColor, 
                   color: isLightColor(config.primaryColor) ? 'black' : 'white',
                   borderColor: isLightColor(config.primaryColor) ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)' 
                 }}>
              <div className="flex items-center gap-2 overflow-hidden">
                {config.appIcon ? (
                  <img src={config.appIcon} alt="App Icon" className="h-7 w-7 rounded-md object-cover flex-shrink-0 bg-white" />
                ) : null}
                <span className="font-semibold truncate text-sm">{config.appName}</span>
              </div>
              <Menu size={18} className="cursor-pointer opacity-80" />
            </div>
          )}

          {/* Main Web Content (Iframe) */}
          <div className="relative flex-1 w-full h-full bg-white overflow-hidden isolate">
            {config.enablePullToRefresh && (
              <div className="absolute left-0 right-0 top-0 z-10 flex justify-center py-2 opacity-0 hover:opacity-100 transition-opacity">
                <RefreshCw size={16} className="text-gray-400 animate-spin" />
              </div>
            )}
            
            {loading && config.showSplashScreen && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white">
                {config.appIcon ? (
                  <img src={config.appIcon} alt="Logo" className="mb-4 h-20 w-20 animate-pulse rounded-2xl shadow-lg" />
                ) : (
                   <div className="mb-4 flex h-20 w-20 animate-pulse items-center justify-center rounded-2xl bg-gray-100 shadow-lg">
                      <span className="text-3xl font-bold text-gray-300">App</span>
                   </div>
                )}
                <h2 className="text-lg font-bold text-gray-800 animate-pulse px-4 text-center">{config.appName}</h2>
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

           {/* Home Indicator */}
          <div className="absolute bottom-1.5 left-1/2 h-1 w-1/3 -translate-x-1/2 rounded-full bg-black/20 dark:bg-white/20 pointer-events-none z-30"></div>
        </div>

        {/* Hardware Buttons - Only show on desktop or if space permits to keep mobile clean */}
        {!isMobilePreview && (
          <>
            <div className="absolute -left-[14px] top-[100px] h-[30px] w-[4px] rounded-l-md bg-neutral-800"></div> 
            <div className="absolute -left-[14px] top-[150px] h-[60px] w-[4px] rounded-l-md bg-neutral-800"></div> 
            <div className="absolute -left-[14px] top-[225px] h-[60px] w-[4px] rounded-l-md bg-neutral-800"></div> 
            <div className="absolute -right-[14px] top-[170px] h-[90px] w-[4px] rounded-r-md bg-neutral-800"></div> 
          </>
        )}
      </div>

      <div className={`mt-4 flex gap-4 ${isMobilePreview ? 'absolute bottom-4 left-0 right-0 justify-center z-50 pointer-events-none' : ''}`}>
        <button 
          onClick={handleRefresh}
          className={`
            flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-lg transition-all active:scale-95 border
            ${isMobilePreview 
              ? 'bg-black/80 text-white border-transparent backdrop-blur-md pointer-events-auto' 
              : 'bg-white text-gray-600 border-gray-100 hover:bg-gray-50'
            }
          `}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> 
          {isMobilePreview ? 'Refresh' : 'Refresh Preview'}
        </button>
      </div>
      
      {!isValidUrl(config.websiteUrl) && config.websiteUrl.length > 0 && !isMobilePreview && (
          <p className="mt-2 text-sm text-red-500">Please enter a valid URL</p>
      )}

      {/* Note about iframe restrictions */}
      <div className={`mt-6 flex max-w-sm items-start gap-2 rounded-lg bg-gray-200/50 p-3 text-xs text-gray-500 ${isMobilePreview ? 'hidden' : 'flex'}`}>
        <AlertCircle size={14} className="mt-0.5 shrink-0" />
        <p>
          Some websites block previews (X-Frame-Options). They will still work in the built app.
        </p>
      </div>
    </div>
  );
};

// Helper to determine if text should be black or white based on background
function isLightColor(color: string) {
  // If undefined/null, default to light bg (return true)
  if (!color) return true;
  
  const hex = color.replace('#', '');
  // Basic validation
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
    new URL(string);
    return true;
  } catch (_) {
    return false;  
  }
}