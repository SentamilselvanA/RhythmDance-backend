const router = require('express').Router();
const { submitEnquiry, getMyEnquiries, getAllEnquiries, replyEnquiry, deleteEnquiry } = require('../controllers/enquiryController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

router.post('/', optionalAuth, submitEnquiry);
router.get('/my', protect, getMyEnquiries);
router.get('/', protect, authorize('admin'), getAllEnquiries);
router.put('/:id/reply', protect, authorize('admin'), replyEnquiry);
router.delete('/:id', protect, authorize('admin'), deleteEnquiry);

module.exports = router;
