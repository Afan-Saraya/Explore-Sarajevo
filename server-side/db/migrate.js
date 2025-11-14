const fs = require('fs');
const path = require('path');
const db = require('./index');

async function runMigration() {
  try {
    const sql = await fs.promises.readFile(path.join(__dirname, 'create_tables.sql'), 'utf8');
    console.log('Running migration...');
    // split by semicolon is risky for complex SQL; run as a single query
    await db.query(sql);
    console.log('✅ Migration applied successfully.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message || err);
    process.exit(1);
  }
}

if (require.main === module) runMigration();

module.exports = runMigration;
