
import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { AppBuild, BuildType } from '../types';

interface UseAppBuildsReturn {
  androidAppBuild: AppBuild | null;
  androidSourceBuild: AppBuild | null;
  iosAppBuild: AppBuild | null;
  iosSourceBuild: AppBuild | null;
  loading: boolean;
  refetch: () => Promise<void>;
  addBuild: (build: AppBuild) => void;
}

export const useAppBuilds = (appId: string | null): UseAppBuildsReturn => {
  const [builds, setBuilds] = useState<AppBuild[]>([]);
  // We keep a separate track of "pinned" builds that the user just created.
  // This prevents the UI from flickering back to an old build if the server fetch is slightly delayed.
  const [pinnedBuilds, setPinnedBuilds] = useState<Record<string, AppBuild>>({}); 
  const [loading, setLoading] = useState(true);

  // Helper to ensure the list is always sorted by newest first
  const sortBuilds = (list: AppBuild[]) => {
    return [...list].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  };

  // Helper to extract latest by type, prioritizing the pinned build if it's newer
  const getLatest = (type: BuildType) => {
    const serverLatest = builds.find(b => b.build_type === type) || null;
    const pinned = pinnedBuilds[type];

    if (pinned) {
        // If we have a pinned build, use it unless the server has a NEWER version of the SAME build ID
        // or a completely newer build.
        if (!serverLatest) return pinned;
        
        // If server returned the same build but updated (e.g. status changed), use server
        if (serverLatest.id === pinned.id) return serverLatest;

        // If server build is actually newer than pinned, use server
        if (new Date(serverLatest.created_at).getTime() > new Date(pinned.created_at).getTime()) {
            return serverLatest;
        }
        
        // Otherwise keep showing pinned (optimistic)
        return pinned;
    }
    
    return serverLatest;
  };

  const fetchBuilds = useCallback(async () => {
    if (!appId) return;
    
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

  // Manually add a build to state (Optimistic Update)
  const addBuild = useCallback((newBuild: AppBuild) => {
    // 1. Add to pinned map to ensure visibility
    setPinnedBuilds(prev => ({
        ...prev,
        [newBuild.build_type]: newBuild
    }));
    
    // 2. Also add to main list for consistency
    setBuilds(prev => sortBuilds([newBuild, ...prev]));
  }, []);

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
               const newRecord = payload.new as AppBuild;
               setBuilds(prev => sortBuilds([newRecord, ...prev]));
               
               // If this inserted record matches a pinned one, we can clear the pin 
               // (optional, but keeping it pinned is safer until next refresh)
           } else if (payload.eventType === 'UPDATE') {
               const updatedRecord = payload.new as AppBuild;
               
               // Update main list
               setBuilds(prev => {
                   const updatedList = prev.map(b => b.id === updatedRecord.id ? updatedRecord : b);
                   if (!updatedList.find(b => b.id === updatedRecord.id)) {
                       updatedList.push(updatedRecord);
                   }
                   return sortBuilds(updatedList);
               });

               // Also update pinned if it matches, so we see the progress!
               setPinnedBuilds(prev => {
                   const currentPinned = prev[updatedRecord.build_type];
                   if (currentPinned && currentPinned.id === updatedRecord.id) {
                       return { ...prev, [updatedRecord.build_type]: updatedRecord };
                   }
                   return prev;
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
    refetch: fetchBuilds,
    addBuild
  };
};
