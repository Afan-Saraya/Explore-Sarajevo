const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:4eYj77rkVf4DAnymjlsduC3fjLISjSQq@127.0.0.1:5432/postgres',
  ssl: false
});

async function fixSchema() {
  const client = await pool.connect();
  try {
    const sql = fs.readFileSync(path.join(__dirname, 'fix_schema.sql'), 'utf8');
    console.log('Running schema fixes...');
    await client.query(sql);
    console.log('✅ Schema fixed successfully!');
  } catch (err) {
    console.error('❌ Error fixing schema:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

fixSchema();
