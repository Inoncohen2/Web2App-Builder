'use server'

import axios from 'axios';

export async function triggerAppBuild(appName: string, appSlug: string, supabaseId: string) {
  // 1. Data Cleaning: Lowercase and replace spaces/hyphens with underscores for Android compatibility
  const cleanedSlug = appSlug
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-_]/g, '') // Remove non-word characters (allows alphanumeric, underscore, space, hyphen)
    .replace(/[\s-]+/g, '_')   // Replace spaces and hyphens with underscores
    .replace(/_+/g, '_');      // Dedupe underscores

  const githubToken = process.env.GITHUB_TOKEN;

  if (!githubToken) {
    console.error('GITHUB_TOKEN is missing in server environment');
    return { success: false, error: 'Server configuration error' };
  }

  try {
    // 2. GitHub API Call
    // URL: https://api.github.com/repos/Inoncohen2/app-factory/actions/workflows/manual-build.yml/dispatches
    const response = await fetch(
      'https://api.github.com/repos/Inoncohen2/app-factory/actions/workflows/manual-build.yml/dispatches',
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
            // Only send camelCase inputs as per workflow definition
            appName: appName,
            appSlug: cleanedSlug,
            saasAppId: supabaseId
          }
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'GitHub API responded with error');
    }

    return { success: true, message: 'Build triggered successfully' };
  } catch (error: any) {
    console.error('Build trigger failed:', error.message);
    return { success: false, error: error.message || 'Failed to trigger build' };
  }
}