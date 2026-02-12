
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const searchParams = request.nextUrl.searchParams
  const appId = searchParams.get('appId') || searchParams.get('runId') // Support both for compatibility

  if (!appId) {
    return NextResponse.json({ error: 'Missing appId' }, { status: 400 })
  }

  try {
    // 1. Fetch real progress and message from DB
    const { data, error } = await supabase
      .from('apps')
      .select('status, download_url, apk_url, progress, build_message')
      .eq('id', appId)
      .single()

    if (error) throw error

    // Determine completion status based on DB status
    let status = 'queued';
    let conclusion = null;
    let progress = 0;
    let message = data.build_message || 'Initializing...';

    if (data.status === 'building') {
      status = 'in_progress';
      // Use real progress from DB, default to 10 if null/0 to show it started
      progress = data.progress !== null ? data.progress : 10;
    } else if (data.status === 'ready' || data.apk_url) {
      status = 'completed';
      conclusion = 'success';
      progress = 100;
      // If no specific end message, provide a generic one
      if (!data.build_message || data.build_message === 'Queued for build...') {
          message = 'Build completed successfully!';
      }
    } else if (data.status === 'failed') {
      status = 'completed';
      conclusion = 'failure';
      progress = data.progress || 0;
    } else if (data.status === 'cancelled') {
      status = 'completed';
      conclusion = 'cancelled';
      progress = 0;
      message = 'Build cancelled by user';
    }

    return NextResponse.json({
      status: status,
      conclusion: conclusion,
      downloadUrl: data.download_url || data.apk_url,
      progress: progress,
      message: message // Return the real build message to frontend
    })

  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json({ error: 'Failed to check status' }, { status: 500 })
  }
}
