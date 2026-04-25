const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const support = require('../controllers/supportController');

router.post('/', authenticate, support.createTicket);
router.get('/', authenticate, support.getTickets);
router.get('/:id', authenticate, support.getTicket);
router.post('/:id/reply', authenticate, support.replyToTicket);
router.put('/:id/status', authenticate, authorize('admin'), support.updateTicketStatus);

module.exports = router;
