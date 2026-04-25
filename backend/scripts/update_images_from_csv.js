require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const { pool } = require('../config/database');

const CSV_PATH = path.join(__dirname, '../seeds/odop_dataset.csv');

// Convert Drive share link → direct CDN image URL (no redirect, CORS: *)
// https://drive.google.com/file/d/{ID}/view  →  https://lh3.googleusercontent.com/d/{ID}=w600-h600
function driveToImageUrl(shareUrl) {
  if (!shareUrl || !shareUrl.includes('drive.google.com')) return null;
  const match = shareUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (!match) return null;
  const fileId = match[1];
  return `https://lh3.googleusercontent.com/d/${fileId}=w600-h600`;
}

function normalize(str) {
  return (str || '').toLowerCase().trim();
}

async function run() {
  // ── 1. Parse CSV ─────────────────────────────────────────
  const raw = fs.readFileSync(CSV_PATH);
  const rows = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    encoding: 'latin1',
  });

  console.log(`📄 Parsed ${rows.length} rows from CSV`);

  // Build lookup maps (multiple match levels)
  // Key: "product|state|district" → url  (most specific)
  // Key: "product|state"          → url  (state-level fallback)
  // Key: "product"                → url  (name-only fallback)
  const byAll   = new Map();
  const byStateProd = new Map();
  const byProd  = new Map();

  for (const row of rows) {
    const url = driveToImageUrl((row['Photo'] || '').trim());
    if (!url) continue;

    const prod  = normalize(row['Product']);
    const state = normalize(row['State']);
    const dist  = normalize(row['District']);

    byAll.set(`${prod}|${state}|${dist}`, url);
    if (!byStateProd.has(`${prod}|${state}`)) byStateProd.set(`${prod}|${state}`, url);
    if (!byProd.has(prod)) byProd.set(prod, url);
  }

  console.log(`🗺️  Built image maps: ${byAll.size} exact | ${byStateProd.size} state | ${byProd.size} name-only`);

  // ── 2. Fetch all products ─────────────────────────────────
  const client = await pool.connect();
  try {
    const { rows: products } = await client.query(
      'SELECT id, odop_product_name, state, district FROM products'
    );
    console.log(`📦 Updating ${products.length} products...`);

    let matched = 0, stateFallback = 0, nameFallback = 0, noMatch = 0;

    for (const p of products) {
      const prod  = normalize(p.odop_product_name);
      const state = normalize(p.state);
      const dist  = normalize(p.district);

      let url = byAll.get(`${prod}|${state}|${dist}`)
             || byStateProd.get(`${prod}|${state}`)
             || byProd.get(prod);

      if (!url) { noMatch++; continue; }

      if (byAll.has(`${prod}|${state}|${dist}`)) matched++;
      else if (byStateProd.has(`${prod}|${state}`)) stateFallback++;
      else nameFallback++;

      await client.query(
        'UPDATE products SET thumbnail = $1, images = $2 WHERE id = $3',
        [url, JSON.stringify([url]), p.id]
      );
    }

    console.log(`\n✅ Done:`);
    console.log(`   Exact match     : ${matched}`);
    console.log(`   State fallback  : ${stateFallback}`);
    console.log(`   Name fallback   : ${nameFallback}`);
    console.log(`   No match (kept) : ${noMatch}`);
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(err => { console.error('Error:', err.message); process.exit(1); });
