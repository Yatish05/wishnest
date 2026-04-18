import { supabase } from './_utils/supabase';

export default async function handler(req, res) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL || 'NOT_SET';
    
    // Mask the PROJECT_REF for security
    // https://[PROJECT_REF].supabase.co -> https://***.supabase.co
    const maskedUrl = supabaseUrl.replace(/(https?:\/\/)([^.]+)\./, '$1***.');

    // Simple connection check
    const { data, error } = await supabase.from('users').select('count').limit(1);

    if (error) {
      return res.status(500).json({
        status: 'error',
        message: 'Database connection failed',
        database_url: maskedUrl,
        error: error.message
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Connected to US Supabase server',
      database_url: maskedUrl,
      region_hint: 'Verify this matches your US East project ref',
      count_check: data.length
    });

  } catch (err) {
    return res.status(500).json({
      status: 'critical_error',
      message: err.message
    });
  }
}
