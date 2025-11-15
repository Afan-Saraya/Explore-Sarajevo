require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('⚠️  Supabase credentials missing in .env file');
  console.error('Required: SUPABASE_URL and SUPABASE_ANON_KEY');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConnection() {
  try {
    const { data, error } = await supabase.from('categories').select('count').limit(1);
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = table not found is ok for first run
    return true;
  } catch (err) {
    throw err;
  }
}

// Helper to execute raw SQL (for migrations)
async function query(text, params) {
  try {
    const { data, error } = await supabase.rpc('execute_sql', { 
      query_text: text,
      query_params: params || []
    });
    if (error) throw error;
    return { rows: data || [] };
  } catch (err) {
    // Fallback: Supabase doesn't support raw SQL through RPC by default
    // We'll handle queries through the Supabase client methods in models
    console.warn('Raw SQL not supported, use Supabase client methods');
    throw err;
  }
}

module.exports = {
  supabase,
  testConnection,
  query
};
