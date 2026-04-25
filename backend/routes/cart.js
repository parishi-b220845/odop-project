const router = require('express').Router();
const { authenticate } = require('../middleware/auth');
const cart = require('../controllers/cartController');

router.get('/', authenticate, cart.getCart);
router.post('/', authenticate, cart.addToCart);
router.put('/:id', authenticate, cart.updateCartItem);
router.delete('/:id', authenticate, cart.removeFromCart);
router.delete('/', authenticate, cart.clearCart);

module.exports = router;
