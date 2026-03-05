const router = require('express').Router();
const { getActivities } = require('../controllers/activityController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getActivities);  // GET /api/activities?groupId=xxx&page=1&limit=50

module.exports = router;
