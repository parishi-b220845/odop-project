const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const orders = require('../controllers/orderController');

router.post('/', authenticate, authorize('buyer'), orders.createOrder);
router.get('/', authenticate, orders.getOrders);
router.get('/seller', authenticate, authorize('seller'), orders.getSellerOrders);
router.get('/:id', authenticate, orders.getOrder);
router.post('/:id/cancel', authenticate, authorize('buyer'), orders.cancelOrder);
router.put('/:id/status', authenticate, authorize('seller', 'admin'), orders.updateOrderStatus);

module.exports = router;
