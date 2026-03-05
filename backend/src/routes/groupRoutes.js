const router = require('express').Router();
const { getMyGroups, getGroup, createGroup, joinGroup, leaveGroup, getInviteCode, updateGroup } = require('../controllers/groupController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getMyGroups);
router.post('/', createGroup);
router.post('/join', joinGroup);
router.get('/:id', getGroup);
router.patch('/:id', updateGroup);
router.delete('/:id/leave', leaveGroup);
router.get('/:id/invite-code', getInviteCode);

module.exports = router;
