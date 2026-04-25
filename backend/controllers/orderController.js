const { pool, transaction } = require('../config/database');
const { generateOrderNumber, paginate, buildPaginationMeta } = require('../utils/helpers');
const { sendOrderConfirmation, sendOrderStatusUpdate } = require('../services/emailService');

exports.createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, notes, isBulkOrder } = req.body;
    const buyerId = req.user.id;

    const result = await transaction(async (client) => {
      // Get cart items with product info
      const cart = await client.query(`
        SELECT ci.*, p.name, p.price, p.bulk_price, p.min_bulk_qty, p.stock, p.seller_id, p.thumbnail, p.images,
               p.bulk_available
        FROM cart_items ci JOIN products p ON ci.product_id = p.id
        WHERE ci.user_id = $1 AND p.is_active = true
      `, [buyerId]);

      if (cart.rows.length === 0) {
        throw Object.assign(new Error('Cart is empty'), { status: 400 });
      }

      // Calculate totals and check stock
      let subtotal = 0;
      const orderItems = [];
      for (const item of cart.rows) {
        if (item.quantity > item.stock) {
          throw Object.assign(new Error(`Insufficient stock for ${item.name}`), { status: 400 });
        }
        const unitPrice = (item.is_bulk && item.bulk_available && item.quantity >= item.min_bulk_qty) ? parseFloat(item.bulk_price) : parseFloat(item.price);
        const itemTotal = unitPrice * item.quantity;
        subtotal += itemTotal;
        orderItems.push({ ...item, unitPrice, itemTotal });
      }

      const shippingFee = subtotal >= 999 ? 0 : 99;
      const tax = Math.round(subtotal * 0.05 * 100) / 100; // 5% GST
      const total = subtotal + shippingFee + tax;

      // Create order
      const orderNumber = generateOrderNumber();
      const order = await client.query(`
        INSERT INTO orders (order_number, buyer_id, shipping_address, subtotal, shipping_fee, tax, total, is_bulk_order, notes)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *
      `, [orderNumber, buyerId, JSON.stringify(shippingAddress), subtotal, shippingFee, tax, total, isBulkOrder || false, notes]);

      // Create order items and reduce stock
      for (const item of orderItems) {
        await client.query(`
          INSERT INTO order_items (order_id, product_id, seller_id, product_name, product_image, quantity, price, total)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
        `, [order.rows[0].id, item.product_id, item.seller_id, item.name, item.thumbnail || (item.images?.[0]) || null, item.quantity, item.unitPrice, item.itemTotal]);

        await client.query('UPDATE products SET stock = stock - $1, order_count = order_count + 1 WHERE id = $2', [item.quantity, item.product_id]);
      }

      // Clear cart
      await client.query('DELETE FROM cart_items WHERE user_id = $1', [buyerId]);

      // Notify
      const buyer = await client.query('SELECT name, email FROM users WHERE id = $1', [buyerId]);
      sendOrderConfirmation(buyer.rows[0].email, buyer.rows[0].name, orderNumber, total);

      return order.rows[0];
    });

    res.status(201).json({ order: result });
  } catch (error) { next(error); }
};

exports.getOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const { limit: lim, offset } = paginate(page, limit);
    let where = 'WHERE o.buyer_id = $1';
    let params = [req.user.id];
    if (status) { where += ' AND o.status = $2'; params.push(status); }

    const countResult = await pool.query(`SELECT COUNT(*) FROM orders o ${where}`, params);
    const result = await pool.query(`
      SELECT o.*, json_agg(json_build_object('id',oi.id,'product_name',oi.product_name,'product_image',oi.product_image,'quantity',oi.quantity,'price',oi.price,'total',oi.total,'status',oi.status)) as items
      FROM orders o LEFT JOIN order_items oi ON oi.order_id = o.id ${where}
      GROUP BY o.id ORDER BY o.created_at DESC LIMIT $${params.length+1} OFFSET $${params.length+2}
    `, [...params, lim, offset]);

    res.json({ orders: result.rows, pagination: buildPaginationMeta(parseInt(countResult.rows[0].count), parseInt(page), lim) });
  } catch (error) { next(error); }
};

exports.getOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT o.*, json_agg(json_build_object('id',oi.id,'product_id',oi.product_id,'product_name',oi.product_name,'product_image',oi.product_image,'quantity',oi.quantity,'price',oi.price,'total',oi.total,'status',oi.status,'tracking_number',oi.tracking_number,'seller_id',oi.seller_id)) as items
      FROM orders o LEFT JOIN order_items oi ON oi.order_id = o.id
      WHERE o.id = $1 AND (o.buyer_id = $2 OR EXISTS (SELECT 1 FROM order_items WHERE order_id = o.id AND seller_id = $2) OR $3 = 'admin')
      GROUP BY o.id
    `, [id, req.user.id, req.user.role]);

    if (result.rows.length === 0) return res.status(404).json({ error: 'Order not found' });

    const payment = await pool.query('SELECT * FROM payments WHERE order_id = $1 ORDER BY created_at DESC LIMIT 1', [id]);
    res.json({ order: result.rows[0], payment: payment.rows[0] || null });
  } catch (error) { next(error); }
};

exports.cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const result = await pool.query(
      `UPDATE orders SET status='cancelled', cancelled_reason=$1 WHERE id=$2 AND buyer_id=$3 AND status IN ('pending','confirmed') RETURNING *`,
      [reason, id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(400).json({ error: 'Cannot cancel this order' });

    // Restore stock
    const items = await pool.query('SELECT product_id, quantity FROM order_items WHERE order_id = $1', [id]);
    for (const item of items.rows) {
      await pool.query('UPDATE products SET stock = stock + $1 WHERE id = $2', [item.quantity, item.product_id]);
    }

    res.json({ order: result.rows[0] });
  } catch (error) { next(error); }
};

exports.getSellerOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const { limit: lim, offset } = paginate(page, limit);

    let where = 'WHERE oi.seller_id = $1';
    let params = [req.user.id];
    if (status) { where += ' AND o.status = $2'; params.push(status); }

    const result = await pool.query(`
      SELECT o.*, json_agg(json_build_object('id',oi.id,'product_name',oi.product_name,'product_image',oi.product_image,'quantity',oi.quantity,'price',oi.price,'total',oi.total,'status',oi.status)) as items
      FROM orders o JOIN order_items oi ON oi.order_id = o.id ${where}
      GROUP BY o.id ORDER BY o.created_at DESC LIMIT $${params.length+1} OFFSET $${params.length+2}
    `, [...params, lim, offset]);

    res.json({ orders: result.rows });
  } catch (error) { next(error); }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, trackingNumber } = req.body;

    // Only seller can update their items, admin can update order status
    if (req.user.role === 'seller') {
      const updates = [];
      if (status) updates.push(`status='${status}'`);
      if (trackingNumber) updates.push(`tracking_number='${trackingNumber}'`);
      if (status === 'shipped') updates.push(`shipped_at=NOW()`);
      if (status === 'delivered') updates.push(`delivered_at=NOW()`);

      await pool.query(`UPDATE order_items SET ${updates.join(',')} WHERE order_id=$1 AND seller_id=$2`, [id, req.user.id]);
    }

    if (req.user.role === 'admin') {
      const updates = [`status='${status}'`];
      if (status === 'delivered') updates.push(`delivered_at=NOW()`);
      await pool.query(`UPDATE orders SET ${updates.join(',')} WHERE id=$1`, [id]);
    }

    // Notify buyer
    const order = await pool.query(`SELECT o.*, u.name, u.email FROM orders o JOIN users u ON o.buyer_id = u.id WHERE o.id = $1`, [id]);
    if (order.rows[0]) sendOrderStatusUpdate(order.rows[0].email, order.rows[0].name, order.rows[0].order_number, status);

    res.json({ message: 'Order updated' });
  } catch (error) { next(error); }
};
