
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export interface BuildRecord {
  id: string;
  status: 'queued' | 'building' | 'processing' | 'ready' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  download_url: string | null;
  build_message: string;
  created_at: string;
  build_type: 'apk' | 'aab' | 'source' | 'ios_ipa' | 'ios_source';
}

export const useBuildStatus = (appId: string, buildType: string) => {
  const [build, setBuild] = useState<BuildRecord | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLatestBuild = async () => {
    try {
      const { data, error } = await supabase
        .from('app_builds')
        .select('*')
        .eq('app_id', appId)
        .eq('build_type', buildType)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "Row not found"
        console.error(`Error fetching ${buildType} build:`, error);
      }

      if (data) {
        setBuild(data as BuildRecord);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestBuild();

    const channel = supabase.channel(`builds-${appId}-${buildType}`)
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'app_builds', 
          filter: `app_id=eq.${appId}` 
        },
        (payload) => {
          if (payload.new.build_type === buildType) {
            setBuild(payload.new as BuildRecord);
          }
        }
      )
      .on(
        'postgres_changes',
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'app_builds', 
          filter: `app_id=eq.${appId}` 
        },
        (payload) => {
          if (payload.new.build_type === buildType) {
            // Optimistically update if it's the current one being tracked or newer
            setBuild((prev) => {
                if (!prev) return payload.new as BuildRecord;
                // Only update if the incoming ID matches current, OR if it's a newer record
                if (prev.id === payload.new.id || new Date(payload.new.created_at) > new Date(prev.created_at)) {
                    return payload.new as BuildRecord;
                }
                return prev;
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [appId, buildType]);

  return { build, loading, refetch: fetchLatestBuild };
};
