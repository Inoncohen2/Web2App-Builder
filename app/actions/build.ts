
'use server'

export async function triggerAppBuild(
  appName: string, 
  appSlug: string, 
  supabaseId: string,
  targetUrl: string,
  iconUrl: string | null
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

    // Trigger the Instant AAB workflow
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
            appName: appName,
            packageId: appSlug, // appSlug maps to packageId in the workflow
            iconUrl: iconUrl || '',
            // saasAppId is used for webhook identification
            saasAppId: supabaseId 
          }
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `GitHub API responded with ${response.status}`);
    }

    return { success: true, message: 'Instant build triggered successfully' };
  } catch (error: any) {
    console.error('Build trigger failed:', error.message);
    return { success: false, error: error.message || 'Failed to trigger build' };
  }
}
