const { pool } = require('../config/database');

// ─── Seller Dashboard ───────────────────────────────────
exports.getSellerDashboard = async (req, res, next) => {
  try {
    const sellerId = req.user.id;
    const [stats, recentOrders, topProducts, monthlyRevenue] = await Promise.all([
      pool.query(`
        SELECT
          (SELECT COUNT(*) FROM products WHERE seller_id = $1 AND is_active = true) as total_products,
          (SELECT COUNT(*) FROM order_items WHERE seller_id = $1) as total_orders,
          (SELECT COALESCE(SUM(total), 0) FROM order_items WHERE seller_id = $1) as total_revenue,
          (SELECT COUNT(*) FROM order_items oi JOIN orders o ON oi.order_id = o.id WHERE oi.seller_id = $1 AND o.status = 'pending') as pending_orders,
          (SELECT COALESCE(AVG(r.rating), 0) FROM reviews r JOIN products p ON r.product_id = p.id WHERE p.seller_id = $1) as avg_rating
      `, [sellerId]),
      pool.query(`
        SELECT o.*, oi.product_name, oi.quantity, oi.total as item_total
        FROM orders o JOIN order_items oi ON oi.order_id = o.id
        WHERE oi.seller_id = $1 ORDER BY o.created_at DESC LIMIT 5
      `, [sellerId]),
      pool.query(`
        SELECT name, slug, order_count, avg_rating, price, stock, view_count
        FROM products WHERE seller_id = $1 AND is_active = true ORDER BY order_count DESC LIMIT 5
      `, [sellerId]),
      pool.query(`
        SELECT DATE_TRUNC('month', o.created_at) as month, SUM(oi.total) as revenue, COUNT(*) as orders
        FROM order_items oi JOIN orders o ON oi.order_id = o.id
        WHERE oi.seller_id = $1 AND o.created_at >= NOW() - INTERVAL '12 months'
        GROUP BY month ORDER BY month
      `, [sellerId]),
    ]);

    res.json({
      stats: stats.rows[0],
      recentOrders: recentOrders.rows,
      topProducts: topProducts.rows,
      monthlyRevenue: monthlyRevenue.rows,
    });
  } catch (error) { next(error); }
};

// ─── Admin Dashboard ────────────────────────────────────
exports.getAdminDashboard = async (req, res, next) => {
  try {
    const [stats, recentOrders, topSellers, stateWise] = await Promise.all([
      pool.query(`
        SELECT
          (SELECT COUNT(*) FROM users) as total_users,
          (SELECT COUNT(*) FROM users WHERE role='buyer') as total_buyers,
          (SELECT COUNT(*) FROM users WHERE role='seller') as total_sellers,
          (SELECT COUNT(*) FROM products WHERE is_active=true) as total_products,
          (SELECT COUNT(*) FROM orders) as total_orders,
          (SELECT COALESCE(SUM(total),0) FROM orders WHERE payment_status='paid') as total_revenue,
          (SELECT COUNT(*) FROM orders WHERE status='pending') as pending_orders,
          (SELECT COUNT(*) FROM seller_profiles WHERE verification='pending') as pending_verifications,
          (SELECT COUNT(*) FROM support_tickets WHERE status='open') as open_tickets
      `),
      pool.query(`SELECT o.*, u.name as buyer_name FROM orders o JOIN users u ON o.buyer_id=u.id ORDER BY o.created_at DESC LIMIT 10`),
      pool.query(`
        SELECT sp.business_name, sp.rating, sp.total_sales, u.name, sp.district, sp.state
        FROM seller_profiles sp JOIN users u ON sp.user_id=u.id ORDER BY sp.total_sales DESC LIMIT 10
      `),
      pool.query(`
        SELECT state, COUNT(*) as products FROM products WHERE is_active=true GROUP BY state ORDER BY products DESC
      `),
    ]);

    res.json({ stats: stats.rows[0], recentOrders: recentOrders.rows, topSellers: topSellers.rows, stateWise: stateWise.rows });
  } catch (error) { next(error); }
};

// ─── Admin: Manage Users ────────────────────────────────
exports.getUsers = async (req, res, next) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const conditions = [];
    const params = [];
    let idx = 1;
    if (role) { conditions.push(`role = $${idx++}`); params.push(role); }
    if (search) {
      conditions.push(`(name ILIKE $${idx} OR email ILIKE $${idx})`);
      params.push(`%${search}%`); idx++;
    }
    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const [countRes, result] = await Promise.all([
      pool.query(`SELECT COUNT(*) FROM users ${where}`, params),
      pool.query(`SELECT id, name, email, phone, role, is_active, created_at, last_login FROM users ${where} ORDER BY created_at DESC LIMIT $${idx} OFFSET $${idx+1}`, [...params, parseInt(limit), (parseInt(page)-1)*parseInt(limit)]),
    ]);
    res.json({ users: result.rows, total: parseInt(countRes.rows[0].count) });
  } catch (error) { next(error); }
};

exports.toggleUserStatus = async (req, res, next) => {
  try {
    const result = await pool.query('UPDATE users SET is_active = NOT is_active WHERE id = $1 RETURNING id, name, is_active', [req.params.id]);
    res.json({ user: result.rows[0] });
  } catch (error) { next(error); }
};

exports.verifySeller = async (req, res, next) => {
  try {
    const { status } = req.body; // 'verified' or 'rejected'
    const result = await pool.query(
      `UPDATE seller_profiles SET verification=$1, verified_at=CASE WHEN $1='verified' THEN NOW() ELSE NULL END WHERE user_id=$2 RETURNING *`,
      [status, req.params.id]
    );
    res.json({ sellerProfile: result.rows[0] });
  } catch (error) { next(error); }
};

// ─── Wishlist ───────────────────────────────────────────
exports.getWishlist = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT w.*, p.name, p.slug, p.price, p.compare_price, p.thumbnail, p.images, p.avg_rating, p.review_count, p.state, p.district, p.category, p.odop_verified, p.gi_tagged
      FROM wishlist w JOIN products p ON w.product_id = p.id WHERE w.user_id = $1 ORDER BY w.created_at DESC
    `, [req.user.id]);
    res.json({ wishlist: result.rows });
  } catch (error) { next(error); }
};

exports.toggleWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const existing = await pool.query('SELECT id FROM wishlist WHERE user_id=$1 AND product_id=$2', [req.user.id, productId]);
    if (existing.rows.length > 0) {
      await pool.query('DELETE FROM wishlist WHERE user_id=$1 AND product_id=$2', [req.user.id, productId]);
      res.json({ added: false, message: 'Removed from wishlist' });
    } else {
      await pool.query('INSERT INTO wishlist (user_id, product_id) VALUES ($1,$2)', [req.user.id, productId]);
      res.json({ added: true, message: 'Added to wishlist' });
    }
  } catch (error) { next(error); }
};

// ─── Reviews ────────────────────────────────────────────
exports.addReview = async (req, res, next) => {
  try {
    const { productId, rating, title, comment, orderId } = req.body;
    let isVerified = false;
    if (orderId) {
      const purchase = await pool.query('SELECT id FROM order_items oi JOIN orders o ON oi.order_id=o.id WHERE o.id=$1 AND o.buyer_id=$2 AND oi.product_id=$3', [orderId, req.user.id, productId]);
      isVerified = purchase.rows.length > 0;
    }
    const result = await pool.query(
      `INSERT INTO reviews (product_id, user_id, order_id, rating, title, comment, is_verified_purchase) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [productId, req.user.id, orderId, rating, title, comment, isVerified]
    );
    // Update product avg rating
    await pool.query(`UPDATE products SET avg_rating = (SELECT AVG(rating) FROM reviews WHERE product_id=$1), review_count = (SELECT COUNT(*) FROM reviews WHERE product_id=$1) WHERE id=$1`, [productId]);
    res.status(201).json({ review: result.rows[0] });
  } catch (error) { next(error); }
};

// ─── Notifications ──────────────────────────────────────
exports.getNotifications = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM notifications WHERE user_id=$1 ORDER BY created_at DESC LIMIT 20', [req.user.id]);
    const unread = await pool.query('SELECT COUNT(*) FROM notifications WHERE user_id=$1 AND is_read=false', [req.user.id]);
    res.json({ notifications: result.rows, unreadCount: parseInt(unread.rows[0].count) });
  } catch (error) { next(error); }
};

exports.markNotificationsRead = async (req, res, next) => {
  try {
    await pool.query('UPDATE notifications SET is_read=true WHERE user_id=$1', [req.user.id]);
    res.json({ message: 'All notifications marked as read' });
  } catch (error) { next(error); }
};
