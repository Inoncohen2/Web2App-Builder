
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
  queued:   { label: 'Queued',    color: 'text-amber-600',  bg: 'bg-amber-50',  icon: Clock },
  building: { label: 'Building',  color: 'text-blue-600',   bg: 'bg-blue-50',   icon: RefreshCw },
  ready:    { label: 'Ready',     color: 'text-emerald-600',bg: 'bg-emerald-50',icon: CheckCircle },
  failed:   { label: 'Failed',    color: 'text-red-600',    bg: 'bg-red-50',    icon: XCircle },
  cancelled:{ label: 'Cancelled', color: 'text-gray-500',   bg: 'bg-gray-50',   icon: XCircle },
};

const FORMAT_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  apk:        { label: 'APK',    icon: Smartphone, color: 'text-green-600' },
  aab:        { label: 'AAB',    icon: Package,    color: 'text-blue-600' },
  source:     { label: 'Source', icon: Code,       color: 'text-purple-600' },
  ios_source: { label: 'iOS Src',icon: Code,       color: 'text-gray-600' },
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
  const [statusFilter, setStatusFilter] = useState<'all' | 'ready' | 'failed' | 'building'>('all');

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
      .neq('status', 'cancelled') // Filter out cancelled at DB level query if possible, or filter locally
      .order('created_at', { ascending: false })
      .limit(50);
    
    // Explicitly filter out cancelled just in case the query included them
    if (data) setBuilds(data.filter(b => b.status !== 'cancelled'));
    setLoading(false);
  };

  // Stats
  const total = builds.length;
  const successful = builds.filter(b => b.status === 'ready').length;
  const failed = builds.filter(b => b.status === 'failed').length;
  const active = builds.filter(b => ['queued','building'].includes(b.status)).length;
  const successRate = total > 0 ? Math.round((successful / total) * 100) : 0;

  // Avg build time (successful builds only)
  const completedBuilds = builds.filter(b => b.status === 'ready');
  const avgMs = completedBuilds.length > 0
    ? completedBuilds.reduce((acc, b) => acc + (new Date(b.updated_at).getTime() - new Date(b.created_at).getTime()), 0) / completedBuilds.length
    : 0;
  const avgMin = Math.floor(avgMs / 60000);
  const avgSec = Math.floor((avgMs % 60000) / 1000);

  // Filtered builds
  const filtered = builds.filter(b => {
    // Double check to hide cancelled even if they slip through
    if (b.status === 'cancelled') return false;
    
    if (filter === 'android' && b.platform !== 'android') return false;
    if (filter === 'ios' && b.platform !== 'ios') return false;
    if (statusFilter === 'ready' && b.status !== 'ready') return false;
    if (statusFilter === 'failed' && b.status !== 'failed') return false;
    if (statusFilter === 'building' && !['queued','building'].includes(b.status)) return false;
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total Builds', value: total, icon: BarChart2, color: 'bg-blue-500', sub: 'Active & Completed' },
          { label: 'Successful', value: successful, icon: CheckCircle, color: 'bg-emerald-500', sub: `${successRate}% success rate` },
          { label: 'Failed', value: failed, icon: XCircle, color: 'bg-red-500', sub: failed > 0 ? 'Check logs' : 'All good!' },
          { label: 'Avg Build Time', value: avgMin > 0 ? `${avgMin}m ${avgSec}s` : avgSec > 0 ? `${avgSec}s` : '—', icon: Clock, color: 'bg-purple-500', sub: 'Successful builds' },
        ].map(({ label, value, icon: Icon, color, sub }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-medium text-gray-500">{label}</p>
              <div className={`h-7 w-7 rounded-lg ${color} flex items-center justify-center`}>
                <Icon size={13} className="text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Active builds alert */}
      {active > 0 && (
        <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <RefreshCw size={16} className="text-blue-600 animate-spin" />
          <div>
            <p className="text-sm font-bold text-blue-800">{active} build{active > 1 ? 's' : ''} in progress</p>
            <p className="text-xs text-blue-600">Updates in real-time</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
          {['all','android','ios'].map(f => (
            <button key={f} onClick={() => setFilter(f as any)}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all capitalize ${filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {f === 'all' ? 'All Platforms' : f === 'android' ? '🤖 Android' : '🍎 iOS'}
            </button>
          ))}
        </div>
        <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
          {['all','building','ready','failed'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s as any)}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all capitalize ${statusFilter === s ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {s === 'all' ? 'All Status' : s}
            </button>
          ))}
        </div>
        <button onClick={fetchBuilds} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 border border-gray-200 rounded-lg bg-white">
          <RefreshCw size={11} /> Refresh
        </button>
      </div>

      {/* Build List */}
      {loading ? (
        <div className="text-center py-10 text-gray-400">
          <RefreshCw size={20} className="animate-spin mx-auto mb-2" />
          <p className="text-sm">Loading builds...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <Package size={32} className="text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-500">No builds found</p>
          <p className="text-xs text-gray-400">Start your first build from the Builder</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(build => {
            const status = STATUS_CONFIG[build.status] || STATUS_CONFIG.queued;
            const format = FORMAT_CONFIG[build.build_format] || FORMAT_CONFIG.apk;
            const StatusIcon = status.icon;
            const FormatIcon = format.icon;
            const isActive = ['queued','building'].includes(build.status);

            return (
              <div key={build.id} className={`bg-white rounded-xl border ${isActive ? 'border-blue-200 shadow-md shadow-blue-50' : 'border-gray-100'} p-4 transition-all`}>
                <div className="flex items-start justify-between gap-3">
                  {/* Left */}
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`h-9 w-9 rounded-xl ${status.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <StatusIcon size={16} className={`${status.color} ${isActive ? 'animate-spin' : ''}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}>{status.label}</span>
                        <div className={`flex items-center gap-1 text-xs font-medium ${format.color}`}>
                          <FormatIcon size={11} />
                          <span>{build.platform === 'ios' ? '🍎' : '🤖'} {format.label}</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 truncate">
                        {build.build_message || (isActive ? `Building ${build.progress}%...` : `Build ${build.id.slice(0,8)}`)}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-1">
                        {timeAgo(build.created_at)} · {buildDuration(build.created_at, build.updated_at)}
                      </p>
                    </div>
                  </div>

                  {/* Right */}
                  <div className="flex-shrink-0 flex items-center gap-2">
                    {build.status === 'ready' && build.download_url && (
                      <a href={build.download_url} target="_blank" rel="noopener"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white text-xs font-bold rounded-lg hover:bg-black transition-colors">
                        <Download size={12} /> Download
                      </a>
                    )}
                  </div>
                </div>

                {/* Progress bar for active builds */}
                {isActive && (
                  <div className="mt-3">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-blue-600 font-medium">
                        {build.status === 'queued' ? 'Waiting in queue...' : `Building ${build.progress}%`}
                      </span>
                      <span className="text-xs text-gray-400">{build.progress}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full transition-all duration-1000 relative"
                        style={{ width: `${build.progress}%` }}>
                        <div className="absolute inset-0 bg-white/30 animate-pulse" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
