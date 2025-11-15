const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

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

async function fixSchema() {
  const cfg = buildConnectionConfig();
  if (!cfg) {
    console.error('❌ Missing Postgres connection details.');
    console.log('Set SUPABASE_DB_URL or SUPABASE_DB_HOST/SUPABASE_DB_NAME/SUPABASE_DB_USER/SUPABASE_DB_PASSWORD.');
    console.log('Alternatively, open db/fix_schema.sql in the Supabase SQL editor and run it manually.');
    process.exit(1);
  }

  const client = new Client(cfg);
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'fix_schema.sql'), 'utf8');
    console.log('Running schema fixes...');
    await client.connect();
    await client.query(sql);
    console.log('✅ Schema fixed successfully!');
  } catch (err) {
    console.error('❌ Error fixing schema:', err.message || err);
    console.log('\nIf this persists, copy db/fix_schema.sql into Supabase SQL editor and run manually.');
    process.exit(1);
  } finally {
    try { await client.end(); } catch (_) {}
  }
}

fixSchema();
