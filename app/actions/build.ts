
'use server'

interface BuildConfig {
  primaryColor: string;
  themeMode: string;
  showNavBar: boolean;
  enablePullToRefresh: boolean;
  orientation: string;
  enableZoom: boolean;
  keepAwake: boolean;
  openExternalLinks: boolean;
}

export async function triggerAppBuild(
  appName: string, 
  appSlug: string, 
  supabaseId: string,
  targetUrl: string,
  iconUrl: string | null,
  config: BuildConfig,
  buildFormat: 'apk' | 'aab' = 'apk' // Added parameter with default
) {
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const GITHUB_OWNER = process.env.GITHUB_OWNER;
  const GITHUB_REPO = process.env.GITHUB_REPO;

  const missingVars = [];
  if (!GITHUB_TOKEN) missingVars.push('GITHUB_TOKEN');
  if (!GITHUB_OWNER) missingVars.push('GITHUB_OWNER');
  if (!GITHUB_REPO) missingVars.push('GITHUB_REPO');

  if (missingVars.length > 0) {
    const errorMsg = `Missing environment variable: ${missingVars.join(', ')}`;
    console.error(errorMsg);
    return { success: false, error: errorMsg };
  }

  try {
    const githubUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/actions/workflows/instant-aab.yml/dispatches`;
    const darkModeValue = config.themeMode === 'system' ? 'auto' : config.themeMode;

    const response = await fetch(githubUrl, {
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
            appUrl: targetUrl,
            packageId: appSlug,
            appName: appName,
            iconUrl: iconUrl || '',
            saasAppId: supabaseId,
            primaryColor: config.primaryColor,
            darkMode: darkModeValue,
            navigation: String(config.showNavBar),
            pullToRefresh: String(config.enablePullToRefresh),
            orientation: config.orientation,
            enableZoom: String(config.enableZoom),
            keepAwake: String(config.keepAwake),
            openExternalLinks: String(config.openExternalLinks),
            buildFormat: buildFormat // Pass the build format to GitHub Actions
          }
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `GitHub API responded with ${response.status}`);
    }

    // Wait and fetch Run ID
    await new Promise(r => setTimeout(r, 3000));
    
    let runId = null;
    try {
        const runsResponse = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/actions/runs?per_page=1&event=workflow_dispatch`, {
            headers: { 'Authorization': `Bearer ${GITHUB_TOKEN}` },
            cache: 'no-store'
        });
        const runsData = await runsResponse.json();
        const latestRun = runsData.workflow_runs?.[0];
        if (latestRun) runId = latestRun.id;
    } catch (e) {
        console.error("Failed to fetch run ID in action", e);
    }

    return { success: true, message: 'Instant build triggered successfully', runId };
  } catch (error: any) {
    console.error('Build trigger failed:', error.message);
    return { success: false, error: error.message || 'Failed to trigger build' };
  }
}
