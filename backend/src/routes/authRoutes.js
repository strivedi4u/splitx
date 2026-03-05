const router = require('express').Router();
const { signup, login, getMe, updateProfile, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/signup', signup);
router.post('/login', login);

// Protected
router.use(protect);
router.get('/me', getMe);
router.patch('/profile', updateProfile);
router.patch('/change-password', changePassword);

module.exports = router;
