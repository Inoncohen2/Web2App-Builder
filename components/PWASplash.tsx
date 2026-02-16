
'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

export const PWASplash = () => {
  const [show, setShow] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Determine if we are likely in a PWA context or just initial load
    // We show it briefly for everyone to ensure seamless transition from the 
    // black background defined in globals.css
    
    // Hide splash after a short delay to allow main content to hydrate/paint
    const timer = setTimeout(() => {
      setShow(false);
    }, 1500); // 1.5 seconds visible splash

    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  return (
    <div 
      className={`
        fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#09090b] 
        transition-opacity duration-700 ease-in-out pointer-events-none
        ${show ? 'opacity-100' : 'opacity-0'}
      `}
    >
      <div className="relative flex flex-col items-center gap-6 animate-in zoom-in-95 duration-700">
        <div className="relative h-24 w-24 rounded-2xl overflow-hidden shadow-2xl shadow-emerald-900/20 border border-white/5">
           <Image
             src="https://res.cloudinary.com/ddsogd7hv/image/upload/v1770576910/Icon2_dvenip.png"
             alt="Logo"
             fill
             className="object-cover"
             priority
           />
        </div>
        <div className="flex flex-col items-center gap-1">
           <h1 className="text-2xl font-black text-white tracking-tight">Web2App</h1>
           <div className="h-1 w-8 bg-emerald-500 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};
