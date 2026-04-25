const router = require('express').Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validation');
const { authenticate, authorize, optionalAuth } = require('../middleware/auth');
const products = require('../controllers/productController');

router.get('/', products.getProducts);
router.get('/featured', products.getFeatured);
router.get('/categories', products.getCategories);
router.get('/states', products.getStates);
router.get('/seller', authenticate, authorize('seller'), products.getSellerProducts);
router.get('/:slug', products.getProduct);

router.post('/', authenticate, authorize('seller'), [
  body('name').trim().notEmpty().withMessage('Product name required'),
  body('description').notEmpty().withMessage('Description required'),
  body('category').notEmpty().withMessage('Category required'),
  body('price').isFloat({ min: 1 }).withMessage('Valid price required'),
  body('state').notEmpty().withMessage('State required'),
  body('district').notEmpty().withMessage('District required'),
], validate, products.createProduct);

router.put('/:id', authenticate, authorize('seller'), products.updateProduct);
router.delete('/:id', authenticate, authorize('seller'), products.deleteProduct);

module.exports = router;
