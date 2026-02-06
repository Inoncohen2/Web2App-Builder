
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { X, Search, Clock, ArrowRight, Loader2, Edit3, Smartphone, MoreHorizontal } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose }) => {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (isOpen) fetchHistory();
  }, [isOpen]);

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

  const handleOpenApp = (appId: string, type: 'builder' | 'dashboard') => {
    onClose();
    if (type === 'builder') {
       router.push(`/builder?id=${appId}`);
    } else {
       router.push(`/dashboard/${appId}`);
    }
  };

  const filteredApps = apps.filter(app => 
    app.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    app.website_url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center p-4 overflow-y-auto">
      {/* Blurred Backdrop */}
      <div 
        className="fixed inset-0 bg-[#0B0F17]/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-[#0B0F17] shadow-2xl animate-in fade-in zoom-in duration-200 flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 bg-white/5 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
               <Clock className="text-emerald-400" size={24} /> Project History
            </h2>
            <p className="text-sm text-slate-400 mt-1">Manage your created applications</p>
          </div>
          <button 
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-white/5">
           <div className="relative">
              <Search className="absolute left-3 top-3 text-slate-500" size={18} />
              <input 
                type="text" 
                placeholder="Search projects..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#0B0F17] border border-white/10 rounded-xl py-2.5 pl-10 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
              />
           </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
           {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-500" size={32} /></div>
           ) : filteredApps.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                 <Smartphone size={48} className="mx-auto mb-4 opacity-20" />
                 <p>No projects found.</p>
                 <button onClick={onClose} className="mt-4 text-indigo-400 hover:text-indigo-300 text-sm">Create new app</button>
              </div>
           ) : (
              filteredApps.map((app) => (
                 <div key={app.id} className="group flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-indigo-500/30 hover:bg-white/[0.07] transition-all">
                    <div className="flex items-center gap-4 overflow-hidden">
                       <div className="h-12 w-12 rounded-lg bg-white/10 flex-shrink-0 overflow-hidden">
                          {app.config?.appIcon ? (
                             <img src={app.config.appIcon} alt="" className="h-full w-full object-cover" />
                          ) : (
                             <div className="h-full w-full flex items-center justify-center text-slate-500 font-bold text-lg">
                                {app.name[0]}
                             </div>
                          )}
                       </div>
                       <div className="min-w-0">
                          <h3 className="text-white font-bold truncate">{app.name}</h3>
                          <p className="text-xs text-slate-500 truncate">{app.website_url}</p>
                          <div className="flex items-center gap-2 mt-1">
                             <span className={`inline-block h-2 w-2 rounded-full ${app.status === 'ready' ? 'bg-green-500' : app.status === 'building' ? 'bg-yellow-500 animate-pulse' : 'bg-slate-600'}`}></span>
                             <span className="text-[10px] text-slate-400 uppercase tracking-wide">{app.status || 'Draft'}</span>
                          </div>
                       </div>
                    </div>
                    
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                       <button 
                         onClick={() => handleOpenApp(app.id, 'builder')}
                         className="p-2 rounded-lg bg-white/5 hover:bg-indigo-600 hover:text-white text-slate-400 transition-colors"
                         title="Edit Design"
                       >
                          <Edit3 size={16} />
                       </button>
                       <button 
                         onClick={() => handleOpenApp(app.id, 'dashboard')}
                         className="px-4 py-2 rounded-lg bg-white text-black font-bold text-xs flex items-center gap-2 hover:bg-slate-200 transition-colors"
                       >
                          Open <ArrowRight size={14} />
                       </button>
                    </div>
                    {/* Mobile fallback for visibility */}
                    <div className="sm:hidden flex items-center gap-2">
                       <MoreHorizontal className="text-slate-500" />
                    </div>
                 </div>
              ))
           )}
        </div>
      </div>
    </div>
  );
};
