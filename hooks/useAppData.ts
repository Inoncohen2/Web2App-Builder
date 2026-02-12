
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabaseClient';

export const useAppData = (appId: string | null, initialData: any = null) => {
  return useQuery({
    queryKey: ['app', appId],
    queryFn: async () => {
      if (!appId) return null;
      const { data, error } = await supabase
        .from('apps')
        .select('*')
        .eq('id', appId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!appId,
    initialData: initialData, // Use server-provided data immediately
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    refetchOnWindowFocus: true, 
  });
};

export const useInvalidateApp = () => {
  const queryClient = useQueryClient();
  return (appId: string) => {
    queryClient.invalidateQueries({ queryKey: ['app', appId] });
  };
};
