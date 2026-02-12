
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const searchParams = request.nextUrl.searchParams
  const appId = searchParams.get('appId') || searchParams.get('runId')

  if (!appId) {
    return NextResponse.json({ error: 'Missing appId' }, { status: 400 })
  }

  try {
    const { data, error } = await supabase
      .from('apps')
      .select('*')
      .eq('id', appId)
      .single()

    if (error) throw error

    // Determine target based on build_format
    const format = data.build_format || 'apk';
    let rawStatus = 'idle';
    let url = null;
    let progress = 0;

    if (format === 'apk' || format === 'aab') {
      rawStatus = data.apk_status;
      url = data.download_url || data.apk_url;
      progress = data.apk_progress;
    } else if (format === 'source') {
      rawStatus = data.android_source_status;
      url = data.android_source_url;
      progress = data.android_source_progress;
    }

    // Map to API response standard
    let status = 'queued';
    let conclusion = null;

    if (rawStatus === 'building') {
      status = 'in_progress';
    } else if (rawStatus === 'ready') {
      status = 'completed';
      conclusion = 'success';
    } else if (rawStatus === 'failed') {
      status = 'completed';
      conclusion = 'failure';
    } else if (rawStatus === 'cancelled') {
        status = 'completed';
        conclusion = 'cancelled';
    }

    return NextResponse.json({
      status: status,
      conclusion: conclusion,
      downloadUrl: url,
      progress: progress
    })

  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json({ error: 'Failed to check status' }, { status: 500 })
  }
}
