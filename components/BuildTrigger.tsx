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
  const [appSlug, setAppSlug] = useState(initialAppName.toLowerCase().trim().replace(/\s+/g, '_'));
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleAppNameChange = (val: string) => {
    setValidationError(null);

    // 1. English Characters Only Check (Allow A-Z, a-z, 0-9, spaces)
    const englishRegex = /^[a-zA-Z0-9\s]*$/;
    if (!englishRegex.test(val)) {
      setValidationError("Please use English characters only.");
      return; 
    }

    // 2. Word Count Check (Max 3 words)
    const words = val.trim().split(/\s+/);
    
    // Prevent adding a 4th word (block space after 3rd word)
    if (words.length > 3 || (words.length === 3 && val.endsWith(' '))) {
       if (words.length > 3) {
          setValidationError("Maximum 3 words allowed.");
          return;
       }
    }

    setAppName(val);
    
    // Auto-generate slug from the valid name (spaces to underscores)
    if (val.trim()) {
        setAppSlug(val.toLowerCase().trim().replace(/\s+/g, '_'));
    }
  };

  const handleSlugChange = (val: string) => {
    // Smart filter for Slug:
    // 1. Convert to lowercase
    // 2. Replace spaces with underscores
    // 3. Allow only a-z, 0-9, and _
    const formatted = val.toLowerCase().replace(/\s+/g, '_');
    const validSlugRegex = /^[a-z0-9_]*$/;

    if (validSlugRegex.test(formatted)) {
      setAppSlug(formatted);
    }
  };

  const handleBuild = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Final validation before submit
    const words = appName.trim().split(/\s+/);
    if (words.length > 3) {
        setResult({ type: 'error', message: 'App name must be 3 words or less.' });
        return;
    }

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
              onChange={(e) => handleAppNameChange(e.target.value)}
              placeholder="e.g. My Shop App"
              required
              className={validationError ? "border-red-300 focus-visible:ring-red-200" : ""}
            />
            {validationError && (
              <p className="text-xs text-red-500 font-medium">{validationError}</p>
            )}
            <p className="text-[10px] text-gray-400">English only, max 3 words.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="build-slug">Android Package Slug</Label>
            <Input
              id="build-slug"
              value={appSlug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="my_shop_app"
              required
              className="font-mono text-xs bg-gray-50 text-gray-600"
            />
             <p className="text-[10px] text-gray-400">Lowercase English & underscores only.</p>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading || !appName || !appSlug || !!validationError}
          className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-100 transition-all hover:scale-[1.01] active:scale-[0.98]"
        >
          {isLoading ? (
            <div className="flex items-center">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Transmitting to GitHub...
            </div>
          ) : (
            <div className="flex items-center">
              <Rocket className="mr-2 h-5 w-5" /> 🚀 Build APK Now
            </div>
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