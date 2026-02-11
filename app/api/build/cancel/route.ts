
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { appId } = body;

    if (!appId) {
      return NextResponse.json({ error: 'Missing appId' }, { status: 400 });
    }

    // 1. Initialize Supabase Admin
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_KEY);

    // 2. Fetch the app to get the github_run_id
    const { data: appData, error: fetchError } = await supabaseAdmin
      .from('apps')
      .select('github_run_id')
      .eq('id', appId)
      .single();

    if (fetchError || !appData) {
      return NextResponse.json({ error: 'App not found' }, { status: 404 });
    }

    const githubRunId = appData.github_run_id;

    // 3. Cancel on GitHub (only if we have a run ID)
    if (githubRunId) {
      const GITHUB_TOKEN = process.env.GITHUB_TOKEN!;
      const GITHUB_REPO = process.env.GITHUB_REPO!;

      const githubResponse = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/actions/runs/${githubRunId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      // We don't throw an error if GitHub fails (e.g., run already finished), 
      // but we log it. We still want to reset the DB status.
      if (!githubResponse.ok) {
        console.warn(`GitHub cancel failed for run ${githubRunId}:`, await githubResponse.text());
      }
    }

    // 4. Update Supabase Status to 'cancelled' (or 'idle' so they can try again)
    const { error: updateError } = await supabaseAdmin
      .from('apps')
      .update({ status: 'cancelled' })
      .eq('id', appId);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update database status' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Build cancelled successfully' });

  } catch (error: any) {
    console.error('Cancel API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
