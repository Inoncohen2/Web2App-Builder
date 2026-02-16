
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
  addBuild: (build: AppBuild) => void;
}

export const useAppBuilds = (appId: string | null): UseAppBuildsReturn => {
  const [builds, setBuilds] = useState<AppBuild[]>([]);
  
  // Optimistic State Management
  const [pinnedBuilds, setPinnedBuilds] = useState<Record<string, AppBuild>>({}); 
  const [activeBuildIds, setActiveBuildIds] = useState<Record<string, string>>({});
  
  const [loading, setLoading] = useState(true);

  // Helper to ensure the list is always sorted by newest first
  const sortBuilds = (list: AppBuild[]) => {
    return [...list].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  };

  // Selector Logic: Prioritizes Active User Builds
  const getLatest = (type: BuildType) => {
    const lockedId = activeBuildIds[type];
    const pinned = pinnedBuilds[type];

    // 1. If the user just started a build, we LOCK onto that ID
    if (lockedId) {
        // Try to find the live record from server/realtime
        const serverBuild = builds.find(b => b.id === lockedId);
        
        // If we have the live record, use it (it contains progress updates)
        if (serverBuild) return serverBuild;
        
        // If live record is missing (race condition/lag), stick to the optimistic one
        // This ensures the UI never flickers to "Idle"
        if (pinned && pinned.id === lockedId) return pinned;
    }

    // 2. Standard Behavior: Show latest from DB
    return builds.find(b => b.build_type === type) || null;
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

  // Public Action: Start tracking a new build
  const addBuild = useCallback((newBuild: AppBuild) => {
    // Lock this track to this specific build ID
    setActiveBuildIds(prev => ({...prev, [newBuild.build_type]: newBuild.id}));
    // Store optimistic data
    setPinnedBuilds(prev => ({...prev, [newBuild.build_type]: newBuild}));
    // Optimistically update main list
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
           } else if (payload.eventType === 'UPDATE') {
               const updatedRecord = payload.new as AppBuild;
               setBuilds(prev => {
                   const updatedList = prev.map(b => b.id === updatedRecord.id ? updatedRecord : b);
                   if (!updatedList.find(b => b.id === updatedRecord.id)) {
                       updatedList.push(updatedRecord);
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
    refetch: fetchBuilds,
    addBuild
  };
};
