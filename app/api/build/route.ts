import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { appName, appSlug, supabaseId } = body;

    if (!appName || !appSlug || !supabaseId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Clean appSlug: lowercase and replace spaces/special chars with hyphens
    const cleanedSlug = appSlug
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove non-word characters
      .replace(/[\s_]+/g, '-')  // Replace spaces and underscores with hyphens
      .replace(/-+/g, '-');     // Replace multiple hyphens with a single one

    const githubToken = process.env.GITHUB_TOKEN;

    if (!githubToken) {
      console.error('GITHUB_TOKEN is not defined in environment variables');
      return NextResponse.json({ error: 'Build server configuration error' }, { status: 500 });
    }

    // GitHub API Call
    const response = await axios.post(
      'https://api.github.com/repos/Inoncohen2/app-factory/actions/workflows/manual-build.yml/dispatches',
      {
        ref: 'main',
        inputs: {
          app_name: appName,
          app_slug: cleanedSlug,
          supabase_id: supabaseId,
        },
      },
      {
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${githubToken}`,
          'X-GitHub-Api-Version': '2022-11-28',
        },
      }
    );

    return NextResponse.json({ 
      success: true, 
      message: 'Build triggered successfully',
      cleanedSlug 
    });

  } catch (error: any) {
    console.error('GitHub Build Trigger Error:', error.response?.data || error.message);
    return NextResponse.json({ 
      error: 'Failed to trigger build', 
      details: error.response?.data?.message || error.message 
    }, { status: 500 });
  }
}