
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { User, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const UserMenu: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    // Get initial user
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    // Listen for auth changes
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

  // Get initial or generate one
  const initial = user.email ? user.email[0].toUpperCase() : 'U';

  return (
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
        <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[#0B0F17] border border-white/10 shadow-xl py-1 z-50 animate-in fade-in slide-in-from-top-2">
          <div className="px-4 py-2 border-b border-white/5 md:hidden">
             <p className="text-xs text-slate-500 truncate">{user.email}</p>
          </div>
          
          <button 
            onClick={() => {
                // If we are on landing, go to builder/dashboard? No standard dashboard list page yet, stay here.
                setIsOpen(false);
            }} 
            className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white flex items-center gap-2 transition-colors"
          >
            <LayoutDashboard size={16} /> Dashboard
          </button>
          
          <button 
            onClick={handleLogout}
            className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
          >
            <LogOut size={16} /> Log Out
          </button>
        </div>
      )}
    </div>
  );
};
