'use client';

import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Rocket, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import axios from 'axios';

interface BuildTriggerProps {
  initialAppName: string;
  supabaseId: string;
}

export const BuildTrigger: React.FC<BuildTriggerProps> = ({ initialAppName, supabaseId }) => {
  const [appName, setAppName] = useState(initialAppName);
  const [appSlug, setAppSlug] = useState(initialAppName.toLowerCase().replace(/\s+/g, '-'));
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const triggerAppBuild = async () => {
    setLoading(true);
    setStatus('idle');
    setMessage('');

    try {
      const response = await axios.post('/api/build', {
        appName,
        appSlug,
        supabaseId,
      });

      if (response.data.success) {
        setStatus('success');
        setMessage('Build process started! Check your email in ~15 mins.');
      }
    } catch (error: any) {
      setStatus('error');
      setMessage(error.response?.data?.error || 'Failed to start build process.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-indigo-100 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <Rocket className="text-indigo-600" size={20} />
        <h3 className="text-lg font-semibold text-gray-900">Request New Build</h3>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="build-name">App Name</Label>
            <Input
              id="build-name"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              placeholder="App Display Name"
              className="bg-gray-50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="build-slug">App Slug (ID)</Label>
            <Input
              id="build-slug"
              value={appSlug}
              onChange={(e) => setAppSlug(e.target.value)}
              placeholder="my-awesome-app"
              className="bg-gray-50 font-mono text-xs"
            />
          </div>
        </div>

        <Button
          onClick={triggerAppBuild}
          disabled={loading || !appName || !appSlug}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-12 shadow-md transition-all active:scale-[0.98]"
        >
          {loading ? (
            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Starting Build Engine...</>
          ) : (
            <><Rocket className="mr-2 h-5 w-5" /> 🚀 Build APK Now</>
          )}
        </Button>

        {status === 'success' && (
          <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700 border border-green-100 animate-in fade-in zoom-in-95">
            <CheckCircle2 size={16} className="shrink-0" />
            <p>{message}</p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700 border border-red-100 animate-in shake">
            <AlertCircle size={16} className="shrink-0" />
            <p>{message}</p>
          </div>
        )}

        <p className="text-[10px] text-center text-gray-400 uppercase tracking-widest">
          Powered by GitHub Actions App Factory
        </p>
      </div>
    </div>
  );
};