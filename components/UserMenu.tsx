
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { LogOut, Clock, ChevronDown, UserCircle, LayoutGrid } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ProfileModal } from './ProfileModal';
import { HistoryModal } from './HistoryModal';

export const UserMenu: React.FC = () => {
  const [user, setUser] = useState<any>(null);
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
          className="flex items-center gap-3 pl-1 pr-3 py-1 rounded-full bg-[#111] hover:bg-[#222] border border-white/10 transition-all group"
        >
          <div className="h-7 w-7 rounded-full bg-white text-black flex items-center justify-center font-bold text-xs">
            {initial}
          </div>
          <ChevronDown size={14} className={`text-gray-500 group-hover:text-white transition-all ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-3 w-64 rounded-2xl bg-black border border-white/10 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            {/* Dot Pattern Background for Menu */}
            <div className="absolute inset-0 bg-dot-pattern opacity-50 pointer-events-none"></div>

            <div className="relative px-5 py-4 border-b border-white/5">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Account</p>
              <p className="text-sm font-medium text-white truncate">{user.email}</p>
            </div>
            
            <div className="relative p-2 space-y-1">
              <button 
                onClick={() => { setIsOpen(false); setShowProfile(true); }}
                className="w-full text-left px-3 py-2.5 text-sm text-gray-400 hover:bg-white/10 hover:text-white rounded-lg flex items-center gap-3 transition-colors"
              >
                <UserCircle size={16} /> My Profile
              </button>

              <button 
                onClick={() => { setIsOpen(false); setShowHistory(true); }}
                className="w-full text-left px-3 py-2.5 text-sm text-gray-400 hover:bg-white/10 hover:text-white rounded-lg flex items-center gap-3 transition-colors"
              >
                <LayoutGrid size={16} /> My Apps
              </button>
            </div>
            
            <div className="relative border-t border-white/5 p-2 mt-1">
              <button 
                onClick={handleLogout}
                className="w-full text-left px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg flex items-center gap-3 transition-colors"
              >
                <LogOut size={16} /> Log Out
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <ProfileModal 
        isOpen={showProfile} 
        onClose={() => setShowProfile(false)} 
        userEmail={user.email} 
      />
      <HistoryModal 
        isOpen={showHistory} 
        onClose={() => setShowHistory(false)} 
      />
    </>
  );
};
