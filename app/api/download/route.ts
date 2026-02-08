
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const fileUrl = searchParams.get('url');
  // Optional filename override for the user download
  const downloadFilename = searchParams.get('filename');

  if (!fileUrl) {
    return NextResponse.json({ error: 'Missing URL parameter' }, { status: 400 });
  }

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  if (!GITHUB_TOKEN) {
    console.error('CRITICAL: Missing GITHUB_TOKEN environment variable for download proxy.');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  try {
    console.log(`[Proxy] Processing request for: ${fileUrl}`);

    let upstreamResponse: Response;
    let finalFilename = downloadFilename;

    // Regex to parse: https://github.com/{owner}/{repo}/releases/download/{tag}/{filename}
    const githubReleasePattern = /github\.com\/([^\/]+)\/([^\/]+)\/releases\/download\/([^\/]+)\/(.+)/;
    const match = fileUrl.match(githubReleasePattern);

    if (match) {
      const [, owner, repo, tag, assetName] = match;
      console.log(`[Proxy] Detected Private GitHub Release: ${owner}/${repo} @ ${tag}`);

      // 1. Fetch Release Metadata to find the Asset ID
      // We must use the API because direct browser links to private assets don't support token auth easily
      const releaseApiUrl = `https://api.github.com/repos/${owner}/${repo}/releases/tags/${tag}`;
      
      const releaseRes = await fetch(releaseApiUrl, {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'User-Agent': 'Web2App-Builder-Proxy'
        },
        cache: 'no-store'
      });

      if (!releaseRes.ok) {
        const errText = await releaseRes.text();
        console.error(`[Proxy] Failed to look up release: ${releaseRes.status}`);
        throw new Error(`Release lookup failed: ${errText}`);
      }

      const releaseData = await releaseRes.json();
      // Find the asset that matches the filename in the URL
      // Note: decodeURIComponent is important if filename has spaces/special chars
      const targetAssetName = decodeURIComponent(assetName);
      const asset = releaseData.assets?.find((a: any) => a.name === targetAssetName);

      if (!asset) {
        console.error(`[Proxy] Asset '${targetAssetName}' not found in release '${tag}'. Available assets:`, releaseData.assets?.map((a:any) => a.name));
        return NextResponse.json({ error: 'Asset not found in GitHub release' }, { status: 404 });
      }

      console.log(`[Proxy] Found Asset API URL: ${asset.url}`);

      // 2. Fetch the Asset Stream using the API URL
      // We use "Accept: application/octet-stream" which tells GitHub to redirect to the raw binary (S3)
      upstreamResponse = await fetch(asset.url, {
        method: 'GET',
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/octet-stream',
          'User-Agent': 'Web2App-Builder-Proxy'
        },
        redirect: 'follow' // Node fetch follows redirects by default, explicitly setting it here
      });

      if (!finalFilename) {
        finalFilename = targetAssetName;
      }

    } else {
      // Fallback: Try direct fetch if it doesn't match the standard release pattern
      console.log('[Proxy] URL pattern not recognized as GitHub Release, attempting direct fetch...');
      upstreamResponse = await fetch(fileUrl, {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'User-Agent': 'Web2App-Builder-Proxy'
        }
      });
      
      if (!finalFilename) {
        finalFilename = fileUrl.split('/').pop() || 'app.apk';
      }
    }

    if (!upstreamResponse.ok) {
      const errorText = await upstreamResponse.text();
      console.error(`[Proxy] Upstream Download Failed: ${upstreamResponse.status} ${upstreamResponse.statusText}`);
      return NextResponse.json({ 
        error: `Upstream download failed: ${upstreamResponse.statusText}`, 
        details: errorText.substring(0, 200) 
      }, { status: upstreamResponse.status });
    }

    // 3. Stream the response to the client
    const headers = new Headers();
    // Sanitize filename for headers
    const safeFilename = (finalFilename || 'app.apk').replace(/[^a-zA-Z0-9\.\-_]/g, '_');
    
    headers.set('Content-Disposition', `attachment; filename="${safeFilename}"`);
    headers.set('Content-Type', upstreamResponse.headers.get('Content-Type') || 'application/vnd.android.package-archive');
    
    const contentLength = upstreamResponse.headers.get('Content-Length');
    if (contentLength) {
      headers.set('Content-Length', contentLength);
    }

    return new NextResponse(upstreamResponse.body, {
      status: 200,
      headers
    });

  } catch (error: any) {
    console.error('[Proxy] Internal Error:', error.message);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
