
'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, AlertTriangle, Download, RefreshCw, XCircle } from 'lucide-react';
import { Button } from './ui/Button';

interface BuildMonitorProps {
  runId: number | string;
  onComplete: (success: boolean) => void;
  downloadUrl?: string | null;
  onRetry: () => void;
}

type BuildStatus = 'queued' | 'in_progress' | 'completed';
type BuildConclusion = 'success' | 'failure' | 'cancelled' | 'timed_out' | 'skipped' | null;

export const BuildMonitor: React.FC<BuildMonitorProps> = ({ runId, onComplete, downloadUrl, onRetry }) => {
  const [status, setStatus] = useState<BuildStatus>('queued');
  const [conclusion, setConclusion] = useState<BuildConclusion>(null);
  const [progress, setProgress] = useState(10);
  const [message, setMessage] = useState('מאתחל תהליך בנייה...'); // Initializing build process

  // Messages in Hebrew
  const messages = [
    "מחממים מנועים...",          // Warming up engines
    "מרכיבים את הפיקסלים...",    // Assembling pixels
    "אורזים את הקוד...",         // Packing the code
    "חותמים על הקבצים...",       // Signing files
    "כמעט מוכן...",              // Almost ready
  ];

  // Poll status
  useEffect(() => {
    let isMounted = true;
    const interval = setInterval(async () => {
      if (status === 'completed') {
        clearInterval(interval);
        return;
      }

      try {
        const res = await fetch(`/api/build/status?runId=${runId}`);
        if (!res.ok) return;
        
        const data = await res.json();
        
        if (isMounted) {
          if (data.status === 'completed') {
            setStatus('completed');
            setConclusion(data.conclusion);
            setProgress(100);
            if (data.conclusion === 'success') {
                onComplete(true);
                setMessage('הבנייה הושלמה בהצלחה!');
            } else {
                onComplete(false);
                setMessage('שגיאה בתהליך הבנייה.');
            }
          } else if (data.status === 'in_progress') {
            setStatus('in_progress');
          } else {
             setStatus('queued');
          }
        }
      } catch (e) {
        console.error('Polling error', e);
      }
    }, 4000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [runId, status, onComplete]);

  // Artificial Progress
  useEffect(() => {
    if (status === 'completed') return;

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        // Queue phase
        if (status === 'queued') return Math.min(prev + 1, 15);
        
        // In Progress phase
        // Slow down as we approach 90%
        if (prev >= 90) return 90;
        return prev + (Math.random() * 2);
      });

      // Cycle messages
      if (status === 'in_progress' && Math.random() > 0.8) {
         const randomMsg = messages[Math.floor(Math.random() * messages.length)];
         setMessage(randomMsg);
      }
    }, 1000);

    return () => clearInterval(progressInterval);
  }, [status]);

  // Render Logic
  const isSuccess = status === 'completed' && conclusion === 'success';
  const isFailed = status === 'completed' && conclusion !== 'success';

  return (
    <div className="w-full max-w-md mx-auto animate-in fade-in zoom-in duration-300">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden relative">
        {/* Background Gradient */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

        <div className="p-8 text-center">
          
          {/* Status Icon */}
          <div className="flex justify-center mb-6">
            {status === 'queued' && (
               <div className="relative">
                 <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center">
                    <Loader2 className="text-gray-400 animate-spin" size={40} />
                 </div>
                 <div className="absolute bottom-0 right-0 bg-yellow-400 h-6 w-6 rounded-full border-2 border-white"></div>
               </div>
            )}
            
            {status === 'in_progress' && (
               <div className="relative">
                 <div className="h-20 w-20 rounded-full bg-indigo-50 flex items-center justify-center">
                    <RefreshCw className="text-indigo-600 animate-spin" size={40} />
                 </div>
                 <div className="absolute bottom-0 right-0 bg-blue-500 h-6 w-6 rounded-full border-2 border-white animate-pulse"></div>
               </div>
            )}

            {isSuccess && (
               <div className="relative">
                 <div className="h-24 w-24 rounded-full bg-green-50 flex items-center justify-center shadow-lg shadow-green-500/20">
                    <CheckCircle2 className="text-green-500" size={50} />
                 </div>
               </div>
            )}

            {isFailed && (
               <div className="relative">
                 <div className="h-20 w-20 rounded-full bg-red-50 flex items-center justify-center">
                    <XCircle className="text-red-500" size={40} />
                 </div>
               </div>
            )}
          </div>

          {/* Texts (Hebrew) */}
          <h3 className="text-2xl font-bold text-gray-900 mb-2" dir="rtl">
            {isSuccess ? 'האפליקציה מוכנה!' : isFailed ? 'הבנייה נכשלה' : status === 'queued' ? 'ממתין לתור...' : 'הבנייה בעיצומה'}
          </h3>
          
          <p className="text-gray-500 text-sm mb-8 min-h-[20px]" dir="rtl">
            {isFailed ? 'אנא נסה שוב או פנה לתמיכה.' : message}
          </p>

          {/* Progress Bar */}
          {!isSuccess && !isFailed && (
            <div className="relative h-3 w-full bg-gray-100 rounded-full overflow-hidden mb-6">
               <div 
                 className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 ease-out rounded-full"
                 style={{ width: `${progress}%` }}
               ></div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {isSuccess && (
              <Button 
                onClick={() => downloadUrl ? window.location.href = downloadUrl : alert('Download link processing...')}
                disabled={!downloadUrl}
                className="w-full h-14 bg-black hover:bg-gray-800 text-white font-bold rounded-2xl shadow-xl flex items-center justify-center gap-3 text-lg transition-transform hover:-translate-y-1"
              >
                 <Download size={20} />
                 {downloadUrl ? 'הורד את האפליקציה (ZIP)' : 'מכין קישור...'}
              </Button>
            )}

            {isFailed && (
              <Button 
                onClick={onRetry}
                variant="outline"
                className="w-full h-12 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-bold rounded-xl"
              >
                 <RefreshCw size={18} className="mr-2" /> נסה שוב
              </Button>
            )}
          </div>

        </div>
        
        {/* Footer Info */}
        {!isSuccess && !isFailed && (
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-center gap-2 text-xs text-gray-400">
             <Loader2 size={12} className="animate-spin" />
             <span>מערכת Build Engine V2.0</span>
          </div>
        )}
      </div>
    </div>
  );
};
