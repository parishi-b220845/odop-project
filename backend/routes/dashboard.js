const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const dash = require('../controllers/dashboardController');

// Seller
router.get('/seller', authenticate, authorize('seller'), dash.getSellerDashboard);

// Admin
router.get('/admin', authenticate, authorize('admin'), dash.getAdminDashboard);
router.get('/admin/users', authenticate, authorize('admin'), dash.getUsers);
router.put('/admin/users/:id/toggle', authenticate, authorize('admin'), dash.toggleUserStatus);
router.put('/admin/sellers/:id/verify', authenticate, authorize('admin'), dash.verifySeller);

// Wishlist
router.get('/wishlist', authenticate, dash.getWishlist);
router.post('/wishlist', authenticate, dash.toggleWishlist);

// Reviews
router.post('/reviews', authenticate, dash.addReview);

// Notifications
router.get('/notifications', authenticate, dash.getNotifications);
router.put('/notifications/read', authenticate, dash.markNotificationsRead);

module.exports = router;
