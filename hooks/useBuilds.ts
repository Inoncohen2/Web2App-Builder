
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { useEffect } from 'react';

export const useBuilds = (appId: string) => {
  const queryClient = useQueryClient();
  const queryKey = ['builds', appId];

  const query = useQuery({
    queryKey: queryKey,
    queryFn: async () => {
      console.log('🏗️ Fetching Builds History...');
      const { data, error } = await supabase
        .from('app_builds')
        .select('*')
        .eq('app_id', appId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!appId,
    
    // SMART POLLING STRATEGY
    // Only poll efficiently if a build is actually active
    refetchInterval: (query) => {
        const data = query.state.data as any[];
        const hasActiveBuild = data?.some((build: any) => 
            build.status === 'queued' || build.status === 'building'
        );
        return hasActiveBuild ? 3000 : false; // Poll every 3s only if building
    },

    // CACHING STRATEGY
    staleTime: 1000 * 60 * 2, // Cache for 2 minutes (Realtime handles updates)
    refetchOnMount: 'always', // Always check for updates in background, but show cache first
  });

  // REALTIME SUBSCRIPTION
  // This pushes updates instantly, so we don't need to rely solely on fetching
  useEffect(() => {
    if (!appId) return;

    const channel = supabase.channel(`builds-realtime-${appId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'app_builds', filter: `app_id=eq.${appId}` },
        (payload) => {
          // Optimistic Update: Update the cache immediately without waiting for refetch
          queryClient.setQueryData(queryKey, (oldData: any[]) => {
            if (!oldData) return [];
            
            if (payload.eventType === 'INSERT') {
              return [payload.new, ...oldData];
            } else if (payload.eventType === 'UPDATE') {
              return oldData.map(item => item.id === payload.new.id ? payload.new : item);
            } else if (payload.eventType === 'DELETE') {
              return oldData.filter(item => item.id !== payload.old.id);
            }
            return oldData;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [appId, queryClient]);

  return query;
};
