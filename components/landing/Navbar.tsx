
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { UserMenu } from '../UserMenu';
import { AuthModal } from '../AuthModal';
import { supabase } from '../../supabaseClient';

export const Navbar = () => {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <>
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {}}
      />
      
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-black/80 backdrop-blur-md border-b border-zinc-800' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight cursor-pointer group" onClick={() => router.push('/')}>
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500/20 blur opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
              <Image
                src="https://res.cloudinary.com/ddsogd7hv/image/upload/v1770576910/Icon2_dvenip.png"
                alt="Logo"
                width={36}
                height={36}
                className="relative rounded-lg transition-all duration-300"
              />
            </div>
            <span className="text-white">Web2App</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
            {user ? (
              <UserMenu />
            ) : (
              <div className="flex items-center gap-4">
                <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-white/5" onClick={() => setIsAuthModalOpen(true)}>
                  Log in
                </Button>
                <Button className="bg-white text-black hover:bg-zinc-200 rounded-full px-5 h-9 font-bold transition-all" onClick={() => setIsAuthModalOpen(true)}>
                  Sign Up
                </Button>
              </div>
            )}
          </nav>

          <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 right-0 bg-black border-b border-zinc-800 p-6 flex flex-col gap-4 animate-in slide-in-from-top-5 shadow-2xl">
            <a href="#how-it-works" className="text-zinc-400 hover:text-white py-2" onClick={() => setMobileMenuOpen(false)}>How it Works</a>
            {user ? (
              <div className="py-2 border-t border-zinc-800 mt-2">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center font-bold">
                    {user.email?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <span className="text-white truncate max-w-[180px]">{user.email}</span>
                </div>
                <Button
                  className="w-full bg-red-900/20 text-red-200 border border-red-900/50"
                  onClick={async () => {
                    await supabase.auth.signOut();
                    setMobileMenuOpen(false);
                  }}
                >
                  Log Out
                </Button>
              </div>
            ) : (
              <Button className="w-full bg-white text-black" onClick={() => { setIsAuthModalOpen(true); setMobileMenuOpen(false); }}>
                Login / Sign Up
              </Button>
            )}
          </div>
        )}
      </header>
    </>
  );
};
