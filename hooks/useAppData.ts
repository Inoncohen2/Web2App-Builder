
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';

export const useAppData = (appId: string | null, initialData: any = null) => {
  return useQuery({
    queryKey: ['app', appId],
    queryFn: async () => {
      if (!appId) return null;
      
      console.log('🔄 Fetching App Data from Server...');
      const { data, error } = await supabase
        .from('apps')
        .select('*')
        .eq('id', appId)
        .single();
      
      if (error) throw error;
      return data;
    },
    // SERVER DATA HYDRATION
    // If we have initialData (from server components), use it immediately.
    initialData: initialData,
    
    // CACHING STRATEGY (The SPA Feel)
    // 1. Consider data fresh for 5 minutes (won't refetch on component mount within this time)
    staleTime: 1000 * 60 * 5, 
    
    // 2. Keep unused data in garbage collection for 30 minutes
    gcTime: 1000 * 60 * 30,   
    
    enabled: !!appId,
    refetchOnWindowFocus: false, // Don't refetch just because user clicked alt-tab
    refetchOnMount: false,       // Use cache if available
  });
};

export const useInvalidateApp = () => {
  const queryClient = useQueryClient();
  return (appId: string) => {
    // When saving, we mark data as stale so next fetch gets new data
    queryClient.invalidateQueries({ queryKey: ['app', appId] });
  };
};
