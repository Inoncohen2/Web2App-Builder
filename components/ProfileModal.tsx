
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { X, User, Camera, Loader2, Save, Mail, AtSign } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, userEmail }) => {
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) fetchProfile();
  }, [isOpen]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (data) {
          setFullName(data.full_name || '');
          setAvatarUrl(data.avatar_url || '');
        }
      }
    } catch (error) {
      console.error('Error loading profile', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            full_name: fullName,
            avatar_url: avatarUrl,
            updated_at: new Date().toISOString(),
          });
          
        if (error) throw error;
        onClose();
      }
    } catch (error) {
      console.error('Error updating profile', error);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center p-4 overflow-y-auto">
      {/* Blurred Backdrop */}
      <div 
        className="fixed inset-0 bg-[#0B0F17]/90 backdrop-blur-md transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Card */}
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#0B0F17] shadow-2xl animate-in fade-in zoom-in duration-200">
        
        {/* Banner Header */}
        <div className="h-32 bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 relative">
           <button 
              onClick={onClose}
              className="absolute top-4 right-4 rounded-full p-2 bg-black/20 text-white/70 hover:bg-black/40 hover:text-white transition-colors backdrop-blur-sm"
            >
              <X size={20} />
           </button>
        </div>

        <div className="relative px-8 pb-8 -mt-12 z-10">
          
          {loading ? (
             <div className="flex justify-center py-20 bg-[#0B0F17] rounded-xl"><Loader2 className="animate-spin text-indigo-500" /></div>
          ) : (
            <form onSubmit={handleSave} className="flex flex-col items-center">
              
              {/* Avatar Section */}
              <div className="relative group cursor-pointer mb-6">
                 <div className="h-24 w-24 rounded-full border-[4px] border-[#0B0F17] bg-zinc-800 flex items-center justify-center overflow-hidden shadow-xl">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-3xl font-bold text-slate-500">{fullName?.[0]?.toUpperCase() || userEmail?.[0]?.toUpperCase() || 'U'}</span>
                    )}
                 </div>
                 {/* Edit Overlay */}
                 <div className="absolute inset-0 border-[4px] border-transparent rounded-full flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <Camera size={24} className="text-white" />
                 </div>
              </div>

              <div className="text-center mb-8 w-full">
                 <h2 className="text-2xl font-bold text-white tracking-tight">{fullName || 'User Profile'}</h2>
                 <p className="text-sm text-slate-400">{userEmail}</p>
              </div>

              <div className="space-y-5 w-full">
                
                {/* Email (Read Only) */}
                <div className="relative group">
                   <div className="absolute left-3 top-3 text-slate-500 group-hover:text-slate-400 transition-colors">
                      <Mail size={18} />
                   </div>
                   <input 
                     value={userEmail || ''} 
                     disabled 
                     className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-400 cursor-not-allowed" 
                   />
                </div>

                {/* Full Name */}
                <div className="relative group">
                   <div className="absolute left-3 top-3 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                      <User size={18} />
                   </div>
                   <input 
                     value={fullName}
                     onChange={(e) => setFullName(e.target.value)}
                     className="w-full bg-[#1A1F2E] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
                     placeholder="Your Full Name"
                   />
                </div>

                {/* Avatar URL */}
                <div className="relative group">
                   <div className="absolute left-3 top-3 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                      <AtSign size={18} />
                   </div>
                   <input 
                     value={avatarUrl}
                     onChange={(e) => setAvatarUrl(e.target.value)}
                     className="w-full bg-[#1A1F2E] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-600"
                     placeholder="Avatar Image URL"
                   />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl mt-8 shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all"
                disabled={saving}
              >
                {saving ? <Loader2 className="animate-spin" /> : <div className="flex items-center gap-2"><Save size={18} /> Save Changes</div>}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
