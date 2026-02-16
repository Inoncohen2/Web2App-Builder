
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { buildId } = body; // Changed from appId to buildId

    if (!buildId) {
      return NextResponse.json({ error: 'Missing buildId' }, { status: 400 });
    }

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_KEY);

    // Fetch the build to get the github_run_id
    const { data: buildData, error: fetchError } = await supabaseAdmin
      .from('app_builds')
      .select('github_run_id')
      .eq('id', buildId)
      .single();

    if (fetchError || !buildData) {
      return NextResponse.json({ error: 'Build not found' }, { status: 404 });
    }

    const githubRunId = buildData.github_run_id;

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

      if (!githubResponse.ok) {
        console.warn(`GitHub cancel failed for run ${githubRunId}:`, await githubResponse.text());
      }
    }

    // Update status to cancelled
    const { error: updateError } = await supabaseAdmin
      .from('app_builds')
      .update({ status: 'cancelled' })
      .eq('id', buildId);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update database status' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Build cancelled successfully' });

  } catch (error: any) {
    console.error('Cancel API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
