require('dotenv').config();
const { down, up } = require('./001_initial_schema');
const { pool } = require('../config/database');

(async () => {
  try {
    console.log('🔄 Resetting database...');
    await down();
    console.log('🔄 Re-running migrations...');
    await up();
    console.log('✅ Database reset complete');
  } catch (error) {
    console.error('❌ Reset error:', error.message);
  } finally {
    await pool.end();
    process.exit(0);
  }
})();
