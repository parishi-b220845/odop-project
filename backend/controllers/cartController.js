const { pool } = require('../config/database');

exports.getCart = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT ci.*, p.name, p.slug, p.price, p.compare_price, p.bulk_price, p.min_bulk_qty,
             p.stock, p.thumbnail, p.images, p.seller_id, p.bulk_available,
             u.name as seller_name, sp.business_name
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      JOIN users u ON p.seller_id = u.id
      LEFT JOIN seller_profiles sp ON sp.user_id = u.id
      WHERE ci.user_id = $1 AND p.is_active = true
      ORDER BY ci.created_at DESC
    `, [req.user.id]);

    const items = result.rows;
    let subtotal = 0;
    for (const item of items) {
      const price = (item.is_bulk && item.bulk_available && item.quantity >= item.min_bulk_qty)
        ? parseFloat(item.bulk_price) : parseFloat(item.price);
      item.effective_price = price;
      item.item_total = price * item.quantity;
      subtotal += item.item_total;
    }

    res.json({
      items,
      summary: {
        subtotal,
        shipping: subtotal >= 999 ? 0 : 99,
        tax: Math.round(subtotal * 0.05 * 100) / 100,
        total: subtotal + (subtotal >= 999 ? 0 : 99) + Math.round(subtotal * 0.05 * 100) / 100,
        itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
      },
    });
  } catch (error) { next(error); }
};

exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1, isBulk = false } = req.body;

    const product = await pool.query('SELECT id, stock, is_active FROM products WHERE id = $1', [productId]);
    if (product.rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    if (!product.rows[0].is_active) return res.status(400).json({ error: 'Product is not available' });
    if (quantity > product.rows[0].stock) return res.status(400).json({ error: 'Insufficient stock' });

    const result = await pool.query(`
      INSERT INTO cart_items (user_id, product_id, quantity, is_bulk) VALUES ($1,$2,$3,$4)
      ON CONFLICT (user_id, product_id) DO UPDATE SET quantity = cart_items.quantity + $3, is_bulk = $4
      RETURNING *
    `, [req.user.id, productId, quantity, isBulk]);

    res.status(201).json({ cartItem: result.rows[0] });
  } catch (error) { next(error); }
};

exports.updateCartItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity, isBulk } = req.body;

    if (quantity <= 0) {
      await pool.query('DELETE FROM cart_items WHERE id = $1 AND user_id = $2', [id, req.user.id]);
      return res.json({ message: 'Item removed' });
    }

    const result = await pool.query(
      'UPDATE cart_items SET quantity = $1, is_bulk = COALESCE($2, is_bulk) WHERE id = $3 AND user_id = $4 RETURNING *',
      [quantity, isBulk, id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Cart item not found' });
    res.json({ cartItem: result.rows[0] });
  } catch (error) { next(error); }
};

exports.removeFromCart = async (req, res, next) => {
  try {
    await pool.query('DELETE FROM cart_items WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    res.json({ message: 'Item removed' });
  } catch (error) { next(error); }
};

exports.clearCart = async (req, res, next) => {
  try {
    await pool.query('DELETE FROM cart_items WHERE user_id = $1', [req.user.id]);
    res.json({ message: 'Cart cleared' });
  } catch (error) { next(error); }
};
