const router = require('express').Router();
const { getSettlements, addSettlement } = require('../controllers/settlementController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getSettlements);      // GET /api/settlements?groupId=xxx
router.post('/', addSettlement);      // POST /api/settlements

module.exports = router;
