require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { pool } = require('../config/database');

// Curated Unsplash photo sets per category (3–4 per category for variety)
const CATEGORY_PHOTOS = {
  Textiles: [
    'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1604623452050-8b91a9ae7a2c?w=600&h=600&fit=crop',
  ],
  Pottery: [
    'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1452570053594-4be9dc6c4a70?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1594938298446-ea23a5faae20?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1607462109225-6b64ae2dd3cb?w=600&h=600&fit=crop',
  ],
  Handicrafts: [
    'https://images.unsplash.com/photo-1582719478234-5f52df61ed6e?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1542621334-8799d4d5657a?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1581552396802-66c7e7de9ef1?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1567016376408-0226e4d0f9ea?w=600&h=600&fit=crop',
  ],
  'Metal Crafts': [
    'https://images.unsplash.com/photo-1611784041520-b0e1ae46d7af?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1629373736804-6ce0cbdc15d6?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=600&h=600&fit=crop',
  ],
  Art: [
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1557702847-f12d49e81b73?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1587579936580-f79ae0a37cce?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1580136579312-94651dfd596d?w=600&h=600&fit=crop',
  ],
  'Food Products': [
    'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=600&fit=crop',
  ],
  Jewelry: [
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1619946794135-5bc917a27793?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1581235720704-06d3acfcea21?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=600&h=600&fit=crop',
  ],
};

// Per-product override for key ODOP products (highest fidelity)
const PRODUCT_PHOTO_OVERRIDE = {
  'Banarasi Silk Saree': 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&h=600&fit=crop',
  'Kancheepuram Silk': 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&h=600&fit=crop',
  'Patola Saree': 'https://images.unsplash.com/photo-1604623452050-8b91a9ae7a2c?w=600&h=600&fit=crop',
  'Madhubani Painting': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=600&fit=crop',
  'Tanjore Painting': 'https://images.unsplash.com/photo-1557702847-f12d49e81b73?w=600&h=600&fit=crop',
  'Blue Pottery': 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600&h=600&fit=crop',
  'Darjeeling Tea': 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&h=600&fit=crop',
  'Malabar Spices': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&h=600&fit=crop',
  'Rogan Art': 'https://images.unsplash.com/photo-1587579936580-f79ae0a37cce?w=600&h=600&fit=crop',
  'Pashmina Shawl': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=600&fit=crop',
  'Dhokra Metal Art': 'https://images.unsplash.com/photo-1611784041520-b0e1ae46d7af?w=600&h=600&fit=crop',
  'Dokra Metal Art': 'https://images.unsplash.com/photo-1611784041520-b0e1ae46d7af?w=600&h=600&fit=crop',
  'Aranmula Kannadi': 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=600&h=600&fit=crop',
  'Kantha Embroidery': 'https://images.unsplash.com/photo-1581552396802-66c7e7de9ef1?w=600&h=600&fit=crop',
  'Coir Products': 'https://images.unsplash.com/photo-1567016376408-0226e4d0f9ea?w=600&h=600&fit=crop',
  'Kasavu Saree': 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&h=600&fit=crop',
  'Kolhapuri Chappal': 'https://images.unsplash.com/photo-1542621334-8799d4d5657a?w=600&h=600&fit=crop',
  'Nagpur Orange': 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&h=600&fit=crop',
  'Warli Painting': 'https://images.unsplash.com/photo-1580136579312-94651dfd596d?w=600&h=600&fit=crop',
};

async function updateImages() {
  const client = await pool.connect();
  try {
    const { rows: products } = await client.query(
      'SELECT id, odop_product_name, category FROM products WHERE thumbnail IS NULL OR thumbnail = \'\''
    );

    console.log(`🖼️  Updating images for ${products.length} products...`);
    let updated = 0;

    for (const product of products) {
      const override = PRODUCT_PHOTO_OVERRIDE[product.odop_product_name];
      const categoryPhotos = CATEGORY_PHOTOS[product.category] || CATEGORY_PHOTOS.Handicrafts;
      // deterministic pick based on product id checksum
      const idx = product.id.charCodeAt(0) % categoryPhotos.length;
      const url = override || categoryPhotos[idx];

      await client.query(
        'UPDATE products SET thumbnail = $1, images = $2 WHERE id = $3',
        [url, JSON.stringify([url]), product.id]
      );
      updated++;
    }

    console.log(`✅ Updated ${updated} products with images`);
  } finally {
    client.release();
    await pool.end();
  }
}

updateImages().catch(err => { console.error('Error:', err.message); process.exit(1); });
