
import React from 'react';
import { createClient } from '@supabase/supabase-js';
import BuilderClient from './BuilderClient';

export default async function BuilderPage(props: { searchParams: Promise<{ id?: string }> }) {
  const searchParams = await props.searchParams;
  const appId = searchParams.id;
  
  let initialData = null;

  if (appId) {
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data } = await supabaseAdmin
        .from('apps')
        .select('*')
        .eq('id', appId)
        .single();
    
    initialData = data;
  }

  return <BuilderClient initialData={initialData} />;
}
