
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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
    const { data, error } = await supabase
      .from('apps')
      .select('status, download_url, apk_url')
      .eq('id', appId)
      .single()

    if (error) throw error

    // Determine completion status based on DB status
    let status = 'queued';
    let conclusion = null;
    let progress = 0;

    if (data.status === 'building') {
      status = 'in_progress';
      progress = 50;
    } else if (data.status === 'ready' || data.apk_url) {
      status = 'completed';
      conclusion = 'success';
      progress = 100;
    } else if (data.status === 'failed') {
      status = 'completed';
      conclusion = 'failure';
    }

    return NextResponse.json({
      status: status,
      conclusion: conclusion,
      downloadUrl: data.download_url || data.apk_url,
      progress: progress
    })

  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json({ error: 'Failed to check status' }, { status: 500 })
  }
}
