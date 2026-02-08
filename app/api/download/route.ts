
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
    // 1. Fetch the file from GitHub (Streaming Request)
    // We pass the authorization header to access private assets
    const response = await fetch(fileUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
        'Accept': 'application/octet-stream',
        'User-Agent': 'Web2App-Builder-Proxy'
      },
    });

    if (!response.ok) {
      console.error(`Upstream Fetch Failed: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to fetch file from source: ${response.statusText}`);
    }

    // 2. Sanitize filename
    filename = filename.replace(/[^a-zA-Z0-9\s-_]/g, '').trim() || 'app';

    // 3. Determine extension based on source URL (Default to .apk if unknown, switch to .aab if detected)
    let extension = 'apk';
    if (fileUrl.toLowerCase().includes('.aab')) {
      extension = 'aab';
    }

    // 4. Prepare headers for the streaming response
    const headers = new Headers();
    headers.set('Content-Disposition', `attachment; filename="${filename}.${extension}"`);
    headers.set('Content-Type', response.headers.get('Content-Type') || 'application/vnd.android.package-archive');
    
    if (response.headers.get('Content-Length')) {
      headers.set('Content-Length', response.headers.get('Content-Length')!);
    }

    // 5. Pipe the stream directly (No memory buffering)
    return new NextResponse(response.body, {
      status: 200,
      headers,
    });

  } catch (error: any) {
    console.error('Download proxy error:', error.message);
    return NextResponse.json({ error: 'Failed to download file' }, { status: 500 });
  }
}
