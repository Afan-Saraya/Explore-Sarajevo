const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Migration strategy:
// The Supabase JS client (anon key) cannot execute arbitrary SQL. For migrations we use a direct
// Postgres connection via the 'pg' library. Provide either SUPABASE_DB_URL or individual host/user vars.
// If credentials are not available, run db/create_tables.sql manually in the Supabase SQL editor.

function buildConnectionConfig() {
  if (process.env.SUPABASE_DB_URL) return { connectionString: process.env.SUPABASE_DB_URL };
  const { SUPABASE_DB_HOST, SUPABASE_DB_PORT, SUPABASE_DB_NAME, SUPABASE_DB_USER, SUPABASE_DB_PASSWORD } = process.env;
  if (SUPABASE_DB_HOST && SUPABASE_DB_NAME && SUPABASE_DB_USER) {
    return {
      host: SUPABASE_DB_HOST,
      port: SUPABASE_DB_PORT ? parseInt(SUPABASE_DB_PORT, 10) : 5432,
      database: SUPABASE_DB_NAME,
      user: SUPABASE_DB_USER,
      password: SUPABASE_DB_PASSWORD
    };
  }
  return null;
}

async function runMigration() {
  const connCfg = buildConnectionConfig();
  if (!connCfg) {
    console.error('❌ Migration aborted: Missing Postgres connection details.');
    console.log('Set SUPABASE_DB_URL or SUPABASE_DB_HOST/SUPABASE_DB_NAME/SUPABASE_DB_USER/SUPABASE_DB_PASSWORD.');
    console.log('Alternatively, open db/create_tables.sql in the Supabase SQL editor and run it manually.');
    process.exit(1);
  }

  const client = new Client(connCfg);
  try {
    const sql = await fs.promises.readFile(path.join(__dirname, 'create_tables.sql'), 'utf8');
    console.log('Running migration against Postgres...');
    await client.connect();
    await client.query(sql);
    console.log('✅ Migration applied successfully.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message || err);
    console.log('\nIf this persists, copy db/create_tables.sql into Supabase SQL editor and run manually.');
    process.exit(1);
  } finally {
    try { await client.end(); } catch (_) {}
  }
}

if (require.main === module) runMigration();

module.exports = runMigration;
