import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iehehxricvjedgzlhipi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImllaGVoeHJpY3ZqZWRnemxoaXBpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzMDY5MTEsImV4cCI6MjA4NTg4MjkxMX0.Z4GsVn6DCgTA-B11tt1tj-zjaH-dx8TWJrN36yox8R0';

export const supabase = createClient(supabaseUrl, supabaseKey);
