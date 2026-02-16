import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7"

// Declare Deno for TypeScript since we are in a Deno environment but might be missing types
declare const Deno: any;

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

  // Initialize Supabase Client
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    console.log("Starting sync-builds...");

    // 1. Get stuck builds (status 'queued' or 'building') that haven't updated in 15 mins
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    
    const { data: stuckBuilds, error } = await supabase
      .from('app_builds')
      .select('*')
      .in('status', ['queued', 'building'])
      .lt('updated_at', fifteenMinsAgo) // Check updated_at to allow progress updates
      .not('github_run_id', 'is', null)
      .limit(20); // Process in batches

    if (error) {
        console.error("Error fetching stuck builds:", error);
        throw error;
    }

    console.log(`Found ${stuckBuilds?.length || 0} stuck builds.`);
    const results = [];

    // 2. Loop and check GitHub API for each build
    for (const build of stuckBuilds || []) {
      const runId = build.github_run_id;
      
      try {
          const ghRes = await fetch(`https://api.github.com/repos/${githubRepo}/actions/runs/${runId}`, {
            headers: {
              'Authorization': `Bearer ${githubToken}`,
              'Accept': 'application/vnd.github+json',
              'User-Agent': 'Web2App-Sync-Bot'
            }
          });

          if (!ghRes.ok) {
            console.error(`GitHub API error for run ${runId}: ${ghRes.status}`);
            results.push({ id: build.id, status: 'error_fetching_github', http_code: ghRes.status });
            continue;
          }

          const runData = await ghRes.json();
          const ghStatus = runData.status; // 'queued', 'in_progress', 'completed'
          const ghConclusion = runData.conclusion; // 'success', 'failure', 'cancelled', 'timed_out', etc.

          console.log(`Build ${build.id} (Run ${runId}): GitHub Status=${ghStatus}, Conclusion=${ghConclusion}`);

          // 3. Sync Logic
          if (ghStatus === 'completed') {
            let newStatus = 'failed';
            let progress = 0;

            if (ghConclusion === 'success') {
                newStatus = 'ready';
                progress = 100;
            } else if (ghConclusion === 'cancelled') {
                newStatus = 'cancelled';
            }
            // else 'failure', 'timed_out', 'action_required' -> 'failed'

            // If successful but we missed the webhook, we might lack the download_url.
            // We can try to construct it or check if it exists. 
            // For now, we update the status so the UI stops spinning.
            
            const updatePayload: any = { 
                status: newStatus, 
                progress: progress,
                updated_at: new Date().toISOString()
            };

            await supabase
              .from('app_builds')
              .update(updatePayload)
              .eq('id', build.id);
            
            results.push({ id: build.id, old: build.status, new: newStatus });
          } else {
            // Still running or queued on GitHub. 
            // Just update 'updated_at' so we don't check it again immediately in the next run if we query by updated_at
            await supabase
                .from('app_builds')
                .update({ updated_at: new Date().toISOString() })
                .eq('id', build.id);
                
            results.push({ id: build.id, status: 'still_running_on_github', gh_status: ghStatus });
          }

      } catch (err) {
          console.error(`Exception processing build ${build.id}:`, err);
          results.push({ id: build.id, error: err.message });
      }
    }

    return new Response(JSON.stringify({ 
        success: true, 
        processed: stuckBuilds?.length, 
        results: results 
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