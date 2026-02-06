
import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { X, User, Camera, Loader2, Save } from 'lucide-react';
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
        className="fixed inset-0 bg-[#0B0F17]/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Card */}
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#0B0F17] shadow-2xl animate-in fade-in zoom-in duration-200">
        
        {/* Background Effects */}
        <div className="absolute top-0 right-0 h-[300px] w-[300px] rounded-full bg-indigo-600/10 blur-[80px] pointer-events-none"></div>

        <div className="relative z-10 p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <User className="text-indigo-400" /> My Profile
            </h2>
            <button 
              onClick={onClose}
              className="rounded-full p-2 text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {loading ? (
             <div className="flex justify-center py-10"><Loader2 className="animate-spin text-indigo-500" /></div>
          ) : (
            <form onSubmit={handleSave} className="space-y-6">
              
              {/* Avatar Preview */}
              <div className="flex justify-center">
                 <div className="relative group cursor-pointer">
                    <div className="h-24 w-24 rounded-full border-2 border-white/10 bg-white/5 flex items-center justify-center overflow-hidden">
                       {avatarUrl ? (
                         <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                       ) : (
                         <span className="text-3xl font-bold text-slate-600">{fullName?.[0] || userEmail?.[0] || 'U'}</span>
                       )}
                    </div>
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                       <Camera size={20} className="text-white" />
                    </div>
                 </div>
              </div>

              <div className="space-y-4">
                <div>
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 block mb-2">Email</label>
                   <Input 
                     value={userEmail || ''} 
                     disabled 
                     className="bg-white/5 border-white/10 text-slate-400 cursor-not-allowed" 
                   />
                </div>

                <div>
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 block mb-2">Full Name</label>
                   <Input 
                     value={fullName}
                     onChange={(e) => setFullName(e.target.value)}
                     className="bg-white/5 border-white/10 text-white focus:border-indigo-500"
                     placeholder="John Doe"
                   />
                </div>

                <div>
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1 block mb-2">Avatar URL</label>
                   <Input 
                     value={avatarUrl}
                     onChange={(e) => setAvatarUrl(e.target.value)}
                     className="bg-white/5 border-white/10 text-white focus:border-indigo-500"
                     placeholder="https://example.com/me.png"
                   />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl mt-4"
                disabled={saving}
              >
                {saving ? <Loader2 className="animate-spin" /> : <><Save size={18} className="mr-2" /> Save Changes</>}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
