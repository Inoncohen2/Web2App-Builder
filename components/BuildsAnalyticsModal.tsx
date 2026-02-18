
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Activity } from 'lucide-react';
import BuildsDashboard from './BuildsDashboard';

interface BuildsAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appId: string;
}

export const BuildsAnalyticsModal: React.FC<BuildsAnalyticsModalProps> = ({ isOpen, onClose, appId }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-md transition-all animate-in fade-in duration-300"
        onClick={onClose}
      ></div>

      {/* Modal Card - Fixed Height 80vh */}
      <div className="relative w-full max-w-5xl bg-[#0B0F17] rounded-3xl shadow-2xl flex flex-col h-[80vh] animate-in fade-in zoom-in-95 duration-300 overflow-hidden ring-1 ring-white/10">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10 bg-[#0B0F17] flex items-center justify-between shrink-0 z-20">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
               <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
                 <Activity size={20} />
               </div>
               Build History
            </h2>
            <p className="text-xs text-slate-400 mt-1 pl-1">
              Comprehensive log of all completed builds and artifacts.
            </p>
          </div>
          
          <button 
            onClick={onClose}
            className="rounded-full p-2 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors border border-transparent hover:border-white/5"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#0B0F17] custom-scrollbar">
           <BuildsDashboard appId={appId} />
        </div>
        
        {/* Footer Hint */}
        <div className="px-6 py-3 bg-[#0B0F17] border-t border-white/10 text-[10px] text-slate-500 text-center uppercase tracking-wider font-mono">
           Artifacts are retained for 30 days
        </div>
      </div>
    </div>,
    document.body
  );
};
