const { pool } = require('../config/database');
const razorpay = require('../services/razorpayService');

exports.createPaymentOrder = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    const order = await pool.query('SELECT * FROM orders WHERE id = $1 AND buyer_id = $2', [orderId, req.user.id]);
    if (order.rows.length === 0) return res.status(404).json({ error: 'Order not found' });
    if (order.rows[0].payment_status === 'paid') return res.status(400).json({ error: 'Already paid' });

    const razorpayOrder = await razorpay.createOrder(
      parseFloat(order.rows[0].total), 'INR', order.rows[0].order_number
    );

    await pool.query(`
      INSERT INTO payments (order_id, razorpay_order_id, amount, currency) VALUES ($1,$2,$3,'INR')
    `, [orderId, razorpayOrder.id, order.rows[0].total]);

    res.json({
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) { next(error); }
};

exports.verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, demo, orderId } = req.body;

    // Demo mode: no Razorpay keys configured — mark order as paid directly
    if (demo && orderId && !process.env.RAZORPAY_KEY_ID) {
      await pool.query(`UPDATE orders SET payment_status='paid', status='confirmed' WHERE id=$1 AND buyer_id=$2`, [orderId, req.user.id]);
      return res.json({ message: 'Demo payment confirmed' });
    }

    const isValid = razorpay.verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!isValid) return res.status(400).json({ error: 'Payment verification failed' });

    // Update payment record
    const payment = await pool.query(`
      UPDATE payments SET razorpay_payment_id = $1, razorpay_signature = $2, status = 'paid', method = 'razorpay'
      WHERE razorpay_order_id = $3 RETURNING *
    `, [razorpay_payment_id, razorpay_signature, razorpay_order_id]);

    if (payment.rows.length === 0) return res.status(404).json({ error: 'Payment not found' });

    // Update order status
    await pool.query(`UPDATE orders SET payment_status = 'paid', status = 'confirmed' WHERE id = $1`, [payment.rows[0].order_id]);

    res.json({ message: 'Payment verified successfully', payment: payment.rows[0] });
  } catch (error) { next(error); }
};

exports.getPaymentStatus = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT p.*, o.order_number FROM payments p JOIN orders o ON p.order_id = o.id
      WHERE p.order_id = $1 AND o.buyer_id = $2 ORDER BY p.created_at DESC LIMIT 1
    `, [req.params.orderId, req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Payment not found' });
    res.json({ payment: result.rows[0] });
  } catch (error) { next(error); }
};
