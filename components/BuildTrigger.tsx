'use client';

import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Rocket, Loader2, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { triggerAppBuild } from '../app/actions/build';

interface BuildTriggerProps {
  initialAppName: string;
  supabaseId: string;
}

export const BuildTrigger: React.FC<BuildTriggerProps> = ({ initialAppName, supabaseId }) => {
  const [appName, setAppName] = useState(initialAppName);
  const [appSlug, setAppSlug] = useState(initialAppName.toLowerCase().replace(/\s+/g, '-'));
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleBuild = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResult(null);

    const response = await triggerAppBuild(appName, appSlug, supabaseId);

    if (response.success) {
      setResult({ type: 'success', message: '🚀 Build engine started! The APK will be ready in about 15 minutes.' });
    } else {
      setResult({ type: 'error', message: response.error || 'Failed to start build.' });
    }
    setIsLoading(false);
  };

  return (
    <div className="rounded-xl border border-indigo-100 bg-white p-6 shadow-sm overflow-hidden relative">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Rocket className="text-indigo-600" size={20} />
          <h3 className="text-lg font-semibold text-gray-900">App Factory</h3>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold text-indigo-600 uppercase tracking-tight">
          GitHub Actions Ready
        </div>
      </div>

      <form onSubmit={handleBuild} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="build-name">App Display Name</Label>
            <Input
              id="build-name"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              placeholder="e.g. My Shop App"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="build-slug">Android Package Slug</Label>
            <Input
              id="build-slug"
              value={appSlug}
              onChange={(e) => setAppSlug(e.target.value)}
              placeholder="my-shop-app"
              required
              className="font-mono text-xs"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading || !appName || !appSlug}
          className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-100 transition-all hover:scale-[1.01] active:scale-[0.98]"
        >
          {isLoading ? (
            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Transmitting to GitHub...</>
          ) : (
            <><Rocket className="mr-2 h-5 w-5" /> 🚀 Build APK Now</>
          )}
        </Button>

        {result && (
          <div className={`flex items-start gap-3 rounded-lg p-3 text-sm animate-in fade-in slide-in-from-top-2 ${
            result.type === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-100' 
              : 'bg-red-50 text-red-700 border border-red-100'
          }`}>
            {result.type === 'success' ? <CheckCircle2 size={18} className="shrink-0 mt-0.5" /> : <AlertCircle size={18} className="shrink-0 mt-0.5" />}
            <p className="font-medium">{result.message}</p>
          </div>
        )}

        <div className="flex items-start gap-2 text-[11px] text-gray-500 bg-gray-50 p-2 rounded">
          <Info size={14} className="shrink-0 text-gray-400 mt-0.5" />
          <p>The build process automates code injection, icon generation, and APK signing. You will receive an email once the download link is active.</p>
        </div>
      </form>
    </div>
  );
};