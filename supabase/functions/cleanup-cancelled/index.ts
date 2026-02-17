
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"

// Declare Deno environment variables for TypeScript
declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  // Initialize Supabase Admin Client
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log("Starting cleanup of cancelled builds...");

    // Delete builds where status is 'cancelled'
    const { count, error } = await supabase
      .from('app_builds')
      .delete({ count: 'exact' })
      .eq('status', 'cancelled');

    if (error) {
        console.error("Error deleting builds:", error);
        throw error;
    }

    console.log(`Deleted ${count} cancelled builds.`);

    return new Response(JSON.stringify({ 
        success: true, 
        deleted_count: count 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
})
