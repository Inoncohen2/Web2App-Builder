
'use client';

import { useEffect } from 'react';

// This component renders nothing visually.
// Its sole job is to tell the CSS that React has loaded,
// so the static HTML splash screen can fade out smoothly.
export const PWASplash = () => {
  useEffect(() => {
    // Small delay to ensure the page is actually painted behind the splash
    const timer = setTimeout(() => {
      document.body.classList.add('splash-loaded');
    }, 100); // 100ms delay for smoothness

    return () => clearTimeout(timer);
  }, []);

  return null;
};
