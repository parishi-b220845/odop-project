require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const https = require('https');
const http = require('http');
const { pool } = require('../config/database');

const UNSPLASH = {
  'Textiles':      'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&h=600&fit=crop',
  'Pottery':       'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&h=600&fit=crop',
  'Handicrafts':   'https://images.unsplash.com/photo-1582719478234-5f52df61ed6e?w=600&h=600&fit=crop',
  'Metal Crafts':  'https://images.unsplash.com/photo-1611784041520-b0e1ae46d7af?w=600&h=600&fit=crop',
  'Art':           'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=600&fit=crop',
  'Food Products': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&h=600&fit=crop',
  'Jewelry':       'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=600&fit=crop',
  'default':       'https://images.unsplash.com/photo-1542621334-8799d4d5657a?w=600&h=600&fit=crop',
};

function getFallback(category) {
  return UNSPLASH[category] || UNSPLASH.default;
}

// Checks if a URL is a valid accessible image (follows up to 2 redirects)
function checkUrl(url, redirectsLeft = 2) {
  return new Promise((resolve) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.request(url, { method: 'HEAD', timeout: 8000 }, (res) => {
      const ct = res.headers['content-type'] || '';
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location && redirectsLeft > 0) {
        // Follow redirect
        resolve(checkUrl(res.headers.location, redirectsLeft - 1));
      } else if (res.statusCode === 200 && ct.includes('image')) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
    req.on('timeout', () => { req.destroy(); resolve(false); });
    req.on('error', () => resolve(false));
    req.end();
  });
}

// Run N promises at a time
async function pLimit(tasks, concurrency) {
  const results = [];
  let i = 0;
  async function worker() {
    while (i < tasks.length) {
      const idx = i++;
      results[idx] = await tasks[idx]();
    }
  }
  const workers = Array.from({ length: concurrency }, worker);
  await Promise.all(workers);
  return results;
}

async function run() {
  const client = await pool.connect();
  try {
    // Get all products with lh3 thumbnails
    const { rows } = await client.query(
      `SELECT id, category, thumbnail FROM products WHERE thumbnail LIKE '%lh3.googleusercontent.com%'`
    );
    console.log(`🔍 Testing ${rows.length} lh3 image URLs...`);

    // Deduplicate by URL so we test each unique URL only once
    const urlMap = new Map(); // url → result
    const uniqueUrls = [...new Set(rows.map(r => r.thumbnail))];
    console.log(`   Unique URLs: ${uniqueUrls.length}`);

    let done = 0;
    const tasks = uniqueUrls.map(url => async () => {
      const ok = await checkUrl(url);
      urlMap.set(url, ok);
      done++;
      if (done % 50 === 0) process.stdout.write(`   Checked ${done}/${uniqueUrls.length}...\r`);
      return ok;
    });

    await pLimit(tasks, 25); // 25 concurrent requests
    console.log(`\n✅ URL checks complete`);

    const goodUrls = [...urlMap.entries()].filter(([, ok]) => ok).length;
    const badUrls  = [...urlMap.entries()].filter(([, ok]) => !ok).length;
    console.log(`   Good: ${goodUrls} | Bad/timeout: ${badUrls}`);

    // Build updates: products with bad thumbnails → Unsplash fallback
    const toFix = rows.filter(r => !urlMap.get(r.thumbnail));
    console.log(`\n📝 Fixing ${toFix.length} products with broken images...`);

    let fixed = 0;
    for (const p of toFix) {
      const fallback = getFallback(p.category);
      await client.query(
        'UPDATE products SET thumbnail = $1, images = $2 WHERE id = $3',
        [fallback, JSON.stringify([fallback]), p.id]
      );
      fixed++;
    }
    console.log(`✅ Fixed ${fixed} products`);

    // Summary by category
    const byCategory = {};
    for (const p of toFix) {
      byCategory[p.category] = (byCategory[p.category] || 0) + 1;
    }
    if (Object.keys(byCategory).length > 0) {
      console.log('\nFixed by category:');
      Object.entries(byCategory).sort((a,b) => b[1]-a[1]).forEach(([cat, n]) => {
        console.log(`  ${cat}: ${n}`);
      });
    }

    // Verify final count
    const { rows: counts } = await client.query(`
      SELECT
        COUNT(CASE WHEN thumbnail LIKE '%lh3%' THEN 1 END) as lh3,
        COUNT(CASE WHEN thumbnail LIKE '%unsplash%' THEN 1 END) as unsplash
      FROM products WHERE is_active = true
    `);
    console.log(`\nDB state: lh3=${counts[0].lh3} | unsplash=${counts[0].unsplash}`);
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(err => { console.error('Error:', err.message); process.exit(1); });
