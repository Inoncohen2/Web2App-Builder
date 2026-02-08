
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const fileUrl = searchParams.get('url');
  let filename = searchParams.get('filename') || 'app';

  if (!fileUrl) {
    return NextResponse.json({ error: 'Missing URL parameter' }, { status: 400 });
  }

  // Security Check: Ensure we have credentials to fetch private assets
  if (!process.env.GITHUB_TOKEN) {
    console.error('CRITICAL: Missing GITHUB_TOKEN environment variable for download proxy.');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  try {
    console.log(`[Proxy] Attempting download from: ${fileUrl}`);

    // 1. Fetch the file from GitHub (Streaming Request)
    // We use 'token' prefix which is standard for GitHub Personal Access Tokens
    const githubResponse = await fetch(fileUrl, {
      method: 'GET',
      headers: {
        'Authorization': `token ${process.env.GITHUB_TOKEN}`,
        'Accept': 'application/octet-stream',
        'User-Agent': 'Web2App-Builder-Proxy'
      },
      // cache: 'no-store' ensures we don't serve stale data or cached 404s
      cache: 'no-store'
    });

    if (!githubResponse.ok) {
      // detailed error logging for debugging 404s
      const errorText = await githubResponse.text();
      console.error(`[Proxy] Upstream Fetch Failed: ${githubResponse.status} ${githubResponse.statusText}`);
      console.error(`[Proxy] Response Body: ${errorText}`);
      return NextResponse.json({ 
        error: `GitHub refused access: ${githubResponse.statusText}`, 
        details: errorText.substring(0, 200) 
      }, { status: githubResponse.status });
    }

    // 2. Sanitize filename
    filename = filename.replace(/[^a-zA-Z0-9\s-_\.]/g, '').trim() || 'app';
    
    // Ensure correct extension logic
    if (!filename.toLowerCase().endsWith('.apk') && !filename.toLowerCase().endsWith('.aab')) {
        if (fileUrl.toLowerCase().includes('.aab')) {
            filename += '.aab';
        } else {
            filename += '.apk';
        }
    }

    // 3. Prepare headers for the streaming response
    const headers = new Headers();
    headers.set('Content-Disposition', `attachment; filename="${filename}"`);
    headers.set('Content-Type', 'application/vnd.android.package-archive');
    
    // Forward Content-Length if available to show progress bars in browser
    if (githubResponse.headers.get('Content-Length')) {
      headers.set('Content-Length', githubResponse.headers.get('Content-Length')!);
    }

    // 4. Pipe the stream directly (No memory buffering)
    return new NextResponse(githubResponse.body, {
      status: 200,
      headers,
    });

  } catch (error: any) {
    console.error('[Proxy] Internal Error:', error.message);
    return NextResponse.json({ error: 'Failed to download file' }, { status: 500 });
  }
}
