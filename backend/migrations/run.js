require('dotenv').config();
const { up } = require('./001_initial_schema');
const { pool } = require('../config/database');

(async () => {
  try {
    console.log('🔄 Running migrations...');
    await up();
    console.log('✅ Migrations complete');
  } catch (error) {
    console.error('❌ Migration error:', error.message);
  } finally {
    await pool.end();
    process.exit(0);
  }
})();
