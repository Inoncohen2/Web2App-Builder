'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Globe,
  Loader2,
  Zap,
  CheckCircle2,
  Menu,
  X,
  Search,
  ShoppingBag,
  User,
  Home,
  LayoutGrid,
  AlertCircle,
  Sparkles,
  Lock,
  Terminal,
  Code,
  Cpu,
  Command,
  Globe2,
  FileJson,
  Layers,
  Download,
  Check,
  Layout,
} from 'lucide-react';

import { Button } from '@/components/ui/button';          // שנה את הנתיב אם צריך
import { AuthModal } from '@/components/AuthModal';      // שנה את הנתיב אם צריך
import { UserMenu } from '@/components/UserMenu';        // שנה את הנתיב אם צריך
import { supabase } from '@/lib/supabase';               // שנה את הנתיב אם צריך
import axios from 'axios';


// ───────────────────────────────────────────────
//  PIPELINE NODE
// ───────────────────────────────────────────────
type PipelineNodeProps = {
  icon: any;
  title: string;
  subtitle: string;
  isActive: boolean;
  isCompleted: boolean;
  delay?: number;
  position?: 'left' | 'right' | 'center';
};

const PipelineNode = ({
  icon: Icon,
  title,
  subtitle,
  isActive,
  isCompleted,
  delay = 0,
  position = 'center',
}: PipelineNodeProps) => {
  return (
    <div
      className={`
        relative flex items-center gap-4 p-4 rounded-xl border backdrop-blur-sm transition-all duration-700 w-64 z-20
        ${isActive || isCompleted
          ? 'bg-zinc-900/80 border-zinc-600 shadow-[0_0_30px_-10px_rgba(255,255,255,0.08)]'
          : 'bg-black/60 border-zinc-900 opacity-70 grayscale'
        }
        ${position === 'left' ? '-translate-x-3 sm:-translate-x-6' : ''}
        ${position === 'right' ? 'translate-x-3 sm:translate-x-6' : ''}
      `}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div
        className={`
          h-10 w-10 rounded-lg flex items-center justify-center transition-all duration-500
          ${isCompleted ? 'bg-emerald-500 text-white' : isActive ? 'bg-white text-black animate-pulse' : 'bg-zinc-800 text-zinc-500'}
        `}
      >
        {isCompleted ? <Check size={20} strokeWidth={3} /> : <Icon size={20} />}
      </div>
      <div className="flex flex-col">
        <span
          className={`text-sm font-bold transition-colors duration-300 ${
            isActive || isCompleted ? 'text-white' : 'text-zinc-500'
          }`}
        >
          {title}
        </span>
        <span className="text-[10px] text-zinc-500 font-mono">
          {isActive && !isCompleted ? 'Processing...' : subtitle}
        </span>
      </div>

      {isActive && !isCompleted && (
        <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-indigo-500 animate-ping" />
      )}
    </div>
  );
};

// ───────────────────────────────────────────────
//  PIPELINE FLOW
// ───────────────────────────────────────────────
const PipelineFlow = () => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const loop = () => {
      setStep(0);
      setTimeout(() => setStep(1), 600);
      setTimeout(() => setStep(2), 1800);
      setTimeout(() => setStep(3), 2600);
      setTimeout(() => setStep(4), 3800);
      setTimeout(() => setStep(5), 4600);
      setTimeout(() => setStep(6), 6200);
      setTimeout(() => setStep(7), 7200);
      setTimeout(loop, 10000);
    };

    loop();

    return () => {
      // אין צורך בניקוי כאן כי אנחנו משתמשים ב-setTimeout פשוט
    };
  }, []);

  return (
    <div className="relative flex flex-col items-center py-12 w-full max-w-3xl mx-auto select-none scale-[0.82] sm:scale-90 lg:scale-100 origin-top">
      {/* רקע עדין */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.04]" />

      {/* Input */}
      <div className="z-10">
        <PipelineNode
          icon={Globe2}
          title="Website Source"
          subtitle="https://myshop.com"
          isActive={step >= 1}
          isCompleted={step >= 2}
        />
      </div>

      {/* חיבור 1 */}
      <div className={`h-14 w-0.5 transition-all duration-700 ${step >= 2 ? 'bg-gradient-to-b from-white/80 to-white/30 shadow-[0_0_12px_2px] shadow-white/20' : 'bg-zinc-800'}`} />

      {/* Smart Config */}
      <div className="z-10">
        <PipelineNode
          icon={FileJson}
          title="Smart Config"
          subtitle="Manifest & icons"
          isActive={step >= 3}
          isCompleted={step >= 4}
        />
      </div>

      {/* פיצול */}
      <div className="relative h-14 w-full max-w-xs sm:max-w-md">
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 h-7 w-0.5 ${step >= 4 ? 'bg-white/80' : 'bg-zinc-800'}`} />
        <div className={`absolute top-7 left-0 right-0 h-0.5 ${step >= 4 ? 'bg-white/70' : 'bg-zinc-800'}`} />
        <div className={`absolute top-7 left-4 sm:left-12 h-7 w-0.5 ${step >= 4 ? 'bg-white/80' : 'bg-zinc-800'}`} />
        <div className={`absolute top-7 right-4 sm:right-12 h-7 w-0.5 ${step >= 4 ? 'bg-white/80' : 'bg-zinc-800'}`} />
      </div>

      {/* בנייה מקבילה */}
      <div className="flex flex-col sm:flex-row justify-center sm:justify-between w-full max-w-xs sm:max-w-2xl gap-6 sm:gap-0 z-10">
        <PipelineNode
          icon={Cpu}
          title="Android Build"
          subtitle="AAB & APK"
          isActive={step >= 5}
          isCompleted={step >= 6}
          position="left"
        />
        <div className="hidden sm:block self-center text-zinc-600 font-mono text-xs">parallel</div>
        <PipelineNode
          icon={Layers}
          title="iOS Build"
          subtitle="IPA archive"
          isActive={step >= 5}
          isCompleted={step >= 6}
          position="right"
        />
      </div>

      {/* איחוד */}
      <div className="relative h-14 w-full max-w-xs sm:max-w-md">
        <div className={`absolute top-0 left-4 sm:left-12 h-7 w-0.5 ${step >= 6 ? 'bg-white/80' : 'bg-zinc-800'}`} />
        <div className={`absolute top-0 right-4 sm:right-12 h-7 w-0.5 ${step >= 6 ? 'bg-white/80' : 'bg-zinc-800'}`} />
        <div className={`absolute top-7 left-0 right-0 h-0.5 ${step >= 6 ? 'bg-white/70' : 'bg-zinc-800'}`} />
        <div className={`absolute top-7 left-1/2 -translate-x-1/2 h-7 w-0.5 ${step >= 6 ? 'bg-white/80' : 'bg-zinc-800'}`} />
      </div>

      {/* Distribution */}
      <div className="z-10">
        <PipelineNode
          icon={Download}
          title="Distribution Ready"
          subtitle="Signed & ready"
          isActive={step >= 7}
          isCompleted={step >= 7}
        />
      </div>
    </div>
  );
};

// ───────────────────────────────────────────────
//  INTERACTIVE TERMINAL
// ───────────────────────────────────────────────
const InteractiveTerminal = () => {
  const [lines, setLines] = useState<{ id: number; text: string; color?: string }[]>([]);

  useEffect(() => {
    const sequence = [
      { text: 'user@build:~$ web2app convert --url https://myshop.com', color: 'text-white', delay: 0 },
      { text: '→ Warming up build environment...', color: 'text-zinc-500', delay: 900 },
      { text: '→ Fetching & analyzing website...', color: 'text-zinc-500', delay: 1800 },
      { text: '  ✓ Reached (200) in 238ms', color: 'text-emerald-400', delay: 2600 },
      { text: '  ├─ Detected title: My Shop', color: 'text-zinc-300', delay: 3200 },
      { text: '  ├─ Primary color: #0f172a', color: 'text-zinc-300', delay: 3600 },
      { text: '  └─ Best icon: 512×512', color: 'text-zinc-300', delay: 4000 },
      { text: '→ Generating native configuration...', color: 'text-purple-400', delay: 5000 },
      { text: '→ Building Android bundle...', color: 'text-yellow-400', delay: 6200 },
      { text: '→ Building iOS archive...', color: 'text-yellow-400', delay: 7200 },
      { text: '✓ Build completed successfully', color: 'text-emerald-400 font-medium', delay: 8800 },
      { text: 'user@build:~$ _', color: 'text-white animate-pulse', delay: 9800 },
    ];

    let timeouts: NodeJS.Timeout[] = [];

    const run = () => {
      setLines([]);
      sequence.forEach((item, i) => {
        const t = setTimeout(() => {
          setLines((prev) => [...prev, { id: i, ...item }]);
        }, item.delay);
        timeouts.push(t);
      });
    };

    run();
    const interval = setInterval(run, 12000);

    return () => {
      timeouts.forEach(clearTimeout);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <div className="space-y-8 md:space-y-12 text-center">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-950/40 border border-indigo-900/60 text-indigo-300 text-xs font-mono tracking-wide">
            <Terminal size={14} /> CLOUD BUILD ENGINE
          </div>
          <h3 className="mt-5 text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
            From URL to App Store
            <br />
            <span className="text-zinc-600">— no code, no hassle</span>
          </h3>
        </div>

        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 rounded-2xl blur-xl opacity-70 group-hover:opacity-100 transition-opacity duration-1000" />

          <div className="relative bg-[#0d1117] rounded-xl border border-zinc-800/80 shadow-2xl overflow-hidden font-mono text-sm">
            {/* Header */}
            <div className="bg-[#161b22] px-5 py-3 flex items-center justify-between border-b border-zinc-800/70">
              <div className="flex gap-2">
                <div className="w-3.5 h-3.5 rounded-full bg-red-500/90" />
                <div className="w-3.5 h-3.5 rounded-full bg-yellow-500/90" />
                <div className="w-3.5 h-3.5 rounded-full bg-green-500/90" />
              </div>
              <span className="text-zinc-500 text-xs">build.web2app • zsh</span>
              <div className="w-10" />
            </div>

            {/* Body */}
            <div className="p-5 md:p-7 min-h-[320px] md:min-h-[380px] flex flex-col justify-end">
              {lines.map((line) => (
                <div
                  key={line.id}
                  className={`whitespace-pre-wrap break-all ${line.color || 'text-zinc-300'}`}
                >
                  {line.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ───────────────────────────────────────────────
//  MAIN LANDING PAGE
// ───────────────────────────────────────────────
export default function LandingPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isUrlValid, setIsUrlValid] = useState(false);

  const [isAppMode, setIsAppMode] = useState(true);

  // ── Auth & Theme ────────────────────────────────────────
  useEffect(() => {
    document.body.style.backgroundColor = '#000000';

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', '#000000');

    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };
    checkUser();

    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // ── Scroll effect ───────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ── Mockup animation cycle ──────────────────────────────
  useEffect(() => {
    const i = setInterval(() => setIsAppMode((v) => !v), 5000);
    return () => clearInterval(i);
  }, []);

  // ── URL validation ──────────────────────────────────────
  useEffect(() => {
    const clean = url.trim().replace(/^https?:\/\//i, '');
    const ok = /^([a-z0-9-]+\.)+[a-z]{2,}/.test(clean) && clean.length > 3;
    setIsUrlValid(ok);
  }, [url]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!url) {
      setError('נא להזין כתובת אתר');
      return;
    }

    let fullUrl = url.trim();
    if (!/^https?:\/\//i.test(fullUrl)) fullUrl = 'https://' + fullUrl;

    setIsLoading(true);

    try {
      const { data } = await axios.post('/api/scrape', { url: fullUrl });

      const params = new URLSearchParams();
      params.set('url', data.url || fullUrl);
      if (data.title) params.set('name', data.title);
      if (data.themeColor) params.set('color', data.themeColor);
      if (data.icon) params.set('icon', data.icon);

      router.push(`/builder?${params}`);
    } catch (err) {
      console.error(err);
      router.push(`/builder?url=${encodeURIComponent(fullUrl)}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {}}
      />

      {/* ── Header ─────────────────────────────────────────────── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-black/80 backdrop-blur-xl border-b border-zinc-800/70' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 sm:h-20 flex items-center justify-between">
          {/* Logo */}
          <div
            className="flex items-center gap-2.5 font-black text-xl tracking-tight cursor-pointer group"
            onClick={() => router.push('/')}
          >
            <img
              src="https://res.cloudinary.com/ddsogd7hv/image/upload/v1770576910/Icon2_dvenip.png"
              alt="Web2App"
              className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg shadow-sm transition-transform group-hover:scale-110"
            />
            <span className="text-white">Web2App</span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#how" className="text-zinc-400 hover:text-white transition-colors">
              איך זה עובד
            </a>

            {user ? (
              <UserMenu />
            ) : (
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  className="text-zinc-300 hover:text-white hover:bg-white/5"
                  onClick={() => setIsAuthModalOpen(true)}
                >
                  כניסה
                </Button>
                <Button
                  className="bg-white text-black hover:bg-zinc-200 font-bold rounded-full px-6 h-10"
                  onClick={() => setIsAuthModalOpen(true)}
                >
                  הרשמה
                </Button>
              </div>
            )}
          </nav>

          {/* Mobile menu button */}
          <button className="md:hidden text-white p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-black border-b border-zinc-800 px-5 py-6 animate-in slide-in-from-top-5">
            <div className="flex flex-col gap-5">
              <a href="#how" className="text-zinc-300 hover:text-white py-2" onClick={() => setMobileMenuOpen(false)}>
                איך זה עובד
              </a>

              {user ? (
                <>
                  <div className="flex items-center gap-3 py-2">
                    <div className="h-10 w-10 rounded-full bg-zinc-700 flex items-center justify-center font-bold text-lg">
                      {user.email?.[0]?.toUpperCase()}
                    </div>
                    <span className="text-white truncate">{user.email}</span>
                  </div>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={async () => {
                      await supabase.auth.signOut();
                      setMobileMenuOpen(false);
                    }}
                  >
                    התנתק
                  </Button>
                </>
              ) : (
                <Button className="w-full" onClick={() => setIsAuthModalOpen(true)}>
                  כניסה / הרשמה
                </Button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* …… שאר הקוד (Hero + Planet + Mockup + How it works + Footer) …… */}

      {/* 
        כדי לא להאריך יותר מדי כאן – 
        תעתיק את שאר החלקים (Hero, Planet effect, Mockup, How it works, Footer)
        מההודעה הקודמת שלי עם הגרסה המתוקנת
      */}

      {/* 
        אם אתה רוצה שאשלח לך **רק** חלק מסוים (למשל רק את ה-Hero, או רק את ה-Planet effect, או רק את ה-Footer)
        תגיד לי ואשלח אותו מיד בנפרד
      */}

    </>
  );
}
