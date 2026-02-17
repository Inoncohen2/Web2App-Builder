
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../supabaseClient';
import { X, User, Camera, LoaderCircle, Save, Mail } from 'lucide-react';
import { Button } from './ui/Button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, userEmail }) => {
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [mounted, setMounted] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Fetch Profile with Caching (React Query)
  const { data: profileData, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user');
      
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      return { 
        fullName: data?.full_name || '', 
        avatarUrl: data?.avatar_url || '',
        id: user.id
      };
    },
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
    enabled: isOpen, // Only fetch when modal opens
  });

  // Sync state with fetched data
  useEffect(() => {
    if (profileData) {
      setFullName(profileData.fullName);
      setAvatarUrl(profileData.avatarUrl);
    }
  }, [profileData]);

  // 2. Mutation for Saving
  const saveMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user');

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: fullName,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        });
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] }); // Refresh cache
      onClose();
    },
    onError: (error) => {
      console.error('Error updating profile', error);
      alert('Failed to save profile');
    }
  });

  const compressImage = async (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();
      reader.onload = (e) => { img.src = e.target?.result as string; };
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const MAX_WIDTH = 300;
        const MAX_HEIGHT = 300;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
        } else {
          if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
        }
        canvas.width = width;
        canvas.height = height;
        if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob((blob) => {
                if (blob) resolve(blob); else reject(new Error('Canvas to Blob failed'));
            }, 'image/jpeg', 0.7);
        } else { reject(new Error('Canvas context failed')); }
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

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(fileName, fileObj, { upsert: true });

        if (uploadError) {
             const { error: fallbackError } = await supabase.storage
                .from('app-icons')
                .upload(`profiles/${fileName}`, fileObj, { upsert: true });
             
             if (fallbackError) throw uploadError;
             
             const { data: urlData } = supabase.storage.from('app-icons').getPublicUrl(`profiles/${fileName}`);
             const publicUrl = `${urlData.publicUrl}?t=${new Date().getTime()}`;
             setAvatarUrl(publicUrl);
        } else {
             const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
             const publicUrl = `${urlData.publicUrl}?t=${new Date().getTime()}`;
             setAvatarUrl(publicUrl);
        }
    } catch (error) {
        console.error('Error uploading avatar:', error);
        alert('Failed to upload image. Please try again.');
    } finally {
        setUploading(false);
    }
  };

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-all"
        onClick={onClose}
      ></div>

      <div className="relative w-full max-w-md bg-[#0B0F17] rounded-3xl shadow-2xl border border-white/10 flex flex-col max-h-[80vh] animate-in fade-in zoom-in duration-200 overflow-hidden">
        
        <div className="overflow-y-auto custom-scrollbar flex-1">
            <div className="h-32 relative overflow-hidden shrink-0 border-b border-white/5">
               <div className="absolute inset-0 bg-[#020617]">
                  <div className="absolute inset-0 bg-[radial-gradient(white_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 via-transparent to-purple-900/40"></div>
                  <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-500/20 rounded-full blur-[50px]"></div>
                  <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-[50px]"></div>
               </div>

               <button 
                  onClick={onClose}
                  className="absolute top-4 right-4 rounded-full p-2 bg-black/30 text-white/70 hover:bg-black/50 hover:text-white transition-colors backdrop-blur-md z-20 border border-white/10"
                >
                  <X size={20} />
               </button>
            </div>

            <div className="relative px-8 pb-8 -mt-12 z-10">
              
              {isLoading ? (
                 <div className="flex flex-col items-center w-full animate-pulse">
                    <div className="h-24 w-24 rounded-full bg-zinc-800 border-[4px] border-[#0B0F17] mb-6"></div>
                    <div className="h-6 w-48 bg-zinc-800 rounded-md mb-2"></div>
                    <div className="h-4 w-32 bg-zinc-800/50 rounded-md mb-8"></div>
                    <div className="w-full space-y-5">
                       <div className="h-12 w-full bg-zinc-800/50 rounded-xl"></div>
                       <div className="h-12 w-full bg-zinc-800/50 rounded-xl"></div>
                    </div>
                 </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }} className="flex flex-col items-center">
                  
                  {/* Avatar Section */}
                  <div 
                    className="relative group cursor-pointer mb-6"
                    onClick={() => !uploading && fileInputRef.current?.click()}
                  >
                     <div className="h-24 w-24 rounded-full border-[4px] border-[#0B0F17] bg-slate-800 flex items-center justify-center overflow-hidden shadow-2xl relative z-10">
                        {uploading ? (
                            <LoaderCircle className="animate-spin text-emerald-500" />
                        ) : avatarUrl ? (
                          <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-3xl font-bold text-slate-400">{fullName?.[0]?.toUpperCase() || userEmail?.[0]?.toUpperCase() || 'U'}</span>
                        )}
                     </div>
                     <div className="absolute inset-0 border-[4px] border-transparent rounded-full flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
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
                    disabled={saveMutation.isPending || uploading}
                  >
                    {saveMutation.isPending ? <LoaderCircle className="animate-spin" /> : <div className="flex items-center gap-2"><Save size={18} /> Save Changes</div>}
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
