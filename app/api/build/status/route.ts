
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const runId = searchParams.get('runId');

  if (!runId) {
    return NextResponse.json({ error: 'Missing Run ID' }, { status: 400 });
  }

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const GITHUB_OWNER = process.env.GITHUB_OWNER;
  const GITHUB_REPO = process.env.GITHUB_REPO;

  if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/actions/runs/${runId}`,
      {
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github+json',
        },
        cache: 'no-store'
      }
    );

    if (!response.ok) {
        return NextResponse.json({ error: 'Failed to fetch GitHub status' }, { status: response.status });
    }

    const data = await response.json();

    return NextResponse.json({
      status: data.status,         // queued, in_progress, completed
      conclusion: data.conclusion, // success, failure, cancelled, etc.
      html_url: data.html_url
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
