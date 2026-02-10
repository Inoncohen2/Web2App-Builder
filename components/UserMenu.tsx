
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { User, LogOut, Clock, ChevronDown, UserCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// Lazy load heavy modals to improve initial page load speed
const ProfileModal = dynamic(() => import('./ProfileModal').then(mod => mod.ProfileModal), {
  loading: () => <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"><Loader2 className="animate-spin text-white" /></div>,
  ssr: false
});

const HistoryModal = dynamic(() => import('./HistoryModal').then(mod => mod.HistoryModal), {
  loading: () => <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"><Loader2 className="animate-spin text-white" /></div>,
  ssr: false
});

export const UserMenu: React.FC = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsOpen(false);
    router.refresh();
  };

  if (!user) return null;

  const initial = user.email ? user.email[0].toUpperCase() : 'U';

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
        >
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-inner">
            {initial}
          </div>
          <span className="text-sm font-medium text-slate-300 max-w-[100px] truncate hidden md:block">
            {user.email?.split('@')[0]}
          </span>
          <ChevronDown size={14} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#0B0F17] border border-white/10 shadow-xl py-1 z-50 animate-in fade-in slide-in-from-top-2">
            <div className="px-4 py-3 border-b border-white/5">
              <p className="text-sm font-bold text-white">Signed in as</p>
              <p className="text-xs text-slate-500 truncate mt-0.5">{user.email}</p>
            </div>
            
            <div className="py-1">
              <button 
                onClick={() => { setIsOpen(false); setShowProfile(true); }}
                className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white flex items-center gap-3 transition-colors"
              >
                <UserCircle size={16} className="text-indigo-400" /> My Profile
              </button>

              <button 
                onClick={() => { setIsOpen(false); setShowHistory(true); }}
                className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white flex items-center gap-3 transition-colors"
              >
                <Clock size={16} className="text-emerald-400" /> Project History
              </button>
            </div>
            
            <div className="border-t border-white/5 py-1">
              <button 
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-3 transition-colors"
              >
                <LogOut size={16} /> Log Out
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Conditionally Rendered Modals via Dynamic Import */}
      {showProfile && (
        <ProfileModal 
          isOpen={showProfile} 
          onClose={() => setShowProfile(false)} 
          userEmail={user.email} 
        />
      )}
      {showHistory && (
        <HistoryModal 
          isOpen={showHistory} 
          onClose={() => setShowHistory(false)} 
        />
      )}
    </>
  );
};
