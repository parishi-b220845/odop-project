require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { pool } = require('../config/database');
const fs = require('fs');
const path = require('path');

// Simple CSV parser handling quoted fields
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') { inQuotes = !inQuotes; }
    else if (ch === ',' && !inQuotes) { result.push(current.trim()); current = ''; }
    else { current += ch; }
  }
  result.push(current.trim());
  return result;
}

function mapSector(sector) {
  const s = (sector || '').toLowerCase();
  if (s.includes('handloom')) return 'Textiles';
  if (s.includes('textile')) return 'Textiles';
  if (s.includes('handicraft')) return 'Handicrafts';
  if (s.includes('food') || s.includes('dairy')) return 'Food Products';
  if (s.includes('agriculture')) return 'Food Products';
  if (s.includes('marine')) return 'Food Products';
  if (s.includes('manufacturing')) return 'Handicrafts';
  return 'Handicrafts';
}

// State center coordinates for district approximation
const STATE_COORDS = {
  'Andaman and Nicobar Islands':[11.7,92.7],'Andhra Pradesh':[15.9,79.7],'Arunachal Pradesh':[28.2,94.7],
  'Assam':[26.2,92.9],'Bihar':[25.4,85.1],'Chandigarh':[30.7,76.8],'Chhattisgarh':[21.3,81.6],
  'Dadra and Nagar Haveli':[20.1,73.0],'Daman and Diu':[20.4,72.8],'Delhi':[28.7,77.1],
  'Goa':[15.3,74.0],'Gujarat':[22.3,71.2],'Haryana':[29.0,76.1],'Himachal Pradesh':[31.1,77.2],
  'Jammu and Kashmir':[33.8,76.6],'Jharkhand':[23.6,85.3],'Karnataka':[15.3,75.7],
  'Kerala':[10.9,76.3],'Ladakh':[34.2,77.6],'Lakshadweep':[10.6,72.6],
  'Madhya Pradesh':[22.9,78.7],'Maharashtra':[19.8,75.3],'Manipur':[24.6,93.9],
  'Meghalaya':[25.5,91.4],'Mizoram':[23.2,92.9],'Nagaland':[26.2,94.7],
  'Odisha':[20.9,84.3],'Puducherry':[11.9,79.8],'Punjab':[31.1,75.3],
  'Rajasthan':[27.0,74.2],'Sikkim':[27.5,88.5],'Tamil Nadu':[11.1,78.7],
  'Telangana':[18.1,79.0],'Tripura':[23.9,91.9],'Uttar Pradesh':[26.9,80.9],
  'Uttarakhand':[30.1,79.0],'West Bengal':[22.9,87.9],
  'The Dadra And Nagar Haveli And Daman And Diu':[20.3,73.0],
};

async function importCSV() {
  const csvPath = path.join(__dirname, 'odop_dataset.csv');
  if (!fs.existsSync(csvPath)) { console.error('❌ odop_dataset.csv not found'); process.exit(1); }

  const raw = fs.readFileSync(csvPath);
  const text = raw.toString('latin1');
  const lines = text.replace(/\r/g, '').split('\n').filter(l => l.trim());
  const headers = parseCSVLine(lines[0]);
  console.log('📄 Importing ODOP CSV dataset...');
  console.log(`   Headers: ${headers.join(', ')}`);
  console.log(`   ${lines.length - 1} data rows`);

  // Parse all rows
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const vals = parseCSVLine(lines[i]);
    // CSV: State(0), Product(1), District(2), LGD(3), Category(4), Sector(5), Description(6), GI(7), Photo(8), Ministry(9)
    const state = (vals[0] || '').trim();
    const product = (vals[1] || '').trim();
    const district = (vals[2] || '').trim();
    const sector = (vals[5] || '').trim();
    const description = (vals[6] || '').trim();
    const giRaw = (vals[7] || '').trim().toLowerCase();
    const gi = giRaw === 'yes' || giRaw === 'true';

    // Validate: skip garbage rows
    if (!state || !product || !district) continue;
    if (state.length < 3 || district.length < 2 || product.length < 2) continue;
    if (/^\d+$/.test(state) || /^\d+$/.test(district)) continue;

    rows.push({ state, product, district, sector, description: description.substring(0, 2000), gi });
  }
  console.log(`   ${rows.length} valid rows after filtering`);

  // ── Import ODOP dataset (NO transaction - each row independent) ──
  let imported = 0, skipped = 0, firstError = null;
  for (const r of rows) {
    try {
      await pool.query(`
        INSERT INTO odop_dataset (state, district, product_name, category, description, gi_tag)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (state, district, product_name) DO UPDATE SET
          description = COALESCE(NULLIF(EXCLUDED.description,''), odop_dataset.description),
          gi_tag = EXCLUDED.gi_tag
      `, [r.state, r.district, r.product, mapSector(r.sector), r.description, r.gi]);
      imported++;
    } catch (e) {
      if (!firstError) firstError = `Row [${r.state}/${r.district}/${r.product}]: ${e.message}`;
      skipped++;
    }
  }
  if (firstError) console.log(`   ⚠️  First skip reason: ${firstError}`);
  console.log(`   ✅ ODOP: ${imported} imported, ${skipped} skipped`);

  // ── Seed districts from imported data ──
  console.log('🗺️  Seeding districts...');
  const districtMap = new Map();
  for (const r of rows) {
    const key = `${r.district}|${r.state}`;
    if (!districtMap.has(key)) {
      districtMap.set(key, { district: r.district, state: r.state, products: [] });
    }
    districtMap.get(key).products.push(r.product);
  }

  let distCount = 0;
  for (const [, d] of districtMap) {
    const base = STATE_COORDS[d.state] || [22 + Math.random()*8, 75 + Math.random()*12];
    const lat = (base[0] + (Math.random() - 0.5) * 2.5).toFixed(4);
    const lng = (base[1] + (Math.random() - 0.5) * 2.5).toFixed(4);
    try {
      await pool.query(`
        INSERT INTO districts (name, state, latitude, longitude, famous_for)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (name, state) DO UPDATE SET famous_for = EXCLUDED.famous_for
      `, [d.district, d.state, lat, lng, d.products.slice(0, 3).join(', ')]);
      distCount++;
    } catch (e) {
      if (distCount === 0) console.log(`   ⚠️  District error: ${e.message}`);
    }
  }

  console.log(`\n✅ CSV Import Complete!`);
  console.log(`   ODOP Products: ${imported}`);
  console.log(`   States: ${new Set(rows.map(r => r.state)).size}`);
  console.log(`   Districts: ${distCount}`);
  await pool.end();
}

importCSV().catch(e => { console.error('❌ Fatal:', e.message); process.exit(1); });
