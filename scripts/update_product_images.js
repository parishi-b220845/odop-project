/**
 * Maps downloaded CSV images to products using odop_product_name + state match.
 */
require('dotenv').config({ path: __dirname + '/../backend/.env' });
const { Pool } = require('pg');
const path = require('path');
const fs   = require('fs');

const MAP_PATH = path.join(__dirname, 'image_map.json');

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     process.env.DB_PORT     || 5432,
  database: process.env.DB_NAME     || 'odop_marketplace',
  user:     process.env.DB_USER     || 'odop_user',
  password: process.env.DB_PASSWORD || 'odop_secret_2024',
});

const imageMap = JSON.parse(fs.readFileSync(MAP_PATH));

const normalize = s => (s || '').toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();

// Build lookup: "state|odopProduct" -> fileId
// image_map key format: "STATE|PRODUCT|DISTRICT"
const lookup = {};
for (const [key, fid] of Object.entries(imageMap)) {
  const parts = key.split('|');
  const state   = normalize(parts[0]);
  const product = normalize(parts[1]);
  const k = `${state}|${product}`;
  if (!lookup[k]) lookup[k] = fid;
  // Also index by product only (fallback)
  if (!lookup[`|${product}`]) lookup[`|${product}`] = fid;
}

(async () => {
  const { rows: products } = await pool.query(`
    SELECT id, odop_product_name, state, thumbnail FROM products WHERE is_active = true
  `);
  console.log(`Products in DB: ${products.length}`);

  let updated = 0, skipped = 0;

  for (const prod of products) {
    const state   = normalize(prod.state || '');
    const product = normalize(prod.odop_product_name || '');
    const k1 = `${state}|${product}`;
    const k2 = `|${product}`;

    const fid = lookup[k1] || lookup[k2];
    if (!fid) { skipped++; continue; }

    const url = `/api/images/${fid}`;
    await pool.query(
      `UPDATE products SET thumbnail = $1, images = $2 WHERE id = $3`,
      [url, JSON.stringify([url]), prod.id]
    );
    updated++;
  }

  console.log(`Updated: ${updated}  Skipped: ${skipped}`);

  // Update odop_dataset photo_url too
  let dsUpdated = 0;
  for (const [key, fid] of Object.entries(imageMap)) {
    const [state, product] = key.split('|');
    const res = await pool.query(`
      UPDATE odop_dataset SET photo_url = $1
      WHERE LOWER(TRIM(state)) = LOWER(TRIM($2))
        AND LOWER(TRIM(product_name)) = LOWER(TRIM($3))
    `, [`/api/images/${fid}`, state, product]);
    if (res.rowCount > 0) dsUpdated++;
  }
  console.log(`odop_dataset updated: ${dsUpdated}`);

  await pool.end();
  console.log('Done.');
})();
