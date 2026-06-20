import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

if (SUPABASE_URL.includes('YOUR_PROJECT') || SUPABASE_ANON_KEY.includes('YOUR_ANON')) {
  console.warn('CatatUang: Salin config.example.js ke js/config.js dan isi kredensial Supabase.');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
