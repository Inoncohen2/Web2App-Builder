
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';
import { useEffect } from 'react';

export const useBuilds = (appId: string) => {
  const queryClient = useQueryClient();
  const queryKey = ['builds', appId];

  const query = useQuery({
    queryKey: queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_builds')
        .select('*')
        .eq('app_id', appId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!appId,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes (display instantly)
    refetchOnWindowFocus: true, // Refetch in background when user returns
  });

  // Realtime Subscription setup within the hook
  useEffect(() => {
    if (!appId) return;

    const channel = supabase.channel(`builds-realtime-${appId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'app_builds', filter: `app_id=eq.${appId}` },
        (payload) => {
          // Immediately update cache locally for "Sync to the second" speed
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
          
          // Trigger a background refetch just to be safe
          queryClient.invalidateQueries({ queryKey });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [appId, queryClient, queryKey]);

  return query;
};
