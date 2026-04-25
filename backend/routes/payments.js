const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const payments = require('../controllers/paymentController');

router.post('/create-order', authenticate, payments.createPaymentOrder);
router.post('/verify', authenticate, payments.verifyPayment);
router.get('/status/:orderId', authenticate, payments.getPaymentStatus);

module.exports = router;
