import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iehehxricvjedgzlhipi.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllaGVoeHJpY3ZqZWRnemxoaXBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMDY5MTEsImV4cCI6MjA4NTg4MjkxMX0.Z4GsVn6DCgTA-B11tt1tj-zjaH-dx8TWJrN36yox8R0';

export const supabase = createClient(supabaseUrl, supabaseKey);
