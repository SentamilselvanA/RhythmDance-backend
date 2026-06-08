const router = require('express').Router();
const { getAllUsers, getUser, updateProfile, uploadProfileImage, updateUser, deleteUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

// Specific routes first (before /:id to avoid param conflicts)
router.put('/profile/update', protect, updateProfile);
router.post('/profile/image', protect, upload.single('image'), uploadProfileImage);

// Admin routes
router.get('/', protect, authorize('admin'), getAllUsers);
router.get('/:id', protect, authorize('admin'), getUser);
router.put('/:id', protect, authorize('admin'), updateUser);
router.delete('/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
