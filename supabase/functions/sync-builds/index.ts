import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const githubToken = Deno.env.get('GITHUB_TOKEN')!;
  const githubRepo = Deno.env.get('GITHUB_REPO')!;

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // 1. Get stuck builds (building/queued) older than 15 mins
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    
    const { data: stuckBuilds, error } = await supabase
      .from('app_builds')
      .select('*')
      .in('status', ['queued', 'building'])
      .lt('created_at', fifteenMinsAgo)
      .not('github_run_id', 'is', null);

    if (error) throw error;

    const results = [];

    // 2. Loop and check GitHub
    for (const build of stuckBuilds || []) {
      const runId = build.github_run_id;
      
      const ghRes = await fetch(`https://api.github.com/repos/${githubRepo}/actions/runs/${runId}`, {
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github+json',
          'User-Agent': 'Web2App-Sync-Bot'
        }
      });

      if (!ghRes.ok) {
        results.push({ id: build.id, status: 'error_fetching_github' });
        continue;
      }

      const runData = await ghRes.json();
      const ghStatus = runData.status; // queued, in_progress, completed
      const ghConclusion = runData.conclusion; // success, failure, cancelled, etc.

      // 3. Sync Logic
      if (ghStatus === 'completed') {
        let newStatus = 'failed';
        if (ghConclusion === 'success') newStatus = 'ready';
        else if (ghConclusion === 'cancelled') newStatus = 'cancelled';

        // Attempt to get artifact URL if success
        let downloadUrl = build.download_url;
        if (newStatus === 'ready' && !downloadUrl) {
           // Logic to fetch artifacts would go here, but usually the action uploads it via webhook. 
           // If webhook failed, we might miss the URL. 
           // For now, we just mark it ready so it stops spinning.
           // Ideally, we might set it to 'failed' if no URL, but let's be lenient.
        }

        await supabase
          .from('app_builds')
          .update({ 
            status: newStatus, 
            progress: newStatus === 'ready' ? 100 : 0,
            updated_at: new Date().toISOString()
          })
          .eq('id', build.id);
        
        results.push({ id: build.id, old: build.status, new: newStatus });
      } else {
        results.push({ id: build.id, status: 'still_running_on_github' });
      }
    }

    return new Response(JSON.stringify({ processed: stuckBuilds?.length, details: results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
})