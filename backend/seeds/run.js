require('dotenv').config();
const { seed } = require('./001_seed_data');
const { pool } = require('../config/database');

(async () => {
  try {
    console.log('🌱 Running seeds...');
    await seed();
  } catch (error) {
    console.error('❌ Seed error:', error.message);
  } finally {
    await pool.end();
    process.exit(0);
  }
})();
