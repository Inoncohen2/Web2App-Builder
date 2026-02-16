
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { AppBuild, BuildType } from '../types';

interface UseAppBuildsReturn {
  androidAppBuild: AppBuild | null;
  androidSourceBuild: AppBuild | null;
  iosAppBuild: AppBuild | null;
  iosSourceBuild: AppBuild | null;
  loading: boolean;
  refetch: () => Promise<void>;
}

export const useAppBuilds = (appId: string | null): UseAppBuildsReturn => {
  const [builds, setBuilds] = useState<AppBuild[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper to ensure the list is always sorted by newest first
  const sortBuilds = (list: AppBuild[]) => {
    return [...list].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  };

  // Helper to extract latest by type
  const getLatest = (type: BuildType) => builds.find(b => b.build_type === type) || null;

  const fetchBuilds = useCallback(async () => {
    if (!appId) return;
    
    // Fetch the latest build for each type
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
  }, [appId]);

  useEffect(() => {
    if (!appId) return;

    fetchBuilds();

    // Subscribe to new builds or updates
    const channel = supabase.channel(`builds-${appId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'app_builds', filter: `app_id=eq.${appId}` },
        (payload) => {
           if (payload.eventType === 'INSERT') {
               setBuilds(prev => sortBuilds([payload.new as AppBuild, ...prev]));
           } else if (payload.eventType === 'UPDATE') {
               setBuilds(prev => {
                   const updatedList = prev.map(b => b.id === payload.new.id ? payload.new as AppBuild : b);
                   // If the updated item wasn't in the list (rare, but possible if list was truncated), add it
                   if (!updatedList.find(b => b.id === payload.new.id)) {
                       updatedList.push(payload.new as AppBuild);
                   }
                   return sortBuilds(updatedList);
               });
           }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [appId, fetchBuilds]);

  return {
    androidAppBuild: getLatest('android_app'),
    androidSourceBuild: getLatest('android_source'),
    iosAppBuild: getLatest('ios_app'), 
    iosSourceBuild: getLatest('ios_source'),
    loading,
    refetch: fetchBuilds
  };
};
