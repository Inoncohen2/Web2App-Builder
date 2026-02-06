import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const fileUrl = searchParams.get('url');
  let filename = searchParams.get('filename') || 'app';

  if (!fileUrl) {
    return NextResponse.json({ error: 'Missing URL parameter' }, { status: 400 });
  }

  try {
    // 1. Fetch the file from the external source (Expo)
    const response = await fetch(fileUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }

    // 2. Sanitize filename to ensure it's safe for file systems
    // Allow alphanumeric, spaces, hyphens, and underscores
    filename = filename.replace(/[^a-zA-Z0-9\s-_]/g, '').trim();
    if (!filename) filename = 'app';

    // 3. Prepare headers for the response
    const headers = new Headers();
    headers.set('Content-Disposition', `attachment; filename="${filename}.apk"`);
    headers.set('Content-Type', 'application/vnd.android.package-archive');
    headers.set('Content-Length', response.headers.get('content-length') || '');

    // 4. Return the stream directly
    return new NextResponse(response.body, {
      status: 200,
      headers,
    });

  } catch (error: any) {
    console.error('Download proxy error:', error);
    return NextResponse.json({ error: 'Failed to download file' }, { status: 500 });
  }
}