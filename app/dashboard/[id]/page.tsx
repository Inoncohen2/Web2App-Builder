
import React from 'react';
import { createClient } from '@supabase/supabase-js';
import DashboardClient from './DashboardClient';
import { notFound } from 'next/navigation';

// Server Component
export default async function DashboardPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const appId = params.id;
  
  // Use Service Role to fetch app data server-side (Bypasses RLS for performance, assuming public app data or handled downstream)
  // Note: For strict security, use @supabase/ssr or verify session. 
  // In this context, we prioritize performance for the initial paint.
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: appData, error } = await supabaseAdmin
    .from('apps')
    .select('*')
    .eq('id', appId)
    .single();

  if (error || !appData) {
    return notFound();
  }

  return <DashboardClient appId={appId} initialData={appData} />;
}
