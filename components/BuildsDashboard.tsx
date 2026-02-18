
'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { 
  BarChart2, Download, TrendingUp, Clock, CheckCircle, XCircle,
  Smartphone, Package, Code, Bell, Zap, ArrowUpRight, RefreshCw,
  Calendar, Filter, ChevronRight
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

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  queued:   { label: 'Queued',    color: 'text-amber-400',  bg: 'bg-amber-500/10',  icon: Clock },
  building: { label: 'Building',  color: 'text-blue-400',   bg: 'bg-blue-500/10',   icon: RefreshCw },
  ready:    { label: 'Ready',     color: 'text-emerald-400',bg: 'bg-emerald-500/10',icon: CheckCircle },
  failed:   { label: 'Failed',    color: 'text-red-400',    bg: 'bg-red-500/10',    icon: XCircle },
  cancelled:{ label: 'Cancelled', color: 'text-slate-400',  bg: 'bg-slate-500/10',  icon: XCircle },
};

const FORMAT_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  apk:        { label: 'APK',    icon: Smartphone, color: 'text-emerald-400' },
  aab:        { label: 'AAB',    icon: Package,    color: 'text-blue-400' },
  source:     { label: 'Source', icon: Code,       color: 'text-purple-400' },
  ios_source: { label: 'iOS Src',icon: Code,       color: 'text-slate-400' },
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

  useEffect(() => {
    fetchBuilds();

    // Realtime subscription
    const channel = supabase.channel(`builds-dash-${appId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_builds', filter: `app_id=eq.${appId}` },
        () => fetchBuilds()
      ).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [appId]);

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
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'History', value: total, icon: BarChart2, color: 'bg-blue-500', sub: 'Completed builds' },
          { label: 'Success Rate', value: `${successRate}%`, icon: CheckCircle, color: 'bg-emerald-500', sub: `${successful} passed` },
          { label: 'Failures', value: failed, icon: XCircle, color: 'bg-red-500', sub: failed > 0 ? 'Check logs' : 'Clean record' },
          { label: 'Avg Duration', value: avgMin > 0 ? `${avgMin}m ${avgSec}s` : avgSec > 0 ? `${avgSec}s` : '—', icon: Clock, color: 'bg-purple-500', sub: 'Optimization metric' },
        ].map(({ label, value, icon: Icon, color, sub }) => (
          <div key={label} className="bg-white/5 rounded-xl border border-white/10 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-slate-400">{label}</p>
              <div className={`h-7 w-7 rounded-lg ${color} flex items-center justify-center text-white`}>
                <Icon size={13} />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex bg-white/5 border border-white/5 rounded-lg p-1 gap-1">
          {['all','android','ios'].map(f => (
            <button key={f} onClick={() => setFilter(f as any)}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all capitalize ${filter === f ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
              {f === 'all' ? 'All Platforms' : f === 'android' ? 'Android' : 'iOS'}
            </button>
          ))}
        </div>
        <div className="flex bg-white/5 border border-white/5 rounded-lg p-1 gap-1">
          {['all','ready','failed'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s as any)}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all capitalize ${statusFilter === s ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
              {s === 'all' ? 'All Status' : s}
            </button>
          ))}
        </div>
        <button onClick={fetchBuilds} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white border border-white/10 rounded-lg bg-white/5 hover:bg-white/10 transition-colors ml-auto">
          <RefreshCw size={11} /> Refresh
        </button>
      </div>

      {/* Build List */}
      {loading ? (
        <div className="text-center py-10 text-slate-500">
          <RefreshCw size={20} className="animate-spin mx-auto mb-2 opacity-50" />
          <p className="text-sm">Loading history...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white/5 rounded-xl border border-dashed border-white/10">
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
            const StatusIcon = status.icon;
            const FormatIcon = format.icon;

            return (
              <div key={build.id} className="bg-white/5 rounded-xl border border-white/5 p-4 transition-all hover:bg-white/[0.07] group">
                <div className="flex items-start justify-between gap-3">
                  {/* Left */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`h-10 w-10 rounded-xl ${status.bg} flex items-center justify-center flex-shrink-0 mt-0.5 border border-white/5`}>
                      <StatusIcon size={18} className={status.color} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/5 uppercase tracking-wider ${status.bg} ${status.color}`}>{status.label}</span>
                        <div className={`flex items-center gap-1 text-xs font-medium ${format.color}`}>
                          <FormatIcon size={12} />
                          <span>{build.platform === 'ios' ? 'iOS' : 'Android'} {format.label}</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 truncate font-mono">
                        ID: {build.id}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                        <span>{timeAgo(build.created_at)}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                        <span>Duration: {buildDuration(build.created_at, build.updated_at)}</span>
                      </p>
                    </div>
                  </div>

                  {/* Right */}
                  <div className="flex-shrink-0 flex items-center gap-2">
                    {build.status === 'ready' && build.download_url && (
                      <a href={build.download_url} target="_blank" rel="noopener"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold rounded-lg hover:bg-emerald-600 hover:text-white transition-all">
                        <Download size={12} /> <span className="hidden sm:inline">Artifact</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
