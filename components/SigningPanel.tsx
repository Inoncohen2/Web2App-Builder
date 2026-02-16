
import React, { useState, useEffect } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Tabs } from './ui/Tabs';
import { Lock, Upload, Key, ShieldCheck, LoaderCircle, Check, FileCheck, FileKey } from 'lucide-react';
import { supabase } from '../supabaseClient';

interface SigningPanelProps {
  appId: string;
  packageName: string;
  appName: string;
}

export const SigningPanel: React.FC<SigningPanelProps> = ({ appId, packageName, appName }) => {
  const [activeTab, setActiveTab] = useState('android');
  const [signingData, setSigningData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form States
  const [ksAlias, setKsAlias] = useState('my-key-alias');
  const [ksPass, setKsPass] = useState('');
  const [iosPass, setIosPass] = useState('');
  const [iosTeamId, setIosTeamId] = useState('');

  useEffect(() => {
    fetchSigningInfo();
    
    // Realtime subscription for updates (e.g., when generation completes)
    const channel = supabase.channel(`signing-${appId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'app_signing', filter: `app_id=eq.${appId}` }, 
        (payload) => {
           setSigningData(payload.new);
           setGenerating(false);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [appId]);

  const fetchSigningInfo = async () => {
    setLoading(true);
    const { data } = await supabase.from('app_signing').select('*').eq('app_id', appId).single();
    if (data) setSigningData(data);
    setLoading(false);
  };

  const handleGenerateKeystore = async () => {
    if (!confirm("Generate a new keystore? This will overwrite any existing Android keys.")) return;
    setGenerating(true);
    try {
      await fetch('/api/generate-keystore', {
        method: 'POST',
        body: JSON.stringify({ appId, packageName, appName })
      });
      // UI will update via realtime or poll
    } catch (e) {
      alert("Failed to trigger generation");
      setGenerating(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'android_keystore' | 'ios_cert' | 'ios_profile') => {
    if (!e.target.files?.[0]) return;
    setUploading(true);
    
    const formData = new FormData();
    formData.append('file', e.target.files[0]);
    formData.append('appId', appId);
    formData.append('type', type);
    
    if (type === 'android_keystore') {
       formData.append('alias', ksAlias);
       formData.append('password', ksPass);
       formData.append('keyPassword', ksPass); // Assume same for simplicity
    } else if (type === 'ios_cert') {
       formData.append('password', iosPass);
    } else if (type === 'ios_profile') {
       formData.append('teamId', iosTeamId);
    }

    try {
       const res = await fetch('/api/upload-keystore', { method: 'POST', body: formData });
       if (!res.ok) throw new Error("Upload failed");
       await fetchSigningInfo(); // Refresh
    } catch (err) {
       console.error(err);
       alert("Failed to upload file");
    } finally {
       setUploading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
      <div className="mb-6">
         <h2 className="text-2xl font-bold text-gray-900">App Signing</h2>
         <p className="text-sm text-gray-500">Manage cryptographic keys for App Store & Play Store.</p>
      </div>

      <Tabs 
        tabs={[{id: 'android', label: 'Android (Play Store)'}, {id: 'ios', label: 'iOS (App Store)'}]}
        activeTab={activeTab}
        onChange={setActiveTab}
        className="w-full mb-6"
      />

      {loading ? (
         <div className="flex items-center justify-center py-10"><LoaderCircle className="animate-spin text-emerald-500" /></div>
      ) : activeTab === 'android' ? (
        <div className="space-y-8 animate-in fade-in">
           {/* STATUS CARD */}
           <div className={`p-4 rounded-xl border ${signingData?.keystore_url ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center gap-3">
                 <div className={`p-2 rounded-full ${signingData?.keystore_url ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200 text-gray-500'}`}>
                    {signingData?.keystore_url ? <Check size={20} /> : <Lock size={20} />}
                 </div>
                 <div>
                    <h3 className="font-bold text-sm text-gray-900">
                       {signingData?.keystore_url ? 'Keystore Active' : 'No Keystore Configured'}
                    </h3>
                    <p className="text-xs text-gray-500">
                       {signingData?.keystore_url ? `Alias: ${signingData.keystore_alias || 'standard'}` : 'Required to build release APK/AAB'}
                    </p>
                 </div>
              </div>
           </div>

           {/* GENERATE OPTION */}
           <div className="space-y-3 pt-4 border-t border-gray-100">
              <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2"><Key size={16} /> Auto-Generate</h4>
              <p className="text-xs text-gray-500">Let us create a secure upload keystore for you. Best for new apps.</p>
              <Button 
                onClick={handleGenerateKeystore}
                disabled={generating}
                className="w-full bg-gray-900 hover:bg-black text-white"
              >
                 {generating ? <LoaderCircle className="animate-spin mr-2" size={16} /> : <ShieldCheck className="mr-2" size={16} />}
                 {generating ? 'Generating...' : 'Generate New Keystore'}
              </Button>
           </div>

           {/* UPLOAD OPTION */}
           <div className="space-y-4 pt-4 border-t border-gray-100">
              <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2"><Upload size={16} /> Upload Existing</h4>
              <div className="grid grid-cols-2 gap-3">
                 <Input label="Key Alias" value={ksAlias} onChange={e => setKsAlias(e.target.value)} placeholder="my-key-alias" className="text-xs" />
                 <Input label="Key Password" type="password" value={ksPass} onChange={e => setKsPass(e.target.value)} placeholder="******" className="text-xs" />
              </div>
              <div className="relative">
                 <input 
                   type="file" 
                   accept=".jks,.keystore" 
                   onChange={(e) => handleUpload(e, 'android_keystore')}
                   className="hidden" 
                   id="upload-ks"
                   disabled={uploading}
                 />
                 <label htmlFor="upload-ks" className="flex items-center justify-center gap-2 w-full h-10 px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer">
                    {uploading ? <LoaderCircle className="animate-spin" size={16} /> : <Upload size={16} />}
                    Upload .jks / .keystore
                 </label>
              </div>
           </div>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in">
           {/* iOS STATUS */}
           <div className="grid grid-cols-2 gap-4">
              <div className={`p-3 rounded-lg border flex flex-col items-center text-center gap-2 ${signingData?.ios_certificate_url ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200'}`}>
                 <FileKey size={24} className={signingData?.ios_certificate_url ? 'text-emerald-500' : 'text-gray-400'} />
                 <span className="text-xs font-bold">{signingData?.ios_certificate_url ? 'Cert Uploaded' : 'Missing Cert'}</span>
              </div>
              <div className={`p-3 rounded-lg border flex flex-col items-center text-center gap-2 ${signingData?.ios_provisioning_url ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-200'}`}>
                 <FileCheck size={24} className={signingData?.ios_provisioning_url ? 'text-emerald-500' : 'text-gray-400'} />
                 <span className="text-xs font-bold">{signingData?.ios_provisioning_url ? 'Profile Uploaded' : 'Missing Profile'}</span>
              </div>
           </div>

           {/* CERT UPLOAD */}
           <div className="space-y-3 pt-2">
              <Label className="text-xs font-bold">1. Apple Distribution Certificate (.p12)</Label>
              <Input type="password" placeholder="Certificate Password" value={iosPass} onChange={e => setIosPass(e.target.value)} className="mb-2 text-xs" />
              <div className="relative">
                 <input type="file" accept=".p12" onChange={(e) => handleUpload(e, 'ios_cert')} className="hidden" id="upload-p12" disabled={uploading} />
                 <label htmlFor="upload-p12" className="flex items-center justify-center gap-2 w-full h-9 bg-white border border-gray-300 rounded-md text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer">
                    <Upload size={14} /> Upload .p12
                 </label>
              </div>
           </div>

           {/* PROFILE UPLOAD */}
           <div className="space-y-3 pt-2 border-t border-gray-100">
              <Label className="text-xs font-bold">2. Provisioning Profile (.mobileprovision)</Label>
              <div className="relative">
                 <input type="file" accept=".mobileprovision" onChange={(e) => handleUpload(e, 'ios_profile')} className="hidden" id="upload-prov" disabled={uploading} />
                 <label htmlFor="upload-prov" className="flex items-center justify-center gap-2 w-full h-9 bg-white border border-gray-300 rounded-md text-xs font-bold text-gray-700 hover:bg-gray-50 cursor-pointer">
                    <Upload size={14} /> Upload Profile
                 </label>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
