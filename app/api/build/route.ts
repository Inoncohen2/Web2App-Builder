
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Generate app ID
    const appId = `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Initialize Supabase Admin Client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Build payload - FIX: Convert all to proper booleans
    const payload = {
      app_id: appId,
      name: body.appName,
      package_name: body.packageName,
      website_url: body.websiteUrl,
      icon_url: body.iconUrl,
      privacy_policy_url: body.privacyPolicyUrl, // NEW!
      build_format: body.buildFormat || 'apk',
      notification_email: body.email,
      
      config: {
        // FIX: Proper boolean conversion
        navigation: Boolean(body.showNavigation),
        pull_to_refresh: Boolean(body.pullToRefresh),
        splash_screen: Boolean(body.splashScreen),
        enable_zoom: Boolean(body.enableZoom),
        keep_awake: Boolean(body.keepAwake),
        open_external_links: Boolean(body.openExternalLinks),
        
        // Appearance
        primary_color: body.primaryColor || '#2196F3',
        theme_mode: body.themeMode || 'auto',
        orientation: body.orientation || 'auto',
      }
    };
    
    // Debug log
    console.log('📦 Building with config:', payload.config);
    
    // Save to Supabase
    const { data: appData, error: dbError } = await supabase
      .from('apps')
      .insert({
        app_id: appId,
        user_id: body.userId,
        name: body.appName,
        package_name: body.packageName,
        website_url: body.websiteUrl,
        icon_url: body.iconUrl,
        privacy_policy_url: body.privacyPolicyUrl, // NEW!
        status: 'building',
        build_format: body.buildFormat,
        config: payload.config,
      })
      .select()
      .single();
    
    if (dbError) throw dbError;
    
    // Trigger GitHub Actions
    // Note: Assuming process.env.GITHUB_REPO contains "owner/repo" based on existing project config
    const repoPath = process.env.GITHUB_OWNER && process.env.GITHUB_REPO && !process.env.GITHUB_REPO.includes('/') 
      ? `${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}` 
      : process.env.GITHUB_REPO;

    const response = await fetch(
      `https://api.github.com/repos/${repoPath}/dispatches`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_type: 'build-app',
          client_payload: payload
        })
      }
    );
    
    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }
    
    return NextResponse.json({
      success: true,
      appId: appId,
      message: 'Build started!'
    });
    
  } catch (error: any) {
    console.error('Build error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}