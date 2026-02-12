
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../supabaseClient';
import { 
  X, Search, Clock, ArrowRight, LoaderCircle, Pencil, Smartphone, 
  MoreVertical, Trash2, LayoutDashboard, Check, CheckSquare
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose }) => {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true); // Default to true for skeletons
  const [searchTerm, setSearchTerm] = useState('');
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
      setIsSelectionMode(false);
      setSelectedIds(new Set());
      setOpenMenuId(null);
    }
  }, [isOpen]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('apps')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (data) setApps(data);
      }
    } catch (error) {
      console.error('Error fetching history', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (appId: string, type: 'builder' | 'dashboard') => {
    onClose();
    if (type === 'builder') {
       router.push(`/builder?id=${appId}`);
    } else {
       router.push(`/dashboard/${appId}`);
    }
  };

  const handleDeleteSingle = async (appId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    setIsDeleting(true);
    await supabase.from('apps').delete().eq('id', appId);
    setApps(prev => prev.filter(app => app.id !== appId));
    setIsDeleting(false);
    setOpenMenuId(null);
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedIds.size} projects? This cannot be undone.`)) return;
    setIsDeleting(true);
    const ids = Array.from(selectedIds);
    await supabase.from('apps').delete().in('id', ids);
    setApps(prev => prev.filter(app => !selectedIds.has(app.id)));
    setSelectedIds(new Set());
    setIsSelectionMode(false);
    setIsDeleting(false);
  };

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredApps.length) {
      setSelectedIds(new Set());
    } else {
      const newSet = new Set(filteredApps.map(app => app.id));
      setSelectedIds(newSet);
    }
  };

  const filteredApps = apps.filter(app => 
    app.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    app.website_url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] grid place-items-center p-4 overflow-hidden">
      {/* Blurred Backdrop */}
      <div 
        className="fixed inset-0 bg-[#0B0F17]/90 backdrop-blur-md transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Card */}
      <div className="relative w-full max-w-lg h-full max-h-[85vh] flex flex-col rounded-3xl border border-white/10 bg-[#0B0F17] shadow-2xl animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10 bg-white/5 flex items-center justify-between shrink-0 z-20">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
               <Clock className="text-emerald-400" size={22} /> Projects
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {loading ? (
                 <span className="inline-block h-3 w-20 bg-zinc-800 rounded animate-pulse"></span>
              ) : (
                 `${apps.length} application${apps.length !== 1 ? 's' : ''} created`
              )}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
             {!loading && apps.length > 0 && (
               <button 
                  onClick={() => setIsSelectionMode(!isSelectionMode)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${isSelectionMode ? 'bg-emerald-600 text-white' : 'bg-white/5 text-slate-400 hover:text-white'}`}
               >
                  {isSelectionMode ? 'Cancel' : 'Select'}
               </button>
             )}
             <button 
               onClick={onClose}
               className="rounded-full p-2 text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
             >
               <X size={20} />
             </button>
          </div>
        </div>

        {/* Search & Actions Bar */}
        <div className="px-4 py-3 border-b border-white/5 bg-[#0B0F17] z-10 sticky top-0">
           <div className="flex items-center gap-3">
              {isSelectionMode && (
                <button onClick={toggleSelectAll} className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
                  {selectedIds.size === filteredApps.length && filteredApps.length > 0 ? (
                    <div className="h-5 w-5 bg-emerald-500 rounded flex items-center justify-center text-[#0B0F17] shadow-md">
                        <Check size={14} strokeWidth={3} />
                    </div>
                  ) : (
                    <div className="h-5 w-5 border-2 border-slate-600 rounded bg-white/5"></div>
                  )}
                  <span className="text-xs font-medium">All</span>
                </button>
              )}
              
              <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    disabled={loading}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-600 disabled:opacity-50"
                  />
              </div>
           </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
           {loading ? (
              // SKELETON LIST
              [1, 2, 3, 4, 5].map(i => (
                 <div key={i} className="flex items-center gap-3 p-3 rounded-2xl border border-white/5 bg-white/5 animate-pulse">
                    <div className="h-14 w-14 rounded-xl bg-zinc-800"></div>
                    <div className="flex-1 space-y-2">
                       <div className="h-4 w-32 bg-zinc-800 rounded"></div>
                       <div className="h-3 w-24 bg-zinc-800/50 rounded"></div>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-zinc-800/50"></div>
                 </div>
              ))
           ) : filteredApps.length === 0 ? (
              <div className="text-center py-16 text-slate-500 flex flex-col items-center">
                 <div className="h-16 w-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                    <Smartphone size={32} className="opacity-40" />
                 </div>
                 <p className="text-sm">No projects found.</p>
                 <button onClick={onClose} className="mt-4 text-emerald-400 hover:text-emerald-300 text-sm font-medium">Create new app</button>
              </div>
           ) : (
              filteredApps.map((app) => (
                 <div 
                   key={app.id} 
                   className={`
                      group relative flex items-center gap-3 p-3 rounded-2xl border transition-all duration-200 cursor-pointer
                      ${isSelectionMode && selectedIds.has(app.id) ? 'bg-emerald-900/10 border-emerald-500/30' : 'bg-white/5 border-white/5 hover:bg-white/[0.08] hover:border-white/10'}
                   `}
                   onClick={() => {
                     if (isSelectionMode) toggleSelection(app.id);
                     else handleNavigate(app.id, 'dashboard');
                   }}
                 >
                    {/* Selection Checkbox (Updated for visibility) */}
                    {isSelectionMode && (
                       <div className={`shrink-0 mr-1 transition-all duration-200 ${selectedIds.has(app.id) ? 'scale-100 opacity-100' : 'scale-100 opacity-50 hover:opacity-100'}`}>
                          {selectedIds.has(app.id) ? (
                             <div className="h-6 w-6 bg-emerald-500 rounded-md flex items-center justify-center text-[#0B0F17] shadow-[0_0_10px_rgba(16,185,129,0.4)]">
                                <Check size={16} strokeWidth={3} />
                             </div>
                          ) : (
                             <div className="h-6 w-6 border-2 border-slate-600 rounded-md bg-white/5 hover:border-slate-400 transition-colors"></div>
                          )}
                       </div>
                    )}

                    {/* App Icon */}
                    <div className="h-14 w-14 rounded-xl bg-slate-700 flex-shrink-0 overflow-hidden shadow-sm border border-white/5">
                        {app.config?.appIcon ? (
                            <img src={app.config.appIcon} alt="" className="h-full w-full object-cover" />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center text-slate-300 font-bold text-xl">
                              {app.name[0]?.toUpperCase()}
                            </div>
                        )}
                    </div>

                    {/* App Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                           <h3 className="text-white font-bold text-sm truncate pr-2">{app.name}</h3>
                           {/* Status Dot */}
                           <div className={`h-2 w-2 rounded-full shrink-0 ${app.status === 'ready' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : app.status === 'building' ? 'bg-amber-500 animate-pulse' : 'bg-slate-600'}`}></div>
                        </div>
                        <p className="text-xs text-slate-500 truncate mb-1.5">{app.website_url}</p>
                        
                        <div className="flex items-center gap-2">
                           <span className="text-[10px] bg-white/5 text-slate-400 px-2 py-0.5 rounded-md border border-white/5 uppercase tracking-wide">
                              {app.status || 'Draft'}
                           </span>
                        </div>
                    </div>

                    {/* 3-Dots Menu Button (Hidden in selection mode) */}
                    {!isSelectionMode && (
                       <button 
                         onClick={(e) => {
                           e.stopPropagation();
                           setOpenMenuId(openMenuId === app.id ? null : app.id);
                         }}
                         className="p-2 -mr-1 text-slate-500 hover:text-white hover:bg-white/10 rounded-full transition-colors z-10"
                       >
                          <MoreVertical size={20} />
                       </button>
                    )}

                    {/* Dropdown Menu */}
                    {openMenuId === app.id && !isSelectionMode && (
                       <div 
                          ref={menuRef}
                          className="absolute right-10 top-8 w-48 bg-[#1A1F2E] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 origin-top-right"
                          onClick={(e) => e.stopPropagation()}
                       >
                          <div className="py-1">
                             <button 
                               onClick={() => handleNavigate(app.id, 'dashboard')}
                               className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white flex items-center gap-3"
                             >
                                <LayoutDashboard size={16} className="text-emerald-400" /> Dashboard
                             </button>
                             <button 
                               onClick={() => handleNavigate(app.id, 'builder')}
                               className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white flex items-center gap-3"
                             >
                                <Pencil size={16} className="text-emerald-400" /> Edit Design
                             </button>
                             <div className="h-px bg-white/5 my-1"></div>
                             <button 
                               onClick={() => handleDeleteSingle(app.id)}
                               className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-3"
                             >
                                <Trash2 size={16} /> Delete Project
                             </button>
                          </div>
                       </div>
                    )}
                 </div>
              ))
           )}
        </div>

        {/* Footer Action Bar (Bulk Delete) */}
        {isSelectionMode && selectedIds.size > 0 && (
           <div className="p-4 border-t border-white/10 bg-white/5 flex items-center justify-between animate-in slide-in-from-bottom-2">
              <span className="text-sm font-medium text-white">{selectedIds.size} selected</span>
              <button 
                onClick={handleBulkDelete}
                disabled={isDeleting}
                className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all active:scale-95"
              >
                 {isDeleting ? <LoaderCircle size={16} className="animate-spin" /> : <Trash2 size={16} />}
                 Delete ({selectedIds.size})
              </button>
           </div>
        )}
      </div>
    </div>,
    document.body
  );
};
