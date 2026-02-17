
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
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-all animate-in fade-in duration-300"
        onClick={onClose}
      ></div>

      {/* Modal Card */}
      <div className="relative w-full max-w-5xl bg-[#F6F8FA] rounded-3xl shadow-2xl flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-300 overflow-hidden ring-1 ring-black/5">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-white flex items-center justify-between shrink-0 z-20">
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
               <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                 <Activity size={20} />
               </div>
               Build Analytics & History
            </h2>
            <p className="text-xs text-gray-500 mt-1 pl-1">
              View comprehensive logs, success rates, and past artifacts.
            </p>
          </div>
          
          <button 
            onClick={onClose}
            className="rounded-full p-2 bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#F6F8FA] custom-scrollbar">
           <BuildsDashboard appId={appId} />
        </div>
        
        {/* Footer Hint */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-[10px] text-gray-400 text-center uppercase tracking-wider font-mono">
           Builds are retained for 30 days
        </div>
      </div>
    </div>,
    document.body
  );
};
