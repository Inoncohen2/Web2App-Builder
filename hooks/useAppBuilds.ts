
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { AppBuild, BuildType } from '../types';

interface UseAppBuildsReturn {
  androidAppBuild: AppBuild | null;
  androidSourceBuild: AppBuild | null;
  iosAppBuild: AppBuild | null;
  loading: boolean;
}

export const useAppBuilds = (appId: string | null): UseAppBuildsReturn => {
  const [builds, setBuilds] = useState<AppBuild[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper to extract latest by type
  const getLatest = (type: BuildType) => builds.find(b => b.build_type === type) || null;

  useEffect(() => {
    if (!appId) return;

    const fetchBuilds = async () => {
      setLoading(true);
      // Fetch the latest build for each type
      // We fetch all recent builds and filter in JS for simplicity, or we could do a complex query
      const { data, error } = await supabase
        .from('app_builds')
        .select('*')
        .eq('app_id', appId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (!error && data) {
         setBuilds(data as AppBuild[]);
      }
      setLoading(false);
    };

    fetchBuilds();

    // Subscribe to new builds or updates
    const channel = supabase.channel(`builds-${appId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'app_builds', filter: `app_id=eq.${appId}` },
        (payload) => {
           if (payload.eventType === 'INSERT') {
               setBuilds(prev => [payload.new as AppBuild, ...prev]);
           } else if (payload.eventType === 'UPDATE') {
               setBuilds(prev => prev.map(b => b.id === payload.new.id ? payload.new as AppBuild : b));
           }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [appId]);

  return {
    androidAppBuild: getLatest('android_app'),
    androidSourceBuild: getLatest('android_source'),
    iosAppBuild: getLatest('ios_app'), // Placeholder for future
    loading
  };
};
