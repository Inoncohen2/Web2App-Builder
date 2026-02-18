
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { 
  BarChart2, Download, Clock, CheckCircle, XCircle,
  Smartphone, Package, Code, RefreshCw,
  Filter, MoreVertical, Trash2, AlertTriangle
} from 'lucide-react';

interface BuildRecord {
  id: string;
  app_id: string;
  platform: string;
  build_format: string;
  status: string;
  progress: number;
  download_url: string;
  build_message: string;
  created_at: string;
  updated_at: string;
}

interface AppSummary {
  name: string;
  id: string;
  icon_url: string;
}

// --- ICONS ---
const AndroidLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 576 512" fill="currentColor" className={className} height="1em" width="1em">
    <path d="M420.55,301.93a24,24,0,1,1,24-24,24,24,0,0,1-24,24m-265.1,0a24,24,0,1,1,24-24,24,24,0,0,1-24,24m273.7-144.48,47.94-83a10,10,0,1,0-17.32-10l-48.66,84.23c-101.7-42.11-204.63-42.11-306.31,0l-48.66-84.23a10,10,0,1,0-17.32,10l47.94,83C64.53,202.22,8.24,285.55,0,384H576c-8.24-98.45-64.54-181.78-146.85-226.55" />
  </svg>
);

const AppleLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 384 512" fill="currentColor" className={className} height="1em" width="1em">
    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 52.3-11.4 69.5-34.3z" />
  </svg>
);

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  queued:   { label: 'Queued',    color: 'text-amber-400',  bg: 'bg-amber-500/10',  icon: Clock },
  building: { label: 'Building',  color: 'text-blue-400',   bg: 'bg-blue-500/10',   icon: RefreshCw },
  ready:    { label: 'Ready',     color: 'text-emerald-400',bg: 'bg-emerald-500/10',icon: CheckCircle },
  failed:   { label: 'Failed',    color: 'text-red-400',    bg: 'bg-red-500/10',    icon: XCircle },
  cancelled:{ label: 'Cancelled', color: 'text-slate-400',  bg: 'bg-slate-500/10',  icon: XCircle },
};

const FORMAT_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  apk:        { label: 'APK',    icon: AndroidLogo, color: 'text-emerald-400' },
  aab:        { label: 'AAB',    icon: AndroidLogo, color: 'text-blue-400' },
  source:     { label: 'Source', icon: Code,       color: 'text-purple-400' },
  ios_source: { label: 'iOS Src',icon: Code,       color: 'text-slate-400' },
  ipa:        { label: 'IPA',    icon: AppleLogo,  color: 'text-gray-300' },
};

function timeAgo(date: string) {
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function buildDuration(created: string, updated: string) {
  const ms = new Date(updated).getTime() - new Date(created).getTime();
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const rem = s % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${rem}s`;
}

export default function BuildsDashboard({ appId, app }: { appId: string; app?: AppSummary }) {
  const [builds, setBuilds] = useState<BuildRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'android' | 'ios'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ready' | 'failed'>('all');
  
  // Menu State
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchBuilds();

    // Realtime subscription
    const channel = supabase.channel(`builds-dash-${appId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_builds', filter: `app_id=eq.${appId}` },
        () => fetchBuilds()
      ).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [appId]);

  // Click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchBuilds = async () => {
    const { data } = await supabase
      .from('app_builds')
      .select('*')
      .eq('app_id', appId)
      .neq('status', 'cancelled') // Filter out cancelled at DB level query
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (data) setBuilds(data);
    setLoading(false);
  };

  const handleDelete = async (buildId: string) => {
    if (!confirm('Are you sure you want to delete this build record?')) return;

    const { error } = await supabase
      .from('app_builds')
      .delete()
      .eq('id', buildId);

    if (!error) {
      setBuilds(prev => prev.filter(b => b.id !== buildId));
      setOpenMenuId(null);
    } else {
      alert('Failed to delete build');
    }
  };

  // Stats
  const total = builds.length;
  const successful = builds.filter(b => b.status === 'ready').length;
  const failed = builds.filter(b => b.status === 'failed').length;
  const successRate = total > 0 ? Math.round((successful / total) * 100) : 0;

  // Avg build time (successful builds only)
  const completedBuilds = builds.filter(b => b.status === 'ready');
  const avgMs = completedBuilds.length > 0
    ? completedBuilds.reduce((acc, b) => acc + (new Date(b.updated_at).getTime() - new Date(b.created_at).getTime()), 0) / completedBuilds.length
    : 0;
  const avgMin = Math.floor(avgMs / 60000);
  const avgSec = Math.floor((avgMs % 60000) / 1000);

  // Filtered builds - EXCLUDE active (queued/building) and cancelled
  const filtered = builds.filter(b => {
    // Strictly exclude active builds from list
    if (['queued', 'building', 'cancelled'].includes(b.status)) return false;
    
    if (filter === 'android' && b.platform !== 'android') return false;
    if (filter === 'ios' && b.platform !== 'ios') return false;
    if (statusFilter === 'ready' && b.status !== 'ready') return false;
    if (statusFilter === 'failed' && b.status !== 'failed') return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 shrink-0">
        {[
          { label: 'History', value: total, icon: BarChart2, color: 'bg-blue-500', sub: 'Completed builds' },
          { label: 'Success Rate', value: `${successRate}%`, icon: CheckCircle, color: 'bg-emerald-500', sub: `${successful} passed` },
          { label: 'Failures', value: failed, icon: XCircle, color: 'bg-red-500', sub: failed > 0 ? 'Check logs' : 'Clean record' },
          { label: 'Avg Duration', value: avgMin > 0 ? `${avgMin}m ${avgSec}s` : avgSec > 0 ? `${avgSec}s` : '—', icon: Clock, color: 'bg-purple-500', sub: 'Optimization metric' },
        ].map(({ label, value, icon: Icon, color, sub }) => (
          <div key={label} className="bg-white/5 rounded-xl border border-white/10 p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-slate-400">{label}</p>
              <div className={`h-6 w-6 sm:h-7 sm:w-7 rounded-lg ${color} flex items-center justify-center text-white`}>
                <Icon size={12} />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white">{value}</p>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Filters & Controls */}
      <div className="flex flex-col gap-3 shrink-0">
        <div className="flex flex-col sm:flex-row items-center gap-3">
            
            {/* Row 1: Platform Selectors - Grid on Mobile for Equal Width */}
            <div className="grid grid-cols-3 sm:flex bg-white/5 border border-white/5 rounded-lg p-1 gap-1 w-full sm:w-auto">
              <button onClick={() => setFilter('all')}
                className={`flex items-center justify-center px-3 py-1.5 text-xs font-bold rounded-md transition-all whitespace-nowrap ${filter === 'all' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                All
              </button>
              <button onClick={() => setFilter('android')}
                className={`flex items-center justify-center py-1.5 sm:w-9 sm:h-7 rounded-md transition-all ${filter === 'android' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                title="Android">
                <AndroidLogo />
              </button>
              <button onClick={() => setFilter('ios')}
                className={`flex items-center justify-center py-1.5 sm:w-9 sm:h-7 rounded-md transition-all ${filter === 'ios' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                title="iOS">
                <AppleLogo />
              </button>
            </div>

            {/* Row 2: Status Selectors + Refresh */}
            <div className="flex gap-3 w-full sm:w-auto">
                <div className="flex bg-white/5 border border-white/5 rounded-lg p-1 gap-1 flex-1 sm:flex-none">
                  {[
                    { id: 'all', label: 'All Status' }, 
                    { id: 'ready', label: 'Ready' }, 
                    { id: 'failed', label: 'Failed' }
                  ].map(s => (
                    <button key={s.id} onClick={() => setStatusFilter(s.id as any)}
                      className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-bold rounded-md transition-all capitalize ${statusFilter === s.id ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                      {s.label}
                    </button>
                  ))}
                </div>

                <button 
                    onClick={fetchBuilds} 
                    className="h-9 w-9 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-colors active:rotate-180 duration-500"
                    title="Refresh"
                >
                  <RefreshCw size={18} />
                </button>
            </div>
        </div>
      </div>

      {/* Build List - Natural Scroll (Not internal) */}
      <div className="space-y-2 pb-8">
        {loading ? (
          <div className="space-y-3">
             {[1,2,3,4].map(i => (
               <div key={i} className="bg-white/5 rounded-xl border border-white/5 p-4 animate-pulse">
                  <div className="flex items-start justify-between gap-3">
                     <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-white/10"></div>
                        <div className="space-y-2">
                           <div className="h-4 w-24 bg-white/10 rounded"></div>
                           <div className="h-3 w-32 bg-white/5 rounded"></div>
                        </div>
                     </div>
                     <div className="h-8 w-20 bg-white/10 rounded-lg"></div>
                  </div>
               </div>
             ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-xl border border-dashed border-white/10 mt-2">
            <div className="h-12 w-12 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-3">
               <Package size={24} className="text-slate-500" />
            </div>
            <p className="text-sm font-medium text-slate-300">No completed builds found</p>
            <p className="text-xs text-slate-500">Start a build from the release manager.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(build => {
              const status = STATUS_CONFIG[build.status] || STATUS_CONFIG.queued;
              const format = FORMAT_CONFIG[build.build_format] || FORMAT_CONFIG.apk;
              
              // REQ 2: Use Format/Platform Icon, but Status Color
              const DisplayIcon = format.icon;

              return (
                <div key={build.id} className="bg-white/5 rounded-xl border border-white/5 p-4 transition-all hover:bg-white/[0.07] group relative">
                  <div className="flex items-start justify-between gap-3">
                    {/* Left */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {/* Icon with Status Color */}
                      <div className={`h-10 w-10 rounded-xl ${status.bg} flex items-center justify-center flex-shrink-0 border border-white/5`}>
                        <DisplayIcon className={status.color} /> 
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/5 uppercase tracking-wider ${status.bg} ${status.color}`}>{status.label}</span>
                          <div className={`flex items-center gap-1 text-xs font-medium text-slate-400`}>
                            <span>{build.platform === 'ios' ? 'iOS' : 'Android'} {format.label}</span>
                          </div>
                        </div>
                        
                        {/* REQ 1: Removed ID Display */}
                        
                        <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                          <span>{timeAgo(build.created_at)}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                          <span>Duration: {buildDuration(build.created_at, build.updated_at)}</span>
                        </p>
                      </div>
                    </div>

                    {/* Right (Menu) */}
                    <div className="flex-shrink-0 relative">
                        <button 
                          onClick={(e) => {
                             e.stopPropagation();
                             setOpenMenuId(openMenuId === build.id ? null : build.id);
                          }}
                          className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                        >
                           <MoreVertical size={16} />
                        </button>

                        {/* Dropdown Menu */}
                        {openMenuId === build.id && (
                           <div 
                             ref={menuRef}
                             className="absolute right-0 top-9 w-36 bg-[#1A1F2E] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 origin-top-right"
                           >
                              <div className="py-1">
                                {build.status === 'ready' && build.download_url && (
                                  <a 
                                    href={build.download_url} 
                                    target="_blank" 
                                    rel="noopener"
                                    className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-xs font-medium text-emerald-400 hover:bg-white/5 hover:text-emerald-300"
                                  >
                                     <Download size={14} /> Download
                                  </a>
                                )}
                                <button 
                                  onClick={() => handleDelete(build.id)}
                                  className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-xs font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300"
                                >
                                   <Trash2 size={14} /> Delete
                                </button>
                              </div>
                           </div>
                        )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
