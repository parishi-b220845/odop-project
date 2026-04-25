const { pool } = require('../config/database');
const { generateSlug, paginate, buildPaginationMeta } = require('../utils/helpers');
const { validateProduct } = require('../services/odopService');

exports.getProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, category, state, district, minPrice, maxPrice, sort, search, odopVerified, featured, giTagged } = req.query;
    const { limit: lim, offset } = paginate(page, limit);

    let where = ['p.is_active = true'];
    let params = [];
    let paramIdx = 1;

    if (category) { where.push(`p.category = $${paramIdx++}`); params.push(category); }
    if (state) { where.push(`LOWER(p.state) = LOWER($${paramIdx++})`); params.push(state); }
    if (district) { where.push(`LOWER(p.district) = LOWER($${paramIdx++})`); params.push(district); }
    if (minPrice) { where.push(`p.price >= $${paramIdx++}`); params.push(parseFloat(minPrice)); }
    if (maxPrice) { where.push(`p.price <= $${paramIdx++}`); params.push(parseFloat(maxPrice)); }
    if (odopVerified === 'true') { where.push('p.odop_verified = true'); }
    if (giTagged === 'true') { where.push('p.gi_tagged = true'); }
    if (featured === 'true') { where.push('p.is_featured = true'); }
    if (search) {
      where.push(`(p.name ILIKE $${paramIdx} OR p.description ILIKE $${paramIdx} OR p.category ILIKE $${paramIdx} OR p.state ILIKE $${paramIdx} OR p.district ILIKE $${paramIdx})`);
      params.push(`%${search}%`);
      paramIdx++;
    }

    // Real ODOP images always float to top; stock/placeholder go to the back
    const imageRank = `CASE WHEN p.thumbnail LIKE '/api/images/%' THEN 0 ELSE 1 END`;

    let orderBy = `${imageRank}, p.avg_rating DESC`;
    if (sort === 'price_asc') orderBy = `${imageRank}, p.price ASC`;
    else if (sort === 'price_desc') orderBy = `${imageRank}, p.price DESC`;
    else if (sort === 'rating') orderBy = `${imageRank}, p.avg_rating DESC`;
    else if (sort === 'popular') orderBy = `${imageRank}, p.order_count DESC`;
    else if (sort === 'newest') orderBy = `${imageRank}, p.created_at DESC`;

    const whereClause = where.length > 0 ? 'WHERE ' + where.join(' AND ') : '';

    const countResult = await pool.query(`SELECT COUNT(*) FROM products p ${whereClause}`, params);
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(`
      SELECT p.*, u.name as seller_name, sp.business_name, sp.rating as seller_rating
      FROM products p
      JOIN users u ON p.seller_id = u.id
      LEFT JOIN seller_profiles sp ON sp.user_id = u.id
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT $${paramIdx++} OFFSET $${paramIdx++}
    `, [...params, lim, offset]);

    res.json({
      products: result.rows,
      pagination: buildPaginationMeta(total, parseInt(page), lim),
    });
  } catch (error) { next(error); }
};

exports.getProduct = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const result = await pool.query(`
      SELECT p.*, u.name as seller_name, sp.business_name, sp.description as seller_description,
             sp.rating as seller_rating, sp.total_sales as seller_total_sales, sp.verification as seller_verification
      FROM products p
      JOIN users u ON p.seller_id = u.id
      LEFT JOIN seller_profiles sp ON sp.user_id = u.id
      WHERE p.slug = $1 AND p.is_active = true
    `, [slug]);

    if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found' });

    const product = result.rows[0];

    // Increment view count
    await pool.query('UPDATE products SET view_count = view_count + 1 WHERE id = $1', [product.id]);

    // Get reviews
    const reviews = await pool.query(`
      SELECT r.*, u.name as user_name, u.avatar_url FROM reviews r
      JOIN users u ON r.user_id = u.id WHERE r.product_id = $1 ORDER BY r.created_at DESC LIMIT 10
    `, [product.id]);

    // Get related products
    const related = await pool.query(`
      SELECT id, name, slug, price, compare_price, thumbnail, images, avg_rating, review_count, state, district
      FROM products WHERE category = $1 AND id != $2 AND is_active = true ORDER BY RANDOM() LIMIT 4
    `, [product.category, product.id]);

    res.json({ product, reviews: reviews.rows, relatedProducts: related.rows });
  } catch (error) { next(error); }
};

exports.createProduct = async (req, res, next) => {
  try {
    const { name, description, shortDescription, category, subcategory, price, comparePrice, costPrice, stock, materials, careInstructions, state, district, isHandmade, artisanStory, makingTime, bulkAvailable, minBulkQty, bulkPrice, tags, culturalSignificance } = req.body;

    const slug = generateSlug(name);

    // ODOP Validation
    let odopVerified = false;
    let odopProductName = null;
    let giTagged = false;
    const odopMatch = await validateProduct(state, district, category);
    if (odopMatch) {
      odopVerified = true;
      odopProductName = odopMatch.product_name;
      giTagged = odopMatch.gi_tag || false;
    }

    const result = await pool.query(`
      INSERT INTO products (seller_id, name, slug, description, short_description, category, subcategory, price, compare_price, cost_price, stock, materials, care_instructions, state, district, odop_verified, odop_product_name, gi_tagged, is_handmade, artisan_story, making_time, bulk_available, min_bulk_qty, bulk_price, tags, cultural_significance, images, thumbnail)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,'[]',null)
      RETURNING *
    `, [req.user.id, name, slug, description, shortDescription, category, subcategory, price, comparePrice, costPrice, stock || 0, materials, careInstructions, state, district, odopVerified, odopProductName, giTagged, isHandmade !== false, artisanStory, makingTime, bulkAvailable || false, minBulkQty, bulkPrice, JSON.stringify(tags || []), culturalSignificance || null]);

    res.status(201).json({ product: result.rows[0], odopVerified });
  } catch (error) { next(error); }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await pool.query('SELECT * FROM products WHERE id = $1 AND seller_id = $2', [id, req.user.id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Product not found' });

    const f = req.body;
    const result = await pool.query(`
      UPDATE products SET
        name=COALESCE($1,name), description=COALESCE($2,description), short_description=COALESCE($3,short_description),
        category=COALESCE($4,category), price=COALESCE($5,price), compare_price=COALESCE($6,compare_price),
        stock=COALESCE($7,stock), materials=COALESCE($8,materials), state=COALESCE($9,state),
        district=COALESCE($10,district), bulk_available=COALESCE($11,bulk_available),
        min_bulk_qty=COALESCE($12,min_bulk_qty), bulk_price=COALESCE($13,bulk_price),
        artisan_story=COALESCE($14,artisan_story), making_time=COALESCE($15,making_time),
        is_active=COALESCE($16,is_active), cultural_significance=COALESCE($17,cultural_significance)
      WHERE id=$18 AND seller_id=$19 RETURNING *
    `, [f.name, f.description, f.shortDescription, f.category, f.price, f.comparePrice, f.stock, f.materials, f.state, f.district, f.bulkAvailable, f.minBulkQty, f.bulkPrice, f.artisanStory, f.makingTime, f.isActive, f.culturalSignificance, id, req.user.id]);

    res.json({ product: result.rows[0] });
  } catch (error) { next(error); }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE products SET is_active = false WHERE id = $1 AND seller_id = $2', [id, req.user.id]);
    res.json({ message: 'Product deactivated' });
  } catch (error) { next(error); }
};

exports.getCategories = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT category, COUNT(*) as count FROM products WHERE is_active = true GROUP BY category ORDER BY count DESC
    `);
    res.json({ categories: result.rows });
  } catch (error) { next(error); }
};

exports.getStates = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT state, COUNT(*) as product_count, array_agg(DISTINCT district) as districts
      FROM products WHERE is_active = true GROUP BY state ORDER BY state
    `);
    res.json({ states: result.rows });
  } catch (error) { next(error); }
};

exports.getFeatured = async (req, res, next) => {
  try {
    // Feature only products with real ODOP images from our local cache
    const result = await pool.query(`
      SELECT p.*, u.name as seller_name, sp.business_name
      FROM products p JOIN users u ON p.seller_id = u.id LEFT JOIN seller_profiles sp ON sp.user_id = u.id
      WHERE p.is_active = true
        AND p.thumbnail LIKE '/api/images/%'
        AND (p.odop_verified = true OR p.gi_tagged = true)
      ORDER BY p.is_featured DESC, p.avg_rating DESC, p.order_count DESC
      LIMIT 24
    `);
    // Return up to 8, but from a stable top-12 pool shuffle server-side only once
    const shuffled = result.rows.sort(() => Math.random() - 0.5).slice(0, 8);
    res.json({ products: shuffled });
  } catch (error) { next(error); }
};

exports.getSellerProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const { limit: lim, offset } = paginate(page, limit);
    const countResult = await pool.query('SELECT COUNT(*) FROM products WHERE seller_id = $1', [req.user.id]);
    const result = await pool.query(
      'SELECT * FROM products WHERE seller_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [req.user.id, lim, offset]
    );
    res.json({
      products: result.rows,
      pagination: buildPaginationMeta(parseInt(countResult.rows[0].count), parseInt(page), lim),
    });
  } catch (error) { next(error); }
};
