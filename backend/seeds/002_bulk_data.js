require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

// ─── Indian Names for Fake Data ────────────────────────
const FIRST_NAMES_M = ['Aarav','Vivaan','Aditya','Arjun','Sai','Reyansh','Ayaan','Krishna','Ishaan','Shaurya','Atharva','Advait','Vihaan','Dhruv','Kabir','Ritvik','Ananya','Moksh','Aarush','Dev','Rohan','Amit','Raj','Sunil','Manoj','Rakesh','Vikram','Nikhil','Karthik','Pranav','Siddharth','Yash','Shreyas','Akash','Tushar','Gaurav','Harsh','Manish','Deepak','Kunal'];
const FIRST_NAMES_F = ['Aadhya','Aanya','Diya','Saanvi','Myra','Sara','Ananya','Isha','Kavya','Riya','Priya','Neha','Pooja','Shreya','Tanvi','Meera','Nisha','Divya','Anjali','Sakshi','Simran','Trisha','Sneha','Lavanya','Ritika','Pallavi','Swati','Aishwarya','Deepa','Nandini'];
const LAST_NAMES = ['Sharma','Verma','Gupta','Singh','Kumar','Patel','Reddy','Nair','Iyer','Bhat','Joshi','Deshmukh','Chauhan','Mishra','Pandey','Agarwal','Malhotra','Kapoor','Banerjee','Mukherjee','Pillai','Menon','Shetty','Rao','Das','Sen','Bose','Ghosh','Thakur','Kulkarni','Chaudhary','Tiwari','Saxena','Mehta','Shah','Khanna','Arora','Sethi','Sinha','Bhatt'];
const CITIES = [
  {city:'Mumbai',state:'Maharashtra',pin:'400001'},{city:'Delhi',state:'Delhi',pin:'110001'},
  {city:'Bangalore',state:'Karnataka',pin:'560001'},{city:'Hyderabad',state:'Telangana',pin:'500001'},
  {city:'Chennai',state:'Tamil Nadu',pin:'600001'},{city:'Kolkata',state:'West Bengal',pin:'700001'},
  {city:'Pune',state:'Maharashtra',pin:'411001'},{city:'Jaipur',state:'Rajasthan',pin:'302001'},
  {city:'Lucknow',state:'Uttar Pradesh',pin:'226001'},{city:'Ahmedabad',state:'Gujarat',pin:'380001'},
  {city:'Chandigarh',state:'Punjab',pin:'160001'},{city:'Indore',state:'Madhya Pradesh',pin:'452001'},
  {city:'Bhopal',state:'Madhya Pradesh',pin:'462001'},{city:'Patna',state:'Bihar',pin:'800001'},
  {city:'Kochi',state:'Kerala',pin:'682001'},{city:'Guwahati',state:'Assam',pin:'781001'},
  {city:'Bhubaneswar',state:'Odisha',pin:'751001'},{city:'Dehradun',state:'Uttarakhand',pin:'248001'},
  {city:'Ranchi',state:'Jharkhand',pin:'834001'},{city:'Thiruvananthapuram',state:'Kerala',pin:'695001'},
  {city:'Coimbatore',state:'Tamil Nadu',pin:'641001'},{city:'Nagpur',state:'Maharashtra',pin:'440001'},
  {city:'Varanasi',state:'Uttar Pradesh',pin:'221001'},{city:'Surat',state:'Gujarat',pin:'395001'},
  {city:'Visakhapatnam',state:'Andhra Pradesh',pin:'530001'},
];
const STREETS = ['MG Road','Gandhi Nagar','Nehru Street','Ambedkar Colony','Patel Marg','Tagore Lane','Vivekananda Road','Subhash Chowk','Rajaji Nagar','Tilak Road','Ashoka Marg','Bose Lane','Shastri Nagar','Sardar Patel Colony','Bhagat Singh Road'];
const PHONES = () => '9' + Math.floor(100000000 + Math.random() * 900000000);

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const slug = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'') + '-' + crypto.randomBytes(3).toString('hex');

// ─── Product Name Templates per Category ───────────────
const TEMPLATES = {
  'Textiles': [
    '{odop} Saree - {adj} {color}', '{odop} Dupatta - {color} Collection', '{odop} Stole - Handwoven {color}',
    '{odop} Kurta Fabric - {adj} {color}', '{odop} Shawl - {adj} Weave', '{odop} Table Runner - {color} {adj}',
  ],
  'Handicrafts': [
    '{odop} Wall Hanging - {adj}', '{odop} Home Decor Set', '{odop} Gift Box - {adj} Collection',
    '{odop} Basket - {adj} Weave', '{odop} Lamp - {adj} Design', '{odop} Storage Box - {color}',
  ],
  'Art': [
    '{odop} Painting - {subject}', '{odop} Canvas Print - {adj}', '{odop} Art Frame - {subject}',
    '{odop} Wall Art - {color} {subject}', '{odop} Sketch Set - {adj}',
  ],
  'Pottery': [
    '{odop} Vase - {color} {adj}', '{odop} Tea Set - {adj} Collection', '{odop} Bowl Set - {color}',
    '{odop} Planter - {adj} Design', '{odop} Dinner Set - {adj}',
  ],
  'Food Products': [
    '{odop} Premium Pack - {weight}', '{odop} Gift Box - Assorted', '{odop} Organic - {weight}',
    '{odop} Family Pack - {adj}', '{odop} Festival Special',
  ],
  'Jewelry': [
    '{odop} Necklace - {adj} Design', '{odop} Earrings - {color} Collection', '{odop} Bangle Set - {adj}',
    '{odop} Pendant - {adj} {color}',
  ],
  'Metal Crafts': [
    '{odop} Figurine - {subject}', '{odop} Decorative Plate - {adj}', '{odop} Lamp Stand - {adj}',
    '{odop} Wall Piece - {subject}',
  ],
  default: [
    '{odop} - {adj} Collection', '{odop} - Premium {color}', '{odop} - Artisan Special',
    '{odop} - Heritage Edition', '{odop} Gift Set - {adj}',
  ],
};
const ADJS = ['Royal','Heritage','Classic','Artisan','Premium','Elegant','Traditional','Vintage','Handcrafted','Exquisite','Delicate','Rustic','Contemporary','Festive','Luxurious','Grand','Fine','Pristine','Timeless','Majestic'];
const COLORS = ['Crimson','Indigo','Emerald','Saffron','Ivory','Turquoise','Coral','Midnight','Ruby','Amber','Teal','Maroon','Gold','Silver','Jade','Rose','Azure','Ochre','Pearl','Copper'];
const SUBJECTS = ['Tree of Life','Peacock','Lotus','Elephant','Krishna','Village Scene','River Mandala','Floral Motif','Geometric','Harvest Dance','Sun & Moon','Sacred Geometry','Nature','Birds','Tribal Pattern'];
const WEIGHTS = ['250g','500g','1kg','200g','100g'];

function generateProductName(odopName, category) {
  const templates = TEMPLATES[category] || TEMPLATES.default;
  let name = pick(templates);
  name = name.replace('{odop}', odopName)
    .replace('{adj}', pick(ADJS))
    .replace('{color}', pick(COLORS))
    .replace('{subject}', pick(SUBJECTS))
    .replace('{weight}', pick(WEIGHTS));
  return name;
}

// ─── Category mapping from ODOP category strings ───────
const CATEGORY_MAP = {
  'handloom': 'Textiles', 'textile': 'Textiles', 'handicraft': 'Handicrafts',
  'pottery': 'Pottery', 'metal_craft': 'Metal Crafts', 'painting': 'Art',
  'food_processing': 'Food Products', 'agriculture': 'Food Products',
  'jewelry': 'Jewelry', 'wood_craft': 'Handicrafts', 'leather_craft': 'Handicrafts',
  'natural_fiber': 'Handicrafts', 'stone_craft': 'Handicrafts',
  'bamboo_craft': 'Handicrafts', 'dairy': 'Food Products', 'other': 'Handicrafts',
  // Direct display categories (from CSV importer)
  'Textiles': 'Textiles', 'Handicrafts': 'Handicrafts', 'Food Products': 'Food Products',
  'Art': 'Art', 'Pottery': 'Pottery', 'Metal Crafts': 'Metal Crafts', 'Jewelry': 'Jewelry',
};

// ─── Unsplash image pools by category ──────────────────
const IMG_POOL = {
  'Textiles': ['photo-1610030469983-98e550d6193c','photo-1583391733956-6c78276477e2','photo-1617627143233-46e3730c8f19','photo-1594938298603-c8148c4dae35','photo-1606722590583-6951b5ea92ad','photo-1601244005535-a48d52d3a309'],
  'Art': ['photo-1582738411706-bfc8e691d1c2','photo-1579783902614-a3fb3927b6a5','photo-1578301978693-85fa9c0320b9','photo-1563861826100-9cb868fdbe1c','photo-1513519245088-0e12902e5a38'],
  'Handicrafts': ['photo-1590874103328-eac38ef882e4','photo-1590736969955-71cc94901144','photo-1459411552884-841db9b3cc2a','photo-1594735538350-8f5271f9e4d7','photo-1551732998-9573f695fdbb'],
  'Pottery': ['photo-1565193566173-7a0ee3dbe261','photo-1493106641515-6b5631de4bb9','photo-1615529162924-f8605388461d','photo-1600585152220-90363fe7e115'],
  'Jewelry': ['photo-1611591437281-460bfbe1220a','photo-1566150905458-1bf1fc113f0d','photo-1535632066927-ab7c9ab60908'],
  'Metal Crafts': ['photo-1604882737321-e9d84921d7e5','photo-1551732998-9573f695fdbb','photo-1602143407151-7111542de6e8'],
  'Food Products': ['photo-1596040033229-a9821ebd058d','photo-1599940824399-b87987ceb72a','photo-1542838132-92c53300491e'],
};
const getImg = (cat) => {
  const pool = IMG_POOL[cat] || IMG_POOL['Handicrafts'];
  return `https://images.unsplash.com/${pick(pool)}?w=600&h=600&fit=crop`;
};

// ═══════════════════════════════════════════════════════
// MAIN SEED
// ═══════════════════════════════════════════════════════
async function seedBulk() {
  const client = await pool.connect();

  // Helper: execute query with savepoint so one failure doesn't kill transaction
  let spIdx = 0;
  const safe = async (query, params) => {
    const sp = `sp_${++spIdx}`;
    await client.query(`SAVEPOINT ${sp}`);
    try {
      const res = await client.query(query, params);
      await client.query(`RELEASE SAVEPOINT ${sp}`);
      return res;
    } catch (e) {
      await client.query(`ROLLBACK TO SAVEPOINT ${sp}`);
      throw e;
    }
  };

  try {
    await client.query('BEGIN');
    console.log('🌱 Generating bulk data...');

    const password = await bcrypt.hash('password123', 10);

    // ── 1. Create 50 fake buyers ──────────────────────
    console.log('👥 Creating 50 buyers...');
    const buyerIds = [];
    for (let i = 0; i < 50; i++) {
      const isFemale = Math.random() > 0.5;
      const first = pick(isFemale ? FIRST_NAMES_F : FIRST_NAMES_M);
      const last = pick(LAST_NAMES);
      const name = `${first} ${last}`;
      const email = `${first.toLowerCase()}.${last.toLowerCase()}${randInt(1,99)}@gmail.com`;
      const id = uuidv4();
      try {
        await safe(`
          INSERT INTO users (id, name, email, password_hash, phone, role, is_active, email_verified, created_at)
          VALUES ($1,$2,$3,$4,$5,'buyer',true,true, NOW() - interval '1 day' * $6)
          ON CONFLICT (email) DO NOTHING
        `, [id, name, email, password, PHONES(), randInt(1, 180)]);
        buyerIds.push(id);

        // Add address
        const loc = pick(CITIES);
        await safe(`
          INSERT INTO buyer_addresses (user_id, label, name, phone, address_line1, city, state, pincode, is_default)
          VALUES ($1, 'Home', $2, $3, $4, $5, $6, $7, true)
        `, [id, name, PHONES(), `${randInt(1,500)}, ${pick(STREETS)}`, loc.city, loc.state, loc.pin]);
      } catch(e) { /* skip duplicates */ }
    }
    console.log(`  ✅ Created ${buyerIds.length} buyers`);

    // ── 2. Create 15 fake sellers ─────────────────────
    console.log('🏪 Creating 15 sellers...');
    const sellerIds = [];
    const CRAFTS = ['Silk Weaving','Block Printing','Pottery','Metal Work','Painting','Embroidery','Wood Carving','Textile Dyeing','Bamboo Craft','Stone Carving','Leather Work','Jewelry Making','Coir Work','Glass Art','Paper Craft'];
    const BNAMES = ['Heritage Looms','Artisan Collective','Craft Haven','Desi Handmade','Kala Studio','Shilp Kendra','Rang Manch','Hastakala','Bunkar House','Karigar Works','Prakriti Crafts','Kumbhar Pottery','Tarkashi Arts','Zari Palace','Naksha Designs'];
    const SELLER_DISTRICTS = [
      {d:'Varanasi',s:'Uttar Pradesh'},{d:'Lucknow',s:'Uttar Pradesh'},{d:'Madhubani',s:'Bihar'},
      {d:'Kutch',s:'Gujarat'},{d:'Jaipur',s:'Rajasthan'},{d:'Puri',s:'Odisha'},
      {d:'Thrissur',s:'Kerala'},{d:'Kanchipuram',s:'Tamil Nadu'},{d:'Srinagar',s:'Jammu and Kashmir'},
      {d:'Moradabad',s:'Uttar Pradesh'},{d:'Bidar',s:'Karnataka'},{d:'Bankura',s:'West Bengal'},
      {d:'Bastar',s:'Chhattisgarh'},{d:'Srikalahasti',s:'Andhra Pradesh'},{d:'Patan',s:'Gujarat'},
    ];

    for (let i = 0; i < 15; i++) {
      const first = pick(FIRST_NAMES_M.concat(FIRST_NAMES_F));
      const last = pick(LAST_NAMES);
      const name = `${first} ${last}`;
      const email = `${first.toLowerCase()}.${BNAMES[i].toLowerCase().replace(/\s/g,'')}@artisan.in`;
      const id = uuidv4();
      const loc = SELLER_DISTRICTS[i];
      try {
        await safe(`
          INSERT INTO users (id, name, email, password_hash, phone, role, is_active, email_verified, created_at)
          VALUES ($1,$2,$3,$4,$5,'seller',true,true, NOW() - interval '1 day' * $6)
          ON CONFLICT (email) DO NOTHING
        `, [id, name, email, password, PHONES(), randInt(30, 365)]);

        await safe(`
          INSERT INTO seller_profiles (user_id, business_name, description, district, state, city, craft_speciality, verification, rating, total_sales)
          VALUES ($1,$2,$3,$4,$5,$4,$6,'verified',$7,$8)
          ON CONFLICT (user_id) DO NOTHING
        `, [id, BNAMES[i], `Traditional ${CRAFTS[i]} artisan from ${loc.d}, ${loc.s}. Preserving heritage crafts for modern markets.`, loc.d, loc.s, CRAFTS[i], (3.5 + Math.random()*1.5).toFixed(2), randInt(50,500)]);

        sellerIds.push(id);
      } catch(e) { /* skip */ }
    }
    console.log(`  ✅ Created ${sellerIds.length} sellers`);

    // Get existing sellers too
    const existingSellers = await client.query("SELECT id FROM users WHERE role='seller'");
    const allSellerIds = existingSellers.rows.map(r => r.id);

    // ── 3. Generate products from ODOP dataset ────────
    console.log('🏺 Generating products from ODOP dataset...');
    const odopRows = await client.query('SELECT * FROM odop_dataset ORDER BY state, district');
    let productCount = 0;
    const productIds = [];

    for (const odop of odopRows.rows) {
      const cat = CATEGORY_MAP[odop.category] || 'Handicrafts';
      const numProducts = randInt(1, 3); // 1-3 products per ODOP entry (~2000 total from 1251 entries)

      for (let i = 0; i < numProducts; i++) {
        const name = generateProductName(odop.product_name, cat);
        const s = slug(name);
        const sellerId = pick(allSellerIds);
        const basePrice = cat === 'Food Products' ? randInt(200, 2000) : cat === 'Jewelry' ? randInt(500, 15000) : randInt(800, 25000);
        const comparePrice = Math.round(basePrice * (1.2 + Math.random() * 0.4));
        const isFeatured = Math.random() < 0.1;
        const img = getImg(cat);

        try {
          const res = await safe(`
            INSERT INTO products (seller_id, name, slug, description, short_description, category, price, compare_price, stock, state, district,
              odop_product_name, odop_verified, gi_tagged, is_handmade, materials, making_time, bulk_available, min_bulk_qty, bulk_price,
              is_featured, artisan_story, is_active, images, thumbnail, avg_rating, review_count, view_count, order_count, tags)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,true,$13,true,$14,$15,$16,$17,$18,$19,$20,true,$21,$22,$23,$24,$25,$26,$27)
            ON CONFLICT (slug) DO NOTHING RETURNING id
          `, [
            sellerId, name, s,
            `${odop.description || `Authentic ${odop.product_name} from ${odop.district}, ${odop.state}.`} Handcrafted by skilled artisans using traditional techniques passed down through generations. Each piece is unique and carries the cultural heritage of ${odop.district}.`,
            `Authentic handcrafted ${odop.product_name} from ${odop.district}`,
            cat, basePrice, comparePrice, randInt(5, 100), odop.state, odop.district,
            odop.product_name, odop.gi_tag || false,
            `Traditional ${cat.toLowerCase()} materials`, `${randInt(2,15)} days`,
            Math.random() > 0.4, Math.random() > 0.4 ? randInt(5, 25) : null, Math.random() > 0.4 ? Math.round(basePrice * 0.8) : null,
            isFeatured, `Crafted by artisans of ${odop.district} who have preserved this tradition for generations.`,
            JSON.stringify([img]), img,
            (3.0 + Math.random() * 2.0).toFixed(1), randInt(3, 80),
            randInt(50, 2000), randInt(5, 150),
            JSON.stringify([cat, odop.state, odop.district, odop.product_name, odop.gi_tag ? 'GI Tagged' : '', 'ODOP', 'Handmade'].filter(Boolean)),
          ]);
          if (res.rows.length > 0) {
            productIds.push(res.rows[0].id);
            productCount++;
          }
        } catch(e) { /* skip dupes */ }
      }
    }
    console.log(`  ✅ Created ${productCount} products`);

    // ── 4. Generate orders ────────────────────────────
    console.log('📦 Generating orders...');
    const ORDER_STATUSES = ['pending','confirmed','processing','shipped','delivered','delivered','delivered'];
    let orderCount = 0;

    for (let i = 0; i < 500; i++) {
      const buyerId = pick(buyerIds);
      const productId = pick(productIds);
      const sellerId = pick(allSellerIds);
      const status = pick(ORDER_STATUSES);
      const qty = randInt(1, 3);

      // Get product price and seller
      const prodRes = await client.query('SELECT price, name, thumbnail, seller_id FROM products WHERE id = $1', [productId]);
      if (prodRes.rows.length === 0) continue;
      const prod = prodRes.rows[0];
      const subtotal = parseFloat(prod.price) * qty;
      const shipping = subtotal > 2000 ? 0 : 99;
      const tax = Math.round(subtotal * 0.05);
      const total = subtotal + shipping + tax;
      const loc = pick(CITIES);
      const orderNum = `OD${crypto.randomBytes(4).toString('hex').toUpperCase()}${i.toString().padStart(2,'0')}`;

      try {
        const orderRes = await safe(`
          INSERT INTO orders (order_number, buyer_id, status, subtotal, shipping_fee, tax, total, shipping_address, created_at)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8, NOW() - interval '1 day' * $9)
          ON CONFLICT (order_number) DO NOTHING RETURNING id
        `, [orderNum, buyerId, status, subtotal, shipping, tax, total,
          JSON.stringify({ name: `${pick(FIRST_NAMES_M)} ${pick(LAST_NAMES)}`, address: `${randInt(1,500)}, ${pick(STREETS)}`, city: loc.city, state: loc.state, pincode: loc.pin, phone: PHONES() }),
          randInt(1, 90)
        ]);

        if (orderRes.rows.length > 0) {
          await safe(`
            INSERT INTO order_items (order_id, product_id, seller_id, product_name, product_image, quantity, price, total)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
          `, [orderRes.rows[0].id, productId, prod.seller_id, prod.name, prod.thumbnail, qty, prod.price, subtotal]);
          orderCount++;
        }
      } catch(e) { /* skip */ }
    }
    console.log(`  ✅ Created ${orderCount} orders`);

    // ── 5. Generate reviews ───────────────────────────
    console.log('⭐ Generating reviews...');
    const REVIEW_COMMENTS = [
      'Beautiful craftsmanship! The artisan has done an amazing job.',
      'Authentic product, exactly as described. Very happy with the quality.',
      'Love the traditional design. A perfect gift for my family.',
      'The quality exceeded my expectations. Will definitely buy more.',
      'Stunning piece of art. You can see the hours of work that went into this.',
      'Good quality but shipping took a bit longer than expected.',
      'Absolutely gorgeous! The colors are vibrant and the detail is incredible.',
      'Nice product. The material feels premium and handmade.',
      'Perfect for home decor. Gets compliments from everyone who visits.',
      'Very unique and authentic. Hard to find such genuine handmade products online.',
      'The packaging was excellent. Product arrived in perfect condition.',
      'Bought this as a wedding gift. Everyone loved it!',
      'Great value for money. The craftsmanship is outstanding.',
      'Supporting Indian artisans feels wonderful. Product is lovely.',
      'A true masterpiece from Indian heritage craft tradition.',
    ];
    let reviewCount = 0;

    const reviewProducts = productIds.slice(0, Math.min(productIds.length, 300));
    for (const pid of reviewProducts) {
      const numReviews = randInt(1, 4);
      const usedBuyers = new Set();
      for (let r = 0; r < numReviews; r++) {
        let bid = pick(buyerIds);
        if (usedBuyers.has(bid)) continue;
        usedBuyers.add(bid);
        try {
          await safe(`
            INSERT INTO reviews (product_id, user_id, rating, comment, is_verified_purchase, created_at)
            VALUES ($1,$2,$3,$4,$5, NOW() - interval '1 day' * $6)
            ON CONFLICT (product_id, user_id) DO NOTHING
          `, [pid, bid, randInt(3, 5), pick(REVIEW_COMMENTS), Math.random() > 0.3, randInt(1, 60)]);
          reviewCount++;
        } catch(e) { /* skip */ }
      }
    }
    console.log(`  ✅ Created ${reviewCount} reviews`);

    // ── 6. Update product avg ratings from reviews ────
    console.log('📊 Updating product ratings...');
    await client.query(`
      UPDATE products p SET
        avg_rating = sub.avg_r,
        review_count = sub.cnt
      FROM (
        SELECT product_id, ROUND(AVG(rating)::numeric, 1) as avg_r, COUNT(*) as cnt
        FROM reviews GROUP BY product_id
      ) sub
      WHERE p.id = sub.product_id
    `);

    // ── 7. Wishlist entries ───────────────────────────
    console.log('❤️ Generating wishlists...');
    for (let i = 0; i < 100; i++) {
      try {
        await safe(`
          INSERT INTO wishlist (user_id, product_id) VALUES ($1, $2) ON CONFLICT DO NOTHING
        `, [pick(buyerIds), pick(productIds)]);
      } catch(e) {}
    }

    // ── 8. Notifications ─────────────────────────────
    console.log('🔔 Generating notifications...');
    const NOTE_TEMPLATES = [
      { title: 'Order Shipped!', msg: 'Your order has been shipped and is on its way.', type: 'order' },
      { title: 'Order Delivered', msg: 'Your order has been delivered. Please confirm receipt.', type: 'order' },
      { title: 'New Review', msg: 'Someone left a review on your product!', type: 'review' },
      { title: 'Price Drop Alert', msg: 'A product in your wishlist is now on sale!', type: 'promo' },
      { title: 'Welcome to ODOP!', msg: 'Start exploring authentic Indian crafts from 700+ districts.', type: 'info' },
    ];
    for (const bid of buyerIds.slice(0, 30)) {
      const note = pick(NOTE_TEMPLATES);
      await safe(`
        INSERT INTO notifications (user_id, title, message, type, is_read, created_at)
        VALUES ($1,$2,$3,$4,$5, NOW() - interval '1 hour' * $6)
      `, [bid, note.title, note.msg, note.type, Math.random() > 0.5, randInt(1, 720)]);
    }

    await client.query('COMMIT');
    console.log('\n✅ Bulk data seeding complete!');
    console.log(`   Products: ${productCount}`);
    console.log(`   Buyers: ${buyerIds.length}`);
    console.log(`   Sellers: ${sellerIds.length}`);
    console.log(`   Orders: ${orderCount}`);
    console.log(`   Reviews: ${reviewCount}`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Bulk seed error:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seedBulk();
