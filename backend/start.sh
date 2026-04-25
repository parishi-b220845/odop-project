#!/bin/sh
set -e

cd /app/backend

echo "⏳ Waiting for database..."
until node -e "
const { Pool } = require('pg');
const p = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectionTimeoutMillis: 3000,
});
p.query('SELECT 1').then(() => { p.end(); process.exit(0); }).catch(() => { p.end(); process.exit(1); });
" 2>/dev/null; do
  echo "  DB not ready, retrying in 2s..."
  sleep 2
done
echo "✅ Database ready"

echo "🔄 Running migrations..."
node migrations/run.js

if [ "$SEED_DATA" = "true" ]; then
  echo "🌱 Seeding initial data..."
  node seeds/000_import_csv.js && node seeds/run.js && node seeds/002_bulk_data.js || echo "⚠️  Seeding skipped (data may already exist)"
fi

echo "🚀 Starting server..."
exec node server.js
