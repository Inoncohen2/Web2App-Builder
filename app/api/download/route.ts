
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const fileUrl = searchParams.get('url');
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

    let finalDownloadUrl = fileUrl;
    let headersForDownload: Record<string, string> = {};
    let finalFilename = downloadFilename;

    // Regex to parse: https://github.com/{owner}/{repo}/releases/download/{tag}/{filename}
    const githubReleasePattern = /github\.com\/([^\/]+)\/([^\/]+)\/releases\/download\/([^\/]+)\/(.+)/;
    const match = fileUrl.match(githubReleasePattern);

    if (match) {
      const [, owner, repo, tag, assetName] = match;
      const decodedAssetName = decodeURIComponent(assetName);
      
      console.log(`[Proxy] Detected Private GitHub Release: ${owner}/${repo} @ ${tag}`);

      // 1. Fetch Release Metadata to find the Asset ID
      const releaseApiUrl = `https://api.github.com/repos/${owner}/${repo}/releases/tags/${tag}`;
      
      const releaseRes = await fetch(releaseApiUrl, {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'User-Agent': 'Web2App-Builder-Proxy'
        },
        cache: 'no-store'
      });

      if (!releaseRes.ok) {
        throw new Error(`Release lookup failed: ${releaseRes.statusText}`);
      }

      const releaseData = await releaseRes.json();
      const asset = releaseData.assets?.find((a: any) => a.name === decodedAssetName);

      if (!asset) {
        return NextResponse.json({ error: 'Asset not found in GitHub release' }, { status: 404 });
      }

      console.log(`[Proxy] Found Asset API URL: ${asset.url}`);

      // 2. Resolve the Redirect (CRITICAL STEP)
      // We fetch the API URL with manual redirect handling.
      // GitHub API redirects to AWS S3. We MUST NOT send the GitHub Token to S3.
      const redirectResponse = await fetch(asset.url, {
        method: 'GET',
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/octet-stream',
          'User-Agent': 'Web2App-Builder-Proxy'
        },
        redirect: 'manual' // Prevent auto-following to stop Header leakage
      });

      if (redirectResponse.status === 302 || redirectResponse.status === 301) {
        const location = redirectResponse.headers.get('location');
        if (location) {
          console.log('[Proxy] Successfully resolved S3 redirect URL');
          finalDownloadUrl = location;
          // IMPORTANT: Do NOT send Auth headers to the S3 URL
          headersForDownload = {
             'User-Agent': 'Web2App-Builder-Proxy'
          };
        } else {
          throw new Error('GitHub API returned redirect without Location header');
        }
      } else if (!redirectResponse.ok) {
        throw new Error(`Failed to get download URL: ${redirectResponse.statusText}`);
      } else {
        // Edge case: GitHub returned the binary directly (unlikely for releases but possible)
        // In this case we can't easily stream the already consumed body if we used 'manual', 
        // but typically releases always redirect.
        console.warn('[Proxy] GitHub did not redirect, attempting to use original asset URL');
        finalDownloadUrl = asset.url;
        headersForDownload = {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/octet-stream',
          'User-Agent': 'Web2App-Builder-Proxy'
        };
      }

      if (!finalFilename) {
        finalFilename = decodedAssetName;
      }

    } else {
      // Fallback for non-release URLs
      headersForDownload = {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'User-Agent': 'Web2App-Builder-Proxy'
      };
      if (!finalFilename) {
        finalFilename = fileUrl.split('/').pop() || 'app.apk';
      }
    }

    // 3. Perform the actual file download from the resolved URL (S3 or other)
    const upstreamResponse = await fetch(finalDownloadUrl, {
      headers: headersForDownload
    });

    if (!upstreamResponse.ok) {
      console.error(`[Proxy] Final Download Failed: ${upstreamResponse.status}`);
      return NextResponse.json({ error: 'Upstream download failed' }, { status: upstreamResponse.status });
    }

    // 4. Stream response to client
    const headers = new Headers();
    const safeFilename = (finalFilename || 'app.apk').replace(/[^a-zA-Z0-9\.\-_]/g, '_');
    
    headers.set('Content-Disposition', `attachment; filename="${safeFilename}"`);
    headers.set('Content-Type', upstreamResponse.headers.get('Content-Type') || 'application/vnd.android.package-archive');
    
    if (upstreamResponse.headers.get('Content-Length')) {
      headers.set('Content-Length', upstreamResponse.headers.get('Content-Length')!);
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
