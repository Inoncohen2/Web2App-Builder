
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { X, Mail, Lock, LoaderCircle, ArrowRight, Eye, EyeOff, CircleAlert } from 'lucide-react';
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
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validation for Signup
    if (view === 'signup' && password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      let result;
      if (view === 'signup') {
        result = await supabase.auth.signUp({
          email,
          password,
        });
      } else {
        // v1 signIn signature
        result = await supabase.auth.signIn({
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

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    setLoading(true);
    // v1 signIn with provider
    const { error } = await supabase.auth.signIn({
      provider: provider
    }, {
      redirectTo: window.location.origin
    });
    if (error) {
        setError(error.message);
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Blurred Backdrop */}
      <div 
        className="absolute inset-0 bg-[#0B0F17]/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Card */}
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#0B0F17] shadow-2xl animate-in fade-in zoom-in duration-200">
        
        {/* Background Effects inside Modal */}
        <div className="absolute top-[-20%] left-[-20%] h-[200px] w-[200px] rounded-full bg-emerald-600/20 blur-[60px] pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-20%] h-[200px] w-[200px] rounded-full bg-emerald-600/20 blur-[60px] pointer-events-none"></div>

        <div className="relative z-10 p-8">
          
          {/* Header */}
          <div className="relative mb-8 text-center">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {view === 'signin' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              {view === 'signin' ? 'Enter your details to sign in' : 'Start building your app today'}
            </p>
            
            <button 
              onClick={onClose}
              className="absolute top-[-8px] right-[-8px] rounded-full p-2 text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-4">
              {/* Email Field */}
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 text-slate-500" size={18} />
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/5 border-white/10 text-white pl-10 h-12 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl"
                  required
                />
              </div>

              {/* Password Field */}
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 text-slate-500" size={18} />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/5 border-white/10 text-white pl-10 pr-10 h-12 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Confirm Password Field (Signup Only) */}
              {view === 'signup' && (
                <div className="relative animate-in fade-in slide-in-from-top-2">
                  <Lock className="absolute left-3 top-3.5 text-slate-500" size={18} />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`bg-white/5 border-white/10 text-white pl-10 pr-10 h-12 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl ${
                      confirmPassword && password !== confirmPassword ? 'border-red-500/50' : ''
                    }`}
                    required
                  />
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-start gap-2 text-red-400 text-xs bg-red-500/10 p-3 rounded-lg border border-red-500/20 animate-in fade-in">
                <CircleAlert size={14} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 mt-2 transition-all hover:scale-[1.02]"
              disabled={loading}
            >
              {loading ? <LoaderCircle className="animate-spin" /> : (view === 'signin' ? 'Sign In' : 'Sign Up')}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#0B0F17] px-2 text-slate-500">Or continue with</span>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="flex justify-center gap-6">
            <button 
              onClick={() => handleSocialLogin('google')}
              className="h-14 w-14 rounded-full bg-white border border-white/10 flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
              title="Sign in with Google"
            >
               <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-6 w-6" />
            </button>
            <button 
              onClick={() => handleSocialLogin('facebook')}
              className="h-14 w-14 rounded-full bg-[#1877F2] border border-white/10 flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
              title="Sign in with Facebook"
            >
               <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" alt="Facebook" className="h-6 w-6 invert brightness-0 saturate-100 filter invert-100" style={{ filter: 'brightness(0) invert(1)' }} />
            </button>
          </div>

          {/* Footer Actions */}
          <div className="mt-8 flex flex-col items-center gap-4 text-sm">
            <div className="flex items-center gap-2 text-slate-400">
               <span>{view === 'signin' ? "Don't have an account?" : "Already have an account?"}</span>
               <button 
                 onClick={() => {
                   setView(view === 'signin' ? 'signup' : 'signin');
                   setError(null);
                   setConfirmPassword('');
                 }}
                 className="text-emerald-400 hover:text-emerald-300 font-bold hover:underline transition-all"
               >
                 {view === 'signin' ? 'Sign up' : 'Sign in'}
               </button>
            </div>

            {/* Guest Option */}
            {onGuest && (
              <button 
                onClick={onGuest}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1 group"
              >
                Skip for now 
                <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
