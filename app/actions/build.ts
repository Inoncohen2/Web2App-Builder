
'use server'

export async function triggerAppBuild(
  appName: string, 
  appSlug: string, 
  supabaseId: string,
  targetUrl: string,
  iconUrl: string | null
) {
  // Use GITHUB_FACTORY_TOKEN for the new architecture
  const githubToken = process.env.GITHUB_FACTORY_TOKEN;

  if (!githubToken) {
    console.error('GITHUB_FACTORY_TOKEN is missing in server environment');
    return { success: false, error: 'Server configuration error: Factory token missing' };
  }

  try {
    // Trigger the Instant AAB workflow
    const response = await fetch(
      'https://api.github.com/repos/Inoncohen2/app-factory/actions/workflows/instant-aab.yml/dispatches',
      {
        method: 'POST',
        headers: {
          'Accept': 'application/vnd.github+json',
          'Authorization': `Bearer ${githubToken}`,
          'X-GitHub-Api-Version': '2022-11-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ref: 'main',
          inputs: {
            appName: appName,
            packageId: appSlug, // appSlug maps to packageId in the workflow
            iconUrl: iconUrl || '',
            // saasAppId is often used for webhook identification
            saasAppId: supabaseId 
          }
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'GitHub Factory API responded with error');
    }

    return { success: true, message: 'Instant build triggered successfully' };
  } catch (error: any) {
    console.error('Build trigger failed:', error.message);
    return { success: false, error: error.message || 'Failed to trigger build' };
  }
}
