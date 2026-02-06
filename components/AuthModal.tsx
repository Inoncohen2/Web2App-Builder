
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { X, Mail, Lock, Loader2, ArrowRight, Github } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onGuest?: () => void; // Optional: If provided, shows "Continue as Guest"
  initialView?: 'signin' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  onGuest, 
  initialView = 'signin' 
}) => {
  const [view, setView] = useState<'signin' | 'signup'>(initialView);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let result;
      if (view === 'signup') {
        result = await supabase.auth.signUp({
          email,
          password,
        });
      } else {
        result = await supabase.auth.signInWithPassword({
          email,
          password,
        });
      }

      if (result.error) throw result.error;
      
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Blurred Backdrop */}
      <div 
        className="absolute inset-0 bg-[#0B0F17]/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Card */}
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#0B0F17] shadow-2xl animate-in fade-in zoom-in duration-200">
        
        {/* Background Effects inside Modal */}
        <div className="absolute top-[-20%] left-[-20%] h-[200px] w-[200px] rounded-full bg-indigo-600/20 blur-[60px] pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-20%] h-[200px] w-[200px] rounded-full bg-purple-600/20 blur-[60px] pointer-events-none"></div>

        <div className="relative z-10 p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {view === 'signin' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <button 
              onClick={onClose}
              className="rounded-full p-2 text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-500" size={18} />
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/5 border-white/10 text-white pl-10 h-12 focus:border-indigo-500 focus:ring-indigo-500/20"
                  required
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-500" size={18} />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/5 border-white/10 text-white pl-10 h-12 focus:border-indigo-500 focus:ring-indigo-500/20"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="text-red-400 text-xs bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/20 mt-2"
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin" /> : (view === 'signin' ? 'Sign In' : 'Sign Up')}
            </Button>
          </form>

          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-400">
            <span>{view === 'signin' ? "Don't have an account?" : "Already have an account?"}</span>
            <button 
              onClick={() => setView(view === 'signin' ? 'signup' : 'signin')}
              className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              {view === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </div>

          {/* Guest Option */}
          {onGuest && (
            <div className="mt-8 pt-6 border-t border-white/10 text-center">
              <p className="text-xs text-slate-500 mb-3">
                Want to save without an account? You might lose access if you clear cookies.
              </p>
              <button 
                onClick={onGuest}
                className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors group"
              >
                Continue as Guest 
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
