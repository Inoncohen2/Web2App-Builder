
'use client';

import React from 'react';
import { Download, Clock, FileCode, Smartphone, Package, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/Button';

interface BuildRecord {
  id: string;
  app_id: string;
  platform: 'android' | 'ios';
  build_format: 'apk' | 'aab' | 'ipa' | 'source' | 'ios_source';
  status: string;
  download_url: string | null;
  created_at: string;
}

interface BuildHistoryProps {
  builds: BuildRecord[];
  onDownload: (buildId: string) => void;
}

const FORMAT_LABELS: Record<string, { label: string; desc: string; icon: any }> = {
  apk: { label: 'Universal APK', desc: 'Android Device Install', icon: Smartphone },
  aab: { label: 'Android Bundle', desc: 'Google Play Store', icon: Package },
  source: { label: 'Android Source', desc: 'Java/Kotlin Code', icon: FileCode },
  ipa: { label: 'iOS IPA', desc: 'Apple Device Install', icon: Smartphone },
  ios_source: { label: 'iOS Source', desc: 'Xcode Project', icon: FileCode },
};

export const BuildHistory: React.FC<BuildHistoryProps> = ({ builds, onDownload }) => {
  // 1. Filter only ready builds
  const readyBuilds = builds.filter(b => b.status === 'ready' && b.download_url);

  // 2. Group by format and take the latest one for each format
  const latestArtifacts = ['apk', 'aab', 'ipa', 'source', 'ios_source'].map(format => {
    return readyBuilds.find(b => b.build_format === format);
  }).filter(Boolean) as BuildRecord[];

  if (latestArtifacts.length === 0) return null;

  return (
    <div className="w-full mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <CheckCircle2 className="text-emerald-500" size={20} />
        Ready for Download
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {latestArtifacts.map((build) => {
          const info = FORMAT_LABELS[build.build_format] || { label: build.build_format.toUpperCase(), desc: 'Build Artifact', icon: Package };
          const Icon = info.icon;
          const date = new Date(build.created_at).toLocaleDateString() + ' ' + new Date(build.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          return (
            <div key={build.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all flex items-center justify-between group">
              <div className="flex items-center gap-4">
                 <div className={`h-12 w-12 rounded-lg flex items-center justify-center border ${build.platform === 'android' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-gray-50 border-gray-100 text-gray-600'}`}>
                    <Icon size={24} />
                 </div>
                 <div>
                    <h4 className="font-bold text-gray-900">{info.label}</h4>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                       <span>{info.desc}</span>
                       <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                       <span className="flex items-center gap-1"><Clock size={10} /> {date}</span>
                    </div>
                 </div>
              </div>
              
              <Button 
                onClick={() => onDownload(build.id)} 
                variant="outline" 
                size="sm"
                className="border-gray-200 text-gray-700 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50"
              >
                <Download size={16} className="mr-2" /> Download
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
