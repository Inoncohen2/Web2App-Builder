
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { UserMenu } from '../UserMenu';
import { AuthModal } from '../AuthModal';
import { supabase } from '../../supabaseClient';

export const Navbar = () => {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true); // New loading state
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
      setIsLoading(false); // Loading finished
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false); // Ensure loading is false on state change
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

          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
              <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
            </nav>

            {/* Only render auth buttons when loading is complete */}
            {!isLoading && (
              user ? (
                <UserMenu />
              ) : (
                <button 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="text-white text-sm font-bold hover:text-zinc-300 transition-colors px-2 py-1"
                >
                  Login
                </button>
              )
            )}
          </div>
        </div>
      </header>
    </>
  );
};
