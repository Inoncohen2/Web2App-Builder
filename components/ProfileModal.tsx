
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../supabaseClient';
import { X, User, Camera, LoaderCircle, Save, Mail } from 'lucide-react';
import { Button } from './ui/Button';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, userEmail }) => {
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const compressImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();
      
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const MAX_WIDTH = 300;
        const MAX_HEIGHT = 300;
        
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        
        if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob((blob) => {
                if (blob) resolve(blob);
                else reject(new Error('Canvas to Blob failed'));
            }, 'image/jpeg', 0.7); // Quality 0.7 for speed
        } else {
            reject(new Error('Canvas context failed'));
        }
      };
      
      reader.readAsDataURL(file);
    });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploading(true);
    try {
        const file = e.target.files[0];
        const compressedBlob = await compressImage(file);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) throw new Error("No user");

        const fileName = `${user.id}/avatar.jpg`;
        const fileObj = new File([compressedBlob], 'avatar.jpg', { type: 'image/jpeg' });

        // Upload to 'avatars' bucket (assuming it exists, otherwise handling error)
        // Using upsert to overwrite
        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(fileName, fileObj, { upsert: true });

        if (uploadError) {
            // Fallback: try 'app-icons' if 'avatars' bucket doesn't exist
             const { error: fallbackError } = await supabase.storage
                .from('app-icons')
                .upload(`profiles/${fileName}`, fileObj, { upsert: true });
             
             if (fallbackError) throw uploadError;
             
             const { data: urlData } = supabase.storage.from('app-icons').getPublicUrl(`profiles/${fileName}`);
             const publicUrl = `${urlData.publicUrl}?t=${new Date().getTime()}`; // Cache bust
             setAvatarUrl(publicUrl);
        } else {
             const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
             const publicUrl = `${urlData.publicUrl}?t=${new Date().getTime()}`; // Cache bust
             setAvatarUrl(publicUrl);
        }

    } catch (error) {
        console.error('Error uploading avatar:', error);
        alert('Failed to upload image. Please try again.');
    } finally {
        setUploading(false);
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

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Full Screen Blurred Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-all"
        onClick={onClose}
      ></div>

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-[#0B0F17] rounded-3xl shadow-2xl border border-white/10 flex flex-col max-h-[80vh] animate-in fade-in zoom-in duration-200 overflow-hidden">
        
        {/* Scrollable Content Container */}
        <div className="overflow-y-auto custom-scrollbar flex-1">
            
            {/* Banner Header */}
            <div className="h-32 bg-gradient-to-r from-slate-900 to-slate-800 border-b border-white/5 relative shrink-0">
               <button 
                  onClick={onClose}
                  className="absolute top-4 right-4 rounded-full p-2 bg-black/20 text-white/70 hover:bg-black/40 hover:text-white transition-colors backdrop-blur-sm z-20"
                >
                  <X size={20} />
               </button>
            </div>

            <div className="relative px-8 pb-8 -mt-12 z-10">
              
              {loading ? (
                 // SKELETON STATE
                 <div className="flex flex-col items-center w-full animate-pulse">
                    <div className="h-24 w-24 rounded-full bg-zinc-800 border-[4px] border-[#0B0F17] mb-6"></div>
                    <div className="h-6 w-48 bg-zinc-800 rounded-md mb-2"></div>
                    <div className="h-4 w-32 bg-zinc-800/50 rounded-md mb-8"></div>
                    <div className="w-full space-y-5">
                       <div className="h-12 w-full bg-zinc-800/50 rounded-xl"></div>
                       <div className="h-12 w-full bg-zinc-800/50 rounded-xl"></div>
                    </div>
                    <div className="w-full h-12 bg-zinc-800 rounded-xl mt-8 opacity-50"></div>
                 </div>
              ) : (
                // LOADED STATE
                <form onSubmit={handleSave} className="flex flex-col items-center">
                  
                  {/* Avatar Section */}
                  <div 
                    className="relative group cursor-pointer mb-6"
                    onClick={() => !uploading && fileInputRef.current?.click()}
                  >
                     <div className="h-24 w-24 rounded-full border-[4px] border-[#0B0F17] bg-slate-700 flex items-center justify-center overflow-hidden shadow-xl">
                        {uploading ? (
                            <LoaderCircle className="animate-spin text-emerald-500" />
                        ) : avatarUrl ? (
                          <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-3xl font-bold text-slate-300">{fullName?.[0]?.toUpperCase() || userEmail?.[0]?.toUpperCase() || 'U'}</span>
                        )}
                     </div>
                     {/* Edit Overlay */}
                     <div className="absolute inset-0 border-[4px] border-transparent rounded-full flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <Camera size={24} className="text-white" />
                     </div>
                     <input 
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                        disabled={uploading}
                     />
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
                       <div className="absolute left-3 top-3 text-slate-500 group-focus-within:text-emerald-400 transition-colors">
                          <User size={18} />
                       </div>
                       <input 
                         value={fullName}
                         onChange={(e) => setFullName(e.target.value)}
                         className="w-full bg-[#1A1F2E] border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-600"
                         placeholder="Your Full Name"
                       />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl mt-8 shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all"
                    disabled={saving || uploading}
                  >
                    {saving ? <LoaderCircle className="animate-spin" /> : <div className="flex items-center gap-2"><Save size={18} /> Save Changes</div>}
                  </Button>
                </form>
              )}
            </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
