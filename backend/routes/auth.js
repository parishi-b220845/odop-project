const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validation');
const { authenticate, authorize } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const auth = require('../controllers/authController');

router.post('/register', authLimiter, [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['buyer', 'seller']),
], validate, auth.register);

router.post('/login', authLimiter, [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], validate, auth.login);

router.post('/refresh-token', auth.refreshToken);

router.get('/profile', authenticate, auth.getProfile);
router.put('/profile', authenticate, auth.updateProfile);
router.put('/seller-profile', authenticate, authorize('seller'), auth.updateSellerProfile);
router.post('/change-password', authenticate, [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 }),
], validate, auth.changePassword);

router.post('/addresses', authenticate, authorize('buyer'), [
  body('name').notEmpty(),
  body('phone').notEmpty(),
  body('addressLine1').notEmpty(),
  body('city').notEmpty(),
  body('state').notEmpty(),
  body('pincode').isLength({ min: 6, max: 6 }),
], validate, auth.addAddress);
router.delete('/addresses/:id', authenticate, authorize('buyer'), auth.deleteAddress);

module.exports = router;
