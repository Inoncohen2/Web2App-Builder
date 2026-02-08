
'use client';

import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Rocket, Loader2, CheckCircle2, AlertCircle, Info, Sparkles, Settings2, ChevronDown, ChevronUp } from 'lucide-react';
import { triggerAppBuild } from '../app/actions/build';

interface BuildTriggerProps {
  initialAppName: string;
  supabaseId: string;
}

export const BuildTrigger: React.FC<BuildTriggerProps> = ({ initialAppName, supabaseId }) => {
  const [appName, setAppName] = useState(initialAppName);
  
  // Initialize slug based on initial name
  const [appSlug, setAppSlug] = useState(() => {
    return initialAppName.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim().split(/\s+/).slice(0, 3).join('_');
  });

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);

  // Helper to generate a valid slug from any text
  const generateSlug = (text: string) => {
    // 1. Remove anything that isn't English letter, number, or space
    const englishOnly = text.replace(/[^a-zA-Z0-9\s]/g, '');
    
    // 2. Split into words, filter empty
    const words = englishOnly.trim().split(/\s+/).filter(w => w.length > 0);
    
    // 3. Take max 3 words, join with underscore, lowercase
    return words.slice(0, 3).join('_').toLowerCase();
  };

  const handleAppNameChange = (val: string) => {
    setAppName(val);
    
    // Auto-update slug only if user hasn't manually touched the slug field
    if (!isSlugManuallyEdited) {
      const newSlug = generateSlug(val);
      // Only update if we actually managed to extract English characters
      if (newSlug.length > 0) {
        setAppSlug(newSlug);
      }
    }
  };

  const handleSlugChange = (val: string) => {
    setIsSlugManuallyEdited(true);
    // Enforce valid slug format (lowercase, numbers, underscores only)
    const sanitized = val.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setAppSlug(sanitized);
  };

  const handleBuild = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!appSlug || appSlug.length < 2) {
      setResult({ type: 'error', message: 'Package ID is too short. Please check Advanced Options.' });
      setShowAdvanced(true);
      return;
    }

    setIsLoading(true);
    setResult(null);

    // Provide default or empty strings for targetUrl/iconUrl since this component doesn't manage them
    const response = await triggerAppBuild(
        appName, 
        appSlug, 
        supabaseId, 
        '', 
        null,
        {
          primaryColor: '#000000',
          themeMode: 'system',
          showNavBar: true,
          enablePullToRefresh: true,
          orientation: 'auto',
          enableZoom: false,
          keepAwake: false,
          openExternalLinks: true
        }
    );

    if (response.success) {
      setResult({ type: 'success', message: 'Build initiated successfully! You will be notified when ready.' });
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
          <h3 className="text-lg font-semibold text-gray-900">Release Management</h3>
        </div>
      </div>

      <form onSubmit={handleBuild} className="space-y-4">
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="build-name">App Display Name</Label>
            <Input
              id="build-name"
              value={appName}
              onChange={(e) => handleAppNameChange(e.target.value)}
              placeholder="e.g. My Shop App"
              required
            />
            <p className="text-[10px] text-gray-400">
              This name will appear on the user's home screen. Hebrew/Local languages allowed.
            </p>
          </div>

          {/* Toggle for Advanced Options */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              <Settings2 size={12} />
              {showAdvanced ? 'Hide Advanced Options' : 'Customize Package ID'}
              {showAdvanced ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          </div>

          {/* Collapsible Slug Input */}
          {showAdvanced && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-1 bg-gray-50 p-3 rounded-lg border border-gray-100">
               <Label htmlFor="build-slug" className="text-xs text-gray-600">Internal Package ID (Slug)</Label>
               <div className="flex items-center gap-2">
                 <span className="text-xs font-mono text-gray-400 select-none">com.app.</span>
                 <Input
                    id="build-slug"
                    value={appSlug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    placeholder="my_app_name"
                    className="font-mono text-xs h-8 bg-white"
                    required
                  />
               </div>
               <p className="text-[10px] text-gray-400">
                 English letters, numbers, and underscores only. Max 3 words recommended.
               </p>
            </div>
          )}
        </div>

        <Button
          type="submit"
          disabled={isLoading || !appName || !appSlug}
          className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-100 transition-all hover:scale-[1.01] active:scale-[0.98]"
        >
          {isLoading ? (
            <div className="flex items-center">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Starting Build Engine...
            </div>
          ) : (
            <div className="flex items-center">
              <Rocket className="mr-2 h-5 w-5" /> Generate App Package
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
          <Sparkles size={14} className="shrink-0 text-indigo-400 mt-0.5" />
          <p>We are compiling your app on our secure cloud servers. This process typically takes about 15 minutes. You can safely close this page.</p>
        </div>
      </form>
    </div>
  );
};
