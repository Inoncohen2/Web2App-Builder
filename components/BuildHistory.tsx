
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Download, Clock, FileCode, Smartphone, Package, CheckCircle2, MoreVertical, Trash2, Share2, Copy } from 'lucide-react';
import { Button } from './ui/Button';

interface BuildRecord {
  id: string;
  app_id: string;
  platform: 'android' | 'ios';
  build_format: 'apk' | 'aab' | 'ipa' | 'source' | 'ios_source';
  status: string;
  download_url: string | null;
  created_at: string;
}

interface BuildHistoryProps {
  builds: BuildRecord[];
  onDownload: (buildId: string) => void;
  onDelete: (buildId: string) => void;
}

// Icons for platforms
const AndroidLogo = () => (
    <svg viewBox="0 0 576 512" fill="currentColor" height="1.4em" width="1.4em">
      <path d="M420.55,301.93a24,24,0,1,1,24-24,24,24,0,0,1-24,24m-265.1,0a24,24,0,1,1,24-24,24,24,0,0,1-24,24m273.7-144.48,47.94-83a10,10,0,1,0-17.32-10l-48.66,84.23c-101.7-42.11-204.63-42.11-306.31,0l-48.66-84.23a10,10,0,1,0-17.32,10l47.94,83C64.53,202.22,8.24,285.55,0,384H576c-8.24-98.45-64.54-181.78-146.85-226.55" />
    </svg>
  );
  
const AppleLogo = () => (
    <svg viewBox="0 0 384 512" fill="currentColor" height="1.4em" width="1.4em">
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 52.3-11.4 69.5-34.3z" />
    </svg>
);

const FORMAT_CONFIG: Record<string, { label: string; bg: string; text: string; icon: any; border: string }> = {
  apk: { label: 'APK File', bg: 'bg-emerald-50', text: 'text-emerald-700', icon: AndroidLogo, border: 'border-emerald-200' },
  aab: { label: 'AAB Bundle', bg: 'bg-blue-50', text: 'text-blue-700', icon: AndroidLogo, border: 'border-blue-200' },
  source: { label: 'Source Code', bg: 'bg-purple-50', text: 'text-purple-700', icon: FileCode, border: 'border-purple-200' },
  ipa: { label: 'IPA File', bg: 'bg-gray-100', text: 'text-gray-700', icon: AppleLogo, border: 'border-gray-200' },
  ios_source: { label: 'iOS Source', bg: 'bg-gray-100', text: 'text-gray-700', icon: FileCode, border: 'border-gray-200' },
};

export const BuildHistory: React.FC<BuildHistoryProps> = ({ builds, onDownload, onDelete }) => {
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleShare = (url: string) => {
    navigator.clipboard.writeText(url);
    setActiveMenuId(null);
    alert("Download link copied to clipboard!");
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this build?")) {
        onDelete(id);
        setActiveMenuId(null);
    }
  };

  // 1. Filter only ready builds
  const readyBuilds = builds.filter(b => b.status === 'ready' && b.download_url);

  // 2. Group by format and take the latest one for each format
  const latestArtifacts = ['apk', 'aab', 'ipa', 'source', 'ios_source'].map(format => {
    return readyBuilds.find(b => b.build_format === format);
  }).filter(Boolean) as BuildRecord[];

  if (latestArtifacts.length === 0) return null;

  return (
    <div className="w-full mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <CheckCircle2 className="text-emerald-500" size={20} />
        Ready for Download
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {latestArtifacts.map((build) => {
          const config = FORMAT_CONFIG[build.build_format] || { label: build.build_format.toUpperCase(), bg: 'bg-gray-50', text: 'text-gray-700', icon: Package, border: 'border-gray-200' };
          const Icon = config.icon;
          const dateObj = new Date(build.created_at);
          const date = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          const time = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

          return (
            <div key={build.id} className={`bg-white rounded-xl border ${config.border} p-4 shadow-sm hover:shadow-md transition-all relative group`}>
              <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className={`h-10 w-10 shrink-0 rounded-lg flex items-center justify-center border border-black/5 ${config.bg} ${config.text}`}>
                        <Icon />
                     </div>
                     <div className="min-w-0">
                        <h4 className="font-bold text-gray-900 text-sm truncate">{config.label}</h4>
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-medium mt-0.5">
                           <Clock size={10} />
                           <span>{date}, {time}</span>
                        </div>
                     </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                      <Button 
                        onClick={() => onDownload(build.id)} 
                        size="sm"
                        className="h-8 px-3 bg-white text-emerald-600 border border-emerald-600 hover:bg-emerald-50 shrink-0 font-medium transition-colors"
                      >
                        <Download size={14} className="mr-1.5" /> Get
                      </Button>
                      
                      <div className="relative">
                          <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(activeMenuId === build.id ? null : build.id);
                            }}
                            className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                              <MoreVertical size={16} />
                          </button>

                          {activeMenuId === build.id && (
                              <div ref={menuRef} className="absolute right-0 top-9 w-32 bg-white rounded-lg shadow-lg border border-gray-100 z-10 overflow-hidden animate-in fade-in zoom-in-95 origin-top-right">
                                  <button 
                                    onClick={() => build.download_url && handleShare(build.download_url)}
                                    className="w-full text-left px-3 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50 flex items-center gap-2"
                                  >
                                      <Copy size={12} /> Copy Link
                                  </button>
                                  <button 
                                    onClick={() => handleDelete(build.id)}
                                    className="w-full text-left px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-100"
                                  >
                                      <Trash2 size={12} /> Delete
                                  </button>
                              </div>
                          )}
                      </div>
                  </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
