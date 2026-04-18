import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

// Log masked values to help debug which Supabase project is in use
try {
  const maskedUrl = supabaseUrl ? supabaseUrl.replace(/(https?:\/\/)([^.]+)\./, '$1***.') : 'undefined';
  const hasKey = !!supabaseKey;
  console.log(`[supabase] Using SUPABASE_URL=${maskedUrl} SUPABASE_SECRET_KEY=${hasKey ? 'SET' : 'MISSING'}`);
} catch (e) {
  // ignore logging errors
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  global: {
    headers: { 'Cache-Control': 'max-age=60' }
  }
});
