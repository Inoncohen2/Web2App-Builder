
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { appName, websiteUrl, iconUrl, userId } = body;

    // 1. Validate Request Input
    if (!appName || !websiteUrl || !userId) {
      return NextResponse.json({ error: 'Missing required parameters: appName, websiteUrl, and userId are required.' }, { status: 400 });
    }

    // 2. Validate Environment Variables
    const requiredEnvVars = [
      'GITHUB_TOKEN',
      'GITHUB_OWNER', 
      'GITHUB_REPO',
      'NEXT_PUBLIC_SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY'
    ];

    const missingVars = requiredEnvVars.filter(key => !process.env[key]);

    if (missingVars.length > 0) {
      const errorMsg = `Missing environment variable: ${missingVars.join(', ')}`;
      console.error(`CRITICAL: ${errorMsg}`);
      return NextResponse.json({ error: errorMsg }, { status: 500 });
    }

    // Extract validated env vars
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN!;
    const GITHUB_OWNER = process.env.GITHUB_OWNER!;
    const GITHUB_REPO = process.env.GITHUB_REPO!;
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    // 3. Generate unique packageId (format: com.client.[clean_name]_[random])
    const cleanName = appName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, '') 
      .slice(0, 30);
    
    const packageId = `com.client.${cleanName || 'app'}_${Math.random().toString(36).substring(7)}`;

    // 4. Database Sync (Supabase Admin)
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_KEY);

    // Insert the new app configuration
    const { data: appData, error: dbError } = await supabaseAdmin
      .from('apps')
      .insert([
        {
          user_id: userId,
          package_id: packageId,
          website_url: websiteUrl,
          name: appName,
          icon_url: iconUrl,
          status: 'building',
          config: {
            appIcon: iconUrl,
            showNavBar: true,
            themeMode: 'system',
            enablePullToRefresh: true,
            showSplashScreen: true
          }
        }
      ])
      .select()
      .single();

    if (dbError) {
      console.error('Supabase Insert Error:', dbError.message);
      return NextResponse.json({ error: 'Failed to synchronize with database', details: dbError.message }, { status: 500 });
    }

    // 5. Trigger GitHub Action (instant-aab.yml)
    const githubUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/actions/workflows/instant-aab.yml/dispatches`;
    
    const githubResponse = await fetch(githubUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${GITHUB_TOKEN}`,
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ref: 'main',
        inputs: {
            appUrl: websiteUrl,
            packageId: packageId,
            appName: appName,
            iconUrl: iconUrl || '',
            saasAppId: appData.id,
            primaryColor: '#000000', // Default as per route logic
            darkMode: 'auto',
            navigation: 'true',
            pullToRefresh: 'true',
            orientation: 'auto',
            enableZoom: 'false',
            keepAwake: 'false',
            openExternalLinks: 'false'
        },
      })
    });

    if (!githubResponse.ok) {
      const githubError = await githubResponse.json().catch(() => ({}));
      console.error('GitHub API Error:', githubError);
      
      // Attempt rollback status
      await supabaseAdmin.from('apps').update({ status: 'failed' }).eq('id', appData.id);
      
      throw new Error(`GitHub Dispatch failed: ${githubResponse.statusText}`);
    }

    // 6. Fetch the triggered Run ID
    // We wait 3 seconds to ensure GitHub has queued the run, then fetch the latest run.
    await new Promise(resolve => setTimeout(resolve, 3000));

    let runId = null;
    try {
      const runsResponse = await fetch(
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/actions/runs?per_page=1&event=workflow_dispatch`, 
        {
          headers: {
            'Authorization': `Bearer ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github+json',
          }
        }
      );
      
      if (runsResponse.ok) {
        const runsData = await runsResponse.json();
        if (runsData.workflow_runs && runsData.workflow_runs.length > 0) {
           runId = runsData.workflow_runs[0].id;
        }
      }
    } catch (e) {
      console.warn("Failed to fetch Run ID:", e);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Instant AAB Factory build triggered successfully',
      appId: appData.id,
      packageId: packageId,
      runId: runId // Return the GitHub Run ID
    });

  } catch (error: any) {
    console.error('Instant Factory Route Error:', error.message);
    return NextResponse.json({ 
      error: 'Build Factory Exception', 
      details: error.message 
    }, { status: 500 });
  }
}
