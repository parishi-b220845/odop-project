const { pool } = require('../config/database');
const odopService = require('../services/odopService');

// ─── Map Data ───────────────────────────────────────────
exports.getDistricts = async (req, res, next) => {
  try {
    const { state } = req.query;
    let query = `
      SELECT d.*, 
        (SELECT COUNT(*) FROM products p WHERE LOWER(p.district) = LOWER(d.name) AND LOWER(p.state) = LOWER(d.state) AND p.is_active = true) as product_count,
        (SELECT array_agg(DISTINCT od.product_name) FROM odop_dataset od WHERE LOWER(od.district) = LOWER(d.name) AND LOWER(od.state) = LOWER(d.state)) as odop_products
      FROM districts d
    `;
    let params = [];
    if (state) { query += ' WHERE LOWER(d.state) = LOWER($1)'; params.push(state); }
    query += ' ORDER BY d.state, d.name';

    const result = await pool.query(query, params);
    res.json({ districts: result.rows });
  } catch (error) { next(error); }
};

exports.getDistrictDetail = async (req, res, next) => {
  try {
    const { name } = req.params;
    const district = await pool.query(`
      SELECT d.*, array_agg(DISTINCT od.product_name) as odop_products
      FROM districts d LEFT JOIN odop_dataset od ON LOWER(od.district) = LOWER(d.name) AND LOWER(od.state) = LOWER(d.state)
      WHERE LOWER(d.name) = LOWER($1) GROUP BY d.id
    `, [name]);

    if (district.rows.length === 0) return res.status(404).json({ error: 'District not found' });

    const products = await pool.query(`
      SELECT p.id, p.name, p.slug, p.price, p.thumbnail, p.images, p.avg_rating, p.category
      FROM products p WHERE LOWER(p.district) = LOWER($1) AND p.is_active = true LIMIT 20
    `, [name]);

    const articles = await pool.query(`
      SELECT id, title, slug, excerpt, cover_image FROM cultural_articles WHERE LOWER(district) = LOWER($1) AND is_published = true LIMIT 5
    `, [name]);

    res.json({ district: district.rows[0], products: products.rows, articles: articles.rows });
  } catch (error) { next(error); }
};

exports.getMapStats = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT d.state, COUNT(DISTINCT d.name) as districts, 
        (SELECT COUNT(*) FROM products p WHERE LOWER(p.state)=LOWER(d.state) AND p.is_active=true) as products,
        (SELECT COUNT(DISTINCT od.product_name) FROM odop_dataset od WHERE LOWER(od.state)=LOWER(d.state)) as odop_products
      FROM districts d GROUP BY d.state ORDER BY d.state
    `);
    res.json({ states: result.rows });
  } catch (error) { next(error); }
};

// ─── ODOP Dataset API ───────────────────────────────────
exports.getOdopDataset = async (req, res, next) => {
  try {
    const { state, district } = req.query;
    if (district) {
      res.json({ products: await odopService.getOdopByDistrict(district) });
    } else if (state) {
      res.json({ products: await odopService.getOdopByState(state) });
    } else {
      res.json({ products: await odopService.getAllOdopProducts() });
    }
  } catch (error) { next(error); }
};

exports.getOdopStates = async (req, res, next) => {
  try {
    res.json({ states: await odopService.getStatesWithProducts() });
  } catch (error) { next(error); }
};

// ─── Cultural Articles ──────────────────────────────────
exports.getArticles = async (req, res, next) => {
  try {
    const { state, category, limit = 10 } = req.query;
    let where = 'WHERE is_published = true';
    let params = [];
    if (state) { where += ` AND LOWER(state) = LOWER($${params.length+1})`; params.push(state); }
    if (category) { where += ` AND LOWER(category) = LOWER($${params.length+1})`; params.push(category); }

    const result = await pool.query(`
      SELECT id, title, slug, excerpt, cover_image, state, district, category, read_time, view_count, created_at
      FROM cultural_articles ${where} ORDER BY created_at DESC LIMIT $${params.length+1}
    `, [...params, parseInt(limit)]);
    res.json({ articles: result.rows });
  } catch (error) { next(error); }
};

exports.getArticle = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const result = await pool.query('SELECT * FROM cultural_articles WHERE slug = $1', [slug]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Article not found' });
    await pool.query('UPDATE cultural_articles SET view_count = view_count + 1 WHERE slug = $1', [slug]);
    res.json({ article: result.rows[0] });
  } catch (error) { next(error); }
};
